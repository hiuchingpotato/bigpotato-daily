import type { Prompt } from '../game/types'
import { POINTS } from '../game/slice'

interface Props {
  prompt: Prompt | null
  noRoom: boolean
  onSkip: () => void
  flash?: boolean
}

const LABEL = { green: 'Easy', yellow: 'Medium', red: 'Hard' } as const

export function PromptCard({ prompt, noRoom, onSkip, flash }: Props) {
  if (!prompt) return <div className="prompt prompt--empty">No cards left</div>
  return (
    <div className={`prompt prompt--${prompt.difficulty} ${noRoom ? 'prompt--full' : ''} ${flash ? 'prompt--flash' : ''}`}>
      <div className="prompt__letter" aria-label={`Letter ${prompt.letter}`}>
        {prompt.letter}
      </div>
      <div className="prompt__body">
        <div className="prompt__category">{prompt.categoryName}</div>
        <div className="prompt__meta">
          {noRoom ? 'No room in your slice' : `${LABEL[prompt.difficulty]} · +${POINTS[prompt.difficulty]}`}
        </div>
      </div>
      <button type="button" className="prompt__skip" onClick={onSkip} aria-label={`Skip ${prompt.categoryName} ${prompt.letter} (−5 seconds)`}>
        Skip
      </button>
    </div>
  )
}
