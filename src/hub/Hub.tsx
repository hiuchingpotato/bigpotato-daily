import { useEffect, useState, type ReactNode } from 'react'
import { formatDuration } from '../games/closer/game/stats'
import { closerSummary, type CloserDay, type CloserSummary } from '../games/closer/summary'
import { todayKey } from '../games/pizza/game/daily'
import { pizzaPastDays, pizzaToday } from '../games/pizza/summary'
import { Link } from '../Link'
import type { Route } from '../router'
import { ArchTitle } from './ArchTitle'
import './hub.css'

/** How many earlier puzzles each game's row offers. Older Closer puzzles stay in its calendar. */
const PAST_DAYS = 7

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

const longDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const shortDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const dayDate = (dayKey: string) => new Date(`${dayKey}T12:00:00`)

export function Hub() {
  const now = useNow()
  // Changes at midnight, which re-reads every summary for the new day.
  const day = todayKey(now)
  const pizza = pizzaToday(now)
  const pizzaPast = pizzaPastDays(PAST_DAYS, now)
  const [closer, setCloser] = useState<CloserSummary | null | 'error'>(null)

  useEffect(() => {
    let cancelled = false
    closerSummary(PAST_DAYS)
      .then((c) => !cancelled && setCloser(c))
      .catch(() => !cancelled && setCloser('error'))
    return () => {
      cancelled = true
    }
  }, [day])

  const countdown = untilMidnight(now)
  const closerOk = closer && closer !== 'error' ? closer : null

  return (
    <div className="hub">
      <header className="hub__header">
        <ArchTitle
          label="Big Potato Daily Games"
          lines={[
            { text: 'BIG POTATO', size: 40, width: 210 },
            { text: 'DAILY GAMES', size: 62, width: 330 },
          ]}
        />
        <p className="hub__tagline">
          Love our games? Make it a habit!
          <br />
          Solve a puzzle every day, get better every day.
        </p>
        <Link to="leaderboard" className="hub__board-link">
          See leaderboard
        </Link>
      </header>

      <main className="hub__games">
        <GameRow label="P for Pizza">
          <TodayCard
            route="pizza"
            art="triangle-cards.jpg"
            name="P for Pizza"
            kicker="Cheesy letter game"
            blurb="Think quick, build a point-heavy pizza every day."
            number={pizza.puzzle}
            date={longDate(now)}
            streak={pizza.streak}
            result={pizza.status === 'done' ? `${pizza.score ?? 0} pts` : pizza.status === 'playing' ? 'In progress' : null}
            played={pizza.status === 'done'}
            countdown={countdown}
          />
          {pizzaPast.map((p) => (
            <PastCard
              key={p.day}
              route="pizza"
              search={`day=${p.day}`}
              date={shortDate(dayDate(p.day))}
              number={p.puzzle}
              status={p.status === 'done' ? `${p.score} pts` : p.status === 'playing' ? 'In progress' : 'Not played'}
              done={p.status === 'done'}
            />
          ))}
        </GameRow>

        <GameRow label="Closer">
          <TodayCard
            route="closer"
            art="space.jpg"
            mascot
            name="Closer"
            kicker="Word-meaning game"
            blurb="Guess the secret word. Every guess shows how close you are in meaning."
            number={closerOk?.today.puzzle ?? null}
            date={longDate(now)}
            streak={closerOk?.streak ?? null}
            result={closer === 'error' ? 'Couldn’t load today’s puzzle' : closerOk ? closerResult(closerOk.today) : null}
            played={!!closerOk && ['solved', 'replayed', 'gaveup'].includes(closerOk.today.state)}
            countdown={countdown}
          />
          {closerOk?.past.map((c) => (
            <PastCard
              key={c.puzzle}
              route="closer"
              search={`puzzle=${c.puzzle}`}
              date={shortDate(c.date)}
              number={c.puzzle}
              status={closerResult(c) ?? 'Not played'}
              done={['solved', 'replayed', 'gaveup'].includes(c.state)}
            />
          ))}
        </GameRow>
      </main>
    </div>
  )
}

function closerResult(c: CloserDay): string | null {
  switch (c.state) {
    case 'solved':
    case 'replayed': {
      const time = c.seconds === null ? '' : ` · ${formatDuration(c.seconds)}`
      return `${c.guesses} ${c.guesses === 1 ? 'guess' : 'guesses'}${time}`
    }
    case 'gaveup':
      return 'Gave up'
    case 'started':
      return 'In progress'
    default:
      return null
  }
}

/** Today's card first, then earlier days to swipe through. */
function GameRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="row" aria-label={label}>
      <div className="row__scroller">{children}</div>
    </section>
  )
}

interface TodayCardProps {
  route: Route
  /** Background artwork in public/hub/. */
  art: string
  mascot?: boolean
  name: string
  kicker: string
  blurb: string
  number: number | null
  date: string
  streak: number | null
  /** Today's result once there is one, e.g. "120 pts". */
  result: string | null
  played: boolean
  countdown: string
}

function TodayCard({ route, art, mascot, name, kicker, blurb, number, date, streak, result, played, countdown }: TodayCardProps) {
  return (
    <Link to={route} className={`card card--today card--${route}`}>
      <img className="art" src={`${import.meta.env.BASE_URL}hub/${art}`} alt="" />
      {mascot ? <img className="card__mascot" src={`${import.meta.env.BASE_URL}hub/sausage.png`} alt="" /> : null}
      <div className="card__body">
        <div className="card__head">
          <h2>{name}</h2>
          {number !== null ? <span className="card__num">#{number}</span> : null}
        </div>
        <p className="card__kicker">{kicker}</p>
        <p className="card__blurb">{blurb}</p>
        {result ? <p className="card__result">{result}</p> : null}
        <div className="card__foot">
          <span className="card__date">
            {date}
            {streak ? <span className="card__streak" title="Days in a row">🔥 {streak}</span> : null}
          </span>
          {played ? (
            <span className="card__countdown">
              Next in <b>{countdown}</b>
            </span>
          ) : (
            <span className="card__play">Play</span>
          )}
        </div>
      </div>
    </Link>
  )
}

interface PastCardProps {
  route: Route
  search: string
  date: string
  number: number
  status: string
  done: boolean
}

function PastCard({ route, search, date, number, status, done }: PastCardProps) {
  return (
    <Link to={route} search={search} className={`card card--past card--${route}-past`}>
      <span className="card__past-date">{date}</span>
      <span className="card__past-num">#{number}</span>
      <span className={done ? 'card__past-status card__past-status--done' : 'card__past-status'}>{status}</span>
    </Link>
  )
}
