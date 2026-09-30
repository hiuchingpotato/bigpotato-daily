import { TIMER_ENABLED } from '../config'
import type { Slice } from './types'
import { sliceEmoji } from './slice'

export function shareText(puzzle: number, total: number, slice: Slice, secondsLeft: number, complete: boolean): string {
  const time = complete && TIMER_ENABLED ? `⏱ ${secondsLeft}s to spare` : `${slice.filter(Boolean).length}/9 triangles`
  return `🍕 P for Pizza Daily #${puzzle}\n${total} pts · ${time}\n\n${sliceEmoji(slice)}`
}

/** Native share sheet on phones, clipboard everywhere else (or when sharing is blocked). */
export async function share(text: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const full = `${text}\n${window.location.origin}`
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

export function sliceCode(slice: Slice): string {
  return slice.map((t) => (t ? t.prompt.difficulty[0] : '-')).join('')
}
