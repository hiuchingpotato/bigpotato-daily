import { describe, expect, it } from 'vitest'
import type { Prompt } from '../herd/prompts'
import { matchInput, suggestion } from './match'

function prompt(question: string, answers: string[]): Prompt {
  return {
    id: 0,
    question,
    answers: answers.map((a, i) => {
      const [text, ...aliases] = a.split('/')
      return { text: text!, aliases, weight: answers.length - i }
    }),
  }
}

const salad = prompt('Name a type of salad.', ['Caesar', 'Greek', 'Potato', 'Fruit', 'Waldorf', 'Coleslaw'])
const charles = prompt('Name a famous Charles.', ['King Charles/prince charles', 'Charles Dickens/dickens', 'Charles Darwin/darwin'])
const crisps = prompt('Name a crisp flavour.', ['Salt and vinegar', 'Cheese and onion', 'Ready salted/plain'])

describe('matching', () => {
  it('ignores the question’s own words: "caesar salad" is Caesar', () => {
    expect(matchInput(salad, 'Caesar salad')).toEqual({ index: 0, exact: true })
    expect(matchInput(salad, 'a greek salad')).toEqual({ index: 1, exact: true })
    expect(matchInput(salad, 'Potato salads')).toEqual({ index: 2, exact: true })
  })

  it('forgives small typos, with or without the extra word', () => {
    expect(matchInput(salad, 'cesar').index).toBe(0)
    expect(matchInput(salad, 'cesar salad').index).toBe(0)
    expect(matchInput(salad, 'cesar').exact).toBe(false)
  })

  it('finds an answer with extra words around it', () => {
    expect(matchInput(charles, 'Charles Dickens the author').index).toBe(1)
    expect(matchInput(charles, 'King Charles III').index).toBe(0)
    expect(matchInput(charles, 'darwin').index).toBe(2)
  })

  it('keeps answers made of the question’s words', () => {
    expect(matchInput(crisps, 'salt & vinegar').index).toBe(0)
    expect(matchInput(crisps, 'plain').index).toBe(2)
  })

  it('doesn’t match something else, or the category on its own', () => {
    expect(matchInput(salad, 'Nicoise').index).toBe(-1)
    expect(matchInput(salad, 'salad').index).toBe(-1)
    expect(matchInput(salad, '').index).toBe(-1)
  })
})

describe('"Do you mean …?"', () => {
  it('offers the answer for a near-miss', () => {
    expect(suggestion(salad, 'cesar')).toBe('Caesar')
    expect(suggestion(salad, 'waldorph')).toBe('Waldorf')
    expect(suggestion(charles, 'charles dikkens')).toBe('Charles Dickens')
  })

  it('stays quiet when it’s already right, too short, or nowhere near', () => {
    expect(suggestion(salad, 'Caesar salad')).toBeNull()
    expect(suggestion(salad, 'gre')).toBeNull()
    expect(suggestion(salad, 'tuna')).toBeNull()
  })
})
