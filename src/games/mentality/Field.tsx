import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Outcome, Round } from './mentality'

const ART = `${import.meta.env.BASE_URL}herd/`

/** What just happened, so the field can play it out. */
export interface FieldEvent {
  kind: Outcome
  round: number
}

// ─── The cows ───────────────────────────────────────────────────────────

/** Where each cow's eyes are in its 398×272 artwork (top-left of each eye white), for blinking. */
const EYES: Record<string, [number, number][]> = {
  'cow-1': [[67, 71], [125, 71]],
  'cow-2': [[84, 71], [142, 71]],
  'cow-3': [[88, 71], [145, 71]],
  'cow-4': [[65, 51], [123, 51]],
  'cow-5': [[84, 50], [142, 50]],
  'cow-6': [[88, 51], [145, 51]],
}
const ART_W = 398
const ART_H = 272
const EYE_W = 25
const EYE_H = 41

/** The field's cows, where each starts (as fractions of the field), and who starts off napping. */
const COWS: { art: string; x: number; y: number; asleep?: boolean }[] = [
  { art: 'cow-1', x: 0.16, y: 0.4, asleep: true },
  { art: 'cow-4', x: 0.8, y: 0.37 },
  { art: 'cow-3', x: 0.42, y: 0.48 },
  { art: 'cow-6', x: 0.86, y: 0.57, asleep: true },
  { art: 'cow-2', x: 0.12, y: 0.66 },
  { art: 'cow-5', x: 0.58, y: 0.7 },
  { art: 'cow-1', x: 0.3, y: 0.86 },
  { art: 'cow-3', x: 0.82, y: 0.93 },
  { art: 'cow-6', x: 0.5, y: 0.98, asleep: true },
]

/** Where the herd gathers, as a fraction down the field. */
const HERD_Y = 0.66
/** Herd cows stand bigger than anything else on the field: they're the focal point. */
const HERD_SCALE = 1.45

/** Places in the herd, in cow-widths from the middle. */
const SLOTS: [number, number][] = [
  [0, 0],
  [-0.86, -0.3],
  [0.86, -0.3],
  [-0.56, 0.36],
  [0.56, 0.36],
  [0, -0.6],
  [-1.2, 0.06],
  [1.2, 0.06],
]

/** Perspective: further up the field is further away, so smaller. */
const depth = (y: number) => 0.5 + (Math.max(0.28, Math.min(1, y)) - 0.28) * (0.62 / 0.72)

/** The cow's width in px, matching --cow in the CSS. */
const cowPx = () => Math.min(150, Math.max(92, window.innerWidth * 0.27))

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Which rounds put a cow or a pink cow in the herd, and the place each takes. */
function gather(rounds: Round[]) {
  const herd: { slot: number; round: number }[] = []
  const pinks: { slot: number; round: number }[] = []
  rounds.forEach((r, round) => {
    const slot = herd.length + pinks.length
    if (r.outcome === 'herd') herd.push({ slot, round })
    else if (r.outcome === 'pink') pinks.push({ slot, round })
  })
  return { herd, pinks }
}

// ─── The simulation ─────────────────────────────────────────────────────

type State = 'stand' | 'walk' | 'sleep' | 'stare' | 'join' | 'herd'

interface Cow {
  el: HTMLElement
  x: number
  y: number
  s: number
  state: State
  until: number
  tx: number
  ty: number
  flip: boolean
  /** For a cow walking over to the herd: where it set off from and how big it was. */
  from?: { x: number; y: number; s: number }
}

/**
 * Moves the cows about, one frame at a time, straight on the DOM so React isn't
 * re-rendering 60 times a second. Each cow stands about, ambles somewhere new, or
 * has a nap; while a question is up they all stop and stare; a cow joining the herd
 * walks into the middle, growing as it comes to the front.
 */
class Herd {
  cows: Cow[]
  field: HTMLElement
  mood: 'idle' | 'alert' = 'idle'
  handled = new Set<number>()
  raf = 0
  last = 0
  still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor(field: HTMLElement, els: HTMLElement[], herdSlots: number[]) {
    this.field = field
    const now = performance.now()
    this.cows = COWS.map((c, i) => ({
      el: els[i]!,
      x: c.x,
      y: c.y,
      s: depth(c.y),
      state: c.asleep ? 'sleep' : 'stand',
      until: now + (c.asleep ? rand(12_000, 30_000) : rand(300, 4000)),
      tx: c.x,
      ty: c.y,
      flip: Math.random() < 0.5,
    }))
    // Anyone already in the herd (a reload, or the results) is simply there.
    herdSlots.forEach((slot) => {
      const cow = this.nearestFree(0.5, HERD_Y)
      if (!cow) return
      const [x, y] = this.slotAt(slot)
      Object.assign(cow, { x, y, s: HERD_SCALE, state: 'herd', flip: false })
    })
    this.cows.forEach((c) => this.draw(c))
  }

  start() {
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - (this.last || t)) / 1000)
      this.last = t
      for (const c of this.cows) this.step(c, t, dt)
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  stop() {
    cancelAnimationFrame(this.raf)
  }

  slotAt(slot: number): [number, number] {
    const [dx, dy] = SLOTS[slot % SLOTS.length]!
    const w = this.field.clientWidth || window.innerWidth
    const h = this.field.clientHeight || window.innerHeight
    return [0.5 + (dx * cowPx()) / w, HERD_Y + (dy * cowPx()) / h]
  }

  free() {
    return this.cows.filter((c) => c.state !== 'herd' && c.state !== 'join')
  }

  nearestFree(x: number, y: number): Cow | undefined {
    return this.free().sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0]
  }

  setMood(mood: 'idle' | 'alert') {
    this.mood = mood
    const now = performance.now()
    for (const c of this.free()) {
      if (mood === 'alert') {
        // Wide awake, stop where you are, and look at the player.
        Object.assign(c, { state: 'stare', flip: false })
      } else if (c.state === 'stare') {
        // Back to business, not all at once.
        Object.assign(c, { state: 'stand', until: now + rand(400, 3500) })
      }
      this.draw(c)
    }
  }

  /** A cow walks over to join the herd. */
  join(round: number, slot: number) {
    if (this.handled.has(round)) return
    this.handled.add(round)
    const [x, y] = this.slotAt(slot)
    const cow = this.nearestFree(x, y)
    if (!cow) return
    Object.assign(cow, { state: 'join', tx: x, ty: y, from: { x: cow.x, y: cow.y, s: cow.s }, flip: x > cow.x })
    cow.el.classList.remove('is-arrived')
  }

  /** The pink cow charges in from the left: the cow nearest its path gets spun round. */
  bump(round: number) {
    if (this.handled.has(round)) return
    this.handled.add(round)
    const inTheWay = this.free()
      .filter((c) => c.x < 0.6)
      .sort((a, b) => Math.abs(a.y - HERD_Y) - Math.abs(b.y - HERD_Y))[0]
    if (!inTheWay) return
    Object.assign(inTheWay, { state: 'stand', until: performance.now() + 3600 })
    // In step with the pink cow's charge.
    setTimeout(() => inTheWay.el.classList.add('is-dizzy'), 350)
    setTimeout(() => inTheWay.el.classList.remove('is-dizzy'), 3600)
    this.draw(inTheWay)
  }

  /** Somewhere new to wander to: not too far, and not into the middle of your herd. */
  wanderFrom(c: Cow): [number, number] {
    const herdUp = this.cows.some((o) => o.state === 'herd' || o.state === 'join')
    let best: [number, number] = [c.x, c.y]
    for (let i = 0; i < 12; i++) {
      const x = Math.min(0.88, Math.max(0.12, c.x + rand(-0.32, 0.32)))
      const y = Math.min(0.98, Math.max(0.34, c.y + rand(-0.16, 0.16)))
      best = [x, y]
      if (!herdUp || Math.abs(x - 0.5) > 0.3 || Math.abs(y - HERD_Y) > 0.14) break
    }
    return best
  }

  step(c: Cow, now: number, dt: number) {
    switch (c.state) {
      case 'stand':
      case 'sleep':
        if (this.mood !== 'idle' || now < c.until) return
        if (c.state === 'stand' && Math.random() < 0.12) {
          // A quick nap.
          Object.assign(c, { state: 'sleep', until: now + rand(8000, 18_000) })
        } else if (this.still) {
          Object.assign(c, { state: 'stand', until: now + rand(2000, 6000) })
        } else {
          const [tx, ty] = this.wanderFrom(c)
          Object.assign(c, { state: 'walk', tx, ty, flip: tx > c.x })
        }
        this.draw(c)
        return
      case 'walk':
      case 'join': {
        const w = this.field.clientWidth || window.innerWidth
        const h = this.field.clientHeight || window.innerHeight
        const dx = (c.tx - c.x) * w
        const dy = (c.ty - c.y) * h
        const dist = Math.hypot(dx, dy)
        // Closer cows look like they cover more ground; joiners trot.
        const speed = c.state === 'join' ? 95 : 26 * c.s
        const move = this.still ? dist : speed * dt
        if (dist <= move) {
          c.x = c.tx
          c.y = c.ty
          if (c.state === 'join') {
            Object.assign(c, { state: 'herd', s: HERD_SCALE, flip: false })
            c.el.classList.add('is-arrived')
          } else {
            Object.assign(c, { state: 'stand', until: now + rand(1500, 6500) })
          }
        } else {
          c.x += (dx / dist) * (move / w)
          c.y += (dy / dist) * (move / h)
        }
        // Object.assign above may have moved it on, so read the state afresh.
        const state = c.state as State
        if (state === 'join' && c.from) {
          // Grow from its own size to the herd's as it walks to the front.
          const total = Math.hypot((c.tx - c.from.x) * w, (c.ty - c.from.y) * h) || 1
          const p = 1 - Math.hypot((c.tx - c.x) * w, (c.ty - c.y) * h) / total
          c.s = c.from.s + (HERD_SCALE - c.from.s) * p
        } else if (state === 'walk' || state === 'stand') {
          c.s = depth(c.y)
        }
        this.draw(c)
        return
      }
      default:
        return
    }
  }

  draw(c: Cow) {
    const st = c.el.style
    st.left = `${(c.x * 100).toFixed(3)}%`
    st.top = `${(c.y * 100).toFixed(3)}%`
    st.setProperty('--s', c.s.toFixed(3))
    // Further down is in front; the herd is in front of everything.
    st.zIndex = String(Math.round(c.y * 100) + (c.state === 'herd' || c.state === 'join' ? 200 : 0))
    const cl = c.el.classList
    cl.toggle('is-walking', c.state === 'walk' || c.state === 'join')
    cl.toggle('is-trotting', c.state === 'join')
    cl.toggle('is-asleep', c.state === 'sleep')
    cl.toggle('is-staring', c.state === 'stare')
    cl.toggle('is-herd', c.state === 'herd' || c.state === 'join')
    cl.toggle('is-flipped', c.flip)
  }
}

// ─── The field ──────────────────────────────────────────────────────────

/**
 * The grass, the cows and your growing herd, behind the questions.
 *
 * - idle: cows amble about, stand, blink and doze.
 * - alert (a question is up): everyone stops, wakes and stares at you, leaning in as
 *   the clock runs down and fidgeting in the last ten seconds.
 * - herd: the nearest cow trots to the middle, growing as it comes, with a "!".
 * - pink: a pink cow charges into the middle, spinning a cow in its way.
 * - more or less / time's up: nobody takes any notice.
 */
export function Field({ rounds, event, mood, deadline }: { rounds: Round[]; event: FieldEvent | null; mood: 'idle' | 'alert'; deadline: number }) {
  const field = useRef<HTMLDivElement>(null)
  const els = useRef<HTMLDivElement[]>([])
  const herd = useRef<Herd | null>(null)
  const { herd: herdSlots, pinks } = gather(rounds)
  // Each cow blinks and breathes to its own rhythm.
  const [timing] = useState(() =>
    COWS.map(() => ({ '--blink': `${rand(3.2, 7.5).toFixed(2)}s`, '--blink-delay': `${-rand(0, 6).toFixed(2)}s`, '--d': `${-rand(0, 3).toFixed(2)}s` }) as CSSProperties),
  )

  // Only on mount: the herd so far is placed straight away, later joiners walk in.
  const initial = useRef(herdSlots.filter((h) => h.round !== event?.round).map((h) => h.slot))
  useEffect(() => {
    const h = new Herd(field.current!, els.current, initial.current)
    herd.current = h
    h.start()
    return () => h.stop()
  }, [])

  useEffect(() => {
    herd.current?.setMood(mood)
  }, [mood])

  useEffect(() => {
    if (!event) return
    if (event.kind === 'herd') {
      const joined = herdSlots.find((h) => h.round === event.round)
      if (joined) herd.current?.join(event.round, joined.slot)
    } else if (event.kind === 'pink') {
      herd.current?.bump(event.round)
    }
    // Plays once per event.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  // The last ten seconds of a question.
  const [hurryFor, setHurryFor] = useState(0)
  useEffect(() => {
    if (!deadline) return
    const id = setTimeout(() => setHurryFor(deadline), Math.max(0, deadline - Date.now() - 10_000))
    return () => clearTimeout(id)
  }, [deadline])
  const hurry = deadline > 0 && hurryFor === deadline

  return (
    <div ref={field} className={`hm-field hm-field--${mood}${hurry ? ' hm-field--hurry' : ''}`} aria-hidden="true">
      {COWS.map((cow, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) els.current[i] = el
          }}
          className="hm-cow"
          style={timing[i]}
        >
          <div className="hm-cow__move">
            <div className="hm-cow__body">
              <div className="hm-cow__flip">
                <img src={`${ART}${cow.art}.png`} alt="" draggable={false} />
                {EYES[cow.art]!.map(([x, y], e) => (
                  <span
                    key={e}
                    className="hm-cow__lid"
                    style={{ left: `${(x / ART_W) * 100}%`, top: `${(y / ART_H) * 100}%`, width: `${(EYE_W / ART_W) * 100}%`, height: `${(EYE_H / ART_H) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <span className="hm-cow__zzz">
            <i>z</i>
            <i>z</i>
            <i>z</i>
          </span>
          <span className="hm-cow__bang">!</span>
          <span className="hm-cow__stars">💫</span>
        </div>
      ))}

      {pinks.map((p) => {
        const isNew = event?.kind === 'pink' && event.round === p.round
        const [dx, dy] = SLOTS[p.slot % SLOTS.length]!
        const style = {
          left: `calc(50% + var(--cow) * ${dx})`,
          top: `calc(${HERD_Y * 100}% + var(--cow) * ${dy})`,
          zIndex: 200 + Math.round((HERD_Y + dy * 0.1) * 100),
          '--s': HERD_SCALE,
        } as CSSProperties
        return (
          <div key={p.round} className={`hm-cow hm-cow--pink is-herd${isNew ? ' is-rushing' : ''}`} style={style}>
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
