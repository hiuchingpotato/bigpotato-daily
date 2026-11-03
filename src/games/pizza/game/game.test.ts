import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './categories'
import { DECK_SIZE, generateDeck, puzzleNumber, VISIBLE_PROMPTS } from './daily'
import { emptySlice, isComplete, MAX_SCORE, place, score, slotFor } from './slice'
import type { Difficulty, Prompt, WonTriangle } from './types'
import { answersForLetter, matchAnswer, normalise } from './validate'

const tri = (difficulty: Difficulty): WonTriangle => ({
  prompt: { id: 'x', categoryId: 'animals', categoryName: 'Animals', difficulty, letter: 'A' },
  answer: 'ant',
  at: 1,
})

describe('matchAnswer', () => {
  it('accepts exact, cased and accented answers', () => {
    expect(matchAnswer('animals', 'B', 'Badger')).toBe('badger')
    expect(matchAnswer('cheeses', 'G', 'Gruyère')).toBe('gruyere')
  })
  it('accepts aliases and plurals', () => {
    expect(matchAnswer('countries', 'U', 'USA')).toBe('united states')
    expect(matchAnswer('countries', 'A', 'america')).toBe('united states')
    expect(matchAnswer('fruit-veg', 'T', 'tomatoes')).toBe('tomato')
    expect(matchAnswer('fruit-veg', 'C', 'cherries')).toBe('cherry')
  })
  it('forgives small typos on longer words', () => {
    expect(matchAnswer('animals', 'E', 'elephnat')).toBe('elephant')
    expect(matchAnswer('elements', 'M', 'molybdenun')).toBe('molybdenum')
  })
  it('rejects wrong letters, wrong categories and short fuzzy matches', () => {
    expect(matchAnswer('animals', 'C', 'badger')).toBeNull()
    expect(matchAnswer('animals', 'F', 'france')).toBeNull()
    expect(matchAnswer('animals', 'C', 'cot')).toBeNull()
  })
  it('ignores a leading article', () => {
    expect(normalise('The Netherlands')).toBe('netherlands')
  })
})

describe('generateDeck', () => {
  const deck = generateDeck('2026-10-01')

  it('is deterministic per day and differs across days', () => {
    expect(generateDeck('2026-10-01')).toEqual(deck)
    expect(generateDeck('2026-10-02')).not.toEqual(deck)
  })
  it('has the full deck size with a mix of colours', () => {
    expect(deck).toHaveLength(DECK_SIZE)
    const reds = deck.filter((p) => p.difficulty === 'red').length
    expect(reds).toBeGreaterThanOrEqual(DECK_SIZE / 5)
  })
  it('never shows two prompts with the same category or letter at once', () => {
    for (let d = 0; d < 60; d++) {
      const day = new Date(Date.UTC(2026, 9, 1 + d)).toISOString().slice(0, 10)
      const deck: Prompt[] = generateDeck(day)
      for (let i = 0; i + VISIBLE_PROMPTS <= deck.length; i++) {
        const w = deck.slice(i, i + VISIBLE_PROMPTS)
        expect(new Set(w.map((p) => p.categoryId)).size).toBe(VISIBLE_PROMPTS)
        expect(new Set(w.map((p) => p.letter)).size).toBe(VISIBLE_PROMPTS)
      }
    }
  })
  it('only deals letters that have answers', () => {
    for (const p of deck) {
      const cat = CATEGORIES.find((c) => c.id === p.categoryId)!
      expect(answersForLetter(cat, p.letter).length).toBeGreaterThanOrEqual(3)
    }
  })
  it('numbers puzzles from launch day', () => {
    expect(puzzleNumber('2026-09-30')).toBe(1)
    expect(puzzleNumber('2026-10-30')).toBe(31)
  })
})

describe('slice', () => {
  it('follows the board game placement rules', () => {
    let s = emptySlice()
    for (let i = 0; i < 5; i++) s = place(s, tri('green'))
    expect(slotFor(s, 'green')).toBe(-1)
    expect(slotFor(s, 'yellow')).toBe(1)
    s = place(s, tri('yellow'))
    s = place(s, tri('yellow'))
    s = place(s, tri('yellow'))
    expect(slotFor(s, 'yellow')).toBe(-1)
    expect(slotFor(s, 'red')).toBe(0)
    s = place(s, tri('red'))
    expect(isComplete(s)).toBe(true)
  })
  it('puts reds at the top first', () => {
    expect(slotFor(place(emptySlice(), tri('red')), 'red')).toBe(1)
  })
  it('scores difficulty, completion and time left', () => {
    let s = emptySlice()
    for (let i = 0; i < 9; i++) s = place(s, tri('red'))
    expect(score(s, 40).total).toBe(9 * 30 + 50 + 40)
    expect(score(place(emptySlice(), tri('green')), 40).total).toBe(10)
    expect(MAX_SCORE).toBe(470)
  })
})
