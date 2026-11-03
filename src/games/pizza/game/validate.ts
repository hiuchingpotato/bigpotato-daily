import { CATEGORY_BY_ID } from './categories'
import type { Category } from './types'

export function normalise(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(the|a|an) /, '')
}

interface Entry {
  canonical: string
  alias: string
  squashed: string
}

const indexCache = new Map<string, Entry[]>()

function entriesFor(category: Category): Entry[] {
  let entries = indexCache.get(category.id)
  if (!entries) {
    entries = category.answers.flatMap((raw) => {
      const aliases = raw.split('|').map(normalise)
      return aliases.map((alias) => ({ canonical: aliases[0], alias, squashed: alias.replace(/ /g, '') }))
    })
    indexCache.set(category.id, entries)
  }
  return entries
}

/** Distinct answers in a category that start with `letter` (counting any alias). */
export function answersForLetter(category: Category, letter: string): string[] {
  const l = letter.toLowerCase()
  return [...new Set(entriesFor(category).filter((e) => e.alias.startsWith(l)).map((e) => e.canonical))]
}

/** Edit distance where swapping two adjacent letters counts as one typo. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev2: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1)
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > max) return max + 1
    prev2 = prev
    prev = cur
  }
  return prev[b.length]
}

/** Plural/singular spellings to try, so "tomatoes" matches "tomato" and vice versa. */
function variants(word: string): string[] {
  const out = new Set([word])
  if (word.endsWith('ies')) out.add(word.slice(0, -3) + 'y')
  if (word.endsWith('es')) out.add(word.slice(0, -2))
  if (word.endsWith('s')) out.add(word.slice(0, -1))
  if (word.endsWith('y')) out.add(word.slice(0, -1) + 'ies')
  out.add(word + 's')
  out.add(word + 'es')
  return [...out]
}

/**
 * Returns the canonical answer if `input` is a valid answer for the category starting with `letter`,
 * otherwise null. Tolerates plurals, spacing and small typos on longer words.
 */
export function matchAnswer(categoryId: string, letter: string, input: string): string | null {
  const category = CATEGORY_BY_ID[categoryId]
  const guess = normalise(input)
  const l = letter.toLowerCase()
  if (!category || !guess.startsWith(l)) return null

  const candidates = entriesFor(category).filter((e) => e.alias.startsWith(l))
  const tries = variants(guess)

  for (const t of tries) {
    const squashed = t.replace(/ /g, '')
    const hit = candidates.find((e) => e.alias === t || e.squashed === squashed)
    if (hit) return hit.canonical
  }

  const squashedGuess = guess.replace(/ /g, '')
  const tolerance = squashedGuess.length >= 9 ? 2 : squashedGuess.length >= 5 ? 1 : 0
  if (tolerance === 0) return null
  let best: Entry | null = null
  let bestDist = tolerance + 1
  for (const e of candidates) {
    const d = editDistance(squashedGuess, e.squashed, tolerance)
    if (d < bestDist) {
      best = e
      bestDist = d
    }
  }
  return best ? best.canonical : null
}
