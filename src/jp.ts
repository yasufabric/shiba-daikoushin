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

/**
 * Plain text in the phone's own font (play-test: "普通の字でいい"). Queued in internal pixels while the frame is painted,
 * then drawn by `flushPlain` onto the display canvas after the upscale, at full device resolution and anti-aliased,
 * so small explanatory text reads like any app's text. The one deliberate exception to the palette-snapped pixel text.
 */
interface Plain {
  text: string
  x: number
  y: number
  size: number
  color: string
  align: CanvasTextAlign
  bold: boolean
  outline: string
}
const plain: Plain[] = []

export function queuePlain(text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', bold = false, outline = ''): void {
  plain.push({ text, x, y, size, color, align, bold, outline })
}

let measure: CanvasRenderingContext2D | null = null

/** Width in internal px of `text` as queuePlain will draw it (measured at 4× for a steadier number). */
export function plainWidth(text: string, size: number, bold = false): number {
  if (!measure) measure = document.createElement('canvas').getContext('2d')
  if (!measure) return text.length * size
  measure.font = `${bold ? 'bold' : '600'} ${size * 4}px ${FONT}`
  return Math.ceil(measure.measureText(text).width / 4)
}

/** Draw and clear the queue: internal (x, y) lands at (ox + x * scale, oy + y * scale) in CSS px on `ctx`. */
export function flushPlain(ctx: CanvasRenderingContext2D, ox: number, oy: number, scale: number): void {
  if (plain.length === 0) return
  ctx.save()
  ctx.textBaseline = 'top'
  for (const p of plain) {
    ctx.font = `${p.bold ? 'bold' : '600'} ${Math.round(p.size * scale)}px ${FONT}`
    ctx.textAlign = p.align
    if (p.outline) {
      // A dark rim so the words read over grass and dogs.
      ctx.lineJoin = 'round'
      ctx.lineWidth = Math.max(2, scale * 1.5)
      ctx.strokeStyle = p.outline
      ctx.strokeText(p.text, ox + p.x * scale, oy + p.y * scale)
    }
    ctx.fillStyle = p.color
    ctx.fillText(p.text, ox + p.x * scale, oy + p.y * scale)
  }
  ctx.restore()
  plain.length = 0
}
