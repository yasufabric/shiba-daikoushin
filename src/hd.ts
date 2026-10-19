/**
 * 2D-HD finishing pass (play-test: "high-quality 2D, like the recent HD-2D games").
 *
 * The pixel art itself stays on the closed palette at integer scale. This pass runs afterwards on the full-resolution
 * display canvas, so it is the one place allowed smooth gradients and translucency (the palette test skips this file):
 *  - depth of field: the sky and the rival kennel at the top melt into a soft blur, like a tilt-shift lens;
 *  - bloom: a soft glow of the whole picture laid over it in screen mode;
 *  - light: a time-of-day colour wash (warm sun by day, orange at dusk, cool moonlight at night);
 *  - vignette: the corners fall off into shade.
 * Blur comes from drawing the frame down small and back up with smoothing on, which every browser supports.
 */

export type Light = 'day' | 'dusk' | 'night'

interface Cache {
  w: number
  h: number
  small: HTMLCanvasElement
  dof: HTMLCanvasElement
  light: Light | ''
  wash: CanvasGradient | null
  vignette: CanvasGradient | null
  mask: CanvasGradient | null
}

let cache: Cache | null = null

function canvas(w: number, h: number): HTMLCanvasElement {
  const el = document.createElement('canvas')
  el.width = Math.max(1, w)
  el.height = Math.max(1, h)
  return el
}

const WASH: Record<Light, [string, string, string]> = {
  day: ['rgba(255, 236, 190, 0.32)', 'rgba(255, 245, 220, 0.06)', 'rgba(120, 160, 255, 0.10)'],
  dusk: ['rgba(255, 150, 90, 0.40)', 'rgba(255, 120, 140, 0.12)', 'rgba(80, 40, 120, 0.22)'],
  night: ['rgba(120, 160, 255, 0.28)', 'rgba(60, 80, 160, 0.10)', 'rgba(10, 10, 40, 0.35)'],
}

const BLOOM: Record<Light, number> = { day: 0.18, dusk: 0.22, night: 0.28 }

/**
 * Finish the frame on `ctx` (display pixels, already holding the upscaled pixel art in the rect x, y, w, h).
 * `focusTop` is how far down (display px from y) the blurred band at the top reaches; 0 skips depth of field.
 */
export function finish(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, x: number, y: number, w: number, h: number, light: Light, focusTop: number, glow: boolean, fieldTop = 0, fieldBottom = h): void {
  if (w <= 0 || h <= 0) return
  if (!cache || cache.w !== w || cache.h !== h) {
    cache = {
      w,
      h,
      small: canvas(Math.ceil(w / 6), Math.ceil(h / 6)),
      dof: canvas(w, Math.max(1, Math.ceil(focusTop))),
      light: '',
      wash: null,
      vignette: null,
      mask: null,
    }
  }
  const c = cache
  if (c.light !== light || !c.wash || !c.vignette) {
    const [a, b, d] = WASH[light]
    const wash = ctx.createLinearGradient(x, y, x + w * 0.6, y + h)
    wash.addColorStop(0, a)
    wash.addColorStop(0.55, b)
    wash.addColorStop(1, d)
    c.wash = wash
    const r = Math.hypot(w, h) / 2
    const vig = ctx.createRadialGradient(x + w / 2, y + h * 0.45, r * 0.45, x + w / 2, y + h * 0.45, r * 1.05)
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)')
    vig.addColorStop(1, light === 'night' ? 'rgba(4, 6, 20, 0.62)' : 'rgba(10, 6, 20, 0.42)')
    c.vignette = vig
    c.light = light
  }
  // A small, smoothed copy of the frame: the source for both the blur and the glow.
  const sctx = c.small.getContext('2d')
  if (!sctx) return
  sctx.imageSmoothingEnabled = true
  sctx.imageSmoothingQuality = 'low'
  sctx.drawImage(src, 0, 0, c.small.width, c.small.height)

  ctx.save()
  ctx.imageSmoothingEnabled = true
  // Depth of field: blurred copy over the top band, fading out downwards.
  if (focusTop > 4) {
    if (c.dof.height !== Math.ceil(focusTop)) c.dof.height = Math.ceil(focusTop)
    const dctx = c.dof.getContext('2d')
    if (dctx) {
      dctx.globalCompositeOperation = 'source-over'
      dctx.clearRect(0, 0, c.dof.width, c.dof.height)
      dctx.imageSmoothingEnabled = true
      dctx.drawImage(c.small, 0, 0, c.small.width, c.small.height * (focusTop / h), 0, 0, w, focusTop)
      const mask = dctx.createLinearGradient(0, 0, 0, focusTop)
      mask.addColorStop(0, 'rgba(0, 0, 0, 0.9)')
      mask.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)')
      mask.addColorStop(1, 'rgba(0, 0, 0, 0)')
      dctx.globalCompositeOperation = 'destination-in'
      dctx.fillStyle = mask
      dctx.fillRect(0, 0, w, focusTop)
      ctx.drawImage(c.dof, x, y)
    }
  }
  // Bloom (play only: it would soften menu text).
  if (glow) {
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = BLOOM[light]
    // Only over the field: the HUD and the dock keep crisp edges.
    const sy = (fieldTop / h) * c.small.height
    const sh = ((fieldBottom - fieldTop) / h) * c.small.height
    ctx.drawImage(c.small, 0, sy, c.small.width, sh, x, y + fieldTop, w, fieldBottom - fieldTop)
  }
  // Light wash.
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = c.wash ?? 'rgba(0, 0, 0, 0)'
  ctx.fillRect(x, y + fieldTop, w, fieldBottom - fieldTop)
  // Sun shafts by day and at dusk: a few soft diagonal bands of light drifting slowly across the field.
  if (glow && light !== 'night') {
    const t = performance.now() / 1000
    ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < 3; i++) {
      const cx = x + ((i * 0.37 + t * 0.012) % 1.3 - 0.15) * w
      const band = w * (0.07 + i * 0.03)
      const g = ctx.createLinearGradient(cx - band, 0, cx + band, 0)
      const tint = light === 'day' ? '255, 245, 210' : '255, 190, 130'
      g.addColorStop(0, `rgba(${tint}, 0)`)
      g.addColorStop(0.5, `rgba(${tint}, ${light === 'day' ? 0.09 : 0.11})`)
      g.addColorStop(1, `rgba(${tint}, 0)`)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y + fieldTop, w, fieldBottom - fieldTop)
      ctx.clip()
      ctx.translate(cx, y + fieldTop)
      ctx.transform(1, 0, -0.45, 1, 0, 0)
      ctx.translate(-cx, -(y + fieldTop))
      ctx.fillStyle = g
      ctx.fillRect(cx - band, y + fieldTop, band * 2, fieldBottom - fieldTop)
      ctx.restore()
    }
  }
  // Vignette.
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = c.vignette ?? 'rgba(0, 0, 0, 0)'
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

/** A full-screen flash of light (a special, the cannon): white that fades over `dur` seconds of `age`. */
export function flash(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, age: number, dur: number, warm: boolean): void {
  if (age < 0 || age >= dur) return
  const a = 0.45 * (1 - age / dur)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = warm ? `rgba(255, 230, 160, ${a.toFixed(3)})` : `rgba(220, 235, 255, ${a.toFixed(3)})`
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}
