import { useEffect, useState } from 'react'
import { todayKey } from '../games/pizza/game/daily'
import { leaderboard, type ScoreEntry } from '../games/pizza/lib/leaderboard'
import { getPlayer } from '../games/pizza/lib/storage'
import { Link } from '../Link'
import './hub.css'

/** Today's full board. Only P for Pizza has one so far; Closer's results stay on the device. */
export function LeaderboardPage() {
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

  const dateLabel = new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="hub">
      <header className="hub__header hub__header--slim">
        <Link to="home" className="hub__back" aria-label="All games">
          ‹
        </Link>
        <h1 className="hub__title hub__title--small">Leaderboard</h1>
      </header>

      <section className="board">
        <div className="board__head">
          <div>
            <h2>P for Pizza</h2>
            <p className="board__date">{dateLabel}</p>
          </div>
          {leaderboard.kind === 'local' ? <span className="board__tag">This device only</span> : null}
          {leaderboard.kind === 'demo' ? <span className="board__tag">Demo players</span> : null}
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
        <Link to="pizza" className="board__play">
          Play today’s P for Pizza
        </Link>
      </section>

      <p className="hub__note">Closer results stay on your device, so it has no leaderboard yet.</p>
    </div>
  )
}
