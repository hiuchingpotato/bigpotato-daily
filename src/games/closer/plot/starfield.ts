/**
 * The comic sky's white doodles - hollow stars, "+" sparkles and dots, after the
 * Sling 'Em panel - placed in board space.
 *
 * They are part of the board rather than a layer over it: panning moves them
 * exactly with the words, and zooming spreads them apart until they leave the
 * frame. Each doodle keeps the same size on screen whatever the zoom, so they
 * read as drawings rather than data. Drawn faint (30%) and behind the word dots,
 * so the guide rings and words stay the clearest things on the board.
 */

import { MAX_RADIUS } from "../game/geometry";
import type { Camera, Viewport } from "./renderer";

type Doodle = {
  kind: "star" | "sparkle" | "dot";
  /** Board coordinates. */
  x: number;
  y: number;
  /** Screen size in CSS pixels. */
  r: number;
  rotation: number;
  /** Per-point wobble for stars, so each reads as hand-drawn. */
  wobble: number[];
};

/** Doodles cover this many board radii either side of the centre - wider than a zoomed-out view. */
const SPREAD = 3.2;
const COUNTS = { star: 70, sparkle: 60, dot: 380 } as const;
const OPACITY = 0.3;

/** mulberry32, so the sky is the same on every device and every visit. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter(): Doodle[] {
  const rand = rng(0x5ea5);
  const span = MAX_RADIUS * SPREAD;
  const out: Doodle[] = [];
  for (const kind of ["star", "sparkle", "dot"] as const) {
    for (let i = 0; i < COUNTS[kind]; i++) {
      out.push({
        kind,
        x: (rand() * 2 - 1) * span,
        y: (rand() * 2 - 1) * span,
        r: kind === "star" ? 6 + rand() * 4 : kind === "sparkle" ? 3.5 + rand() * 2.5 : 1 + rand() * 1.3,
        rotation: rand() * Math.PI,
        wobble: Array.from({ length: 10 }, () => 1 + (rand() - 0.5) * 0.16),
      });
    }
  }
  return out;
}

export class StarField {
  private readonly doodles = scatter();

  draw(ctx: CanvasRenderingContext2D, camera: Camera, viewport: Viewport): void {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    ctx.save();
    ctx.globalAlpha = OPACITY;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const lines = new Path2D();
    const dots = new Path2D();
    for (const d of this.doodles) {
      const px = (d.x - camera.x) * camera.scale + halfW;
      const py = halfH - (d.y - camera.y) * camera.scale;
      if (px < -d.r || px > viewport.width + d.r || py < -d.r || py > viewport.height + d.r) continue;

      if (d.kind === "dot") {
        dots.moveTo(px + d.r, py);
        dots.arc(px, py, d.r, 0, Math.PI * 2);
      } else if (d.kind === "sparkle") {
        lines.moveTo(px - d.r, py);
        lines.lineTo(px + d.r, py);
        lines.moveTo(px, py - d.r);
        lines.lineTo(px, py + d.r);
      } else {
        for (let k = 0; k < 10; k++) {
          const radius = d.r * (k % 2 === 0 ? 1 : 0.46) * d.wobble[k]!;
          const angle = d.rotation + (k * Math.PI) / 5;
          const x = px + radius * Math.sin(angle);
          const y = py - radius * Math.cos(angle);
          if (k === 0) lines.moveTo(x, y);
          else lines.lineTo(x, y);
        }
        lines.closePath();
      }
    }
    ctx.stroke(lines);
    ctx.fill(dots);
    ctx.restore();
  }
}
