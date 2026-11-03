import { useSyncExternalStore } from 'react'

// Three routes, so no router library. Paths sit under BASE_URL (which always ends in a
// slash) so the same build works at a domain root or a GitHub Pages project path.
// Game routes keep a trailing slash: Closer's archive links are relative (`./`, `?puzzle=3`).

export type Route = 'home' | 'pizza' | 'closer'

const BASE = import.meta.env.BASE_URL

export function routeFor(pathname: string): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  const first = rest.split('/')[0]
  return first === 'pizza' || first === 'closer' ? first : 'home'
}

export function hrefFor(route: Route): string {
  return route === 'home' ? BASE : `${BASE}${route}/`
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

export function navigate(route: Route): void {
  window.history.pushState(null, '', hrefFor(route))
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}
