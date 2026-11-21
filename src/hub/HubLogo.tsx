import { useLayoutEffect, useRef, useState } from 'react'

const W = 360
const LINE = 'BIG POTATO GAMES'
/** The caret goes in the gap before this word, like a proofreader's insertion mark. */
const INSERT_BEFORE = 'GAMES'
const SIZE = 50
const BASELINE = 64
const RISE = 18

/**
 * "BIG POTATO GAMES" on the advent-calendar arch, with a hand-drawn proofreader's
 * caret pushed up into the gap before GAMES and DAILY scrawled underneath - Big
 * Potato Games, with Daily written in.
 *
 * The caret sits wherever that gap actually lands on the arch, which depends on the
 * font, so it's measured once the lettering has rendered (and again once the web
 * font has loaded).
 */
export function HubLogo() {
  const textRef = useRef<SVGTextElement>(null)
  const [gap, setGap] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const text = textRef.current
      if (!text) return
      const i = LINE.indexOf(INSERT_BEFORE)
      try {
        // Midway between the end of the word before and the start of the inserted-before word.
        const before = text.getEndPositionOfChar(i - 2)
        const after = text.getStartPositionOfChar(i)
        setGap({ x: (before.x + after.x) / 2, y: (before.y + after.y) / 2 })
      } catch {
        // Not laid out yet; the font-ready pass below will try again.
      }
    }
    measure()
    const mounted = { current: true }
    void document.fonts?.ready.then(() => mounted.current && measure())
    return () => {
      mounted.current = false
    }
  }, [])

  const x0 = 10
  const d = `M ${x0} ${BASELINE + RISE} Q ${W / 2} ${BASELINE - RISE} ${W - x0} ${BASELINE + RISE}`

  return (
    <h1 className="hub-logo">
      <span className="visually-hidden">Big Potato Games Daily</span>
      <svg viewBox={`0 0 ${W} 170`} aria-hidden="true">
        <defs>
          <path id="hub-logo-arch" d={d} />
        </defs>
        <text ref={textRef} className="hub-logo__line" style={{ fontSize: SIZE }} textLength={W - x0 * 2} lengthAdjust="spacingAndGlyphs" textAnchor="middle">
          <textPath href="#hub-logo-arch" startOffset="50%">
            {LINE}
          </textPath>
        </text>
        {gap ? (
          <g transform={`translate(${gap.x} ${gap.y + 2})`}>
            {/* The caret: tip pushed up into the gap, legs spreading down. */}
            <path className="hub-logo__caret" d="M -21 42 Q -8 20 0 0 Q 9 22 22 40" />
            <text className="hub-logo__insert" x="4" y="84" textAnchor="middle" transform="rotate(-6 4 66)">
              DAILY
            </text>
          </g>
        ) : null}
      </svg>
    </h1>
  )
}
