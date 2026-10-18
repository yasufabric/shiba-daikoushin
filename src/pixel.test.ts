import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  boneArt,
  castleDim,
  castleLive,
  catArt,
  crowdTan,
  crowdWhite,
  heroArt,
  pawArt,
  type Seal,
} from './art'
import { GLYPHS, POP_COL, POP_ROW } from './font'
import {
  BOSS_H,
  BOSS_W,
  CAT_PX,
  CROWD_PX,
  GLYPH_H,
  GLYPH_W,
  HERO_PX,
  INTERNAL_H,
  INTERNAL_W,
  LINE,
  PALETTE,
} from './palette'
import { VIEW_H, VIEW_W } from './balance'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function filesIn(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...filesIn(path))
    else found.push(path)
  }
  return found
}

function expandHex(token: string): string {
  const hex = token.slice(1).toLowerCase()
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }
  return `#${hex}`
}

function assertSealed(seal: Seal, w: number, h: number): void {
  expect(seal.w, seal.name).toBe(w)
  expect(seal.h, seal.name).toBe(h)
  expect(seal.color.length, seal.name).toBe(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const color = seal.color[y * w + x] ?? ''
      if (!color) continue
      expect(PALETTE, `${seal.name} ${color}`).toContain(color)
      let edge = false
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true
      if (x > 0 && !(seal.color[y * w + x - 1] ?? '')) edge = true
      if (x + 1 < w && !(seal.color[y * w + x + 1] ?? '')) edge = true
      if (y > 0 && !(seal.color[(y - 1) * w + x] ?? '')) edge = true
      if (y + 1 < h && !(seal.color[(y + 1) * w + x] ?? '')) edge = true
      if (edge) expect(color, `${seal.name} edge ${x},${y}`).toBe(LINE)
      else expect(color, `${seal.name} inner ${x},${y}`).not.toBe(LINE)
    }
  }
}

describe('palette', () => {
  it('keeps the 24-color set and no other rendered color', () => {
    expect(PALETTE).toHaveLength(23)
    expect(new Set(PALETTE).size).toBe(PALETTE.length)
    const allowed = new Set<string>(PALETTE)
    const paths = [
      ...filesIn(join(root, 'src')).filter((path) => path.endsWith('.ts')),
      join(root, 'index.html'),
      join(root, 'AGENTS.md'),
    ]
    const banned = /rgba?\(|hsla?\(|globalAlpha|createLinearGradient|createRadialGradient|\.arc\(/
    for (const path of paths) {
      const text = readFileSync(path, 'utf8')
      if (!path.endsWith('.test.ts') && (path.endsWith('.ts') || path.endsWith('.html'))) {
        expect(text, path).not.toMatch(banned)
      }
      const found = text.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
      for (const token of found) {
        const hex = expandHex(token)
        expect(hex.length, token).toBe(7)
        expect(allowed.has(hex), `${path} ${token}`).toBe(true)
      }
    }
  })
})

describe('sprites', () => {
  it('uses the pixel-standard sizes and a 1px outline', () => {
    expect(INTERNAL_W * 2).toBe(VIEW_W)
    expect(INTERNAL_H * 2).toBe(VIEW_H)
    expect(crowdTan).toHaveLength(10)
    expect(crowdWhite).toHaveLength(10)
    expect(catArt).toHaveLength(10)
    for (const seal of crowdTan) assertSealed(seal, CROWD_PX, CROWD_PX)
    for (const seal of crowdWhite) assertSealed(seal, CROWD_PX, CROWD_PX)
    for (const seal of catArt) assertSealed(seal, CAT_PX, CAT_PX)
    for (const seal of heroArt) assertSealed(seal, HERO_PX, HERO_PX)
    assertSealed(boneArt, 12, 12)
    assertSealed(pawArt, 14, 16)
    assertSealed(castleLive, BOSS_W, BOSS_H)
    assertSealed(castleDim, BOSS_W, BOSS_H)
    expect(BOSS_W).toBeGreaterThanOrEqual(64)
    expect(BOSS_H).toBeGreaterThanOrEqual(64)

    const hero = heroArt[0]
    expect(hero).toBeDefined()
    if (!hero) return
    let head = 0
    let body = 0
    for (let y = 0; y < HERO_PX; y++) {
      for (let x = 0; x < HERO_PX; x++) {
        if (!(hero.color[y * HERO_PX + x] ?? '')) continue
        if (y < HERO_PX / 2) head += 1
        else body += 1
      }
    }
    expect(head).toBeGreaterThan(80)
    expect(body).toBeGreaterThan(80)
    expect(head / body).toBeGreaterThan(0.75)
    expect(head / body).toBeLessThan(1.35)
  })

  it('pops damage glyphs from 8×10 to an integer 12×15', () => {
    expect(GLYPHS).toHaveLength(10)
    for (const glyph of GLYPHS) {
      expect(glyph).toHaveLength(GLYPH_H)
      for (const row of glyph) expect(row).toBeLessThan(1 << GLYPH_W)
    }
    expect(POP_COL).toHaveLength(GLYPH_W)
    expect(POP_ROW).toHaveLength(GLYPH_H)
    expect(POP_COL.reduce((sum, n) => sum + n, 0)).toBe(12)
    expect(POP_ROW.reduce((sum, n) => sum + n, 0)).toBe(15)
    expect(GLYPH_W * 1.5).toBe(12)
    expect(GLYPH_H * 1.5).toBe(15)
  })
})
