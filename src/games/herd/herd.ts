import { PROMPTS, type Prompt } from './prompts'

/**
 * Herd Mentality, daily: one prompt a day, everyone answers once, and at 11pm the
 * answers are revealed. Match the most popular answer and you're in the herd; give
 * an answer nobody else did and you're the pink cow.
 *
 * The game needs a crowd, so for now the crowd is an AI herd: a few dozen players
 * per day, each picking from the prompt's answers in proportion to how often real
 * people give them. Everything is seeded by the day, so every device sees the same
 * herd and the same result.
 */

/** Puzzle #1. */
export const LAUNCH_DAY = '2026-11-14'
/** Results come out at 11pm local time, on the prompt's own day. */
export const REVEAL_HOUR = 23

// ─── Days ───────────────────────────────────────────────────────────────

export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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

/** `?day=YYYY-MM-DD` for a past prompt; anything else (bad, future, pre-launch) means today. */
export function requestedDay(search: string, today: string): string | null {
  const day = new URLSearchParams(search).get('day')
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  return day >= LAUNCH_DAY && day < today ? day : null
}

export function revealAt(day: string): Date {
  return dayDate(day, REVEAL_HOUR)
}

export function isRevealed(day: string, now = new Date()): boolean {
  return now >= revealAt(day)
}

// ─── Randomness ─────────────────────────────────────────────────────────

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** mulberry32: small, fast, and the same on every device. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A fixed shuffle of every prompt, so days run through them all before any repeats. */
const ORDER: number[] = (() => {
  const rand = rng(hash('herd-order'))
  const order = PROMPTS.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j]!, order[i]!]
  }
  return order
})()

export function promptForDay(day: string): Prompt {
  const n = puzzleNumber(day) - 1
  return PROMPTS[ORDER[((n % ORDER.length) + ORDER.length) % ORDER.length]!]!
}

// ─── Matching answers ───────────────────────────────────────────────────

/** Lowercase, no accents or punctuation, no leading "the/a/an", no plural s. */
export function normalise(input: string): string {
  let s = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^(the|a|an) /, '')
  if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1)
  return s
}

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j]!
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = up
    }
  }
  return prev[b.length]!
}

/** Which of the prompt's answers this input means, or -1 if it's none of them. */
export function matchAnswer(prompt: Prompt, input: string): number {
  const n = normalise(input)
  if (!n) return -1
  const squash = (s: string) => s.replace(/ /g, '')
  for (const [i, a] of prompt.answers.entries()) {
    for (const form of [a.text, ...a.aliases]) {
      const f = normalise(form)
      if (f === n || squash(f) === squash(n)) return i
    }
  }
  // Small typos, but only on words long enough that a slip isn't a different word.
  const allowed = n.length >= 9 ? 2 : n.length >= 5 ? 1 : 0
  if (allowed === 0) return -1
  for (const [i, a] of prompt.answers.entries()) {
    for (const form of [a.text, ...a.aliases]) {
      if (editDistance(normalise(form), n) <= allowed) return i
    }
  }
  return -1
}

// ─── The AI herd ────────────────────────────────────────────────────────

const COW_NAMES = [
  'Daisy', 'Buttercup', 'Clover', 'Bluebell', 'Moomin', 'Bessie', 'Ermintrude', 'Pat', 'Dolly', 'Rosie',
  'Mabel', 'Bramble', 'Hazel', 'Pickle', 'Toffee', 'Biscuit', 'Nutmeg', 'Marmalade', 'Crumpet', 'Dumpling',
  'Moolinda', 'Moozart', 'Cowabunga', 'Udderly', 'Hay-ley', 'Moodonna', 'Cud-Elle', 'Sir Loin', 'Brisket', 'Gerald',
  'Pudding', 'Waffles', 'Pancake', 'Muffin', 'Fudge', 'Truffle', 'Pepper', 'Ginger', 'Clementine', 'Poppy',
  'Willow', 'Maple', 'Barley', 'Oats', 'Bean', 'Sprout', 'Turnip', 'Parsnip', 'Moo Lan', 'Steak Out',
] as const

export interface HerdPlayer {
  name: string
  /** Index into the prompt's answers. */
  answer: number
}

/** The day's AI players and what each answered. */
export function aiHerd(day: string): HerdPlayer[] {
  const prompt = promptForDay(day)
  const rand = rng(hash(`herd:${day}`))
  const count = 28 + Math.floor(rand() * 25)
  const total = prompt.answers.reduce((sum, a) => sum + a.weight, 0)
  const names = [...COW_NAMES]
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[names[i], names[j]] = [names[j]!, names[i]!]
  }
  return Array.from({ length: count }, (_, k) => {
    let pick = rand() * total
    let answer = 0
    while (answer < prompt.answers.length - 1 && pick >= prompt.answers[answer]!.weight) {
      pick -= prompt.answers[answer]!.weight
      answer++
    }
    return { name: names[k % names.length]! + (k >= names.length ? ` ${Math.floor(k / names.length) + 1}` : ''), answer }
  })
}

/**
 * How many players have answered by `now`. The AI herd trickles in through the day
 * (quickest early on, from midnight to the 11pm reveal), so the counter in the corner
 * moves; everyone's in by the reveal. Your own answer counts the moment it's locked in.
 */
export function answeredCount(day: string, now: Date, youAnswered: boolean): number {
  const herd = aiHerd(day).length
  const start = dayDate(day, 0).getTime()
  const end = revealAt(day).getTime()
  const progress = Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)))
  return Math.round(herd * Math.sqrt(progress)) + (youAnswered ? 1 : 0)
}

// ─── Results ────────────────────────────────────────────────────────────

export interface Group {
  text: string
  count: number
  /** Your answer is in this group. */
  you: boolean
  /** Who said it, AI players only. */
  names: string[]
}

export type Outcome = 'herd' | 'pink' | 'between'

export interface Results {
  prompt: Prompt
  players: number
  /** Every answer given, most popular first. */
  groups: Group[]
  herd: Group[]
  /** The rarest answers: said by exactly one player (or the least, if none were unique). */
  pink: Group[]
  /** Only when you answered. */
  outcome: Outcome | null
  yourGroup: Group | null
}

export function results(day: string, yourAnswer: string | null): Results {
  const prompt = promptForDay(day)
  const herd = aiHerd(day)
  const groups = new Map<string, Group>()
  const groupFor = (key: string, text: string) => {
    let g = groups.get(key)
    if (!g) groups.set(key, (g = { text, count: 0, you: false, names: [] }))
    return g
  }
  for (const p of herd) {
    const g = groupFor(`#${p.answer}`, prompt.answers[p.answer]!.text)
    g.count++
    g.names.push(p.name)
  }
  let yourGroup: Group | null = null
  if (yourAnswer && yourAnswer.trim()) {
    const i = matchAnswer(prompt, yourAnswer)
    yourGroup = i >= 0 ? groupFor(`#${i}`, prompt.answers[i]!.text) : groupFor(`=${normalise(yourAnswer)}`, yourAnswer.trim())
    yourGroup.count++
    yourGroup.you = true
  }

  const sorted = [...groups.values()].sort((a, b) => b.count - a.count || Number(b.you) - Number(a.you) || a.text.localeCompare(b.text))
  const top = sorted[0]!.count
  const least = sorted[sorted.length - 1]!.count
  const pinkCount = sorted.some((g) => g.count === 1) ? 1 : least
  const pink = sorted.filter((g) => g.count === pinkCount && g.count < top)

  let outcome: Outcome | null = null
  if (yourGroup) outcome = yourGroup.count === top ? 'herd' : yourGroup.count === 1 ? 'pink' : 'between'

  return {
    prompt,
    players: herd.length + (yourGroup ? 1 : 0),
    groups: sorted,
    herd: sorted.filter((g) => g.count === top),
    pink,
    outcome,
    yourGroup,
  }
}

// ─── Your answers ───────────────────────────────────────────────────────

export interface Entry {
  answer: string
  /** When it was locked in. */
  at: number
}

const STORE = 'herd:answers'

function readAll(): Record<string, Entry> {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '{}') as Record<string, Entry>
  } catch {
    return {}
  }
}

export function entryFor(day: string): Entry | null {
  return readAll()[day] ?? null
}

/** Lock in an answer. One per day: a second call for the same day changes nothing. */
export function submit(day: string, answer: string, now = new Date()): Entry {
  const all = readAll()
  if (all[day]) return all[day]!
  const entry = { answer: answer.trim().slice(0, 60), at: now.getTime() }
  all[day] = entry
  try {
    localStorage.setItem(STORE, JSON.stringify(all))
  } catch {
    // Storage blocked: the answer holds for this visit only.
  }
  return entry
}

/** Answered before that day's reveal - the only answers that build a streak. */
export function onTime(day: string, entry: Entry): boolean {
  return entry.at < revealAt(day).getTime()
}
