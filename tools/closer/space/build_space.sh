#!/usr/bin/env bash
#
# Rebuild Closer's comic-style planets (public/closer/space/) from the Sling 'Em
# comic in assets/hub/. The white star doodles are drawn in code (plot/starfield.ts). macOS only: crops with sips; the rest is
# standard-library Python.
#
#   ./tools/closer/space/build_space.sh

set -euo pipefail
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
here="$repo/tools/closer/space"
comic="$repo/assets/hub/bp-slingem-comic.png"
out="$repo/public/closer/space"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"

# name  width height  x y (in the comic)  mask (see mask.py)
planet() {
  sips --cropToHeightWidth "$3" "$2" --cropOffset "$5" "$4" "$comic" --out "$tmp/$1.png" >/dev/null
  python3 -I "$here/mask.py" "$tmp/$1.png" "$out/$1.png" "$6"
}
planet blue      80  80  86 451 "c:40:41:39"
planet lightblue 98  98 194 451 "c:49:49:46"
planet ringed   154 122 294 436 "b:128:18:154:68,b:0:96:24:122,b:138:0:154:22,b:90:112:120:122"
planet purple   126 126 466 438 "c:63:63:60"
planet red       68  68 610 461 "c:34:34:31.5"
planet earth     92  92 696 446 "c:39:51:34,c:74:16:11.5"

echo "space backdrop -> public/closer/space"
