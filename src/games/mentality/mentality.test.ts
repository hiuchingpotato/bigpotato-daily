import { beforeEach, describe, expect, it } from 'vitest'
import { promptForDay } from '../herd/herd'
import { PROMPTS } from '../herd/prompts'
import {
  crowdScores,
  histogram,
  LAUNCH_DAY,
  maxScore,
  OTHER_SHARE,
  percentile,
  puzzleNumber,
  questionsForDay,
  ROUNDS,
  roundsFor,
  saveAnswer,
  savedFor,
  scoreRound,
  shares,
  shareText,
} from './mentality'

const byQuestion = (q: string) => PROMPTS.find((p) => p.question === q)!

describe('questions', () => {
  it('gives six different questions a day, the same every time', () => {
    const qs = questionsForDay('2026-11-25')
    expect(qs).toHaveLength(ROUNDS)
    expect(new Set(qs.map((q) => q.id)).size).toBe(ROUNDS)
    expect(questionsForDay('2026-11-25').map((q) => q.id)).toEqual(qs.map((q) => q.id))
  })

  it('never repeats Herd vs The world’s question for the same day', () => {
    for (let d = 0; d < 60; d++) {
      const day = new Date(2026, 10, 22 + d, 12)
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
      expect(questionsForDay(key).map((q) => q.id)).not.toContain(promptForDay(key).id)
    }
  })

  it('runs consecutive days through different questions', () => {
    const a = questionsForDay('2026-11-22').map((q) => q.id)
    const b = questionsForDay('2026-11-23').map((q) => q.id)
    expect(a.filter((id) => b.includes(id))).toHaveLength(0)
    expect(puzzleNumber(LAUNCH_DAY)).toBe(1)
  })
})

describe('scoring', () => {
  const river = byQuestion('Name a famous river.')

  it('shares add up to the crowd minus "something else"', () => {
    const total = shares(river).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(100 - OTHER_SHARE)
  })

  it('the top answer is the herd, with typos and aliases forgiven', () => {
    expect(scoreRound(river, 'Thames').outcome).toBe('herd')
    expect(scoreRound(river, 'the river thames').outcome).toBe('herd')
    expect(scoreRound(river, 'Thames').points).toBeGreaterThan(25)
  })

  it('a popular-but-not-top answer is more or less', () => {
    const r = scoreRound(river, 'Amazon')
    expect(r.outcome).toBe('meh')
    expect(r.points).toBeGreaterThan(0)
    expect(r.top.text).toBe('Thames')
  })

  it('a rare or unlisted answer is a pink cow', () => {
    expect(scoreRound(river, 'Ganges').outcome).toBe('pink')
    const none = scoreRound(river, 'Zambezi')
    expect(none.outcome).toBe('pink')
    expect(none.points).toBe(0)
  })

  it('a near tie with the top answer is still the herd', () => {
    const toast = byQuestion('Name a famous Beatle.')
    expect(scoreRound(toast, 'Lennon').outcome).toBe('herd')
    expect(scoreRound(toast, 'Ringo').outcome).toBe('meh')
  })

  it('nothing typed is a time-out', () => {
    expect(scoreRound(river, null).outcome).toBe('timeout')
    expect(scoreRound(river, '   ').outcome).toBe('timeout')
  })
})

describe('the crowd', () => {
  const day = '2026-11-22'
  const crowd = crowdScores(day)

  it('is the same crowd on every device', () => {
    expect(crowdScores(day)).toEqual(crowd)
  })

  it('scores below a perfect herd, and a perfect herd beats nearly everyone', () => {
    const max = maxScore(questionsForDay(day))
    expect(crowd.at(-1)).toBeLessThanOrEqual(max)
    expect(percentile(max, crowd)).toBeGreaterThanOrEqual(95)
    expect(percentile(0, crowd)).toBeLessThanOrEqual(2)
  })

  it('draws a curve with one value per bin', () => {
    expect(histogram(crowd, maxScore(questionsForDay(day)), 20)).toHaveLength(20)
  })
})

describe('saving', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage
  })

  it('records each round and marks the game finished after six', () => {
    const day = '2026-11-22'
    const at = new Date(2026, 10, 22, 20)
    for (let i = 0; i < ROUNDS - 1; i++) saveAnswer(day, i === 2 ? null : 'Thames', at)
    expect(savedFor(day)!.finishedOn).toBeNull()
    const s = saveAnswer(day, 'last', at)
    expect(s.answers).toHaveLength(ROUNDS)
    expect(s.answers[2]).toBeNull()
    expect(s.finishedOn).toBe(day)
    // Never more than six.
    expect(saveAnswer(day, 'extra', at).answers).toHaveLength(ROUNDS)

    const rounds = roundsFor(day, s)
    expect(rounds[2]!.outcome).toBe('timeout')
    expect(shareText(day, rounds, 100, 50)).toMatch(/^🐄 Herd Mentality #9\n.{6,}\n100 pts · beat 50% of the herd$/u)
  })
})
