import { describe, it, expect } from 'vitest'
import { encodeShare, decodeShare, type SharePayload } from './share'

const sample: SharePayload = {
  input: 'explain recursion simply',
  promptType: 'General',
  mode: 'balanced',
  effort: 'medium',
  outputs: [
    { id: 0, label: 'Option 1 — Direct', text: 'A · 日本語 — ünïcode', status: 'done' },
    { id: 1, label: 'Option 2 — Structured', text: 'B', status: 'done' },
    { id: 2, label: 'Option 3 — Concise', text: 'C', status: 'done' },
  ],
}

describe('share codec', () => {
  it('round-trips a run, including unicode', () => {
    expect(decodeShare(encodeShare(sample))).toEqual(sample)
  })

  it('produces a URL-safe string (no + / =)', () => {
    expect(encodeShare(sample)).not.toMatch(/[+/=]/)
  })

  it('returns null for malformed input', () => {
    expect(decodeShare('not valid base64 $$$')).toBeNull()
    expect(decodeShare('')).toBeNull()
  })
})
