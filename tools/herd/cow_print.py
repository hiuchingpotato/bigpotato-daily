"""Write the Herd Mentality card's cow-print background: a busy field of irregular
black patches with a few pink ones, after the cow-print asset in assets/hub/.

usage: python3 -I tools/herd/cow_print.py public/herd/cow-print-card.svg
"""
import math
import random
import sys

W, H = 480, 320
rng = random.Random(42)


def blob(cx, cy, r):
    # A lumpy closed curve: radius wobbles around the centre, smoothed with
    # quadratic curves through the midpoints so it reads as a cow patch.
    n = rng.randint(7, 10)
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n + rng.uniform(-0.25, 0.25)
        rr = r * rng.uniform(0.6, 1.25)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * rng.uniform(0.7, 1.1)))
    mids = [((pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2) for i in range(n)]
    d = f"M{mids[-1][0]:.1f} {mids[-1][1]:.1f}"
    for i in range(n):
        d += f"Q{pts[i][0]:.1f} {pts[i][1]:.1f} {mids[i][0]:.1f} {mids[i][1]:.1f}"
    return d + "Z"


placed = []


def place(count, rmin, rmax, gap):
    out = []
    tries = 0
    while len(out) < count and tries < 20000:
        tries += 1
        x, y, r = rng.uniform(-20, W + 20), rng.uniform(-20, H + 20), rng.uniform(rmin, rmax)
        if all(math.hypot(x - px, y - py) > r + pr + gap for px, py, pr in placed):
            placed.append((x, y, r))
            out.append(blob(x, y, r))
    return out


# Real cow print: a handful of big patches, a couple running off the edges, with
# a few smaller ones and a pink patch or two between them.
black = place(7, 55, 95, 14) + place(6, 22, 38, 12)
pink = place(3, 20, 34, 12)
dots = place(8, 6, 12, 10)

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">
<rect width="{W}" height="{H}" fill="#fff"/>
<path fill="#111" d="{''.join(black)}"/>
<path fill="#ff8fca" d="{''.join(pink)}"/>
<path fill="#111" d="{''.join(dots)}"/>
</svg>
"""
open(sys.argv[1], "w").write(svg)
print(f"{len(black)} black, {len(pink)} pink, {len(dots)} dots")
