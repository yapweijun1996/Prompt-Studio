import { describe, it, expect } from 'vitest'
import { xorEncrypt, xorDecrypt } from './xor'

describe('xor cipher', () => {
  it('round-trips an API key', () => {
    const key = 'sk-test-abc123XYZ-_.'
    expect(xorDecrypt(xorEncrypt(key))).toBe(key)
  })

  // The cipher is byte-oriented and scoped to ASCII API keys by design.
  it('round-trips the full printable ASCII range', () => {
    let s = ''
    for (let i = 32; i < 127; i++) s += String.fromCharCode(i)
    expect(xorDecrypt(xorEncrypt(s))).toBe(s)
  })

  it('produces hex output that does not leak the plaintext', () => {
    const out = xorEncrypt('hello')
    expect(out).toMatch(/^[0-9a-f]+$/)
    expect(out).not.toContain('hello')
  })
})
