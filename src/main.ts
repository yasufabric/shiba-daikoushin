import { createSynth } from './audio'
import {
  CARD_H,
  CARD_W,
  CARD_XS,
  CARD_Y,
  FIELD_H,
  FIELD_W,
  FIELD_X,
  FIELD_Y,
  LANE_COUNT,
  SHOP_ROW_GAP,
  SHOP_ROW_H,
  SHOP_ROW_W,
  SHOP_ROW_X,
  SHOP_ROW_Y0,
  START_H,
  START_W,
  START_X,
  START_Y,
  SPECIAL_NEED,
} from './balance'
import { createSim, dogsLeft, fillMarch, NO_INPUT, step, type Input, type Outcome } from './sim'
import { createRenderer, draw, screenToWorld, type ScreenInsets } from './render'

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
}

function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    const { levels, purse } = data as Partial<Save>
    if (!Array.isArray(levels) || typeof purse !== 'number') return null
    return { levels: levels.map((n) => (typeof n === 'number' ? n : 1)), purse }
  } catch {
    return null
  }
}

function storeSave(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ levels: sim.levels, purse: sim.purse }))
  } catch {
    // Private mode can reject storage. Levels still hold for this visit.
  }
}

const saved = loadSave()
const sim = createSim({ tutorial: !seenTutorial(), levels: saved?.levels, purse: saved?.purse })
let savedSeq = sim.saveSeq
const renderer = createRenderer()
const synth = createSynth()
const input: Input = { card: -1, restart: false }
const devOn = new URLSearchParams(location.search).has('dev')

let viewW = 1
let viewH = 1
let dpr = 1
let placedW = 0
let placedH = 0
let placedTop = -1
let placedLeft = -1
const insets: ScreenInsets = { top: 0, right: 0, bottom: 0, left: 0 }
let timeScale = 1
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
  return screenToWorld(ev.clientX, ev.clientY, rect.left, rect.top)
}

function hitCard(x: number, y: number, cardX: number): boolean {
  return x >= cardX && x <= cardX + CARD_W && y >= CARD_Y && y <= CARD_Y + CARD_H
}

canvas.addEventListener('pointerdown', (ev) => {
  ev.preventDefault()
  synth.unlock()
  const p = toLogical(ev)
  if (sim.outcome !== 'play') {
    if (sim.rewardT > 0) return
    if (p.x >= START_X && p.x <= START_X + START_W && p.y >= START_Y && p.y <= START_Y + START_H) {
      input.restart = true
      return
    }
    for (let kind = 0; kind < sim.levels.length; kind++) {
      const top = SHOP_ROW_Y0 + kind * (SHOP_ROW_H + SHOP_ROW_GAP)
      if (p.x >= SHOP_ROW_X && p.x <= SHOP_ROW_X + SHOP_ROW_W && p.y >= top && p.y <= top + SHOP_ROW_H) {
        input.levelUp = kind
        return
      }
    }
    return
  }
  for (let card = 0; card < CARD_XS.length; card++) {
    if (hitCard(p.x, p.y, CARD_XS[card] ?? 0)) {
      input.pick = card
      return
    }
  }
  const lane = laneAt(p.x, p.y)
  if (lane >= 0) {
    // A pick tapped this same frame has not reached the sim yet, so it wins over sim.picked.
    input.card = input.pick ?? sim.picked
    input.lane = lane
  }
})

/** The path under a field tap, or -1 off the field. */
function laneAt(x: number, y: number): number {
  if (y < FIELD_Y || y > FIELD_Y + FIELD_H) return -1
  const fx = x - FIELD_X
  if (fx < 0 || fx > FIELD_W) return -1
  return Math.min(LANE_COUNT - 1, Math.floor((fx * LANE_COUNT) / FIELD_W))
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
    if (sim.outcome === 'won') {
      renderer.hitstop = 0.05
      renderer.shakeUntil = sim.time + 0.2
    }
  }
}

function advance(dt: number): void {
  const budget = Math.min(dt * timeScale, 0.8)
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
    first = false
    left -= h
    steps += 1
    if (sim.outcome !== 'play') break
  }
  input.card = -1
  input.lane = undefined
  input.pick = undefined
  input.levelUp = undefined
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
