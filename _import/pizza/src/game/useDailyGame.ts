import { useCallback, useEffect, useMemo, useState } from 'react'
import { TIMER_ENABLED } from '../config'
import { load, save } from '../lib/storage'
import { generateDeck, VISIBLE_PROMPTS } from './daily'
import { emptySlice, isComplete, place, ROUND_SECONDS, SKIP_PENALTY_SECONDS, slotFor } from './slice'
import type { Prompt, Slice } from './types'
import { matchAnswer } from './validate'

export interface GameState {
  dayKey: string
  startedAt: number | null
  /** Deck indexes of the prompts on the table; -1 once the deck runs dry. */
  visible: number[]
  nextCard: number
  slice: Slice
  used: string[]
  penalty: number
  finished: boolean
  secondsLeftAtFinish: number
  /** 0 for the day's puzzle; replays get a fresh deal. */
  round: number
}

export type SubmitResult =
  | { ok: true; prompt: Prompt; answer: string }
  | { ok: false; reason: 'used' | 'nope' | 'empty' }

const DIFFICULTY_RANK = { red: 0, yellow: 1, green: 2 } as const

function freshState(dayKey: string, round = 0): GameState {
  return {
    dayKey,
    round,
    startedAt: null,
    visible: Array.from({ length: VISIBLE_PROMPTS }, (_, i) => i),
    nextCard: VISIBLE_PROMPTS,
    slice: emptySlice(),
    used: [],
    penalty: 0,
    finished: false,
    secondsLeftAtFinish: 0,
  }
}

function secondsLeft(s: GameState, now: number): number {
  if (!TIMER_ENABLED) return 0
  if (s.finished) return s.secondsLeftAtFinish
  if (s.startedAt === null) return ROUND_SECONDS
  return Math.max(0, ROUND_SECONDS - (now - s.startedAt) / 1000 - s.penalty)
}

function finish(s: GameState, now: number): GameState {
  return { ...s, finished: true, secondsLeftAtFinish: Math.floor(secondsLeft(s, now)) }
}

/** Ends the game if the slice is full or nothing left on the table can fit. */
function settle(s: GameState, deck: Prompt[], now: number): GameState {
  if (isComplete(s.slice)) return finish(s, now)
  const playable = s.visible.some((i) => i >= 0 && slotFor(s.slice, deck[i].difficulty) !== -1)
  const deckLeft = s.nextCard < deck.length
  if (!playable && !deckLeft) return finish(s, now)
  return s
}

/** Replaces the card at `pos` with the next one from the pile. */
function drawInto(s: GameState, pos: number, deckLength: number): Pick<GameState, 'visible' | 'nextCard'> {
  const visible = [...s.visible]
  const hasCard = s.nextCard < deckLength
  visible[pos] = hasCard ? s.nextCard : -1
  return { visible, nextCard: hasCard ? s.nextCard + 1 : s.nextCard }
}

export function useDailyGame(dayKey: string) {
  const storageKey = `pfp:game:${dayKey}`
  const [state, setState] = useState<GameState>(() => ({ ...freshState(dayKey), ...load<Partial<GameState>>(storageKey, {}) }))
  const round = state.round
  const deck = useMemo(() => generateDeck(round ? `${dayKey}~${round}` : dayKey), [dayKey, round])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => save(storageKey, state), [storageKey, state])

  // The clock keeps running from `startedAt`, so reloading the page doesn't pause it.
  useEffect(() => {
    if (!TIMER_ENABLED || state.startedAt === null || state.finished) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      setState((s) => (!s.finished && secondsLeft(s, t) <= 0 ? finish(s, t) : s))
    }, 200)
    return () => clearInterval(id)
  }, [state.startedAt, state.finished])

  const timeLeft = secondsLeft(state, now)

  const start = useCallback(() => {
    setState((s) => (s.startedAt === null ? { ...s, startedAt: Date.now() } : s))
    setNow(Date.now())
  }, [])

  const submit = useCallback(
    (input: string): SubmitResult => {
      const s = state
      if (s.finished || s.startedAt === null) return { ok: false, reason: 'empty' }
      if (!input.trim()) return { ok: false, reason: 'empty' }

      // Like shouting in the real game: the answer counts for whichever card it fits.
      // If it fits several, take the hardest (highest scoring) one.
      const order = s.visible
        .map((deckIndex, pos) => ({ deckIndex, pos }))
        .filter(({ deckIndex }) => deckIndex >= 0 && slotFor(s.slice, deck[deckIndex].difficulty) !== -1)
        .sort((a, b) => DIFFICULTY_RANK[deck[a.deckIndex].difficulty] - DIFFICULTY_RANK[deck[b.deckIndex].difficulty])

      let sawUsed = false
      for (const { deckIndex, pos } of order) {
        const prompt = deck[deckIndex]
        const answer = matchAnswer(prompt.categoryId, prompt.letter, input)
        if (!answer) continue
        const usedKey = `${prompt.categoryId}:${answer}`
        if (s.used.includes(usedKey)) {
          sawUsed = true
          continue
        }
        const t = Date.now()
        const at = Math.round((t - s.startedAt) / 1000)
        const next: GameState = {
          ...s,
          ...drawInto(s, pos, deck.length),
          slice: place(s.slice, { prompt, answer, at }),
          used: [...s.used, usedKey],
        }
        setState(settle(next, deck, t))
        return { ok: true, prompt, answer }
      }
      return { ok: false, reason: sawUsed ? 'used' : 'nope' }
    },
    [state, deck],
  )

  const skip = useCallback(
    (pos: number) => {
      setState((s) => {
        if (s.finished || s.startedAt === null || s.visible[pos] < 0) return s
        return settle({ ...s, ...drawInto(s, pos, deck.length), penalty: s.penalty + (TIMER_ENABLED ? SKIP_PENALTY_SECONDS : 0) }, deck, Date.now())
      })
    },
    [deck],
  )

  /** Ends the game now with whatever is in the slice. */
  const end = useCallback(() => setState((s) => (s.finished || s.startedAt === null ? s : finish(s, Date.now()))), [])

  /** Starts a new game straight away with a fresh deal. */
  const playAgain = useCallback(() => setState((s) => ({ ...freshState(dayKey, s.round + 1), startedAt: Date.now() })), [dayKey])

  const visiblePrompts = state.visible.map((i) => (i >= 0 ? deck[i] : null))

  return { state, deck, visiblePrompts, timeLeft, start, submit, skip, end, playAgain }
}
