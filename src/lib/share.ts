import type { OutputCard, GenerationMode, EffortLevel } from '../types'

// What a shared link carries — a subset of one Convert run.
export interface SharePayload {
  input: string
  promptType: string
  mode: GenerationMode
  effort: EffortLevel
  outputs: OutputCard[]
}

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToUtf8(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeShare(p: SharePayload): string {
  return utf8ToBase64Url(JSON.stringify(p))
}

export function decodeShare(encoded: string): SharePayload | null {
  try {
    const p = JSON.parse(base64UrlToUtf8(encoded)) as SharePayload
    if (typeof p.input === 'string' && Array.isArray(p.outputs)) return p
    return null
  } catch {
    return null
  }
}

/** Full shareable URL carrying the run in a local-first `#c=` hash. */
export function buildShareUrl(p: SharePayload): string {
  return `${location.origin}${location.pathname}#c=${encodeShare(p)}`
}
