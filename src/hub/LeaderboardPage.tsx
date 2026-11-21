import { useEffect, useState } from 'react'
import { formatDuration } from '../games/closer/game/stats'
import { demoPlayers as closerDemoPlayers, rankEntries, type CloserEntry } from '../games/closer/demoPlayers'
import { closerSummary, type CloserSummary } from '../games/closer/summary'
import { todayKey } from '../games/pizza/game/daily'
import { leaderboard, type ScoreEntry } from '../games/pizza/lib/leaderboard'
import { getPlayer } from '../games/pizza/lib/storage'
import { Link } from '../Link'
import type { Route } from '../router'
import { GameTabs } from './GameTabs'
import './hub.css'

const longDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

/** One board per game, side by side: tap a tab or swipe between them. */
export function LeaderboardPage() {
  return (
    <div className="hub">
      <header className="hub__header hub__header--slim">
        <Link to="home" className="hub__back" aria-label="All games">
          ‹
        </Link>
        <h1 className="hub__page-title">Leaderboard</h1>
      </header>

      <GameTabs id="lb" panes={{ pizza: <PizzaBoard />, closer: <CloserBoard /> }} />
    </div>
  )
}

interface Row {
  id: string
  name: string
  /** The headline figure, right-aligned. */
  value: string
  /** Smaller detail under the name, if any. */
  detail?: string
}

function Board({ title, date, kind, unit, rows, meId, empty, play, playLabel }: { title: string; date: string; kind: 'global' | 'local' | 'demo'; unit: string; rows: Row[] | null | 'error'; meId: string; empty: string; play: Route; playLabel: string }) {
  return (
    <div className="board">
      <div className="board__head">
        <div>
          <h2>{title}</h2>
          <p className="board__date">{date}</p>
        </div>
        {kind === 'local' ? <span className="board__tag">This device only</span> : null}
        {kind === 'demo' ? <span className="board__tag">Demo players</span> : null}
      </div>
      {rows === null ? (
        <p className="board__empty">Loading…</p>
      ) : rows === 'error' ? (
        <p className="board__empty">Couldn’t load the leaderboard.</p>
      ) : rows.length === 0 ? (
        <p className="board__empty">{empty}</p>
      ) : (
        <>
        <p className="board__cols">
          <span>Player</span>
          <span>{unit}</span>
        </p>
        <ol className="board__rows">
          {rows.map((r, i) => (
            <li key={r.id} className={r.id === meId ? 'board__row board__row--me' : 'board__row'}>
              <span className="board__rank">{i + 1}</span>
              <span className="board__name">
                {r.name}
                {r.detail ? <span className="board__detail">{r.detail}</span> : null}
              </span>
              <span className="board__score">{r.value}</span>
            </li>
          ))}
        </ol>
        </>
      )}
      <Link to={play} className={`board__play board__play--${play}`}>
        {playLabel}
      </Link>
    </div>
  )
}

function PizzaBoard() {
  const [day] = useState(() => todayKey())
  const [rows, setRows] = useState<ScoreEntry[] | null | 'error'>(null)
  const playerId = getPlayer().id

  useEffect(() => {
    let cancelled = false
    leaderboard
      .top(day, 50)
      .then((r) => !cancelled && setRows(r))
      .catch(() => !cancelled && setRows('error'))
    return () => {
      cancelled = true
    }
  }, [day])

  return (
    <Board
      title="P for Pizza"
      date={longDate(new Date(`${day}T12:00:00`))}
      kind={leaderboard.kind}
      unit="Points"
      rows={Array.isArray(rows) ? rows.map((r) => ({ id: r.playerId, name: r.name, value: `${r.score}` })) : rows}
      meId={playerId}
      empty="No scores yet today. Be the first."
      play="pizza"
      playLabel="Play today’s P for Pizza"
    />
  )
}

/**
 * Closer results never leave the device, so this ranks your own solve today against a
 * field of demo players. It becomes a real board once Closer posts scores somewhere.
 */
function CloserBoard() {
  const [summary, setSummary] = useState<CloserSummary | null | 'error'>(null)
  const [today] = useState(() => new Date())
  const player = getPlayer()

  useEffect(() => {
    let cancelled = false
    closerSummary(0)
      .then((s) => !cancelled && setSummary(s))
      .catch(() => !cancelled && setSummary('error'))
    return () => {
      cancelled = true
    }
  }, [])

  const ok = summary && summary !== 'error' ? summary : null
  const solved = ok && (ok.today.state === 'solved' || ok.today.state === 'replayed') && ok.today.guesses !== null
  let rows: Row[] | null | 'error' = summary === 'error' ? 'error' : null
  if (ok) {
    const entries: CloserEntry[] = closerDemoPlayers(ok.today.puzzle)
    if (solved) entries.push({ id: player.id, name: player.name || 'You', guesses: ok.today.guesses!, seconds: ok.today.seconds ?? 0 })
    rows = rankEntries(entries).map((e) => ({
      id: e.id,
      name: e.name,
      value: `${e.guesses}`,
      detail: formatDuration(e.seconds),
    }))
  }

  return (
    <Board
      title={ok ? `Closer #${ok.today.puzzle}` : 'Closer'}
      date={longDate(ok ? ok.today.date : today)}
      kind="demo"
      unit="Guesses"
      rows={rows}
      meId={player.id}
      empty="No solves yet today."
      play="closer"
      playLabel={solved ? 'See your Closer board' : 'Solve today’s Closer to join'}
    />
  )
}
