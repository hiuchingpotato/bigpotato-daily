import { useSyncExternalStore } from 'react'

// A handful of routes, so no router library. Paths sit under BASE_URL (which always ends in a
// slash) so the same build works at a domain root or a GitHub Pages project path.
// Non-home routes keep a trailing slash: Closer's archive links are relative (`./`, `?puzzle=3`).

export type Route = 'home' | 'pizza' | 'closer' | 'herd' | 'leaderboard' | 'stats'

const ROUTES: Route[] = ['pizza', 'closer', 'herd', 'leaderboard', 'stats']

const BASE = import.meta.env.BASE_URL

export function routeFor(pathname: string): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  const first = rest.split('/')[0]
  return ROUTES.find((r) => r === first) ?? 'home'
}

/** `search` is a query string without the `?`, e.g. `day=2026-11-20`. */
export function hrefFor(route: Route, search = ''): string {
  const path = route === 'home' ? BASE : `${BASE}${route}/`
  return search ? `${path}?${search}` : path
}

/** `/pizza` → `/pizza/`, so relative links inside a game resolve against it. */
export function normaliseLocation(): void {
  const { pathname, search, hash } = window.location
  const route = routeFor(pathname)
  if (route !== 'home' && !pathname.endsWith('/')) {
    window.history.replaceState(null, '', `${pathname}/${search}${hash}`)
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => routeFor(window.location.pathname))
}

/** Changes whenever the path or query does, e.g. switching from today's puzzle to a past one. */
export function useLocationKey(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname + window.location.search)
}

export function navigate(route: Route, search = ''): void {
  window.history.pushState(null, '', hrefFor(route, search))
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}
