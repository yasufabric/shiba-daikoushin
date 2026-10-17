import {
  MAX_SHIBAS,
  BONE_X,
  BONE_Y,
  CARD_H,
  CARD_W,
  CARD_X0,
  CARD_X1,
  CARD_Y,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  KIND_BLACK,
  KIND_TAN,
  LANE_COUNT,
  PANEL_Y,
  VIEW_H,
  VIEW_W,
} from './balance'
import type { Sim } from './sim'
import { CELL, COL_BONE, createSheet, spriteCol } from './sprites'

const BUCKETS = 96
const DIGITS = [
  0b111101101101111, 0b010010010010010, 0b111001111100111, 0b111001111001111, 0b101101111001001,
  0b111100111001111, 0b111100111101111, 0b111001001001001, 0b111101111101111, 0b111101111001111,
] as const

export interface Renderer {
  sheet: HTMLCanvasElement
  order: Int16Array
  counts: Int16Array
  heads: Int16Array
}

export function createRenderer(): Renderer {
  return {
    sheet: createSheet(),
    order: new Int16Array(MAX_SHIBAS),
    counts: new Int16Array(BUCKETS),
    heads: new Int16Array(BUCKETS),
  }
}

export function draw(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  sim: Sim,
  w: number,
  h: number,
  dpr: number,
): void {
  const scale = Math.min(w / VIEW_W, h / VIEW_H)
  const ox = (w - VIEW_W * scale) / 2
  const oy = (h - VIEW_H * scale) / 2
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox * dpr, oy * dpr)
  ctx.imageSmoothingEnabled = false

  const padX = ox / scale + 4
  const padY = oy / scale + 4
  ctx.fillStyle = '#100c0e'
  ctx.fillRect(-padX, -padY, w / scale + 8, h / scale + 8)

  paintBackdrop(ctx, sim.time)
  paintShibas(ctx, renderer, sim)
  paintDock(ctx, renderer.sheet, sim.bones)
}

function paintBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = '#241430'
  ctx.fillRect(0, 0, VIEW_W, FIELD_Y)
  ctx.fillStyle = '#e07a48'
  ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, 34)
  ctx.fillStyle = '#8a5038'
  ctx.fillRect(FIELD_X, FIELD_Y + 34, FIELD_W, 26)
  ctx.fillStyle = '#4a3024'
  ctx.fillRect(FIELD_X, FIELD_Y + 60, FIELD_W, FIELD_H - 60)

  const laneW = FIELD_W / LANE_COUNT
  ctx.fillStyle = '#432c22'
  for (let lane = 1; lane < LANE_COUNT; lane += 2) {
    ctx.fillRect(FIELD_X + lane * laneW, FIELD_Y + 60, laneW, FIELD_H - 60)
  }

  ctx.fillStyle = '#6b4636'
  const scroll = (time * 76) % 28
  const roadTop = FIELD_Y + 64
  const roadH = FIELD_H - 64
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const x = FIELD_X + lane * laneW + laneW * 0.5 - 1
    for (let row = 0; row < 24; row++) {
      const y = roadTop + ((row * 28 + scroll) % roadH)
      ctx.fillRect(x, y, 2, 8)
    }
  }
}

function paintShibas(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const n = orderByY(renderer, sim)
  const sheet = renderer.sheet
  const order = renderer.order
  const frameBase = (sim.time * 8) | 0
  for (let i = 0; i < n; i++) {
    const unit = sim.shibas[order[i] ?? -1]
    if (!unit?.alive) continue
    const col = spriteCol(unit.kind, frameBase + unit.lane)
    const dx = (FIELD_X + unit.x - CELL / 2) | 0
    const dy = (FIELD_Y + unit.y - CELL) | 0
    ctx.drawImage(sheet, col * CELL, 0, CELL, CELL, dx, dy, CELL, CELL)
  }
}

function orderByY(renderer: Renderer, sim: Sim): number {
  const counts = renderer.counts
  const heads = renderer.heads
  counts.fill(0)
  const units = sim.shibas
  let n = 0
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (!unit?.alive) continue
    const b = bucket(unit.y)
    counts[b] = (counts[b] ?? 0) + 1
    n++
  }
  let sum = 0
  for (let b = 0; b < BUCKETS; b++) {
    heads[b] = sum
    sum += counts[b] ?? 0
  }
  if (n > renderer.order.length) return 0
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (!unit?.alive) continue
    const b = bucket(unit.y)
    const at = heads[b] ?? 0
    renderer.order[at] = i
    heads[b] = at + 1
  }
  return n
}

function bucket(y: number): number {
  let b = ((y / FIELD_H) * (BUCKETS - 1)) | 0
  if (b < 0) b = 0
  if (b > BUCKETS - 1) b = BUCKETS - 1
  return b
}

function paintDock(ctx: CanvasRenderingContext2D, sheet: HTMLCanvasElement, bones: number): void {
  ctx.fillStyle = '#1c1410'
  ctx.fillRect(0, PANEL_Y, VIEW_W, VIEW_H - PANEL_Y)
  ctx.fillStyle = '#3a2a22'
  ctx.fillRect(0, PANEL_Y, VIEW_W, 3)

  ctx.drawImage(sheet, COL_BONE * CELL, 0, CELL, CELL, BONE_X, BONE_Y, 24, 24)
  drawInt(ctx, bones, BONE_X + 30, BONE_Y + 4, 3, '#ffe6b8')

  paintCard(ctx, sheet, CARD_X0, KIND_TAN)
  paintCard(ctx, sheet, CARD_X1, KIND_BLACK)
}

function paintCard(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  x: number,
  kind: number,
): void {
  ctx.fillStyle = '#2a1c16'
  ctx.fillRect(x, CARD_Y, CARD_W, CARD_H)
  ctx.fillStyle = '#6a4030'
  ctx.fillRect(x, CARD_Y, CARD_W, 4)
  ctx.fillRect(x, CARD_Y + CARD_H - 4, CARD_W, 4)
  ctx.fillRect(x, CARD_Y, 4, CARD_H)
  ctx.fillRect(x + CARD_W - 4, CARD_Y, 4, CARD_H)
  const col = spriteCol(kind, 0)
  const size = 64
  ctx.drawImage(
    sheet,
    col * CELL,
    0,
    CELL,
    CELL,
    x + ((CARD_W - size) / 2) | 0,
    CARD_Y + 18,
    size,
    size,
  )
}

function drawInt(
  ctx: CanvasRenderingContext2D,
  value: number,
  x: number,
  y: number,
  scale: number,
  color: string,
): void {
  let n = value | 0
  if (n < 0) n = 0
  let digits = 1
  let probe = n
  while (probe >= 10 && digits < 8) {
    probe = (probe / 10) | 0
    digits++
  }
  let place = 1
  for (let i = 1; i < digits; i++) place *= 10
  ctx.fillStyle = color
  const step = 3 * scale + 2
  for (let i = 0; i < digits; i++) {
    drawDigit(ctx, ((n / place) | 0) % 10, x + i * step, y, scale)
    place = (place / 10) | 0
  }
}

function drawDigit(
  ctx: CanvasRenderingContext2D,
  digit: number,
  x: number,
  y: number,
  scale: number,
): void {
  const bits = DIGITS[digit]
  if (bits === undefined) return
  for (let i = 0; i < 15; i++) {
    if ((bits & (1 << (14 - i))) === 0) continue
    ctx.fillRect(x + (i % 3) * scale, y + ((i / 3) | 0) * scale, scale, scale)
  }
}
