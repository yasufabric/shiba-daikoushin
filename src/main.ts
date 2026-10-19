import { createSynth } from './audio'
import {
  CARD_H,
  KINDS,
  CARD_W,
  CARD_XS,
  CALL_H,
  CALL_W,
  CALL_X,
  CALL_Y,
  CARD_Y,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  LANE_COUNT,
  SPECIAL_NEED,
  RECALL_LIFT,
  RECALL_TAP,
  HERO_TAP_Y,
} from './balance'
import { createSim, dogsLeft, fillMarch, spawnCat, spawnShiba, NO_INPUT, step, type Input, type Outcome } from './sim'
import { createRenderer, draw, muteTarget, speedTarget, screenToWorld, shopTarget, titleTarget, type ScreenInsets } from './render'

const canvasEl = document.querySelector<HTMLCanvasElement>('#game')
if (!canvasEl) throw new Error('canvas unavailable')
const canvas: HTMLCanvasElement = canvasEl
const context = canvas.getContext('2d')
if (!context) throw new Error('2d context unavailable')
const ctx: CanvasRenderingContext2D = context

const SEEN_KEY = 'shiba-daikoushin-seen'

function seenTutorial(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markTutorial(): void {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private mode can reject storage. The in-match flag still sticks.
  }
}

const SAVE_KEY = 'shiba-daikoushin-save'

interface Save {
  levels: number[]
  purse: number
  stage: number
  best: number[]
  deck: number[]
}

function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    const { levels, purse } = data as Partial<Save>
    if (!Array.isArray(levels) || typeof purse !== 'number') return null
    const { stage, best, deck } = data as Partial<Save>
    return {
      levels: levels.map((n) => (typeof n === 'number' ? n : 1)),
      purse,
      stage: typeof stage === 'number' ? stage : 0,
      best: Array.isArray(best) ? best.map((n) => (typeof n === 'number' ? n : 0)) : [],
      deck: Array.isArray(deck) ? deck.map((n) => (typeof n === 'number' ? n : -1)) : [],
    }
  } catch {
    return null
  }
}

function storeSave(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ levels: sim.levels, purse: sim.purse, stage: sim.stage, best: sim.best, deck: sim.deck }))
  } catch {
    // Private mode can reject storage. Levels still hold for this visit.
  }
}

const saved = loadSave()
const devOn = new URLSearchParams(location.search).has('dev')
// Free placement is the game; ?lanes keeps the older five-path game for comparison.
const freeOn = !new URLSearchParams(location.search).has('lanes')
const sim = createSim({ tutorial: !seenTutorial(), levels: saved?.levels, purse: saved?.purse, free: freeOn, hero: true, title: freeOn && !devOn, stage: saved?.stage, best: saved?.best, deck: saved?.deck })
const HERO_KEY = 'shiba-daikoushin-hero'
try {
  sim.heroUsed = localStorage.getItem(HERO_KEY) === '1'
} catch {
  // Storage blocked: the hint just shows again.
}
let heroSaved = sim.heroUsed
let savedSeq = sim.saveSeq
const renderer = createRenderer()
const synth = createSynth()
const input: Input = { card: -1, restart: false }

let viewW = 1
let viewH = 1
let dpr = 1
let placedW = 0
let placedH = 0
let placedTop = -1
let placedLeft = -1
const insets: ScreenInsets = { top: 0, right: 0, bottom: 0, left: 0 }
let timeScale = 1
const SPEED_KEY = 'shiba-daikoushin-speed'
/** Player's 2× toggle, on top of the dev scale. Saved. */
let fast = false
try {
  fast = localStorage.getItem(SPEED_KEY) === '1'
} catch {
  // Storage blocked: start at 1×.
}
let tutorialStored = seenTutorial()
const frameDts = new Float64Array(90)
frameDts.fill(1 / 60)
let frameI = 0
let fps = 60

interface ShibaDev {
  fps: number
  scale: number
  seek: (seconds: number) => void
  setScale: (scale: number) => void
  fill: (count: number) => void
  special: (kind: number) => void
  /** Drop a shiba or a rival dog right where you want it, for screenshots. */
  place: (side: 's' | 'c', kind: number, x: number, y: number) => void
  snapshot: () => {
    time: number
    shibas: number
    cats: number
    bones: number
    boss: boolean
    left: number
    bossHp: number
    home: number
    outcome: Outcome
    tutorial: boolean
    floatDmg: number
    purse: number
    levels: number[]
  }
}

declare global {
  interface Window {
    __shiba?: ShibaDev
  }
}

if (devOn) {
  const dev: ShibaDev = {
    fps: 60,
    scale: 1,
    seek(seconds: number) {
      let guard = 0
      while (sim.time + 1e-4 < seconds && sim.outcome === 'play' && guard < 8000) {
        step(sim, 1 / 30, NO_INPUT)
        guard += 1
      }
    },
    setScale(scale: number) {
      timeScale = scale > 0 ? scale : 1
      dev.scale = timeScale
    },
    fill(count: number) {
      fillMarch(sim, count)
    },
    special(kind: number) {
      sim.charge[kind] = SPECIAL_NEED[kind] ?? 0
    },
    place(side, kind, x, y) {
      if (side === 's') {
        spawnShiba(sim, kind, 0, y)
        const u = sim.shibas[(sim.cursorS - 1 + sim.shibas.length) % sim.shibas.length]
        if (u) u.x = x
      } else {
        spawnCat(sim, 0, kind, { x, y })
      }
    },
    snapshot() {
      return {
        time: sim.time,
        shibas: sim.aliveShibas,
        cats: sim.aliveCats,
        bones: sim.bones,
        boss: sim.boss,
        left: dogsLeft(sim),
        bossHp: sim.bossIndex >= 0 ? (sim.cats[sim.bossIndex]?.hp ?? 0) : -1,
        home: sim.homeHp,
        outcome: sim.outcome,
        tutorial: sim.tutorial,
        floatDmg: sim.floatDmg,
        purse: sim.purse,
        levels: [...sim.levels],
      }
    },
  }
  window.__shiba = dev
}

function readCssPx(value: string): number {
  const n = Number.parseFloat(value)
  return n > 0 ? n : 0
}

function readInsets(): void {
  const probe = document.getElementById('insets')
  if (!probe) {
    insets.top = 0
    insets.right = 0
    insets.bottom = 0
    insets.left = 0
    return
  }
  const style = getComputedStyle(probe)
  insets.top = readCssPx(style.paddingTop)
  insets.right = readCssPx(style.paddingRight)
  insets.bottom = readCssPx(style.paddingBottom)
  insets.left = readCssPx(style.paddingLeft)
}

function viewportCss(): { w: number; h: number; top: number; left: number } {
  const vv = window.visualViewport
  if (vv && vv.width > 0 && vv.height > 0) {
    return { w: vv.width, h: vv.height, top: vv.offsetTop, left: vv.offsetLeft }
  }
  return { w: window.innerWidth, h: window.innerHeight, top: 0, left: 0 }
}

function syncViewport(): void {
  const raw = window.devicePixelRatio || 1
  dpr = raw >= 1.5 ? 2 : 1
  const box = viewportCss()
  viewW = box.w
  viewH = box.h
  readInsets()
  if (placedW !== viewW || placedH !== viewH || placedTop !== box.top || placedLeft !== box.left) {
    canvas.style.top = `${box.top}px`
    canvas.style.left = `${box.left}px`
    canvas.style.width = `${viewW}px`
    canvas.style.height = `${viewH}px`
    placedW = viewW
    placedH = viewH
    placedTop = box.top
    placedLeft = box.left
  }
  const nextW = Math.max(1, Math.floor(viewW * dpr))
  const nextH = Math.max(1, Math.floor(viewH * dpr))
  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW
    canvas.height = nextH
    ctx.imageSmoothingEnabled = false
  }
}

function blockScroll(ev: Event): void {
  ev.preventDefault()
}

function toLogical(ev: PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  // The result screen is drawn from the top without the dock squeeze, so its taps map flat.
  return screenToWorld(ev.clientX, ev.clientY, rect.left, rect.top, sim.title || sim.outcome !== 'play')
}

function hitCard(x: number, y: number, cardX: number): boolean {
  return x >= cardX && x <= cardX + CARD_W && y >= CARD_Y && y <= CARD_Y + CARD_H
}

canvas.addEventListener('pointerdown', (ev) => {
  ev.preventDefault()
  synth.unlock()
  const p = toLogical(ev)
  if (muteTarget(p.x, p.y, sim.title || sim.outcome !== 'play')) {
    synth.setMuted(!synth.isMuted())
    synth.tap()
    return
  }
  if (!sim.title && sim.outcome === 'play' && speedTarget(p.x, p.y)) {
    fast = !fast
    try {
      localStorage.setItem(SPEED_KEY, fast ? '1' : '0')
    } catch {
      // Not saved; the toggle still works for now.
    }
    synth.tap()
    return
  }
  if (sim.title) {
    const stage = titleTarget(p.x, p.y)
    if (stage >= 0) input.pickStage = stage
    return
  }
  if (sim.outcome !== 'play') {
    if (sim.rewardT > 0) return
    const hit = shopTarget(p.x, p.y, sim.free ? KINDS : 4)
    if (hit.type === 'start') input.restart = true
    else if (hit.type === 'home') input.home = true
    else if (hit.type === 'pick') input.toggleDeck = hit.kind
    else if (hit.type === 'buy') input.levelUp = hit.kind
    return
  }
  for (let card = 0; card < CARD_XS.length; card++) {
    if (hitCard(p.x, p.y, CARD_XS[card] ?? 0)) {
      input.pick = sim.free ? (sim.deck[card] ?? card) : card
      return
    }
  }
  if (sim.free) {
    const wx = p.x
    const wy = p.y
    if (wx >= CALL_X - 4 && wx <= CALL_X + CALL_W + 4 && wy >= CALL_Y - 4 && wy <= CALL_Y + CALL_H + 4) {
      input.callWave = true
      return
    }
    if (p.y < FIELD_Y || p.y > FIELD_Y + FIELD_H || p.x < FIELD_X || p.x > FIELD_X + FIELD_W) return
    const local = { x: p.x - FIELD_X, y: p.y - FIELD_Y }
    if (shibaAt(local.x, local.y)) {
      input.recall = local
      return
    }
    if (sim.hero.alive && local.y < HERO_TAP_Y) {
      input.hero = local
      return
    }
    input.card = input.pick ?? sim.picked
    input.at = local
    return
  }
  const lane = laneAt(p.x, p.y)
  if (lane >= 0) {
    // A pick tapped this same frame has not reached the sim yet, so it wins over sim.picked.
    input.card = input.pick ?? sim.picked
    input.lane = lane
  }
})

/** True when a tap lands on one of our shibas, which sends it home instead of placing a new one. */
function shibaAt(x: number, y: number): boolean {
  return sim.shibas.some((u) => u.alive && !u.recall && Math.hypot(u.x - x, u.y - RECALL_LIFT - y) < RECALL_TAP)
}

/** The path under a field tap, or -1 off the field. */
function laneAt(x: number, y: number): number {
  if (y < FIELD_Y || y > FIELD_Y + FIELD_H) return -1
  const fx = x - FIELD_X
  if (fx < 0 || fx > FIELD_W) return -1
  return Math.min(LANE_COUNT - 1, Math.floor((fx * LANE_COUNT) / FIELD_W))
}

let soundMark = 0
let soundKills = 0
let soundCallT = 0

/** Sounds for what just happened in the fight: one hit per coat per frame, a pop for fallen dogs, a chime for a heal, a blip for a called wave. */
function battleSounds(): void {
  if (sim.time < soundMark - 0.01) {
    soundMark = 0
    soundKills = 0
  }
  const hit = [false, false, false, false, false, false]
  let mended = false
  for (const u of sim.shibas) {
    if (!u.alive) continue
    if (u.bitAt > soundMark && u.bitAt <= sim.time && u.kind !== 3) hit[u.kind] = true
    if (u.mendAt > soundMark && u.mendAt <= sim.time) mended = true
  }
  for (let k = 0; k < hit.length; k++) if (hit[k]) synth.hit(k)
  if (mended) synth.heal()
  if (sim.kills > soundKills) synth.pop()
  soundKills = sim.kills
  if (sim.callT > soundCallT) synth.call()
  if (sim.howlAt > soundMark && sim.howlAt <= sim.time) {
    synth.hit(5)
    renderer.shakeUntil = sim.time + 0.3
  }
  soundCallT = sim.callT
  soundMark = sim.time
}

function playSounds(before: Outcome): void {
  if (sim.sfxDeploy === 1) synth.deploy()
  if (sim.sfxSpecial >= 0) {
    synth.special(sim.sfxSpecial)
    renderer.shakeUntil = sim.time + 0.25
  }
  if (sim.sfxStrike >= 0) {
    synth.strike(sim.sfxStrike)
    renderer.hitstop = 0.05
    renderer.shakeUntil = sim.time + 0.35
  }
  sim.sfxDeploy = 0
  sim.sfxSpecial = -1
  sim.sfxStrike = -1
  if (sim.outcome !== before && sim.outcome !== 'play') {
    synth.fanfare(sim.outcome === 'won')
    if (sim.outcome === 'won') synth.stars(sim.stars)
    if (sim.outcome === 'won') {
      renderer.hitstop = 0.05
      renderer.shakeUntil = sim.time + 0.2
    }
  }
}

function advance(dt: number): void {
  const budget = Math.min(dt * timeScale * (fast && sim.outcome === 'play' && !sim.title ? 2 : 1), 0.8)
  let left = budget
  let first = true
  let steps = 0
  while (left > 0.0001 && steps < 24) {
    const h = Math.min(left, 1 / 30)
    const before = sim.outcome
    step(sim, h, first ? input : NO_INPUT)
    // A new match restarts the clock, so drop any shake or hitstop left over from the last one.
    if (before !== 'play' && sim.outcome === 'play') {
      renderer.shakeUntil = 0
      renderer.hitstop = 0
    }
    playSounds(before)
    battleSounds()
    first = false
    left -= h
    steps += 1
    if (sim.outcome !== 'play') break
  }
  input.card = -1
  input.lane = undefined
  input.at = undefined
  input.recall = undefined
  input.hero = undefined
  input.callWave = undefined
  input.pick = undefined
  input.levelUp = undefined
  input.toggleDeck = undefined
  input.pickStage = undefined
  input.home = undefined
  if (sim.saveSeq !== savedSeq) {
    savedSeq = sim.saveSeq
    storeSave()
  }
  input.restart = false
  if (!sim.tutorial && !tutorialStored) {
    tutorialStored = true
    markTutorial()
  }
}

let last = performance.now()

function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  frameDts[frameI] = dt > 0 ? dt : 1 / 60
  frameI = (frameI + 1) % frameDts.length
  let sum = 0
  for (let i = 0; i < frameDts.length; i++) sum += frameDts[i] ?? 0
  fps = sum > 0 ? frameDts.length / sum : 60
  const hook = window.__shiba
  if (hook) hook.fps = fps
  if (renderer.hitstop > 0) {
    renderer.hitstop -= dt
    if (renderer.hitstop < 0) renderer.hitstop = 0
  } else {
    advance(dt)
  }
  renderer.fast = fast
  renderer.muted = synth.isMuted()
  if (sim.heroUsed && !heroSaved) {
    heroSaved = true
    try {
      localStorage.setItem(HERO_KEY, '1')
    } catch {
      // Ignore: the hint comes back next visit.
    }
  }
  syncViewport()
  draw(ctx, renderer, sim, viewW, viewH, dpr, insets)
  requestAnimationFrame(frame)
}

window.addEventListener('resize', syncViewport)
window.addEventListener('orientationchange', syncViewport)
window.visualViewport?.addEventListener('resize', syncViewport)
window.visualViewport?.addEventListener('scroll', syncViewport)
document.addEventListener('touchmove', blockScroll, { passive: false })
document.addEventListener('gesturestart', blockScroll)
syncViewport()
requestAnimationFrame(frame)
