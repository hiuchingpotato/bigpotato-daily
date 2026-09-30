import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Countdown } from './components/Countdown'
import { Leaderboard } from './components/Leaderboard'
import { PizzaSlice } from './components/PizzaSlice'
import { PromptCard } from './components/PromptCard'
import { puzzleNumber, todayKey } from './game/daily'
import { share, shareText, sliceCode } from './game/share'
import { isComplete, POINTS, ROUND_SECONDS, score, SKIP_PENALTY_SECONDS, slotFor } from './game/slice'
import { useDailyGame } from './game/useDailyGame'
import { leaderboard } from './lib/leaderboard'
import { getPlayer, getStats, recordResult, setPlayerName, type Player } from './lib/storage'

function yesterdayKey(dayKey: string) {
  const d = new Date(`${dayKey}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

export default function App() {
  // The day is fixed for the session, so a game started at 23:59 finishes as that day's game.
  const [dayKey] = useState(() => todayKey())
  const puzzle = puzzleNumber(dayKey)
  const game = useDailyGame(dayKey)
  const [player, setPlayer] = useState<Player>(getPlayer)
  const [showBoard, setShowBoard] = useState(false)

  const { state } = game
  const screen = state.finished ? 'done' : state.startedAt === null ? 'intro' : 'play'

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__p">P</span>
          <span className="brand__rest">for Pizza</span>
          <span className="brand__daily">Daily #{puzzle}</span>
        </div>
        {screen !== 'play' ? (
          <button type="button" className="icon-btn" onClick={() => setShowBoard((v) => !v)} aria-expanded={showBoard}>
            {showBoard ? 'Close' : 'Leaderboard'}
          </button>
        ) : null}
      </header>

      {showBoard && screen !== 'play' ? (
        <main className="screen">
          <Leaderboard day={dayKey} playerId={player.id} />
        </main>
      ) : screen === 'intro' ? (
        <Intro player={player} onName={(n) => setPlayer(setPlayerName(n))} onStart={game.start} />
      ) : screen === 'play' ? (
        <Play game={game} />
      ) : (
        <Done game={game} dayKey={dayKey} puzzle={puzzle} player={player} onName={(n) => setPlayer(setPlayerName(n))} />
      )}
    </div>
  )
}

type Game = ReturnType<typeof useDailyGame>

function Intro({ player, onName, onStart }: { player: Player; onName: (n: string) => void; onStart: () => void }) {
  const [name, setName] = useState(player.name)
  const stats = getStats()
  return (
    <main className="screen intro">
      <PizzaSlice slice={Array(9).fill(null)} className="intro__slice" />
      <h1>Build today’s biggest slice</h1>
      <ol className="rules">
        <li>
          Three cards are on the table. Each one pairs a <b>category</b> with a <b>letter</b>.
        </li>
        <li>
          Type anything that fits — <i>Animals + B</i> → <i>Badger</i>. It counts for whichever card it matches.
        </li>
        <li>
          Win the card and it goes into your slice. You’ve got <b>{Math.floor(ROUND_SECONDS / 60)}:{String(ROUND_SECONDS % 60).padStart(2, '0')}</b> to fill all nine.
        </li>
      </ol>
      <div className="legend">
        <div><span className="chip chip--green" /> Easy <b>+{POINTS.green}</b> · bottom row only</div>
        <div><span className="chip chip--yellow" /> Medium <b>+{POINTS.yellow}</b> · bottom or middle</div>
        <div><span className="chip chip--red" /> Hard <b>+{POINTS.red}</b> · anywhere, and the only way to top it off</div>
        <div className="legend__note">Finish the slice for a bonus plus a point for every second left. Skipping costs {SKIP_PENALTY_SECONDS}s.</div>
      </div>
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
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => {
          onName(name)
          onStart()
        }}
      >
        Start the clock
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
  const { state, visiblePrompts, timeLeft, submit, skip } = game
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [freshSlot, setFreshSlot] = useState<number | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)
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
      <div className="timer" role="timer" aria-label={`${secs} seconds left`}>
        <div className={`timer__bar ${timeLeft < 20 ? 'timer__bar--low' : ''}`} style={{ width: `${pct}%` }} />
        <span className="timer__text">
          {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
        </span>
        <span className="timer__score">{current.triangles} pts</span>
      </div>

      <PizzaSlice slice={state.slice} fresh={freshSlot} className="play__slice" />

      <div className="prompts">
        {visiblePrompts.map((p, pos) => (
          <PromptCard
            key={p ? p.id : `empty-${pos}`}
            prompt={p}
            noRoom={p ? slotFor(state.slice, p.difficulty) === -1 : false}
            onSkip={() => {
              skip(pos)
              inputRef.current?.focus()
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
            autoFocus
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

function Done({ game, dayKey, puzzle, player, onName }: { game: Game; dayKey: string; puzzle: number; player: Player; onName: (n: string) => void }) {
  const { state } = game
  const final = score(state.slice, state.secondsLeftAtFinish)
  const complete = isComplete(state.slice)
  const [name, setName] = useState(player.name)
  const [submitted, setSubmitted] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [shareMsg, setShareMsg] = useState('')
  const [stats] = useState(() => recordResult(dayKey, final.total, yesterdayKey(dayKey)))

  const submitScore = async (n: string) => {
    if (!n.trim()) return
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
    setRefresh((r) => r + 1)
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
      <h1>{complete ? 'Slice complete!' : 'Time’s up!'}</h1>
      <PizzaSlice slice={state.slice} className="done__slice" />
      <div className="total">
        <div className="total__num">{final.total}</div>
        <div className="total__label">points</div>
      </div>
      <dl className="breakdown">
        <div><dt>Triangles</dt><dd>{final.triangles}</dd></div>
        <div><dt>Full slice bonus</dt><dd>{final.completion}</dd></div>
        <div><dt>Time bonus</dt><dd>{final.time}</dd></div>
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
      {shareMsg ? <p className="muted">{shareMsg}</p> : null}

      {!submitted ? (
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

      <Leaderboard day={dayKey} playerId={player.id} refreshKey={refresh} />

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
