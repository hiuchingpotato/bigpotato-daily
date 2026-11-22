import { useEffect, useRef, useState, type ReactNode } from 'react'

const ALL_GAMES = [
  { id: 'pizza', name: 'P for Pizza' },
  { id: 'closer', name: 'Closer' },
  { id: 'herd-mentality', name: 'Herd' },
  { id: 'herd', name: 'vs World' },
] as const

export type GameId = (typeof ALL_GAMES)[number]['id']

/**
 * A tab per game over panes laid side by side: tap a tab or swipe between them.
 * `?game=` opens on a game, and follows the visible one so a shared or reloaded
 * link lands on the same pane. Used by the leaderboard and streak pages.
 */
export function GameTabs({ id, panes }: { id: string; panes: Partial<Record<GameId, ReactNode>> }) {
  // Only the games this page has a pane for, e.g. no Herd leaderboard yet.
  const GAMES = ALL_GAMES.filter((g) => g.id in panes)
  const [active, setActive] = useState<GameId>(() => {
    const asked = new URLSearchParams(window.location.search).get('game')
    return GAMES.find((g) => g.id === asked)?.id ?? GAMES[0]!.id
  })
  const ref = useRef<HTMLDivElement>(null)

  const indexOf = (game: GameId) => GAMES.findIndex((g) => g.id === game)

  // Open on the game in the URL without animating there.
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = indexOf(active) * el.clientWidth
    // Only on mount; after that the scroll position drives the tab.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `?game=${active}`)
  }, [active])

  const show = (game: GameId) => {
    setActive(game)
    const el = ref.current
    el?.scrollTo({ left: indexOf(game) * el.clientWidth, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const game = GAMES[Math.round(el.scrollLeft / el.clientWidth)]
    if (game && game.id !== active) setActive(game.id)
  }

  return (
    <>
      <div className="lb-tabs" role="tablist" aria-label="Game">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`${id}-tab-${g.id}`}
            aria-controls={`${id}-pane-${g.id}`}
            aria-selected={active === g.id}
            className={active === g.id ? 'lb-tab lb-tab--active' : 'lb-tab'}
            onClick={() => show(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="lb-panes" ref={ref} onScroll={onScroll}>
        {GAMES.map((g) => (
          <section key={g.id} className="lb-pane" role="tabpanel" id={`${id}-pane-${g.id}`} aria-labelledby={`${id}-tab-${g.id}`}>
            {panes[g.id]}
          </section>
        ))}
      </div>
    </>
  )
}
