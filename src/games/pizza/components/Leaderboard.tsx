import { useEffect, useState } from 'react'
import { leaderboard, type ScoreEntry } from '../lib/leaderboard'

const DOT = { g: 'g', y: 'y', r: 'r', '-': 'e' } as const

function MiniSlice({ slice }: { slice: string }) {
  const rows = [slice.slice(0, 1), slice.slice(1, 4), slice.slice(4, 9)]
  return (
    <span className="mini" aria-hidden>
      {rows.map((row, r) => (
        <span key={r} className="mini__row">
          {[...row].map((c, i) => (
            <span key={i} className={`mini__dot mini__dot--${DOT[c as keyof typeof DOT] ?? 'e'}`} />
          ))}
        </span>
      ))}
    </span>
  )
}

interface Props {
  day: string
  playerId: string
  /** Bump to refetch, e.g. right after submitting. */
  refreshKey?: number
}

export function Leaderboard({ day, playerId, refreshKey }: Props) {
  const [rows, setRows] = useState<ScoreEntry[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    leaderboard
      .top(day)
      .then((r) => {
        if (cancelled) return
        setRows(r)
        setError(false)
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [day, refreshKey])

  return (
    <section className="board">
      <header className="board__head">
        <h2>Today’s biggest slices</h2>
        {leaderboard.kind === 'local' ? <span className="board__badge">This device only</span> : null}
        {leaderboard.kind === 'demo' ? <span className="board__badge">Demo players</span> : null}
      </header>
      {error ? (
        <p className="board__msg">Couldn’t load the leaderboard. Try again in a bit.</p>
      ) : rows === null ? (
        <p className="board__msg">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="board__msg">No slices yet today. Be the first!</p>
      ) : (
        <ol className="board__list">
          {rows.map((r, i) => (
            <li key={r.playerId} className={r.playerId === playerId ? 'board__row board__row--me' : 'board__row'}>
              <span className="board__rank">{i + 1}</span>
              <span className="board__name">{r.name}</span>
              <MiniSlice slice={r.slice} />
              <span className="board__score">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
