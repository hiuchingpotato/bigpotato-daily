export type Difficulty = 'green' | 'yellow' | 'red'

export interface Category {
  id: string
  name: string
  difficulty: Difficulty
  /** Accepted answers. Use `|` to separate aliases of the same answer, e.g. `usa|united states`. */
  answers: string[]
}

/** One category card edge facing one letter card — the thing players "shout" at. */
export interface Prompt {
  id: string
  categoryId: string
  categoryName: string
  difficulty: Difficulty
  letter: string
}

/** A triangle the player has won and placed in their slice. */
export interface WonTriangle {
  prompt: Prompt
  answer: string
  /** Seconds into the round when it was won. */
  at: number
}

/** Slot index 0 is the top of the slice, 1-3 the middle row, 4-8 the bottom (crust) row. */
export type Slice = (WonTriangle | null)[]
