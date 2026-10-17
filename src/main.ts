import { createSim, step } from './sim'

const canvasEl = document.querySelector<HTMLCanvasElement>('#game')
if (!canvasEl) throw new Error('canvas unavailable')
const canvas: HTMLCanvasElement = canvasEl
const context = canvas.getContext('2d')
if (!context) throw new Error('2d context unavailable')
const ctx: CanvasRenderingContext2D = context

const sim = createSim()
let viewW = 1
let viewH = 1

function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  viewW = window.innerWidth
  viewH = window.innerHeight
  canvas.width = Math.max(1, Math.floor(viewW * dpr))
  canvas.height = Math.max(1, Math.floor(viewH * dpr))
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
}

function draw(): void {
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#2a1440'
  ctx.fillRect(0, 0, viewW, viewH * 0.42)
  ctx.fillStyle = '#c45a3a'
  ctx.fillRect(0, viewH * 0.42, viewW, viewH * 0.16)
  ctx.fillStyle = '#3a2418'
  ctx.fillRect(0, viewH * 0.58, viewW, viewH * 0.42)
}

let last = performance.now()

function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  step(sim, dt)
  draw()
  requestAnimationFrame(frame)
}

window.addEventListener('resize', resize)
resize()
requestAnimationFrame(frame)
