import type { CSSProperties } from 'react'
import type { Outcome } from '../mentality/mentality'
import type { Outcome as HerdOutcome } from './herd'

const ART = `${import.meta.env.BASE_URL}herd/`

/** Sits in a line of text like an emoji would. */
const INLINE: CSSProperties = { display: 'inline-block', height: '1.3em', width: 'auto', verticalAlign: '-0.3em' }

/**
 * A cow's head, in place of the 🐄 / 🩷 emoji, for both herd games: the black-and-white
 * one from the FigJam board, or the pink cow's (cut from its artwork with
 * tools/herd/cutout.py pinkhead).
 */
export function CowHead({ pink = false, label }: { pink?: boolean; label?: string }) {
  return (
    <img
      src={`${ART}${pink ? 'pink-cow-head' : 'cow-head'}.png`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      style={INLINE}
    />
  )
}

/** Herd vs The world's result, as the home page shows it. */
export function HerdOutcomeLabel({ outcome }: { outcome: HerdOutcome }) {
  if (outcome === 'herd')
    return (
      <>
        <CowHead /> In the herd
      </>
    )
  if (outcome === 'pink')
    return (
      <>
        <CowHead pink /> Pink cow
      </>
    )
  return <>Close to the herd</>
}

/** A Herd Mentality round's outcome as a little icon: the cow heads for herd and pink, emoji for the rest. */
export function OutcomeIcon({ outcome }: { outcome: Outcome }) {
  if (outcome === 'herd') return <CowHead label="In the herd" />
  if (outcome === 'pink') return <CowHead pink label="Pink cow" />
  return <span aria-label={outcome === 'meh' ? 'More or less' : 'Out of time'}>{outcome === 'meh' ? '🌾' : '⏰'}</span>
}
