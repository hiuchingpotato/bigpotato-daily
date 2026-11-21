import { LAUNCH_DAY, previousDayKeys, puzzleNumber, todayKey, yesterdayKey } from './game/daily'
import { score } from './game/slice'
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

/** A past day's puzzle, for the hub's row of previous games. */
export interface PizzaPastDay {
  day: string
  puzzle: number
  status: 'unplayed' | 'playing' | 'done'
  score: number | null
}

function savedGame(day: string): Partial<GameState> | null {
  return load<Partial<GameState> | null>(`pfp:game:${day}`, null)
}

export function pizzaToday(now = new Date()): PizzaToday {
  const day = todayKey(now)
  const stats = getStats()
  const game = savedGame(day)

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

export function pizzaPastDays(count: number, now = new Date()): PizzaPastDay[] {
  return previousDayKeys(todayKey(now), count).map((day) => {
    const game = savedGame(day)
    const done = !!game?.finished && !!game.slice
    return {
      day,
      puzzle: puzzleNumber(day),
      status: done ? 'done' : game?.startedAt ? 'playing' : 'unplayed',
      score: done ? score(game.slice!, game.secondsLeftAtFinish ?? 0).total : null,
    }
  })
}

/** One day of P for Pizza for the streak & calendar screen. */
export interface PizzaDayRecord {
  day: string
  puzzle: number
  status: 'unplayed' | 'playing' | 'done'
  score: number | null
  /** Started on the puzzle's own day, rather than caught up later. */
  onTime: boolean
}

export interface PizzaHistory {
  days: PizzaDayRecord[]
  streak: number
  bestStreak: number
  bestScore: number
  totalPoints: number
  played: number
}

/** Every day since launch, read from this device. */
export function pizzaHistory(now = new Date()): PizzaHistory {
  const today = todayKey(now)
  const days: PizzaDayRecord[] = []
  const d = new Date(`${LAUNCH_DAY}T12:00:00`)
  for (let day = LAUNCH_DAY; day <= today; d.setDate(d.getDate() + 1), day = todayKey(d)) {
    const game = savedGame(day)
    const done = !!game?.finished && !!game.slice
    days.push({
      day,
      puzzle: puzzleNumber(day),
      status: done ? 'done' : game?.startedAt ? 'playing' : 'unplayed',
      score: done ? score(game.slice!, game.secondsLeftAtFinish ?? 0).total : null,
      onTime: !!game?.startedAt && todayKey(new Date(game.startedAt)) === day,
    })
  }
  const stats = getStats()
  const finished = days.filter((x) => x.score !== null)
  return {
    days,
    streak: pizzaToday(now).streak,
    bestStreak: stats.maxStreak,
    bestScore: Math.max(stats.best, ...finished.map((x) => x.score!), 0),
    totalPoints: finished.reduce((sum, x) => sum + x.score!, 0),
    played: finished.length,
  }
}
