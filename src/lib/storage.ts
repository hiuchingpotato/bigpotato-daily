// Every read and write is guarded: storage can be unavailable (private mode, blocked site data, some webviews).

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Non-fatal: the game still works for this session.
  }
}

export interface Player {
  id: string
  name: string
}

export function getPlayer(): Player {
  const existing = load<Player | null>('pfp:player', null)
  if (existing?.id) return existing
  const player = { id: crypto.randomUUID(), name: '' }
  save('pfp:player', player)
  return player
}

export function setPlayerName(name: string): Player {
  const player = { ...getPlayer(), name: name.trim().slice(0, 16) }
  save('pfp:player', player)
  return player
}

export interface Stats {
  played: number
  best: number
  streak: number
  maxStreak: number
  lastDay: string | null
}

const EMPTY_STATS: Stats = { played: 0, best: 0, streak: 0, maxStreak: 0, lastDay: null }

export function getStats(): Stats {
  return load('pfp:stats', EMPTY_STATS)
}

export function recordResult(dayKey: string, score: number, previousDayKey: string): Stats {
  const stats = getStats()
  if (stats.lastDay === dayKey) return stats
  const streak = stats.lastDay === previousDayKey ? stats.streak + 1 : 1
  const next: Stats = {
    played: stats.played + 1,
    best: Math.max(stats.best, score),
    streak,
    maxStreak: Math.max(stats.maxStreak, streak),
    lastDay: dayKey,
  }
  save('pfp:stats', next)
  return next
}
