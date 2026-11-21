type Line = { text: string; size: number; width: number }

const W = 360

/** One arch per line, stacked top to bottom. */
function layout(lines: Line[]) {
  let y = 0
  const paths = lines.map((line, i) => {
    y += line.size * 0.95
    const x0 = (W - line.width) / 2
    // A shallow quadratic arch: the middle sits higher than the ends, like the banner.
    const rise = line.size * 0.42
    const d = `M ${x0} ${y + rise} Q ${W / 2} ${y - rise} ${x0 + line.width} ${y + rise}`
    y += rise + 6
    return { ...line, d, id: `arch-${i}` }
  })
  return { paths, height: y + 16 }
}

/**
 * Lettering after the Christmas Advent Calendar banner: Chewy, white with a thick dark
 * outline and offset shadow, set along gentle arches. Each line is stretched to a fixed
 * width so the arches stay balanced whatever the font's exact metrics.
 */
export function ArchTitle({ lines, label }: { lines: Line[]; label: string }) {
  const { paths, height } = layout(lines)

  return (
    <h1 className="arch-title">
      <span className="visually-hidden">{label}</span>
      <svg viewBox={`0 0 ${W} ${height}`} aria-hidden="true">
        <defs>
          {paths.map((p) => (
            <path key={p.id} id={p.id} d={p.d} />
          ))}
        </defs>
        {paths.map((p) => (
          <text key={p.id} className="arch-title__line" style={{ fontSize: p.size }} textLength={p.width} lengthAdjust="spacingAndGlyphs" textAnchor="middle">
            <textPath href={`#${p.id}`} startOffset="50%">
              {p.text}
            </textPath>
          </text>
        ))}
      </svg>
    </h1>
  )
}
