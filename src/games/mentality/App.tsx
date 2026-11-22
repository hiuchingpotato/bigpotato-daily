import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from '../../Link'
import { Field, type FieldEvent } from './Field'
import type { Prompt } from '../herd/prompts'
import { suggestion } from './match'
import {
  band,
  BAND_LABEL,
  crowdScores,
  dayKey,
  histogram,
  maxScore,
  OUTCOME_EMOJI,
  percentile,
  puzzleNumber,
  questionsForDay,
  requestedDay,
  ROUNDS,
  saveAnswer,
  savedFor,
  scoreRound,
  SECONDS,
  shareText,
  type Outcome,
  type Round,
} from './mentality'
import { mentalityHistory } from './summary'
import './mentality.css'

type Phase = 'intro' | 'question' | 'reveal' | 'results'

const shortDate = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

const VERDICT: Record<Outcome, { title: string; line: string }> = {
  herd: { title: 'You’re part of the herd!', line: 'A cow wandered over to join you.' },
  meh: { title: 'More or less…', line: 'Not quite the herd. The cows didn’t even look up.' },
  pink: { title: 'Too niche!', line: 'A pink cow just joined your herd.' },
  timeout: { title: 'Time’s up!', line: 'The cows got bored waiting.' },
}

export default function App() {
  const [today] = useState(() => dayKey())
  const [day] = useState(() => requestedDay(window.location.search, today) ?? today)
  const isPast = day !== today
  const questions = useMemo(() => questionsForDay(day), [day])
  const [answers, setAnswers] = useState<(string | null)[]>(() => savedFor(day)?.answers ?? [])
  const [phase, setPhase] = useState<Phase>(() => (answers.length >= ROUNDS ? 'results' : 'intro'))
  const [event, setEvent] = useState<FieldEvent | null>(null)
  const [deadline, setDeadline] = useState(0)
  const rounds = useMemo(() => answers.map((a, i) => scoreRound(questions[i]!, a)), [answers, questions])

  const start = () => {
    setEvent(null)
    setDeadline(Date.now() + SECONDS * 1000)
    setPhase('question')
  }

  const finish = (text: string | null) => {
    const saved = saveAnswer(day, text)
    const r = scoreRound(questions[saved.answers.length - 1]!, text)
    setAnswers(saved.answers)
    setEvent({ kind: r.outcome, round: saved.answers.length - 1 })
    setPhase('reveal')
  }

  const next = () => (answers.length >= ROUNDS ? setPhase('results') : start())

  const current = phase === 'question' ? answers.length : answers.length - 1
  const mood = phase === 'question' ? 'alert' : 'idle'

  return (
    <div className={`hm hm--${phase}`}>
      <Field rounds={rounds} event={phase === 'reveal' ? event : null} mood={mood} deadline={phase === 'question' ? deadline : 0} view={phase === 'intro' ? 'wide' : 'close'} />

      <header className="hm__top">
        <Link to="home" className="hm__home" aria-label="All games">
          ‹
        </Link>
        <div className="hm__brand">
          Herd Mentality <span className="hm__num">#{puzzleNumber(day)}</span>
        </div>
        <ol className="hm__pips" aria-label="Rounds">
          {questions.map((_, i) => {
            const r = rounds[i]
            return (
              <li key={i} className={`hm__pip${r ? ` hm__pip--${r.outcome}` : i === current && phase === 'question' ? ' hm__pip--now' : ''}`}>
                {r ? OUTCOME_EMOJI[r.outcome] : ''}
              </li>
            )
          })}
        </ol>
      </header>

      {isPast ? (
        <p className="hm__past">
          Past game · {shortDate(day)} ·{' '}
          <Link to="herd-mentality" className="hm__past-link">
            back to today
          </Link>
        </p>
      ) : null}

      <main className="hm__main">
        {phase === 'intro' ? <Intro resumeAt={answers.length} onStart={start} /> : null}
        {phase === 'question' ? (
          <Question key={current} n={current} prompt={questions[current]!} deadline={deadline} onDone={finish} />
        ) : null}
        {phase === 'reveal' && rounds[current] ? <Reveal r={rounds[current]} last={answers.length >= ROUNDS} onNext={next} /> : null}
        {phase === 'results' ? <Results day={day} rounds={rounds} /> : null}
      </main>
    </div>
  )
}

function Intro({ resumeAt, onStart }: { resumeAt: number; onStart: () => void }) {
  return (
    <section className="hm-card hm-intro">
      <p className="hm-intro__kicker">Think like the herd</p>
      <h1>Say what everyone else will say.</h1>
      <ul>
        <li>
          <b>{ROUNDS} questions</b>, <b>{SECONDS} seconds</b> each.
        </li>
        <li>🐄 The most common answer gathers a cow for your herd.</li>
        <li>🩷 Too niche, and a pink cow barges in instead.</li>
      </ul>
      <button type="button" className="hm-btn hm-btn--big" onClick={onStart}>
        {resumeAt > 0 ? `Carry on · question ${resumeAt + 1} of ${ROUNDS}` : 'Start game'}
      </button>
    </section>
  )
}

/** One question against the clock. Whatever's typed when time runs out is the answer. */
function Question({ n, prompt, deadline, onDone }: { n: number; prompt: Prompt; deadline: number; onDone: (text: string | null) => void }) {
  const [value, setValue] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const input = useRef<HTMLInputElement>(null)
  const latest = useRef({ value, onDone, done: false })
  useEffect(() => {
    latest.current.value = value
    latest.current.onDone = onDone
  })

  const submit = () => {
    if (latest.current.done) return
    latest.current.done = true
    // Drop the keyboard so the field and its cows are in view for the result.
    input.current?.blur()
    latest.current.onDone(latest.current.value.trim() || null)
  }

  useEffect(() => {
    input.current?.focus()
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= deadline) submit()
    }, 100)
    return () => clearInterval(id)
    // The deadline is fixed for this question.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline])

  // A near-miss of an answer, offered back as you type.
  const [hint, setHint] = useState<{ for: string; text: string | null }>({ for: '', text: null })
  useEffect(() => {
    // A beat after typing stops, so it doesn't flicker on every key.
    const id = setTimeout(() => setHint({ for: value, text: suggestion(prompt, value) }), 250)
    return () => clearTimeout(id)
  }, [value, prompt])
  const meant = hint.for === value ? hint.text : null
  const accept = () => {
    if (!meant) return
    setValue(meant)
    input.current?.focus()
  }

  const left = Math.max(0, deadline - now)
  const secs = Math.ceil(left / 1000)
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) submit()
  }

  return (
    <section className={`hm-card hm-q${secs <= 10 ? ' hm-q--hurry' : ''}`}>
      <p className="hm-q__count">
        Question {n + 1} of {ROUNDS}
      </p>
      <h1 className="hm-q__text">{prompt.question}</h1>
      <div className="hm-q__timer" role="timer" aria-label={`${secs} seconds left`}>
        <span className="hm-q__bar" style={{ transform: `scaleX(${left / (SECONDS * 1000)})` }} />
        <b>{secs}</b>
      </div>
      <form className="hm-q__form" onSubmit={onSubmit}>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What will most people say?"
          maxLength={60}
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="go"
          aria-label="Your answer"
        />
        <button type="submit" className="hm-btn" disabled={!value.trim()}>
          Moo!
        </button>
      </form>
      <p className="hm-q__hint" aria-live="polite">
        {meant ? (
          <button type="button" className="hm-q__meant" onClick={accept} onMouseDown={(e) => e.preventDefault()}>
            Do you mean <b>“{meant}”</b>?
          </button>
        ) : null}
      </p>
    </section>
  )
}

function Reveal({ r, last, onNext }: { r: Round; last: boolean; onNext: () => void }) {
  const v = VERDICT[r.outcome]
  return (
    <section className={`hm-card hm-reveal hm-reveal--${r.outcome}`} aria-live="polite">
      <p className="hm-reveal__q">{r.prompt.question}</p>
      <h1>{v.title}</h1>
      <p className="hm-reveal__line">{v.line}</p>
      <dl className="hm-reveal__facts">
        <div>
          <dt>You said</dt>
          <dd>
            {r.matched ?? r.input ?? '—'}
            {r.input ? <small>{BAND_LABEL[band(r)]}</small> : null}
          </dd>
        </div>
        <div>
          <dt>The herd said</dt>
          <dd>
            {r.top.text}
            <small>{BAND_LABEL.top}</small>
          </dd>
        </div>
      </dl>
      <div className="hm-reveal__foot">
        <span className="hm-reveal__points">+{r.points}</span>
        <button type="button" className="hm-btn" onClick={onNext}>
          {last ? 'See results' : 'Next question'}
        </button>
      </div>
    </section>
  )
}

function Results({ day, rounds }: { day: string; rounds: Round[] }) {
  const score = rounds.reduce((s, r) => s + r.points, 0)
  const crowd = useMemo(() => crowdScores(day), [day])
  const max = maxScore(rounds.map((r) => r.prompt))
  // Kept a little vague, like the bands: to the nearest 5%.
  const beat = Math.floor(percentile(score, crowd) / 5) * 5
  const [history] = useState(() => mentalityHistory())
  const [msg, setMsg] = useState('')

  const onShare = async () => {
    const r = await share(shareText(day, rounds, score, beat))
    setMsg(r === 'copied' ? 'Copied to clipboard' : r === 'failed' ? 'Couldn’t share' : '')
  }

  return (
    <div className="hm-results">
      <section className="hm-card hm-score">
        <p className="hm-score__label">Your score</p>
        <p className="hm-score__value">
          {score}
          <small> / {max}</small>
        </p>
        <p className="hm-score__beat">
          You beat about <b>{beat}%</b> of the herd
        </p>
        <Curve crowd={crowd} max={max} score={score} />
        <div className="hm-score__row">
          <button type="button" className="hm-btn" onClick={onShare}>
            Share result
          </button>
          <Link to="home" className="hm-btn hm-btn--ghost">
            All games
          </Link>
        </div>
        {msg ? <p className="hm-score__msg">{msg}</p> : null}
      </section>

      <section className="hm-card hm-rounds">
        <h2>Your answers</h2>
        <ol>
          {rounds.map((r, i) => (
            <li key={i} className={`hm-rounds__row hm-rounds__row--${r.outcome}`}>
              <span className="hm-rounds__emoji">{OUTCOME_EMOJI[r.outcome]}</span>
              <span className="hm-rounds__body">
                <span className="hm-rounds__q">{r.prompt.question}</span>
                <span className="hm-rounds__a">
                  {r.matched ?? r.input ?? 'No answer'}
                  <span className="hm-rounds__top">
                    {' · '}
                    {r.input ? BAND_LABEL[band(r)] : 'Out of time'}
                    {r.match !== r.prompt.answers.findIndex((a) => a.text === r.top.text) ? `, herd said ${r.top.text}` : ''}
                  </span>
                </span>
              </span>
              <span className="hm-rounds__pts">{r.points}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="hm-card hm-tally" aria-label="Your herd so far">
        <div>
          <span className="hm-tally__value">🐄 {history.cows}</span>
          <span className="hm-tally__label">{history.cows === 1 ? 'cow' : 'cows'} gathered</span>
        </div>
        <div>
          <span className="hm-tally__value">🩷 {history.pinkCows}</span>
          <span className="hm-tally__label">{history.pinkCows === 1 ? 'pink cow' : 'pink cows'}</span>
        </div>
        <div>
          <span className="hm-tally__value">{history.played}</span>
          <span className="hm-tally__label">{history.played === 1 ? 'game' : 'games'} played</span>
        </div>
      </section>
    </div>
  )
}

/** Where the crowd's scores fall, with a marker where you landed. */
function Curve({ crowd, max, score }: { crowd: number[]; max: number; score: number }) {
  const W = 300
  const H = 110
  const bins = histogram(crowd, max, 30)
  const peak = Math.max(...bins, 1)
  const x = (i: number) => (i / (bins.length - 1)) * W
  const y = (v: number) => H - 6 - (v / peak) * (H - 22)
  const line = bins.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const you = Math.min(W, Math.max(0, (score / Math.max(1, max)) * W))
  return (
    <svg className="hm-curve" viewBox={`0 -14 ${W} ${H + 30}`} role="img" aria-label="How the herd scored, and where you landed">
      <path className="hm-curve__area" d={`${line} L${W} ${H - 6} L0 ${H - 6} Z`} />
      <path className="hm-curve__line" d={line} />
      <line className="hm-curve__you" x1={you} x2={you} y1={-2} y2={H - 6} />
      <text className="hm-curve__label" x={Math.min(W - 14, Math.max(14, you))} y={-4} textAnchor="middle">
        You
      </text>
      <text className="hm-curve__axis" x={0} y={H + 12}>
        0
      </text>
      <text className="hm-curve__axis" x={W / 2} y={H + 12} textAnchor="middle">
        more of the herd →
      </text>
      <text className="hm-curve__axis" x={W} y={H + 12} textAnchor="end">
        {max}
      </text>
    </svg>
  )
}

/** Native share sheet on phones, clipboard everywhere else (or when sharing is blocked). */
async function share(text: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const full = `${text}\n${window.location.origin}${import.meta.env.BASE_URL}herd-mentality/`
  if (navigator.share) {
    try {
      await navigator.share({ text: full })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(full)
    return 'copied'
  } catch {
    return 'failed'
  }
}
