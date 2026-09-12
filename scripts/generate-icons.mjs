import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../public')

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

function writePng(size, path) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const i = row + 1 + x * 4
      const nx = (x + 0.5) / size
      const ny = (y + 0.5) / size
      const inCard = nx > 0.23 && nx < 0.77 && ny > 0.19 && ny < 0.81
      const inCheck = (nx - 0.73) ** 2 + (ny - 0.73) ** 2 < 0.12 ** 2
      if (inCheck) {
        raw[i] = 34
        raw[i + 1] = 197
        raw[i + 2] = 94
        raw[i + 3] = 255
      } else if (inCard) {
        raw[i] = 255
        raw[i + 1] = 255
        raw[i + 2] = 255
        raw[i + 3] = 255
      } else {
        raw[i] = 79
        raw[i + 1] = 70
        raw[i + 2] = 229
        raw[i + 3] = 255
      }
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
}

writePng(192, join(dir, 'icon-192.png'))
writePng(512, join(dir, 'icon-512.png'))
