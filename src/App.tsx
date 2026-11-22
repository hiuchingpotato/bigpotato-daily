import { lazy, Suspense, useEffect } from 'react'
import { Hub } from './hub/Hub'
import { LeaderboardPage } from './hub/LeaderboardPage'
import { StreakPage } from './hub/StreakPage'
import { useLocationKey, useRoute, type Route } from './router'

// Each game loads only when it's opened, so the home page never pulls in Closer's
// canvas renderer or P for Pizza's category lists.
const PizzaApp = lazy(() => import('./games/pizza/App'))
const CloserApp = lazy(() => import('./games/closer/App'))
const HerdApp = lazy(() => import('./games/herd/App'))

const TITLES: Record<Route, string> = {
  home: 'Big Potato Daily',
  pizza: 'P for Pizza Daily',
  closer: 'Closer',
  herd: 'Herd vs The world',
  leaderboard: 'Leaderboard · Big Potato Daily',
  stats: 'Streak · Big Potato Daily',
}

export default function App() {
  const route = useRoute()
  // Games read their puzzle from the URL once, on mount, so a new query means a fresh mount.
  const locationKey = useLocationKey()

  useEffect(() => {
    document.title = TITLES[route]
  }, [route])

  if (route === 'home') return <Hub />
  if (route === 'leaderboard') return <LeaderboardPage />
  if (route === 'stats') return <StreakPage key={locationKey} />

  // The wrapper class is what each game's stylesheet is scoped to.
  return (
    <div className={`game-${route}`} key={locationKey}>
      <Suspense fallback={null}>{route === 'pizza' ? <PizzaApp /> : route === 'herd' ? <HerdApp /> : <CloserApp />}</Suspense>
    </div>
  )
}
