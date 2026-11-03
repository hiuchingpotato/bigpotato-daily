import { useEffect, useState } from 'react'

function untilMidnight() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function Countdown() {
  const [t, setT] = useState(untilMidnight)
  useEffect(() => {
    const id = setInterval(() => setT(untilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="countdown">{t}</span>
}
