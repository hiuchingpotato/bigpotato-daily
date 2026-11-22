import { useEffect, useState, type CSSProperties } from 'react'
import type { Outcome, Round } from './mentality'

const ART = `${import.meta.env.BASE_URL}herd/`

/** What just happened, so the field can play it out. */
export interface FieldEvent {
  kind: Outcome
  round: number
}

type Idle = 'sleep' | 'breathe' | 'walk'

/**
 * The cows scattered over the field, each minding its own business. `x`/`y` are where
 * its feet are, in % of the field; `s` scales it (further away is smaller).
 */
const COWS: { art: string; x: number; y: number; s: number; idle: Idle }[] = [
  { art: 'cow-1', x: 14, y: 42, s: 0.72, idle: 'sleep' },
  { art: 'cow-4', x: 82, y: 38, s: 0.7, idle: 'breathe' },
  { art: 'cow-3', x: 32, y: 55, s: 0.85, idle: 'walk' },
  { art: 'cow-6', x: 86, y: 58, s: 0.9, idle: 'sleep' },
  { art: 'cow-2', x: 12, y: 75, s: 1, idle: 'breathe' },
  { art: 'cow-5', x: 64, y: 82, s: 1.05, idle: 'walk' },
  { art: 'cow-1', x: 38, y: 96, s: 1.1, idle: 'sleep' },
  { art: 'cow-3', x: 90, y: 92, s: 1.05, idle: 'breathe' },
]

/** Which cows wander over to join your herd, first to last. */
const JOIN_ORDER = [2, 5, 1, 4, 0, 7, 3, 6]

/** Where the herd gathers, in % down the field (matches --herd-y in the CSS). */
const HERD_Y = 66

/** Places in the herd around the middle of the field, in px from its centre. */
const SLOTS: [number, number][] = [
  [0, 0],
  [-64, -22],
  [64, -22],
  [-46, 36],
  [46, 36],
  [0, -46],
  [-104, 10],
  [104, 10],
]

const slotStyle = (slot: number): CSSProperties => {
  const [dx, dy] = SLOTS[slot % SLOTS.length]!
  return { left: `calc(50% + ${dx}px)`, top: `calc(var(--herd-y) + ${dy}px)`, zIndex: 50 + dy }
}

/** Who's in your herd so far, worked out from the rounds played. */
function gather(rounds: Round[]) {
  const herd = new Map<number, { slot: number; round: number }>()
  const pinks: { slot: number; round: number }[] = []
  let joined = 0
  rounds.forEach((r, round) => {
    const slot = herd.size + pinks.length
    if (r.outcome === 'herd') herd.set(JOIN_ORDER[joined++]!, { slot, round })
    else if (r.outcome === 'pink') pinks.push({ slot, round })
  })
  return { herd, pinks }
}

/** The cow standing in the pink cow's way as it charges in from the left to the middle. */
function inTheWay(herd: Map<number, unknown>): number | undefined {
  let best: number | undefined
  let gap = Infinity
  COWS.forEach((cow, i) => {
    if (herd.has(i) || cow.x > 50) return
    const d = Math.abs(cow.y - HERD_Y)
    if (d < gap) [best, gap] = [i, d]
  })
  return best
}

/**
 * The grass, the cows and your growing herd, behind the questions.
 *
 * - idle: dozing, breathing, ambling about.
 * - alert (a question is up): everyone's awake and staring at you, leaning in as the
 *   clock runs down, fidgeting in the last ten seconds.
 * - herd: a cow walks to the middle with a "!".
 * - pink: a pink cow charges into the middle, sending a cow in its way spinning.
 * - more or less / time's up: nobody takes any notice.
 */
export function Field({ rounds, event, mood, deadline }: { rounds: Round[]; event: FieldEvent | null; mood: 'idle' | 'alert'; deadline: number }) {
  const { herd, pinks } = gather(rounds)
  const dizzy = event?.kind === 'pink' ? inTheWay(herd) : undefined

  // The last ten seconds of a question.
  const [hurryFor, setHurryFor] = useState(0)
  useEffect(() => {
    if (!deadline) return
    const id = setTimeout(() => setHurryFor(deadline), Math.max(0, deadline - Date.now() - 10_000))
    return () => clearTimeout(id)
  }, [deadline])
  const hurry = deadline > 0 && hurryFor === deadline

  return (
    <div className={`hm-field hm-field--${mood}${hurry ? ' hm-field--hurry' : ''}`} aria-hidden="true">
      {COWS.map((cow, i) => {
        const joined = herd.get(i)
        const isNew = !!joined && event?.kind === 'herd' && event.round === joined.round
        const style: CSSProperties = joined
          ? { ...slotStyle(joined.slot), '--s': 0.8 } as CSSProperties
          : ({ left: `${cow.x}%`, top: `${cow.y}%`, zIndex: Math.round(cow.y), '--s': cow.s, '--d': `${-(i * 1.37) % 4}s` } as CSSProperties)
        const cls = [
          'hm-cow',
          joined ? 'hm-cow--herd' : `hm-cow--${cow.idle}`,
          isNew ? 'is-new' : '',
          i === dizzy ? 'is-dizzy' : '',
        ].join(' ')
        return (
          <div key={i} className={cls} style={style}>
            <div className="hm-cow__move">
              <div className="hm-cow__body">
                <img src={`${ART}${cow.art}.png`} alt="" draggable={false} />
              </div>
            </div>
            {cow.idle === 'sleep' && !joined ? (
              <span className="hm-cow__zzz">
                <i>z</i>
                <i>z</i>
                <i>z</i>
              </span>
            ) : null}
            {isNew ? <span className="hm-cow__bang">!</span> : null}
            {i === dizzy ? <span className="hm-cow__stars">💫</span> : null}
          </div>
        )
      })}

      {pinks.map((p) => {
        const isNew = event?.kind === 'pink' && event.round === p.round
        return (
          <div key={p.round} className={`hm-cow hm-cow--herd hm-cow--pink${isNew ? ' is-rushing' : ''}`} style={{ ...slotStyle(p.slot), '--s': 0.85 } as CSSProperties}>
            <div className="hm-cow__move">
              <div className="hm-cow__body">
                <img src={`${ART}pink-cow.png`} alt="" draggable={false} />
              </div>
            </div>
            {isNew ? <span className="hm-cow__dust" /> : null}
          </div>
        )
      })}
    </div>
  )
}
