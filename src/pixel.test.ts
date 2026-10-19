import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  boneArt,
  castleDim,
  castleLive,
  dogArt,
  crowdArt,
  heroArt,
  homeArt,
  bossArt,
  bossDarkArt,
  pawArt,
  type Seal,
} from './art'
import { BANNER_POP, BANNER_REST, CLEAR_WORD, GLYPHS, letterBit, LOSE_WORD, POP_COL, POP_ROW, RUMBLE_WORD, SPECIAL_WORDS } from './font'
import {
  BOSS_H,
  BOSS_W,
  HOME_H,
  HOME_W,
  BOSS_PX,
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
import { fitView } from './render'

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
  it('keeps the closed palette and no other rendered color', () => {
    expect(PALETTE).toHaveLength(29)
    expect(new Set(PALETTE).size).toBe(PALETTE.length)
    const allowed = new Set<string>(PALETTE)
    const paths = [
      ...filesIn(join(root, 'src')).filter((path) => path.endsWith('.ts')),
      join(root, 'index.html'),
      join(root, 'AGENTS.md'),
    ]
    const banned = /rgba?\(|hsla?\(|globalAlpha|createLinearGradient|createRadialGradient|\.arc\(/
    // hd.ts is the 2D-HD finishing pass on the display canvas: the one file allowed gradients and translucency.
    for (const path of paths.filter((p) => !p.endsWith('hd.ts'))) {
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

describe('viewport', () => {
  it('covers phone sizes with an integer scale and no gap', () => {
    const phones = [
      { w: 390, h: 844, scale: 2, iw: 195, ih: 422 },
      { w: 375, h: 667, scale: 2, iw: 188, ih: 334 },
      { w: 430, h: 932, scale: 2, iw: 215, ih: 466 },
      { w: 360, h: 800, scale: 2, iw: 180, ih: 400 },
    ]
    for (const phone of phones) {
      const fit = fitView(phone.w, phone.h)
      expect(fit.scale, `${phone.w}x${phone.h}`).toBe(phone.scale)
      expect(fit.internalW).toBe(phone.iw)
      expect(fit.internalH).toBe(phone.ih)
      expect(Number.isInteger(fit.scale)).toBe(true)
      expect(fit.internalW * fit.scale).toBeGreaterThanOrEqual(phone.w)
      expect(fit.internalH * fit.scale).toBeGreaterThanOrEqual(phone.h)
      expect(fit.internalW * fit.scale - phone.w).toBeLessThan(fit.scale)
      expect(fit.internalH * fit.scale - phone.h).toBeLessThan(fit.scale)
    }
  })

  it('grows an odd viewport instead of leaving a bar', () => {
    const fit = fitView(393, 852)
    expect(fit.scale).toBe(2)
    expect(fit.internalW).toBe(197)
    expect(fit.internalH).toBe(426)
    expect(fit.internalW * fit.scale).toBeGreaterThanOrEqual(393)
    expect(fit.internalH * fit.scale).toBeGreaterThanOrEqual(852)
    expect(fit.internalW * fit.scale - 393).toBeLessThan(fit.scale)
  })

  it('stays at scale 2 on a short phone and steps up only to keep the width band', () => {
    const short = fitView(360, 640)
    expect(short.scale).toBeGreaterThanOrEqual(2)
    expect(short.scale).toBe(2)
    expect(short.internalW).toBe(180)
    expect(short.internalH).toBe(320)
    const wide = fitView(540, 960)
    expect(wide.scale).toBe(3)
    expect(wide.internalW).toBe(180)
    expect(wide.internalH).toBe(320)
    expect(wide.internalW).toBeGreaterThanOrEqual(180)
    expect(wide.internalW).toBeLessThanOrEqual(215)
  })
})

describe('sprites', () => {
  it('uses the pixel-standard sizes and a 1px outline', () => {
    expect(INTERNAL_W * 2).toBe(VIEW_W)
    expect(INTERNAL_H * 2).toBe(VIEW_H)
    expect(CROWD_PX).toBe(20)
    expect(CAT_PX).toBe(20)
    expect(crowdArt).toHaveLength(7)
    expect(dogArt).toHaveLength(7)
    for (const strip of dogArt) expect(strip).toHaveLength(10)
    for (const fur of crowdArt) {
      expect(fur).toHaveLength(10)
      for (const seal of fur) assertSealed(seal, CROWD_PX, CROWD_PX)
    }
    for (const strip of dogArt) for (const seal of strip) assertSealed(seal, CAT_PX, CAT_PX)
    expect(heroArt).toHaveLength(22)
    for (const seal of heroArt) assertSealed(seal, HERO_PX, HERO_PX)
    assertSealed(boneArt, 12, 12)
    assertSealed(pawArt, 14, 16)
    assertSealed(castleLive, BOSS_W, BOSS_H)
    assertSealed(castleDim, BOSS_W, BOSS_H)
    assertSealed(homeArt, HOME_W, HOME_H)
    expect(bossArt).toHaveLength(2)
    for (const seal of [...bossArt, ...bossDarkArt]) assertSealed(seal, BOSS_PX, BOSS_PX)
    expect(BOSS_W).toBeGreaterThanOrEqual(40)
    expect(BOSS_H).toBeGreaterThanOrEqual(36)

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

  it('keeps the shiba read across all four coats', () => {
    const colorsOf = (seal: Seal | undefined): Set<string> => new Set((seal?.color ?? []).filter(Boolean))
    const [red, black, sesame, cream] = crowdArt.map((fur) => fur[0])
    for (const coat of [red, black, sesame, cream]) {
      const colors = colorsOf(coat)
      expect(colors.has('#fffaf0'), `${coat?.name} urajiro`).toBe(true)
      expect(colors.has('#ffb3cf'), `${coat?.name} smile`).toBe(true)
    }
    expect(colorsOf(black).has('#f6c27a'), 'まろ眉').toBe(true)
    expect(colorsOf(black).has('#2c3a63')).toBe(true)
    expect(colorsOf(sesame).has('#6b2e12')).toBe(true)
    expect(red?.color).not.toEqual(sesame?.color)
    expect(cream?.color).not.toEqual(red?.color)
    const shut = crowdArt[0]?.[6]
    const bark = crowdArt[0]?.[7]
    expect(shut?.color).not.toEqual(red?.color)
    expect(bark?.color).not.toEqual(shut?.color)
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

  it('pops the clear and lose banners from an integer 16×20 to 24×30', () => {
    expect(BANNER_POP).toBe(BANNER_REST * 1.5)
    expect(GLYPH_W * BANNER_REST).toBe(16)
    expect(GLYPH_H * BANNER_REST).toBe(20)
    expect(GLYPH_W * BANNER_POP).toBe(24)
    expect(GLYPH_H * BANNER_POP).toBe(30)
    for (const word of [CLEAR_WORD, LOSE_WORD, ...SPECIAL_WORDS, RUMBLE_WORD]) {
      expect(word.length).toBeGreaterThanOrEqual(3)
      for (const ch of word) {
        let on = 0
        for (let y = 0; y < GLYPH_H; y++) {
          for (let x = 0; x < GLYPH_W; x++) if (letterBit(ch, x, y)) on += 1
        }
        expect(on, ch).toBeGreaterThan(ch === 'ー' ? 8 : 10)
      }
    }
  })
})
