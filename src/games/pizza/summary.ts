import { puzzleNumber, todayKey, yesterdayKey } from './game/daily'
import type { GameState } from './game/useDailyGame'
import { getStats, load } from './lib/storage'

/** What the hub shows about today's P for Pizza, read from this device. */
export interface PizzaToday {
  day: string
  puzzle: number
  status: 'unplayed' | 'playing' | 'done'
  /** The day's first game, which is the one that counts. */
  score: number | null
  streak: number
}

export function pizzaToday(now = new Date()): PizzaToday {
  const day = todayKey(now)
  const stats = getStats()
  const game = load<Partial<GameState> | null>(`pfp:game:${day}`, null)

  const done = stats.lastDay === day
  const status = done ? 'done' : game?.startedAt ? 'playing' : 'unplayed'
  // The stored streak is only bumped when a game finishes, so it goes stale once a day is missed.
  const live = stats.lastDay === day || stats.lastDay === yesterdayKey(day)

  return {
    day,
    puzzle: puzzleNumber(day),
    status,
    score: done ? (stats.lastScore ?? null) : null,
    streak: live ? stats.streak : 0,
  }
}
