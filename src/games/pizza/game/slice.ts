import type { Difficulty, Slice, WonTriangle } from './types'

export const SLICE_SIZE = 9
export const ROUND_SECONDS = 150
export const SKIP_PENALTY_SECONDS = 5

/** Which colours each slot accepts — straight from the board game rules. */
const TOP = [0]
const MIDDLE = [1, 2, 3]
const BOTTOM = [4, 5, 6, 7, 8]
const SLOTS_FOR: Record<Difficulty, number[]> = {
  red: [...TOP, ...MIDDLE, ...BOTTOM],
  yellow: [...MIDDLE, ...BOTTOM],
  green: BOTTOM,
}

export const POINTS: Record<Difficulty, number> = { green: 10, yellow: 20, red: 30 }
export const COMPLETION_BONUS = 50

export function emptySlice(): Slice {
  return Array.from({ length: SLICE_SIZE }, () => null)
}

export function slotRow(slot: number): 'top' | 'middle' | 'bottom' {
  return slot === 0 ? 'top' : slot <= 3 ? 'middle' : 'bottom'
}

/**
 * The slot a triangle of this colour would go into, or -1 if there's no room.
 * Harder triangles fill the most restrictive rows first, which is always optimal:
 * greens can only ever go on the bottom, so a red never needs to take a bottom slot early.
 */
export function slotFor(slice: Slice, difficulty: Difficulty): number {
  return SLOTS_FOR[difficulty].find((i) => slice[i] === null) ?? -1
}

export function place(slice: Slice, triangle: WonTriangle): Slice {
  const slot = slotFor(slice, triangle.prompt.difficulty)
  if (slot === -1) return slice
  const next = [...slice]
  next[slot] = triangle
  return next
}

export function isComplete(slice: Slice): boolean {
  return slice.every(Boolean)
}

export interface ScoreBreakdown {
  triangles: number
  completion: number
  time: number
  total: number
}

/** Bigger slice = harder toppings, a finished slice, and time left on the clock. */
export function score(slice: Slice, secondsLeft: number): ScoreBreakdown {
  const triangles = slice.reduce((sum, t) => sum + (t ? POINTS[t.prompt.difficulty] : 0), 0)
  const complete = isComplete(slice)
  const completion = complete ? COMPLETION_BONUS : 0
  const time = complete ? Math.max(0, Math.floor(secondsLeft)) : 0
  return { triangles, completion, time, total: triangles + completion + time }
}

export const MAX_SCORE = SLICE_SIZE * POINTS.red + COMPLETION_BONUS + ROUND_SECONDS

const EMOJI: Record<Difficulty, string> = { green: '🟩', yellow: '🟨', red: '🟥' }

export function sliceEmoji(slice: Slice): string {
  const cell = (i: number) => (slice[i] ? EMOJI[slice[i]!.prompt.difficulty] : '⬜')
  return [
    `    ${cell(0)}`,
    `  ${MIDDLE.map(cell).join('')}`,
    BOTTOM.map(cell).join(''),
  ].join('\n')
}
