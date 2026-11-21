"""Write a seamless tile of comic-style space doodles, after the Sling 'Em panel:
hollow five-point stars, "+" sparkles and dots, white on black.

usage: stars_svg.py <out.svg>
"""
import math
import random
import sys

SIZE = 420
rng = random.Random(7)


def star(cx, cy, r, rot):
    # Slightly uneven points, so it reads as hand-drawn rather than a font glyph.
    pts = []
    for k in range(10):
        radius = r * (1 if k % 2 == 0 else 0.46) * (1 + rng.uniform(-0.08, 0.08))
        a = rot + k * math.pi / 5
        pts.append(f"{cx + radius * math.sin(a):.1f},{cy - radius * math.cos(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" class="s"/>'


def sparkle(cx, cy, r):
    return f'<path d="M{cx - r:.1f} {cy:.1f}H{cx + r:.1f}M{cx:.1f} {cy - r:.1f}V{cy + r:.1f}" class="s"/>'


def dot(cx, cy, r):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" class="d"/>'


shapes = []
placed = []


def free(x, y, gap):
    return all(math.hypot(x - px, y - py) > gap + pr for px, py, pr in placed)


def scatter(n, radius_range, make, gap):
    tries = 0
    while n and tries < 5000:
        tries += 1
        x, y = rng.uniform(0, SIZE), rng.uniform(0, SIZE)
        r = rng.uniform(*radius_range)
        if not free(x, y, gap + r):
            continue
        placed.append((x, y, r))
        # Draw copies across the edges so the tile repeats without seams.
        for dx in (-SIZE, 0, SIZE):
            for dy in (-SIZE, 0, SIZE):
                if -r - 4 < x + dx < SIZE + r + 4 and -r - 4 < y + dy < SIZE + r + 4:
                    shapes.append(make(x + dx, y + dy, r))
        n -= 1


scatter(7, (7, 11), lambda x, y, r: star(x, y, r, rng.uniform(0, math.pi)), 22)
scatter(6, (4, 6), sparkle, 16)
scatter(34, (1.2, 2.4), dot, 8)

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}">
<style>.s{{fill:none;stroke:#fff;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}}.d{{fill:#fff}}</style>
{chr(10).join(shapes)}
</svg>
"""
open(sys.argv[1], "w").write(svg)
print(f"{len(shapes)} shapes")
