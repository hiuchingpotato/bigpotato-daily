import { useEffect, useState } from 'react'
import { closerHistory, type CloserHistory } from '../games/closer/summary'
import { todayKey } from '../games/pizza/game/daily'
import { pizzaHistory } from '../games/pizza/summary'
import { Link } from '../Link'
import './hub.css'

type GameId = 'pizza' | 'closer'

/** How a day went, as the calendar colours it. */
type Status = 'done' | 'late' | 'gaveup' | 'started' | 'missed' | 'today'

interface DayCell {
  status: Status
  /** Small figure under the date: points or guesses. */
  detail?: string
  /** Query that opens this day's puzzle; empty for today's. */
  search: string
}

interface Tile {
  label: string
  value: string
}

interface View {
  name: string
  tiles: Tile[]
  /** First day with a puzzle, and today, as YYYY-MM-DD. */
  first: string
  today: string
  days: Map<string, DayCell>
}

const LEGEND: Record<Status, string> = {
  done: 'Played',
  late: 'Caught up later',
  gaveup: 'Gave up',
  started: 'In progress',
  missed: 'Missed',
  today: 'Today',
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

function pizzaView(now: Date): View {
  const h = pizzaHistory(now)
  const today = todayKey(now)
  const days = new Map<string, DayCell>()
  for (const d of h.days) {
    const search = d.day === today ? '' : `day=${d.day}`
    if (d.status === 'done') days.set(d.day, { status: d.onTime ? 'done' : 'late', detail: `${d.score}`, search })
    else if (d.status === 'playing') days.set(d.day, { status: 'started', search })
    else days.set(d.day, { status: d.day === today ? 'today' : 'missed', search })
  }
  return {
    name: 'P for Pizza',
    tiles: [
      { label: 'Day streak', value: `🔥 ${h.streak}` },
      { label: 'Total points', value: h.totalPoints.toLocaleString('en-GB') },
      { label: 'Best game', value: h.played ? `${h.bestScore} pts` : '–' },
      { label: 'Best streak', value: plural(h.bestStreak, 'day') },
    ],
    first: h.days[0]?.day ?? today,
    today,
    days,
  }
}

function closerView(h: CloserHistory, now: Date): View {
  const today = todayKey(now)
  const days = new Map<string, DayCell>()
  for (const d of h.days) {
    const day = todayKey(d.date)
    const search = day === today ? '' : `puzzle=${d.puzzle}`
    const guesses = d.guesses === null ? undefined : `${d.guesses}`
    const status: Status =
      d.state === 'solved' ? 'done'
      : d.state === 'replayed' ? 'late'
      : d.state === 'gaveup' ? 'gaveup'
      : d.state === 'started' ? 'started'
      : day === today ? 'today'
      : 'missed'
    days.set(day, { status, detail: status === 'done' || status === 'late' ? guesses : undefined, search })
  }
  return {
    name: 'Closer',
    tiles: [
      { label: 'Day streak', value: `🔥 ${h.streak}` },
      // Closer has no points, so the running total is puzzles solved.
      { label: 'Puzzles solved', value: `${h.solved}` },
      { label: 'Best game', value: h.bestGuesses === null ? '–' : plural(h.bestGuesses, 'guess', 'guesses') },
      { label: 'Best streak', value: plural(h.bestStreak, 'day') },
    ],
    first: h.days[0] ? todayKey(h.days[0].date) : today,
    today,
    days,
  }
}

function gameFromUrl(): GameId {
  return new URLSearchParams(window.location.search).get('game') === 'closer' ? 'closer' : 'pizza'
}

/** One game's streak, quick stats and a calendar of every day since it launched. */
export function StreakPage() {
  const [game] = useState(gameFromUrl)
  const [now] = useState(() => new Date())
  const [view, setView] = useState<View | null | 'error'>(() => (game === 'pizza' ? pizzaView(now) : null))

  useEffect(() => {
    if (game !== 'closer') return
    let cancelled = false
    closerHistory(now)
      .then((h) => !cancelled && setView(closerView(h, now)))
      .catch(() => !cancelled && setView('error'))
    return () => {
      cancelled = true
    }
  }, [game, now])

  return (
    <div className="hub">
      <header className="hub__header hub__header--slim">
        <Link to="home" className="hub__back" aria-label="All games">
          ‹
        </Link>
        <div>
          <p className="stats__kicker">Streak &amp; calendar</p>
          <h1 className="hub__page-title">{game === 'closer' ? 'Closer' : 'P for Pizza'}</h1>
        </div>
      </header>

      {view === null ? (
        <p className="hub__note">Loading…</p>
      ) : view === 'error' ? (
        <p className="hub__note">Couldn’t load your history.</p>
      ) : (
        <>
          <section className="stats__tiles" aria-label="Quick stats">
            {view.tiles.map((t) => (
              <div key={t.label} className="stats__tile">
                <span className="stats__value">{t.value}</span>
                <span className="stats__label">{t.label}</span>
              </div>
            ))}
          </section>
          <Calendar view={view} route={game} />
        </>
      )}
    </div>
  )
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function monthStart(day: string): Date {
  const d = new Date(`${day}T12:00:00`)
  return new Date(d.getFullYear(), d.getMonth(), 1, 12)
}

function Calendar({ view, route }: { view: View; route: GameId }) {
  const firstMonth = monthStart(view.first)
  const lastMonth = monthStart(view.today)
  const [month, setMonth] = useState(lastMonth)

  const shift = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1, 12))
  const canBack = month > firstMonth
  const canForward = month < lastMonth

  // Monday-first grid: blanks up to the 1st, then every day of the month.
  const lead = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = [...Array<null>(lead).fill(null)]
  for (let date = 1; date <= daysInMonth; date++) {
    cells.push(todayKey(new Date(month.getFullYear(), month.getMonth(), date, 12)))
  }

  const used = new Set([...view.days.values()].map((d) => d.status))

  return (
    <section className="cal" aria-label="Calendar">
      <div className="cal__head">
        <button type="button" className="cal__nav" onClick={() => shift(-1)} disabled={!canBack} aria-label="Previous month">
          ‹
        </button>
        <h2>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
        <button type="button" className="cal__nav" onClick={() => shift(1)} disabled={!canForward} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="cal__grid">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="cal__weekday" aria-hidden="true">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />
          const date = Number(day.slice(8))
          const cell = view.days.get(day)
          if (!cell) {
            // Before the game launched, or still to come.
            return (
              <span key={day} className="cal__day cal__day--off">
                {date}
              </span>
            )
          }
          return (
            <Link
              key={day}
              to={route}
              search={cell.search}
              className={`cal__day cal__day--${cell.status}`}
              aria-label={`${new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}: ${LEGEND[cell.status]}`}
            >
              <span>{date}</span>
              {cell.detail ? <span className="cal__detail">{cell.detail}</span> : null}
            </Link>
          )
        })}
      </div>

      <ul className="cal__legend">
        {(Object.keys(LEGEND) as Status[])
          .filter((s) => used.has(s))
          .map((s) => (
            <li key={s}>
              <span className={`cal__swatch cal__day--${s}`} aria-hidden="true" />
              {LEGEND[s]}
            </li>
          ))}
      </ul>
      <p className="cal__note">
        {route === 'closer' ? 'Numbers are guesses. ' : 'Numbers are points. '}Tap any day to play it; only days played on the day count towards your streak.
      </p>
    </section>
  )
}
