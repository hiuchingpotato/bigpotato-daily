"""Trim and cut out Herd Mentality assets exported from FigJam. Standard library only.

  cutout.py trim <in.png> <out.png>
      Crop to the visible pixels.

  cutout.py heads <in.png> <out-prefix>
      For the row of cow heads on a white card: clear the white card (flood fill
      from its edges, so the cows' own white faces, inside black outlines, stay),
      then save each head as <out-prefix>-1.png, -2.png, ... cropped tight.

  cutout.py pinkhead <pink-cow.png> <out.png>
      Cut the pink cow's head out of its full-body artwork (public/herd/pink-cow.png):
      crop to the head, clear the pink body showing past the right ear and under the
      chin (flood fill from those edges, stopped by the black outline), keep the one
      biggest piece, and trim the stub of the back's outline next to the ear.

Reads and writes 8-bit RGBA, non-interlaced PNGs.
"""
import struct
import sys
import zlib
from collections import deque


def read(path):
    data = open(path, "rb").read()
    pos, idat = 8, b""
    while pos < len(data):
        length, kind = struct.unpack(">I4s", data[pos : pos + 8])
        body = data[pos + 8 : pos + 8 + length]
        if kind == b"IHDR":
            w, h, depth, colour, _, _, interlace = struct.unpack(">IIBBBBB", body)
            assert depth == 8 and colour == 6 and interlace == 0, "expects 8-bit RGBA"
        elif kind == b"IDAT":
            idat += body
        pos += 12 + length
    raw, bpp = zlib.decompress(idat), 4
    stride = w * bpp
    rows, prev, i = [], bytearray(stride), 0
    for _ in range(h):
        f, line = raw[i], bytearray(raw[i + 1 : i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line
    return w, h, rows


def write(path, w, h, rows):
    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))

    raw = b"".join(b"\x00" + bytes(r) for r in rows)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    open(path, "wb").write(png)


def alpha(rows, x, y):
    return rows[y][x * 4 + 3]


def bbox(w, h, rows, x0=0, x1=None):
    x1 = w if x1 is None else x1
    xs, ys = [], []
    for y in range(h):
        for x in range(x0, x1):
            if alpha(rows, x, y) > 8:
                xs.append(x)
                ys.append(y)
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1) if xs else None


def crop(rows, box):
    x0, y0, x1, y1 = box
    return x1 - x0, y1 - y0, [bytearray(r[x0 * 4 : x1 * 4]) for r in rows[y0:y1]]


def clear_white_card(w, h, rows):
    """Flood fill near-white, opaque pixels from the card's outer edge to transparent."""
    def whiteish(x, y):
        r, g, b, a = rows[y][x * 4 : x * 4 + 4]
        # Light greys too: the card has a faint border and shadow.
        return a > 8 and min(r, g, b) > 200

    seen = bytearray(w * h)
    queue = deque()
    # Seed from the card's rim: the outermost few pixels of the trimmed image.
    rim = 4
    for y in range(h):
        for x in range(w):
            if (x < rim or y < rim or x >= w - rim or y >= h - rim) and whiteish(x, y):
                seen[y * w + x] = 1
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        rows[y][x * 4 + 3] = 0
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and whiteish(nx, ny):
                seen[ny * w + nx] = 1
                queue.append((nx, ny))


def split_columns(w, h, rows):
    """Runs of columns that contain visible pixels: one per head."""
    # Solid pixels only: the card's soft shadow runs under every head and would join them.
    filled = [sum(alpha(rows, x, y) > 200 for y in range(h)) > 2 for x in range(w)]
    runs, start = [], None
    for x, on in enumerate(filled + [False]):
        if on and start is None:
            start = x
        elif not on and start is not None:
            if x - start > w // 40:
                runs.append((start, x))
            start = None
    return runs


def pink_head(w, h, rows):
    # The head, and a little of the body behind it, in pink-cow.png's 420x323 artwork.
    w, h, rows = crop(rows, (20, 15, 236, 214))

    def body(x, y):
        r, g, b, a = rows[y][x * 4 : x * 4 + 4]
        return a > 30 and max(r, g, b) > 90  # pink, not the black outline

    seen = bytearray(w * h)
    queue = deque()
    for y in range(h):
        if body(w - 1, y):
            seen[y * w + w - 1] = 1
            queue.append((w - 1, y))
    for x in range(w):
        if body(x, h - 1):
            seen[(h - 1) * w + x] = 1
            queue.append((x, h - 1))
    while queue:
        x, y = queue.popleft()
        rows[y][x * 4 + 3] = 0
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and body(nx, ny):
                seen[ny * w + nx] = 1
                queue.append((nx, ny))

    # Keep only the biggest connected piece.
    seen = bytearray(w * h)
    pieces = []
    for y in range(h):
        for x in range(w):
            if seen[y * w + x] or rows[y][x * 4 + 3] <= 30:
                continue
            queue, piece = deque([(x, y)]), []
            seen[y * w + x] = 1
            while queue:
                cx, cy = queue.popleft()
                piece.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and rows[ny][nx * 4 + 3] > 30:
                        seen[ny * w + nx] = 1
                        queue.append((nx, ny))
            pieces.append(piece)
    pieces.sort(key=len, reverse=True)
    for piece in pieces[1:]:
        for x, y in piece:
            rows[y][x * 4 + 3] = 0

    w, h, rows = crop(rows, bbox(w, h, rows))
    # The back's outline runs on past the right ear as a thin 4px stub: stop where it starts.
    right = w
    for x in range(w - 1, -1, -1):
        if sum(rows[y][x * 4 + 3] > 30 for y in range(h)) > 6:
            right = x + 1
            break
    w, h, rows = crop(rows, (0, 0, right, h))
    return crop(rows, bbox(w, h, rows))


mode, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
w, h, rows = read(src)
if mode == "trim":
    write(dst, *crop(rows, bbox(w, h, rows)))
elif mode == "pinkhead":
    write(dst, *pink_head(w, h, rows))
elif mode == "heads":
    w, h, rows = crop(rows, bbox(w, h, rows))
    clear_white_card(w, h, rows)
    # Drop what's left of the shadow: faint pixels outside the cows.
    for r in rows:
        for x in range(w):
            if r[x * 4 + 3] < 200:
                r[x * 4 + 3] = 0
    for n, (x0, x1) in enumerate(split_columns(w, h, rows), 1):
        box = bbox(w, h, rows, x0, x1)
        write(f"{dst}-{n}.png", *crop(rows, box))
        print(f"head {n}: {box[2] - box[0]}x{box[3] - box[1]}")
