import {
  BONE_X,
  BONE_Y,
  CANNON_R,
  CANNON_X,
  CANNON_Y,
  CARD_H,
  CARD_W,
  CARD_X0,
  CARD_X1,
  CARD_Y,
  CASTLE_HP,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  BEAM_TIME,
  FLOAT_TIME,
  KIND_BLACK,
  KIND_TAN,
  LANE_COUNT,
  MAX_CATS,
  MAX_SHIBAS,
  PANEL_Y,
  VIEW_H,
  VIEW_W,
} from './balance'
import { cannonReady, type Sim } from './sim'
import {
  CASTLE_H,
  CASTLE_SCALE,
  CASTLE_W,
  CELL,
  COL_BONE,
  COL_CAT,
  COL_REWARD,
  createCastle,
  createFinger,
  createSheet,
  spriteCol,
} from './sprites'

const BUCKETS = 96
const DIGITS = [
  0b111101101101111, 0b010010010010010, 0b111001111100111, 0b111001111001111, 0b101101111001001,
  0b111100111001111, 0b111100111101111, 0b111001001001001, 0b111101111101111, 0b111101111001111,
] as const

export interface Renderer {
  sheet: HTMLCanvasElement
  castle: HTMLCanvasElement
  finger: HTMLCanvasElement
  order: Int16Array
  side: Uint8Array
  counts: Int16Array
  heads: Int16Array
}

export function createRenderer(): Renderer {
  return {
    sheet: createSheet(),
    castle: createCastle(),
    finger: createFinger(),
    order: new Int16Array(MAX_SHIBAS + MAX_CATS),
    side: new Uint8Array(MAX_SHIBAS + MAX_CATS),
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

  ctx.fillStyle = '#100c0e'
  ctx.fillRect(-ox / scale - 4, -oy / scale - 4, w / scale + 8, h / scale + 8)
  paintBackdrop(ctx, sim.time)
  paintCastle(ctx, renderer.castle, sim)
  ctx.save()
  ctx.beginPath()
  ctx.rect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H)
  ctx.clip()
  paintUnits(ctx, renderer, sim)
  ctx.restore()
  paintBeam(ctx, sim)
  paintDamage(ctx, sim)
  paintDock(ctx, renderer, sim)
  paintCannon(ctx, sim)
  if (sim.outcome !== 'play') paintReward(ctx, renderer, sim)
  else if (sim.tutorial) paintFinger(ctx, renderer.finger, sim.time)
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

function paintCastle(ctx: CanvasRenderingContext2D, castle: HTMLCanvasElement, sim: Sim): void {
  const dw = CASTLE_W * CASTLE_SCALE
  const dh = CASTLE_H * CASTLE_SCALE
  const x = (FIELD_X + (FIELD_W - dw) / 2) | 0
  const y = FIELD_Y - 8
  ctx.globalAlpha = sim.boss ? 1 : 0.78
  ctx.drawImage(castle, x, y)
  ctx.globalAlpha = 1
  const eye = sim.boss ? '#ffd56a' : '#241820'
  ctx.fillStyle = eye
  ctx.fillRect(x + 6 * CASTLE_SCALE, y + 22 * CASTLE_SCALE, 3 * CASTLE_SCALE, 4 * CASTLE_SCALE)
  ctx.fillRect(x + 39 * CASTLE_SCALE, y + 22 * CASTLE_SCALE, 3 * CASTLE_SCALE, 4 * CASTLE_SCALE)
  if (!sim.boss) return
  const barW = 120
  const barX = x + (dw - barW) / 2
  const barY = y + dh - 10
  ctx.fillStyle = '#2a1218'
  ctx.fillRect(barX, barY, barW, 6)
  ctx.fillStyle = '#e23b4a'
  ctx.fillRect(barX, barY, barW * Math.max(0, sim.castleHp / CASTLE_HP), 6)
}

function paintUnits(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const n = orderByY(renderer, sim)
  const sheet = renderer.sheet
  const frameBase = (sim.time * 8) | 0
  for (let i = 0; i < n; i++) {
    const index = renderer.order[i] ?? 0
    if ((renderer.side[i] ?? 0) === 0) {
      const unit = sim.shibas[index]
      if (!unit?.alive) continue
      const col = spriteCol(unit.kind, frameBase + unit.lane)
      const dx = (FIELD_X + unit.x - CELL / 2) | 0
      const dy = (FIELD_Y + unit.y - CELL) | 0
      ctx.drawImage(sheet, col * CELL, 0, CELL, CELL, dx, dy, CELL, CELL)
    } else {
      const cat = sim.cats[index]
      if (!cat?.alive) continue
      const col = COL_CAT + ((frameBase + cat.lane) & 1)
      const dx = (FIELD_X + cat.x - CELL / 2) | 0
      const dy = (FIELD_Y + cat.y - CELL) | 0
      ctx.drawImage(sheet, col * CELL, 0, CELL, CELL, dx, dy, CELL, CELL)
    }
  }
}

function orderByY(renderer: Renderer, sim: Sim): number {
  const counts = renderer.counts
  const heads = renderer.heads
  counts.fill(0)
  let n = 0
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    if (!unit?.alive) continue
    const b = bucket(unit.y)
    counts[b] = (counts[b] ?? 0) + 1
    n += 1
  }
  const cats = sim.cats
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    if (!cat?.alive) continue
    const b = bucket(cat.y)
    counts[b] = (counts[b] ?? 0) + 1
    n += 1
  }
  let sum = 0
  for (let b = 0; b < BUCKETS; b++) {
    heads[b] = sum
    sum += counts[b] ?? 0
  }
  if (n > renderer.order.length) return 0
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    if (!unit?.alive) continue
    const b = bucket(unit.y)
    const at = heads[b] ?? 0
    renderer.order[at] = i
    renderer.side[at] = 0
    heads[b] = at + 1
  }
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    if (!cat?.alive) continue
    const b = bucket(cat.y)
    const at = heads[b] ?? 0
    renderer.order[at] = i
    renderer.side[at] = 1
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

function paintBeam(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.beam <= 0) return
  const p = 1 - sim.beam / BEAM_TIME
  const y = FIELD_Y + Math.max(0, Math.min(1, p)) * FIELD_H
  ctx.fillStyle = 'rgba(255, 236, 190, 0.38)'
  ctx.fillRect(FIELD_X, y - 26, FIELD_W, 52)
  ctx.fillStyle = '#fff8dc'
  ctx.fillRect(FIELD_X, y - 5, FIELD_W, 10)
}

function paintDamage(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.floatT <= 0 || sim.floatDmg <= 0) return
  const scale = 7
  const digits = digitCount(sim.floatDmg)
  const width = digits * (3 * scale + 2)
  const rise = (1 - sim.floatT / FLOAT_TIME) * 64
  const x = (VIEW_W - width) / 2
  const y = FIELD_Y + FIELD_H * 0.38 - rise
  ctx.globalAlpha = Math.max(0, Math.min(1, sim.floatT * 1.4))
  drawInt(ctx, sim.floatDmg, x + 2, y + 2, scale, '#3a2410')
  drawInt(ctx, sim.floatDmg, x, y, scale, '#ffd24a')
  ctx.globalAlpha = 1
}

function paintDock(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const sheet = renderer.sheet
  ctx.fillStyle = '#1c1410'
  ctx.fillRect(0, PANEL_Y, VIEW_W, VIEW_H - PANEL_Y)
  ctx.fillStyle = '#3a2a22'
  ctx.fillRect(0, PANEL_Y, VIEW_W, 3)
  ctx.drawImage(sheet, COL_BONE * CELL, 0, CELL, CELL, BONE_X, BONE_Y, 24, 24)
  drawInt(ctx, sim.bones, BONE_X + 30, BONE_Y + 4, 3, '#ffe6b8')

  const shake0 = sim.deny0 > 0 ? Math.sin(sim.deny0 * 90) * 6 : 0
  const shake1 = sim.deny1 > 0 ? Math.sin(sim.deny1 * 90) * 6 : 0
  paintCard(ctx, sheet, CARD_X0 + shake0, KIND_TAN, sim.costTan, sim.bones >= sim.costTan, sim.tutorial)
  paintCard(ctx, sheet, CARD_X1 + shake1, KIND_BLACK, sim.costBlack, sim.bones >= sim.costBlack, false)
}

function paintCard(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  x: number,
  kind: number,
  cost: number,
  affordable: boolean,
  hint: boolean,
): void {
  ctx.globalAlpha = affordable ? 1 : 0.48
  ctx.fillStyle = hint ? '#5a3a18' : '#2a1c16'
  ctx.fillRect(x, CARD_Y, CARD_W, CARD_H)
  ctx.fillStyle = hint ? '#ffd56a' : '#6a4030'
  ctx.fillRect(x, CARD_Y, CARD_W, 4)
  ctx.fillRect(x, CARD_Y + CARD_H - 4, CARD_W, 4)
  ctx.fillRect(x, CARD_Y, 4, CARD_H)
  ctx.fillRect(x + CARD_W - 4, CARD_Y, 4, CARD_H)
  const col = spriteCol(kind, 0)
  const size = 56
  ctx.drawImage(sheet, col * CELL, 0, CELL, CELL, x + ((CARD_W - size) / 2) | 0, CARD_Y + 10, size, size)
  drawInt(ctx, cost, x + 12, CARD_Y + CARD_H - 28, 3, '#ffe6b8')
  ctx.globalAlpha = 1
}

function paintCannon(ctx: CanvasRenderingContext2D, sim: Sim): void {
  const ready = cannonReady(sim)
  const pulse = ready ? 0.55 + Math.sin(sim.time * 7) * 0.45 : 0
  if (ready) {
    ctx.globalAlpha = 0.35 + pulse * 0.4
    ctx.fillStyle = '#ffd56a'
    ctx.beginPath()
    ctx.arc(CANNON_X, CANNON_Y, CANNON_R + 6 + pulse * 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = ready ? '#ffd56a' : '#4a3a32'
  ctx.beginPath()
  ctx.arc(CANNON_X, CANNON_Y, CANNON_R, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = ready ? '#fff6d4' : '#2a201c'
  ctx.fillRect(CANNON_X - 16, CANNON_Y - 3, 32, 6)
  ctx.fillRect(CANNON_X - 3, CANNON_Y - 14, 6, 28)
}

function paintFinger(ctx: CanvasRenderingContext2D, finger: HTMLCanvasElement, time: number): void {
  const bob = Math.sin(time * 6) * 8
  const x = CARD_X0 + CARD_W / 2 - finger.width / 2
  const y = CARD_Y - finger.height - 6 + bob
  ctx.drawImage(finger, x | 0, y | 0)
}

function paintReward(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  ctx.fillStyle = 'rgba(8, 4, 10, 0.55)'
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  const w = 168
  const h = 210
  const x = (VIEW_W - w) / 2
  const y = 250 + Math.sin(sim.rewardT * 3) * 4
  ctx.fillStyle = '#ffd56a'
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8)
  ctx.fillStyle = '#2a1c16'
  ctx.fillRect(x, y, w, h)
  const size = 96
  ctx.drawImage(
    renderer.sheet,
    COL_REWARD * CELL,
    0,
    CELL,
    CELL,
    x + (w - size) / 2,
    y + 36,
    size,
    size,
  )
  const spark = (sim.time * 40) | 0
  ctx.fillStyle = '#fff1b0'
  for (let i = 0; i < 6; i++) {
    const sx = x + ((i * 37 + spark) % (w - 8))
    const sy = y + ((i * 23) % 28)
    ctx.fillRect(sx, sy, 3, 3)
  }
}

function digitCount(value: number): number {
  let n = value | 0
  if (n < 0) n = 0
  let digits = 1
  while (n >= 10 && digits < 8) {
    n = (n / 10) | 0
    digits += 1
  }
  return digits
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
  const digits = digitCount(n)
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
