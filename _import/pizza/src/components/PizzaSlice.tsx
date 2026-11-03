import type { Slice } from '../game/types'
import { slotRow } from '../game/slice'

const SIDE = 100
const H = (SIDE * Math.sqrt(3)) / 2
const W = SIDE * 3
const PAD = 6
const CRUST = 16

/** Row r (0 = top) has 2r+1 triangles alternating up/down. Slot order matches `Slice`. */
function triangles() {
  const out: { points: [number, number][]; cx: number; cy: number }[] = []
  const cx = W / 2
  for (let r = 0; r < 3; r++) {
    const yTop = r * H
    const yBot = (r + 1) * H
    const leftTop = cx - (r * SIDE) / 2
    const leftBot = cx - ((r + 1) * SIDE) / 2
    for (let k = 0; k < 2 * r + 1; k++) {
      let points: [number, number][]
      if (k % 2 === 0) {
        const i = k / 2
        points = [[leftTop + i * SIDE, yTop], [leftBot + i * SIDE, yBot], [leftBot + (i + 1) * SIDE, yBot]]
      } else {
        const j = (k - 1) / 2
        points = [[leftTop + j * SIDE, yTop], [leftTop + (j + 1) * SIDE, yTop], [leftBot + (j + 1) * SIDE, yBot]]
      }
      const tx = (points[0][0] + points[1][0] + points[2][0]) / 3
      const ty = (points[0][1] + points[1][1] + points[2][1]) / 3
      out.push({ points, cx: tx, cy: ty })
    }
  }
  return out
}

const TRIS = triangles()

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
      viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${3 * H + CRUST + PAD * 2}`}
      role="img"
      aria-label={`Pizza slice: ${slice.filter(Boolean).length} of 9 triangles`}
    >
      {TRIS.map((t, i) => {
        const won = slice[i]
        const row = slotRow(i)
        const pts = t.points.map((p) => p.join(',')).join(' ')
        return (
          <g key={i} className={`tri ${won ? `tri--${won.prompt.difficulty}` : `tri--empty tri--need-${row}`} ${fresh === i ? 'tri--fresh' : ''}`}>
            <polygon points={pts} />
            {won ? (
              <text x={t.cx} y={t.cy} dy="0.35em" textAnchor="middle">
                {won.prompt.letter}
              </text>
            ) : null}
          </g>
        )
      })}
      <rect className="crust" x={-PAD / 2} y={3 * H + 2} width={W + PAD} height={CRUST} rx={CRUST / 2} />
    </svg>
  )
}
