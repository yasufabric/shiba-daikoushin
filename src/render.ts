import { pawArt } from './art'
import {
  ATTACK_RANGE,
  BEAM_TIME,
  BONE_X,
  BONE_Y,
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
  FLOAT_TIME,
  KIND_BLACK,
  LANE_COUNT,
  MAX_CATS,
  MAX_SHIBAS,
  PANEL_Y,
} from './balance'
import { glyphBit, POP_COL, POP_ROW } from './font'
import {
  BOSS_H,
  BOSS_W,
  CAT_PX,
  CROWD_PX,
  DANGER,
  DANGER_DARK,
  DANGER_LIGHT,
  GOLD,
  GOLD_DARK,
  GOLD_HOT,
  GLYPH_H,
  GLYPH_W,
  GOLD_LIGHT,
  HERO_PX,
  INTERNAL_H,
  INTERNAL_W,
  LINE,
  NIGHT,
  NIGHT_1,
  NIGHT_2,
  NIGHT_3,
  WHITE,
} from './palette'
import { cannonReady, type Sim } from './sim'
import { createSheets, type Sheets } from './sprites'

const BUCKETS = 96
const GHOSTS = 48
const BOOMS = 24
const PARTS = 128
const POP_MASK_W = 14
const POP_MASK_H = 17

const LANE_PX = [23, 23, 23, 23, 23, 23, 23, 22] as const
const GOLD_CYCLE = [GOLD_DARK, GOLD, GOLD_LIGHT, GOLD_HOT] as const
const BOOM_COLOR = [WHITE, GOLD_LIGHT, GOLD, GOLD_HOT] as const
const PART_COLOR = [WHITE, GOLD_LIGHT, GOLD, DANGER] as const
const SHIFT = [0, 2, -2, 3, -3, 1, -1, 0] as const
const BOB = [0, 1, 2, 1, 0, -1, -2, -1] as const
const SHAKE_X = [2, -1, 3, -2, 1, -3, 2, 0] as const
const SHAKE_Y = [0, 2, -1, 3, -2, 1, -3, 0] as const
const PART_VX = [2, -2, 1, -1, 2, -2, 0, 1] as const
const PART_VY = [-2, -1, -2, 1, 1, 2, -2, 2] as const

type Pose = 'idle' | 'walk' | 'attack'

export interface Renderer {
  view: HTMLCanvasElement
  pen: CanvasRenderingContext2D
  sheets: Sheets
  mask: Uint8Array
  order: Int16Array
  side: Uint8Array
  counts: Int16Array
  heads: Int16Array
  shibaOn: Uint8Array
  shibaSeen: Uint8Array
  shibaY: Float32Array
  catFly: Uint8Array
  catSeen: Uint8Array
  catY: Float32Array
  catBirth: Float64Array
  ghostX: Int16Array
  ghostY: Int16Array
  ghostKind: Uint8Array
  ghostBirth: Float64Array
  ghostVx: Int8Array
  ghostVy: Int8Array
  ghostOn: Uint8Array
  ghostCursor: number
  boomX: Int16Array
  boomY: Int16Array
  boomBirth: Float64Array
  boomOn: Uint8Array
  boomCursor: number
  partX: Int16Array
  partY: Int16Array
  partVx: Int8Array
  partVy: Int8Array
  partSize: Uint8Array
  partHue: Uint8Array
  partBirth: Float64Array
  partOn: Uint8Array
  partCursor: number
  hitstop: number
  shakeUntil: number
  boomsLeft: number
}

export function pixelScale(cssW: number, cssH: number): number {
  const scale = Math.min((cssW / INTERNAL_W) | 0, (cssH / INTERNAL_H) | 0)
  return scale > 0 ? scale : 1
}

export function createRenderer(): Renderer {
  const view = document.createElement('canvas')
  view.width = INTERNAL_W
  view.height = INTERNAL_H
  const pen = view.getContext('2d')
  if (!pen) throw new Error('view unavailable')
  pen.imageSmoothingEnabled = false
  return {
    view,
    pen,
    sheets: createSheets(),
    mask: new Uint8Array(POP_MASK_W * POP_MASK_H),
    order: new Int16Array(MAX_SHIBAS + MAX_CATS),
    side: new Uint8Array(MAX_SHIBAS + MAX_CATS),
    counts: new Int16Array(BUCKETS),
    heads: new Int16Array(BUCKETS),
    shibaOn: new Uint8Array(MAX_SHIBAS),
    shibaSeen: new Uint8Array(MAX_SHIBAS),
    shibaY: new Float32Array(MAX_SHIBAS),
    catFly: new Uint8Array(MAX_CATS),
    catSeen: new Uint8Array(MAX_CATS),
    catY: new Float32Array(MAX_CATS),
    catBirth: new Float64Array(MAX_CATS),
    ghostX: new Int16Array(GHOSTS),
    ghostY: new Int16Array(GHOSTS),
    ghostKind: new Uint8Array(GHOSTS),
    ghostBirth: new Float64Array(GHOSTS),
    ghostVx: new Int8Array(GHOSTS),
    ghostVy: new Int8Array(GHOSTS),
    ghostOn: new Uint8Array(GHOSTS),
    ghostCursor: 0,
    boomX: new Int16Array(BOOMS),
    boomY: new Int16Array(BOOMS),
    boomBirth: new Float64Array(BOOMS),
    boomOn: new Uint8Array(BOOMS),
    boomCursor: 0,
    partX: new Int16Array(PARTS),
    partY: new Int16Array(PARTS),
    partVx: new Int8Array(PARTS),
    partVy: new Int8Array(PARTS),
    partSize: new Uint8Array(PARTS),
    partHue: new Uint8Array(PARTS),
    partBirth: new Float64Array(PARTS),
    partOn: new Uint8Array(PARTS),
    partCursor: 0,
    hitstop: 0,
    shakeUntil: 0,
    boomsLeft: 12,
  }
}

function at(world: number): number {
  return Math.round(world / 2)
}

export function draw(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  sim: Sim,
  cssW: number,
  cssH: number,
  dpr: number,
): void {
  const g = renderer.pen
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.imageSmoothingEnabled = false
  renderer.boomsLeft = 12

  let sx = 0
  let sy = 0
  if (sim.time < renderer.shakeUntil) {
    const step = Math.floor(sim.time * 24) & 7
    sx = SHAKE_X[step] ?? 0
    sy = SHAKE_Y[step] ?? 0
  }

  g.fillStyle = NIGHT
  g.fillRect(0, 0, INTERNAL_W, INTERNAL_H)
  g.save()
  g.translate(sx, sy)
  paintBackdrop(g, sim.time)
  paintCastle(g, renderer, sim)
  g.save()
  g.beginPath()
  g.rect(at(FIELD_X), at(FIELD_Y), at(FIELD_W), at(FIELD_H))
  g.clip()
  paintUnits(g, renderer, sim)
  paintGhosts(g, renderer, sim)
  paintBooms(g, renderer, sim)
  g.restore()
  paintBeam(g, sim)
  paintDamage(g, renderer, sim)
  g.restore()
  paintDock(g, renderer, sim)
  if (sim.outcome !== 'play') paintReward(g, renderer, sim)
  else if (sim.tutorial) paintPaw(g, renderer, sim.time)

  const scale = pixelScale(cssW, cssH)
  const ox = ((cssW - INTERNAL_W * scale) / 2) | 0
  const oy = ((cssH - INTERNAL_H * scale) / 2) | 0
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, cssW, cssH)
  ctx.drawImage(renderer.view, ox, oy, INTERNAL_W * scale, INTERNAL_H * scale)
}

function paintBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
  const fx = at(FIELD_X)
  const fy = at(FIELD_Y)
  const fw = at(FIELD_W)
  const fh = at(FIELD_H)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(0, 0, INTERNAL_W, 16)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(0, 16, INTERNAL_W, fy - 16)
  ctx.fillStyle = NIGHT_3
  ctx.fillRect(0, fy - 2, INTERNAL_W, 2)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(fx, fy, fw, fh)
  let x = fx
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const laneW = LANE_PX[lane] ?? 0
    if ((lane & 1) === 1) {
      ctx.fillStyle = NIGHT_2
      ctx.fillRect(x, fy, laneW, fh)
    }
    x += laneW
  }
  ctx.fillStyle = NIGHT_3
  const scroll = Math.floor(time * 36) % 12
  x = fx
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const laneW = LANE_PX[lane] ?? 0
    const dashX = x + (laneW >> 1)
    for (let row = 0; row < 28; row++) {
      const y = fy + ((row * 12 + scroll) % fh)
      ctx.fillRect(dashX, y, 1, 4)
    }
    x += laneW
  }
  ctx.fillStyle = LINE
  ctx.fillRect(0, at(PANEL_Y), INTERNAL_W, 1)
}

function paintCastle(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const sprite = sim.boss ? renderer.sheets.castle : renderer.sheets.castleDim
  const x = (INTERNAL_W - BOSS_W) >> 1
  const y = 0
  ctx.drawImage(sprite, x, y)
  if (!sim.boss) return
  const barW = 60
  const barX = x + ((BOSS_W - barW) >> 1)
  const barY = y + BOSS_H - 6
  ctx.fillStyle = DANGER_DARK
  ctx.fillRect(barX, barY, barW, 4)
  const fill = Math.round(barW * Math.max(0, sim.castleHp / CASTLE_HP))
  ctx.fillStyle = DANGER
  ctx.fillRect(barX, barY, fill, 4)
  ctx.fillStyle = DANGER_LIGHT
  ctx.fillRect(barX, barY, fill, 1)
}

function paintUnits(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const n = orderByY(renderer, sim)
  for (let i = 0; i < n; i++) {
    const index = renderer.order[i] ?? 0
    if ((renderer.side[i] ?? 0) === 0) drawShiba(ctx, renderer, sim, index)
    else drawCat(ctx, renderer, sim, index)
  }
  noteDeaths(renderer, sim)
}

function drawShiba(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, index: number): void {
  const unit = sim.shibas[index]
  if (!unit?.alive) return
  const prev = renderer.shibaY[index] ?? 0
  const seen = renderer.shibaSeen[index] === 1
  renderer.shibaY[index] = unit.y
  renderer.shibaSeen[index] = 1
  const moved = !seen || Math.abs(unit.y - prev) > 0.2
  const fighting = foeNear(sim, unit.lane, unit.y, true)
  const pose = poseOf(moved, fighting)
  const flash = fighting && hitFrame(sim.time)
  const dx = at(FIELD_X + unit.x) - (CROWD_PX >> 1)
  const dy = at(FIELD_Y + unit.y) - CROWD_PX
  blitCrowd(ctx, renderer, unit.kind === KIND_BLACK ? 1 : 0, pose, sim.time, unit.lane, 0, flash, dx, dy)
}

function drawCat(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, index: number): void {
  const cat = sim.cats[index]
  if (!cat?.alive) return
  const dx = at(FIELD_X + cat.x) - (CAT_PX >> 1)
  const dy = at(FIELD_Y + cat.y) - CAT_PX
  if (cat.fly === 1) {
    if (renderer.catFly[index] !== 1) {
      renderer.catFly[index] = 1
      renderer.catBirth[index] = sim.time
      spawnBoom(renderer, sim, dx + (CAT_PX >> 1), dy + (CAT_PX >> 1))
    }
    const age = sim.time - (renderer.catBirth[index] ?? sim.time)
    const spin = Math.floor(age / 0.08) & 3
    blitCat(ctx, renderer, 'walk', sim.time, cat.lane, spin, age < 0.06, dx, dy)
    return
  }
  renderer.catFly[index] = 0
  const prev = renderer.catY[index] ?? 0
  const seen = renderer.catSeen[index] === 1
  renderer.catY[index] = cat.y
  renderer.catSeen[index] = 1
  const moved = !seen || Math.abs(cat.y - prev) > 0.2
  const fighting = foeNear(sim, cat.lane, cat.y, false)
  const pose = poseOf(moved, fighting)
  blitCat(ctx, renderer, pose, sim.time, cat.lane, 0, fighting && hitFrame(sim.time), dx, dy)
}

function noteDeaths(renderer: Renderer, sim: Sim): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    const alive = unit?.alive ? 1 : 0
    if ((renderer.shibaOn[i] ?? 0) === 1 && alive === 0 && unit) {
      const dx = at(FIELD_X + unit.x) - (CROWD_PX >> 1)
      const dy = at(FIELD_Y + unit.y) - CROWD_PX
      spawnGhost(renderer, sim, dx, dy, unit.kind === KIND_BLACK ? 1 : 0)
      spawnBoom(renderer, sim, dx + (CROWD_PX >> 1), dy + (CROWD_PX >> 1))
    }
    renderer.shibaOn[i] = alive
  }
}

function poseOf(moved: boolean, fighting: boolean): Pose {
  if (fighting) return 'attack'
  if (moved) return 'walk'
  return 'idle'
}

function hitFrame(time: number): boolean {
  const ticks = time * 12
  const frame = Math.floor(ticks) & 3
  return frame === 1 && ticks - Math.floor(ticks) < 0.72
}

function foeNear(sim: Sim, lane: number, y: number, foesAreCats: boolean): boolean {
  const n = foesAreCats ? (sim.laneCN[lane] ?? 0) : (sim.laneSN[lane] ?? 0)
  const idx = foesAreCats ? sim.laneC[lane] : sim.laneS[lane]
  if (!idx) return false
  const pool = foesAreCats ? sim.cats : sim.shibas
  for (let i = 0; i < n; i++) {
    const unit = pool[idx[i] ?? -1]
    if (!unit?.alive) continue
    if (Math.abs(unit.y - y) <= ATTACK_RANGE) return true
  }
  return false
}

function frameCol(pose: Pose, time: number, lane: number): number {
  switch (pose) {
    case 'walk':
      return (Math.floor(time * 12) + lane) & 3
    case 'idle':
      return 4 + (Math.floor(time * 2) & 1)
    case 'attack':
      return 6 + (Math.floor(time * 12) & 3)
    default: {
      const never: never = pose
      throw new Error(never)
    }
  }
}

function blitCrowd(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  kind: number,
  pose: Pose,
  time: number,
  lane: number,
  spin: number,
  flash: boolean,
  dx: number,
  dy: number,
): void {
  const sheet = flash ? renderer.sheets.crowdFlash : renderer.sheets.crowd
  const col = frameCol(pose, time, lane)
  const srcY = (kind * 4 + spin) * CROWD_PX
  ctx.drawImage(sheet, col * CROWD_PX, srcY, CROWD_PX, CROWD_PX, dx, dy, CROWD_PX, CROWD_PX)
}

function blitCat(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  pose: Pose,
  time: number,
  lane: number,
  spin: number,
  flash: boolean,
  dx: number,
  dy: number,
): void {
  const sheet = flash ? renderer.sheets.catFlash : renderer.sheets.cat
  const col = frameCol(pose, time, lane)
  ctx.drawImage(sheet, col * CAT_PX, spin * CAT_PX, CAT_PX, CAT_PX, dx, dy, CAT_PX, CAT_PX)
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
    const atSlot = heads[b] ?? 0
    renderer.order[atSlot] = i
    renderer.side[atSlot] = 0
    heads[b] = atSlot + 1
  }
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    if (!cat?.alive) continue
    const b = bucket(cat.y)
    const atSlot = heads[b] ?? 0
    renderer.order[atSlot] = i
    renderer.side[atSlot] = 1
    heads[b] = atSlot + 1
  }
  return n
}

function bucket(y: number): number {
  let b = ((y / FIELD_H) * (BUCKETS - 1)) | 0
  if (b < 0) b = 0
  if (b > BUCKETS - 1) b = BUCKETS - 1
  return b
}

function spawnGhost(renderer: Renderer, sim: Sim, x: number, y: number, kind: number): void {
  const i = renderer.ghostCursor % GHOSTS
  renderer.ghostCursor = i + 1
  renderer.ghostOn[i] = 1
  renderer.ghostX[i] = x
  renderer.ghostY[i] = y
  renderer.ghostKind[i] = kind
  renderer.ghostBirth[i] = sim.time
  renderer.ghostVx[i] = (i & 1) === 0 ? -1 : 1
  renderer.ghostVy[i] = -2
}

function spawnBoom(renderer: Renderer, sim: Sim, x: number, y: number): void {
  if (renderer.boomsLeft <= 0) return
  renderer.boomsLeft -= 1
  const i = renderer.boomCursor % BOOMS
  renderer.boomCursor = i + 1
  renderer.boomOn[i] = 1
  renderer.boomX[i] = x
  renderer.boomY[i] = y
  renderer.boomBirth[i] = sim.time
  for (let p = 0; p < 8; p++) {
    const slot = renderer.partCursor % PARTS
    renderer.partCursor = slot + 1
    renderer.partOn[slot] = 1
    renderer.partX[slot] = x
    renderer.partY[slot] = y
    renderer.partVx[slot] = PART_VX[p] ?? 1
    renderer.partVy[slot] = PART_VY[p] ?? -1
    renderer.partSize[slot] = (p % 3) + 1
    renderer.partHue[slot] = p & 3
    renderer.partBirth[slot] = sim.time + 0.25
  }
}

function paintGhosts(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  for (let i = 0; i < GHOSTS; i++) {
    if (renderer.ghostOn[i] !== 1) continue
    const age = sim.time - (renderer.ghostBirth[i] ?? 0)
    if (age > 0.5) {
      renderer.ghostOn[i] = 0
      continue
    }
    const steps = Math.floor(age * 20)
    const x = (renderer.ghostX[i] ?? 0) + (renderer.ghostVx[i] ?? 0) * steps
    const y = (renderer.ghostY[i] ?? 0) + (renderer.ghostVy[i] ?? 0) * steps
    const spin = Math.floor(age / 0.08) & 3
    blitCrowd(ctx, renderer, renderer.ghostKind[i] ?? 0, 'walk', sim.time, 0, spin, age < 0.06, x, y)
  }
}

function paintBooms(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  for (let i = 0; i < BOOMS; i++) {
    if (renderer.boomOn[i] !== 1) continue
    const age = sim.time - (renderer.boomBirth[i] ?? 0)
    const frame = Math.floor(age * 12)
    if (frame >= 4) {
      renderer.boomOn[i] = 0
      continue
    }
    if (frame < 3) {
      const size = 3 + frame * 2
      const color = BOOM_COLOR[frame] ?? WHITE
      ctx.fillStyle = color
      const x = (renderer.boomX[i] ?? 0) - (size >> 1)
      const y = (renderer.boomY[i] ?? 0) - (size >> 1)
      ctx.fillRect(x, y, size, size)
    }
  }
  for (let i = 0; i < PARTS; i++) {
    if (renderer.partOn[i] !== 1) continue
    const age = sim.time - (renderer.partBirth[i] ?? 0)
    if (age < 0) continue
    if (age > 0.4) {
      renderer.partOn[i] = 0
      continue
    }
    const steps = Math.floor(age * 24)
    const size = renderer.partSize[i] ?? 1
    const x = (renderer.partX[i] ?? 0) + (renderer.partVx[i] ?? 0) * steps
    const y = (renderer.partY[i] ?? 0) + (renderer.partVy[i] ?? 0) * steps
    ctx.fillStyle = PART_COLOR[renderer.partHue[i] ?? 0] ?? WHITE
    ctx.fillRect(x, y, size, size)
  }
}

function paintBeam(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.beam <= 0) return
  const p = 1 - sim.beam / BEAM_TIME
  const clamped = p < 0 ? 0 : p > 1 ? 1 : p
  const y = at(FIELD_Y) + Math.round(clamped * at(FIELD_H)) - 6
  const x = at(FIELD_X)
  const w = at(FIELD_W)
  const phase = Math.floor(sim.time * 16) & 3
  for (let row = 0; row < 12; row++) {
    const band = row < 6 ? row : 11 - row
    ctx.fillStyle = GOLD_CYCLE[(band + phase) & 3] ?? GOLD
    ctx.fillRect(x, y + row, w, 1)
  }
}

function paintDamage(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (sim.floatT <= 0 || sim.floatDmg <= 0) return
  const pop = sim.floatT > FLOAT_TIME - 0.12
  const digits = digitCount(sim.floatDmg)
  const step = pop ? 14 : 10
  const rise = Math.round((1 - sim.floatT / FLOAT_TIME) * 28)
  const x = (INTERNAL_W - digits * step) >> 1
  const y = at(FIELD_Y) + Math.round(at(FIELD_H) * 0.38) - rise
  drawNumber(ctx, renderer, sim.floatDmg | 0, x, y, pop)
}

function paintDock(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const y = at(PANEL_Y)
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, y + 1, INTERNAL_W, INTERNAL_H - y - 1)
  ctx.drawImage(renderer.sheets.bone, at(BONE_X), at(BONE_Y))
  drawNumber(ctx, renderer, sim.bones | 0, at(BONE_X) + 14, at(BONE_Y) + 1, false)
  paintCard(ctx, renderer, at(CARD_X0) + denyShift(sim.deny0), 0, sim.costTan, sim.bones >= sim.costTan, sim.tutorial, sim.time)
  paintCard(ctx, renderer, at(CARD_X1) + denyShift(sim.deny1), 1, sim.costBlack, sim.bones >= sim.costBlack, false, sim.time)
  paintCannon(ctx, sim)
}

function denyShift(deny: number): number {
  if (deny <= 0) return 0
  return SHIFT[Math.floor(deny * 48) & 7] ?? 0
}

function paintCard(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  x: number,
  kind: number,
  cost: number,
  affordable: boolean,
  hint: boolean,
  time: number,
): void {
  const y = at(CARD_Y)
  const w = at(CARD_W)
  const h = at(CARD_H)
  ctx.fillStyle = affordable ? NIGHT_1 : NIGHT
  ctx.fillRect(x, y, w, h)
  const phase = Math.floor(time * 8) & 3
  const border = hint ? (GOLD_CYCLE[phase] ?? GOLD_LIGHT) : affordable ? GOLD : NIGHT_2
  ctx.fillStyle = border
  ctx.fillRect(x, y, w, 1)
  ctx.fillRect(x, y + h - 1, w, 1)
  ctx.fillRect(x, y, 1, h)
  ctx.fillRect(x + w - 1, y, 1, h)
  const blink = (Math.floor(time * 2) & 1) === 1
  const col = kind === KIND_BLACK ? (blink ? 3 : 2) : blink ? 1 : 0
  const hx = x + ((w - HERO_PX) >> 1)
  ctx.drawImage(renderer.sheets.hero, col * HERO_PX, 0, HERO_PX, HERO_PX, hx, y + 2, HERO_PX, HERO_PX)
  drawNumber(ctx, renderer, cost | 0, x + 4, y + h - 12, false)
}

function paintCannon(ctx: CanvasRenderingContext2D, sim: Sim): void {
  const ready = cannonReady(sim)
  const cx = at(CANNON_X)
  const cy = at(CANNON_Y)
  const size = 18
  const x = cx - 9
  const y = cy - 9
  const phase = Math.floor(sim.time * 8) & 3
  ctx.fillStyle = ready ? (GOLD_CYCLE[phase] ?? GOLD) : NIGHT_2
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = ready ? (GOLD_CYCLE[(phase + 1) & 3] ?? GOLD_LIGHT) : NIGHT_1
  ctx.fillRect(x + 2, y + 2, size - 4, size - 4)
  ctx.fillStyle = ready ? (GOLD_CYCLE[(phase + 2) & 3] ?? GOLD_HOT) : GOLD_DARK
  ctx.fillRect(x + 5, y + 5, 8, 8)
  ctx.fillStyle = ready ? WHITE : NIGHT
  ctx.fillRect(cx - 2, cy + 4, 4, 6)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, size, 1)
  ctx.fillRect(x, y + size - 1, size, 1)
  ctx.fillRect(x, y, 1, size)
  ctx.fillRect(x + size - 1, y, 1, size)
}

function paintPaw(ctx: CanvasRenderingContext2D, renderer: Renderer, time: number): void {
  const bob = BOB[Math.floor(time * 6) & 7] ?? 0
  const x = at(CARD_X0) + ((at(CARD_W) - pawArt.w) >> 1)
  const y = at(CARD_Y) - pawArt.h - 2 + bob
  ctx.drawImage(renderer.sheets.paw, x, y)
}

function paintReward(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H)
  const w = 96
  const h = 112
  const bob = BOB[Math.floor(sim.time * 3) & 7] ?? 0
  const x = (INTERNAL_W - w) >> 1
  const y = 120 + bob
  ctx.fillStyle = GOLD
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, w, 1)
  ctx.fillRect(x, y + h - 1, w, 1)
  ctx.fillRect(x, y, 1, h)
  ctx.fillRect(x + w - 1, y, 1, h)
  const hx = x + ((w - HERO_PX) >> 1)
  ctx.drawImage(renderer.sheets.hero, 4 * HERO_PX, 0, HERO_PX, HERO_PX, hx, y + 16, HERO_PX, HERO_PX)
  const spark = Math.floor(sim.time * 12)
  ctx.fillStyle = GOLD_HOT
  for (let i = 0; i < 6; i++) {
    const sx = x + 4 + ((i * 17 + spark) % (w - 8))
    const sy = y + 4 + ((i * 9) % 14)
    ctx.fillRect(sx, sy, 2, 2)
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

function drawNumber(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  value: number,
  x: number,
  y: number,
  pop: boolean,
): void {
  let n = value | 0
  if (n < 0) n = 0
  const digits = digitCount(n)
  let place = 1
  for (let i = 1; i < digits; i++) place *= 10
  const step = pop ? 14 : 10
  for (let i = 0; i < digits; i++) {
    const digit = ((n / place) | 0) % 10
    if (pop) drawPopDigit(ctx, renderer, digit, x + i * step, y)
    else drawDigit(ctx, digit, x + i * step, y)
    place = (place / 10) | 0
  }
}

function drawDigit(ctx: CanvasRenderingContext2D, digit: number, x: number, y: number): void {
  ctx.fillStyle = LINE
  for (let sy = 0; sy < GLYPH_H; sy++) {
    for (let sx = 0; sx < GLYPH_W; sx++) {
      if (!glyphBit(digit, sx, sy)) continue
      ctx.fillRect(x + sx - 1, y + sy - 1, 3, 3)
    }
  }
  ctx.fillStyle = GOLD_LIGHT
  for (let sy = 0; sy < GLYPH_H; sy++) {
    for (let sx = 0; sx < GLYPH_W; sx++) {
      if (!glyphBit(digit, sx, sy)) continue
      ctx.fillRect(x + sx, y + sy, 1, 1)
    }
  }
}

function drawPopDigit(
  ctx: CanvasRenderingContext2D,
  renderer: Renderer,
  digit: number,
  x: number,
  y: number,
): void {
  const mask = renderer.mask
  mask.fill(0)
  let dy = 1
  for (let sy = 0; sy < GLYPH_H; sy++) {
    const rh = POP_ROW[sy] ?? 1
    let dx = 1
    for (let sx = 0; sx < GLYPH_W; sx++) {
      const rw = POP_COL[sx] ?? 1
      if (glyphBit(digit, sx, sy)) {
        for (let yy = 0; yy < rh; yy++) {
          for (let xx = 0; xx < rw; xx++) mask[(dy + yy) * POP_MASK_W + dx + xx] = 1
        }
      }
      dx += rw
    }
    dy += rh
  }
  ctx.fillStyle = LINE
  for (let py = 0; py < POP_MASK_H; py++) {
    for (let px = 0; px < POP_MASK_W; px++) {
      if (mask[py * POP_MASK_W + px] !== 1) continue
      ctx.fillRect(x + px - 1, y + py - 1, 3, 3)
    }
  }
  ctx.fillStyle = GOLD_LIGHT
  for (let py = 0; py < POP_MASK_H; py++) {
    for (let px = 0; px < POP_MASK_W; px++) {
      if (mask[py * POP_MASK_W + px] !== 1) continue
      ctx.fillRect(x + px, y + py, 1, 1)
    }
  }
}
