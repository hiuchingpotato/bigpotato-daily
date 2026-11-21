import type { Slice } from '../game/types'
import { slotRow } from '../game/slice'

const SIDE = 100
const H = (SIDE * Math.sqrt(3)) / 2
const W = SIDE * 3
const PAD = 6
/** Each card is shrunk towards its centre, leaving a white gap between cards like a dealt deck. */
const CARD_SCALE = 0.9
/** The thin coloured edge inside a won card that shows its difficulty. */
const EDGE_SCALE = 0.76

type Point = [number, number]

/** Row r (0 = top) has 2r+1 triangles alternating up/down. Slot order matches `Slice`. */
function triangles() {
  const out: { points: Point[]; cx: number; cy: number; up: boolean }[] = []
  const cx = W / 2
  for (let r = 0; r < 3; r++) {
    const yTop = r * H
    const yBot = (r + 1) * H
    const leftTop = cx - (r * SIDE) / 2
    const leftBot = cx - ((r + 1) * SIDE) / 2
    for (let k = 0; k < 2 * r + 1; k++) {
      let points: Point[]
      const up = k % 2 === 0
      if (up) {
        const i = k / 2
        points = [[leftTop + i * SIDE, yTop], [leftBot + i * SIDE, yBot], [leftBot + (i + 1) * SIDE, yBot]]
      } else {
        const j = (k - 1) / 2
        points = [[leftTop + j * SIDE, yTop], [leftTop + (j + 1) * SIDE, yTop], [leftBot + (j + 1) * SIDE, yBot]]
      }
      const tx = (points[0][0] + points[1][0] + points[2][0]) / 3
      const ty = (points[0][1] + points[1][1] + points[2][1]) / 3
      out.push({ points, cx: tx, cy: ty, up })
    }
  }
  return out
}

const TRIS = triangles()

type Tri = (typeof TRIS)[number]

function scaled(t: Tri, factor: number): string {
  return t.points.map(([x, y]) => `${t.cx + (x - t.cx) * factor},${t.cy + (y - t.cy) * factor}`).join(' ')
}

/** A basil leaf, drawn pointing right from the origin. */
function Leaf({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M0 0 C 3 -5, 10 -5, 13 0 C 10 5, 3 5, 0 0 Z" className="topping topping--leaf" />
      <path d="M1 0 L 11 0" className="topping__vein" />
    </g>
  )
}

/** A mushroom slice. */
function Mushroom({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M-6 0 A 6 5 0 0 1 6 0 Z" className="topping topping--mushroom" />
      <rect x="-2" y="0" width="4" height="5" rx="1.5" className="topping topping--mushroom" />
    </g>
  )
}

/** Toppings sit in two of each card's corners, away from the letter in the middle. */
function Toppings({ t, slot }: { t: Tri; slot: number }) {
  const corner = (i: number) => {
    const [x, y] = t.points[i % 3]
    return { x: t.cx + (x - t.cx) * 0.4, y: t.cy + (y - t.cy) * 0.4 }
  }
  // Vary which corners and which toppings by slot, so the slice doesn't look stamped.
  const a = corner(slot)
  const b = corner(slot + 1)
  return (
    <>
      <Leaf x={a.x - 6} y={a.y} angle={(slot * 47) % 360} />
      {slot % 2 === 0 ? <Mushroom x={b.x} y={b.y} angle={((slot * 31) % 60) - 30} /> : <Leaf x={b.x - 6} y={b.y} angle={(slot * 83) % 360} />}
    </>
  )
}

interface Props {
  slice: Slice
  /** Slot that was just filled, so it can pop in. */
  fresh?: number
  className?: string
}

export function PizzaSlice({ slice, fresh, className }: Props) {
  return (
    <svg
      className={`slice ${className ?? ''}`}
      viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${3 * H + PAD * 2}`}
      role="img"
      aria-label={`Pizza slice: ${slice.filter(Boolean).length} of 9 triangles`}
    >
      <defs>
        {/* The P for Pizza card yellow: lighter in the middle, deeper at the edges. */}
        <radialGradient id="pizza-card" cx="50%" cy="55%" r="65%">
          <stop offset="0" stopColor="#ffec7a" />
          <stop offset="1" stopColor="#f8d42f" />
        </radialGradient>
      </defs>
      {TRIS.map((t, i) => {
        const won = slice[i]
        const row = slotRow(i)
        return (
          <g key={i} className={`tri ${won ? `tri--won tri--${won.prompt.difficulty}` : `tri--empty tri--need-${row}`} ${fresh === i ? 'tri--fresh' : ''}`}>
            <polygon className="tri__card" points={scaled(t, CARD_SCALE)} />
            {won ? (
              <>
                <polygon className="tri__edge" points={scaled(t, EDGE_SCALE)} />
                <Toppings t={t} slot={i} />
                {/* Just the letter this card was won with, nudged towards the wide side. */}
                <text className="tri__letter" x={t.cx} y={t.cy + (t.up ? 4 : -4)} dy="0.35em" textAnchor="middle">
                  {won.prompt.letter}
                </text>
              </>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
