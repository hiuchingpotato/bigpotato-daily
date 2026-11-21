/**
 * Shooting stars across the background, drawn in the Sling 'Em comic's style: a
 * hollow doodled star that tumbles as it flies, with three white speed lines.
 *
 * Atmosphere only - they carry no meaning and never sit near enough to the
 * centre to be mistaken for a word. They are drawn in screen space rather than
 * board space, so panning and zooming leave them alone: a streak that slid
 * around with the map would read as data.
 */

export type Star = {
  bornAt: number;
  /** Milliseconds from spawn to gone. */
  life: number;
  x: number;
  y: number;
  /** Pixels per millisecond. */
  vx: number;
  vy: number;
  /** Length of the trail at full brightness, in pixels. */
  length: number;
};

/** Shortest and longest a star lasts. The brief is under two seconds. */
export const MIN_LIFE = 900;
export const MAX_LIFE = 1800;

/** Gap between spawns. Sparse enough to be a surprise rather than weather. */
export const MIN_GAP = 1400;
export const MAX_GAP = 5200;

/** More than this on screen at once starts to look like rain. */
export const MAX_CONCURRENT = 2;

export type Random = () => number;

const between = (random: Random, low: number, high: number) =>
  low + random() * (high - low);

/**
 * Brightness over a star's life: quick to arrive, slower to fade.
 *
 * A symmetrical fade looks mechanical. Peaking early and trailing off reads the
 * way a real streak does.
 */
export function starAlpha(progress: number): number {
  if (progress <= 0 || progress >= 1) return 0;
  if (progress < 0.15) return progress / 0.15;
  return Math.pow(1 - (progress - 0.15) / 0.85, 1.6);
}

export function spawnStar(
  random: Random,
  width: number,
  height: number,
  now: number,
): Star {
  // Travelling down and across. The direction is mirrored at random so they do
  // not all fall the same way.
  const leftward = random() < 0.5;
  const angle = between(random, 0.18, 0.5) * Math.PI;
  const speed = between(random, 0.35, 0.75);

  return {
    bornAt: now,
    life: between(random, MIN_LIFE, MAX_LIFE),
    // Start anywhere across the top two thirds, including a little off-screen
    // so a star can enter rather than blink into existence mid-air.
    x: between(random, -0.1, 1.1) * width,
    y: between(random, -0.05, 0.66) * height,
    vx: Math.cos(angle) * speed * (leftward ? -1 : 1),
    vy: Math.sin(angle) * speed,
    length: between(random, 40, 130),
  };
}

export class ShootingStars {
  private stars: Star[] = [];
  private nextSpawn = 0;

  private readonly random: Random;

  // A plain field rather than a parameter property: those are not erasable
  // syntax, so Node cannot run this module directly and scripts/star-preview.ts
  // would need a bundler.
  constructor(random: Random = Math.random) {
    this.random = random;
  }

  /** How many are on screen. Exposed so the spawn rules can be tested. */
  get count(): number {
    return this.stars.length;
  }

  /** Retire finished stars and occasionally add one. */
  update(now: number, width: number, height: number): void {
    this.stars = this.stars.filter((star) => now - star.bornAt < star.life);

    if (this.nextSpawn === 0) {
      // First call: wait a beat rather than opening with a star.
      this.nextSpawn = now + between(this.random, MIN_GAP, MAX_GAP);
      return;
    }

    if (now >= this.nextSpawn) {
      if (this.stars.length < MAX_CONCURRENT) {
        this.stars.push(spawnStar(this.random, width, height, now));
      }
      this.nextSpawn = now + between(this.random, MIN_GAP, MAX_GAP);
    }
  }

  draw(ctx: CanvasRenderingContext2D, now: number): void {
    if (this.stars.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";

    for (const star of this.stars) {
      const age = now - star.bornAt;
      const alpha = starAlpha(age / star.life);
      if (alpha <= 0.01) continue;
      ctx.globalAlpha = alpha;

      const headX = star.x + star.vx * age;
      const headY = star.y + star.vy * age;
      // Unit vectors along the direction of travel and across it.
      const speed = Math.hypot(star.vx, star.vy) || 1;
      const ux = star.vx / speed;
      const uy = star.vy / speed;
      const nx = -uy;
      const ny = ux;

      // Speed lines: three flat strokes behind the star, the middle one longest,
      // each starting a little back from the star so they read as motion, not a tail.
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const [across, length] of [[-5, 0.55], [0, 1], [5, 0.55]] as const) {
        const startX = headX - ux * 12 + nx * across;
        const startY = headY - uy * 12 + ny * across;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - ux * star.length * length, startY - uy * star.length * length);
      }
      ctx.stroke();

      // The star itself, hollow, tumbling as it goes.
      drawDoodleStar(ctx, headX, headY, 7, age / 180);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}

/** A hollow five-point star path, as in the comic's hand-drawn stars. */
function drawDoodleStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotation: number): void {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const radius = k % 2 === 0 ? r : r * 0.46;
    const angle = rotation + (k * Math.PI) / 5;
    const x = cx + radius * Math.sin(angle);
    const y = cy - radius * Math.cos(angle);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
