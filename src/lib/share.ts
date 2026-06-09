import type { OutputCard, GenerationMode, EffortLevel } from '../types'

const MODES = ['creative', 'balanced', 'strict'] as const
const EFFORTS = ['low', 'medium', 'high', 'xhigh'] as const
const OUTPUT_STATUSES = ['loading', 'done', 'error'] as const
const SHARE_COMPRESSION_PREFIX = '1.'
const SHARE_PLAIN_PREFIX = '0.'

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
  return bytesToBase64Url(bytes)
}

function bytesToBase64Url(bytes: Uint8Array): string {
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

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

export async function encodeShare(p: SharePayload): Promise<string> {
  const plain = JSON.stringify(p)
  const plainEncoded = utf8ToBase64Url(plain)
  if (typeof CompressionStream === 'undefined') return `${SHARE_PLAIN_PREFIX}${plainEncoded}`
  try {
    const compressed = new Blob([plain]).stream().pipeThrough(new CompressionStream('gzip'))
    const bytes = new Uint8Array(await new Response(compressed).arrayBuffer())
    const compressedEncoded = bytesToBase64Url(bytes)
    return compressedEncoded.length < plainEncoded.length
      ? `${SHARE_COMPRESSION_PREFIX}${compressedEncoded}`
      : `${SHARE_PLAIN_PREFIX}${plainEncoded}`
  } catch {
    return `${SHARE_PLAIN_PREFIX}${plainEncoded}`
  }
}

async function decodeSharePayload(token: string): Promise<string | null> {
  if (token.startsWith(SHARE_COMPRESSION_PREFIX)) {
    const bytes = base64UrlToBytes(token.slice(SHARE_COMPRESSION_PREFIX.length))
    if (typeof DecompressionStream === 'undefined') return null
    try {
      const decompressed = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
      return await new Response(decompressed).text()
    } catch {
      return null
    }
  }

  if (token.startsWith(SHARE_PLAIN_PREFIX)) {
    return base64UrlToUtf8(token.slice(SHARE_PLAIN_PREFIX.length))
  }

  // Backward compatibility with older links that used plain base64 without a prefix.
  try {
    return base64UrlToUtf8(token)
  } catch {
    return null
  }
}

export async function buildShareUrl(p: SharePayload): Promise<string> {
  const encoded = await encodeShare(p)
  return `${location.origin}${location.pathname}#c=${encoded}`
}

export async function decodeShare(encoded: string): Promise<SharePayload | null> {
  try {
    const decoded = await decodeSharePayload(encoded)
    if (!decoded) return null
    const parsed: unknown = JSON.parse(decoded)
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
