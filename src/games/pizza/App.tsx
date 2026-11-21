import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Countdown } from './components/Countdown'
import { PizzaSlice } from './components/PizzaSlice'
import { PromptCard } from './components/PromptCard'
import { puzzleNumber, requestedDay, todayKey, yesterdayKey } from './game/daily'
import { share, shareText, sliceCode } from './game/share'
import { isComplete, POINTS, ROUND_SECONDS, score, SKIP_PENALTY_SECONDS, slotFor } from './game/slice'
import { TIMER_ENABLED, UNLIMITED_PLAYS } from './config'
import { useDailyGame } from './game/useDailyGame'
import { leaderboard } from './lib/leaderboard'
import { getPlayer, getStats, recordResult, setPlayerName, type Player } from './lib/storage'
import { Link } from '../../Link'
import './pizza.css'

export default function App() {
  // The day is fixed for the session, so a game started at 23:59 finishes as that day's game.
  // ?day= opens a past puzzle instead: same cards, but no leaderboard and no streak.
  const [today] = useState(() => todayKey())
  const [dayKey] = useState(() => requestedDay(window.location.search, today) ?? today)
  const isPast = dayKey !== today
  const puzzle = puzzleNumber(dayKey)
  const game = useDailyGame(dayKey)
  const [player, setPlayer] = useState<Player>(getPlayer)

  const { state } = game
  const screen = state.finished ? 'done' : state.startedAt === null ? 'intro' : 'play'

  return (
    <div className="app">
      <header className="topbar">
        <Link to="home" className="home-link" aria-label="All games">
          ‹
        </Link>
        <div className="brand">
          <span className="brand__p">P</span>
          <span className="brand__rest">for Pizza</span>
          <span className="brand__daily">
            <span className="brand__daily-word">Daily </span>#{puzzle}
          </span>
        </div>
      </header>

      {isPast && screen !== 'play' ? (
        <p className="past-flag">
          Past puzzle · {pastLabel(dayKey)} ·{' '}
          <Link to="pizza" className="past-flag__link">
            back to today
          </Link>
        </p>
      ) : null}

      {screen === 'intro' ? (
        <Intro player={player} isPast={isPast} onName={(n) => setPlayer(setPlayerName(n))} onStart={game.start} />
      ) : screen === 'play' ? (
        <Play game={game} />
      ) : (
        <Done game={game} dayKey={dayKey} isPast={isPast} puzzle={puzzle} player={player} onName={(n) => setPlayer(setPlayerName(n))} />
      )}
    </div>
  )
}

type Game = ReturnType<typeof useDailyGame>

function pastLabel(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function Intro({ player, isPast, onName, onStart }: { player: Player; isPast: boolean; onName: (n: string) => void; onStart: () => void }) {
  const [name, setName] = useState(player.name)
  const stats = getStats()
  return (
    <main className="screen intro">
      <PizzaSlice slice={Array(9).fill(null)} className="intro__slice" />
      <h1>{isPast ? 'Build that day’s biggest slice' : 'Build today’s biggest slice'}</h1>
      <ol className="rules">
        <li>
          Three cards are on the table. Each one pairs a <b>category</b> with a <b>letter</b>.
        </li>
        <li>
          Type anything that fits — <i>Animals + B</i> → <i>Badger</i>. It counts for whichever card it matches.
        </li>
        <li>
          Win the card and it goes into your slice.{' '}
          {TIMER_ENABLED ? (
            <>
              You’ve got <b>{Math.floor(ROUND_SECONDS / 60)}:{String(ROUND_SECONDS % 60).padStart(2, '0')}</b> to fill all nine.
            </>
          ) : (
            <>Fill all nine to finish.</>
          )}
        </li>
      </ol>
      <div className="legend">
        <div><span className="chip chip--green" /> Easy <b>+{POINTS.green}</b> · bottom row only</div>
        <div><span className="chip chip--yellow" /> Medium <b>+{POINTS.yellow}</b> · bottom or middle</div>
        <div><span className="chip chip--red" /> Hard <b>+{POINTS.red}</b> · anywhere, and the only way to top it off</div>
        <div className="legend__note">
          {TIMER_ENABLED
            ? `Finish the slice for a bonus plus a point for every second left. Skipping costs ${SKIP_PENALTY_SECONDS}s.`
            : 'Finish the slice for a bonus. Skipping a card is free.'}
        </div>
      </div>
      {isPast ? null : (
        <label className="field">
          <span>Your name on the leaderboard</span>
          <input
            value={name}
            maxLength={16}
            placeholder="e.g. Cheesy Pete"
            autoComplete="nickname"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onName(name)}
          />
        </label>
      )}
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => {
          onName(name)
          onStart()
        }}
      >
        {TIMER_ENABLED ? 'Start the clock' : 'Start'}
      </button>
      {stats.played > 0 ? (
        <p className="muted">
          Played {stats.played} · Best {stats.best} · Streak {stats.streak}
        </p>
      ) : null}
    </main>
  )
}

type Feedback = { kind: 'ok' | 'bad'; text: string; id: number } | null

function Play({ game }: { game: Game }) {
  const { state, visiblePrompts, timeLeft, submit, skip, end } = game
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [freshSlot, setFreshSlot] = useState<number | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)
  // The keyboard stays down until the player taps the answer box, so the first thing
  // they see is the cards. After that, keep it up between answers and skips.
  const typing = useRef(false)
  const prevSlice = useRef(state.slice)

  useEffect(() => {
    const idx = state.slice.findIndex((t, i) => t && !prevSlice.current[i])
    if (idx >= 0) setFreshSlot(idx)
    prevSlice.current = state.slice
  }, [state.slice])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = submit(value)
    if (result.ok) {
      setFeedback({ kind: 'ok', text: `${result.answer} ✓ ${result.prompt.categoryName} +${POINTS[result.prompt.difficulty]}`, id: Date.now() })
      setValue('')
    } else if (result.reason === 'used') {
      setFeedback({ kind: 'bad', text: 'Already used that one', id: Date.now() })
    } else if (result.reason === 'nope') {
      setFeedback({ kind: 'bad', text: 'Doesn’t fit any card', id: Date.now() })
    }
    inputRef.current?.focus()
  }

  const pct = (timeLeft / ROUND_SECONDS) * 100
  const secs = Math.ceil(timeLeft)
  const current = score(state.slice, timeLeft)

  return (
    <main className="screen play">
      {TIMER_ENABLED ? (
        <div className="timer" role="timer" aria-label={`${secs} seconds left`}>
          <div className={`timer__bar ${timeLeft < 20 ? 'timer__bar--low' : ''}`} style={{ width: `${pct}%` }} />
          <span className="timer__text">
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </span>
          <span className="timer__score">{current.triangles} pts</span>
        </div>
      ) : (
        <div className="scorebar">
          <span>{current.triangles} pts</span>
          <span className="scorebar__count">{state.slice.filter(Boolean).length}/9</span>
          <button type="button" className="icon-btn" onClick={end}>
            Finish
          </button>
        </div>
      )}

      <PizzaSlice slice={state.slice} fresh={freshSlot} className="play__slice" />

      <div className="prompts">
        {visiblePrompts.map((p, pos) => (
          <PromptCard
            key={p ? p.id : `empty-${pos}`}
            prompt={p}
            noRoom={p ? slotFor(state.slice, p.difficulty) === -1 : false}
            onSkip={() => {
              skip(pos)
              if (typing.current) inputRef.current?.focus()
            }}
          />
        ))}
      </div>

      <form className="answer" onSubmit={onSubmit}>
        <div key={feedback?.id} className={`answer__feedback ${feedback ? `answer__feedback--${feedback.kind}` : ''}`} aria-live="polite">
          {feedback?.text ?? ' '}
        </div>
        <div className="answer__row">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type an answer…"
            onFocus={() => (typing.current = true)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-label="Your answer"
          />
          <button type="submit" className="btn btn--primary">Go</button>
        </div>
      </form>
    </main>
  )
}

function Done({ game, dayKey, isPast, puzzle, player, onName }: { game: Game; dayKey: string; isPast: boolean; puzzle: number; player: Player; onName: (n: string) => void }) {
  const { state } = game
  const final = score(state.slice, state.secondsLeftAtFinish)
  const complete = isComplete(state.slice)
  const [name, setName] = useState(player.name)
  const [submitted, setSubmitted] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  // A past puzzle is practice: it can't build a streak or change the day's score.
  const [stats] = useState(() => (isPast ? getStats() : recordResult(dayKey, final.total, yesterdayKey(dayKey))))

  const submitScore = async (n: string) => {
    // Replays and past puzzles are for practice; only the day's first game goes on the leaderboard.
    if (!n.trim() || state.round > 0 || isPast) return
    await leaderboard
      .submit({
        day: dayKey,
        playerId: player.id,
        name: n.trim(),
        score: final.total,
        slice: sliceCode(state.slice),
        secondsLeft: complete ? state.secondsLeftAtFinish : 0,
      })
      .catch(() => {})
    setSubmitted(true)
  }

  // Submit automatically if we already know who they are.
  useEffect(() => {
    if (player.name) void submitScore(player.name)
    // Only once, on arrival at the results screen.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const won = state.slice.filter((t) => t !== null)

  return (
    <main className="screen done">
      <h1>{complete ? 'Slice complete!' : TIMER_ENABLED ? 'Time’s up!' : 'Game over'}</h1>
      <PizzaSlice slice={state.slice} className="done__slice" />
      <div className="total">
        <div className="total__num">{final.total}</div>
        <div className="total__label">points</div>
      </div>
      <dl className="breakdown">
        <div><dt>Triangles</dt><dd>{final.triangles}</dd></div>
        <div><dt>Full slice bonus</dt><dd>{final.completion}</dd></div>
        {TIMER_ENABLED ? <div><dt>Time bonus</dt><dd>{final.time}</dd></div> : null}
      </dl>

      <button
        type="button"
        className="btn btn--primary"
        onClick={async () => {
          const r = await share(shareText(puzzle, final.total, state.slice, state.secondsLeftAtFinish, complete))
          setShareMsg(r === 'copied' ? 'Copied to clipboard' : r === 'failed' ? 'Couldn’t share' : '')
        }}
      >
        Share your slice
      </button>
      {UNLIMITED_PLAYS ? (
        <button type="button" className="btn" onClick={game.playAgain}>
          Play again with new cards
        </button>
      ) : null}
      {shareMsg ? <p className="muted">{shareMsg}</p> : null}

      {!submitted && state.round === 0 && !isPast ? (
        <form
          className="field field--inline"
          onSubmit={(e) => {
            e.preventDefault()
            onName(name)
            void submitScore(name)
          }}
        >
          <span>Add your name to the leaderboard</span>
          <div className="answer__row">
            <input value={name} maxLength={16} placeholder="Your name" onChange={(e) => setName(e.target.value)} />
            <button type="submit" className="btn">Post</button>
          </div>
        </form>
      ) : null}

      {/* The board itself lives on the shared leaderboard page, with every game's tab. */}
      {isPast ? null : (
        <Link to="leaderboard" search="game=pizza" className="btn btn--board">
          See how you compare
        </Link>
      )}

      {won.length ? (
        <section className="answers">
          <h2>Your answers</h2>
          <ul>
            {won.map((t) => (
              <li key={t!.prompt.id}>
                <span className={`chip chip--${t!.prompt.difficulty}`} />
                <b>{t!.prompt.letter}</b> {t!.prompt.categoryName} — <span className="answers__word">{t!.answer}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="muted">
        Played {stats.played} · Best {stats.best} · Streak {stats.streak}
      </p>
      <p className="next">
        Next pizza in <Countdown />
      </p>
    </main>
  )
}
