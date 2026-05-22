const CIPHER_KEY = '20260515'

export function xorEncrypt(plaintext: string): string {
  return Array.from(plaintext)
    .map((c, i) => (c.charCodeAt(0) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length)).toString(16).padStart(2, '0'))
    .join('')
}

export function xorDecrypt(hex: string): string {
  const pairs = hex.match(/.{2}/g) ?? []
  return pairs
    .map((h, i) => String.fromCharCode(parseInt(h, 16) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length)))
    .join('')
}

const STORAGE_KEY = 'ps_k'

export function saveApiKey(plaintext: string): void {
  if (!plaintext) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, xorEncrypt(plaintext))
}

export function loadApiKey(): string {
  const hex = localStorage.getItem(STORAGE_KEY)
  return hex ? xorDecrypt(hex) : ''
}
