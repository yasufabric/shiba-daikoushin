import { createSynth } from './audio'
import {
  CANNON_R,
  CANNON_X,
  CANNON_Y,
  CARD_H,
  CARD_W,
  CARD_X0,
  CARD_X1,
  CARD_Y,
  VIEW_H,
  VIEW_W,
} from './balance'
import { cannonReady, createSim, fillMarch, NO_INPUT, step, type Input, type Outcome } from './sim'
import { createRenderer, draw } from './render'

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
const input: Input = { card: -1, cannon: false, restart: false }
const devOn = new URLSearchParams(location.search).has('dev')

let viewW = 1
let viewH = 1
let dpr = 1
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
  snapshot: () => {
    time: number
    shibas: number
    cats: number
    bones: number
    boss: boolean
    castle: number
    outcome: Outcome
    tutorial: boolean
    cannon: boolean
    beam: number
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
    snapshot() {
      return {
        time: sim.time,
        shibas: sim.aliveShibas,
        cats: sim.aliveCats,
        bones: sim.bones,
        boss: sim.boss,
        castle: sim.castleHp,
        outcome: sim.outcome,
        tutorial: sim.tutorial,
        cannon: cannonReady(sim),
        beam: sim.beam,
        floatDmg: sim.floatDmg,
      }
    },
  }
  window.__shiba = dev
}

function resize(): void {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  viewW = window.innerWidth
  viewH = window.innerHeight
  canvas.width = Math.max(1, Math.floor(viewW * dpr))
  canvas.height = Math.max(1, Math.floor(viewH * dpr))
}

function toLogical(ev: PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H)
  const ox = (rect.width - VIEW_W * scale) / 2
  const oy = (rect.height - VIEW_H * scale) / 2
  return {
    x: (ev.clientX - rect.left - ox) / scale,
    y: (ev.clientY - rect.top - oy) / scale,
  }
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
  const dx = p.x - CANNON_X
  const dy = p.y - CANNON_Y
  if (dx * dx + dy * dy <= (CANNON_R + 8) * (CANNON_R + 8)) {
    input.cannon = true
    return
  }
  if (hitCard(p.x, p.y, CARD_X0)) input.card = 0
  else if (hitCard(p.x, p.y, CARD_X1)) input.card = 1
})

function playSounds(before: Outcome): void {
  if (sim.sfxDeploy === 1) synth.deploy()
  if (sim.sfxCannon === 1) synth.cannon()
  sim.sfxDeploy = 0
  sim.sfxCannon = 0
  if (sim.outcome !== before && sim.outcome !== 'play') synth.fanfare(sim.outcome === 'won')
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
  input.cannon = false
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
  advance(dt)
  draw(ctx, renderer, sim, viewW, viewH, dpr)
  requestAnimationFrame(frame)
}

window.addEventListener('resize', resize)
resize()
requestAnimationFrame(frame)
