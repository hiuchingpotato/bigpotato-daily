import { useEffect, useState, type ReactNode } from 'react'
import { formatDuration } from '../games/closer/game/stats'
import { closerSummary, type CloserDay, type CloserSummary } from '../games/closer/summary'
import { todayKey } from '../games/pizza/game/daily'
import { herdPastDays, herdToday, OUTCOME_LABEL, type HerdDay } from '../games/herd/summary'
import { mentalityPastDays, mentalityToday, type MentalityDay } from '../games/mentality/summary'
import { pizzaPastDays, pizzaToday } from '../games/pizza/summary'
import { Link } from '../Link'
import type { Route } from '../router'
import type { GameId } from './GameTabs'
import { HubLogo } from './HubLogo'
import './hub.css'

/** How many earlier puzzles each game's row offers. Older Closer puzzles stay in its calendar. */
const PAST_DAYS = 7

/** Time left until `to`, as h:mm:ss. */
function timeUntil(to: Date, now: Date): string {
  const s = Math.max(0, Math.floor((to.getTime() - now.getTime()) / 1000))
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

  // Every game rolls over at local midnight, so one "next in" countdown covers them all.
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const next: Action = { kind: 'countdown', label: 'Next in', value: timeUntil(midnight, now) }
  const closerOk = closer && closer !== 'error' ? closer : null
  const herd = herdToday(now)
  const herdPast = herdPastDays(PAST_DAYS, now)
  const mentality = mentalityToday(now)
  const mentalityPast = mentalityPastDays(PAST_DAYS, now)

  return (
    <div className="hub">
      <header className="hub__header">
        <HubLogo />
        <p className="hub__tagline">
          Love our games? Make it a habit!
          <br />
          Solve a puzzle every day, get better every day.
        </p>
        <div className="hub__actions">
          <Link to="leaderboard" className="hub__board-link">
            Leaderboard
          </Link>
          <Link to="stats" className="hub__board-link">
            Streak
          </Link>
        </div>
      </header>

      <main className="hub__games">
        <GameRow label="P for Pizza">
          <TodayCard
            route="pizza"
            art="hub/triangle-cards.jpg"
            name="P for Pizza"
            kicker="Cheesy letter game"
            difficulty={1}
            blurb="Think quick, build a point-heavy pizza every day."
            number={pizza.puzzle}
            date={shortDate(now)}
            streak={pizza.streak}
            result={pizza.status === 'done' ? `${pizza.score ?? 0} pts` : pizza.status === 'playing' ? 'In progress' : null}
            action={pizza.status === 'done' ? next : PLAY}
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
          <MoreCard game="pizza" />
        </GameRow>

        <GameRow label="Closer">
          <TodayCard
            route="closer"
            art="hub/space.jpg"
            mascot="hub/sausage.png"
            name="Closer"
            kicker="Word-meaning game"
            difficulty={4}
            blurb="Find the secret word by how close each guess is."
            number={closerOk?.today.puzzle ?? null}
            date={shortDate(now)}
            streak={closerOk?.streak ?? null}
            result={closer === 'error' ? 'Couldn’t load today’s puzzle' : closerOk ? closerResult(closerOk.today) : null}
            action={closerOk && ['solved', 'replayed', 'gaveup'].includes(closerOk.today.state) ? next : PLAY}
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
          <MoreCard game="closer" />
        </GameRow>

        <GameRow label="Herd Mentality">
          <TodayCard
            route="herd-mentality"
            art="herd-mentality/field-card.svg"
            mascot="herd/cow-2.png"
            name="Herd Mentality"
            kicker="Think like the herd"
            difficulty={2}
            blurb="Six questions, 45 seconds each. Say what everyone else will say."
            number={mentality.puzzle}
            date={shortDate(now)}
            streak={mentality.streak}
            result={mentalityResult(mentality)}
            action={mentality.status === 'done' ? next : PLAY}
          />
          {mentalityPast.map((m) => (
            <PastCard
              key={m.day}
              route="herd-mentality"
              search={`day=${m.day}`}
              date={shortDate(dayDate(m.day))}
              number={m.puzzle}
              status={mentalityResult(m) ?? 'Not played'}
              done={m.status === 'done'}
            />
          ))}
          <MoreCard game="herd-mentality" />
        </GameRow>

        <GameRow label="Herd vs The world">
          <TodayCard
            route="herd"
            art="herd/cow-print-card.svg"
            mascot="herd/pink-cow.png"
            name="Herd vs The world"
            kicker="One question a day"
            difficulty={0}
            blurb="Answer it once. At 11pm, find out where you stand."
            number={herd.puzzle}
            date={shortDate(now)}
            streak={herd.streak}
            result={herd.outcome ? OUTCOME_LABEL[herd.outcome] : herd.answered ? 'Answer locked in' : null}
            action={
              // Play, then a countdown to the 11pm reveal once you've answered, then Reveal.
              !herd.answered ? PLAY
              : herd.revealed ? { kind: 'reveal' }
              : { kind: 'countdown', label: 'Reveal in', value: timeUntil(herd.revealAt, now) }
            }
          />
          {herdPast.map((h) => (
            <PastCard
              key={h.day}
              route="herd"
              search={`day=${h.day}`}
              date={shortDate(dayDate(h.day))}
              number={h.puzzle}
              status={herdResult(h)}
              done={h.answered}
            />
          ))}
          <MoreCard game="herd" />
        </GameRow>
      </main>
    </div>
  )
}

function mentalityResult(m: MentalityDay): string | null {
  if (m.status === 'playing') return 'In progress'
  if (m.status !== 'done') return null
  return `${m.score} pts · 🐄 ${m.herds}${m.pinks ? ` · 🩷 ${m.pinks}` : ''}`
}

function herdResult(h: HerdDay): string {
  if (!h.answered) return 'Not played'
  return h.outcome ? OUTCOME_LABEL[h.outcome] : 'Answered'
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

/** What the card's button does: play, count down to something, or reveal results. */
type Action = { kind: 'play' } | { kind: 'reveal' } | { kind: 'countdown'; label: string; value: string }

const PLAY: Action = { kind: 'play' }

interface TodayCardProps {
  route: Route
  /** Background artwork, relative to public/. */
  art: string
  /** A character beside the button, relative to public/. */
  mascot?: string
  name: string
  kicker: string
  /** Out of 5. */
  difficulty: number
  blurb: string
  number: number | null
  date: string
  streak: number | null
  /** Today's result once there is one, e.g. "120 pts". */
  result: string | null
  action: Action
}

function TodayCard({ route, art, mascot, name, kicker, difficulty, blurb, number, date, streak, result, action }: TodayCardProps) {
  return (
    <Link to={route} className={`card card--today card--${route}`}>
      <img className="art" src={`${import.meta.env.BASE_URL}${art}`} alt="" />
      <div className="card__body">
        <div className="card__head">
          <h2>{name}</h2>
          <span className="card__head-right">
            <Difficulty stars={difficulty} />
            {number !== null ? <span className="card__num">#{number}</span> : null}
          </span>
        </div>
        <p className="card__kicker">{kicker}</p>
        <p className="card__blurb">{blurb}</p>
        {result ? <p className="card__result">{result}</p> : null}
        <div className="card__foot">
          <span className="card__date">
            {date}
            {streak ? <span className="card__streak" title="Days in a row">🔥 {streak}</span> : null}
          </span>
          <span className="card__actions">
            {mascot ? <img className="card__mascot" src={`${import.meta.env.BASE_URL}${mascot}`} alt="" /> : null}
            {action.kind === 'countdown' ? (
              // Label stacked over the time, so it's no wider than a button and the
              // mascot beside it stays clear of the date.
              <span className="card__countdown">
                <span>{action.label}</span>
                <b>{action.value}</b>
              </span>
            ) : (
              <span className="card__play">{action.kind === 'reveal' ? 'Reveal' : 'Play'}</span>
            )}
          </span>
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

/** The last card in a row: opens that game's streak & calendar screen. */
function MoreCard({ game }: { game: GameId }) {
  return (
    <Link to="stats" search={`game=${game}`} className="card card--past card--more">
      <span className="card__more-plus" aria-hidden="true">
        +
      </span>
      <span className="card__more-label">Streak &amp; calendar</span>
    </Link>
  )
}

/** Difficulty out of five, as filled and empty stars. */
function Difficulty({ stars }: { stars: number }) {
  return (
    <span className="card__difficulty" role="img" aria-label={`Difficulty ${stars} out of 5`} title={`Difficulty ${stars}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < stars ? 'star star--on' : 'star'} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}
