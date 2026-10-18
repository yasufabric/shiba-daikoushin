import { FUR_BLACK, FUR_CREAM, FUR_RED, FUR_SESAME, HERO_REWARD, heroCell, pawArt } from './art'
import {
  ATTACK_RANGE,
  BONE_X,
  BONE_Y,
  CARD_H,
  CARD_W,
  CARD_X0,
  CARD_Y,
  CASTLE_HP,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  BANNER_HOLD,
  FLOAT_TIME,
  KIND_BLACK,
  KIND_TAN,
  KIND_WHITE,
  KINDS,
  CARD_XS,
  CUT_TIME,
  SPECIAL_NEED,
  LANE_COUNT,
  MAX_CATS,
  MAX_SHIBAS,
  PANEL_Y,
} from './balance'
import { BANNER_POP, BANNER_REST, CLEAR_WORD, glyphBit, letterBit, LOSE_WORD, POP_COL, POP_ROW, RUMBLE_WORD, SPECIAL_WORDS } from './font'
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
  FUR_BODY,
  FUR_MID,
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
  WHITE_DARK,
  WHITE_MID,
} from './palette'
import { costOf, type Outcome, type Sim } from './sim'
import { createSheets, type Sheets } from './sprites'

const BUCKETS = 96
const GHOSTS = 48
const BOOMS = 24
const PARTS = 128
const POP_MASK_W = 14
const POP_MASK_H = 17

const LANE_PX = [37, 37, 37, 36, 36] as const
const GOLD_CYCLE = [GOLD_DARK, GOLD, GOLD_LIGHT, GOLD_HOT] as const
const BOOM_COLOR = [WHITE, GOLD_LIGHT, GOLD, GOLD_HOT] as const
const PART_COLOR = [WHITE, GOLD_LIGHT, GOLD, DANGER] as const
const SHIFT = [0, 2, -2, 3, -3, 1, -1, 0] as const
const BOB = [0, 1, 2, 1, 0, -1, -2, -1] as const
const HOP = [0, 2, 4, 6, 4, 2, 0, 0] as const
const BLAST_N = 16
const BLAST_VX = [2, -2, 3, -3, 1, -1, 2, -2, 0, 3, -3, 1, 2, -1, 0, 1] as const
const BLAST_VY = [-3, -2, -1, -3, -2, 1, 2, -1, -3, 1, 2, -2, 1, 2, -2, 0] as const
const BLAST_SIZE = [2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1, 3, 2] as const
const BLAST_COLOR = [WHITE, GOLD_LIGHT, FUR_BODY, GOLD] as const
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
  shibaCd: Float32Array
  shibaAct: Float64Array
  catFly: Uint8Array
  catSeen: Uint8Array
  catY: Float32Array
  catBirth: Float64Array
  ghostX: Int16Array
  ghostY: Int16Array
  ghostFur: Uint8Array
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

export interface ViewFit {
  scale: number
  cssW: number
  cssH: number
  internalW: number
  internalH: number
}

export interface ScreenInsets {
  top: number
  right: number
  bottom: number
  left: number
}

const MIN_PIXEL_SCALE = 2
const INTERNAL_W_LO = 180
const INTERNAL_W_HI = 215

/** Integer CSS scale of at least 2, chosen so the internal width stays near 180–215. */
function scaleForWidth(cssW: number): number {
  let scale = Math.max(MIN_PIXEL_SCALE, Math.round(cssW / INTERNAL_W))
  while (Math.ceil(cssW / scale) > INTERNAL_W_HI && Math.ceil(cssW / (scale + 1)) >= INTERNAL_W_LO) {
    scale += 1
  }
  return scale
}

/** Cover the viewport at an integer scale of at least 2. Height never lowers the scale. */
export function fitView(cssW: number, cssH: number): ViewFit {
  const w = Math.max(1, Math.round(cssW))
  const h = Math.max(1, Math.round(cssH))
  const scale = scaleForWidth(w)
  return {
    scale,
    cssW: w,
    cssH: h,
    internalW: Math.ceil(w / scale),
    internalH: Math.ceil(h / scale),
  }
}

export function pixelScale(cssW: number, cssH: number): number {
  return fitView(cssW, cssH).scale
}

interface Frame {
  scale: number
  cssW: number
  cssH: number
  internalW: number
  internalH: number
  shiftX: number
  topDy: number
  dockDy: number
  ox: number
  oy: number
}

const frame: Frame = {
  scale: 1,
  cssW: INTERNAL_W,
  cssH: INTERNAL_H,
  internalW: INTERNAL_W,
  internalH: INTERNAL_H,
  shiftX: 0,
  topDy: 0,
  dockDy: 0,
  ox: 0,
  oy: 0,
}

const ZERO_INSETS: ScreenInsets = { top: 0, right: 0, bottom: 0, left: 0 }

function applyFrame(cssW: number, cssH: number, insets: ScreenInsets): void {
  const fit = fitView(cssW, cssH)
  const safeTop = Math.max(0, Math.round(insets.top / fit.scale))
  const safeBottom = Math.max(0, Math.round(insets.bottom / fit.scale))
  const safeLeft = Math.max(0, Math.round(insets.left / fit.scale))
  const safeRight = Math.max(0, Math.round(insets.right / fit.scale))
  const extraW = fit.internalW - INTERNAL_W
  const extraH = fit.internalH - INTERNAL_H
  let shiftX = extraW >> 1
  if (extraW > 0) {
    const minShift = Math.min(safeLeft, extraW)
    const maxShift = Math.max(minShift, extraW - safeRight)
    if (shiftX < minShift) shiftX = minShift
    if (shiftX > maxShift) shiftX = maxShift
  }
  const destW = fit.internalW * fit.scale
  const destH = fit.internalH * fit.scale
  frame.scale = fit.scale
  frame.cssW = fit.cssW
  frame.cssH = fit.cssH
  frame.internalW = fit.internalW
  frame.internalH = fit.internalH
  frame.shiftX = shiftX
  frame.topDy = safeTop
  frame.dockDy = extraH - safeTop - safeBottom
  frame.ox = destW > fit.cssW ? -((destW - fit.cssW) >> 1) : 0
  frame.oy = destH > fit.cssH ? -((destH - fit.cssH) >> 1) : 0
}

function ensureView(renderer: Renderer): void {
  const view = renderer.view
  if (view.width === frame.internalW && view.height === frame.internalH) return
  view.width = frame.internalW
  view.height = frame.internalH
  renderer.pen.imageSmoothingEnabled = false
}

function px(designX: number): number {
  return designX + frame.shiftX
}

function py(designY: number): number {
  return designY + frame.topDy
}

function pyDock(designY: number): number {
  return designY + frame.topDy + frame.dockDy
}

export function screenToWorld(
  clientX: number,
  clientY: number,
  rectLeft: number,
  rectTop: number,
): { x: number; y: number } {
  const ix = Math.round((clientX - rectLeft - frame.ox) / frame.scale) - frame.shiftX
  const iyRaw = Math.round((clientY - rectTop - frame.oy) / frame.scale) - frame.topDy
  const panel = at(PANEL_Y) + frame.dockDy
  const iy = iyRaw >= panel ? iyRaw - frame.dockDy : iyRaw
  return { x: ix * 2, y: iy * 2 }
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
    shibaCd: new Float32Array(MAX_SHIBAS),
    shibaAct: new Float64Array(MAX_SHIBAS).fill(-9),
    catFly: new Uint8Array(MAX_CATS),
    catSeen: new Uint8Array(MAX_CATS),
    catY: new Float32Array(MAX_CATS),
    catBirth: new Float64Array(MAX_CATS),
    ghostX: new Int16Array(GHOSTS),
    ghostY: new Int16Array(GHOSTS),
    ghostFur: new Uint8Array(GHOSTS),
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
  insets: ScreenInsets = ZERO_INSETS,
): void {
  applyFrame(cssW, cssH, insets)
  ensureView(renderer)
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
  g.fillRect(0, 0, frame.internalW, frame.internalH)
  g.save()
  g.translate(sx, sy)
  paintBackdrop(g, sim.time)
  paintCastle(g, renderer, sim)
  g.save()
  g.beginPath()
  const fieldExtra = frame.dockDy > 0 ? frame.dockDy : 0
  g.rect(px(at(FIELD_X)), py(at(FIELD_Y)), at(FIELD_W), at(FIELD_H) + fieldExtra)
  g.clip()
  paintUnits(g, renderer, sim)
  paintGhosts(g, renderer, sim)
  paintBooms(g, renderer, sim)
  g.restore()
  paintSpecialField(g, sim)
  paintDamage(g, renderer, sim)
  paintCutIn(g, renderer, sim)
  g.restore()
  paintDock(g, renderer, sim)
  if (sim.outcome === 'won' && sim.rewardT <= 0) paintReward(g, renderer, sim)
  else if (sim.outcome === 'won' || sim.outcome === 'lost') paintBanner(g, sim)
  else if (sim.tutorial) paintPaw(g, renderer, sim.time)

  const destW = frame.internalW * frame.scale
  const destH = frame.internalH * frame.scale
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, frame.cssW, frame.cssH)
  ctx.drawImage(renderer.view, frame.ox, frame.oy, destW, destH)
}

/** One path's strip of night meadow. No stripes: grass tufts and darker patches scroll at the march pace. */
function paintLane(ctx: CanvasRenderingContext2D, x: number, laneW: number, lane: number, fy: number, fh: number, rows: number, scroll: number): void {
  if (laneW < 6) return
  for (let row = 0; row < rows; row++) {
    const y = fy + ((row * 12 + lane * 5 + scroll) % fh)
    const tx = x + 1 + ((row * 13 + lane * 11) % (laneW - 5))
    if (row % 5 === 2) {
      ctx.fillStyle = NIGHT
      ctx.fillRect(tx, y + 1, 6, 2)
      ctx.fillRect(tx + 1, y, 4, 4)
      continue
    }
    ctx.fillStyle = row % 3 === 0 ? NIGHT_3 : NIGHT_2
    ctx.fillRect(tx, y, 1, 2)
    ctx.fillRect(tx + 1, y + 1, 1, 1)
    ctx.fillRect(tx + 2, y, 1, 2)
  }
}

function paintLanes(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  fw: number,
  fh: number,
  rows: number,
  scroll: number,
  width: number,
): void {
  let x = fx
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const laneW = LANE_PX[lane] ?? 0
    paintLane(ctx, x, laneW, lane, fy, fh, rows, scroll)
    x += laneW
  }
  if (width === INTERNAL_W && fx === at(FIELD_X)) return
  let left = fx
  let lane = 0
  while (left > 0) {
    lane = (lane - 1 + LANE_COUNT) % LANE_COUNT
    const laneW = LANE_PX[lane] ?? 0
    const drawX = Math.max(0, left - laneW)
    paintLane(ctx, drawX, left - drawX, lane, fy, fh, rows, scroll)
    left = drawX
  }
  let right = fx + fw
  lane = 0
  while (right < width) {
    const laneW = LANE_PX[lane] ?? 0
    const drawW = Math.min(laneW, width - right)
    paintLane(ctx, right, drawW, lane, fy, fh, rows, scroll)
    right += drawW
    lane = (lane + 1) % LANE_COUNT
  }
}

function paintBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
  const width = frame.internalW
  const fx = px(at(FIELD_X))
  const fy = py(at(FIELD_Y))
  const fw = at(FIELD_W)
  const fieldExtra = frame.dockDy > 0 ? frame.dockDy : 0
  const fh = at(FIELD_H) + fieldExtra
  const skyTop = 16 + frame.topDy
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(0, 0, width, skyTop)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(0, skyTop, width, Math.max(0, fy - skyTop))
  paintStars(ctx, width, fy - 2, time)
  ctx.fillStyle = NIGHT_3
  ctx.fillRect(0, fy - 2, width, 2)
  const panel = pyDock(at(PANEL_Y))
  const groundH = Math.max(fh, panel - fy)
  ctx.fillStyle = NIGHT_1
  if (frame.internalW === INTERNAL_W && frame.shiftX === 0 && fieldExtra === 0 && frame.topDy === 0) {
    ctx.fillRect(fx, fy, fw, fh)
  } else {
    ctx.fillRect(0, fy, width, groundH)
  }
  const rows = fieldExtra > 0 ? Math.ceil(fh / 12) + 2 : 28
  const scroll = Math.floor(time * 36) % 12
  paintLanes(ctx, fx, fy, fw, fh, rows, scroll, frame.internalW)
  ctx.fillStyle = LINE
  ctx.fillRect(0, panel, width, 1)
}

const STAR_X = [9, 31, 52, 77, 118, 141, 166, 184, 20, 98, 158, 64] as const
const STAR_Y = [3, 9, 5, 12, 4, 10, 6, 13, 18, 16, 20, 22] as const

/** Plus-shaped stars in the sky band. One in four twinkles white. */
function paintStars(ctx: CanvasRenderingContext2D, width: number, bottom: number, time: number): void {
  const tick = Math.floor(time * 3)
  for (let i = 0; i < STAR_X.length; i++) {
    const x = Math.round(((STAR_X[i] ?? 0) * width) / INTERNAL_W)
    const y = (STAR_Y[i] ?? 0) + frame.topDy
    if (y + 2 >= bottom) continue
    const lit = ((tick + i * 3) & 3) === 0
    ctx.fillStyle = lit ? WHITE : NIGHT_3
    ctx.fillRect(x, y + 1, 3, 1)
    ctx.fillRect(x + 1, y, 1, 3)
  }
}

function paintCastle(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (sim.outcome === 'won') {
    paintCastleBlast(ctx, sim)
    return
  }
  const sprite = sim.boss ? renderer.sheets.castle : renderer.sheets.castleDim
  const x = (frame.internalW - BOSS_W) >> 1
  const y = frame.topDy
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
  const beat = offbeat(sim.time, index)
  const flash = fighting && hitFrame(beat)
  const dx = px(at(FIELD_X + unit.x)) - (CROWD_PX >> 1)
  const hop = celebrateHop(sim, index)
  const dy = py(at(FIELD_Y + unit.y)) - CROWD_PX - hop
  ctx.fillStyle = NIGHT
  ctx.fillRect(dx + 4, dy + hop + CROWD_PX - 2, 16, 2)
  const cd = unit.cd
  if (seen && cd > (renderer.shibaCd[index] ?? 0) + 0.5) {
    renderer.shibaAct[index] = sim.time
    if (unit.kind === KIND_BLACK) spawnBoom(renderer, sim, dx + 11, dy - 4)
  }
  renderer.shibaCd[index] = cd
  if (unit.kind === KIND_TAN && sim.rushT > 0 && moved) {
    ctx.fillStyle = (Math.floor(sim.time * 24) & 1) === 0 ? GOLD : GOLD_LIGHT
    ctx.fillRect(dx + 6, dy + CROWD_PX, 1, 4)
    ctx.fillRect(dx + 16, dy + CROWD_PX + 1, 1, 5)
  }
  blitCrowd(ctx, renderer, furOf(unit.kind, index), pose, fighting ? beat : sim.time, unit.lane, 0, flash, dx, dy)
  if (unit.kind === KIND_WHITE) paintBark(ctx, sim.time - (renderer.shibaAct[index] ?? -9), dx + 12, dy)
}

/** 白柴's bark: three widening bars rising off the helmet, ")))" turned upward. */
function paintBark(ctx: CanvasRenderingContext2D, age: number, cx: number, top: number): void {
  if (age < 0 || age > 0.3) return
  const rise = Math.floor(age * 30)
  for (let ring = 0; ring < 3; ring++) {
    const half = 3 + ring * 3
    const y = top - 3 - ring * 3 - rise
    ctx.fillStyle = ring === 0 ? WHITE : ring === 1 ? GOLD_HOT : GOLD_LIGHT
    ctx.fillRect(cx - half + 1, y, half * 2 - 2, 1)
    ctx.fillRect(cx - half, y + 1, 1, 2)
    ctx.fillRect(cx + half - 1, y + 1, 1, 2)
  }
}

function drawCat(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, index: number): void {
  const cat = sim.cats[index]
  if (!cat?.alive) return
  const dx = px(at(FIELD_X + cat.x)) - (CAT_PX >> 1)
  const dy = py(at(FIELD_Y + cat.y)) - CAT_PX
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
  ctx.fillStyle = NIGHT
  ctx.fillRect(dx + 4, dy + CAT_PX - 2, 20, 2)
  const prev = renderer.catY[index] ?? 0
  const seen = renderer.catSeen[index] === 1
  renderer.catY[index] = cat.y
  renderer.catSeen[index] = 1
  const moved = !seen || Math.abs(cat.y - prev) > 0.2
  const fighting = foeNear(sim, cat.lane, cat.y, false)
  const pose = poseOf(moved, fighting)
  const beat = offbeat(sim.time, index)
  blitCat(ctx, renderer, pose, fighting ? beat : sim.time, cat.lane, 0, fighting && hitFrame(beat), dx, dy)
}

function noteDeaths(renderer: Renderer, sim: Sim): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    const alive = unit?.alive ? 1 : 0
    if ((renderer.shibaOn[i] ?? 0) === 1 && alive === 0 && unit) {
      const dx = px(at(FIELD_X + unit.x)) - (CROWD_PX >> 1)
      const dy = py(at(FIELD_Y + unit.y)) - CROWD_PX
      spawnGhost(renderer, sim, dx, dy, furOf(unit.kind, i))
      spawnBoom(renderer, sim, dx + (CROWD_PX >> 1), dy + (CROWD_PX >> 1))
    }
    renderer.shibaOn[i] = alive
  }
}

/** Each card is one coat: 赤 (with a sprinkle of 胡麻), 黒, and 白. */
function furOf(kind: number, index: number): number {
  if (kind === KIND_BLACK) return FUR_BLACK
  if (kind === KIND_WHITE) return FUR_CREAM
  if (index % 7 === 3) return FUR_SESAME
  return FUR_RED
}

function poseOf(moved: boolean, fighting: boolean): Pose {
  if (fighting) return 'attack'
  if (moved) return 'walk'
  return 'idle'
}

/** Shift a fighter's attack cycle by whole frames so a packed front line does not flash in unison. */
function offbeat(time: number, index: number): number {
  return time + (index & 3) / 12
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
  fur: number,
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
  const srcY = (fur * 4 + spin) * CROWD_PX
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

function spawnGhost(renderer: Renderer, sim: Sim, x: number, y: number, fur: number): void {
  const i = renderer.ghostCursor % GHOSTS
  renderer.ghostCursor = i + 1
  renderer.ghostOn[i] = 1
  renderer.ghostX[i] = x
  renderer.ghostY[i] = y
  renderer.ghostFur[i] = fur
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
    blitCrowd(ctx, renderer, renderer.ghostFur[i] ?? 0, 'walk', sim.time, 0, spin, age < 0.06, x, y)
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

const COAT_DARK = [FUR_MID, NIGHT, WHITE_DARK] as const
const COAT_LIT = [FUR_BODY, NIGHT_2, WHITE_MID] as const
const CUT_H = 44
const CUT_SLIDE = 0.12

/** Field-wide effect for the first beat of a special: 黒 slashes down every path, 白 sweeps a shockwave up. */
function paintSpecialField(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.cutKind < 0) return
  const age = CUT_TIME - sim.cutT
  const fx = px(at(FIELD_X))
  const fy = py(at(FIELD_Y))
  const fh = at(FIELD_H)
  if (sim.cutKind === KIND_BLACK && age < 0.36) {
    const reach = Math.floor((Math.min(1, age / 0.18) * fh) / 4) * 4
    let x = fx
    for (let lane = 0; lane < LANE_PX.length; lane++) {
      const cx = x + ((LANE_PX[lane] ?? 0) >> 1)
      ctx.fillStyle = GOLD_CYCLE[(Math.floor(age * 24) + lane) & 3] ?? GOLD
      ctx.fillRect(cx - 1, fy, 3, reach)
      ctx.fillStyle = WHITE
      ctx.fillRect(cx, fy, 1, reach)
      x += LANE_PX[lane] ?? 0
    }
  }
  if (sim.cutKind === KIND_WHITE && age < 0.45) {
    const y = fy + fh - Math.floor((age / 0.45) * fh)
    const w = frame.internalW
    ctx.fillStyle = WHITE_MID
    ctx.fillRect(0, y + 4, w, 2)
    ctx.fillStyle = WHITE
    ctx.fillRect(0, y, w, 4)
    ctx.fillStyle = GOLD_HOT
    for (let x = (Math.floor(age * 60) & 7); x < w; x += 8) ctx.fillRect(x, y - 2, 3, 2)
  }
}

/** Small cut-in: a striped band slides in, the smug face shouts the food, and ゴゴゴ shakes above it. */
function paintCutIn(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const kind = sim.cutKind
  if (kind < 0 || sim.cutT <= 0) return
  const age = CUT_TIME - sim.cutT
  const w = frame.internalW
  let slide = 0
  if (age < CUT_SLIDE) slide = -Math.ceil(w * (1 - age / CUT_SLIDE))
  else if (sim.cutT < CUT_SLIDE) slide = Math.ceil(w * (1 - sim.cutT / CUT_SLIDE))
  const y = py(at(FIELD_Y)) + Math.round(at(FIELD_H) * 0.56)
  ctx.fillStyle = LINE
  ctx.fillRect(0, y - 2, w, CUT_H + 4)
  ctx.fillStyle = COAT_DARK[kind] ?? NIGHT
  ctx.fillRect(0, y, w, CUT_H)
  ctx.fillStyle = COAT_LIT[kind] ?? NIGHT_2
  const drift = Math.floor(age * 48) % 12
  for (let row = 0; row < CUT_H; row++) {
    for (let x = -CUT_H + ((drift + row) % 12); x < w; x += 12) ctx.fillRect(x + slide, y + row, 4, 1)
  }
  ctx.fillStyle = GOLD
  ctx.fillRect(0, y, w, 1)
  ctx.fillRect(0, y + CUT_H - 1, w, 1)
  const col = heroCell(kind, 'smug')
  const hx = 6 + slide
  ctx.fillStyle = NIGHT
  ctx.fillRect(hx - 2, y + 4, HERO_PX + 4, HERO_PX + 4)
  frameRect(ctx, hx - 2, y + 4, HERO_PX + 4, HERO_PX + 4, GOLD_LIGHT)
  ctx.drawImage(renderer.sheets.hero, col * HERO_PX, 0, HERO_PX, HERO_PX, hx, y + 6, HERO_PX, HERO_PX)
  const word = SPECIAL_WORDS[kind] ?? ''
  const shake = age < 0.3 ? (Math.floor(age * 30) & 1) : 0
  const tx = hx + HERO_PX + 8
  for (let i = 0; i < word.length; i++) {
    drawLetter(ctx, word[i] ?? '', tx + i * 18 + shake, y + 12, 2, GOLD_LIGHT)
  }
  if (slide !== 0) return
  const jitter = Math.floor(age * 16) & 1
  for (let i = 0; i < RUMBLE_WORD.length; i++) {
    const gx = w - 4 - (RUMBLE_WORD.length - i) * 11 + ((i + jitter) & 1)
    const gy = y - 13 - ((i + jitter) & 1)
    drawLetter(ctx, RUMBLE_WORD[i] ?? '', gx, gy, 1, DANGER)
  }
}

function paintDamage(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (sim.floatT <= 0 || sim.floatDmg <= 0) return
  const pop = sim.floatT > FLOAT_TIME - 0.12
  const digits = digitCount(sim.floatDmg)
  const step = pop ? 14 : 10
  const rise = Math.round((1 - sim.floatT / FLOAT_TIME) * 28)
  const x = (frame.internalW - digits * step) >> 1
  const y = py(at(FIELD_Y) + Math.round(at(FIELD_H) * 0.38) - rise)
  drawNumber(ctx, renderer, sim.floatDmg | 0, x, y, pop)
}

function paintDock(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const y = pyDock(at(PANEL_Y))
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, y + 1, frame.internalW, Math.max(0, frame.internalH - y - 1))
  ctx.drawImage(renderer.sheets.bone, px(at(BONE_X)), pyDock(at(BONE_Y)))
  drawNumber(ctx, renderer, sim.bones | 0, px(at(BONE_X)) + 14, pyDock(at(BONE_Y)) + 1, false)
  for (let kind = 0; kind < KINDS; kind++) {
    const deny = kind === KIND_TAN ? sim.deny0 : kind === KIND_BLACK ? sim.deny1 : sim.deny2
    const cost = costOf(sim, kind)
    const x = px(at(CARD_XS[kind] ?? CARD_X0) + denyShift(deny))
    paintCard(ctx, renderer, x, kind, cost, sim.bones >= cost, kind === KIND_TAN && sim.tutorial, sim.time)
    paintGauge(ctx, x, kind, sim)
  }
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
  const y = pyDock(at(CARD_Y))
  const w = at(CARD_W)
  const h = at(CARD_H)
  ctx.fillStyle = affordable ? NIGHT_1 : NIGHT
  ctx.fillRect(x, y, w, h)
  const hx = x + ((w - HERO_PX) >> 1)
  ctx.fillStyle = affordable ? NIGHT_2 : NIGHT_1
  ctx.fillRect(hx - 6, y + 4, HERO_PX + 12, HERO_PX + 2)
  ctx.fillRect(hx - 8, y + 6, HERO_PX + 16, HERO_PX - 2)
  ctx.fillStyle = affordable ? NIGHT_3 : NIGHT_2
  ctx.fillRect(hx - 2, y + HERO_PX + 2, HERO_PX + 4, 2)
  const phase = Math.floor(time * 8) & 3
  const border = hint ? (GOLD_CYCLE[phase] ?? GOLD_LIGHT) : affordable ? GOLD : NIGHT_2
  const inner = hint ? (GOLD_CYCLE[(phase + 2) & 3] ?? GOLD) : affordable ? GOLD_DARK : NIGHT_1
  frameRect(ctx, x, y, w, h, border)
  frameRect(ctx, x + 1, y + 1, w - 2, h - 2, inner)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 1, 1)
  ctx.fillRect(x + w - 1, y, 1, 1)
  ctx.fillRect(x, y + h - 1, 1, 1)
  ctx.fillRect(x + w - 1, y + h - 1, 1, 1)
  const blink = (Math.floor(time * 2) & 1) === 1
  const col = heroCell(kind, blink ? 'blink' : 'open')
  const hop = affordable ? (HOP[Math.floor(time * 8) & 7] ?? 0) >> 1 : 0
  ctx.drawImage(renderer.sheets.hero, col * HERO_PX, 0, HERO_PX, HERO_PX, hx, y + 3 - hop, HERO_PX, HERO_PX)
  ctx.drawImage(renderer.sheets.bone, x + 3, y + h - 14)
  drawNumber(ctx, renderer, cost | 0, x + 17, y + h - 12, false)
}

/** Special gauge under the portrait. Full gauges flash through the golds until the cut-in plays. */
function paintGauge(ctx: CanvasRenderingContext2D, x: number, kind: number, sim: Sim): void {
  const y = pyDock(at(CARD_Y)) + 38
  const w = at(CARD_W) - 8
  const need = SPECIAL_NEED[kind] ?? 1
  const fill = Math.min(w, Math.floor((w * (sim.charge[kind] ?? 0)) / need))
  ctx.fillStyle = LINE
  ctx.fillRect(x + 3, y - 1, w + 2, 4)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(x + 4, y, w, 2)
  const full = fill >= w
  ctx.fillStyle = full ? (GOLD_CYCLE[Math.floor(sim.time * 12) & 3] ?? GOLD) : GOLD
  ctx.fillRect(x + 4, y, fill, 2)
  if (!full && fill > 0) {
    ctx.fillStyle = GOLD_LIGHT
    ctx.fillRect(x + 4, y, fill, 1)
  }
}

function frameRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, 1)
  ctx.fillRect(x, y + h - 1, w, 1)
  ctx.fillRect(x, y, 1, h)
  ctx.fillRect(x + w - 1, y, 1, h)
}

function paintPaw(ctx: CanvasRenderingContext2D, renderer: Renderer, time: number): void {
  const bob = BOB[Math.floor(time * 6) & 7] ?? 0
  const x = px(at(CARD_X0) + ((at(CARD_W) - pawArt.w) >> 1))
  const y = pyDock(at(CARD_Y)) - 6 + bob
  ctx.drawImage(renderer.sheets.paw, x, y)
}

function celebrateHop(sim: Sim, index: number): number {
  if (sim.outcome !== 'won' || sim.rewardT <= 0) return 0
  const age = BANNER_HOLD - sim.rewardT
  const phase = (Math.floor(age * 8) + index) & 7
  return HOP[phase] ?? 0
}

function paintCastleBlast(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.rewardT <= 0) return
  const age = BANNER_HOLD - sim.rewardT
  const blast = Math.floor(age * 12)
  const cx = frame.internalW >> 1
  const cy = (BOSS_H >> 1) + frame.topDy
  if (blast < 3) {
    const size = 48 + blast * 16
    ctx.fillStyle = blast === 0 ? WHITE : blast === 1 ? GOLD_LIGHT : FUR_BODY
    ctx.fillRect(cx - (size >> 1), cy - (size >> 1), size, size)
    return
  }
  const particleAge = age - 0.25
  if (particleAge < 0 || particleAge > 0.5) return
  const steps = Math.floor(particleAge * 24)
  for (let i = 0; i < BLAST_N; i++) {
    const size = BLAST_SIZE[i] ?? 1
    const x = cx + (BLAST_VX[i] ?? 0) * steps - (size >> 1)
    const y = cy + (BLAST_VY[i] ?? 0) * steps - (size >> 1)
    ctx.fillStyle = BLAST_COLOR[i & 3] ?? WHITE
    ctx.fillRect(x, y, size, size)
  }
}

function bannerStyle(outcome: Outcome): { word: string; fill: string } {
  switch (outcome) {
    case 'won':
      return { word: CLEAR_WORD, fill: GOLD_LIGHT }
    case 'lost':
      return { word: LOSE_WORD, fill: DANGER }
    case 'play':
      return { word: '', fill: GOLD_LIGHT }
    default: {
      const never: never = outcome
      return never
    }
  }
}

function paintBanner(ctx: CanvasRenderingContext2D, sim: Sim): void {
  const age = BANNER_HOLD - sim.rewardT
  const pop = age < 0.16
  const scale = pop ? BANNER_POP : BANNER_REST
  const style = bannerStyle(sim.outcome)
  const word = style.word
  const fill = style.fill
  const gw = GLYPH_W * scale
  const gh = GLYPH_H * scale
  const gap = scale
  const width = word.length * gw + (word.length - 1) * gap
  const x = (frame.internalW - width) >> 1
  const y = py(at(FIELD_Y) + ((at(FIELD_H) - gh) >> 1))
  const pad = 6
  ctx.fillStyle = NIGHT
  ctx.fillRect(x - pad, y - pad, width + pad * 2, gh + pad * 2)
  const won = sim.outcome === 'won'
  frameRect(ctx, x - pad, y - pad, width + pad * 2, gh + pad * 2, won ? GOLD : DANGER)
  frameRect(ctx, x - pad + 2, y - pad + 2, width + pad * 2 - 4, gh + pad * 2 - 4, won ? GOLD_DARK : DANGER_DARK)
  for (let i = 0; i < word.length; i++) {
    drawLetter(ctx, word[i] ?? '', x + i * (gw + gap), y, scale, fill)
  }
}

function drawLetter(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  scale: number,
  fill: string,
): void {
  ctx.fillStyle = LINE
  for (let sy = 0; sy < GLYPH_H; sy++) {
    for (let sx = 0; sx < GLYPH_W; sx++) {
      if (!letterBit(ch, sx, sy)) continue
      ctx.fillRect(x + sx * scale - 1, y + sy * scale - 1, scale + 2, scale + 2)
    }
  }
  ctx.fillStyle = fill
  for (let sy = 0; sy < GLYPH_H; sy++) {
    for (let sx = 0; sx < GLYPH_W; sx++) {
      if (!letterBit(ch, sx, sy)) continue
      ctx.fillRect(x + sx * scale, y + sy * scale, scale, scale)
    }
  }
}

function paintReward(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, frame.internalW, frame.internalH)
  const w = 96
  const h = 112
  const bob = BOB[Math.floor(sim.time * 3) & 7] ?? 0
  const x = (frame.internalW - w) >> 1
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
  ctx.drawImage(renderer.sheets.hero, HERO_REWARD * HERO_PX, 0, HERO_PX, HERO_PX, hx, y + 16, HERO_PX, HERO_PX)
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
