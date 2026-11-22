import { dayKey, hash, matchAnswer, promptForDay as vsWorldPrompt, rng } from '../herd/herd'
import { PROMPTS, type Prompt } from '../herd/prompts'

/**
 * Herd Mentality, daily: six questions, 45 seconds each, and the aim is to say what
 * most people would say. It's Krillion turned round: Krillion rewards the rarest
 * answer, this rewards the most common one.
 *
 * Scoring. Every question has a list of answers with how often a crowd gives each
 * (the same data as Herd vs The world). An answer's share is its slice of that crowd,
 * with a little held back for "something else". Each round scores your answer's share,
 * as points out of 100:
 *
 *   - Herd: the top answer, or within HERD_MARGIN points of it.    → a cow joins you
 *   - Pink cow: an answer under PINK_BELOW %, or one not on the list. → a pink cow joins
 *   - More or less: anything in between.                            → nobody notices
 *   - Out of time with nothing typed: no points.
 *
 * Your total is ranked against a simulated crowd playing the same six questions, which
 * gives the percentile curve on the results screen. Everything is seeded by the day, so
 * every device gets the same questions and the same crowd.
 */

/** Puzzle #1. */
export const LAUNCH_DAY = '2026-11-22'
export const ROUNDS = 6
export const SECONDS = 45
/** Share of a crowd, in %, who'd say something that isn't on the list. */
export const OTHER_SHARE = 4
/** Within this many points of the top answer still counts as the herd (near ties). */
export const HERD_MARGIN = 5
/** Under this share, in %, an answer is too niche: pink cow. */
export const PINK_BELOW = 3

// ─── Days ───────────────────────────────────────────────────────────────

export { dayKey }

function dayDate(day: string, hour = 12): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y!, m! - 1, d!, hour)
}

export function puzzleNumber(day: string): number {
  return Math.round((dayDate(day).getTime() - dayDate(LAUNCH_DAY).getTime()) / 86_400_000) + 1
}

/** Every day from launch up to and including `today`. */
export function daysSinceLaunch(today: string): string[] {
  const out: string[] = []
  for (let d = dayDate(LAUNCH_DAY); dayKey(d) <= today; d.setDate(d.getDate() + 1)) out.push(dayKey(d))
  return out
}

/** `?day=YYYY-MM-DD` for a past game; anything else (bad, future, pre-launch) means today. */
export function requestedDay(search: string, today: string): string | null {
  const day = new URLSearchParams(search).get('day')
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  return day >= LAUNCH_DAY && day < today ? day : null
}

// ─── Questions ──────────────────────────────────────────────────────────

/** Its own fixed shuffle of the prompts, so days run through them all before repeating. */
const ORDER: number[] = (() => {
  const rand = rng(hash('herd-mentality-order'))
  const order = PROMPTS.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j]!, order[i]!]
  }
  return order
})()

/** The day's six questions, never including that day's Herd vs The world question. */
export function questionsForDay(day: string): Prompt[] {
  const skip = vsWorldPrompt(day).id
  const out: Prompt[] = []
  for (let i = (puzzleNumber(day) - 1) * ROUNDS; out.length < ROUNDS; i++) {
    const p = PROMPTS[ORDER[((i % ORDER.length) + ORDER.length) % ORDER.length]!]!
    if (p.id !== skip) out.push(p)
  }
  return out
}

// ─── Scoring ────────────────────────────────────────────────────────────

/** Each answer's share of the crowd, in %, in the prompt's order. */
export function shares(prompt: Prompt): number[] {
  const total = prompt.answers.reduce((sum, a) => sum + a.weight, 0)
  return prompt.answers.map((a) => (a.weight / total) * (100 - OTHER_SHARE))
}

export type Outcome = 'herd' | 'meh' | 'pink' | 'timeout'

export interface Round {
  prompt: Prompt
  /** What you typed, or null if the time ran out with nothing typed. */
  input: string | null
  /** Which answer it matched, or -1. */
  match: number
  /** Share of the crowd who said the same, in %. */
  share: number
  points: number
  outcome: Outcome
  /** The crowd's favourite. */
  top: { text: string; share: number }
}

export function scoreRound(prompt: Prompt, input: string | null): Round {
  const s = shares(prompt)
  const topShare = Math.max(...s)
  const topAt = s.indexOf(topShare)
  const top = { text: prompt.answers[topAt]!.text, share: topShare }
  const typed = input?.trim() || null
  if (!typed) return { prompt, input: null, match: -1, share: 0, points: 0, outcome: 'timeout', top }

  const match = matchAnswer(prompt, typed)
  const share = match < 0 ? 0 : s[match]!
  const outcome: Outcome = match < 0 || share < PINK_BELOW ? 'pink' : share >= topShare - HERD_MARGIN ? 'herd' : 'meh'
  return { prompt, input: typed, match, share, points: Math.round(share), outcome, top }
}

/** The most a perfect herd could score today: the top answer every round. */
export function maxScore(questions: Prompt[]): number {
  return questions.reduce((sum, q) => sum + Math.round(Math.max(...shares(q))), 0)
}

// ─── The crowd ──────────────────────────────────────────────────────────

export const CROWD = 1000

/**
 * Totals for a simulated crowd playing the day's questions: each player picks an
 * answer in proportion to its share (or something else, or runs out of time), so the
 * crowd lands where real players would. Sorted low to high.
 */
export function crowdScores(day: string, questions = questionsForDay(day)): number[] {
  const rand = rng(hash(`herd-mentality-crowd:${day}`))
  const all = questions.map(shares)
  const out: number[] = []
  for (let p = 0; p < CROWD; p++) {
    let total = 0
    for (const s of all) {
      // About 1 in 25 answers is a time-out.
      if (rand() < 0.04) continue
      let pick = rand() * 100
      for (const share of s) {
        if (pick < share) {
          total += Math.round(share)
          break
        }
        pick -= share
      }
    }
    out.push(total)
  }
  return out.sort((a, b) => a - b)
}

/** The share of the crowd you beat, 0-100 (ties count half). */
export function percentile(score: number, crowd: number[]): number {
  if (crowd.length === 0) return 50
  let below = 0
  let same = 0
  for (const c of crowd) {
    if (c < score) below++
    else if (c === score) same++
  }
  return Math.round(((below + same / 2) / crowd.length) * 100)
}

/** The crowd as a smooth-ish curve: `bins` counts across 0..max. */
export function histogram(crowd: number[], max: number, bins = 24): number[] {
  const counts = new Array<number>(bins).fill(0)
  for (const c of crowd) counts[Math.min(bins - 1, Math.floor((c / Math.max(1, max)) * bins))]!++
  // A light blur so it reads as a curve rather than a bar chart.
  return counts.map((_, i) => ((counts[i - 1] ?? 0) + 2 * counts[i]! + (counts[i + 1] ?? 0)) / 4)
}

// ─── Your games ─────────────────────────────────────────────────────────

const KEY = 'herd-mentality:days'

export interface Saved {
  /** One per finished round, in order; null for a time-out. */
  answers: (string | null)[]
  /** The day you finished it, so a catch-up game doesn't count towards the streak. */
  finishedOn: string | null
}

function readAll(): Record<string, Saved> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, Saved>) : {}
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Saved>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // Private mode or storage full: the game still plays, it just won't remember.
  }
}

export function savedFor(day: string): Saved | null {
  return readAll()[day] ?? null
}

/** Record one round's answer. Returns the day's game so far. */
export function saveAnswer(day: string, answer: string | null, now = new Date()): Saved {
  const all = readAll()
  const s = all[day] ?? { answers: [], finishedOn: null }
  if (s.answers.length < ROUNDS) s.answers.push(answer?.trim() || null)
  if (s.answers.length === ROUNDS && !s.finishedOn) s.finishedOn = dayKey(now)
  all[day] = s
  writeAll(all)
  return s
}

export function allSaved(): Record<string, Saved> {
  return readAll()
}

export function roundsFor(day: string, saved: Saved): Round[] {
  const qs = questionsForDay(day)
  return saved.answers.map((a, i) => scoreRound(qs[i]!, a))
}

export const OUTCOME_EMOJI: Record<Outcome, string> = { herd: '🐄', meh: '🌾', pink: '🩷', timeout: '⏰' }

export function shareText(day: string, rounds: Round[], score: number, beat: number): string {
  return `🐄 Herd Mentality #${puzzleNumber(day)}\n${rounds.map((r) => OUTCOME_EMOJI[r.outcome]).join('')}\n${score} pts · beat ${beat}% of the herd`
}
