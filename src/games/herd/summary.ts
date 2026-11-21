import { dayKey, daysSinceLaunch, entryFor, isRevealed, onTime, puzzleNumber, results, revealAt, type Outcome } from './herd'

/** One day of Herd Mentality, as the hub and the streak page show it. */
export interface HerdDay {
  day: string
  puzzle: number
  answered: boolean
  /** Answered before that day's 11pm reveal. */
  onTime: boolean
  revealed: boolean
  /** Only once you've answered and the herd is revealed. */
  outcome: Outcome | null
}

export interface HerdToday extends HerdDay {
  revealAt: Date
  streak: number
}

function dayOf(day: string, now: Date): HerdDay {
  const entry = entryFor(day)
  const revealed = isRevealed(day, now)
  return {
    day,
    puzzle: puzzleNumber(day),
    answered: !!entry,
    onTime: !!entry && onTime(day, entry),
    revealed,
    outcome: entry && revealed ? results(day, entry.answer).outcome : null,
  }
}

/** Consecutive days answered on time, ending today (or yesterday, if today isn't in yet). */
function streakOf(days: HerdDay[]): { current: number; best: number } {
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

export function herdToday(now = new Date()): HerdToday {
  const today = dayKey(now)
  return { ...dayOf(today, now), revealAt: revealAt(today), streak: streakOf(daysSinceLaunch(today).map((d) => dayOf(d, now))).current }
}

/** The `count` days before today, most recent first, never before launch. */
export function herdPastDays(count: number, now = new Date()): HerdDay[] {
  return daysSinceLaunch(dayKey(now))
    .slice(0, -1)
    .reverse()
    .slice(0, count)
    .map((d) => dayOf(d, now))
}

export interface HerdHistory {
  days: HerdDay[]
  streak: number
  bestStreak: number
  /** Times you matched the herd. */
  herds: number
  pinkCows: number
  answered: number
}

/** Every day since launch, read from this device. */
export function herdHistory(now = new Date()): HerdHistory {
  const days = daysSinceLaunch(dayKey(now)).map((d) => dayOf(d, now))
  const { current, best } = streakOf(days)
  return {
    days,
    streak: current,
    bestStreak: best,
    herds: days.filter((d) => d.outcome === 'herd').length,
    pinkCows: days.filter((d) => d.outcome === 'pink').length,
    answered: days.filter((d) => d.answered).length,
  }
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  herd: '🐄 In the herd',
  pink: '🩷 Pink cow',
  between: 'Close to the herd',
}
