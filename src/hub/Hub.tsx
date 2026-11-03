import { useEffect, useState } from 'react'
import { closerToday, type CloserToday } from '../games/closer/summary'
import { formatDuration } from '../games/closer/game/stats'
import { todayKey } from '../games/pizza/game/daily'
import { leaderboard, type ScoreEntry } from '../games/pizza/lib/leaderboard'
import { getPlayer } from '../games/pizza/lib/storage'
import { pizzaToday } from '../games/pizza/summary'
import { Link } from '../Link'
import type { Route } from '../router'
import './hub.css'

/** Both games roll over at local midnight, so one countdown covers them. */
function untilMidnight(now: Date): string {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
  const hh = Math.floor(s / 3600)
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function Hub() {
  const now = useNow()
  // Changes at midnight, which re-reads every summary for the new day.
  const day = todayKey(now)
  const pizza = pizzaToday(now)
  const [closer, setCloser] = useState<CloserToday | null | 'error'>(null)

  useEffect(() => {
    let cancelled = false
    closerToday()
      .then((c) => !cancelled && setCloser(c))
      .catch(() => !cancelled && setCloser('error'))
    return () => {
      cancelled = true
    }
  }, [day])

  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="hub">
      <header className="hub__header">
        <h1 className="hub__title">
          Big Potato <span>Daily</span>
        </h1>
        <p className="hub__date">{dateLabel}</p>
      </header>

      <p className="hub__next" role="timer">
        New puzzles in <b>{untilMidnight(now)}</b>
      </p>

      <main className="hub__games">
        <GameCard
          route="pizza"
          name="P for Pizza"
          number={pizza.puzzle}
          blurb="Match letters to categories and build the biggest slice."
          streak={pizza.streak}
          status={
            pizza.status === 'done'
              ? { text: pizza.score === null ? 'Played today' : `${pizza.score} pts today`, done: true }
              : pizza.status === 'playing'
                ? { text: 'In progress', done: false }
                : { text: 'Not played yet', done: false }
          }
          cta={pizza.status === 'done' ? 'See results' : pizza.status === 'playing' ? 'Carry on' : 'Play'}
        />
        <GameCard
          route="closer"
          name="Closer"
          number={closer && closer !== 'error' ? closer.puzzle : null}
          blurb="Guess the secret word. Every guess shows how close you are in meaning."
          streak={closer && closer !== 'error' ? closer.streak : null}
          status={closerStatus(closer)}
          cta={closer && closer !== 'error' && closer.state !== 'unplayed' ? (closer.state === 'started' ? 'Carry on' : 'See board') : 'Play'}
        />
      </main>

      <PizzaLeaderboard day={day} />
    </div>
  )
}

function closerStatus(c: CloserToday | null | 'error'): { text: string; done: boolean } {
  if (c === null) return { text: 'Loading…', done: false }
  if (c === 'error') return { text: 'Couldn’t load today’s puzzle', done: false }
  switch (c.state) {
    case 'solved':
    case 'replayed': {
      const time = c.seconds === null ? '' : ` · ${formatDuration(c.seconds)}`
      return { text: `Solved in ${c.guesses} ${c.guesses === 1 ? 'guess' : 'guesses'}${time}`, done: true }
    }
    case 'gaveup':
      return { text: 'Gave up today', done: true }
    case 'started':
      return { text: 'In progress', done: false }
    default:
      return { text: 'Not played yet', done: false }
  }
}

interface CardProps {
  route: Route
  name: string
  number: number | null
  blurb: string
  streak: number | null
  status: { text: string; done: boolean }
  cta: string
}

function GameCard({ route, name, number, blurb, streak, status, cta }: CardProps) {
  return (
    <section className={`card card--${route}`}>
      <div className="card__head">
        <h2>{name}</h2>
        {number !== null ? <span className="card__num">#{number}</span> : null}
      </div>
      <p className="card__blurb">{blurb}</p>
      <div className="card__meta">
        <span className={`card__status ${status.done ? 'card__status--done' : ''}`}>{status.text}</span>
        {streak !== null ? (
          <span className="card__streak" title="Days in a row">
            🔥 {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        ) : null}
      </div>
      <Link to={route} className="card__cta">
        {cta}
      </Link>
    </section>
  )
}

function PizzaLeaderboard({ day }: { day: string }) {
  const [rows, setRows] = useState<ScoreEntry[] | null | 'error'>(null)
  const playerId = getPlayer().id

  useEffect(() => {
    let cancelled = false
    leaderboard
      .top(day, 5)
      .then((r) => !cancelled && setRows(r))
      .catch(() => !cancelled && setRows('error'))
    return () => {
      cancelled = true
    }
  }, [day])

  return (
    <section className="board">
      <div className="board__head">
        <h2>Today’s P for Pizza top 5</h2>
        {leaderboard.kind === 'local' ? <span className="board__tag">This device only</span> : null}
      </div>
      {rows === null ? (
        <p className="board__empty">Loading…</p>
      ) : rows === 'error' ? (
        <p className="board__empty">Couldn’t load the leaderboard.</p>
      ) : rows.length === 0 ? (
        <p className="board__empty">No scores yet today. Be the first.</p>
      ) : (
        <ol className="board__rows">
          {rows.map((r, i) => (
            <li key={r.playerId} className={r.playerId === playerId ? 'board__row board__row--me' : 'board__row'}>
              <span className="board__rank">{i + 1}</span>
              <span className="board__name">{r.name}</span>
              <span className="board__score">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
