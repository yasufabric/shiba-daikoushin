import { createSynth } from './audio'
import {
  CARD_H,
  CARD_W,
  CARD_XS,
  CARD_Y,
  SPECIAL_NEED,
} from './balance'
import { createSim, fillMarch, NO_INPUT, step, type Input, type Outcome } from './sim'
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

const sim = createSim({ tutorial: !seenTutorial() })
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
    castle: number
    home: number
    outcome: Outcome
    tutorial: boolean
    floatDmg: number
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
        castle: sim.castleHp,
        home: sim.homeHp,
        outcome: sim.outcome,
        tutorial: sim.tutorial,
        floatDmg: sim.floatDmg,
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
  if (sim.outcome === 'won') {
    input.restart = true
    return
  }
  if (sim.outcome !== 'play') return
  for (let card = 0; card < CARD_XS.length; card++) {
    if (hitCard(p.x, p.y, CARD_XS[card] ?? 0)) input.card = card
  }
})

function playSounds(before: Outcome): void {
  if (sim.sfxDeploy === 1) synth.deploy()
  if (sim.sfxSpecial >= 0) {
    synth.special(sim.sfxSpecial)
    renderer.shakeUntil = sim.time + 0.25
  }
  sim.sfxDeploy = 0
  sim.sfxSpecial = -1
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
    playSounds(before)
    first = false
    left -= h
    steps += 1
    if (sim.outcome !== 'play') break
  }
  input.card = -1
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
