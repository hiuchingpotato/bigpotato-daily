import { beforeEach, describe, expect, it } from 'vitest'
import {
  aiHerd,
  answeredCount,
  daysSinceLaunch,
  entryFor,
  LAUNCH_DAY,
  matchAnswer,
  normalise,
  promptForDay,
  puzzleNumber,
  requestedDay,
  results,
  revealAt,
  submit,
} from './herd'
import { PROMPTS } from './prompts'

describe('prompts', () => {
  it('has well over 200 in circulation, all well-formed', () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(213)
    const questions = new Set<string>()
    for (const p of PROMPTS) {
      expect(p.question.length).toBeGreaterThan(5)
      expect(p.answers.length).toBeGreaterThanOrEqual(2)
      for (const a of p.answers) {
        expect(a.text.length).toBeGreaterThan(0)
        expect(Number.isFinite(a.weight) && a.weight > 0).toBe(true)
      }
      questions.add(p.question)
    }
    expect(questions.size).toBe(PROMPTS.length)
  })

  it('no two answers to a prompt normalise to the same thing', () => {
    for (const p of PROMPTS) {
      const seen = new Set(p.answers.map((a) => normalise(a.text)))
      expect(seen.size, p.question).toBe(p.answers.length)
    }
  })
})

describe('days', () => {
  it('numbers puzzles from launch and runs through every prompt before repeating', () => {
    expect(puzzleNumber(LAUNCH_DAY)).toBe(1)
    const days = daysSinceLaunch('2027-08-01').slice(0, PROMPTS.length)
    expect(new Set(days.map((d) => promptForDay(d).id)).size).toBe(PROMPTS.length)
  })

  it('reveals at 11pm on the day', () => {
    expect(revealAt('2026-11-21').getHours()).toBe(23)
  })

  it('only accepts a real past day from the query string', () => {
    expect(requestedDay('?day=2026-11-15', '2026-11-21')).toBe('2026-11-15')
    expect(requestedDay('?day=2026-11-21', '2026-11-21')).toBeNull()
    expect(requestedDay('?day=2026-11-01', '2026-11-21')).toBeNull()
  })
})

describe('matching answers', () => {
  const river = PROMPTS.find((p) => p.question === 'Name a famous river.')!
  const thames = river.answers.findIndex((a) => a.text === 'Thames')

  it('forgives case, "the", plurals, aliases and small typos', () => {
    for (const input of ['Thames', 'the thames', 'THAMES', 'River Thames', 'Thamse', 'thames!']) {
      expect(matchAnswer(river, input), input).toBe(thames)
    }
  })

  it("doesn't stretch a short word into a different one", () => {
    expect(matchAnswer(river, 'Nile')).toBe(river.answers.findIndex((a) => a.text === 'Nile'))
    expect(matchAnswer(river, 'Tyne')).toBe(-1)
  })
})

describe('the AI herd', () => {
  it('is the same on every device, and changes by day', () => {
    expect(aiHerd('2026-11-20')).toEqual(aiHerd('2026-11-20'))
    expect(aiHerd('2026-11-20')).not.toEqual(aiHerd('2026-11-21'))
  })

  it('has a crowd worth playing against', () => {
    for (const day of daysSinceLaunch('2027-01-31')) {
      const n = aiHerd(day).length
      expect(n).toBeGreaterThanOrEqual(28)
      expect(n).toBeLessThanOrEqual(52)
    }
  })

  it('trickles in through the day and is all in by the reveal', () => {
    const day = '2026-11-21'
    const at = (h: number) => answeredCount(day, new Date(2026, 10, 21, h), false)
    expect(answeredCount(day, new Date(2026, 10, 21, 0), false)).toBe(0)
    expect(at(6)).toBeGreaterThan(0)
    expect(at(12)).toBeLessThan(at(20))
    expect(at(23)).toBe(aiHerd(day).length)
    expect(answeredCount(day, new Date(2026, 10, 21, 23), true)).toBe(aiHerd(day).length + 1)
  })
})

describe('results', () => {
  const day = '2026-11-20'

  it('puts the most popular answer in the herd', () => {
    const r = results(day, null)
    expect(r.herd[0]!.count).toBe(r.groups[0]!.count)
    expect(r.groups.length).toBeGreaterThan(1)
  })

  it('makes you the herd when you match the top answer', () => {
    const top = results(day, null).herd[0]!.text
    const r = results(day, top)
    expect(r.outcome).toBe('herd')
    expect(r.yourGroup!.you).toBe(true)
  })

  it('makes you the pink cow when nobody else said it', () => {
    const r = results(day, 'a purple sea serpent')
    expect(r.outcome).toBe('pink')
    expect(r.pink.some((g) => g.you)).toBe(true)
  })
})

describe('your answer', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    }
  })

  it('locks in once and never changes', () => {
    submit('2026-11-21', 'Thames')
    submit('2026-11-21', 'Nile')
    expect(entryFor('2026-11-21')!.answer).toBe('Thames')
  })
})
