import { FUR_BLACK, FUR_CREAM, FUR_RED, FUR_SESAME, heroCell, pawArt } from './art'
import {
  ATTACK_RANGE,
  BONE_X,
  BONE_Y,
  CARD_H,
  CARD_W,
  CARD_X0,
  CARD_Y,
  BOSS_HP,
  BREED_BOSS,
  BREED_CORGI,
  HOME_HP,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  BANNER_HOLD,
  FLOAT_TIME,
  KIND_BLACK,
  KIND_TAN,
  KIND_WHITE,
  KIND_SESAME,
  KINDS,
  CARD_XS,
  RECHARGE,
  MAX_LEVEL,
  SHOP_ROW_GAP,
  SHOP_ROW_H,
  SHOP_ROW_W,
  SHOP_ROW_X,
  SHOP_ROW_Y0,
  START_H,
  START_W,
  START_X,
  START_Y,
  CUT_TIME,
  FX_TIME,
  SPECIAL_NEED,
  LANE_COUNT,
  MAX_CATS,
  MAX_SHIBAS,
  PANEL_Y,
} from './balance'
import { BANNER_POP, BANNER_REST, CLEAR_WORD, glyphBit, LEVEL_WORD, letterBit, LOSE_WORD, START_WORD, POP_COL, POP_ROW, RUMBLE_WORD, SPECIAL_WORDS } from './font'
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
  FUR_DARK,
  FUR_LIGHT,
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
  MEADOW,
  MEADOW_DARK,
  MEADOW_HOT,
  MEADOW_LIGHT,
  SKY,
  SKY_LIGHT,
  WHITE,
  WHITE_DARK,
  WHITE_MID,
} from './palette'
import { costOf, dogsLeft, levelCost, type Outcome, type Sim, type Unit } from './sim'
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
  /** Last special strike whose bursts were spawned. */
  fxSeen: number
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
    fxSeen: 0,
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
  paintBackdrop(g)
  paintCastle(g, renderer, sim)
  g.save()
  g.beginPath()
  const fieldExtra = frame.dockDy > 0 ? frame.dockDy : 0
  g.rect(px(at(FIELD_X)), py(at(FIELD_Y)), at(FIELD_W), at(FIELD_H) + fieldExtra)
  g.clip()
  paintHome(g, renderer)
  paintUnits(g, renderer, sim)
  paintHpBars(g, sim)
  paintBossBar(g, sim)
  paintHomeBar(g, renderer, sim)
  if (sim.outcome === 'play') paintLaneArrows(g, renderer)
  paintGhosts(g, renderer, sim)
  paintBooms(g, renderer, sim)
  g.restore()
  paintSpecialField(g, renderer, sim)
  paintDamage(g, renderer, sim)
  paintCutIn(g, renderer, sim)
  g.restore()
  paintDock(g, renderer, sim)
  if (sim.outcome !== 'play' && sim.rewardT <= 0) paintShop(g, renderer, sim)
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

/** One path's strip of daytime meadow. No stripes and no motion: grass tufts and darker patches stay put. */
function paintLane(ctx: CanvasRenderingContext2D, x: number, laneW: number, lane: number, fy: number, fh: number, rows: number): void {
  if (laneW < 6) return
  for (let row = 0; row < rows; row++) {
    const y = fy + ((row * 12 + lane * 5) % fh)
    const tx = x + 1 + ((row * 13 + lane * 11) % (laneW - 5))
    if (row % 5 === 2) {
      ctx.fillStyle = MEADOW_DARK
      ctx.fillRect(tx, y + 1, 6, 2)
      ctx.fillRect(tx + 1, y, 4, 4)
      continue
    }
    ctx.fillStyle = row % 3 === 0 ? MEADOW_HOT : MEADOW_LIGHT
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
  width: number,
): void {
  let x = fx
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const laneW = LANE_PX[lane] ?? 0
    paintLane(ctx, x, laneW, lane, fy, fh, rows)
    x += laneW
  }
  if (width === INTERNAL_W && fx === at(FIELD_X)) return
  let left = fx
  let lane = 0
  while (left > 0) {
    lane = (lane - 1 + LANE_COUNT) % LANE_COUNT
    const laneW = LANE_PX[lane] ?? 0
    const drawX = Math.max(0, left - laneW)
    paintLane(ctx, drawX, left - drawX, lane, fy, fh, rows)
    left = drawX
  }
  let right = fx + fw
  lane = 0
  while (right < width) {
    const laneW = LANE_PX[lane] ?? 0
    const drawW = Math.min(laneW, width - right)
    paintLane(ctx, right, drawW, lane, fy, fh, rows)
    right += drawW
    lane = (lane + 1) % LANE_COUNT
  }
}

function paintBackdrop(ctx: CanvasRenderingContext2D): void {
  const width = frame.internalW
  const fx = px(at(FIELD_X))
  const fy = py(at(FIELD_Y))
  const fw = at(FIELD_W)
  const fieldExtra = frame.dockDy > 0 ? frame.dockDy : 0
  const fh = at(FIELD_H) + fieldExtra
  ctx.fillStyle = SKY
  ctx.fillRect(0, 0, width, fy)
  ctx.fillStyle = SKY_LIGHT
  ctx.fillRect(0, fy - 6, width, 2)
  ctx.fillStyle = MEADOW_HOT
  ctx.fillRect(0, fy - 2, width, 2)
  const panel = pyDock(at(PANEL_Y))
  const groundH = Math.max(fh, panel - fy)
  ctx.fillStyle = MEADOW
  ctx.fillRect(0, fy, width, groundH)
  const rows = fieldExtra > 0 ? Math.ceil(fh / 12) + 2 : 28
  paintLanes(ctx, fx, fy, fw, fh, rows, frame.internalW)
  ctx.fillStyle = LINE
  ctx.fillRect(0, panel, width, 1)
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
  paintDogsLeft(ctx, renderer, sim, x + BOSS_W + 6, y + 6)
}

/** How many dogs are still to beat, the boss included: a dog-head icon and pink digits beside the mansion. */
function paintDogsLeft(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, x: number, y: number): void {
  const icon = renderer.sheets.cat
  ctx.drawImage(icon, 4 * CAT_PX, BREED_CORGI * 4 * CAT_PX, CAT_PX, 16, x - 4, y - 2, CAT_PX, 16)
  drawNumber(ctx, renderer, dogsLeft(sim), x + 22, y + 2, false)
}

/** The boss's HP, a wide pink bar across the top of the field while it is out. */
function paintBossBar(ctx: CanvasRenderingContext2D, sim: Sim): void {
  const boss = sim.bossIndex >= 0 ? sim.cats[sim.bossIndex] : undefined
  if (!boss?.alive || boss.fly === 1) return
  const w = frame.internalW - 24
  const x = 12
  const y = py(at(FIELD_Y)) + 4
  ctx.fillStyle = LINE
  ctx.fillRect(x - 1, y - 1, w + 2, 6)
  ctx.fillStyle = DANGER_DARK
  ctx.fillRect(x, y, w, 4)
  const fill = Math.max(0, Math.round((w * boss.hp) / BOSS_HP))
  ctx.fillStyle = DANGER
  ctx.fillRect(x, y, fill, 4)
  ctx.fillStyle = DANGER_LIGHT
  ctx.fillRect(x, y, fill, 1)
}

/** 柴の家: centered on the field floor. */
function paintHome(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  const sprite = renderer.sheets.home
  const x = (frame.internalW - sprite.width) >> 1
  const floor = py(at(FIELD_Y + FIELD_H))
  const y = floor - sprite.height
  ctx.drawImage(sprite, x, y)
}

/** Drawn over the units so a siege never hides how much home is left. */
function paintHomeBar(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const sprite = renderer.sheets.home
  const x = (frame.internalW - sprite.width) >> 1
  const y = py(at(FIELD_Y + FIELD_H)) - sprite.height
  const barW = 40
  const barX = x + ((sprite.width - barW) >> 1)
  const barY = y - 6
  ctx.fillStyle = LINE
  ctx.fillRect(barX - 1, barY - 1, barW + 2, 6)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(barX, barY, barW, 4)
  const fill = Math.round(barW * Math.max(0, sim.homeHp / HOME_HP))
  ctx.fillStyle = GOLD
  ctx.fillRect(barX, barY, fill, 4)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(barX, barY, fill, 1)
}

/** A small HP bar over every hurt unit, drawn after all units so none hides another's. Gold for shibas, pink for dogs. */
function paintHpBars(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive || unit.hp >= unit.maxHp || unit.maxHp <= 0) continue
    const x = px(at(FIELD_X + unit.x)) - 8
    const y = py(at(FIELD_Y + unit.y)) - CROWD_PX - 4
    drawHpBar(ctx, x, y, unit.hp / unit.maxHp, GOLD_DARK, GOLD, GOLD_LIGHT)
  }
  for (let i = 0; i < sim.cats.length; i++) {
    const dog = sim.cats[i]
    if (!dog?.alive || dog.fly === 1 || dog.hp >= dog.maxHp || dog.maxHp <= 0 || dog.kind === BREED_BOSS) continue
    const x = px(at(FIELD_X + dog.x)) - 8
    const y = py(at(FIELD_Y + dog.y)) - CAT_PX - 4
    drawHpBar(ctx, x, y, dog.hp / dog.maxHp, DANGER_DARK, DANGER, DANGER_LIGHT)
  }
}

function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, ratio: number, back: string, fill: string, lit: string): void {
  const w = 16
  const full = Math.max(0, Math.min(w, Math.ceil(w * ratio)))
  ctx.fillStyle = LINE
  ctx.fillRect(x - 1, y - 1, w + 2, 4)
  ctx.fillStyle = back
  ctx.fillRect(x, y, w, 2)
  ctx.fillStyle = fill
  ctx.fillRect(x, y, full, 2)
  ctx.fillStyle = lit
  ctx.fillRect(x, y, full, 1)
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
  blitCrowd(ctx, renderer, furOf(unit.kind), pose, fighting ? beat : sim.time, unit.lane, 0, flash, dx, dy)
  if (unit.kind === KIND_WHITE) paintBark(ctx, sim.time - (renderer.shibaAct[index] ?? -9), dx + 12, dy)
  if (unit.kind === KIND_SESAME) {
    drawHeart(ctx, dx + 16, dy + 1)
    paintMend(ctx, sim.time - (renderer.shibaAct[index] ?? -9), dx + 12, dy)
  }
}

/** 白柴's bark: three widening bars rising off the helmet, ")))" turned upward. */
/** 胡麻 heal: a pink heart floats up off the healer. */
function paintMend(ctx: CanvasRenderingContext2D, age: number, cx: number, top: number): void {
  if (age < 0 || age > 0.5) return
  drawHeart(ctx, cx - 3, top - 4 - Math.floor(age * 24))
}

/** Heart, 7×6, outlined. */
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 3, 4)
  ctx.fillRect(x + 4, y, 3, 4)
  ctx.fillRect(x + 1, y + 3, 5, 2)
  ctx.fillRect(x + 2, y + 4, 3, 2)
  ctx.fillStyle = DANGER_LIGHT
  ctx.fillRect(x + 1, y + 1, 1, 2)
  ctx.fillRect(x + 5, y + 1, 1, 2)
  ctx.fillRect(x + 2, y + 2, 3, 2)
  ctx.fillStyle = WHITE
  ctx.fillRect(x + 1, y + 1, 1, 1)
}

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
  if (cat.kind === BREED_BOSS) {
    drawBoss(ctx, renderer, sim, cat, index)
    return
  }
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
    blitCat(ctx, renderer, cat.kind, 'walk', sim.time, cat.lane, spin, age < 0.06, dx, dy)
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
  blitCat(ctx, renderer, cat.kind, pose, fighting ? beat : sim.time, cat.lane, 0, fighting && hitFrame(beat), dx, dy)
}

/** The boss: 48×48, two walk frames, a hit flash while it fights, and a big burst when it falls. */
function drawBoss(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, boss: Unit, index: number): void {
  const size = renderer.sheets.boss.height >> 1
  const dx = px(at(FIELD_X + boss.x)) - (size >> 1)
  const dy = py(at(FIELD_Y + boss.y)) - size
  if (boss.fly === 1) {
    if (renderer.catFly[index] !== 1) {
      renderer.catFly[index] = 1
      for (let k = 0; k < 4; k++) spawnBoom(renderer, sim, dx + 8 + k * 10, dy + 10 + (k & 1) * 20)
    }
    return
  }
  renderer.catFly[index] = 0
  ctx.fillStyle = NIGHT
  ctx.fillRect(dx + 8, dy + size - 2, size - 16, 2)
  const frameNo = Math.floor(sim.time * 3) & 1
  const fighting = foeNear(sim, boss.lane, boss.y, false)
  const flash = fighting && hitFrame(offbeat(sim.time, index))
  ctx.drawImage(renderer.sheets.boss, frameNo * size, flash ? size : 0, size, size, dx, dy, size, size)
}

function noteDeaths(renderer: Renderer, sim: Sim): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    const alive = unit?.alive ? 1 : 0
    if ((renderer.shibaOn[i] ?? 0) === 1 && alive === 0 && unit) {
      const dx = px(at(FIELD_X + unit.x)) - (CROWD_PX >> 1)
      const dy = py(at(FIELD_Y + unit.y)) - CROWD_PX
      spawnGhost(renderer, sim, dx, dy, furOf(unit.kind))
      spawnBoom(renderer, sim, dx + (CROWD_PX >> 1), dy + (CROWD_PX >> 1))
    }
    renderer.shibaOn[i] = alive
  }
}

/** Each card is one coat: 赤, 黒, 白, and the 胡麻 healer. Every crowd sprite matches its card. */
function furOf(kind: number): number {
  if (kind === KIND_BLACK) return FUR_BLACK
  if (kind === KIND_WHITE) return FUR_CREAM
  if (kind === KIND_SESAME) return FUR_SESAME
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
  breed: number,
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
  ctx.drawImage(sheet, col * CAT_PX, (breed * 4 + spin) * CAT_PX, CAT_PX, CAT_PX, dx, dy, CAT_PX, CAT_PX)
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

const COAT_DARK = [FUR_MID, NIGHT, WHITE_DARK, FUR_DARK] as const
const COAT_LIT = [FUR_BODY, NIGHT_2, WHITE_MID, FUR_MID] as const
const CUT_H = 44
const CUT_SLIDE = 0.12

/** A special's strike, once the cut-in is gone: 赤 sweet potatoes rain onto every 赤, 黒 jerky spears shoot up every path, 白 a cheese wedge slams the middle and rings out. */
function paintSpecialField(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  paintRushAura(ctx, sim)
  if (sim.fxKind < 0 || sim.fxT <= 0) return
  const age = FX_TIME - sim.fxT
  const fresh = renderer.fxSeen !== sim.fxId
  renderer.fxSeen = sim.fxId
  if (sim.fxKind === KIND_TAN) paintPotatoRain(ctx, renderer, sim, age)
  else if (sim.fxKind === KIND_BLACK) paintJerky(ctx, renderer, sim, age, fresh)
  else if (sim.fxKind === KIND_SESAME) paintSasami(ctx, renderer, sim, age)
  else paintCheese(ctx, renderer, sim, age, fresh)
}

/** While the rush lasts, gold embers rise off every 赤. */
function paintRushAura(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.rushT <= 0) return
  const beat = Math.floor(sim.time * 12)
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive || unit.kind !== KIND_TAN) continue
    const x = px(at(FIELD_X + unit.x))
    const top = py(at(FIELD_Y + unit.y)) - CROWD_PX
    for (let k = 0; k < 3; k++) {
      const rise = (beat + i * 3 + k * 4) % 12
      const ex = x - 8 + ((i * 7 + k * 6) % 16)
      ctx.fillStyle = GOLD_CYCLE[(beat + k) & 3] ?? GOLD
      const size = rise < 6 ? 2 : 1
      ctx.fillRect(ex, top + 6 - rise, size, size)
    }
  }
}

/** Sweet potato, 10×6 at scale k: purple-red skin with a gold cut end, outlined. */
function drawPotato(ctx: CanvasRenderingContext2D, x: number, y: number, k: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x + 1 * k, y, 8 * k, 6 * k)
  ctx.fillRect(x, y + 1 * k, 10 * k, 4 * k)
  ctx.fillStyle = DANGER_DARK
  ctx.fillRect(x + 2 * k, y + 1 * k, 6 * k, 4 * k)
  ctx.fillRect(x + 1 * k, y + 2 * k, 2 * k, 2 * k)
  ctx.fillStyle = DANGER
  ctx.fillRect(x + 3 * k, y + 1 * k, 4 * k, 1 * k)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(x + 7 * k, y + 2 * k, 2 * k, 2 * k)
}

function paintPotatoRain(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, age: number): void {
  let n = 0
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive || unit.kind !== KIND_TAN) continue
    const x = px(at(FIELD_X + unit.x)) - 10
    const head = py(at(FIELD_Y + unit.y)) - CROWD_PX
    const land = 0.22 + (n % 5) * 0.05
    n += 1
    if (age < land) {
      const drop = Math.round((1 - age / land) * 96)
      drawPotato(ctx, x, head - 8 - drop, 2)
      ctx.fillStyle = GOLD_HOT
      ctx.fillRect(x + 8, head - 20 - drop, 2, 8)
      ctx.fillRect(x + 4, head - 16 - drop, 1, 5)
      ctx.fillRect(x + 15, head - 16 - drop, 1, 5)
    } else if (age < land + 0.12) {
      if (Math.abs(age - land) < 0.04) spawnBoom(renderer, sim, x + 10, head)
      drawPotato(ctx, x, head - 8, 2)
    }
  }
}

/** Jerky spear, 6×22 at scale k: dark meat with lighter grain, outlined, tip first. */
function drawJerky(ctx: CanvasRenderingContext2D, x: number, y: number, k: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x, y + 1 * k, 6 * k, 21 * k)
  ctx.fillRect(x + 1 * k, y, 4 * k, 22 * k)
  ctx.fillStyle = FUR_DARK
  ctx.fillRect(x + 1 * k, y + 2 * k, 4 * k, 19 * k)
  ctx.fillStyle = FUR_MID
  for (let g = 4; g < 20; g += 5) ctx.fillRect(x + 2 * k, y + g * k, 2 * k, 2 * k)
  ctx.fillStyle = FUR_LIGHT
  ctx.fillRect(x + 2 * k, y + 1 * k, 2 * k, 1 * k)
}

function paintJerky(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, age: number, fresh: boolean): void {
  const fy = py(at(FIELD_Y))
  const fh = at(FIELD_H)
  const rise = 0.4
  if (fresh) {
    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const n = Math.min(3, sim.laneCN[lane] ?? 0)
      const idx = sim.laneC[lane]
      if (!idx) continue
      for (let j = 0; j < n; j++) {
        const dog = sim.cats[idx[j] ?? -1]
        if (dog) spawnBoom(renderer, sim, px(at(FIELD_X + dog.x)), py(at(FIELD_Y + dog.y)) - 14)
      }
    }
  }
  if (age >= rise + 0.15) return
  const p = Math.min(1, age / rise)
  const tipY = fy + fh - Math.round(p * (fh + 48))
  let x = px(at(FIELD_X))
  for (let lane = 0; lane < LANE_PX.length; lane++) {
    const cx = x + ((LANE_PX[lane] ?? 0) >> 1) - 6
    ctx.fillStyle = GOLD_CYCLE[(Math.floor(age * 24) + lane) & 3] ?? GOLD
    for (let y = tipY + 46; y < fy + fh; y += 6) {
      ctx.fillRect(cx + 4, y, 4, 3)
      ctx.fillRect(cx + (y & 4 ? 0 : 10), y + 2, 2, 2)
    }
    drawJerky(ctx, cx, tipY, 2)
    x += LANE_PX[lane] ?? 0
  }
}

/** 胡麻「ササミ!!」: hearts burst up off every shiba and gold pluses ring the 柴の家. */
function paintSasami(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, age: number): void {
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive) continue
    const x = px(at(FIELD_X + unit.x))
    const top = py(at(FIELD_Y + unit.y)) - CROWD_PX
    const lag = (i % 4) * 0.06
    if (age < lag || age > lag + 0.6) continue
    const rise = Math.floor((age - lag) * 40)
    drawHeart(ctx, x - 3 + ((i & 1) ? 4 : -4), top - rise)
  }
  const home = renderer.sheets.home
  const hx = frame.internalW >> 1
  const hy = py(at(FIELD_Y + FIELD_H)) - (home.height >> 1)
  const spin = Math.floor(age * 16) & 3
  for (let k = 0; k < 6; k++) {
    const ang = ((k * 60 + age * 240) * Math.PI) / 180
    const r = 24 + Math.floor(age * 20)
    const x = hx + Math.round(Math.cos(ang) * r)
    const y = hy + Math.round(Math.sin(ang) * r * 0.6)
    ctx.fillStyle = GOLD_CYCLE[(spin + k) & 3] ?? GOLD
    ctx.fillRect(x - 3, y - 1, 7, 3)
    ctx.fillRect(x - 1, y - 3, 3, 7)
  }
}

/** Cheese wedge, 30×18 at scale k, holes and all, outlined. */
function drawCheese(ctx: CanvasRenderingContext2D, cx: number, y: number, k: number): void {
  const x = cx - 15 * k
  ctx.fillStyle = LINE
  for (let row = 0; row < 18; row++) {
    const w = 8 + Math.floor((22 * row) / 17)
    ctx.fillRect(x + (30 - w - 1) * k, y + row * k, (w + 1) * k, 1 * k)
  }
  ctx.fillRect(x - 1 * k, y + 17 * k, 31 * k, 2 * k)
  for (let row = 1; row < 17; row++) {
    const w = 6 + Math.floor((22 * row) / 17)
    ctx.fillStyle = row < 3 ? GOLD_LIGHT : GOLD
    ctx.fillRect(x + (29 - w) * k, y + row * k, w * k, 1 * k)
  }
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(x + 18 * k, y + 8 * k, 3 * k, 3 * k)
  ctx.fillRect(x + 10 * k, y + 12 * k, 3 * k, 2 * k)
  ctx.fillRect(x + 24 * k, y + 13 * k, 2 * k, 2 * k)
  ctx.fillRect(x + 3 * k, y + 15 * k, 26 * k, 1 * k)
}

function paintCheese(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, age: number, fresh: boolean): void {
  const fy = py(at(FIELD_Y))
  const fh = at(FIELD_H)
  const cx = frame.internalW >> 1
  const mid = fy + Math.round(fh * 0.45)
  const fall = 0.14
  if (fresh) spawnBoom(renderer, sim, cx, mid)
  if (age < fall) {
    drawCheese(ctx, cx, fy - 36 + Math.round((age / fall) * (mid - fy)), 2)
    return
  }
  const ring = (age - fall) / (FX_TIME - fall - 0.15)
  if (ring < 1) {
    const r = Math.round(ring * frame.internalW * 0.75)
    const t = Math.floor(age * 30)
    for (let k = 0; k < 3; k++) {
      const rr = r - k * 14
      if (rr < 6) continue
      ctx.fillStyle = k === 0 ? WHITE : (GOLD_CYCLE[(t + k) & 3] ?? GOLD)
      ctx.fillRect(cx - rr, mid - rr, rr * 2, 3)
      ctx.fillRect(cx - rr, mid + rr - 3, rr * 2, 3)
      ctx.fillRect(cx - rr, mid - rr, 3, rr * 2)
      ctx.fillRect(cx + rr - 3, mid - rr, 3, rr * 2)
    }
  }
  if (age < FX_TIME - 0.2) drawCheese(ctx, cx, mid - 36 + (age < fall + 0.06 ? 2 : 0), 2)
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
    const deny = [sim.deny0, sim.deny1, sim.deny2, sim.deny3][kind] ?? 0
    const cost = costOf(sim, kind)
    const x = px(at(CARD_XS[kind] ?? CARD_X0) + denyShift(deny))
    const wait = (sim.recharge[kind] ?? 0) / (RECHARGE[kind] ?? 1)
    paintCard(ctx, renderer, x, kind, cost, sim.bones >= cost && wait <= 0, false, sim.time, kind === sim.picked, wait)
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
  picked: boolean,
  wait: number,
): void {
  const y = pyDock(at(CARD_Y)) - (picked ? 3 : 0)
  const w = at(CARD_W)
  const h = at(CARD_H)
  ctx.fillStyle = affordable ? NIGHT_1 : NIGHT
  ctx.fillRect(x, y, w, h)
  const hx = x + ((w - HERO_PX) >> 1)
  const pad = Math.min(8, ((w - HERO_PX) >> 1) - 2)
  ctx.fillStyle = affordable ? NIGHT_2 : NIGHT_1
  ctx.fillRect(hx - pad + 2, y + 4, HERO_PX + pad * 2 - 4, HERO_PX + 2)
  ctx.fillRect(hx - pad, y + 6, HERO_PX + pad * 2, HERO_PX - 2)
  ctx.fillStyle = affordable ? NIGHT_3 : NIGHT_2
  ctx.fillRect(hx - 2, y + HERO_PX + 2, HERO_PX + 4, 2)
  const phase = Math.floor(time * 8) & 3
  const border = hint ? (GOLD_CYCLE[phase] ?? GOLD_LIGHT) : affordable ? GOLD : NIGHT_2
  const inner = hint ? (GOLD_CYCLE[(phase + 2) & 3] ?? GOLD) : affordable ? GOLD_DARK : NIGHT_1
  frameRect(ctx, x, y, w, h, picked ? GOLD_HOT : border)
  frameRect(ctx, x + 1, y + 1, w - 2, h - 2, picked ? GOLD_LIGHT : inner)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 1, 1)
  ctx.fillRect(x + w - 1, y, 1, 1)
  ctx.fillRect(x, y + h - 1, 1, 1)
  ctx.fillRect(x + w - 1, y + h - 1, 1, 1)
  const blink = (Math.floor(time * 2) & 1) === 1
  const col = heroCell(kind, blink ? 'blink' : 'open')
  const hop = affordable ? (HOP[Math.floor(time * 8) & 7] ?? 0) >> 1 : 0
  ctx.drawImage(renderer.sheets.hero, col * HERO_PX, 0, HERO_PX, HERO_PX, hx, y + 3 - hop, HERO_PX, HERO_PX)
  if (wait > 0) {
    // Recharge shutter: night drops over the portrait and slides away as the card gets ready.
    const top = y + 3
    const tall = HERO_PX + 2
    const cover = Math.ceil(tall * Math.min(1, wait))
    ctx.fillStyle = NIGHT
    ctx.fillRect(x + 2, top, w - 4, cover)
    ctx.fillStyle = NIGHT_3
    ctx.fillRect(x + 2, top + cover - 1, w - 4, 1)
  }
  if (kind === KIND_SESAME) drawHeart(ctx, x + w - 10, y + 3)
  ctx.drawImage(renderer.sheets.bone, x + 1, y + h - 17)
  drawNumber(ctx, renderer, cost | 0, x + 13, y + h - 15, false)
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

/** Where a field tap sends the picked card: one up-arrow per path, above the 柴の家. Static, like the meadow. */
function laneArrowY(renderer: Renderer): number {
  return py(at(FIELD_Y + FIELD_H)) - renderer.sheets.home.height - 22
}

function paintLaneArrows(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  const y = laneArrowY(renderer)
  let x = px(at(FIELD_X))
  for (let lane = 0; lane < LANE_PX.length; lane++) {
    const cx = x + ((LANE_PX[lane] ?? 0) >> 1)
    ctx.fillStyle = LINE
    for (let r = 0; r < 4; r++) ctx.fillRect(cx - r - 1, y + r, r * 2 + 3, 2)
    ctx.fillStyle = GOLD_LIGHT
    for (let r = 0; r < 3; r++) ctx.fillRect(cx - r, y + r + 1, r * 2 + 1, 1)
    x += LANE_PX[lane] ?? 0
  }
}

/** Tutorial pointer: points at a path, since a field tap is what sends a shiba. */
function paintPaw(ctx: CanvasRenderingContext2D, renderer: Renderer, time: number): void {
  const bob = BOB[Math.floor(time * 6) & 7] ?? 0
  const x = px(at(FIELD_X)) + (LANE_PX[0] ?? 0) + ((LANE_PX[1] ?? 0) >> 1) - (pawArt.w >> 1)
  const y = laneArrowY(renderer) - pawArt.h - 2 + bob
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

/** Between matches: what the match paid, the purse, a row per coat to buy a level, and START. */
function paintShop(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, frame.internalW, frame.internalH)
  const won = sim.outcome === 'won'
  const word = won ? CLEAR_WORD : LOSE_WORD
  const wx = (frame.internalW - word.length * 18) >> 1
  for (let i = 0; i < word.length; i++) drawLetter(ctx, word[i] ?? '', wx + i * 18, py(28), 2, won ? GOLD_LIGHT : DANGER)
  const earnedDigits = digitCount(sim.earned)
  const ex = (frame.internalW - (22 + earnedDigits * 10)) >> 1
  ctx.drawImage(renderer.sheets.bone, ex, py(62) + 1)
  drawLetter(ctx, '+', ex + 13, py(62), 1, GOLD_LIGHT)
  drawNumber(ctx, renderer, sim.earned, ex + 22, py(62), false)
  const purseDigits = digitCount(sim.purse)
  const pxl = (frame.internalW - (14 + purseDigits * 14)) >> 1
  ctx.drawImage(renderer.sheets.bone, pxl, py(84) + 3)
  drawNumber(ctx, renderer, sim.purse, pxl + 14, py(84), true)
  for (let kind = 0; kind < sim.levels.length; kind++) {
    const level = sim.levels[kind] ?? 1
    const maxed = level >= MAX_LEVEL
    const cost = levelCost(level)
    const can = !maxed && sim.purse >= cost
    const x = px(at(SHOP_ROW_X))
    const y = py(at(SHOP_ROW_Y0 + kind * (SHOP_ROW_H + SHOP_ROW_GAP)))
    const w = at(SHOP_ROW_W)
    const h = at(SHOP_ROW_H)
    ctx.fillStyle = can ? NIGHT_2 : NIGHT_1
    ctx.fillRect(x, y, w, h)
    frameRect(ctx, x, y, w, h, can ? GOLD : NIGHT_3)
    frameRect(ctx, x + 1, y + 1, w - 2, h - 2, can ? GOLD_DARK : NIGHT_2)
    const blink = can && (Math.floor(sim.time * 2 + kind) & 1) === 1
    ctx.drawImage(renderer.sheets.hero, heroCell(kind, blink ? 'blink' : 'open') * HERO_PX, 0, HERO_PX, HERO_PX, x + 6, y + ((h - HERO_PX) >> 1), HERO_PX, HERO_PX)
    if (kind === KIND_SESAME) drawHeart(ctx, x + 32, y + 6)
    const lx = x + 46
    const ly = y + ((h - 10) >> 1)
    drawLetter(ctx, LEVEL_WORD[0] ?? '', lx, ly, 1, WHITE)
    drawLetter(ctx, LEVEL_WORD[1] ?? '', lx + 9, ly, 1, WHITE)
    drawNumber(ctx, renderer, level, lx + 20, ly, false)
    if (maxed) {
      ctx.fillStyle = GOLD_CYCLE[Math.floor(sim.time * 8) & 3] ?? GOLD
      ctx.fillRect(x + w - 22, ly + 2, 10, 6)
      ctx.fillRect(x + w - 19, ly - 1, 4, 12)
      continue
    }
    const cx = x + w - 10 - digitCount(cost) * 10
    ctx.drawImage(renderer.sheets.bone, cx - 14, ly + 1)
    drawNumber(ctx, renderer, cost, cx, ly, false)
    const lock = can ? 0 : 1
    if (lock) {
      ctx.fillStyle = NIGHT
      for (let k = 0; k < 3; k++) ctx.fillRect(cx - 14 + k * 12, ly + 12, 6, 1)
    }
  }
  const bx = px(at(START_X))
  const by = py(at(START_Y))
  const bw = at(START_W)
  const bh = at(START_H)
  const bob = BOB[Math.floor(sim.time * 4) & 7] ?? 0
  ctx.fillStyle = GOLD
  ctx.fillRect(bx, by - (bob >> 1), bw, bh)
  frameRect(ctx, bx, by - (bob >> 1), bw, bh, LINE)
  frameRect(ctx, bx + 1, by - (bob >> 1) + 1, bw - 2, bh - 2, GOLD_LIGHT)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(bx + 2, by - (bob >> 1) + bh - 4, bw - 4, 2)
  const sw = START_WORD.length * 18 - 2
  const sx = bx + ((bw - sw) >> 1)
  const sy = by - (bob >> 1) + ((bh - 20) >> 1)
  for (let i = 0; i < START_WORD.length; i++) drawLetter(ctx, START_WORD[i] ?? '', sx + i * 18, sy, 2, WHITE)
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
