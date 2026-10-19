import { FUR_BLACK, FUR_BUCHI, FUR_CREAM, FUR_GRAY, FUR_KINAKO, FUR_RED, FUR_SESAME, HERO_REWARD, heroCell, pawArt } from './art'
import {
  ATTACK_RANGE,
  BONE_X,
  BONE_Y,
  CARD_H,
  CARD_W,
  CARD_X0,
  CARD_Y,
  BARK_SPLASH,
  BREED_BOSS,
  BREED_BULLDOG,
  BREED_CHIHUAHUA,
  BREED_CORGI,
  BREED_GOLDEN,
  BREED_POODLE,
  BREED_POM,
  POM_RADIUS,
  FREE_WAVE_SLOW,
  CALL_BONE,
  CALL_H,
  CALL_W,
  CALL_X,
  CALL_Y,
  WAVE_EVERY,
  WAVE_MIXED,
  WAVE_PINCER,
  WAVE_SWARM,
  WAVE_WALL,
  HOME_HP,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  HUD_DROP,
  FREE_ZONE_Y,
  COAT_UNLOCK,
  HEAL_RADIUS,
  BANNER_HOLD,
  FLOAT_TIME,
  KIND_BLACK,
  KIND_TAN,
  KIND_BIG,
  KIND_CHEER,
  CHEER_RADIUS,
  HERO_SLOT,
  HERO_ENABLED,
  BOSS_DARK_FROM,
  CANNON_CHARGE,
  CANNON_ENABLED,
  CANNON_REACH,
  HERO_SKILL_R,
  HERO_SKILL_CD,
  BOSS_HOWL_R,
  KIND_DISC,
  KIND_SESAME,
  KIND_WHITE,
  BIG_RADIUS,
  SKILL_NAMES,
  BALL_RADIUS,
  LICK_RADIUS,
  STOMP_RADIUS,
  FLAG_RADIUS,
  BOOM_TIME,
  BONE_WALL_W,
  BONE_WALL_T,
  KINDS,
  RECALL_HOLD,
  CARD_XS,
  RECHARGE,
  MAX_LEVEL,
  LEVEL_STEP,
  PERK_A,
  PERK_B,
  STAGES,
  SHOP_CELL_H,
  SHOP_CELL_W,
  SHOP_GAP,
  SHOP_PICK_W,
  SHOP_X0,
  SHOP_Y0,
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
  gridX,
} from './balance'
import { drawJP, flushPlain, jpWidth, plainWidth, queuePlain } from './jp'
import { finish as hdFinish, flash as hdFlash } from './hd'
import { BANNER_POP, BANNER_REST, CLEAR_WORD, glyphBit, LEVEL_WORD, letterBit, LOSE_WORD, START_WORD, POP_COL, POP_ROW, RUMBLE_WORD, SELECT_WORD, STAGE_WORD, TAP_WORD, NEW_WORD, PAUSE_WORD } from './font'
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
import { canCall, costOf, deckReady, deckSize, feedCost, isEndless, mvpOf, xpNeed, stageOpen, coatOpen, spec, dogsLeft, levelCost, skillReady, casterOf, isOut, boomPoint, waveAhead, type Cast, type Outcome, type Sim, type Unit } from './sim'
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
  shibaX: Float32Array
  shibaCd: Float32Array
  shibaAct: Float64Array
  catFly: Uint8Array
  catSeen: Uint8Array
  catY: Float32Array
  catX: Float32Array
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
  /** Last skill cast whose bursts were spawned. */
  castSeen: number
  /** Sound is off; the speaker button shows a cross. */
  muted: boolean
  /** 2× speed is on (drawn on the dock's speed button). */
  fast: boolean
  /** The pause menu is up. */
  paused: boolean
  /** The 2D-HD finishing pass (light, bloom, depth of field) is on. */
  hd: boolean
  /** The 宝箱 state last drawn, and when (wall clock) it was seen opening. */
  chestState: number
  /** The coat the result screen's info strip is about (-1: pick one). */
  infoKind: number
  /** Title screen level reset: when (performance.now) the button was armed, and when a reset happened. */
  resetArmedAt: number
  resetDoneAt: number
  chestOpenAt: number
  /** Sim clock at the last draw; a drop means a new match began. */
  lastTime: number
  /** The wave warning on screen (free placement): the wave it is about, kept a moment after the wave lands. */
  warn: { at: number; kind: number; side: number; boss: boolean } | null
  /** A press held on one of our shibas (field px) and when it began (performance.now); a full ring means recall. */
  press: { x: number; y: number; start: number } | null
  /** The title's settings panel is open. */
  settings: boolean
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

/** The rightmost design-space x that is on screen: narrow phones (internal width under INTERNAL_W) crop both sides, so corner buttons hug this instead of INTERNAL_W. */
function rightEdge(): number {
  return Math.min(INTERNAL_W, frame.internalW - frame.shiftX)
}

function px(designX: number): number {
  return designX + frame.shiftX
}

function py(designY: number): number {
  return designY + frame.topDy
}

/** A field point's screen row. On a short screen (the dock rides up over the field) the field is squeezed so its floor, the 柴の家 and every dog at the door stay above the dock; sprites keep their size, only their spots close up. */
function fpy(worldY: number): number {
  let y = at(FIELD_Y + worldY)
  if (frame.dockDy < 0) {
    const top = at(FIELD_Y)
    const span = at(FIELD_H)
    y = top + Math.round(((y - top) * (span + frame.dockDy)) / span)
  }
  return py(y)
}

function pyDock(designY: number): number {
  return designY + frame.topDy + frame.dockDy
}

export function screenToWorld(
  clientX: number,
  clientY: number,
  rectLeft: number,
  rectTop: number,
  /** The result screen is laid out from the top with no dock, so it maps straight. */
  flat = false,
): { x: number; y: number } {
  const ix = Math.round((clientX - rectLeft - frame.ox) / frame.scale) - frame.shiftX
  const iyRaw = Math.round((clientY - rectTop - frame.oy) / frame.scale) - frame.topDy
  if (flat) return { x: ix * 2, y: iyRaw * 2 }
  const panel = at(PANEL_Y) + frame.dockDy
  let iy = iyRaw >= panel ? iyRaw - frame.dockDy : iyRaw
  if (frame.dockDy < 0 && iyRaw < panel) {
    const top = at(FIELD_Y)
    const span = at(FIELD_H)
    iy = top + Math.round(((iyRaw - top) * span) / (span + frame.dockDy))
  }
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
    shibaX: new Float32Array(MAX_SHIBAS),
    shibaCd: new Float32Array(MAX_SHIBAS),
    shibaAct: new Float64Array(MAX_SHIBAS).fill(-9),
    catFly: new Uint8Array(MAX_CATS),
    catSeen: new Uint8Array(MAX_CATS),
    catY: new Float32Array(MAX_CATS),
    catX: new Float32Array(MAX_CATS),
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
    castSeen: 0,
    lastTime: 0,
    warn: null,
    press: null,
    settings: false,
    muted: false,
    fast: false,
    paused: false,
    hd: true,
    chestState: 0,
    infoKind: -1,
    resetArmedAt: -1e9,
    resetDoneAt: -1e9,
    chestOpenAt: -9,
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
  // A new match restarts the clock, so every effect stamped with the old clock must go.
  if (sim.time < renderer.lastTime - 0.01) forgetEffects(renderer)
  renderer.lastTime = sim.time

  let sx = 0
  let sy = 0
  if (sim.time < renderer.shakeUntil) {
    const step = Math.floor(sim.time * 24) & 7
    sx = SHAKE_X[step] ?? 0
    sy = SHAKE_Y[step] ?? 0
  }

  g.fillStyle = NIGHT
  g.fillRect(0, 0, frame.internalW, frame.internalH)
  if (sim.title) {
    paintTitle(g, renderer, sim)
    presentView(ctx, renderer, dpr, sim)
    return
  }
  g.save()
  g.translate(sx, sy)
  paintBackdrop(g, sim)
  paintCastle(g, renderer, sim)
  g.save()
  g.beginPath()
  g.rect(px(at(FIELD_X)), py(at(FIELD_Y)), at(FIELD_W), at(FIELD_H) + frame.dockDy)
  g.clip()
  paintHome(g, renderer)
  paintRocks(g, sim)
  paintWalls(g, sim)
  if (sim.free) paintFlags(g, sim)
  paintUnits(g, renderer, sim)
  if (sim.free) paintRoles(g, sim)
  if (sim.free) paintAttacks(g, sim)
  paintBiteSparks(g, sim)
  if (sim.free) paintBreaches(g, sim)
  paintHpBars(g, sim)
  paintBossBar(g, sim)
  paintHomeBar(g, renderer, sim)
  if (sim.outcome === 'play') {
    if (sim.free) paintFreeZone(g)
    else paintLaneArrows(g, renderer)
  }
  paintPress(g, renderer)
  paintGhosts(g, renderer, sim)
  paintBooms(g, renderer, sim)
  if (sim.free) paintCasts(g, renderer, sim)
  paintAir(g, sim)
  g.restore()
  paintSpecialField(g, renderer, sim)
  paintCall(g, renderer, sim)
  paintWaveWarn(g, renderer, sim)
  paintIntro(g, renderer, sim)
  paintStageBanner(g, renderer, sim)
  paintDamage(g, renderer, sim)
  paintCutIn(g, renderer, sim)
  g.restore()
  paintDock(g, renderer, sim)
  if (sim.outcome !== 'play' && sim.rewardT <= 0) paintShop(g, renderer, sim)
  else if (sim.outcome === 'won' || sim.outcome === 'lost') paintBanner(g, sim)
  else if (sim.tutorial) paintPaw(g, renderer, sim.time, sim.free)
  if (renderer.paused && sim.outcome === 'play') paintPause(g, renderer)

  presentView(ctx, renderer, dpr, sim)
}

/** The title logo. */
const TITLE_JP = 'しば大行進'
const TITLE_TILE_W = 32
const TITLE_TILE_H = 46
const TITLE_TILE_GAP = 4
const TITLE_ROW = 4
/** Height of the result screen's info strip (coat name, level, what levelling does). */
const SHOP_INFO_H = 38
const SHOP_INFO_SHORT = 27
/** Stage tiles plus one for エンドレス. */
const TITLE_TILES = STAGES.length + 1

/** The title's rows, from the top: logo, the deck's faces, the 柴の家, and where the stage tiles start. Short screens (375×667 with browser bars) pull the top rows up and tighten them so SELECT never sits on the house. */
function titleLayout(): { logo: number; faces: number; home: number; tiles: number; short: boolean } {
  const rows = Math.ceil(TITLE_TILES / TITLE_ROW)
  const tilesH = rows * TITLE_TILE_H + (rows - 1) * 6
  const room = frame.internalH - frame.topDy
  const short = room < 380
  const tiles = short ? Math.max(150, room - tilesH - 6) : Math.max(206, room - tilesH - 52)
  return short ? { logo: 24, faces: 60, home: 98, tiles, short } : { logo: 28, faces: 84, home: 126, tiles, short }
}

/** Internal-px box of a stage tile on the title screen, from the top of the screen. */
function titleTile(stage: number): { x: number; y: number } {
  // Up to TITLE_ROW tiles per row; later stages wrap to a second row.
  const row = Math.floor(stage / TITLE_ROW)
  const col = stage % TITLE_ROW
  const inRow = Math.min(TITLE_ROW, TITLE_TILES - row * TITLE_ROW)
  const total = inRow * TITLE_TILE_W + (inRow - 1) * TITLE_TILE_GAP
  const base = titleLayout().tiles
  return { x: ((frame.internalW - total) >> 1) + col * (TITLE_TILE_W + TITLE_TILE_GAP), y: base + row * (TITLE_TILE_H + 6) }
}

/** The title's settings panel (opened by the gear, top right): sound on/off and the level reset. Design px. */
const MENU_W = 140
const MENU_H = 112
const MENU_BTN_W = 116
const MENU_BTN_H = 22
const RESET_W = MENU_BTN_W
const RESET_H = MENU_BTN_H

function menuRect(): { x: number; y: number; sound: number; reset: number; close: number } {
  const x = (INTERNAL_W - MENU_W) >> 1
  const y = Math.max(40, Math.min(78, (frame.internalH - frame.topDy - MENU_H) >> 1))
  return { x, y, sound: y + 24, reset: y + 52, close: y + 84 }
}

/** What a tap on the title's settings picks (flat world point): the gear, and with the panel open its buttons, 'inside' (the panel's blank parts) or 'none' (outside it). */
export function titleMenuTarget(x: number, y: number, open: boolean): 'gear' | 'sound' | 'reset' | 'close' | 'inside' | 'none' {
  const ix = x / 2
  const iy = y / 2
  if (ix >= rightEdge() - 24 && ix <= rightEdge() + 2 && iy <= 26) return 'gear'
  if (!open) return 'none'
  const m = menuRect()
  const bx = (INTERNAL_W - MENU_BTN_W) >> 1
  const inBtn = (top: number): boolean => ix >= bx - 2 && ix <= bx + MENU_BTN_W + 2 && iy >= top - 2 && iy <= top + MENU_BTN_H + 2
  if (inBtn(m.sound)) return 'sound'
  if (inBtn(m.reset)) return 'reset'
  if (iy >= m.close - 2 && iy <= m.close + 20 && ix >= m.x && ix <= m.x + MENU_W) return 'close'
  if (ix >= m.x && ix <= m.x + MENU_W && iy >= m.y && iy <= m.y + MENU_H) return 'inside'
  return 'none'
}

/** The gear on the title, where the speaker sits on other screens: a 20×18 night tile with a sealed white cog, gold while the panel is open. */
function paintGear(ctx: CanvasRenderingContext2D, open: boolean, y: number): void {
  const x = px(rightEdge() - 22)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 20, 18)
  ctx.fillStyle = open ? GOLD_DARK : NIGHT_2
  ctx.fillRect(x + 1, y + 1, 18, 16)
  const rows = ['....##....', '.#.####.#.', '.########.', '..##..##..', '###....###', '###....###', '..##..##..', '.########.', '.#.####.#.', '....##....']
  const ox = x + 5
  const oy = y + 4
  ctx.fillStyle = LINE
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? ''
    for (let c = 0; c < row.length; c++) if (row[c] === '#') ctx.fillRect(ox + c - 1, oy + r - 1, 3, 3)
  }
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? ''
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue
      ctx.fillStyle = r < 5 && c < 5 ? WHITE : WHITE_MID
      ctx.fillRect(ox + c, oy + r, 1, 1)
    }
  }
}

/** The settings panel over a dimmed title: せってい, a sound toggle, レベルリセット (two taps), and とじる. */
function paintMenu(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  ctx.fillStyle = dither(ctx, NIGHT, 2) ?? NIGHT
  ctx.fillRect(0, 0, frame.internalW, frame.internalH)
  const m = menuRect()
  const x = px(m.x)
  const y = py(m.y)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, MENU_W, MENU_H)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(x + 1, y + 1, MENU_W - 2, MENU_H - 2)
  frameRect(ctx, x + 2, y + 2, MENU_W - 4, MENU_H - 4, GOLD_DARK)
  queuePlain('せってい', frame.internalW >> 1, y + 7, 10, GOLD_LIGHT, 'center', true, LINE)
  // Sound: the same speaker as the dock's, and the word for its state.
  const bx = px((INTERNAL_W - MENU_BTN_W) >> 1)
  const sy = py(m.sound)
  ctx.fillStyle = LINE
  ctx.fillRect(bx, sy, MENU_BTN_W, MENU_BTN_H)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(bx + 1, sy + 1, MENU_BTN_W - 2, MENU_BTN_H - 2)
  drawSpeaker(ctx, renderer.muted, bx + 6, sy + 2)
  queuePlain(renderer.muted ? 'サウンド オフ' : 'サウンド オン', bx + 32, sy + 5, 10, renderer.muted ? WHITE_MID : WHITE, 'left', true, LINE)
  paintReset(ctx, renderer)
  queuePlain('とじる', frame.internalW >> 1, py(m.close) + 4, 9, WHITE_MID, 'center', true, LINE)
}

/** レベルリセット: dim until tapped, then red and asking for a second tap; a short "リセットした!" after. */
function paintReset(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  const m = menuRect()
  const r = { x: (INTERNAL_W - RESET_W) >> 1, y: m.reset }
  const now = performance.now()
  const armed = now - renderer.resetArmedAt < 3000
  const done = now - renderer.resetDoneAt < 1500
  const x = px(r.x)
  const y = py(r.y)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, RESET_W, RESET_H)
  ctx.fillStyle = armed ? DANGER_DARK : NIGHT_2
  ctx.fillRect(x + 1, y + 1, RESET_W - 2, RESET_H - 2)
  const text = done ? 'リセットした!' : armed ? 'もう一回タップ' : 'レベルリセット'
  queuePlain(text, frame.internalW >> 1, y + 5, 10, armed ? WHITE : done ? GOLD_LIGHT : DANGER_LIGHT, 'center', true, LINE)
}

/** What a tap on the title screen picks: a stage tile, or -1. `x`, `y` are flat world points. */
export function titleTarget(x: number, y: number): number {
  const ix = x / 2
  const iy = y / 2
  for (let stage = 0; stage < TITLE_TILES; stage++) {
    const t = titleTile(stage)
    if (ix >= t.x - 2 && ix <= t.x + TITLE_TILE_W + 2 && iy >= t.y - 2 && iy <= t.y + TITLE_TILE_H + 2) return stage
  }
  return -1
}

/** Title: the logo over the meadow, the deck's faces hopping, and one tile per stage with its best stars. */
function paintTitle(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const w = frame.internalW
  const clock = performance.now() / 1000
  ctx.fillStyle = SKY
  ctx.fillRect(0, 0, w, frame.internalH)
  ctx.fillStyle = SKY_LIGHT
  ctx.fillRect(0, py(60), w, 2)
  ctx.fillStyle = MEADOW_HOT
  ctx.fillRect(0, py(62), w, 2)
  ctx.fillStyle = MEADOW
  ctx.fillRect(0, py(64), w, frame.internalH)
  paintLanes(ctx, 0, py(64), w, frame.internalH, 24, w)
  const lay = titleLayout()
  // Logo: しば大行進 in gold, palette-snapped, over a dark drop shadow; it bobs gently.
  const bob = BOB[Math.floor(clock * 4) & 7] ?? 0
  const size = lay.short ? 28 : 32
  const lw = jpWidth(TITLE_JP, size)
  const lx = (w - lw) >> 1
  drawJP(ctx, TITLE_JP, lx + 2, py(lay.logo) + 3, size, GOLD_DARK)
  drawJP(ctx, TITLE_JP, lx, py(lay.logo) - (bob >> 1), size, GOLD_LIGHT)
  // The deck's faces, hopping in turn.
  const faces = sim.deck.length > 0 ? sim.deck : [0, 1, 2, 3]
  const fw = faces.length * (HERO_PX + 6) - 6
  for (let i = 0; i < faces.length; i++) {
    const hop = (HOP[(Math.floor(clock * 8) + i * 2) & 7] ?? 0) >> 1
    const hx = ((w - fw) >> 1) + i * (HERO_PX + 6)
    const blink = ((Math.floor(clock * 2) + i) & 3) === 0
    ctx.fillStyle = LINE
    ctx.fillRect(hx - 2, py(lay.faces) - 2, HERO_PX + 4, HERO_PX + 4)
    ctx.fillStyle = NIGHT_2
    ctx.fillRect(hx - 1, py(lay.faces) - 1, HERO_PX + 2, HERO_PX + 2)
    ctx.drawImage(renderer.sheets.hero, heroCell(faces[i] ?? 0, blink ? 'blink' : 'open') * HERO_PX, 0, HERO_PX, HERO_PX, hx, py(lay.faces) - hop, HERO_PX, HERO_PX)
  }
  // The 柴の家 with a column of rival dogs marching past it, and the guards waiting below.
  const home = renderer.sheets.home
  ctx.drawImage(home, (w - home.width) >> 1, py(lay.home))
  const lineY = py(lay.home) + home.height + (lay.short ? -2 : 8)
  const span = w + CAT_PX * 2
  for (let i = 0; i < 6; i++) {
    const dx = Math.floor((((clock * 18 + i * (span / 6)) % span) + span) % span) - CAT_PX
    blitCat(ctx, renderer, i % 5, 'walk', clock, i, 0, false, dx, lineY + ((i * 7) % 12))
  }
  // The guards stand two a side of the house, so nothing sits under SELECT.
  for (let i = 0; i < Math.min(4, faces.length); i++) {
    const side = (i & 1) === 0 ? -1 : 1
    const k = i >> 1
    const dx = (w >> 1) + side * ((home.width >> 1) + 4 + k * (CROWD_PX + 4)) - (side < 0 ? CROWD_PX : 0)
    blitCrowd(ctx, renderer, furOf(faces[i] ?? 0), 'idle', clock, i, 0, false, dx, py(lay.home) + home.height - CROWD_PX)
  }
  // Stars collected so far, top left, out of three per stage (the dim number).
  {
    const got = sim.best.reduce((n, b) => n + b, 0)
    const all = STAGES.length * 3
    const sy0 = py(6)
    ctx.fillStyle = LINE
    ctx.fillRect(4, sy0 - 2, 22 + (digitCount(got) + digitCount(all)) * 10 + 8, 16)
    ctx.fillStyle = NIGHT_1
    ctx.fillRect(5, sy0 - 1, 20 + (digitCount(got) + digitCount(all)) * 10 + 8, 14)
    drawMiniStar(ctx, 8, sy0 + 2, true)
    drawNumber(ctx, renderer, got, 20, sy0, false)
    const ax = 20 + digitCount(got) * 10 + 4
    ctx.fillStyle = NIGHT_3
    ctx.fillRect(ax, sy0 + 9, 3, 1)
    drawNumber(ctx, renderer, all, ax + 4, sy0, false)
  }
  // SELECT and the stage tiles.
  const sx = (w - SELECT_WORD.length * 10) >> 1
  const ty = py(titleTile(0).y)
  for (let i = 0; i < SELECT_WORD.length; i++) drawLetter(ctx, SELECT_WORD[i] ?? '', sx + i * 10, ty - 18, 1, WHITE)
  for (let stage = 0; stage < TITLE_TILES; stage++) {
    const t = titleTile(stage)
    const open = stageOpen(sim, stage)
    const endless = stage === STAGES.length
    const next = open && !endless && (sim.best[stage] ?? 0) === 0
    const x = t.x
    const y = py(t.y)
    ctx.fillStyle = LINE
    ctx.fillRect(x, y, TITLE_TILE_W, TITLE_TILE_H)
    ctx.fillStyle = open ? NIGHT_2 : NIGHT_1
    ctx.fillRect(x + 1, y + 1, TITLE_TILE_W - 2, TITLE_TILE_H - 2)
    frameRect(ctx, x + 1, y + 1, TITLE_TILE_W - 2, TITLE_TILE_H - 2, next ? (GOLD_CYCLE[Math.floor(clock * 8) & 3] ?? GOLD) : open ? GOLD_DARK : NIGHT_2)
    if (open && endless) {
      // エンドレス: an infinity sign over the best score.
      drawInfinity(ctx, x + 5, y + 9, endless && open ? (GOLD_CYCLE[Math.floor(clock * 6) & 3] ?? GOLD) : GOLD)
      const b = sim.endlessBest
      drawNumber(ctx, renderer, b, x + ((TITLE_TILE_W - digitCount(b) * 10) >> 1), y + 28, false)
    } else if (open) {
      drawNumber(ctx, renderer, stage + 1, x + 10, y + 7, true)
      for (let k = 0; k < 3; k++) drawMiniStar(ctx, x + 4 + k * 9, y + 32, k < (sim.best[stage] ?? 0))
    } else {
      drawLock(ctx, x + 11, y + 14)
    }
  }
  if (renderer.settings) paintMenu(ctx, renderer)
  paintGear(ctx, renderer.settings, py(4))
}

/** A tap on the speaker: `flat` screens (title, result) put it top right, play puts it at the right end of the dock's top row. */
export function muteTarget(x: number, y: number, flat: boolean): boolean {
  const ix = x / 2
  if (ix < rightEdge() - 24 || ix > rightEdge() + 2) return false
  if (flat) return y / 2 <= 26
  return y >= BONE_Y - 8 && y <= BONE_Y + 26
}

/** Speaker, 16×14, on a night tile: waves when sound is on, a cross when it is off. */
function paintMute(ctx: CanvasRenderingContext2D, renderer: Renderer, y: number): void {
  const x = px(rightEdge() - 22)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 20, 18)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(x + 1, y + 1, 18, 16)
  drawSpeaker(ctx, renderer.muted, x, y)
}

/** The speaker glyph inside a 20×18 tile at x, y: waves when on, a red cross when muted. */
function drawSpeaker(ctx: CanvasRenderingContext2D, muted: boolean, x: number, y: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x + 3, y + 6, 4, 6)
  ctx.fillRect(x + 6, y + 4, 2, 10)
  ctx.fillRect(x + 8, y + 3, 2, 12)
  ctx.fillStyle = WHITE
  ctx.fillRect(x + 4, y + 7, 3, 4)
  ctx.fillRect(x + 7, y + 5, 2, 8)
  if (muted) {
    ctx.fillStyle = DANGER
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(x + 11 + i, y + 5 + i, 2, 2)
      ctx.fillRect(x + 11 + i, y + 11 - i, 2, 2)
    }
  } else {
    ctx.fillStyle = GOLD_LIGHT
    ctx.fillRect(x + 12, y + 7, 2, 4)
    ctx.fillRect(x + 15, y + 5, 2, 8)
  }
}

/** A tap on the pause button, left of 2× in the dock's top row. */
export function pauseButtonTarget(x: number, y: number): boolean {
  const ix = x / 2
  if (ix < rightEdge() - 72 || ix > rightEdge() - 48) return false
  return y >= BONE_Y - 8 && y <= BONE_Y + 26
}

function paintPauseButton(ctx: CanvasRenderingContext2D, y: number): void {
  const x = px(rightEdge() - 70)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 20, 18)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(x + 1, y + 1, 18, 16)
  for (const ox of [5, 11]) {
    ctx.fillStyle = LINE
    ctx.fillRect(x + ox - 1, y + 3, 5, 12)
    ctx.fillStyle = WHITE
    ctx.fillRect(x + ox, y + 4, 3, 10)
  }
}

const PAUSE_PLAY_Y = 150
const PAUSE_HOME_Y = 210
const PAUSE_BTN_W = 70
const PAUSE_BTN_H = 34

/** On the pause menu (flat taps): the kennel gives up and goes home; anything else resumes. */
export function pauseTarget(x: number, y: number): 'home' | 'resume' {
  const ix = x / 2
  const iy = y / 2
  const bx = (INTERNAL_W - PAUSE_BTN_W) >> 1
  if (ix >= bx && ix <= bx + PAUSE_BTN_W && iy >= PAUSE_HOME_Y && iy <= PAUSE_HOME_Y + PAUSE_BTN_H) return 'home'
  return 'resume'
}

/** Pause: the field under a dither of night, PAUSE, a big gold play button, and the kennel to give up. */
function paintPause(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  ctx.fillStyle = dither(ctx, NIGHT, 2) ?? NIGHT
  ctx.fillRect(0, 0, frame.internalW, frame.internalH)
  const ww = PAUSE_WORD.length * 18
  const wx = (frame.internalW - ww) >> 1
  for (let i = 0; i < PAUSE_WORD.length; i++) drawLetter(ctx, PAUSE_WORD[i] ?? '', wx + i * 18, py(96), 2, WHITE)
  const bx = px((INTERNAL_W - PAUSE_BTN_W) >> 1)
  const bob = BOB[Math.floor(renderer.lastTime * 4) & 7] ?? 0
  const by = py(PAUSE_PLAY_Y) - (bob >> 1)
  ctx.fillStyle = LINE
  ctx.fillRect(bx, by, PAUSE_BTN_W, PAUSE_BTN_H)
  ctx.fillStyle = GOLD
  ctx.fillRect(bx + 1, by + 1, PAUSE_BTN_W - 2, PAUSE_BTN_H - 2)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(bx + 1, by + 1, PAUSE_BTN_W - 2, 2)
  // A right-pointing play triangle, 10 wide, outlined.
  const tx = bx + (PAUSE_BTN_W >> 1) - 5
  const cy = by + (PAUSE_BTN_H >> 1)
  for (let i = 0; i < 10; i++) {
    const h = 19 - i * 2
    ctx.fillStyle = LINE
    ctx.fillRect(tx + i - 1, cy - (h >> 1) - 1, 2, h + 2)
  }
  ctx.fillRect(tx + 9, cy - 1, 2, 3)
  for (let i = 0; i < 9; i++) {
    const h = 17 - i * 2
    ctx.fillStyle = WHITE
    ctx.fillRect(tx + i, cy - (h >> 1), 1, h)
  }
  const hx = px((INTERNAL_W - PAUSE_BTN_W) >> 1)
  const hy = py(PAUSE_HOME_Y)
  ctx.fillStyle = LINE
  ctx.fillRect(hx, hy, PAUSE_BTN_W, PAUSE_BTN_H)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(hx + 1, hy + 1, PAUSE_BTN_W - 2, PAUSE_BTN_H - 2)
  paintHomeButton(ctx, hx + (PAUSE_BTN_W >> 1) - 11, hy + 7)
}

/** A tap on the 2× button, left of the speaker in the dock's top row (play only). */
export function speedTarget(x: number, y: number): boolean {
  const ix = x / 2
  if (ix < rightEdge() - 48 || ix > rightEdge() - 24) return false
  return y >= BONE_Y - 8 && y <= BONE_Y + 26
}

/** 2× speed, 20×18 like the speaker: two arrows, gold and blinking-fast when on. */
function paintSpeed(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, y: number): void {
  const x = px(rightEdge() - 46)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 20, 18)
  ctx.fillStyle = renderer.fast ? GOLD_DARK : NIGHT_2
  ctx.fillRect(x + 1, y + 1, 18, 16)
  const fill = renderer.fast ? ((Math.floor(sim.time * 6) & 1) === 0 ? WHITE : GOLD_LIGHT) : WHITE
  for (const ox of [3, 10]) {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = LINE
      ctx.fillRect(x + ox + i, y + 4 + i, 2, 10 - i * 2)
      ctx.fillStyle = fill
      ctx.fillRect(x + ox + i, y + 5 + i, 1, 8 - i * 2)
    }
  }
}

/** The way back to the title: a small kennel on a night tile. */
function paintHomeButton(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, 22, 20)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(x + 1, y + 1, 20, 18)
  ctx.fillStyle = LINE
  for (let r = 0; r < 6; r++) ctx.fillRect(x + 11 - r * 2 - 1, y + 3 + r, r * 4 + 4, 1)
  ctx.fillRect(x + 4, y + 9, 14, 8)
  ctx.fillStyle = FUR_BODY
  for (let r = 0; r < 5; r++) ctx.fillRect(x + 11 - r * 2, y + 4 + r, r * 4 + 1, 1)
  ctx.fillStyle = FUR_LIGHT
  ctx.fillRect(x + 5, y + 10, 12, 6)
  ctx.fillStyle = LINE
  ctx.fillRect(x + 9, y + 11, 4, 5)
}

/** A 7×7 star for the stage tiles. */
function drawMiniStar(ctx: CanvasRenderingContext2D, x: number, y: number, on: boolean): void {
  const rows = ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.']
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? ''
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue
      ctx.fillStyle = on ? (r < 3 ? GOLD_LIGHT : GOLD) : NIGHT_3
      ctx.fillRect(x + c, y + r, 1, 1)
    }
  }
}

/** A 10×12 padlock. */
function drawLock(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x + 1, y, 8, 6)
  ctx.fillRect(x, y + 5, 10, 8)
  ctx.fillStyle = NIGHT_3
  ctx.fillRect(x + 2, y + 1, 6, 5)
  ctx.fillStyle = LINE
  ctx.fillRect(x + 3, y + 2, 4, 4)
  ctx.fillStyle = NIGHT_3
  ctx.fillRect(x + 1, y + 6, 8, 6)
  ctx.fillStyle = LINE
  ctx.fillRect(x + 4, y + 8, 2, 3)
}

/** A 9×9 badge of what each coat uses: claws, a slam ring, a ball, a heart, a frisbee, a paw. */
function drawRoleIcon(ctx: CanvasRenderingContext2D, kind: number, x: number, y: number): void {
  if (kind === KIND_WHITE) {
    drawHeart(ctx, x + 1, y + 1)
    return
  }
  if (kind === KIND_BLACK) {
    fillEllipse(ctx, x + 4, y + 4, 5, 4, LINE)
    fillEllipse(ctx, x + 4, y + 4, 4, 3, GOLD)
    fillEllipse(ctx, x + 4, y + 4, 2, 1, NIGHT_1)
  } else if (kind === KIND_SESAME) {
    fillEllipse(ctx, x + 4, y + 4, 4, 4, LINE)
    fillEllipse(ctx, x + 4, y + 4, 3, 3, WHITE)
    ctx.fillStyle = GOLD
    ctx.fillRect(x + 2, y + 4, 5, 1)
  } else if (kind === KIND_DISC) {
    fillEllipse(ctx, x + 4, y + 4, 5, 3, LINE)
    fillEllipse(ctx, x + 4, y + 4, 4, 2, GOLD)
    fillEllipse(ctx, x + 4, y + 4, 2, 1, WHITE)
  } else if (kind === KIND_CHEER) {
    // A pennant on a pole.
    ctx.fillStyle = LINE
    ctx.fillRect(x + 1, y, 2, 9)
    ctx.fillRect(x + 2, y, 6, 5)
    ctx.fillStyle = WHITE
    ctx.fillRect(x + 1, y + 1, 1, 8)
    ctx.fillStyle = DANGER
    ctx.fillRect(x + 3, y + 1, 4, 3)
    ctx.fillStyle = DANGER_LIGHT
    ctx.fillRect(x + 3, y + 1, 2, 1)
  } else if (kind === KIND_BIG) {
    fillEllipse(ctx, x + 4, y + 6, 4, 3, LINE)
    fillEllipse(ctx, x + 4, y + 6, 3, 2, WHITE_MID)
    for (const ox of [0, 2, 5, 7]) {
      ctx.fillStyle = LINE
      ctx.fillRect(x + ox, y + (ox === 0 || ox === 7 ? 2 : 0), 3, 3)
      ctx.fillStyle = WHITE_MID
      ctx.fillRect(x + ox + 1, y + (ox === 0 || ox === 7 ? 3 : 1), 1, 1)
    }
  } else {
    // 赤: three claw marks.
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = LINE
        ctx.fillRect(x + k * 2 + (i >> 1), y + 1 + i, 3, 2)
      }
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = k === 1 ? WHITE : GOLD_LIGHT
        ctx.fillRect(x + k * 2 + 1 + (i >> 1), y + 1 + i, 1, 1)
      }
    }
  }
}

function presentView(ctx: CanvasRenderingContext2D, renderer: Renderer, dpr: number, sim: Sim): void {
  const destW = frame.internalW * frame.scale
  const destH = frame.internalH * frame.scale
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, frame.cssW, frame.cssH)
  ctx.drawImage(renderer.view, frame.ox, frame.oy, destW, destH)
  if (renderer.hd) presentHd(ctx, renderer, sim, destW, destH)
  // Plain-font text goes on last, above the HD pass, so it stays sharp.
  flushPlain(ctx, frame.ox, frame.oy, frame.scale)
}

function presentHd(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, destW: number, destH: number): void {
  // 2D-HD finish: in play the full pass (depth of field over the sky and kennel, bloom, light, vignette); menus get light and vignette only, so text stays crisp.
  const playing = !sim.title && sim.outcome === 'play' && !renderer.paused
  const light = sim.title ? 'day' : themeOf(sim)
  // No depth-of-field band: the HUD shares the top with the kennel and must stay sharp. Glow and light cover the field only.
  const fieldTop = sim.title ? 0 : py(at(FIELD_Y)) * frame.scale
  const fieldBottom = sim.title ? destH : pyDock(at(PANEL_Y)) * frame.scale
  hdFinish(ctx, renderer.view, frame.ox, frame.oy, destW, destH, light, 0, playing, fieldTop, fieldBottom)
  if (playing) {
    // Every flash (?lanes specials, skills, the cannon) covers the field only, so the HUD and the dock stay crisp.
    const hudBottom = sim.free ? py(at(FIELD_Y + HUD_DROP)) * frame.scale : fieldTop
    const fy = frame.oy + hudBottom
    const fh = fieldBottom - hudBottom
    if (sim.fxT > 0) hdFlash(ctx, frame.ox, fy, destW, fh, FX_TIME - sim.fxT, 0.35, true)
    const last = sim.casts[sim.casts.length - 1]
    if (sim.free && last) hdFlash(ctx, frame.ox, fy, destW, fh, sim.time - last.at, 0.25, true)
    hdFlash(ctx, frame.ox, fy, destW, fh, sim.time - sim.cannonAt, 0.3, false)
  }
}

/** One path's strip of daytime meadow. No stripes and no motion: grass tufts and darker patches stay put. */
function paintLane(ctx: CanvasRenderingContext2D, x: number, laneW: number, lane: number, fy: number, fh: number, rows: number): void {
  if (laneW < 6) return
  for (let row = 0; row < rows; row++) {
    const y = fy + ((row * 12 + lane * 5) % fh)
    const tx = x + 1 + ((row * 13 + lane * 11) % (laneW - 5))
    if (row % 5 === 2) {
      ctx.fillStyle = ground.patch
      ctx.fillRect(tx, y + 1, 6, 2)
      ctx.fillRect(tx + 1, y, 4, 4)
      continue
    }
    ctx.fillStyle = row % 3 === 0 ? ground.hot : ground.tuft
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

/** A dither pattern of one palette colour: every `step`-th pixel on alternating rows, tiled. Cached per colour and step. */
const ditherCache = new Map<string, CanvasPattern | null>()
function dither(ctx: CanvasRenderingContext2D, color: string, step: 2 | 4): CanvasPattern | null {
  const key = `${color}/${step}`
  if (ditherCache.has(key)) return ditherCache.get(key) ?? null
  const tile = document.createElement('canvas')
  tile.width = step
  tile.height = step
  const t = tile.getContext('2d')
  let pattern: CanvasPattern | null = null
  if (t) {
    t.fillStyle = color
    if (step === 2) {
      t.fillRect(0, 0, 1, 1)
      t.fillRect(1, 1, 1, 1)
    } else {
      t.fillRect(0, 0, 1, 1)
      t.fillRect(2, 2, 1, 1)
    }
    pattern = ctx.createPattern(tile, 'repeat')
  }
  ditherCache.set(key, pattern)
  return pattern
}

type Theme = 'day' | 'dusk' | 'night'
/** Stages 1-3 by day, 4-6 at dusk, 7-8 at night. */
function themeOf(sim: Sim): Theme {
  if (!sim.free) return 'day'
  return sim.stage < 3 ? 'day' : sim.stage < 6 ? 'dusk' : 'night'
}

/** Ground by stage pair (play-test round 4: "草原だけじゃなくても"): 草原, 砂浜, 紅葉の森, 雪原, then round again in エンドレス. */
type Biome = 'meadow' | 'beach' | 'autumn' | 'snow'
interface Ground {
  base: string
  patch: string
  tuft: string
  hot: string
  rim: string
}
const GROUND: Record<Biome, Ground> = {
  meadow: { base: MEADOW, patch: MEADOW_DARK, tuft: MEADOW_LIGHT, hot: MEADOW_HOT, rim: MEADOW_HOT },
  beach: { base: FUR_LIGHT, patch: FUR_BODY, tuft: GOLD_HOT, hot: WHITE, rim: WHITE },
  autumn: { base: MEADOW_DARK, patch: FUR_MID, tuft: FUR_BODY, hot: GOLD, rim: GOLD_LIGHT },
  snow: { base: WHITE_MID, patch: WHITE_DARK, tuft: WHITE, hot: SKY_LIGHT, rim: WHITE },
}
function biomeOf(sim: Sim): Biome {
  if (!sim.free) return 'meadow'
  const order: Biome[] = ['meadow', 'meadow', 'beach', 'beach', 'autumn', 'autumn', 'snow', 'snow']
  return order[sim.stage % order.length] ?? 'meadow'
}
let ground: Ground = GROUND.meadow

function paintBackdrop(ctx: CanvasRenderingContext2D, sim: Sim): void {
  const theme = themeOf(sim)
  ground = GROUND[biomeOf(sim)]
  const width = frame.internalW
  const fx = px(at(FIELD_X))
  const fy = py(at(FIELD_Y))
  const fw = at(FIELD_W)
  const fieldExtra = frame.dockDy > 0 ? frame.dockDy : 0
  const fh = at(FIELD_H) + fieldExtra
  if (theme === 'day') {
    ctx.fillStyle = SKY
    ctx.fillRect(0, 0, width, fy)
    ctx.fillStyle = SKY_LIGHT
    ctx.fillRect(0, fy - 6, width, 2)
  } else if (theme === 'dusk') {
    // Sunset bands: pink up top, gold at the horizon.
    ctx.fillStyle = DANGER_LIGHT
    ctx.fillRect(0, 0, width, fy)
    ctx.fillStyle = GOLD_LIGHT
    ctx.fillRect(0, fy >> 1, width, fy - (fy >> 1))
    ctx.fillStyle = GOLD_HOT
    ctx.fillRect(0, fy - 6, width, 2)
  } else {
    ctx.fillStyle = NIGHT_1
    ctx.fillRect(0, 0, width, fy)
    // Fixed stars that twinkle in turn.
    const tw = Math.floor(performance.now() / 400)
    for (let k = 0; k < 14; k++) {
      const sx = (k * 53 + 11) % width
      const sy = (k * 29 + 5) % Math.max(1, fy - 10)
      ctx.fillStyle = (k + tw) % 5 === 0 ? GOLD_LIGHT : WHITE_MID
      ctx.fillRect(sx, sy, 1, 1)
    }
    ctx.fillStyle = NIGHT_3
    ctx.fillRect(0, fy - 6, width, 2)
  }
  if (biomeOf(sim) === 'beach') {
    // The sea along the horizon, with a line of surf.
    ctx.fillStyle = NIGHT_3
    ctx.fillRect(0, fy - 10, width, 8)
    ctx.fillStyle = SKY
    ctx.fillRect(0, fy - 8, width, 4)
    ctx.fillStyle = WHITE
    const t = Math.floor(performance.now() / 300) & 7
    for (let x = -8 + t; x < width; x += 16) ctx.fillRect(x, fy - 4, 6, 1)
  }
  ctx.fillStyle = ground.rim
  ctx.fillRect(0, fy - 2, width, 2)
  const panel = pyDock(at(PANEL_Y))
  const groundH = Math.max(fh, panel - fy)
  ctx.fillStyle = ground.base
  ctx.fillRect(0, fy, width, groundH)
  const rows = fieldExtra > 0 ? Math.ceil(fh / 12) + 2 : 28
  paintLanes(ctx, fx, fy, fw, fh, rows, frame.internalW)
  // Dusk and night lay a sparse dither over the grass; units drawn after stay bright.
  const shade = theme === 'dusk' ? dither(ctx, biomeOf(sim) === 'snow' ? WHITE_DARK : MEADOW_DARK, 4) : theme === 'night' ? (biomeOf(sim) === 'snow' ? dither(ctx, NIGHT_3, 2) : dither(ctx, NIGHT, 2)) : null
  if (shade) {
    ctx.fillStyle = shade
    ctx.fillRect(0, fy, width, groundH)
  }
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
  paintNextWave(ctx, renderer, sim, x - 50, y + 6)
  if (sim.free) {
    // エンドレス shows just ∞ where STAGE n goes (there is no room for both).
    if (isEndless(sim)) drawInfinity(ctx, x + BOSS_W + 14, y + 29, GOLD_LIGHT)
    else for (let i = 0; i < STAGE_WORD.length; i++) drawLetter(ctx, STAGE_WORD[i] ?? '', x + BOSS_W + 1 + i * 10, y + 26, 1, WHITE)
    if (!isEndless(sim)) drawNumber(ctx, renderer, sim.stage + 1, x + BOSS_W + 1 + STAGE_WORD.length * 10 + 3, y + 26, false)
  }
}

/** 波を早く呼ぶ: a gold pill under the wave bar with chevrons and the ホネ the skip would pay. */
/** The first moments of a match: STAGE n (or ∞) drops in big over the field, holds, and fades by sliding up. */
function paintStageBanner(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (!sim.free || sim.outcome !== 'play' || sim.time > 1.8) return
  const t = sim.time
  const drop = t < 0.2 ? Math.round((1 - t / 0.2) * 30) : 0
  const lift = t > 1.5 ? Math.round(((t - 1.5) / 0.3) * 40) : 0
  const endless = isEndless(sim)
  const n = sim.stage + 1
  const total = STAGE_WORD.length * 18 + 10 + (endless ? 22 : digitCount(n) * 12)
  const x = (frame.internalW - total) >> 1
  const y = py(at(FIELD_Y)) + 120 - drop - lift
  ctx.fillStyle = LINE
  ctx.fillRect(0, y - 6, frame.internalW, 32)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(0, y - 5, frame.internalW, 30)
  ctx.fillStyle = GOLD
  ctx.fillRect(0, y - 5, frame.internalW, 1)
  ctx.fillRect(0, y + 24, frame.internalW, 1)
  for (let i = 0; i < STAGE_WORD.length; i++) drawLetter(ctx, STAGE_WORD[i] ?? '', x + i * 18, y, 2, WHITE)
  const nx = x + STAGE_WORD.length * 18 + 10
  if (endless) drawInfinity(ctx, nx, y + 6, GOLD_LIGHT)
  else drawNumber(ctx, renderer, n, nx, y + 3, true)
}

/** A rival breed met for the first time: a card slides in under the HUD with the dog at 2× and a blinking NEW!, then slides away. */
function paintIntro(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const age = sim.time - sim.introAt
  if (sim.introBreed < 0 || age < 0 || age > 2.6) return
  const w = 104
  const h = 50
  const slide = age < 0.25 ? Math.round((1 - age / 0.25) * (w + 10)) : age > 2.3 ? Math.round(((age - 2.3) / 0.3) * (w + 10)) : 0
  const x = ((frame.internalW - w) >> 1) + slide
  const y = py(at(FIELD_Y)) + 34
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  frameRect(ctx, x + 1, y + 1, w - 2, h - 2, DANGER)
  ctx.drawImage(renderer.sheets.cat, 0, sim.introBreed * 4 * CAT_PX, CAT_PX, CAT_PX, x + 6, y + 5, CAT_PX * 2, CAT_PX * 2)
  const c = (Math.floor(sim.time * 8) & 1) === 0 ? DANGER : DANGER_LIGHT
  for (let i = 0; i < NEW_WORD.length; i++) drawLetter(ctx, NEW_WORD[i] ?? '', x + 54 + i * 11, y + 20, 1, c)
}

function paintCall(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (!sim.free || sim.boss || sim.toSend <= 0 || sim.tutorial) return
  const on = canCall(sim)
  const x = CALL_X
  const y = CALL_Y + frame.topDy
  const press = sim.callT > 0 ? 1 : 0
  ctx.fillStyle = LINE
  ctx.fillRect(x, y + press, CALL_W, CALL_H)
  ctx.fillStyle = on ? GOLD : NIGHT_3
  ctx.fillRect(x + 1, y + 1 + press, CALL_W - 2, CALL_H - 2)
  ctx.fillStyle = on ? GOLD_LIGHT : NIGHT_2
  ctx.fillRect(x + 2, y + 2 + press, CALL_W - 4, 2)
  ctx.fillStyle = on ? GOLD_DARK : NIGHT_1
  ctx.fillRect(x + 2, y + CALL_H - 4 + press, CALL_W - 4, 2)
  // Two chevrons that slide while a call is ready.
  const slide = on ? (Math.floor(sim.time * 6) & 3) >> 1 : 0
  for (let k = 0; k < 2; k++) {
    const cx = x + 5 + k * 6 + slide
    ctx.fillStyle = on ? WHITE : NIGHT_2
    for (let r = 0; r < 4; r++) {
      ctx.fillRect(cx + r, y + 4 + r + press, 1, 1)
      ctx.fillRect(cx + r, y + 11 - r + press, 1, 1)
    }
  }
  if (!on) return
  const bonus = Math.round((sim.nextCat - sim.time) * CALL_BONE)
  ctx.drawImage(renderer.sheets.bone, x + 20, y + 3 + press)
  drawLetter(ctx, '+', x + 34, y + 3 + press, 1, WHITE)
  drawNumber(ctx, renderer, bonus, x + 43, y + 3 + press, false)
}

/** How many dogs are still to beat, the boss included: a dog-head icon and pink digits beside the mansion. */
function paintDogsLeft(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, x: number, y: number): void {
  const icon = renderer.sheets.cat
  ctx.drawImage(icon, 4 * CAT_PX, BREED_CORGI * 4 * CAT_PX, CAT_PX, 14, x - 3, y - 2, CAT_PX, 14)
  drawNumber(ctx, renderer, isEndless(sim) ? sim.kills : dogsLeft(sim), x + 22, y + 2, false)
}

/** ∞ as two joined loops, 11×7 cells drawn at 2×, with outline. */
function drawInfinity(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string): void {
  const rows = ['.LLLL.LLLL.', 'LffffLffffL', 'LfLLfLfLLfL', 'LfL.LfL.LfL', 'LfLLfLfLLfL', 'LffffLffffL', '.LLLL.LLLL.']
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? ''
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch === '.') continue
      ctx.fillStyle = ch === 'L' ? LINE : fill
      ctx.fillRect(x + c * 2, y + r * 2 - 2, 2, 2)
    }
  }
}

/** Free placement: the next wave, announced one wave ahead. The breed's head and the dog count, a three-slot strip lit where it comes from, and a bar that runs down to its arrival. */
function paintNextWave(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, x: number, y: number): void {
  if (!sim.free || sim.boss || sim.planKind === WAVE_MIXED || sim.planCount <= 0 || sim.toSend <= 0) return
  const breed = sim.planKind === WAVE_SWARM ? BREED_CHIHUAHUA : sim.planKind === WAVE_WALL ? BREED_BULLDOG : BREED_CORGI
  ctx.drawImage(renderer.sheets.cat, 4 * CAT_PX, breed * 4 * CAT_PX, CAT_PX, 14, x, y - 2, CAT_PX, 14)
  drawNumber(ctx, renderer, Math.min(sim.planCount, sim.toSend), x + 22, y + 2, false)
  // Where it comes from is told by the banner (paintWaveWarn); here only the bar runs down to its arrival.
  const span = Math.max(0.1, sim.free ? WAVE_EVERY * FREE_WAVE_SLOW : WAVE_EVERY)
  const left = Math.max(0, Math.min(1, (sim.nextCat - sim.time) / span))
  ctx.fillStyle = LINE
  ctx.fillRect(x, y + 16, 42, 4)
  ctx.fillStyle = GOLD
  ctx.fillRect(x + 1, y + 17, Math.round(40 * left), 2)
}

/** A press held on one of our shibas: a ring of white dots fills round it, clockwise from the top; when it closes the shiba is recalled. */
function paintPress(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  const p = renderer.press
  if (!p) return
  const f = Math.max(0, Math.min(1, (performance.now() - p.start) / (RECALL_HOLD * 1000)))
  const cx = px(at(FIELD_X + p.x))
  const cy = fpy(p.y) - (CROWD_PX >> 1)
  const n = 16
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2
    const x = cx + Math.round(Math.cos(a) * 14)
    const y = cy + Math.round(Math.sin(a) * 14)
    ctx.fillStyle = LINE
    ctx.fillRect(x - 1, y - 1, 4, 4)
    ctx.fillStyle = k / n < f ? WHITE : NIGHT_2
    ctx.fillRect(x, y, 2, 2)
  }
}

/** Seconds before a wave lands that its warning shows, and how long it stays after. */
const WARN_LEAD = 1.5
const WARN_HOLD = 0.35

/** What the warning says: the wave's name and where it comes from. */
function warnText(w: { kind: number; side: number; boss: boolean }): string {
  if (w.boss) return 'ボスが来る!'
  if (w.kind === WAVE_WALL) return 'ブルドッグの壁 ↓'
  if (w.kind === WAVE_PINCER) return '←コーギーの挟み撃ち→'
  return w.side === 0 ? 'チワワの群れ ←左' : w.side === 1 ? 'チワワの群れ 右→' : 'チワワの群れ ↓中央'
}

/** Free placement: about WARN_LEAD s before a named wave (or the boss) arrives, a banner drops into the HUD band with its name and side, and red arrows blink at the field's top edge where it will walk in. */
function paintWaveWarn(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (!sim.free || sim.outcome !== 'play' || sim.tutorial) {
    renderer.warn = null
    return
  }
  const ahead = waveAhead(sim)
  if (ahead && (ahead.kind !== WAVE_MIXED || ahead.boss) && ahead.at - sim.time <= WARN_LEAD) renderer.warn = ahead
  const w = renderer.warn
  if (!w) return
  const age = sim.time - (w.at - WARN_LEAD)
  if (age < 0 || sim.time > w.at + WARN_HOLD) {
    if (sim.time > w.at + WARN_HOLD) renderer.warn = null
    return
  }
  const text = warnText(w)
  const size = 10
  const tw = plainWidth(text, size, true)
  const bw = tw + 14
  const bh = 16
  const bx = (frame.internalW - bw) >> 1
  // It sits clear below the call button (top left), and its drop-in never rises into it.
  const rest = Math.max(py(at(FIELD_Y + HUD_DROP)) + 6, CALL_Y + frame.topDy + CALL_H + 6)
  const drop = age < 0.12 ? Math.round((1 - age / 0.12) * 4) : 0
  const by = rest - drop
  const blink = (Math.floor(sim.time * 6) & 1) === 0
  ctx.fillStyle = LINE
  ctx.fillRect(bx, by, bw, bh)
  ctx.fillStyle = w.boss ? DANGER_DARK : NIGHT_1
  ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2)
  frameRect(ctx, bx + 1, by + 1, bw - 2, bh - 2, blink ? DANGER : DANGER_LIGHT)
  queuePlain(text, frame.internalW >> 1, by + 3, size, WHITE, 'center', true, LINE)
  // Arrows at the top edge of the field where the wave walks in.
  const left = px(at(FIELD_X)) + 4
  const right = px(at(FIELD_X + FIELD_W)) - 4 - WARN_ARROW_W
  const mid = (frame.internalW - WARN_ARROW_W) >> 1
  const xs = w.boss ? [mid] : w.kind === WAVE_WALL ? [left, mid, right] : w.kind === WAVE_PINCER ? [left, right] : w.side === 0 ? [left] : w.side === 1 ? [right] : [mid]
  const bob = (Math.floor(sim.time * 6) & 1) * 2
  for (const ax of xs) drawWarnArrow(ctx, ax, by + bh + 4 + bob, blink)
}

/** A red down arrow (9×8 cells drawn at 2×), sealed with the line colour. */
const WARN_ARROW = ['..#####..', '..#####..', '..#####..', '#########', '.#######.', '..#####..', '...###...', '....#....'] as const
const WARN_ARROW_W = 20

function drawWarnArrow(ctx: CanvasRenderingContext2D, x: number, y: number, lit: boolean): void {
  ctx.fillStyle = LINE
  for (let r = 0; r < WARN_ARROW.length; r++) {
    const row = WARN_ARROW[r] ?? ''
    for (let c = 0; c < row.length; c++) if (row[c] === '#') ctx.fillRect(x + c * 2, y + r * 2, 4, 4)
  }
  for (let r = 0; r < WARN_ARROW.length; r++) {
    const row = WARN_ARROW[r] ?? ''
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue
      ctx.fillStyle = c === 2 || (r === 3 && c < 4) ? DANGER_LIGHT : lit ? DANGER : DANGER_DARK
      ctx.fillRect(x + c * 2 + 1, y + r * 2 + 1, 2, 2)
    }
  }
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
  // Out of its own full health: later stages give it more than BOSS_HP.
  const fill = Math.max(0, Math.min(w, Math.round((w * boss.hp) / Math.max(1, boss.maxHp))))
  ctx.fillStyle = DANGER
  ctx.fillRect(x, y, fill, 4)
  ctx.fillStyle = DANGER_LIGHT
  ctx.fillRect(x, y, fill, 1)
}

/** 柴の家: centered on the field floor. */
function paintHome(ctx: CanvasRenderingContext2D, renderer: Renderer): void {
  const sprite = renderer.sheets.home
  const x = (frame.internalW - sprite.width) >> 1
  const floor = fpy(FIELD_H)
  const y = floor - sprite.height
  ctx.drawImage(sprite, x, y)
}

/** Drawn over the units so a siege never hides how much home is left. */
function paintHomeBar(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const sprite = renderer.sheets.home
  const x = (frame.internalW - sprite.width) >> 1
  const y = fpy(FIELD_H) - sprite.height
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
  if (!sim.free || !CANNON_ENABLED) return
  // おやつ砲: a sky-blue charge bar over the health bar; when full the house blinks and says TAP!.
  const cy = barY - 6
  const ready = sim.cannonT >= CANNON_CHARGE
  ctx.fillStyle = LINE
  ctx.fillRect(barX - 1, cy - 1, barW + 2, 5)
  ctx.fillStyle = NIGHT_2
  ctx.fillRect(barX, cy, barW, 3)
  const cf = Math.round((barW * sim.cannonT) / CANNON_CHARGE)
  ctx.fillStyle = ready ? ((Math.floor(sim.time * 8) & 1) === 0 ? WHITE : SKY) : SKY
  ctx.fillRect(barX, cy, cf, 3)
  if (ready && sim.outcome === 'play') {
    const bob = (Math.floor(sim.time * 3) & 1) * 2
    for (let i = 0; i < TAP_WORD.length; i++) drawLetter(ctx, TAP_WORD[i] ?? '', barX + 2 + i * 9, cy - 14 - bob, 1, SKY_LIGHT)
  }
  const age = sim.time - sim.cannonAt
  if (age >= 0 && age < 0.6) {
    // The shot: a bright band runs up the field to the cannon's reach, with a trail.
    const floor = fpy(FIELD_H)
    const top = fpy(FIELD_H - CANNON_REACH)
    const yb = Math.round(floor - (floor - top) * Math.min(1, age / 0.35))
    ctx.fillStyle = WHITE
    ctx.fillRect(px(at(FIELD_X)), yb, at(FIELD_W), 3)
    ctx.fillStyle = SKY_LIGHT
    ctx.fillRect(px(at(FIELD_X)), yb + 3, at(FIELD_W), 2)
    ctx.fillStyle = SKY
    for (let k = 0; k < 24; k++) ctx.fillRect(px(at(FIELD_X)) + ((k * 37) % at(FIELD_W)), yb + 6 + ((k * 13) % 20), 2, 2)
  }
}

/** Free placement role cues: a dotted pink ring around every 白 shows who its heal reaches, a ring pulses out when it heals, a green plus floats over each shiba it mended, and 胡麻's bark travels to the dog it hit as gold arcs. */
function paintRoles(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (const unit of sim.shibas) {
    if (!unit?.alive) continue
    const cx = px(at(FIELD_X + unit.x))
    const cy = fpy(unit.y) - (CROWD_PX >> 1)
    if (unit.kind === KIND_WHITE) {
      const r = at(HEAL_RADIUS)
      const age = sim.time - unit.bitAt
      ctx.fillStyle = DANGER_LIGHT
      for (let k = 0; k < 28; k++) {
        const a = (k / 28) * Math.PI * 2
        ctx.fillRect(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r * 0.75), 2, 1)
      }
      if (age >= 0 && age < 0.3) {
        const rr = Math.round(r * (age / 0.3))
        ctx.fillStyle = WHITE
        for (let k = 0; k < 20; k++) {
          const a = (k / 20) * Math.PI * 2
          ctx.fillRect(cx + Math.round(Math.cos(a) * rr), cy + Math.round(Math.sin(a) * rr * 0.75), 2, 2)
        }
      }
    }
    const mend = sim.time - unit.mendAt
    if (mend >= 0 && mend < 0.45) {
      const top = fpy(unit.y) - CROWD_PX - 6 - Math.floor(mend * 20)
      ctx.fillStyle = LINE
      ctx.fillRect(cx - 3, top - 1, 7, 3)
      ctx.fillRect(cx - 1, top - 3, 3, 7)
      ctx.fillStyle = MEADOW_HOT
      ctx.fillRect(cx - 2, top, 5, 1)
      ctx.fillRect(cx, top - 2, 1, 5)
    }
  }
}

/** Clash Royale–style attack readouts at the dog that was hit: 赤 slashes three quick claw marks, 黒 slams a ground ring, 胡麻 lobs a ball that bursts in a splash ring. */
function paintAttacks(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (const unit of sim.shibas) {
    if (!unit?.alive || unit.kind === KIND_WHITE) continue
    const age = sim.time - unit.bitAt
    if (age < 0 || age >= 1) continue
    const tx = px(at(FIELD_X + unit.aimX))
    const ty = fpy(unit.aimY) - (CAT_PX >> 1)
    if (unit.kind === KIND_BLACK) {
      // A heavy slam: a flat ring racing out along the ground, plus a dust puff.
      const t = Math.min(1, age / 0.8)
      const r = 4 + Math.round(t * 20)
      const gy = ty + 6
      ctx.fillStyle = t < 0.5 ? WHITE : GOLD
      for (let k = 0; k < 22; k++) {
        const a = (k / 22) * Math.PI * 2
        ctx.fillRect(tx + Math.round(Math.cos(a) * r), gy + Math.round(Math.sin(a) * r * 0.4), 3, 2)
      }
      if (age < 0.3) {
        ctx.fillStyle = WHITE
        ctx.fillRect(tx - 8, ty - 1, 17, 3)
        ctx.fillRect(tx - 1, ty - 8, 3, 17)
      }
    } else if (unit.kind === KIND_SESAME) {
      const fly = 0.4
      const sx = px(at(FIELD_X + unit.x))
      const sy = fpy(unit.y) - CROWD_PX
      if (age < fly) {
        const f = age / fly
        const bx = Math.round(sx + (tx - sx) * f)
        const by = Math.round(sy + (ty - sy) * f - Math.sin(f * Math.PI) * 14)
        ctx.fillStyle = LINE
        ctx.fillRect(bx - 3, by - 3, 7, 7)
        ctx.fillStyle = WHITE
        ctx.fillRect(bx - 2, by - 2, 5, 5)
        ctx.fillStyle = GOLD
        ctx.fillRect(bx - 1, by, 3, 2)
      } else {
        const t = Math.min(1, (age - fly) / 0.5)
        const r = Math.round(at(BARK_SPLASH) * (0.4 + t * 0.6))
        ctx.fillStyle = t < 0.5 ? WHITE : GOLD_LIGHT
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * Math.PI * 2
          ctx.fillRect(tx + Math.round(Math.cos(a) * r), ty + Math.round(Math.sin(a) * r * 0.75), 2, 2)
        }
      }
    } else if (unit.kind === KIND_DISC) {
      // A frisbee skims out along the line it cuts: a spinning white disc with a gold rim and a dashed trail.
      const fly = 0.5
      if (age < fly) {
        const sx = px(at(FIELD_X + unit.x))
        const sy = fpy(unit.y) - (CROWD_PX >> 1)
        const ex = px(at(FIELD_X + unit.aimX))
        const ey = fpy(unit.aimY) - (CROWD_PX >> 1)
        const f = age / fly
        const bx = Math.round(sx + (ex - sx) * f)
        const by = Math.round(sy + (ey - sy) * f)
        ctx.fillStyle = GOLD_LIGHT
        for (let k = 1; k <= 6; k++) {
          const g = Math.max(0, f - k * 0.06)
          ctx.fillRect(Math.round(sx + (ex - sx) * g), Math.round(sy + (ey - sy) * g), 2, 1)
        }
        const wide = (Math.floor(age * 20) & 1) === 0
        ctx.fillStyle = LINE
        ctx.fillRect(bx - (wide ? 6 : 4), by - 2, wide ? 13 : 9, 5)
        ctx.fillStyle = GOLD
        ctx.fillRect(bx - (wide ? 5 : 3), by - 1, wide ? 11 : 7, 3)
        ctx.fillStyle = WHITE
        ctx.fillRect(bx - (wide ? 3 : 2), by - 1, wide ? 7 : 5, 2)
      }
    } else if (unit.kind === KIND_BIG) {
      // A stomp: dust jumps up and a flat ring runs out from its own paws.
      const t = Math.min(1, age / 0.6)
      const cx = px(at(FIELD_X + unit.x))
      const gy = fpy(unit.y)
      const r = Math.round(at(BIG_RADIUS) * (0.3 + t * 0.7))
      ctx.fillStyle = t < 0.5 ? WHITE : GOLD
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2
        ctx.fillRect(cx + Math.round(Math.cos(a) * r), gy + Math.round(Math.sin(a) * r * 0.45), 3, 2)
      }
      if (age < 0.25) {
        ctx.fillStyle = WHITE_MID
        for (const [ox, oy] of [[-12, -3], [-7, -7], [8, -6], [13, -2]] as const) ctx.fillRect(cx + ox, gy + oy - Math.round(age * 24), 3, 3)
      }
    } else if (age < 0.55) {
      // Three slash marks, one after another.
      const shown = Math.min(3, 1 + Math.floor(age / 0.12))
      for (let k = 0; k < shown; k++) {
        const ox = (k - 1) * 7
        ctx.fillStyle = LINE
        for (let i = 0; i < 15; i++) ctx.fillRect(tx + ox - 7 + i, ty - 8 + i, 4, 4)
        ctx.fillStyle = k === shown - 1 ? WHITE : GOLD_LIGHT
        for (let i = 0; i < 15; i++) ctx.fillRect(tx + ox - 7 + i, ty - 8 + i, 3, 3)
      }
      if (age < 0.12) {
        // The first instant: a white impact star where the claws land.
        ctx.fillStyle = WHITE
        ctx.fillRect(tx - 9, ty - 1, 19, 3)
        ctx.fillRect(tx - 1, ty - 9, 3, 19)
      }
    }
  }
}

/** A bite lunges the biter forward 5px, then eases back over a third of a second. */
function lunge(sim: Sim, bitAt: number): number {
  const age = sim.time - bitAt
  if (age < 0 || age >= 0.3) return 0
  return age < 0.12 ? 5 : 2
}

/** Where a bite lands, a white-and-gold star flashes for a tenth of a second. */
function paintBiteSparks(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive) continue
    const age = sim.time - unit.bitAt
    if (age < 0 || age >= 0.3) continue
    if (sim.free) continue
    drawSpark(ctx, px(at(FIELD_X + unit.x)), fpy(unit.y) - CROWD_PX - 4, age)
  }
  for (let i = 0; i < sim.cats.length; i++) {
    const dog = sim.cats[i]
    if (!dog?.alive || dog.fly === 1) continue
    const age = sim.time - dog.bitAt
    if (age < 0 || age >= 0.3) continue
    // A rival's bite: a red crossed slash at its jaws.
    const bx = px(at(FIELD_X + dog.x))
    const by = fpy(dog.y) + 2
    const r = age < 0.12 ? 6 : 4
    for (let i = -r; i <= r; i++) {
      ctx.fillStyle = LINE
      ctx.fillRect(bx + i - 1, by + i - 1, 3, 3)
      ctx.fillRect(bx + i - 1, by - i - 1, 3, 3)
    }
    for (let i = -r; i <= r; i++) {
      ctx.fillStyle = age < 0.12 ? WHITE : DANGER
      ctx.fillRect(bx + i, by + i, 2, 2)
      ctx.fillRect(bx + i, by - i, 2, 2)
    }
  }
}

/** A dog that breached the 柴の家 is gone: its bite slash stays where it was, and a sealed dust puff bursts out (bigger for ブルドッグ, ゴールデン and the boss). */
const BREACH_TIME = 0.5
function paintBreaches(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (const b of sim.breaches) {
    const age = sim.time - b.at
    if (age < 0 || age >= BREACH_TIME) continue
    const bx = px(at(FIELD_X + b.x))
    const by = fpy(b.y) - (CAT_PX >> 1)
    const t = age / BREACH_TIME
    const n = b.big ? 8 : 6
    const reach = (b.big ? 6 : 4) + Math.round(t * (b.big ? 14 : 9))
    const size = t < 0.6 ? 3 : 2
    const fill = t < 0.3 ? WHITE : t < 0.65 ? WHITE_MID : WHITE_DARK
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.4
      const dx = bx + Math.round(Math.cos(a) * reach)
      const dy = by + Math.round(Math.sin(a) * reach * 0.7) - Math.round(t * 4)
      ctx.fillStyle = LINE
      ctx.fillRect(dx - 1, dy - 1, size + 2, size + 2)
      ctx.fillStyle = fill
      ctx.fillRect(dx, dy, size, size)
    }
    if (age >= 0.3) continue
    // The same red crossed slash a dog's bite shows, where it hit the house.
    const r = age < 0.12 ? 6 : 4
    const sy = fpy(b.y) + 2
    for (let i = -r; i <= r; i++) {
      ctx.fillStyle = LINE
      ctx.fillRect(bx + i - 1, sy + i - 1, 3, 3)
      ctx.fillRect(bx + i - 1, sy - i - 1, 3, 3)
    }
    for (let i = -r; i <= r; i++) {
      ctx.fillStyle = age < 0.12 ? WHITE : DANGER
      ctx.fillRect(bx + i, sy + i, 2, 2)
      ctx.fillRect(bx + i, sy - i, 2, 2)
    }
  }
}

function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, age: number): void {
  const r = age < 0.15 ? 4 : 3
  ctx.fillStyle = GOLD
  ctx.fillRect(x - r, y - 1, r * 2 + 1, 3)
  ctx.fillRect(x - 1, y - r, 3, r * 2 + 1)
  ctx.fillStyle = WHITE
  ctx.fillRect(x - 1, y - 1, 3, 3)
}

/** A small HP bar over every hurt unit, drawn after all units so none hides another's. Gold for shibas, pink for dogs. */
function paintHpBars(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive || unit.hp >= unit.maxHp || unit.maxHp <= 0) continue
    const x = px(at(FIELD_X + unit.x)) - 8
    const y = fpy(unit.y) - CROWD_PX - 4
    drawHpBar(ctx, x, y, unit.hp / unit.maxHp, GOLD_DARK, GOLD, GOLD_LIGHT)
  }
  for (let i = 0; i < sim.cats.length; i++) {
    const dog = sim.cats[i]
    if (!dog?.alive || dog.fly === 1 || dog.hp >= dog.maxHp || dog.maxHp <= 0 || dog.kind === BREED_BOSS) continue
    // Free placement: a plain dog's bar shows only for HP_BAR_HOLD s after its last hit, so a big fight is not a field of pink bars. Elites keep theirs.
    const elite = dog.kind === BREED_GOLDEN || dog.kind === BREED_POM
    const since = sim.time - dog.hurtAt
    if (sim.free && !elite && !(since >= 0 && since < HP_BAR_HOLD)) continue
    const x = px(at(FIELD_X + dog.x)) - 8
    const y = fpy(dog.y) - CAT_PX - 4
    drawHpBar(ctx, x, y, dog.hp / dog.maxHp, DANGER_DARK, DANGER, DANGER_LIGHT)
  }
  // A stunned dog (ボールの雨, ドスン) wears three gold stars circling over its head.
  const beat = Math.floor(sim.time * 8)
  for (let i = 0; i < sim.cats.length; i++) {
    const dog = sim.cats[i]
    if (!dog?.alive || dog.fly === 1 || dog.stun <= 0) continue
    const cx = px(at(FIELD_X + dog.x))
    const cy = fpy(dog.y) - CAT_PX - 16
    for (let k = 0; k < 3; k++) {
      const a = (beat + k * 2) % 6
      const ox = [-6, -3, 3, 6, 3, -3][a] ?? 0
      const oy = [0, -2, -2, 0, 2, 2][a] ?? 0
      ctx.fillStyle = LINE
      ctx.fillRect(cx + ox - 2, cy + oy - 2, 5, 5)
      ctx.fillStyle = k === 0 ? WHITE : GOLD_LIGHT
      ctx.fillRect(cx + ox - 1, cy + oy - 1, 3, 3)
    }
  }
}

/** Seconds a plain dog's HP bar stays up after a hit (free placement). */
const HP_BAR_HOLD = 2

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
  paintHero(ctx, renderer, sim)
  noteDeaths(renderer, sim)
}

let heroSeenX = -1

/** Crown, 11×8 with outline and three spikes; `top` is the tip row. */
function drawCrown(ctx: CanvasRenderingContext2D, cx: number, top: number, fill: string, lit: string): void {
  const rows = ['L....L....L', 'LL..LLL..LL', 'LfL.LfL.LfL', 'LffLLfLLffL', 'LfffffffffL', 'LfgfffffgfL', 'LfffffffffL', 'LLLLLLLLLLL']
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] ?? ''
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      ctx.fillStyle = ch === 'L' ? LINE : ch === 'g' ? DANGER : y === 2 || y === 4 ? lit : fill
      ctx.fillRect(cx - 5 + x, top + y, 1, 1)
    }
  }
}

let heroSeenY = -1

/** ヒーロー柴: a red shiba with a gold crown and a gold ring under it, a spin ring when it swings, a marker where it is headed, and a bar of its own health. While it is down, a countdown tile where it fell. */
function paintHero(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (!sim.free) return
  const h = sim.hero
  if (!sim.heroOn) return
  if (!h.alive) {
    // Down: a grey crown and the seconds left, where it will come back.
    const cx = px(at(FIELD_X + FIELD_W / 2))
    const cy = fpy(FREE_ZONE_Y - 24) - 14
    drawCrown(ctx, cx, cy - 4, NIGHT_2, NIGHT_1)
    drawNumber(ctx, renderer, Math.ceil(sim.heroT), cx - 4, cy + 2, false)
    return
  }
  if (!sim.heroUsed && sim.outcome === 'play' && !sim.title) {
    // First time: TAP! over the field above the strip, bobbing, with an arrow from the hero.
    const tx = px(at(FIELD_X + h.x)) - 16
    const ty = fpy(h.y) - CROWD_PX - 36 - (Math.floor(sim.time * 3) & 1) * 2
    for (let i = 0; i < TAP_WORD.length; i++) drawLetter(ctx, TAP_WORD[i] ?? '', tx + i * 9, ty, 1, GOLD_LIGHT)
    ctx.fillStyle = GOLD_LIGHT
    const ax = px(at(FIELD_X + h.x))
    ctx.fillRect(ax, ty + 12, 1, 8)
    ctx.fillRect(ax - 1, ty + 13, 3, 1)
    ctx.fillRect(ax - 2, ty + 14, 5, 1)
  }
  const go = sim.heroGo
  if (go) {
    const gx = px(at(FIELD_X + go.x))
    const gy = fpy(go.y)
    const blink = (Math.floor(sim.time * 6) & 1) === 0
    ctx.fillStyle = blink ? GOLD_LIGHT : GOLD
    ctx.fillRect(gx - 4, gy - 1, 3, 1)
    ctx.fillRect(gx + 2, gy - 1, 3, 1)
    ctx.fillRect(gx, gy - 4, 1, 3)
    ctx.fillRect(gx, gy + 1, 1, 3)
  }
  const moved = Math.abs(h.x - heroSeenX) > 0.2 || Math.abs(h.y - heroSeenY) > 0.2
  heroSeenX = h.x
  heroSeenY = h.y
  const fighting = sim.time - sim.heroSpinAt < 0.5
  const dx = px(at(FIELD_X + h.x)) - (CROWD_PX >> 1)
  const dy = fpy(h.y) - CROWD_PX
  const cx = dx + (CROWD_PX >> 1)
  ctx.fillStyle = GOLD_DARK
  ctx.fillRect(dx + 1, dy + CROWD_PX - 3, CROWD_PX - 2, 1)
  ctx.fillStyle = (Math.floor(sim.time * 4) & 1) === 0 ? GOLD : GOLD_LIGHT
  ctx.fillRect(dx + 2, dy + CROWD_PX - 2, CROWD_PX - 4, 1)
  ctx.fillStyle = NIGHT
  ctx.fillRect(dx + 3, dy + CROWD_PX - 1, CROWD_PX - 6, 2)
  blitCrowd(ctx, renderer, FUR_RED, poseOf(moved, fighting), sim.time, 0, 0, false, dx, dy)
  drawCrown(ctx, cx, dy - 6, GOLD, GOLD_LIGHT)
  if (h.stun > 0) drawDizzy(ctx, cx, dy - 9, sim.time)
  // The big spin's charge: a ring of dots under it fills as it recharges; when full it blinks gold.
  {
    const ready = sim.heroSkillT <= 0
    const share = ready ? 1 : 1 - sim.heroSkillT / HERO_SKILL_CD
    const n = 16
    const lit = Math.floor(share * n)
    const ry = dy + CROWD_PX - 1
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 - Math.PI / 2
      const on = k < lit
      ctx.fillStyle = ready ? ((Math.floor(sim.time * 6) + k) % 4 === 0 ? WHITE : GOLD_LIGHT) : on ? GOLD : NIGHT_2
      ctx.fillRect(cx + Math.round(Math.cos(a) * 13), ry + Math.round(Math.sin(a) * 5), 2, 1)
    }
  }
  const skillAge = sim.time - sim.heroSkillAt
  if (skillAge >= 0 && skillAge < 0.6) {
    const r = Math.round(at(HERO_SKILL_R) * Math.min(1, skillAge / 0.3))
    const my = dy + (CROWD_PX >> 1)
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * Math.PI * 2 + skillAge * 10
      ctx.fillStyle = k % 3 === 0 ? WHITE : GOLD_LIGHT
      ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(my + Math.sin(a) * r * 0.6), 3, 2)
    }
  }
  if (fighting) {
    const age = sim.time - sim.heroSpinAt
    const r = 10 + Math.floor(age * 36)
    const my = dy + (CROWD_PX >> 1)
    ctx.fillStyle = age < 0.15 ? WHITE : GOLD_LIGHT
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2 + sim.time * 8
      ctx.fillRect(Math.round(cx + Math.cos(ang) * r), Math.round(my + Math.sin(ang) * r * 0.7), 2, 2)
    }
  }
  if (h.hp < h.maxHp) drawHpBar(ctx, cx - 8, dy - 11, h.hp / h.maxHp, GOLD_DARK, GOLD, GOLD_LIGHT)
}

function drawShiba(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, index: number): void {
  const unit = sim.shibas[index]
  if (!unit?.alive) return
  const prev = renderer.shibaY[index] ?? 0
  const prevX = renderer.shibaX[index] ?? 0
  const seen = renderer.shibaSeen[index] === 1
  renderer.shibaY[index] = unit.y
  renderer.shibaX[index] = unit.x
  renderer.shibaSeen[index] = 1
  // Any step, up, down, or sideways, plays the walk.
  const moved = !seen || Math.abs(unit.y - prev) > 0.2 || Math.abs(unit.x - prevX) > 0.2
  const fighting = sim.free ? sim.time - unit.bitAt < 1 : foeNear(sim, unit.lane, unit.y, true)
  const pose = poseOf(moved, fighting)
  const beat = offbeat(sim.time, index)
  // Taking a hit: a white flash and a one-pixel jolt, so you can see who is being bitten.
  const hurt = sim.time - unit.hurtAt
  const struck = hurt >= 0 && hurt < 0.1
  const flash = (fighting && hitFrame(beat)) || struck
  const jolt = hurt >= 0 && hurt < 0.16 ? ((Math.floor(hurt * 50) & 1) === 0 ? 1 : -1) : 0
  const dx = px(at(FIELD_X + unit.x)) - (CROWD_PX >> 1) + jolt
  const hop = celebrateHop(sim, index)
  const dy = fpy(unit.y) - CROWD_PX - hop - lunge(sim, unit.bitAt)
  softShadow(ctx, dx + (CROWD_PX >> 1), dy + hop + CROWD_PX - 1, (CROWD_PX >> 1) - 1)
  const cd = unit.cd
  if (seen && cd > (renderer.shibaCd[index] ?? 0) + 0.5) {
    renderer.shibaAct[index] = sim.time
    if (unit.kind === KIND_BLACK) spawnBoom(renderer, sim, dx + (CROWD_PX >> 1), dy - 4)
  }
  renderer.shibaCd[index] = cd
  if (unit.kind === KIND_TAN && sim.rushT > 0 && moved) {
    ctx.fillStyle = (Math.floor(sim.time * 24) & 1) === 0 ? GOLD : GOLD_LIGHT
    ctx.fillRect(dx + 4, dy + CROWD_PX, 1, 3)
    ctx.fillRect(dx + CROWD_PX - 5, dy + CROWD_PX + 1, 1, 4)
  }
  blitCrowd(ctx, renderer, furOf(unit.kind), pose, fighting ? beat : sim.time, unit.lane, 0, flash, dx, dy)
  if (unit.kind === KIND_SESAME) paintBark(ctx, sim.time - (renderer.shibaAct[index] ?? -9), dx + (CROWD_PX >> 1), dy)
  if (unit.stun > 0) drawDizzy(ctx, dx + (CROWD_PX >> 1), dy - 3, sim.time)
  if (unit.kind === KIND_CHEER && sim.time - unit.bitAt < 0.5) {
    // Its reach, as a dotted pink ring on the grass, each time it waves.
    const r = at(CHEER_RADIUS)
    const gx = dx + (CROWD_PX >> 1)
    const gy = dy + CROWD_PX
    ctx.fillStyle = DANGER_LIGHT
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2 + sim.time
      ctx.fillRect(gx + Math.round(Math.cos(a) * r), gy + Math.round(Math.sin(a) * r * 0.45), 2, 1)
    }
  }
  if (unit.kind === KIND_CHEER) drawPennant(ctx, dx + CROWD_PX - 6, dy - 6, sim.time, sim.time - unit.bitAt < 0.4)
  if (unit.kind === KIND_WHITE) {
    drawHeart(ctx, dx + CROWD_PX - 7, dy - 2)
    paintMend(ctx, sim.time - (renderer.shibaAct[index] ?? -9), dx + (CROWD_PX >> 1), dy)
  }
}

/** 胡麻柴's bark: three widening bars rising off the helmet, ")))" turned upward. */
/** Stunned: two little stars circle over the head. */
function drawDizzy(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
  for (let k = 0; k < 2; k++) {
    const a = time * 7 + k * Math.PI
    const x = cx + Math.round(Math.cos(a) * 6)
    const y = cy + Math.round(Math.sin(a) * 2)
    ctx.fillStyle = LINE
    ctx.fillRect(x - 2, y - 1, 5, 3)
    ctx.fillRect(x - 1, y - 2, 3, 5)
    ctx.fillStyle = GOLD_LIGHT
    ctx.fillRect(x - 1, y, 3, 1)
    ctx.fillRect(x, y - 1, 1, 3)
  }
}

/** 応援柴's flag, 7×12: a pole and a pink pennant that flaps; it jumps when it waves. */
function drawPennant(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, wave: boolean): void {
  const lift = wave ? 2 : 0
  const flap = Math.floor(time * 6) & 1
  ctx.fillStyle = LINE
  ctx.fillRect(x - 1, y - lift - 1, 3, 13)
  ctx.fillRect(x + 1, y - lift - 1 + flap, 6, 6)
  ctx.fillStyle = WHITE_MID
  ctx.fillRect(x, y - lift, 1, 11)
  ctx.fillStyle = DANGER
  ctx.fillRect(x + 1, y - lift + flap, 5, 4)
  ctx.fillStyle = DANGER_LIGHT
  ctx.fillRect(x + 1, y - lift + flap, 2, 1)
}

/** 白 heal: a pink heart floats up off the healer. */
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
  const dy = fpy(cat.y) - CAT_PX + (cat.fly === 1 || cat.kind === BREED_POODLE || cat.kind === BREED_POM ? 0 : lunge(sim, cat.bitAt))
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
  softShadow(ctx, dx + (CAT_PX >> 1), dy + CAT_PX - 1, (CAT_PX >> 1) - 1)
  const prev = renderer.catY[index] ?? 0
  const prevX = renderer.catX[index] ?? 0
  const seen = renderer.catSeen[index] === 1
  renderer.catY[index] = cat.y
  renderer.catX[index] = cat.x
  renderer.catSeen[index] = 1
  const moved = !seen || Math.abs(cat.y - prev) > 0.2 || Math.abs(cat.x - prevX) > 0.2
  const fighting = sim.free ? sim.time - cat.bitAt < 1 : foeNear(sim, cat.lane, cat.y, false)
  const pose = poseOf(moved, fighting)
  const beat = offbeat(sim.time, index)
  const hurt = sim.time - cat.hurtAt
  const struck = hurt >= 0 && hurt < 0.1
  const jolt = hurt >= 0 && hurt < 0.16 ? ((Math.floor(hurt * 50) & 1) === 0 ? 1 : -1) : 0
  blitCat(ctx, renderer, cat.kind, pose, fighting ? beat : sim.time, cat.lane, 0, (fighting && hitFrame(beat)) || struck, dx + jolt, dy)
  if (sim.time - cat.mendAt < 0.5 && sim.time >= cat.mendAt) {
    // Mended by a ポメラニアン: a pink plus rises off it.
    const rise = Math.floor((sim.time - cat.mendAt) * 20)
    const px0 = dx + CAT_PX - 6
    const py0 = dy - 2 - rise
    ctx.fillStyle = LINE
    ctx.fillRect(px0 - 1, py0 - 3, 3, 7)
    ctx.fillRect(px0 - 3, py0 - 1, 7, 3)
    ctx.fillStyle = DANGER_LIGHT
    ctx.fillRect(px0, py0 - 2, 1, 5)
    ctx.fillRect(px0 - 2, py0, 5, 1)
  }
  if (cat.kind === BREED_POM && sim.time - cat.bitAt < 0.4 && sim.time >= cat.bitAt) {
    // Its mending pulse, out to its reach.
    const t = (sim.time - cat.bitAt) / 0.4
    const r = Math.round(at(POM_RADIUS) * t)
    const gx = dx + (CAT_PX >> 1)
    const gy = dy + CAT_PX - 2
    ctx.fillStyle = DANGER_LIGHT
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2
      ctx.fillRect(gx + Math.round(Math.cos(a) * r), gy + Math.round(Math.sin(a) * r * 0.5), 2, 1)
    }
  }
  if (cat.kind === BREED_POODLE) paintLob(ctx, sim.time - cat.bitAt, dx + (CAT_PX >> 1), dy + 6, px(at(FIELD_X + cat.aimX)), fpy(cat.aimY) - 8)
}

/** プードル's ball: a small arc from the dog to the shiba it was thrown at, 0.4 s in the air, a pop where it lands. */
function paintLob(ctx: CanvasRenderingContext2D, age: number, x0: number, y0: number, x1: number, y1: number): void {
  if (age < 0 || age > 0.5) return
  if (age > 0.4) {
    ctx.fillStyle = WHITE
    ctx.fillRect(x1 - 1, y1 - 1, 3, 3)
    return
  }
  const t = age / 0.4
  const x = Math.round(x0 + (x1 - x0) * t)
  const y = Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 18)
  ctx.fillStyle = NIGHT
  ctx.fillRect(x - 2, y - 2, 5, 5)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(x - 1, y - 1, 3, 3)
  ctx.fillStyle = WHITE
  ctx.fillRect(x - 1, y - 1, 1, 1)
}

/** The boss: 48×48, two walk frames, a hit flash while it fights, and a big burst when it falls. */
function drawBoss(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, boss: Unit, index: number): void {
  const size = renderer.sheets.boss.height >> 1
  const dx = px(at(FIELD_X + boss.x)) - (size >> 1)
  const dy = fpy(boss.y) - size
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
  const howlAge = sim.time - sim.howlAt
  const shake = howlAge >= 0 && howlAge < 0.4 ? ((Math.floor(howlAge * 30) & 1) === 0 ? 1 : -1) : 0
  const sheet = sim.free && sim.stage >= BOSS_DARK_FROM ? renderer.sheets.bossDark : renderer.sheets.boss
  ctx.drawImage(sheet, frameNo * size, flash ? size : 0, size, size, dx + shake, dy, size, size)
  if (howlAge >= 0 && howlAge < 0.7) {
    // The howl: rings roll out from its mouth, as far as the stun reaches.
    const cx = dx + (size >> 1)
    const cy = dy + (size >> 1) + 6
    for (let ring = 0; ring < 2; ring++) {
      const t = howlAge - ring * 0.18
      if (t < 0) continue
      const r = Math.round(at(BOSS_HOWL_R) * Math.min(1, t / 0.45))
      ctx.fillStyle = ring === 0 ? DANGER_LIGHT : WHITE
      for (let k = 0; k < 32; k++) {
        const a = (k / 32) * Math.PI * 2
        ctx.fillRect(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r * 0.6), 3, 2)
      }
    }
  }
}

function forgetEffects(renderer: Renderer): void {
  renderer.ghostOn.fill(0)
  renderer.boomOn.fill(0)
  renderer.partOn.fill(0)
  renderer.shibaOn.fill(0)
  renderer.hitstop = 0
  renderer.shakeUntil = 0
  renderer.fxSeen = 0
  renderer.castSeen = 0
  renderer.warn = null
  renderer.press = null
}

function noteDeaths(renderer: Renderer, sim: Sim): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    const alive = unit?.alive ? 1 : 0
    if ((renderer.shibaOn[i] ?? 0) === 1 && alive === 0 && unit && !unit.recall) {
      const dx = px(at(FIELD_X + unit.x)) - (CROWD_PX >> 1)
      const dy = fpy(unit.y) - CROWD_PX
      spawnGhost(renderer, sim, dx, dy, furOf(unit.kind))
      spawnBoom(renderer, sim, dx + (CROWD_PX >> 1), dy + (CROWD_PX >> 1))
    }
    renderer.shibaOn[i] = alive
  }
}

/** Each card is one coat: 赤, 黒, the 胡麻 ball thrower, and the 白 healer. Every crowd sprite matches its card. */
function furOf(kind: number): number {
  if (kind === KIND_BLACK) return FUR_BLACK
  if (kind === KIND_SESAME) return FUR_SESAME
  if (kind === KIND_WHITE) return FUR_CREAM
  if (kind === KIND_DISC) return FUR_BUCHI
  if (kind === KIND_BIG) return FUR_GRAY
  if (kind === KIND_CHEER) return FUR_KINAKO
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
    if (age > 0.5 || age < 0) {
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
    if (frame >= 4 || frame < 0) {
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

const COAT_DARK = [FUR_MID, NIGHT, WHITE_DARK, FUR_DARK, GOLD_DARK, NIGHT_2, DANGER_DARK] as const
const COAT_LIT = [FUR_BODY, NIGHT_2, WHITE_MID, FUR_MID, GOLD, NIGHT_3, DANGER] as const
const CUT_H = 44
const CUT_SLIDE = 0.12

/** ?lanes: a special's strike, once the cut-in is gone: 赤 sweet potatoes rain onto every 赤, 黒 jerky spears hit their dogs, 胡麻 a cheese wedge slams the middle and rings out, 白 hearts. Then each touched unit shows its share. Free placement draws its skills in paintCasts. */
function paintSpecialField(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (sim.free) return
  paintRushAura(ctx, sim)
  if (sim.fxKind < 0 || sim.fxT <= 0) return
  const age = FX_TIME - sim.fxT
  const fresh = renderer.fxSeen !== sim.fxId
  renderer.fxSeen = sim.fxId
  if (sim.fxKind === KIND_TAN) paintPotatoRain(ctx, renderer, sim, age)
  else if (sim.fxKind === KIND_BLACK) paintJerky(ctx, renderer, sim, age, fresh)
  else if (sim.fxKind === KIND_WHITE) paintSasami(ctx, renderer, sim, age)
  else paintCheese(ctx, renderer, sim, age, fresh)
  if (sim.fxKind !== KIND_TAN && age >= 0.12) paintHitNumbers(ctx, renderer, sim.fxHits, age - 0.12)
}

/** Over every unit a strike touched, its share floats up: gold digits for damage, a green plus and digits for a heal. */
function paintHitNumbers(ctx: CanvasRenderingContext2D, renderer: Renderer, hits: readonly { x: number; y: number; v: number; heal: boolean }[], age: number): void {
  const rise = Math.floor(age * 30)
  for (const hit of hits) {
    const v = Math.round(hit.v)
    if (v <= 0) continue
    const digits = digitCount(v)
    const w = digits * 10 + (hit.heal ? 9 : 0)
    const x = px(at(FIELD_X + hit.x)) - (w >> 1)
    const y = fpy(hit.y) - CAT_PX - 14 - rise
    if (hit.heal) {
      ctx.fillStyle = LINE
      ctx.fillRect(x, y + 3, 7, 3)
      ctx.fillRect(x + 2, y + 1, 3, 7)
      ctx.fillStyle = MEADOW_HOT
      ctx.fillRect(x + 1, y + 4, 5, 1)
      ctx.fillRect(x + 3, y + 2, 1, 5)
    }
    drawNumber(ctx, renderer, v, x + (hit.heal ? 9 : 0), y, false)
  }
}

/** While the rush lasts, gold embers rise off every 赤. */
function paintRushAura(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (sim.rushT <= 0) return
  const beat = Math.floor(sim.time * 12)
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive || unit.kind !== KIND_TAN) continue
    const x = px(at(FIELD_X + unit.x))
    const top = fpy(unit.y) - CROWD_PX
    for (let k = 0; k < 3; k++) {
      const rise = (beat + i * 3 + k * 4) % 12
      const ex = x - 8 + ((i * 7 + k * 6) % 16)
      ctx.fillStyle = GOLD_CYCLE[(beat + k) & 3] ?? GOLD
      const size = rise < 6 ? 2 : 1
      ctx.fillRect(ex, top + 6 - rise, size, size)
    }
    // Speed trails behind each rushing 赤.
    const feet = top + CROWD_PX
    ctx.fillStyle = (beat & 1) === 0 ? GOLD_LIGHT : GOLD
    for (let k = 0; k < 3; k++) ctx.fillRect(x - 7 + k * 6, feet + 2 + ((beat + k) & 1) * 2, 2, 5)
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
    const head = fpy(unit.y) - CROWD_PX
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
        if (dog) spawnBoom(renderer, sim, px(at(FIELD_X + dog.x)), fpy(dog.y) - 14)
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

/** ?lanes 白 full heal: hearts burst up off every shiba and gold pluses ring the 柴の家. */
function paintSasami(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, age: number): void {
  for (let i = 0; i < sim.shibas.length; i++) {
    const unit = sim.shibas[i]
    if (!unit?.alive) continue
    const x = px(at(FIELD_X + unit.x))
    const top = fpy(unit.y) - CROWD_PX
    const lag = (i % 4) * 0.06
    if (age < lag || age > lag + 0.6) continue
    const rise = Math.floor((age - lag) * 40)
    drawHeart(ctx, x - 3 + ((i & 1) ? 4 : -4), top - rise)
  }
  const home = renderer.sheets.home
  const hx = frame.internalW >> 1
  const hy = fpy(FIELD_H) - (home.height >> 1)
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

/** ?lanes cut-in: a striped band slides in with the smug face, and ゴゴゴ shakes above it. Free placement has no cut-in. */
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
  if (slide !== 0) return
  const jitter = Math.floor(age * 16) & 1
  for (let i = 0; i < RUMBLE_WORD.length; i++) {
    const gx = w - 4 - (RUMBLE_WORD.length - i) * 11 + ((i + jitter) & 1)
    const gy = y - 13 - ((i + jitter) & 1)
    drawLetter(ctx, RUMBLE_WORD[i] ?? '', gx, gy, 1, DANGER)
  }
}

function paintDamage(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  if (sim.free || sim.floatT <= 0 || sim.floatDmg <= 0) return
  const pop = sim.floatT > FLOAT_TIME - 0.12
  const digits = digitCount(sim.floatDmg)
  const step = pop ? 14 : 10
  const rise = Math.round((1 - sim.floatT / FLOAT_TIME) * 28)
  const x = (frame.internalW - digits * step) >> 1
  const y = py(at(FIELD_Y) + Math.round(at(FIELD_H) * 0.38) - rise)
  drawNumber(ctx, renderer, sim.floatDmg | 0, x, y, pop)
}

/** A filled pixel ellipse, one row at a time so every edge stays on whole pixels. */
/** A unit's shadow on the grass: a dithered night ellipse with a solid core, so it reads soft without leaving the palette. */
function softShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number): void {
  fillEllipse(ctx, cx, cy, rx + 1, 2, dither(ctx, NIGHT, 2) ?? NIGHT)
  fillEllipse(ctx, cx, cy, rx - 2, 1, NIGHT)
}

/** Drifting motes over the field, by time of day: sakura petals by day, embers at dusk, fireflies at night. Wall-clock driven, so they keep drifting while the match is paused or over. */
function paintAir(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (!sim.free) return
  const theme = themeOf(sim)
  const t = performance.now() / 1000
  const fx = px(at(FIELD_X))
  const fw = at(FIELD_W)
  const fy = py(at(FIELD_Y))
  const fh = at(FIELD_H)
  const n = theme === 'night' ? 12 : 14
  const biome = biomeOf(sim)
  for (let i = 0; i < n; i++) {
    const seed = i * 97.13
    if (biome === 'snow' || (biome === 'autumn' && theme !== 'night')) {
      // Snowflakes drift down; in the autumn wood, leaves tumble.
      const fall = (t * (8 + (i % 4) * 3) + seed * 7) % (fh + 20)
      const x = fx + ((seed * 13 + Math.sin(t * 1.1 + i) * 12) % fw + fw) % fw
      const y = fy - 10 + fall
      if (biome === 'snow') {
        ctx.fillStyle = WHITE
        ctx.fillRect(Math.round(x), Math.round(y), 2, 2)
        ctx.fillStyle = SKY_LIGHT
        ctx.fillRect(Math.round(x) + 1, Math.round(y) + 1, 1, 1)
      } else {
        const flip = Math.floor(t * 3 + i) & 1
        ctx.fillStyle = i % 3 === 0 ? GOLD : FUR_BODY
        ctx.fillRect(Math.round(x), Math.round(y), flip ? 3 : 2, flip ? 2 : 3)
        ctx.fillStyle = FUR_MID
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
      }
    } else if (theme === 'day') {
      // Petals fall slowly and sway.
      const fall = (t * (10 + (i % 4) * 3) + seed * 7) % (fh + 20)
      const x = fx + ((seed * 13 + t * 6 + Math.sin(t * 1.3 + i) * 10) % fw + fw) % fw
      const y = fy - 10 + fall
      const flip = Math.floor(t * 4 + i) & 1
      ctx.fillStyle = DANGER_LIGHT
      ctx.fillRect(Math.round(x), Math.round(y), flip ? 2 : 1, flip ? 1 : 2)
      ctx.fillStyle = WHITE
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
    } else if (theme === 'dusk') {
      // Embers rise and wink out.
      const rise = (t * (8 + (i % 3) * 4) + seed * 5) % (fh * 0.8)
      const x = fx + ((seed * 17 + Math.sin(t * 0.9 + i) * 6) % fw + fw) % fw
      const y = fy + fh - rise
      ctx.fillStyle = (Math.floor(t * 6 + i) & 3) === 0 ? GOLD_HOT : GOLD
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
    } else {
      // Fireflies wander and pulse.
      const x = fx + ((seed * 11 + Math.sin(t * 0.5 + i * 1.7) * 30) % fw + fw) % fw
      const y = fy + 40 + ((seed * 23 + Math.cos(t * 0.4 + i) * 24) % (fh - 60) + (fh - 60)) % (fh - 60)
      const on = Math.sin(t * 2.2 + i * 1.3) > 0.2
      if (!on) continue
      ctx.fillStyle = GOLD_LIGHT
      ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1)
      ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 3)
      ctx.fillStyle = GOLD_HOT
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
    }
  }
}

function fillEllipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string | CanvasPattern): void {
  ctx.fillStyle = color
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5))))
    ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1)
  }
}

/** 柵: a sealed wooden fence of posts and two rails, or 黒's bone wall. It shakes when bitten, cracks under half health, and is gone at zero. */
function paintWalls(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (!sim.free) return
  for (const wall of sim.walls) {
    const hp = wall.hp
    if (hp <= 0) continue
    const full = wall.max
    const hurt = sim.time - wall.hitAt < 0.12
    const w = at(wall.hw * 2)
    const x = px(at(FIELD_X + wall.x)) - (w >> 1) + (hurt ? 1 : 0)
    let y = fpy(wall.y) - 5
    const cracked = hp < full * 0.5
    if (wall.bone) {
      // It pops up out of the ground, and blinks in its last two seconds.
      const born = BONE_RISE - (sim.time - (wall.until - BONE_WALL_T))
      if (born > 0) y += Math.ceil((born / BONE_RISE) * 6)
      if (wall.until - sim.time < 2 && (Math.floor(sim.time * 8) & 1) === 1) continue
      paintBoneWall(ctx, x, y, w, hurt, cracked)
    } else {
      paintFence(ctx, x, y, w, hurt, cracked)
    }
    // Health: a thin bar over the wall once it has been bitten.
    if (hp < full) {
      ctx.fillStyle = LINE
      ctx.fillRect(x + (w >> 1) - 11, y - 6, 22, 3)
      ctx.fillStyle = cracked ? DANGER : GOLD_LIGHT
      ctx.fillRect(x + (w >> 1) - 10, y - 5, Math.max(1, Math.round((20 * hp) / full)), 1)
    }
  }
}

/** The stage's wooden 柵: posts and two rails. */
function paintFence(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hurt: boolean, cracked: boolean): void {
  ctx.fillStyle = MEADOW_DARK
  ctx.fillRect(x + 1, y + 10, w, 2)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y + 2, w, 3)
  ctx.fillRect(x, y + 6, w, 3)
  for (let px0 = x; px0 < x + w - 2; px0 += 7) {
    ctx.fillStyle = LINE
    ctx.fillRect(px0, y - 1, 4, 12)
    ctx.fillStyle = hurt ? WHITE : FUR_BODY
    ctx.fillRect(px0 + 1, y, 2, 10)
    ctx.fillStyle = FUR_LIGHT
    ctx.fillRect(px0 + 1, y, 1, 1)
  }
  ctx.fillStyle = LINE
  ctx.fillRect(x + w - 4, y - 1, 4, 12)
  ctx.fillStyle = hurt ? WHITE : FUR_BODY
  ctx.fillRect(x + w - 3, y, 2, 10)
  ctx.fillStyle = hurt ? WHITE : FUR_MID
  ctx.fillRect(x + 1, y + 3, w - 2, 1)
  ctx.fillRect(x + 1, y + 7, w - 2, 1)
  if (cracked) {
    ctx.fillStyle = LINE
    ctx.fillRect(x + (w >> 1) - 1, y + 3, 1, 1)
    ctx.fillRect(x + (w >> 1), y + 7, 2, 1)
    ctx.fillRect(x + (w >> 2), y + 3, 2, 1)
  }
}

/** 黒「ホネのカベ」: a sealed row of upright white bones on a dark rail. */
function paintBoneWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hurt: boolean, cracked: boolean): void {
  ctx.fillStyle = MEADOW_DARK
  ctx.fillRect(x + 1, y + 12, w, 2)
  ctx.fillStyle = LINE
  ctx.fillRect(x, y + 3, w, 6)
  ctx.fillStyle = WHITE_DARK
  ctx.fillRect(x + 1, y + 5, w - 2, 2)
  const n = Math.max(2, Math.floor((w + 1) / 7))
  const stride = (w - 7) / (n - 1)
  for (let i = 0; i < n; i++) {
    const bx = x + Math.round(i * stride)
    // Outline: two knobs and a shaft.
    ctx.fillStyle = LINE
    ctx.fillRect(bx, y - 2, 7, 5)
    ctx.fillRect(bx, y + 9, 7, 5)
    ctx.fillRect(bx + 1, y + 2, 5, 8)
    ctx.fillStyle = hurt ? GOLD_HOT : WHITE
    ctx.fillRect(bx + 1, y - 1, 2, 3)
    ctx.fillRect(bx + 4, y - 1, 2, 3)
    ctx.fillRect(bx + 1, y + 10, 2, 3)
    ctx.fillRect(bx + 4, y + 10, 2, 3)
    ctx.fillRect(bx + 2, y + 1, 3, 10)
    ctx.fillStyle = hurt ? GOLD_LIGHT : WHITE_MID
    ctx.fillRect(bx + 4, y + 2, 1, 8)
    ctx.fillRect(bx + 5, y + 11, 1, 2)
    if (cracked && i % 3 === 1) {
      ctx.fillStyle = LINE
      ctx.fillRect(bx + 2, y + 4, 2, 1)
      ctx.fillRect(bx + 3, y + 5, 2, 1)
    }
  }
}

/** 応援「おうえん旗」: the zone as a dotted pink ring on the grass, and a sealed flag that waves. */
function paintFlags(ctx: CanvasRenderingContext2D, sim: Sim): void {
  for (const f of sim.flags) {
    const gx = px(at(FIELD_X + f.x))
    const gy = fpy(f.y)
    const r = at(FLAG_RADIUS)
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2
      ctx.fillStyle = (k & 1) === 0 ? DANGER : DANGER_LIGHT
      ctx.fillRect(gx + Math.round(Math.cos(a) * r), gy + Math.round(Math.sin(a) * r * 0.45), 3, 2)
    }
    if (f.until - sim.time < 2 && (Math.floor(sim.time * 8) & 1) === 1) continue
    const age = sim.time - f.at
    const drop = age < 0.2 ? Math.round((1 - age / 0.2) * 30) : 0
    drawFlag(ctx, gx, gy - drop, sim.time)
  }
}

/** A planted flag, 22×36 from its foot: a pale pole with a gold knob and a pink cloth with a white paw, waving column by column. */
function drawFlag(ctx: CanvasRenderingContext2D, gx: number, gy: number, time: number): void {
  const top = gy - 32
  softShadow(ctx, gx + 4, gy, 6)
  ctx.fillStyle = LINE
  ctx.fillRect(gx - 1, top - 1, 4, 34)
  ctx.fillRect(gx - 2, top - 6, 6, 6)
  ctx.fillStyle = WHITE_MID
  ctx.fillRect(gx, top, 2, 32)
  ctx.fillStyle = WHITE
  ctx.fillRect(gx, top, 1, 32)
  ctx.fillStyle = GOLD_LIGHT
  ctx.fillRect(gx - 1, top - 5, 4, 4)
  ctx.fillStyle = GOLD
  ctx.fillRect(gx + 1, top - 3, 2, 2)
  const beat = Math.floor(time * 6)
  for (let c = 0; c < 19; c++) {
    const off = FLAG_WAVE[(beat + Math.floor(c / 5)) & 3] ?? 0
    const cx = gx + 3 + c
    ctx.fillStyle = LINE
    ctx.fillRect(cx, top + off - 1, 1, 15)
    if (c === 18) continue
    ctx.fillStyle = DANGER
    ctx.fillRect(cx, top + off, 1, 13)
    ctx.fillStyle = DANGER_LIGHT
    ctx.fillRect(cx, top + off, 1, 2)
    ctx.fillStyle = DANGER_DARK
    ctx.fillRect(cx, top + off + 11, 1, 2)
    // A white paw in the middle of the cloth: a pad and three toes.
    ctx.fillStyle = WHITE
    if (c >= 6 && c <= 11) ctx.fillRect(cx, top + off + 6, 1, c === 6 || c === 11 ? 3 : 4)
    if (c === 5 || c === 6 || c === 8 || c === 9 || c === 11 || c === 12) ctx.fillRect(cx, top + off + 2, 1, 2)
  }
}
const FLAG_WAVE = [0, 1, 1, 0] as const
const BONE_RISE = 0.18

/** Free placement skills: the name pops over the caster, a ring flashes there, and each skill draws what it does. Then each touched unit shows its share. */
function paintCasts(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const fresh = renderer.castSeen !== sim.castId
  renderer.castSeen = sim.castId
  for (const c of sim.casts) {
    const age = sim.time - c.at
    if (age < 0 || age > 1.6) continue
    const x = px(at(FIELD_X + c.x))
    const y = fpy(c.y)
    const tx = px(at(FIELD_X + c.tx))
    const ty = fpy(c.ty)
    const newest = fresh && c === sim.casts[sim.casts.length - 1]
    if (newest) spawnBoom(renderer, sim, x, y - 10)
    if (c.kind === KIND_TAN) paintDash(ctx, renderer, x, y, ty, age)
    else if (c.kind === KIND_BLACK) {
      if (newest) spawnBoom(renderer, sim, tx, ty)
      castRing(ctx, tx, ty, age, 10, at(gridX(BONE_WALL_W) / 2), 0.3, WHITE)
    } else if (c.kind === KIND_SESAME) paintBallRain(ctx, tx, ty, age)
    else if (c.kind === KIND_WHITE) paintLick(ctx, renderer, c, x, y, age)
    else if (c.kind === KIND_DISC) paintBoomerang(ctx, sim, c, x, y, tx, ty, age)
    else if (c.kind === KIND_BIG) paintStomp(ctx, x, y, age)
    if (c.kind !== KIND_BIG) castRing(ctx, x, y - 8, age, 6, 26, 0.25, GOLD_LIGHT)
    const delay = c.kind === KIND_SESAME ? 0.15 : c.kind === KIND_TAN ? 0.08 : 0.12
    if (age >= delay && age < delay + 1) paintHitNumbers(ctx, renderer, c.hits, age - delay)
    if (age < 1) {
      // The skill's name in plain bold over the caster (the dash: over where it ends).
      const name = SKILL_NAMES[c.kind] ?? ''
      const nx = Math.max(30, Math.min(frame.internalW - 30, c.kind === KIND_TAN ? tx : x))
      const ny = Math.max(py(at(FIELD_Y)) + 4, (c.kind === KIND_TAN ? ty : y) - CROWD_PX - 16 - (age < 0.1 ? 0 : Math.min(4, Math.floor((age - 0.1) * 16))))
      queuePlain(name, nx, ny - (age < 0.08 ? 1 : 0), age < 0.08 ? 14 : 12, age < 0.08 ? WHITE : GOLD_LIGHT, 'center', true, LINE)
    }
  }
}


/** A dotted ring growing from r0 to r1 over `dur` seconds, flattened onto the grass. */
function castRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, age: number, r0: number, r1: number, dur: number, color: string): void {
  if (age >= dur) return
  const r = Math.round(r0 + (r1 - r0) * (age / dur))
  ctx.fillStyle = color
  const n = Math.max(12, Math.round(r * 1.4))
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2
    ctx.fillRect(cx + Math.round(Math.cos(a) * r) - 1, cy + Math.round(Math.sin(a) * r * 0.6) - 1, 2, 2)
  }
}

/** 赤「シバダッシュ」: speed lines up the path and white afterimages of the shiba along it. */
function paintDash(ctx: CanvasRenderingContext2D, renderer: Renderer, x: number, y: number, ty: number, age: number): void {
  if (age > 0.5) return
  const scroll = Math.floor(age * 160)
  for (let k = 0; k < 5; k++) {
    const lx = x - 10 + k * 5
    ctx.fillStyle = k === 2 ? WHITE : (k & 1) === 0 ? GOLD_LIGHT : WHITE_MID
    for (let sy = ty + ((scroll + k * 7) % 14); sy < y; sy += 14) ctx.fillRect(lx, sy, 1, 7)
  }
  for (let i = 1; i <= 3; i++) {
    if (age > 0.12 + i * 0.07) continue
    const gy = Math.round(y + ((ty - y) * i) / 4)
    blitCrowd(ctx, renderer, FUR_RED, 'walk', age * 4 + i, 0, 0, true, x - (CROWD_PX >> 1), gy - CROWD_PX)
  }
}

/** 胡麻「ボールの雨」: white balls fall on the knot, each bursting where it lands, and the rain's reach rings out. */
function paintBallRain(ctx: CanvasRenderingContext2D, cx: number, cy: number, age: number): void {
  const r = at(BALL_RADIUS)
  for (let i = 0; i < 11; i++) {
    const a = i * 2.4
    const d = i === 0 ? 0 : r * (0.3 + ((i * 37) % 60) / 100)
    const bx = cx + Math.round(Math.cos(a) * d)
    const gy = cy + Math.round(Math.sin(a) * d * 0.6) - 4
    const land = 0.04 + i * 0.022
    if (age < land) {
      const by = gy - Math.round((1 - age / land) * 50)
      ctx.fillStyle = NIGHT
      ctx.fillRect(bx - 1, gy + 3, 3, 1)
      drawBall(ctx, bx, by)
    } else if (age < land + 0.14) {
      const t = age - land
      ctx.fillStyle = t < 0.06 ? WHITE : GOLD_LIGHT
      const s = t < 0.06 ? 3 : 5
      ctx.fillRect(bx - s, gy, 2, 2)
      ctx.fillRect(bx + s - 1, gy, 2, 2)
      ctx.fillRect(bx, gy - s, 2, 2)
      ctx.fillRect(bx, gy + s - 1, 2, 2)
    }
  }
  if (age > 0.05) castRing(ctx, cx, cy, age - 0.05, r * 0.4, r, 0.4, WHITE)
}

/** A ball, 5×5, outlined, lit from the top left. */
function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = LINE
  ctx.fillRect(x - 1, y - 3, 4, 7)
  ctx.fillRect(x - 2, y - 2, 6, 5)
  ctx.fillStyle = WHITE
  ctx.fillRect(x - 1, y - 2, 4, 5)
  ctx.fillStyle = WHITE_MID
  ctx.fillRect(x + 1, y + 1, 2, 1)
  ctx.fillRect(x + 2, y, 1, 1)
}

/** 白「ペロペロ」: a big tongue licks at the caster, hearts rise off everyone it mended, and its reach rings out pink. */
function paintLick(ctx: CanvasRenderingContext2D, renderer: Renderer, c: { hits: readonly { x: number; y: number; heal: boolean }[] }, x: number, y: number, age: number): void {
  castRing(ctx, x, y - 6, age, 10, at(LICK_RADIUS), 0.4, DANGER_LIGHT)
  if (age < 0.6) {
    // The lick: a pink tongue swings side to side under the caster's nose.
    const swing = (Math.floor(age * 12) & 1) === 0 ? -4 : 4
    const lx = x + swing - 5
    const ly = y - 10
    ctx.fillStyle = LINE
    ctx.fillRect(lx, ly, 11, 13)
    ctx.fillRect(lx + 1, ly + 13, 9, 1)
    ctx.fillStyle = DANGER_LIGHT
    ctx.fillRect(lx + 1, ly + 1, 9, 11)
    ctx.fillRect(lx + 2, ly + 12, 7, 1)
    ctx.fillStyle = DANGER
    ctx.fillRect(lx + 5, ly + 2, 1, 8)
    ctx.fillRect(lx + 7, ly + 9, 2, 3)
    ctx.fillStyle = WHITE
    ctx.fillRect(lx + 2, ly + 2, 2, 2)
  }
  let i = 0
  for (const hit of c.hits) {
    const lag = (i % 5) * 0.05
    i += 1
    if (!hit.heal || age < lag || age > lag + 0.7) continue
    const rise = Math.floor((age - lag) * 36)
    const hx = px(at(FIELD_X + hit.x))
    drawHeart(ctx, hx - 3 + ((i & 1) === 1 ? 5 : -5), fpy(hit.y) - CROWD_PX - rise)
  }
  // The 柴の家 gets its share: three hearts off the roof.
  const hx = frame.internalW >> 1
  const hy = fpy(FIELD_H) - renderer.sheets.home.height
  for (let k = 0; k < 3; k++) {
    const t = age - 0.15 - k * 0.08
    if (t < 0 || t > 0.6) continue
    drawHeart(ctx, hx - 14 + k * 11, hy - Math.floor(t * 30))
  }
}

/** ぶち「ブーメラン」: its path as gold dashes out to the turn, and a big spinning frisbee flying out and back. */
function paintBoomerang(ctx: CanvasRenderingContext2D, sim: Sim, c: Cast, x: number, y: number, tx: number, ty: number, age: number): void {
  if (age >= BOOM_TIME) return
  const len = Math.max(1, Math.hypot(tx - x, ty - y))
  ctx.fillStyle = GOLD_LIGHT
  for (let d = 6; d < len; d += 9) {
    const dx = x + Math.round(((tx - x) * d) / len)
    const dy = y - 8 + Math.round(((ty - y) * d) / len)
    ctx.fillStyle = LINE
    ctx.fillRect(dx - 1, dy - 1, 4, 4)
    ctx.fillStyle = GOLD_LIGHT
    ctx.fillRect(dx, dy, 2, 2)
  }
  const b = sim.booms.find((m) => m.cast === c)
  if (!b) return
  for (let k = 2; k >= 0; k--) {
    const at0 = boomPoint(b, age - k * 0.04)
    const fx = px(at(FIELD_X + at0.x))
    const fy = fpy(at0.y) - 10
    if (k > 0) {
      ctx.fillStyle = k === 1 ? WHITE : GOLD_LIGHT
      ctx.fillRect(fx - 4, fy - 1, 8, 3)
      continue
    }
    // A big frisbee, 25×13, outlined: white with a gold rim band that flips as it spins.
    fillEllipse(ctx, fx, fy, 12, 6, LINE)
    fillEllipse(ctx, fx, fy, 11, 5, WHITE)
    const spin = Math.floor(age * 20) & 1
    fillEllipse(ctx, fx, fy + (spin ? 1 : -1), 7, 2, GOLD)
    fillEllipse(ctx, fx, fy + (spin ? 1 : -1), 4, 1, GOLD_LIGHT)
    ctx.fillStyle = WHITE_MID
    ctx.fillRect(fx - 7, fy + 4, 15, 1)
  }
}

/** どっしり「ドスン」: the ground cracks out from its paws and a shockwave rolls out to the stun reach. */
function paintStomp(ctx: CanvasRenderingContext2D, x: number, y: number, age: number): void {
  if (age < 1.1) {
    const grow = Math.min(1, age / 0.12)
    const reach = at(STOMP_RADIUS) * 0.55 * grow
    for (let r = 0; r < 7; r++) {
      const a = r * 0.9 + 0.3
      let cx = x
      let cy = y
      for (let s = 0; s < reach; s += 3) {
        const zig = ((s / 3 + r) & 1) === 0 ? 1 : -1
        cx = x + Math.round(Math.cos(a) * s - Math.sin(a) * zig)
        cy = y + Math.round((Math.sin(a) * s + Math.cos(a) * zig) * 0.6)
        ctx.fillStyle = LINE
        ctx.fillRect(cx - 1, cy, 3, 2)
      }
      ctx.fillStyle = MEADOW_DARK
      ctx.fillRect(cx - 1, cy - 1, 3, 1)
    }
  }
  castRing(ctx, x, y, age, 8, at(STOMP_RADIUS), 0.35, WHITE)
  castRing(ctx, x, y, age - 0.08, 8, at(STOMP_RADIUS), 0.35, GOLD_LIGHT)
  if (age < 0.4) {
    // Dust kicked up by the stomp.
    const h = Math.floor(age * 30)
    ctx.fillStyle = WHITE_MID
    for (let k = 0; k < 6; k++) ctx.fillRect(x - 14 + k * 6, y - 2 - ((h + k * 3) % 8), 2, 2)
  }
}

/** 岩 and 池: sealed with the 1px outline, lit from the top left. They sit on the meadow under the units. */
function paintRocks(ctx: CanvasRenderingContext2D, sim: Sim): void {
  if (!sim.free) return
  for (const rock of spec(sim).rocks) {
    const cx = px(at(FIELD_X + gridX(rock.x)))
    const cy = fpy(rock.y)
    const rx = rock.r
    const ry = Math.round(rock.r * 0.62)
    fillEllipse(ctx, cx, cy, rx + 1, ry + 1, LINE)
    if (rock.pond) {
      fillEllipse(ctx, cx, cy, rx, ry, MEADOW_DARK)
      fillEllipse(ctx, cx, cy, rx - 2, ry - 2, SKY)
      fillEllipse(ctx, cx, cy - 1, rx - 5, Math.max(1, ry - 5), SKY_LIGHT)
      // Two ripples that drift with the clock.
      const t = Math.floor(sim.time * 2) & 3
      ctx.fillStyle = WHITE
      ctx.fillRect(cx - 5 + t, cy - 1, 4, 1)
      ctx.fillRect(cx + 2 - t, cy + 2, 3, 1)
    } else {
      fillEllipse(ctx, cx, cy, rx, ry, WHITE_DARK)
      fillEllipse(ctx, cx - 1, cy - 2, rx - 2, ry - 2, WHITE_MID)
      fillEllipse(ctx, cx - 3, cy - 4, Math.max(1, rx - 6), Math.max(1, ry - 5), WHITE)
      ctx.fillStyle = LINE
      ctx.fillRect(cx + 2, cy - 1, 3, 1)
      ctx.fillRect(cx + 4, cy, 1, 2)
    }
  }
}

function paintDock(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  const y = pyDock(at(PANEL_Y))
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, y + 1, frame.internalW, Math.max(0, frame.internalH - y - 1))
  paintMute(ctx, renderer, pyDock(at(BONE_Y)) - 2)
  paintSpeed(ctx, renderer, sim, pyDock(at(BONE_Y)) - 2)
  paintPauseButton(ctx, pyDock(at(BONE_Y)) - 2)
  if (!sim.free) {
    ctx.drawImage(renderer.sheets.bone, px(at(BONE_X)), pyDock(at(BONE_Y)))
    drawNumber(ctx, renderer, sim.bones | 0, px(at(BONE_X)) + 14, pyDock(at(BONE_Y)) + 1, false)
  }
  for (let slot = 0; slot < CARD_XS.length; slot++) {
    if (sim.free && sim.deck[slot] === undefined) {
      // Not unlocked yet: an empty, dim slot.
      const ex = px(at(CARD_XS[slot] ?? CARD_X0))
      ctx.fillStyle = LINE
      ctx.fillRect(ex, pyDock(at(CARD_Y)), at(CARD_W), at(CARD_H))
      ctx.fillStyle = NIGHT_1
      ctx.fillRect(ex + 1, pyDock(at(CARD_Y)) + 1, at(CARD_W) - 2, at(CARD_H) - 2)
      drawLock(ctx, ex + (at(CARD_W) >> 1) - 5, pyDock(at(CARD_Y)) + (at(CARD_H) >> 1) - 7)
      continue
    }
    const kind = sim.free ? (sim.deck[slot] ?? slot) : slot
    const deny = sim.deny[kind] ?? 0
    const cost = sim.free ? -1 : costOf(sim, kind)
    const x = px(at(CARD_XS[slot] ?? CARD_X0) + denyShift(deny))
    // Free placement waits out a respawn (rechargeFull long); ?lanes the card's RECHARGE.
    const wait = (sim.recharge[kind] ?? 0) / ((sim.free ? sim.rechargeFull[kind] : RECHARGE[kind]) || 1)
    const out = isOut(sim, kind)
    const ready = sim.free ? !out : sim.bones >= cost
    paintCard(ctx, renderer, x, kind, cost, ready && wait <= 0, false, sim.time, kind === sim.picked, wait, sim.recharge[kind] ?? 0, out)
    paintGauge(ctx, x, kind, sim, out)
    if (out && !skillReady(sim, kind)) paintOut(ctx, x, sim)
    if (sim.free && skillReady(sim, kind)) paintSkillReady(ctx, x, kind, sim, kind === sim.picked)
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
  secs = 0,
  out = false,
): void {
  const y = pyDock(at(CARD_Y)) - (picked ? 3 : 0)
  const w = at(CARD_W)
  const h = at(CARD_H)
  // 出撃中 (free placement, its shiba is on the field): lit like a ready card, but framed in meadow green and standing still.
  const lit = affordable || out
  ctx.fillStyle = lit ? NIGHT_1 : NIGHT
  ctx.fillRect(x, y, w, h)
  const hx = x + ((w - HERO_PX) >> 1)
  const pad = Math.min(8, ((w - HERO_PX) >> 1) - 2)
  ctx.fillStyle = out ? MEADOW_DARK : affordable ? NIGHT_2 : NIGHT_1
  ctx.fillRect(hx - pad + 2, y + 4, HERO_PX + pad * 2 - 4, HERO_PX + 2)
  ctx.fillRect(hx - pad, y + 6, HERO_PX + pad * 2, HERO_PX - 2)
  ctx.fillStyle = out ? MEADOW : affordable ? NIGHT_3 : NIGHT_2
  ctx.fillRect(hx - 2, y + HERO_PX + 2, HERO_PX + 4, 2)
  const phase = Math.floor(time * 8) & 3
  const border = hint ? (GOLD_CYCLE[phase] ?? GOLD_LIGHT) : out ? MEADOW_LIGHT : affordable ? GOLD : NIGHT_2
  const inner = hint ? (GOLD_CYCLE[(phase + 2) & 3] ?? GOLD) : out ? MEADOW_DARK : affordable ? GOLD_DARK : NIGHT_1
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
    // Recharge: the portrait stays but sinks under a night dither that lifts from the bottom as the card gets ready, with the seconds left big on top.
    const top = y + 3
    const tall = HERO_PX + 2
    const cover = Math.ceil(tall * Math.min(1, wait))
    ctx.fillStyle = dither(ctx, NIGHT, 2) ?? NIGHT
    ctx.fillRect(x + 2, top, w - 4, cover)
    ctx.fillStyle = NIGHT_3
    ctx.fillRect(x + 2, top + cover - 1, w - 4, 1)
    const n = Math.max(1, Math.ceil(secs - 0.05))
    if (secs > 0) drawNumber(ctx, renderer, n, x + ((w - (digitCount(n) * 14 - 2)) >> 1), top + ((tall - 15) >> 1), true)
  }
  drawRoleIcon(ctx, kind, x + w - 12, y + 4)
  if (cost >= 0) {
    ctx.drawImage(renderer.sheets.bone, x + 1, y + h - 17)
    drawNumber(ctx, renderer, cost | 0, x + 13, y + h - 15, false)
  }
}

/** Free placement 出撃中: a meadow-green plate in the card's foot (a full gauge's skill plate draws over it), so which coats are on the field reads at a glance. */
function paintOut(ctx: CanvasRenderingContext2D, x: number, sim: Sim): void {
  const y = pyDock(at(CARD_Y))
  const w = at(CARD_W)
  const h = at(CARD_H)
  ctx.fillStyle = LINE
  ctx.fillRect(x + 2, y + h - 12, w - 4, 10)
  ctx.fillStyle = MEADOW
  ctx.fillRect(x + 3, y + h - 11, w - 6, 8)
  ctx.fillStyle = MEADOW_LIGHT
  ctx.fillRect(x + 3, y + h - 11, w - 6, 1)
  // A little pennant on the plate's left, waving.
  const wave = Math.floor(sim.time * 4) & 1
  ctx.fillStyle = WHITE
  ctx.fillRect(x + 5, y + h - 10, 1, 6)
  ctx.fillRect(x + 6, y + h - 10 + wave, 3, 2)
  ctx.fillRect(x + 6, y + h - 8 + wave, 2, 1)
  queuePlain('出撃中', x + (w >> 1) + 3, y + h - 11, 7, WHITE, 'center', true, LINE)
}

/** Special gauge under the portrait. Full gauges flash through the golds. While the coat is out (`big`) the bar is twice as thick, since the skill is what that card does now. */
function paintGauge(ctx: CanvasRenderingContext2D, x: number, kind: number, sim: Sim, big = false): void {
  const y = pyDock(at(CARD_Y)) + 37
  const w = at(CARD_W) - 8
  const tall = big ? 4 : 2
  const need = SPECIAL_NEED[kind] ?? 1
  const fill = Math.min(w, Math.floor((w * (sim.charge[kind] ?? 0)) / need))
  ctx.fillStyle = LINE
  ctx.fillRect(x + 3, y - 1, w + 2, tall + 2)
  ctx.fillStyle = big ? NIGHT_2 : NIGHT_1
  ctx.fillRect(x + 4, y, w, tall)
  const full = fill >= w
  ctx.fillStyle = full ? (GOLD_CYCLE[Math.floor(sim.time * 12) & 3] ?? GOLD) : big ? GOLD : GOLD_DARK
  ctx.fillRect(x + 4, y, fill, tall)
  if (!full && fill > 0) {
    ctx.fillStyle = big ? GOLD_LIGHT : GOLD
    ctx.fillRect(x + 4, y, fill, 1)
  }
}

/** A full skill gauge: the card's border pulses through the golds with a white flash, and the skill's name sits in the card's foot. The name dims while no unit of that coat is out to cast it. */
function paintSkillReady(ctx: CanvasRenderingContext2D, x: number, kind: number, sim: Sim, picked: boolean): void {
  const y = pyDock(at(CARD_Y)) - (picked ? 3 : 0)
  const w = at(CARD_W)
  const h = at(CARD_H)
  const phase = Math.floor(sim.time * 8) & 3
  const castable = casterOf(sim, kind) !== undefined
  // A plate for the name in the card's foot: pulsing gold when it can fire, night while no caster is out.
  ctx.fillStyle = LINE
  ctx.fillRect(x + 2, y + h - 15, w - 4, 13)
  ctx.fillStyle = castable ? ((phase & 2) === 0 ? GOLD : GOLD_DARK) : NIGHT_2
  ctx.fillRect(x + 3, y + h - 14, w - 6, 11)
  ctx.fillStyle = castable ? GOLD_LIGHT : NIGHT_3
  ctx.fillRect(x + 3, y + h - 14, w - 6, 1)
  if (castable) {
    frameRect(ctx, x - 1, y - 1, w + 2, h + 2, phase === 0 ? WHITE : (GOLD_CYCLE[phase] ?? GOLD_LIGHT))
    frameRect(ctx, x, y, w, h, GOLD_CYCLE[(phase + 1) & 3] ?? GOLD)
    frameRect(ctx, x + 1, y + 1, w - 2, h - 2, GOLD_CYCLE[(phase + 2) & 3] ?? GOLD_LIGHT)
    // Sparks run round the corners.
    ctx.fillStyle = WHITE
    const k = Math.floor(sim.time * 10) % 4
    const cx = k === 0 || k === 3 ? x - 2 : x + w
    const cy = k < 2 ? y - 2 : y + h
    ctx.fillRect(cx, cy, 2, 2)
  }
  const name = SKILL_NAMES[kind] ?? ''
  queuePlain(name, x + (w >> 1), y + h - 13, name.length > 5 ? 7 : 8, castable ? WHITE : WHITE_DARK, 'center', true, LINE)
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
  return fpy(FIELD_H) - renderer.sheets.home.height - 22
}

/** Free placement: a dashed gold line marks the top of the zone a tap can drop a shiba into. */
function paintFreeZone(ctx: CanvasRenderingContext2D): void {
  const y = fpy(FREE_ZONE_Y)
  const x0 = px(at(FIELD_X))
  const w = at(FIELD_W)
  ctx.fillStyle = LINE
  for (let x = 0; x < w; x += 8) ctx.fillRect(x0 + x, y - 1, 5, 3)
  ctx.fillStyle = GOLD_LIGHT
  for (let x = 0; x < w; x += 8) ctx.fillRect(x0 + x + 1, y, 3, 1)
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
function paintPaw(ctx: CanvasRenderingContext2D, renderer: Renderer, time: number, free: boolean): void {
  const bob = BOB[Math.floor(time * 6) & 7] ?? 0
  if (free) {
    // Free placement: point into the deploy zone, just under its line.
    ctx.drawImage(renderer.sheets.paw, (frame.internalW - pawArt.w) >> 1, fpy(FREE_ZONE_Y) + 18 + bob)
    return
  }
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
/** Where the result screen puts things, in internal px from its top. Short phones get a tight header and START floats at the bottom edge so it is always on screen. */
function shopLayout(): { compact: boolean; cellTop: number; startY: number; cellH: number; infoH: number } {
  const room = frame.internalH - frame.topDy
  // Seven coats need four rows of cells, so the header goes compact and the cells shrink to fit above START.
  const rows = Math.ceil((KINDS + (HERO_ENABLED ? 1 : 0)) / 2)
  const compact = room < 372 || rows > 3
  const bh = at(START_H)
  const cellTop = compact ? 74 : at(SHOP_Y0)
  const startY = compact ? Math.min(room - bh - 4, at(START_Y) + 40) : at(START_Y)
  // Room for the info strip (what levelling a coat does) between the cells and START.
  // Short phones drop its third line rather than squeeze the cells into it.
  const fitFor = (info: number): number => Math.floor((startY - 6 - info - cellTop) / rows) - at(SHOP_GAP)
  const infoH = fitFor(SHOP_INFO_H) >= 44 ? SHOP_INFO_H : SHOP_INFO_SHORT
  return { compact, cellTop, startY, cellH: Math.max(44, Math.min(at(SHOP_CELL_H), fitFor(infoH))), infoH }
}

/** What a tap on the result screen hits, from a flat world point (see screenToWorld): START, a coat's deck zone, or its buy button. */
export function shopTarget(x: number, y: number, kinds: number): { type: 'start' | 'pick' | 'buy' | 'home' | 'none'; kind: number } {
  const lay = shopLayout()
  const ix = x / 2
  const iy = y / 2
  if (ix <= 28 && iy <= 28) return { type: 'home', kind: -1 }
  const bx = at(START_X)
  const by = lay.startY
  if (ix >= bx - 2 && ix <= bx + at(START_W) + 2 && iy >= by - 4 && iy <= by + at(START_H) + 4) return { type: 'start', kind: -1 }
  for (let kind = 0; kind < kinds; kind++) {
    const cx = at(SHOP_X0 + (kind % 2) * (SHOP_CELL_W + SHOP_GAP))
    const cy = lay.cellTop + Math.floor(kind / 2) * (lay.cellH + at(SHOP_GAP))
    if (ix < cx || ix > cx + at(SHOP_CELL_W) || iy < cy || iy > cy + lay.cellH) continue
    return { type: ix < cx + at(SHOP_PICK_W) ? 'pick' : 'buy', kind }
  }
  return { type: 'none', kind: -1 }
}

function paintShop(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim): void {
  // The match clock stands still on this screen, so blinks and bobs run on the wall clock.
  const shopClock = performance.now() / 1000
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, frame.internalW, frame.internalH)
  const won = sim.outcome === 'won'
  const word = won ? CLEAR_WORD : LOSE_WORD
  const wx = (frame.internalW - word.length * 18) >> 1
  const lay = shopLayout()
  const wy = lay.compact ? 15 : 28
  for (let i = 0; i < word.length; i++) drawLetter(ctx, word[i] ?? '', wx + i * 18, py(wy), 2, won ? GOLD_LIGHT : DANGER)
  // STAGE n and the stars won (empty outlines on a loss).
  const stw = STAGE_WORD.length * 10 + 14
  const stx = (frame.internalW - stw) >> 1
  for (let i = 0; i < STAGE_WORD.length; i++) drawLetter(ctx, STAGE_WORD[i] ?? '', stx + i * 10, py(lay.compact ? 3 : 8), 1, WHITE)
  if (isEndless(sim)) {
    drawInfinity(ctx, stx + STAGE_WORD.length * 10 + 4, py(lay.compact ? 4 : 9), GOLD_LIGHT)
    // The run's score in place of stars, and NEW! when it beat the best.
    const word = 'SCORE'
    const n = sim.kills
    const total = word.length * 10 + 6 + digitCount(n) * 10
    const sx0 = (frame.internalW - total) >> 1
    const sy0 = py(lay.compact ? 54 : 101)
    for (let i = 0; i < word.length; i++) drawLetter(ctx, word[i] ?? '', sx0 + i * 10, sy0, 1, WHITE)
    drawNumber(ctx, renderer, n, sx0 + word.length * 10 + 6, sy0, false)
    if (sim.endlessRecord) {
      const c = GOLD_CYCLE[Math.floor(shopClock * 8) & 3] ?? GOLD
      for (let i = 0; i < NEW_WORD.length; i++) drawLetter(ctx, NEW_WORD[i] ?? '', sx0 + total + 6 + i * 9, sy0, 1, c)
    }
  } else {
    drawNumber(ctx, renderer, sim.stage + 1, stx + STAGE_WORD.length * 10 + 4, py(lay.compact ? 3 : 8), false)
    for (let i = 0; i < 3; i++) drawStar(ctx, ((frame.internalW - 66) >> 1) + i * 24, py(lay.compact ? 52 : 99), i < sim.stars)
  }
  const earnedDigits = digitCount(sim.earned)
  const purseDigits = digitCount(sim.purse)
  const earnedY = lay.compact ? 38 : 62
  const ex = lay.compact ? 8 : (frame.internalW - (22 + earnedDigits * 10)) >> 1
  ctx.drawImage(renderer.sheets.bone, ex, py(earnedY) + 1)
  drawLetter(ctx, '+', ex + 13, py(earnedY), 1, GOLD_LIGHT)
  drawNumber(ctx, renderer, sim.earned, ex + 22, py(earnedY), false)
  const pxl = lay.compact ? frame.internalW - 8 - (14 + purseDigits * 14) : (frame.internalW - (14 + purseDigits * 14)) >> 1
  const purseY = lay.compact ? 36 : 84
  ctx.drawImage(renderer.sheets.bone, pxl, py(purseY) + 3)
  drawNumber(ctx, renderer, sim.purse, pxl + 14, py(purseY), true)
  paintHomeButton(ctx, px(4), py(4))
  paintMute(ctx, renderer, py(4))
  const shown = sim.free ? KINDS + (HERO_ENABLED ? 1 : 0) : 4
  for (let kind = 0; kind < shown; kind++) {
    const level = sim.levels[kind] ?? 1
    const maxed = level >= MAX_LEVEL
    const cost = sim.free ? feedCost(level) : levelCost(level)
    const can = !maxed && sim.purse >= cost
    const isHero = kind === HERO_SLOT
    const slot = isHero ? -1 : sim.deck.indexOf(kind)
    const inDeck = !sim.free || slot >= 0 || isHero
    const x = px(at(SHOP_X0 + (kind % 2) * (SHOP_CELL_W + SHOP_GAP)))
    const y = py(lay.cellTop + Math.floor(kind / 2) * (lay.cellH + at(SHOP_GAP)))
    const w = at(SHOP_CELL_W)
    const h = lay.cellH
    const pick = at(SHOP_PICK_W)
    ctx.fillStyle = inDeck ? NIGHT_2 : NIGHT_1
    ctx.fillRect(x, y, w, h)
    frameRect(ctx, x, y, w, h, inDeck ? GOLD : NIGHT_3)
    frameRect(ctx, x + 1, y + 1, w - 2, h - 2, inDeck ? GOLD_DARK : NIGHT_2)
    ctx.fillStyle = LINE
    ctx.fillRect(x, y, 1, 1)
    ctx.fillRect(x + w - 1, y, 1, 1)
    ctx.fillRect(x, y + h - 1, 1, 1)
    ctx.fillRect(x + w - 1, y + h - 1, 1, 1)
    if (!coatOpen(sim, kind)) {
      // Locked: a padlock where the face goes, and which stage to clear in the buy zone.
      ctx.fillStyle = NIGHT_1
      ctx.fillRect(x + 4, y + 4, pick - 8, h - 8)
      drawLock(ctx, x + (pick >> 1) - 5, y + (h >> 1) - 10)
      // The stage to clear: its number on a dim tile with a star, like the title's stage tiles.
      const tw = 26
      const tx = x + pick + ((w - pick - tw) >> 1)
      const ty0 = y + (h >> 1) - 18
      ctx.fillStyle = LINE
      ctx.fillRect(tx, ty0, tw, 34)
      ctx.fillStyle = NIGHT_2
      ctx.fillRect(tx + 1, ty0 + 1, tw - 2, 32)
      const n = (COAT_UNLOCK[kind] ?? 0) + 1
      drawNumber(ctx, renderer, n, tx + ((tw - digitCount(n) * 10) >> 1), ty0 + 4, false)
      drawMiniStar(ctx, tx + 9, ty0 + 22, false)
      continue
    }
    // The portrait zone: a lit stage under the face, and the deck badge below it.
    ctx.fillStyle = inDeck ? NIGHT_3 : NIGHT_2
    ctx.fillRect(x + 4, y + 4, pick - 8, HERO_PX + 4)
    const blink = inDeck && (Math.floor(shopClock * 2 + kind) & 1) === 1
    const face = isHero ? HERO_REWARD : heroCell(kind, blink ? 'blink' : 'open')
    ctx.drawImage(renderer.sheets.hero, face * HERO_PX, 0, HERO_PX, HERO_PX, x + 4 + ((pick - 8 - HERO_PX) >> 1), y + 6, HERO_PX, HERO_PX)
    if (isHero) drawCrown(ctx, x + (pick >> 1), y + 2, GOLD, GOLD_LIGHT)
    else drawRoleIcon(ctx, kind, x + pick - 15, y + 8)
    if (kind === mvpOf(sim) && !isHero) {
      // MVP: the coat that dealt the most damage wears a crown over its portrait.
      drawCrown(ctx, x + (pick >> 1), y + 1, GOLD, GOLD_LIGHT)
      const word = 'MVP'
      ctx.fillStyle = LINE
      ctx.fillRect(x + 3, y + HERO_PX - 6, word.length * 9 + 3, 14)
      for (let i = 0; i < word.length; i++) drawLetter(ctx, word[i] ?? '', x + 5 + i * 9, y + HERO_PX - 4, 1, GOLD_LIGHT)
    }
    if (sim.newCoat === kind) {
      // Just unlocked: a blinking NEW! over the portrait.
      const c = GOLD_CYCLE[Math.floor(shopClock * 8) & 3] ?? GOLD
      for (let i = 0; i < NEW_WORD.length; i++) drawLetter(ctx, NEW_WORD[i] ?? '', x + 6 + i * 9, y + 2, 1, c)
    }
    if (isHero) {
      // The hero is always out: its badge just says HERO.
      const word = 'HERO'
      const hy = y + h - 17
      for (let i = 0; i < word.length; i++) drawLetter(ctx, word[i] ?? '', x + ((pick - word.length * 9) >> 1) + i * 9, hy, 1, GOLD_LIGHT)
    } else if (sim.free) {
      const bxx = x + 4
      const byy = y + HERO_PX + 12
      const bww = pick - 8
      const bhh = h - HERO_PX - 16
      if (bhh < 10) {
        // Short cells: the deck number sits on the portrait's corner instead of a badge.
        if (slot >= 0) {
          ctx.fillStyle = LINE
          ctx.fillRect(x + 4, y + HERO_PX - 4, 14, 14)
          ctx.fillStyle = GOLD
          ctx.fillRect(x + 5, y + HERO_PX - 3, 12, 12)
          drawNumber(ctx, renderer, slot + 1, x + 6, y + HERO_PX - 2, false)
        }
      } else {
      ctx.fillStyle = LINE
      ctx.fillRect(bxx, byy, bww, bhh)
      ctx.fillStyle = slot >= 0 ? GOLD : NIGHT_1
      ctx.fillRect(bxx + 1, byy + 1, bww - 2, bhh - 2)
      if (slot >= 0) {
        ctx.fillStyle = GOLD_LIGHT
        ctx.fillRect(bxx + 1, byy + 1, bww - 2, 2)
        drawNumber(ctx, renderer, slot + 1, bxx + ((bww - 10) >> 1), byy + ((bhh - 10) >> 1), false)
      } else {
        const full = sim.deck.length >= deckSize(sim)
        drawLetter(ctx, '+', bxx + ((bww - 8) >> 1), byy + ((bhh - 10) >> 1), 1, full ? NIGHT_2 : GOLD_LIGHT)
      }
      }
    }
    // The buy zone: level, then a button with the cost.
    const lx = x + pick + 2
    drawLetter(ctx, LEVEL_WORD[0] ?? '', lx, y + 8, 1, WHITE)
    drawLetter(ctx, LEVEL_WORD[1] ?? '', lx + 9, y + 8, 1, WHITE)
    drawNumber(ctx, renderer, level, lx + 20, y + 8, false)
    if ((sim.gained[kind] ?? 0) > 0) {
      // Levelled up this match: a blinking UP! next to the level.
      const c = GOLD_CYCLE[Math.floor(shopClock * 8) & 3] ?? GOLD
      const ux = lx + 20 + digitCount(level) * 10 + 2
      drawLetter(ctx, 'U', ux, y + 8, 1, c)
      drawLetter(ctx, 'P', ux + 9, y + 8, 1, c)
    }
    const kx = lx - 2
    const kw = w - pick - 4
    if (sim.free) {
      // XP toward the next level.
      ctx.fillStyle = LINE
      ctx.fillRect(kx, y + 20, kw, 4)
      ctx.fillStyle = NIGHT_1
      ctx.fillRect(kx + 1, y + 21, kw - 2, 2)
      const share = maxed ? 1 : Math.min(1, (sim.xp[kind] ?? 0) / xpNeed(level))
      ctx.fillStyle = maxed ? GOLD : SKY
      ctx.fillRect(kx + 1, y + 21, Math.round((kw - 2) * share), 2)
    }
    const ky = y + (sim.free ? 26 : 24)
    const kh = h - (sim.free ? 30 : 28)
    ctx.fillStyle = LINE
    ctx.fillRect(kx, ky, kw, kh)
    if (maxed) {
      ctx.fillStyle = GOLD_CYCLE[Math.floor(shopClock * 8) & 3] ?? GOLD
      ctx.fillRect(kx + 1, ky + 1, kw - 2, kh - 2)
      ctx.fillStyle = LINE
      ctx.fillRect(kx + (kw >> 1) - 4, ky + (kh >> 1) - 1, 9, 3)
      ctx.fillRect(kx + (kw >> 1) - 1, ky + (kh >> 1) - 4, 3, 9)
      continue
    }
    ctx.fillStyle = can ? GOLD : NIGHT_1
    ctx.fillRect(kx + 1, ky + 1, kw - 2, kh - 2)
    if (can) {
      ctx.fillStyle = GOLD_LIGHT
      ctx.fillRect(kx + 1, ky + 1, kw - 2, 2)
      ctx.fillStyle = GOLD_DARK
      ctx.fillRect(kx + 1, ky + kh - 3, kw - 2, 2)
    }
    const cw = digitCount(cost) * 10
    if (kh < 34) {
      // Short button: bone and cost side by side.
      const rowW = 14 + cw
      ctx.drawImage(renderer.sheets.bone, kx + ((kw - rowW) >> 1), ky + ((kh - 8) >> 1))
      drawNumber(ctx, renderer, cost, kx + ((kw - rowW) >> 1) + 14, ky + ((kh - 10) >> 1), false)
    } else {
      ctx.drawImage(renderer.sheets.bone, kx + ((kw - 12) >> 1), ky + 4)
      drawNumber(ctx, renderer, cost, kx + ((kw - cw) >> 1), ky + kh - 15, false)
    }
  }
  if (sim.free && sim.chest !== 1 && deckReady(sim)) paintCoatInfo(ctx, renderer, sim, py(lay.startY) - lay.infoH - 2, lay.infoH)
  const bx = px(at(START_X))
  const by = py(lay.startY)
  const bw = at(START_W)
  const bh = at(START_H)
  // The 宝箱 waits where START goes; once opened, its ホネ burst up for a moment.
  const wall = performance.now() / 1000
  if (sim.chest === 2 && renderer.chestState === 1) renderer.chestOpenAt = wall
  renderer.chestState = sim.chest
  if (sim.chest === 1) {
    paintChest(ctx, bx + (bw >> 1), by + bh, wall, false)
    for (let i = 0; i < TAP_WORD.length; i++) drawLetter(ctx, TAP_WORD[i] ?? '', bx + (bw >> 1) + 36 + i * 9, by + 4 - ((Math.floor(wall * 3) & 1) << 1), 1, GOLD_LIGHT)
    return
  }
  const ready = deckReady(sim)
  const bob = ready ? (BOB[Math.floor(shopClock * 4) & 7] ?? 0) : 0
  ctx.fillStyle = ready ? GOLD : NIGHT_2
  ctx.fillRect(bx, by - (bob >> 1), bw, bh)
  frameRect(ctx, bx, by - (bob >> 1), bw, bh, LINE)
  frameRect(ctx, bx + 1, by - (bob >> 1) + 1, bw - 2, bh - 2, ready ? GOLD_LIGHT : NIGHT_3)
  ctx.fillStyle = ready ? GOLD_DARK : NIGHT_1
  ctx.fillRect(bx + 2, by - (bob >> 1) + bh - 4, bw - 4, 2)
  const sw = START_WORD.length * 18 - 2
  const sx = bx + ((bw - sw) >> 1)
  const sy = by - (bob >> 1) + ((bh - 20) >> 1)
  for (let i = 0; i < START_WORD.length; i++) drawLetter(ctx, START_WORD[i] ?? '', sx + i * 18, sy, 2, ready ? WHITE : NIGHT_3)
  if (!ready) {
    // Pick DECK_SIZE coats first.
    const hx = (frame.internalW - (SELECT_WORD.length * 10 + 14)) >> 1
    for (let i = 0; i < SELECT_WORD.length; i++) drawLetter(ctx, SELECT_WORD[i] ?? '', hx + i * 10, by - 14, 1, DANGER)
    drawNumber(ctx, renderer, deckSize(sim), hx + SELECT_WORD.length * 10 + 4, by - 14, false)
  }
  const openAge = wall - renderer.chestOpenAt
  if (sim.chest === 2 && openAge >= 0 && openAge < 1.4) {
    const cx = bx + (bw >> 1)
    if (openAge < 0.5) paintChest(ctx, cx, by + bh, wall, true)
    // Bones fly out in an arc, then +N rises.
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + (k - 3.5) * 0.32
      const r = openAge * 140
      const bxk = Math.round(cx + Math.cos(a) * r) - 6
      const byk = Math.round(by + Math.sin(a) * r + openAge * openAge * 120)
      ctx.drawImage(renderer.sheets.bone, bxk, byk)
    }
    const n = sim.chestBones
    const nw = 14 + digitCount(n) * 10
    const ny = by - 20 - Math.floor(openAge * 20)
    drawLetter(ctx, '+', cx - (nw >> 1), ny, 1, GOLD_LIGHT)
    drawNumber(ctx, renderer, n, cx - (nw >> 1) + 12, ny, false)
  }
}

const COAT_NAMES = ['赤柴', '黒柴', '胡麻柴', '白柴', 'ぶち柴', 'どっしり柴', '応援柴'] as const
const PERK_TEXT = ['かみつきが速くなる', 'かみつくと押し返す', 'ボールの範囲が広がる', '回復の範囲が広がる', 'フリスビーが遠くまで飛ぶ', 'ふみつけで少し止める', '応援の範囲が広がる'] as const

/** The result screen's info strip, about the coat last tapped (or the first one that levelled up, else the first in the deck): its name and level, XP to go, and what the next level and the next perk give. */
function paintCoatInfo(ctx: CanvasRenderingContext2D, renderer: Renderer, sim: Sim, y: number, h: number): void {
  let kind = renderer.infoKind
  if (kind < 0 || kind >= KINDS) {
    kind = sim.gained.findIndex((g, k) => g > 0 && k < KINDS)
    if (kind < 0) kind = sim.deck[0] ?? 0
  }
  const w = frame.internalW - 8
  const x = 4
  ctx.fillStyle = LINE
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = NIGHT_1
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  const level = sim.levels[kind] ?? 1
  const maxed = level >= MAX_LEVEL
  const head = `${COAT_NAMES[kind] ?? ''} Lv${level}`
  // Three lines at sizes that stay legible on a phone (8px Japanese turned to mush): name and XP, the next perk, what a level gives.
  // Drawn in the phone's own font on top of the upscaled frame (see queuePlain): name and EXP to go, the next perk, what a level gives.
  queuePlain(head, x + 5, y + 4, 8, WHITE, 'left', true)
  queuePlain(maxed ? 'MAX' : `つぎまで あと${Math.max(0, xpNeed(level) - (sim.xp[kind] ?? 0))}EXP`, x + w - 5, y + 5, 7, maxed ? GOLD_LIGHT : SKY_LIGHT, 'right')
  let line: string
  if (level < PERK_A) line = `Lv${PERK_A}で: ${PERK_TEXT[kind] ?? ''}`
  else if (level < PERK_B) line = `Lv${PERK_B}で: 必殺ゲージが早くたまる`
  else line = '全部の力を引き出した!'
  queuePlain(line, x + 5, y + 16, 7, GOLD_LIGHT)
  if (h >= SHOP_INFO_H) queuePlain(`Lvが上がるごとに 体力・攻撃 +${Math.round(LEVEL_STEP * 100)}%`, x + 5, y + 27, 7, WHITE)
}

/** 宝箱, 30×22, sealed: a wooden chest with gold bands and a lock; it hops while it waits, and its lid flies up when opened. `bottom` is its base line. */
function paintChest(ctx: CanvasRenderingContext2D, cx: number, bottom: number, wall: number, open: boolean): void {
  // Drawn on a 30×24 grid at 2×, so every block stays an integer number of pixels.
  const k = 2
  const ox = cx - 30
  const oy = bottom - 48
  const box = (x: number, y: number, w: number, h: number): void => ctx.fillRect(ox + x * k, oy + y * k, w * k, h * k)
  const hop = open ? 0 : (BOB[Math.floor(wall * 6) & 7] ?? 0) >> 1
  const w = 30
  const x = 0
  const y = -hop
  const c = 15
  // Glow under it.
  ctx.fillStyle = (Math.floor(wall * 4) & 1) === 0 ? GOLD_LIGHT : GOLD
  box(x - 4, 23, w + 8, 1)
  // Body.
  ctx.fillStyle = LINE
  box(x, y + 9, w, 14)
  ctx.fillStyle = FUR_MID
  box(x + 1, y + 10, w - 2, 12)
  ctx.fillStyle = FUR_DARK
  box(x + 1, y + 20, w - 2, 2)
  ctx.fillStyle = GOLD
  box(x + 4, y + 10, 3, 12)
  box(x + w - 7, y + 10, 3, 12)
  // Lid: shut, or thrown up and back.
  const ly = open ? y - 8 : y
  ctx.fillStyle = LINE
  box(x, ly, w, 10)
  ctx.fillStyle = FUR_BODY
  box(x + 1, ly + 1, w - 2, 8)
  ctx.fillStyle = FUR_LIGHT
  box(x + 1, ly + 1, w - 2, 2)
  ctx.fillStyle = GOLD
  box(x + 4, ly + 1, 3, 8)
  box(x + w - 7, ly + 1, 3, 8)
  if (open) {
    ctx.fillStyle = GOLD_HOT
    box(x + 2, y + 10, w - 4, 3)
  } else {
    // Lock.
    ctx.fillStyle = LINE
    box(c - 3, y + 7, 7, 7)
    ctx.fillStyle = GOLD_LIGHT
    box(c - 2, y + 8, 5, 5)
    ctx.fillStyle = LINE
    box(c, y + 10, 1, 2)
  }
}

/** A 17px sealed star: gold when won, a dim outline when not. */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, on: boolean): void {
  const rows = [
    '........#........', '.......###.......', '.......###.......', '......#####......',
    '#################', '.###############.', '..#############..', '...###########...',
    '....#########....', '...###########...', '...####...####...', '..####.....####..',
    '..###.......###..',
  ]
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? ''
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue
      const edge = row[c - 1] !== '#' || row[c + 1] !== '#' || rows[r - 1]?.[c] !== '#' || rows[r + 1]?.[c] !== '#'
      ctx.fillStyle = edge ? LINE : on ? (r < 6 ? GOLD_LIGHT : GOLD) : NIGHT_2
      ctx.fillRect(x + c, y + r, 1, 1)
    }
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
