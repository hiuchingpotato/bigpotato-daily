import { describe, expect, it } from 'vitest'
import { MAX_SCORE } from '../game/slice'
import { demoPlayers } from './demoPlayers'

describe('demo players', () => {
  it('gives everyone the same field for a day, and a different one the next day', () => {
    expect(demoPlayers('2026-11-03')).toEqual(demoPlayers('2026-11-03'))
    expect(demoPlayers('2026-11-04')).not.toEqual(demoPlayers('2026-11-03'))
  })

  it('only produces entries the real leaderboard would accept', () => {
    for (let d = 1; d <= 28; d++) {
      const day = `2026-11-${String(d).padStart(2, '0')}`
      const players = demoPlayers(day)
      expect(players.length).toBeGreaterThanOrEqual(8)
      expect(new Set(players.map((p) => p.playerId)).size).toBe(players.length)
      for (const p of players) {
        // Same checks as supabase/migrations/001_scores.sql.
        expect(p.slice).toMatch(/^[gyr-]{9}$/)
        expect(p.score).toBeGreaterThan(0)
        expect(p.score).toBeLessThanOrEqual(MAX_SCORE)
        // The top slot only ever takes red, and the middle never takes green.
        expect(['r', '-']).toContain(p.slice[0])
        expect(p.slice.slice(1, 4)).not.toContain('g')
      }
    }
  })
})
