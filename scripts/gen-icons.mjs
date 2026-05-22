// Generates Prompt Studio PWA icons from scratch — no image deps.
// Pure Node: builds an RGBA buffer, encodes PNG via zlib, wraps a favicon ICO.
import { deflateSync, crc32 } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
mkdirSync(publicDir, { recursive: true })

const BG = [0x63, 0x66, 0xf1] // brand indigo
const FG = [0xff, 0xff, 0xff] // white

// Is normalized point (nx, ny) inside the "P" glyph? Kept within the
// maskable safe zone (central 80%).
function inP(nx, ny) {
  const pTop = 0.26, pBottom = 0.74
  const stemX1 = 0.37, stemX2 = 0.47
  const bowlX2 = 0.63, bowlBottom = 0.51
  const thick = 0.08
  if (ny < pTop || ny > pBottom) return false
  if (nx >= stemX1 && nx <= stemX2) return true // stem
  if (ny <= bowlBottom && nx >= stemX1 && nx <= bowlX2) {
    const inHole =
      nx > stemX2 && nx < bowlX2 - thick &&
      ny > pTop + thick && ny < bowlBottom - thick
    if (!inHole) return true // bowl ring
  }
  return false
}

function makePixels(size) {
  const buf = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b] = inP((x + 0.5) / size, (y + 0.5) / size) ? FG : BG
      const i = (y * size + x) * 4
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255
    }
  }
  return buf
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body) >>> 0)
  return Buffer.concat([len, body, crc])
}

function encodePNG(size) {
  const pixels = makePixels(size)
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const stride = size * 4 + 1
  const raw = Buffer.alloc(size * stride)
  for (let y = 0; y < size; y++) {
    pixels.copy(raw, y * stride + 1, y * size * 4, y * size * 4 + size * 4)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function encodeICO(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // image count
  const entry = Buffer.alloc(16)
  entry[0] = size >= 256 ? 0 : size
  entry[1] = size >= 256 ? 0 : size
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, png])
}

const targets = [
  ['pwa-192x192.png', encodePNG(192)],
  ['pwa-512x512.png', encodePNG(512)],
  ['apple-touch-icon.png', encodePNG(180)],
  ['favicon.ico', encodeICO(encodePNG(32), 32)],
]

for (const [name, buf] of targets) {
  writeFileSync(join(publicDir, name), buf)
  console.log(`wrote public/${name} (${buf.length} bytes)`)
}
