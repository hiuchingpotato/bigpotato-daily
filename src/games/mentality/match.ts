import { editDistance, normalise } from '../herd/herd'
import type { Prompt } from '../herd/prompts'

/**
 * Matching what a player typed to one of a question's answers, forgivingly:
 *
 * - case, accents, punctuation, "the/a/an" and a plural s don't matter (normalise);
 * - the question's own words don't count: "caesar salad" for "Name a type of salad."
 *   is "Caesar", and "king charles" for "Name a famous Charles." is "King Charles";
 * - an answer said with extra words still counts: "Charles Dickens the author";
 * - small typos are forgiven on longer words, and bigger near-misses are offered back
 *   as "Do you mean …?" rather than counted.
 */

/** Words that only pad an answer out. */
const FILLER = new Set(['a', 'an', 'the', 'some', 'my', 'your', 'type', 'kind', 'sort', 'brand', 'make'])

const singular = (w: string) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w)

function words(s: string): string[] {
  return normalise(s).split(' ').filter(Boolean).map(singular)
}

/** The question's own words, which say nothing in an answer. */
function questionWords(prompt: Prompt): Set<string> {
  return new Set(words(prompt.question))
}

/** A phrase both whole and with the question's words and padding taken out, e.g. "caesar salad" → ["caesar salad", "caesar"]. */
function forms(phrase: string, skip: Set<string>): string[] {
  const all = words(phrase)
  const kept = all.filter((w) => !skip.has(w) && !FILLER.has(w))
  const out = [all.join(' ')]
  if (kept.length && kept.length < all.length) out.push(kept.join(' '))
  return out.filter(Boolean)
}

const squash = (s: string) => s.replace(/ /g, '')

/** How many typos a phrase this long can carry and still be what you meant. */
const forgiven = (n: string) => (n.length >= 9 ? 2 : n.length >= 5 ? 1 : 0)
/** A looser reach for "Do you mean …?". */
const nearby = (n: string) => (n.length >= 9 ? 3 : n.length >= 4 ? 2 : 0)

export interface Match {
  /** Which answer, or -1 for none. */
  index: number
  /** Exactly one of its forms (after tidying), rather than a near-miss. */
  exact: boolean
}

export function matchInput(prompt: Prompt, input: string): Match {
  const skip = questionWords(prompt)
  const typed = forms(input, skip)
  if (!typed.length) return { index: -1, exact: false }
  const answers = prompt.answers.map((a) => [a.text, ...a.aliases].flatMap((f) => forms(f, skip)))

  // 1. Exactly an answer, with or without the question's words or spaces.
  for (const [i, fs] of answers.entries()) {
    for (const f of fs) if (typed.some((t) => t === f || squash(t) === squash(f))) return { index: i, exact: true }
  }

  // 2. An answer, with extra words around it ("charles dickens the author"). Longest answer wins.
  let best = { index: -1, len: 0 }
  for (const [i, fs] of answers.entries()) {
    for (const f of fs) {
      if (f.length < 3 || f.length <= best.len) continue
      if (typed.some((t) => ` ${t} `.includes(` ${f} `))) best = { index: i, len: f.length }
    }
  }
  if (best.index >= 0) return { index: best.index, exact: true }

  // 3. A small typo.
  const near = closest(answers, typed, forgiven)
  return near >= 0 ? { index: near, exact: false } : { index: -1, exact: false }
}

function closest(answers: string[][], typed: string[], reach: (n: string) => number): number {
  let best = { index: -1, d: Infinity }
  for (const [i, fs] of answers.entries()) {
    for (const f of fs) {
      for (const t of typed) {
        const allowed = Math.min(reach(t), reach(f))
        if (allowed === 0) continue
        const d = Math.min(editDistance(f, t), editDistance(squash(f), squash(t)))
        if (d <= allowed && d < best.d) best = { index: i, d }
      }
    }
  }
  return best.index
}

/**
 * "Do you mean …?" for what's typed so far: the answer it's a near-miss of, or null
 * if it's already spot on or isn't close to anything. Only ever suggests a whole
 * answer you've nearly typed, so it can't be used to fish for the list.
 */
export function suggestion(prompt: Prompt, input: string): string | null {
  if (normalise(input).length < 4) return null
  const m = matchInput(prompt, input)
  if (m.exact) return null
  if (m.index >= 0) return prompt.answers[m.index]!.text
  const skip = questionWords(prompt)
  const typed = forms(input, skip)
  const answers = prompt.answers.map((a) => [a.text, ...a.aliases].flatMap((f) => forms(f, skip)))
  const i = closest(answers, typed, nearby)
  return i >= 0 ? prompt.answers[i]!.text : null
}
