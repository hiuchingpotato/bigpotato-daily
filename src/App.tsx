import { lazy, Suspense, useEffect } from 'react'
import { Hub } from './hub/Hub'
import { useRoute, type Route } from './router'

// Each game loads only when it's opened, so the home page never pulls in Closer's
// canvas renderer or P for Pizza's category lists.
const PizzaApp = lazy(() => import('./games/pizza/App'))
const CloserApp = lazy(() => import('./games/closer/App'))

const TITLES: Record<Route, string> = {
  home: 'Big Potato Daily',
  pizza: 'P for Pizza Daily',
  closer: 'Closer',
}

export default function App() {
  const route = useRoute()

  useEffect(() => {
    document.title = TITLES[route]
  }, [route])

  if (route === 'home') return <Hub />

  // The wrapper class is what each game's stylesheet is scoped to.
  return (
    <div className={`game-${route}`} key={route}>
      <Suspense fallback={null}>{route === 'pizza' ? <PizzaApp /> : <CloserApp />}</Suspense>
    </div>
  )
}
