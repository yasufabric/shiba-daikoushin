import {
  boneArt,
  castleDim,
  castleLive,
  catArt,
  crowdArt,
  heroArt,
  homeArt,
  pawArt,
  rot90,
  type Seal,
} from './art'
import { CAT_PX, CROWD_PX, HERO_PX, WHITE } from './palette'

export interface Sheets {
  crowd: HTMLCanvasElement
  crowdFlash: HTMLCanvasElement
  cat: HTMLCanvasElement
  catFlash: HTMLCanvasElement
  hero: HTMLCanvasElement
  bone: HTMLCanvasElement
  paw: HTMLCanvasElement
  castle: HTMLCanvasElement
  castleDim: HTMLCanvasElement
  home: HTMLCanvasElement
}

function canvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  const ctx = el.getContext('2d')
  if (!ctx) throw new Error('spritesheet unavailable')
  ctx.imageSmoothingEnabled = false
  return { canvas: el, ctx }
}

function blit(ctx: CanvasRenderingContext2D, seal: Seal, dx: number, dy: number, flash: boolean): void {
  const { w, color } = seal
  for (let i = 0; i < color.length; i++) {
    const hex = color[i]
    if (!hex) continue
    ctx.fillStyle = flash ? WHITE : hex
    ctx.fillRect(dx + (i % w), dy + ((i / w) | 0), 1, 1)
  }
}

function spins(seal: Seal): Seal[] {
  const a = rot90(seal)
  const b = rot90(a)
  const c = rot90(b)
  return [seal, a, b, c]
}

function bakeStrip(
  frames: readonly Seal[],
  kinds: number,
  cell: number,
  flash: boolean,
): HTMLCanvasElement {
  const { canvas: el, ctx } = canvas(frames.length * cell, kinds * 4 * cell)
  for (let kind = 0; kind < kinds; kind++) {
    for (let frame = 0; frame < frames.length; frame++) {
      const seal = frames[frame]
      if (!seal) continue
      const turned = spins(seal)
      for (let spin = 0; spin < 4; spin++) {
        const part = turned[spin]
        if (!part) continue
        blit(ctx, part, frame * cell, (kind * 4 + spin) * cell, flash)
      }
    }
  }
  return el
}

function bakeOne(seal: Seal): HTMLCanvasElement {
  const { canvas: el, ctx } = canvas(seal.w, seal.h)
  blit(ctx, seal, 0, 0, false)
  return el
}

export function createSheets(): Sheets {
  const furs = crowdArt.length
  const crowdFrames = crowdArt[0]?.length ?? 0
  const { canvas: crowd, ctx: crowdCtx } = canvas(crowdFrames * CROWD_PX, furs * 4 * CROWD_PX)
  const { canvas: crowdFlash, ctx: flashCtx } = canvas(crowdFrames * CROWD_PX, furs * 4 * CROWD_PX)
  for (let fur = 0; fur < furs; fur++) {
    const frames = crowdArt[fur] ?? []
    for (let frame = 0; frame < frames.length; frame++) {
      const seal = frames[frame]
      if (!seal) continue
      const turned = spins(seal)
      for (let spin = 0; spin < 4; spin++) {
        const part = turned[spin]
        if (!part) continue
        const y = (fur * 4 + spin) * CROWD_PX
        blit(crowdCtx, part, frame * CROWD_PX, y, false)
        blit(flashCtx, part, frame * CROWD_PX, y, true)
      }
    }
  }
  const { canvas: hero, ctx: heroCtx } = canvas(heroArt.length * HERO_PX, HERO_PX)
  for (let i = 0; i < heroArt.length; i++) {
    const seal = heroArt[i]
    if (seal) blit(heroCtx, seal, i * HERO_PX, 0, false)
  }
  return {
    crowd,
    crowdFlash,
    cat: bakeStrip(catArt, 1, CAT_PX, false),
    catFlash: bakeStrip(catArt, 1, CAT_PX, true),
    hero,
    bone: bakeOne(boneArt),
    paw: bakeOne(pawArt),
    castle: bakeOne(castleLive),
    castleDim: bakeOne(castleDim),
    home: bakeOne(homeArt),
  }
}
