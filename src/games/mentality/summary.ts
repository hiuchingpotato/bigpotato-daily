import { allSaved, dayKey, daysSinceLaunch, puzzleNumber, roundsFor, ROUNDS, type Saved } from './mentality'

/** One day of Herd Mentality, as the hub and the streak page show it. */
export interface MentalityDay {
  day: string
  puzzle: number
  status: 'none' | 'playing' | 'done'
  /** Finished on the day itself, so it counts towards the streak. */
  onTime: boolean
  score: number | null
  herds: number
  pinks: number
}

function dayOf(day: string, saved: Saved | undefined): MentalityDay {
  const rounds = saved ? roundsFor(day, saved) : []
  const done = rounds.length === ROUNDS
  return {
    day,
    puzzle: puzzleNumber(day),
    status: done ? 'done' : rounds.length ? 'playing' : 'none',
    onTime: done && saved?.finishedOn === day,
    score: done ? rounds.reduce((s, r) => s + r.points, 0) : null,
    herds: rounds.filter((r) => r.outcome === 'herd').length,
    pinks: rounds.filter((r) => r.outcome === 'pink').length,
  }
}

function streakOf(days: MentalityDay[]): { current: number; best: number } {
  let best = 0
  let run = 0
  for (const d of days) {
    run = d.onTime ? run + 1 : 0
    best = Math.max(best, run)
  }
  let current = 0
  const last = days.length - 1
  for (let i = days[last]?.onTime ? last : last - 1; i >= 0 && days[i]!.onTime; i--) current++
  return { current, best }
}

export interface MentalityHistory {
  days: MentalityDay[]
  streak: number
  bestStreak: number
  played: number
  bestScore: number | null
  /** Every cow and pink cow you've ever gathered. */
  cows: number
  pinkCows: number
}

/** Every day since launch, read from this device. */
export function mentalityHistory(now = new Date()): MentalityHistory {
  const saved = allSaved()
  const days = daysSinceLaunch(dayKey(now)).map((d) => dayOf(d, saved[d]))
  const { current, best } = streakOf(days)
  const scores = days.flatMap((d) => (d.score === null ? [] : [d.score]))
  return {
    days,
    streak: current,
    bestStreak: best,
    played: scores.length,
    bestScore: scores.length ? Math.max(...scores) : null,
    cows: days.reduce((s, d) => s + d.herds, 0),
    pinkCows: days.reduce((s, d) => s + d.pinks, 0),
  }
}

export function mentalityToday(now = new Date()): MentalityDay & { streak: number } {
  const h = mentalityHistory(now)
  return { ...h.days[h.days.length - 1]!, streak: h.streak }
}

/** The `count` days before today, most recent first, never before launch. */
export function mentalityPastDays(count: number, now = new Date()): MentalityDay[] {
  return mentalityHistory(now).days.slice(0, -1).reverse().slice(0, count)
}
