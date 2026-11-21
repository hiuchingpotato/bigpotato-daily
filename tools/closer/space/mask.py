"""Black out everything in a planet crop except the planet itself.

usage: mask.py <in.png> <out.png> <shapes>
  shapes: comma-separated, each "c:cx:cy:r" (keep this circle) or "b:x0:y0:x1:y1"
  (black out this box). With any circle given, pixels outside every circle go black.

Standard library only: 8-bit RGB, non-interlaced PNG in and out.
"""
import struct
import sys
import zlib

src, dst, spec = sys.argv[1], sys.argv[2], sys.argv[3]
data = open(src, "rb").read()
pos, idat = 8, b""
while pos < len(data):
    length, kind = struct.unpack(">I4s", data[pos : pos + 8])
    body = data[pos + 8 : pos + 8 + length]
    if kind == b"IHDR":
        width, height, depth, colour, _, _, interlace = struct.unpack(">IIBBBBB", body)
        assert depth == 8 and colour == 2 and interlace == 0
    elif kind == b"IDAT":
        idat += body
    pos += 12 + length

raw, bpp = zlib.decompress(idat), 3
stride = width * bpp
rows, prev, i = [], bytearray(stride), 0
for _ in range(height):
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

circles, boxes = [], []
for part in spec.split(","):
    kind, *nums = part.split(":")
    nums = [float(n) for n in nums]
    (circles if kind == "c" else boxes).append(nums)

for y in range(height):
    for x in range(width):
        keep = not circles or any((x - cx) ** 2 + (y - cy) ** 2 <= r * r for cx, cy, r in circles)
        if keep and any(x0 <= x < x1 and y0 <= y < y1 for x0, y0, x1, y1 in boxes):
            keep = False
        if not keep:
            rows[y][x * 3 : x * 3 + 3] = b"\x00\x00\x00"


def chunk(kind, body):
    return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))


out = b"".join(b"\x00" + bytes(r) for r in rows)
png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(out, 9)) + chunk(b"IEND", b"")
open(dst, "wb").write(png)
