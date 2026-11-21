import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from '../../Link'
import {
  answeredCount,
  dayKey,
  entryFor,
  isRevealed,
  promptForDay,
  puzzleNumber,
  requestedDay,
  results,
  revealAt,
  submit,
  type Entry,
  type Results,
} from './herd'
import './herd.css'

const BASE = `${import.meta.env.BASE_URL}herd/`

/** Ticks every second, for the counter and the countdown to the reveal. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function countdown(to: Date, now: Date): string {
  const s = Math.max(0, Math.floor((to.getTime() - now.getTime()) / 1000))
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const shortDate = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export default function App() {
  const now = useNow()
  // The day is fixed for the visit; ?day= opens a past prompt.
  const [today] = useState(() => dayKey())
  const [day] = useState(() => requestedDay(window.location.search, today) ?? today)
  const isPast = day !== today
  const prompt = promptForDay(day)
  const [entry, setEntry] = useState<Entry | null>(() => entryFor(day))
  const [showResults, setShowResults] = useState(false)
  const revealed = isRevealed(day, now)

  return (
    <div className="herd">
      <header className="herd__top">
        <Link to="home" className="herd__home" aria-label="All games">
          ‹
        </Link>
        <div className="herd__brand">
          Herd Mentality <span className="herd__num">#{puzzleNumber(day)}</span>
        </div>
        <span className="herd__count" title="Players who have answered today's prompt">
          <img src={`${BASE}cow-head.png`} alt="" className="herd__count-cow" />
          {answeredCount(day, now, !!entry)} answered
        </span>
      </header>

      {isPast ? (
        <p className="herd__past">
          Past prompt · {shortDate(day)} ·{' '}
          <Link to="herd" className="herd__past-link">
            back to today
          </Link>
        </p>
      ) : null}

      {showResults && entry ? (
        <ResultsView r={results(day, entry.answer)} />
      ) : (
        <main className="herd__play">
          <CowScene />
          <h1 className="herd__prompt">{prompt.question}</h1>

          {!entry ? (
            <AnswerForm onSubmit={(answer) => setEntry(submit(day, answer))} late={revealed} />
          ) : (
            <div className="herd__locked">
              <p className="herd__your">
                Your answer <span>🔒</span>
              </p>
              <p className="herd__answer">{entry.answer}</p>
              {revealed ? (
                <button type="button" className="herd__btn herd__btn--reveal" onClick={() => setShowResults(true)}>
                  Reveal
                </button>
              ) : (
                <p className="herd__wait">
                  The herd is revealed at 11pm
                  <span className="herd__timer">{countdown(revealAt(day), now)}</span>
                </p>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  )
}

/** Which cow art each of the five herd spots uses, and whether it faces the other way. */
const HERD = [
  { art: 'cow-2', flip: false },
  { art: 'cow-5', flip: true },
  { art: 'cow-3', flip: false },
  { art: 'cow-1', flip: true },
  { art: 'cow-6', flip: false },
] as const

/** A random hop or shuffle for each cow, so the herd never moves in step. */
function randomMotion(): CSSProperties {
  const hop = Math.random() < 0.6
  return {
    animationName: hop ? 'herd-hop' : 'herd-shuffle',
    animationDuration: `${(hop ? 1.6 : 1.1) + Math.random() * 1.8}s`,
    animationDelay: `${-Math.random() * 3}s`,
  } as CSSProperties
}

/**
 * The pink cow out front, snorting every few seconds, with five of the herd behind
 * on the hill - overlapping, some facing the other way, each hopping or shuffling
 * to its own random rhythm.
 */
function CowScene() {
  const [motions] = useState(() => HERD.map(randomMotion))
  return (
    <div className="herd-scene" aria-hidden="true">
      <img className="herd-scene__hill" src={`${BASE}grass.png`} alt="" />
      {HERD.map((cow, i) => (
        <span key={i} className={`herd-scene__cow herd-scene__cow--${i + 1}`} style={motions[i]}>
          <img src={`${BASE}${cow.art}.png`} alt="" className={cow.flip ? 'is-flipped' : undefined} />
        </span>
      ))}
      <span className="herd-scene__pink">
        <img src={`${BASE}pink-cow.png`} alt="" />
        <span className="herd-scene__puff herd-scene__puff--1" />
        <span className="herd-scene__puff herd-scene__puff--2" />
      </span>
    </div>
  )
}

/** One answer a day, with a last check before it's locked in for good. */
function AnswerForm({ onSubmit, late }: { onSubmit: (answer: string) => void; late: boolean }) {
  const [value, setValue] = useState('')
  const [confirming, setConfirming] = useState(false)
  const answer = value.trim()

  const ask = (e: FormEvent) => {
    e.preventDefault()
    if (answer) setConfirming(true)
  }

  if (confirming) {
    return (
      <div className="herd__confirm">
        <p>
          Lock in <b>“{answer}”</b>? You can’t change it after this.
        </p>
        <div className="herd__row">
          <button type="button" className="herd__btn herd__btn--ghost" onClick={() => setConfirming(false)}>
            Edit
          </button>
          <button type="button" className="herd__btn" onClick={() => onSubmit(answer)}>
            Lock it in
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="herd__form" onSubmit={ask}>
      <div className="herd__row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What will the herd say?"
          maxLength={60}
          autoComplete="off"
          enterKeyHint="go"
          aria-label="Your answer"
        />
        <button type="submit" className="herd__btn" disabled={!answer}>
          Submit
        </button>
      </div>
      <p className="herd__warn">
        ⚠️ One answer a day. Once it’s locked in, you can’t change it.
        {late ? ' The herd is already revealed, so you’ll see the results straight away.' : ''}
      </p>
    </form>
  )
}

const VERDICT: Record<NonNullable<Results['outcome']>, { title: string; line: string }> = {
  herd: { title: 'You’re in the herd!', line: 'You said what most of the herd said. Moo-ve over, everyone.' },
  pink: { title: 'You’re the pink cow!', line: 'Nobody else said that. Bold. Brave. Completely on your own.' },
  between: { title: 'Close to the herd', line: 'Some of the herd agreed with you, just not the biggest crowd.' },
}

function ResultsView({ r }: { r: Results }) {
  const top = r.groups.slice(0, 10)
  const max = top[0]?.count ?? 1
  const verdict = r.outcome ? VERDICT[r.outcome] : null
  const pink = r.pink.find((g) => g.you) ?? r.pink[0]

  return (
    <main className="herd__results">
      <h1 className="herd__prompt herd__prompt--small">{r.prompt.question}</h1>

      {verdict ? (
        <section className={`herd-verdict herd-verdict--${r.outcome}`}>
          <img src={`${BASE}${r.outcome === 'pink' ? 'pink-cow' : 'cow-1'}.png`} alt="" className="herd-verdict__cow" />
          <div>
            <h2>{verdict.title}</h2>
            <p>{verdict.line}</p>
            <p className="herd-verdict__you">
              You said <b>{r.yourGroup!.text}</b>
              {r.yourGroup!.count > 1 ? ` with ${r.yourGroup!.count - 1} others` : ''}.
            </p>
          </div>
        </section>
      ) : null}

      <div className="herd-picks">
        <section className="herd-pick herd-pick--herd">
          <p className="herd-pick__label">🐄 The herd said</p>
          <p className="herd-pick__answer">{r.herd.map((g) => g.text).join(' / ')}</p>
          <p className="herd-pick__meta">
            {r.herd[0]!.count} of {r.players} players
          </p>
        </section>
        {pink ? (
          <section className="herd-pick herd-pick--pink">
            <p className="herd-pick__label">🩷 Pink cow answer</p>
            <p className="herd-pick__answer">{pink.text}</p>
            <p className="herd-pick__meta">
              {pink.you ? 'Only you' : pink.count === 1 ? `Only ${pink.names[0]}` : `${pink.count} players`}
            </p>
          </section>
        ) : null}
      </div>

      <section className="herd-top">
        <h2>Top {top.length} answers</h2>
        <ol>
          {top.map((g, i) => (
            <li key={g.text} className={g.you ? 'herd-top__row herd-top__row--you' : 'herd-top__row'}>
              <span className="herd-top__rank">{i + 1}</span>
              <span className="herd-top__text">
                {g.text}
                {g.you ? <span className="herd-top__tag">you</span> : null}
              </span>
              <span className="herd-top__bar" aria-hidden="true">
                <span style={{ width: `${(g.count / max) * 100}%` }} />
              </span>
              <span className="herd-top__count">{g.count}</span>
            </li>
          ))}
        </ol>
      </section>

      <Link to="home" className="herd__btn herd__btn--home">
        Back to all games
      </Link>
    </main>
  )
}
