// Card backgrounds, drawn in code as stand-ins for the real Big Potato artwork
// (the P for Pizza triangle cards and the Sling 'Em space panel). Both are fixed
// patterns, so they look the same on every render and every device.

const LETTERS = 'BPACMSTHWDLRGFNOEKUJ'

/** Yellow triangle cards with letters, like the P for Pizza letter deck laid out on a table. */
export function TrianglePattern() {
  const size = 46
  const h = (size * Math.sqrt(3)) / 2
  const cols = 14
  const rows = 6
  const shades = ['#ffd23f', '#ffc928', '#ffdb5c', '#ffcf33']
  const tris: { points: string; fill: string; letter: string; x: number; y: number; up: boolean }[] = []
  let n = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const up = (r + c) % 2 === 0
      const x = (c * size) / 2 - size / 2
      const y = r * h
      const points = up
        ? `${x},${y + h} ${x + size / 2},${y} ${x + size},${y + h}`
        : `${x},${y} ${x + size},${y} ${x + size / 2},${y + h}`
      tris.push({ points, fill: shades[(r * 3 + c * 7) % shades.length], letter: LETTERS[n % LETTERS.length], x: x + size / 2, y: y + (up ? h * 0.68 : h * 0.4), up })
      n += 7
    }
  }
  return (
    <svg className="art art--pizza" viewBox={`0 0 ${(cols * size) / 2 - size / 2} ${rows * h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="100%" height="100%" fill="#fff6dc" />
      {tris.map((t, i) => (
        <g key={i}>
          <polygon points={t.points} fill={t.fill} stroke="#fff6dc" strokeWidth="3" strokeLinejoin="round" />
          <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" className="art__letter" transform={t.up ? undefined : `rotate(180 ${t.x} ${t.y})`}>
            {t.letter}
          </text>
        </g>
      ))}
      {/* One category card face-up, like the reference photo. */}
      <polygon points={`${size * 3},${h * 3} ${size * 3.5},${h * 2} ${size * 4},${h * 3}`} fill="#f7b8c4" stroke="#fff6dc" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

/** Fixed star field: a simple LCG, so it's identical everywhere. */
const STARS = (() => {
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: 70 }, () => ({ x: rand() * 320, y: rand() * 200, r: rand() < 0.15 ? 1.6 : 0.8 }))
})()

/** Deep space with a row of planets, after the "How one Sling led to another" panel. */
export function SpaceScene() {
  const stars = STARS
  return (
    <svg className="art art--space" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="space-glow" cx="70%" cy="20%" r="80%">
          <stop offset="0" stopColor="#24305e" />
          <stop offset="1" stopColor="#0b1020" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill="url(#space-glow)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.r > 1 ? 0.9 : 0.6} />
      ))}
      {/* Planets, sized and coloured like the comic's solar system row. */}
      <g stroke="#0b1020" strokeWidth="2">
        <circle cx="198" cy="46" r="9" fill="#e04b3c" />
        <circle cx="228" cy="40" r="13" fill="#f2c14e" />
        <ellipse cx="228" cy="40" rx="22" ry="5" fill="none" stroke="#f7e2a6" strokeWidth="2.5" />
        <circle cx="262" cy="50" r="11" fill="#3ba7d8" />
        <circle cx="290" cy="38" r="7" fill="#9b6fd4" />
        <circle cx="306" cy="58" r="5" fill="#5ccb72" />
      </g>
    </svg>
  )
}
