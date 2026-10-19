import { LINE, WHITE } from './palette'

/**
 * Japanese text for the pixel UI. The browser's own font draws it once into an offscreen canvas, then every pixel
 * is snapped to the palette: solid ink or nothing, with a 1px LINE outline around it, so it sits with the sealed sprites
 * (no anti-aliased in-between colours). Cached per text, size and colour.
 */
const cache = new Map<string, HTMLCanvasElement>()
const FONT = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif'

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** The baked text: `size` is the font size in internal pixels. */
export function jpText(text: string, size: number, color: string): HTMLCanvasElement {
  const key = `${size}|${color}|${text}`
  const hit = cache.get(key)
  if (hit) return hit
  const probe = document.createElement('canvas').getContext('2d')
  let w = text.length * size + 4
  if (probe) {
    probe.font = `bold ${size}px ${FONT}`
    w = Math.ceil(probe.measureText(text).width) + 4
  }
  const h = size + 6
  const el = document.createElement('canvas')
  el.width = Math.max(1, w)
  el.height = h
  const ctx = el.getContext('2d')
  if (!ctx) return el
  ctx.font = `bold ${size}px ${FONT}`
  ctx.textBaseline = 'top'
  ctx.fillStyle = LINE
  ctx.fillText(text, 2, 2)
  const img = ctx.getImageData(0, 0, el.width, h)
  const d = img.data
  const ink = new Uint8Array(el.width * h)
  for (let i = 0; i < ink.length; i++) ink[i] = (d[i * 4 + 3] ?? 0) >= 120 ? 1 : 0
  const [r, g, b] = hexRgb(color)
  const [lr, lg, lb] = hexRgb(LINE)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < el.width; x++) {
      const i = y * el.width + x
      const o = i * 4
      if (ink[i]) {
        d[o] = r
        d[o + 1] = g
        d[o + 2] = b
        d[o + 3] = 255
        continue
      }
      const near =
        (x > 0 && ink[i - 1]) || (x + 1 < el.width && ink[i + 1]) || (y > 0 && ink[i - el.width]) || (y + 1 < h && ink[i + el.width])
      if (near) {
        d[o] = lr
        d[o + 1] = lg
        d[o + 2] = lb
        d[o + 3] = 255
      } else {
        d[o + 3] = 0
      }
    }
  }
  ctx.putImageData(img, 0, 0)
  cache.set(key, el)
  return el
}

/** Draw Japanese text with its top-left at x, y (internal pixels). Returns the width drawn. */
export function drawJP(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string): number {
  if (typeof document === 'undefined') return 0
  const el = jpText(text, size, color)
  ctx.drawImage(el, Math.round(x) - 2, Math.round(y) - 2)
  return el.width - 4
}

/** Width the text will take, for centring. */
export function jpWidth(text: string, size: number): number {
  if (typeof document === 'undefined') return text.length * size
  return jpText(text, size, WHITE).width - 4
}
