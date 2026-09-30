import { CATEGORIES } from './categories'
import { createRng, hashString, pick, shuffle } from './rng'
import type { Category, Difficulty, Prompt } from './types'
import { answersForLetter } from './validate'

/** Puzzle #1 went live on this date. */
export const LAUNCH_DAY = '2026-09-30'
export const DECK_SIZE = 45
export const VISIBLE_PROMPTS = 3

/** A letter only appears against a category if there are at least this many answers for it. */
const MIN_ANSWERS: Record<Difficulty, number> = { green: 8, yellow: 4, red: 3 }

/** Every block of five cards contains this colour mix, shuffled. */
const COLOUR_BLOCK: Difficulty[] = ['green', 'green', 'yellow', 'yellow', 'red']

/** The player's local calendar date as YYYY-MM-DD. A new puzzle drops at local midnight. */
export function todayKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function puzzleNumber(dayKey: string): number {
  const ms = Date.parse(`${dayKey}T00:00:00Z`) - Date.parse(`${LAUNCH_DAY}T00:00:00Z`)
  return Math.round(ms / 86_400_000) + 1
}

function eligibleLetters(category: Category): string[] {
  const letters: string[] = []
  for (let c = 65; c <= 90; c++) {
    const letter = String.fromCharCode(c)
    if (answersForLetter(category, letter).length >= MIN_ANSWERS[category.difficulty]) letters.push(letter)
  }
  return letters
}

const LETTERS_BY_CATEGORY = new Map(CATEGORIES.map((c) => [c.id, eligibleLetters(c)]))

/**
 * The day's deck: the same ordered list of category/letter prompts for every player.
 * No two prompts within any window of three share a category or a letter, so the
 * three prompts on screen are always distinct.
 */
export function generateDeck(dayKey: string): Prompt[] {
  const rng = createRng(hashString(`p-for-pizza:${dayKey}`))
  const byColour: Record<Difficulty, Category[]> = { green: [], yellow: [], red: [] }
  for (const c of CATEGORIES) byColour[c.difficulty].push(c)

  const deck: Prompt[] = []
  const used = new Set<string>()
  while (deck.length < DECK_SIZE) {
    for (const colour of shuffle(rng, COLOUR_BLOCK)) {
      if (deck.length >= DECK_SIZE) break
      const recent = deck.slice(-(VISIBLE_PROMPTS - 1))
      for (let attempt = 0; attempt < 50; attempt++) {
        const category = pick(rng, byColour[colour])
        const letter = pick(rng, LETTERS_BY_CATEGORY.get(category.id)!)
        const key = `${category.id}:${letter}`
        const clashes = recent.some((p) => p.categoryId === category.id || p.letter === letter)
        if (used.has(key) || clashes) continue
        used.add(key)
        deck.push({
          id: `${deck.length}`,
          categoryId: category.id,
          categoryName: category.name,
          difficulty: category.difficulty,
          letter,
        })
        break
      }
    }
  }
  return deck
}
