import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { hrefFor, navigate, type Route } from './router'

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route }

/** A real link (so it can be opened in a new tab) that switches route without a reload. */
export function Link({ to, onClick, ...props }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={hrefFor(to)} onClick={handle} {...props} />
}
