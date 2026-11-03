import { TIMER_ENABLED } from '../config'
import { createRng, hashString, shuffle, type Rng } from '../game/rng'
import { COMPLETION_BONUS, POINTS, ROUND_SECONDS } from '../game/slice'
import type { Difficulty } from '../game/types'
import type { ScoreEntry } from './leaderboard'

// Made-up players so the leaderboard isn't empty before there's a shared backend.
// Seeded by the day, so everyone sees the same field and it changes at midnight.

const NAMES = [
  'Cheesy Pete', 'Doughlores', 'Crust Fund', 'Pep Guardiola', 'Slice Girl', 'Anchovy Andy',
  'Mozz Def', 'Basil Brush', 'Olive Twist', 'Dough Nut', 'Calzone Kid', 'Sir Loin',
  'Margherita T', 'Garlic Gav', 'Funghi Fran', 'Napoli Nik', 'Topping Tom', 'Stuffed Crust',
  'Big Dipper', 'Deep Dish Di', 'Oregano Oli', 'Ham Solo', 'Pineapple Pam', 'Chilli Chris',
] as const

/** Slot order follows slice.ts: top (red only), middle (yellow/red), bottom (any). */
const SLOTS_FOR: Record<Difficulty, number[]> = {
  red: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  yellow: [1, 2, 3, 4, 5, 6, 7, 8],
  green: [4, 5, 6, 7, 8],
}

function fakeSlice(rng: Rng): string {
  const slots: (Difficulty | null)[] = Array(9).fill(null)
  // Mostly decent games: four to nine cards won, weighted towards the middle.
  const wins = 4 + Math.floor((rng() + rng()) * 3)
  for (let i = 0; i < wins; i++) {
    const r = rng()
    const colour: Difficulty = r < 0.45 ? 'green' : r < 0.8 ? 'yellow' : 'red'
    const slot = SLOTS_FOR[colour].find((s) => slots[s] === null)
    if (slot !== undefined) slots[slot] = colour
  }
  return slots.map((c) => (c ? c[0] : '-')).join('')
}

function scoreFor(slice: string, secondsLeft: number): number {
  const colour = { g: 'green', y: 'yellow', r: 'red' } as const
  const triangles = [...slice].reduce((sum, c) => sum + (c === '-' ? 0 : POINTS[colour[c as keyof typeof colour]]), 0)
  return slice.includes('-') ? triangles : triangles + COMPLETION_BONUS + secondsLeft
}

export function demoPlayers(day: string): ScoreEntry[] {
  const rng = createRng(hashString(`p-for-pizza:demo:${day}`))
  const count = 8 + Math.floor(rng() * 7)
  return shuffle(rng, NAMES)
    .slice(0, count)
    .map((name) => {
      const slice = fakeSlice(rng)
      const complete = !slice.includes('-')
      const secondsLeft = TIMER_ENABLED && complete ? Math.floor(rng() * ROUND_SECONDS * 0.5) : 0
      return { day, playerId: `demo:${name}`, name, score: scoreFor(slice, secondsLeft), slice, secondsLeft }
    })
}
