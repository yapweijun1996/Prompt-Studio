import type { OutputCard, GenerationMode, EffortLevel } from '../types'

const MODES = ['creative', 'balanced', 'strict'] as const
const EFFORTS = ['low', 'medium', 'high', 'xhigh'] as const
const OUTPUT_STATUSES = ['loading', 'done', 'error'] as const

// What a shared link carries - a subset of one Convert run.
export interface SharePayload {
  input: string
  promptType: string
  mode: GenerationMode
  effort: EffortLevel
  outputs: OutputCard[]
}

function isMode(v: unknown): v is GenerationMode {
  return typeof v === 'string' && (MODES as readonly string[]).includes(v)
}

function isEffort(v: unknown): v is EffortLevel {
  return typeof v === 'string' && (EFFORTS as readonly string[]).includes(v)
}

function isOutputStatus(v: unknown): v is OutputCard['status'] {
  return typeof v === 'string' && (OUTPUT_STATUSES as readonly string[]).includes(v)
}

function isOutputCard(v: unknown): v is OutputCard {
  if (!v || typeof v !== 'object') return false
  const card = v as Record<string, unknown>
  if (typeof card.id !== 'number' || typeof card.label !== 'string' || typeof card.text !== 'string') return false
  if (!isOutputStatus(card.status)) return false
  if (card.error != null && typeof card.error !== 'string') return false
  return true
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
    const parsed: unknown = JSON.parse(base64UrlToUtf8(encoded))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

    const raw = parsed as Record<string, unknown>
    if (typeof raw.input !== 'string') return null
    if (!isMode(raw.mode) || !isEffort(raw.effort)) return null
    if (!raw.promptType || typeof raw.promptType !== 'string') return null
    const outputs = raw.outputs
    if (!Array.isArray(outputs) || !outputs.every(isOutputCard)) return null

    return {
      input: raw.input,
      promptType: raw.promptType,
      mode: raw.mode,
      effort: raw.effort,
      outputs: outputs as OutputCard[],
    }
  } catch {
    return null
  }
}

/** Full shareable URL carrying the run in a local-first `#c=` hash. */
export function buildShareUrl(p: SharePayload): string {
  return `${location.origin}${location.pathname}#c=${encodeShare(p)}`
}
