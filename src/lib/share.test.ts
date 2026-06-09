import { describe, it, expect } from 'vitest'
import { encodeShare, decodeShare, type SharePayload } from './share'

const sample: SharePayload = {
  input: 'explain recursion simply',
  promptType: 'General',
  mode: 'balanced',
  effort: 'medium',
  outputs: [
    { id: 0, label: 'Option 1 - Direct', text: 'A unicode 汉文 test', status: 'done' },
    { id: 1, label: 'Option 2 - Structured', text: 'B', status: 'done' },
    { id: 2, label: 'Option 3 - Concise', text: 'C', status: 'done' },
  ],
}

describe('share codec', () => {
  it('round-trips a run, including unicode', async () => {
    expect(await decodeShare(await encodeShare(sample))).toEqual(sample)
  })

  it('produces a URL-safe string (no + / =)', async () => {
    expect(await encodeShare(sample)).not.toMatch(/[+/=]/)
  })

  it('returns null for malformed input', async () => {
    expect(await decodeShare('not valid base64 $$$')).toBeNull()
    expect(await decodeShare('')).toBeNull()
  })

  it('returns null for invalid mode/effort values', async () => {
    const normalized = await encodeShare({
      input: 'bad-mode',
      promptType: 'General',
      mode: 'balanced',
      effort: 'medium',
      outputs: sample.outputs,
    })
    expect((await decodeShare(normalized))).toMatchObject({ mode: 'balanced' })

    const badMode = {
      input: 'bad-mode',
      promptType: 'General',
      mode: 'invalid-mode' as unknown,
      effort: 'medium',
      outputs: sample.outputs,
    } as unknown as SharePayload

    const badEffort = {
      input: 'bad-effort',
      promptType: 'General',
      mode: 'balanced',
      effort: 'invalid-effort' as unknown,
      outputs: sample.outputs,
    } as unknown as SharePayload

    expect(await decodeShare(await encodeShare(badMode))).toBeNull()
    expect(await decodeShare(await encodeShare(badEffort))).toBeNull()
  })

  it('returns null for invalid output status', async () => {
    const malformed = {
      input: 'bad output',
      promptType: 'General',
      mode: 'balanced',
      effort: 'medium',
      outputs: [{ ...sample.outputs[0], status: 'panic' as unknown }],
    } as unknown as SharePayload

    expect(await decodeShare(await encodeShare(malformed))).toBeNull()
  })

  it('supports legacy unprefixed hash payloads', async () => {
    const encoded = await encodeShare(sample)
    const legacy = encoded.slice(2)
    expect(await decodeShare(legacy)).toEqual(sample)
  })
})
