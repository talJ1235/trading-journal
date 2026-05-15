const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

function crc32(data) {
  let crc = 0xffffffff
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type), data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([len, typeAndData, crcBuf])
}

// Creates a solid-color PNG with a centred circle accent
function createIconPNG(size) {
  const bgR = 15, bgG = 15, bgB = 15        // #0F0F0F
  const acR = 37, acG = 99, acB = 235        // ~blue-600 as fill
  const textR = 147, textG = 197, textB = 253 // blue-300

  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38

  const rowSize = 1 + size * 3
  const rawData = Buffer.alloc(size * rowSize)

  for (let y = 0; y < size; y++) {
    const offset = y * rowSize
    rawData[offset] = 0
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const inCircle = (dx * dx + dy * dy) <= radius * radius
      rawData[offset + 1 + x * 3]     = inCircle ? acR : bgR
      rawData[offset + 1 + x * 3 + 1] = inCircle ? acG : bgG
      rawData[offset + 1 + x * 3 + 2] = inCircle ? acB : bgB
    }
  }

  // Suppress unused var warning — textR/G/B reserved for future text rendering
  void textR; void textG; void textB

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(rawData)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = path.join(__dirname, '..', 'public', 'icons')
const publicDir = path.join(__dirname, '..', 'public')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createIconPNG(192))
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createIconPNG(512))
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIconPNG(180))
console.log('Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png')
