const W = 360
const SIZE = 50
const X0 = 12
const BASELINE = 70
const RISE = 20

/**
 * "BIG POTATO GAMES" on the advent-calendar arch, with DAILY rubber-stamped across
 * the end of it: a tilted red stamp with a dashed inner border and slightly inky
 * edges, overlapping the bottom of GAMES as if it was stamped on top. It lands with
 * a quick "thunk" when the page opens.
 */
export function HubLogo() {
  const arch = `M ${X0} ${BASELINE + RISE} Q ${W / 2} ${BASELINE - RISE} ${W - X0} ${BASELINE + RISE}`

  return (
    <h1 className="hub-logo">
      <span className="visually-hidden">Big Potato Games Daily</span>
      <svg viewBox={`0 0 ${W} 150`} aria-hidden="true">
        <defs>
          <path id="hub-logo-arch" d={arch} />
          {/* A little roughness on the stamp's edges, like ink on paper. */}
          <filter id="hub-logo-ink" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.2" />
          </filter>
        </defs>

        <text className="hub-logo__line" style={{ fontSize: SIZE }} textLength={W - X0 * 2} lengthAdjust="spacingAndGlyphs" textAnchor="middle">
          <textPath href="#hub-logo-arch" startOffset="50%">
            BIG POTATO GAMES
          </textPath>
        </text>

        <g transform="translate(262 112) rotate(-8)">
          <g className="hub-logo__stamp">
            <g filter="url(#hub-logo-ink)">
              <rect className="hub-logo__stamp-body" x="-74" y="-25" width="148" height="50" rx="11" />
              <rect className="hub-logo__stamp-rule" x="-66" y="-17" width="132" height="34" rx="7" />
            </g>
            <text className="hub-logo__stamp-text" x="0" y="11" textAnchor="middle">
              DAILY
            </text>
            {/* Drawn, not ★ characters: Chewy has no star, and the fallback glyph is huge. */}
            <polygon className="hub-logo__stamp-star" points="0.0,-7.0 1.8,-2.4 6.7,-2.2 2.9,0.9 4.1,5.7 0.0,3.0 -4.1,5.7 -2.9,0.9 -6.7,-2.2 -1.8,-2.4" transform="translate(-50 0)" />
            <polygon className="hub-logo__stamp-star" points="0.0,-7.0 1.8,-2.4 6.7,-2.2 2.9,0.9 4.1,5.7 0.0,3.0 -4.1,5.7 -2.9,0.9 -6.7,-2.2 -1.8,-2.4" transform="translate(50 0)" />
          </g>
        </g>
      </svg>
    </h1>
  )
}
