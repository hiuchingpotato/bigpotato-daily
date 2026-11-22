import { beforeEach, describe, expect, it } from 'vitest'
import { normalise, promptForDay } from '../herd/herd'
import {
  band,
  crowdScores,
  histogram,
  LAUNCH_DAY,
  maxScore,
  OTHER_SHARE,
  percentile,
  PINK_BELOW,
  puzzleNumber,
  questionsForDay,
  ROUNDS,
  roundsFor,
  saveAnswer,
  savedFor,
  scoreRound,
  SHARED_PER_DAY,
  shares,
  shareText,
} from './mentality'
import { QUESTIONS } from './questions'

const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

describe('the question bank', () => {
  it('has plenty, mostly shared UK/US with a good share for the rest of the world', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(230)
    const shared = QUESTIONS.filter((q) => q.region === 'shared').length / QUESTIONS.length
    expect(shared).toBeGreaterThan(0.64)
    expect(shared).toBeLessThan(0.76)
  })

  it('is well-formed: unique questions, real weights, no answer listed twice', () => {
    const seen = new Set<string>()
    for (const q of QUESTIONS) {
      expect(seen.has(q.question), q.question).toBe(false)
      seen.add(q.question)
      expect(q.answers.length, q.question).toBeGreaterThanOrEqual(7)
      const forms = new Set<string>()
      for (const a of q.answers) {
        expect(Number.isFinite(a.weight) && a.weight > 0, `${q.question} ${a.text}`).toBe(true)
        for (const f of [a.text, ...a.aliases]) {
          const n = normalise(f)
          expect(forms.has(n), `${q.question}: ${f} twice`).toBe(false)
          forms.add(n)
        }
      }
    }
  })

  it('every listed answer scores as itself', () => {
    for (const q of QUESTIONS) {
      for (const [i, a] of q.answers.entries()) expect(scoreRound(q, a.text).match, `${q.question}: ${a.text}`).toBe(i)
    }
  })
})

describe('questions', () => {
  it('gives six different questions a day, four shared and two world, the same every time', () => {
    const qs = questionsForDay('2026-11-25')
    expect(qs).toHaveLength(ROUNDS)
    expect(new Set(qs.map((q) => q.id)).size).toBe(ROUNDS)
    expect(qs.filter((q) => q.region === 'shared')).toHaveLength(SHARED_PER_DAY)
    expect(questionsForDay('2026-11-25').map((q) => q.id)).toEqual(qs.map((q) => q.id))
  })

  it('never repeats Herd vs The world’s question for the same day', () => {
    for (let d = 0; d < 90; d++) {
      const key = keyOf(new Date(2026, 10, 14 + d, 12))
      const vs = promptForDay(key).question.toLowerCase()
      expect(questionsForDay(key).map((q) => q.question.toLowerCase())).not.toContain(vs)
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
  // A question with a clear top answer, a runner-up, a middling and a rare one.
  const q = QUESTIONS.find((x) => {
    const s = shares(x)
    const top = Math.max(...s)
    return s.some((v) => v < top && v >= top * 0.5) && s.some((v) => v < top * 0.5 && v >= PINK_BELOW) && s.some((v) => v < PINK_BELOW)
  })!
  const s = shares(q)
  const top = Math.max(...s)
  const text = (pred: (v: number) => boolean) => q.answers[s.findIndex(pred)]!.text

  it('shares add up to the crowd minus "something else"', () => {
    expect(s.reduce((a, b) => a + b, 0)).toBeCloseTo(100 - OTHER_SHARE)
  })

  it('the top answer is the herd, worth 100', () => {
    const r = scoreRound(q, text((v) => v === top))
    expect(r.outcome).toBe('herd')
    expect(r.points).toBe(100)
    expect(band(r)).toBe('top')
  })

  it('any answer at least half as popular as the top one is still the herd', () => {
    const r = scoreRound(q, text((v) => v < top && v >= top * 0.5))
    expect(r.outcome).toBe('herd')
    expect(band(r)).toBe('very')
    expect(r.points).toBeGreaterThanOrEqual(50)
  })

  it('a middling answer is more or less, a rare or unlisted one a pink cow', () => {
    expect(scoreRound(q, text((v) => v < top * 0.5 && v >= PINK_BELOW)).outcome).toBe('meh')
    expect(scoreRound(q, text((v) => v < PINK_BELOW)).outcome).toBe('pink')
    const none = scoreRound(q, 'zzqqxx nothing like it')
    expect(none.outcome).toBe('pink')
    expect(none.points).toBe(0)
    expect(band(none)).toBe('none')
  })

  it('nothing typed is a time-out', () => {
    expect(scoreRound(q, null).outcome).toBe('timeout')
    expect(scoreRound(q, '   ').outcome).toBe('timeout')
  })
})

describe('the crowd', () => {
  const day = '2026-11-22'
  const crowd = crowdScores(day)
  const max = maxScore(questionsForDay(day))

  it('is the same crowd on every device', () => {
    expect(crowdScores(day)).toEqual(crowd)
  })

  it('a perfect day is 600, beats nearly everyone; nothing beats nobody', () => {
    expect(max).toBe(600)
    expect(crowd.at(-1)).toBeLessThanOrEqual(max)
    expect(percentile(max, crowd)).toBeGreaterThanOrEqual(95)
    expect(percentile(0, crowd)).toBeLessThanOrEqual(2)
  })

  it('draws a curve with one value per bin', () => {
    expect(histogram(crowd, max, 20)).toHaveLength(20)
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
    for (let i = 0; i < ROUNDS - 1; i++) saveAnswer(day, i === 2 ? null : 'something', at)
    expect(savedFor(day)!.finishedOn).toBeNull()
    const saved = saveAnswer(day, 'last', at)
    expect(saved.answers).toHaveLength(ROUNDS)
    expect(saved.answers[2]).toBeNull()
    expect(saved.finishedOn).toBe(day)
    // Never more than six.
    expect(saveAnswer(day, 'extra', at).answers).toHaveLength(ROUNDS)

    const rounds = roundsFor(day, saved)
    expect(rounds[2]!.outcome).toBe('timeout')
    expect(shareText(day, rounds, 100, 50)).toMatch(/^🐄 Herd Mentality #9\n.{6,}\n100 pts · beat about 50% of the herd$/u)
  })
})
