import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { load, save } from './storage'

export interface ScoreEntry {
  day: string
  playerId: string
  name: string
  score: number
  /** Nine chars, one per slot top→bottom: g / y / r, or - for empty. */
  slice: string
  secondsLeft: number
}

export interface LeaderboardBackend {
  /** Human-readable label, shown so nobody mistakes the local dev board for the real one. */
  readonly kind: 'global' | 'local'
  submit(entry: ScoreEntry): Promise<void>
  top(day: string, limit?: number): Promise<ScoreEntry[]>
}

class SupabaseBackend implements LeaderboardBackend {
  readonly kind = 'global'
  private client: SupabaseClient
  constructor(url: string, key: string) {
    this.client = createClient(url, key, { auth: { persistSession: false } })
  }

  async submit(e: ScoreEntry) {
    const { error } = await this.client.from('scores').insert({
      day: e.day,
      player_id: e.playerId,
      name: e.name,
      score: e.score,
      slice: e.slice,
      seconds_left: e.secondsLeft,
    })
    // 23505 = unique violation: this player already has a score for today, which is fine.
    if (error && error.code !== '23505') throw error
  }

  async top(day: string, limit = 50) {
    const { data, error } = await this.client
      .from('scores')
      .select('day, player_id, name, score, slice, seconds_left')
      .eq('day', day)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    return (data ?? []).map((r) => ({
      day: r.day,
      playerId: r.player_id,
      name: r.name,
      score: r.score,
      slice: r.slice,
      secondsLeft: r.seconds_left,
    }))
  }
}

/** Used when Supabase isn't configured — only ever shows scores from this browser. */
class LocalBackend implements LeaderboardBackend {
  readonly kind = 'local'
  async submit(e: ScoreEntry) {
    const all = load<ScoreEntry[]>('pfp:local-board', [])
    if (all.some((x) => x.day === e.day && x.playerId === e.playerId)) return
    save('pfp:local-board', [...all, e])
  }
  async top(day: string, limit = 50) {
    return load<ScoreEntry[]>('pfp:local-board', [])
      .filter((e) => e.day === day)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const leaderboard: LeaderboardBackend = url && key ? new SupabaseBackend(url, key) : new LocalBackend()
