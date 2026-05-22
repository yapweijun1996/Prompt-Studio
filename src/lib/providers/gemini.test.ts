import { describe, it, expect } from 'vitest'
import { clampBudget } from './gemini'

describe('clampBudget', () => {
  it('caps Flash models at 24576', () => {
    expect(clampBudget('gemini-2.5-flash', 32768)).toBe(24576)
  })

  it('caps Pro models at 32768', () => {
    expect(clampBudget('gemini-2.5-pro', 999999)).toBe(32768)
  })

  it('passes -1 (dynamic thinking) through unchanged', () => {
    expect(clampBudget('gemini-2.5-flash', -1)).toBe(-1)
  })

  it('leaves an in-range budget alone', () => {
    expect(clampBudget('gemini-2.5-pro', 8192)).toBe(8192)
  })
})
