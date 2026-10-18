import {
  BOSS_H,
  BOSS_W,
  CAT_BODY,
  CAT_DARK,
  CAT_LIGHT,
  CAT_MID,
  CAT_PX,
  DANGER,
  DANGER_LIGHT,
  FUR_BODY,
  FUR_DARK,
  FUR_LIGHT,
  FUR_MID,
  GOLD,
  GOLD_DARK,
  GOLD_HOT,
  GOLD_LIGHT,
  HERO_PX,
  LINE,
  NIGHT,
  WHITE,
  WHITE_DARK,
  WHITE_MID,
} from './palette'

export interface Seal {
  name: string
  w: number
  h: number
  color: readonly string[]
}

const N4X = [1, -1, 0, 0] as const
const N4Y = [0, 0, 1, -1] as const

function blank(w: number, h: number): string[] {
  const rows: string[] = []
  const empty = '.'.repeat(w)
  for (let y = 0; y < h; y++) rows.push(empty)
  return rows
}

function put(rows: string[], x: number, y: number, ch: string): void {
  const row = rows[y]
  if (!row || x < 0 || x >= row.length) return
  rows[y] = row.slice(0, x) + ch + row.slice(x + 1)
}

function blot(rows: string[], x: number, y: number, w: number, h: number, ch: string): void {
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) put(rows, x + xx, y + yy, ch)
  }
}

function tri(rows: string[], x: number, y: number, w: number, h: number, ch: string): void {
  for (let row = 0; row < h; row++) {
    const span = 1 + Math.floor(((w - 1) * row) / Math.max(1, h - 1))
    const left = x + Math.floor((w - span) / 2)
    for (let i = 0; i < span; i++) put(rows, left + i, y + row, ch)
  }
}

function shave(rows: string[], x: number, y: number, w: number, h: number, r: number): void {
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < r - 1 - i; j++) {
      put(rows, x + j, y + i, '.')
      put(rows, x + w - 1 - j, y + i, '.')
      put(rows, x + j, y + h - 1 - i, '.')
      put(rows, x + w - 1 - j, y + h - 1 - i, '.')
    }
  }
}

export function seal(name: string, rows: readonly string[], map: Record<string, string>): Seal {
  const h = rows.length
  const w = rows[0]?.length ?? 0
  const filled = new Uint8Array(w * h)
  const color = new Array<string>(w * h).fill('')
  for (let y = 0; y < h; y++) {
    const row = rows[y] ?? ''
    if (row.length !== w) throw new Error(`${name} row ${y} is ${row.length} wide`)
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? '.'
      if (ch === '.') continue
      const hex = map[ch]
      if (!hex) throw new Error(`${name} has no color for '${ch}'`)
      const i = y * w + x
      filled[i] = 1
      color[i] = hex
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!filled[i]) continue
      let friends = 0
      let edge = false
      for (let k = 0; k < 4; k++) {
        const nx = x + (N4X[k] ?? 0)
        const ny = y + (N4Y[k] ?? 0)
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || !filled[ny * w + nx]) edge = true
        else friends += 1
      }
      if (friends === 0) throw new Error(`${name} isolated pixel ${x},${y}`)
      if (edge) color[i] = LINE
    }
  }
  return { name, w, h, color }
}

export function rot90(src: Seal): Seal {
  const { w, h } = src
  const color = new Array<string>(w * h).fill('')
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = h - 1 - y
      const ny = x
      color[ny * w + nx] = src.color[y * w + x] ?? ''
    }
  }
  return { name: src.name, w, h, color }
}

const TAN: Record<string, string> = {
  d: FUR_DARK,
  m: FUR_MID,
  b: FUR_BODY,
  h: FUR_LIGHT,
  w: WHITE,
  n: FUR_DARK,
  g: GOLD,
  o: FUR_BODY,
  s: FUR_MID,
}

const CREAM: Record<string, string> = {
  d: WHITE_DARK,
  m: WHITE_MID,
  b: WHITE_MID,
  h: WHITE,
  w: WHITE,
  n: FUR_DARK,
  g: GOLD,
  o: FUR_BODY,
  s: FUR_MID,
}

const CAT: Record<string, string> = {
  d: CAT_DARK,
  m: CAT_MID,
  b: CAT_BODY,
  h: CAT_LIGHT,
  p: DANGER_LIGHT,
  e: DANGER,
  w: WHITE,
  n: NIGHT,
}

const BONE_MAP: Record<string, string> = {
  d: GOLD_DARK,
  m: GOLD,
  h: GOLD_LIGHT,
  w: GOLD_HOT,
}

const CASTLE_MAP: Record<string, string> = {
  d: CAT_DARK,
  m: CAT_MID,
  b: CAT_BODY,
  h: CAT_LIGHT,
  p: DANGER_LIGHT,
  e: DANGER,
  g: GOLD_LIGHT,
  n: NIGHT,
}

/** Front-facing shiba. Rows 0–13 stay put so the face and curl survive the walk. */
const CROWD_BODY = [
  '...o.....s......',
  '..ooo...sss.....',
  '.oohoo..ssss....',
  'oohhhobssssss...',
  'bbbbbbbbbbbbbbb.',
  'bbbnnwwwwwnnbb..',
  'bbbnnwnnnwnnbb..',
  'bbhwwwwnnwwwwb..',
  '.bbwwwhhhwwwwb..',
  '.bbbwwwwwwwwbb..',
  '.bbbbbwwssss....',
  '.bbbbbhswwss....',
  '.bbbbbbsswws....',
  '.bbbbbbbbsss....',
  '.bbbbbbbb.......',
] as const

const CROWD_FEET = [
  '..bb...bb.......',
  '.....bb.........',
  '..bb....b.......',
  '..b.....bb......',
  '..bb..b.........',
  '..b...bb........',
  'bb.....bb.......',
  '..bbbb.bb.......',
  '..bb...bb.......',
  '..bb....b.......',
] as const

const CROWD_ROWS: readonly (readonly string[])[] = CROWD_FEET.map((feet) => [...CROWD_BODY, feet])

function catBase(blink: boolean): string[] {
  const g = blank(CAT_PX, CAT_PX)
  blot(g, 3, 1, 7, 8, 'b')
  blot(g, 14, 1, 7, 8, 'b')
  shave(g, 3, 1, 7, 8, 2)
  shave(g, 14, 1, 7, 8, 2)
  blot(g, 5, 3, 3, 4, 'p')
  blot(g, 16, 3, 3, 4, 'p')
  blot(g, 4, 6, 16, 10, 'b')
  shave(g, 4, 6, 16, 10, 2)
  blot(g, 5, 7, 7, 4, 'h')
  blot(g, 14, 10, 5, 4, 'm')
  if (blink) {
    blot(g, 7, 11, 4, 2, 'd')
    blot(g, 13, 11, 4, 2, 'd')
  } else {
    blot(g, 7, 10, 4, 4, 'd')
    blot(g, 13, 10, 4, 4, 'd')
    blot(g, 8, 11, 2, 2, 'w')
    blot(g, 14, 11, 2, 2, 'w')
  }
  blot(g, 11, 14, 2, 2, 'e')
  blot(g, 6, 15, 12, 5, 'b')
  blot(g, 6, 15, 5, 3, 'h')
  blot(g, 13, 17, 5, 3, 'm')
  return g
}

function catFrame(index: number): string[] {
  const blink = index === 5
  const g = catBase(blink)
  if (index === 0) {
    blot(g, 4, 19, 5, 4, 'm')
    blot(g, 15, 18, 5, 3, 'd')
  } else if (index === 1) {
    blot(g, 5, 19, 4, 3, 'm')
    blot(g, 15, 19, 4, 3, 'd')
  } else if (index === 2) {
    blot(g, 4, 18, 5, 3, 'm')
    blot(g, 15, 19, 5, 4, 'd')
  } else if (index === 3) {
    blot(g, 5, 20, 4, 3, 'm')
    blot(g, 15, 20, 4, 3, 'd')
  } else if (index === 4 || index === 5) {
    blot(g, 5, 19, 4, 3, 'm')
    blot(g, 15, 19, 4, 3, 'd')
  } else if (index === 6) {
    blot(g, 6, 20, 5, 3, 'm')
    blot(g, 14, 20, 5, 3, 'd')
  } else if (index === 7) {
    blot(g, 0, 16, 7, 3, 'b')
    blot(g, 0, 17, 4, 2, 'h')
    blot(g, 15, 19, 5, 3, 'd')
  } else if (index === 8) {
    blot(g, 2, 17, 5, 3, 'm')
    blot(g, 15, 19, 4, 3, 'd')
  } else {
    blot(g, 4, 18, 5, 3, 'm')
    blot(g, 15, 19, 4, 3, 'd')
  }
  return g
}

function hero(blink: boolean, reward: boolean): string[] {
  const g = blank(HERO_PX, HERO_PX)
  tri(g, 3, 0, 11, 10, 'o')
  tri(g, 18, 0, 11, 10, 's')
  tri(g, 5, 3, 7, 6, 'h')
  tri(g, 20, 4, 7, 5, 'm')
  blot(g, 4, 7, 24, 16, 'b')
  blot(g, 6, 8, 8, 5, 'h')
  blot(g, 18, 10, 8, 5, 'm')
  blot(g, 7, 12, 18, 10, 'w')
  if (blink) {
    blot(g, 9, 15, 5, 2, 'n')
    blot(g, 18, 15, 5, 2, 'n')
  } else {
    blot(g, 9, 14, 5, 4, 'n')
    blot(g, 18, 14, 5, 4, 'n')
    put(g, 10, 15, 'w')
    put(g, 19, 15, 'w')
  }
  blot(g, 14, 18, 4, 3, 'n')
  blot(g, 8, 22, 14, 6, 'b')
  blot(g, 10, 22, 8, 5, 'w')
  blot(g, 17, 23, 4, 4, 'm')
  if (reward) blot(g, 9, 21, 12, 2, 'g')
  const tail = ['..oooooo', '.owwwwwo', 'owwhwwwo', 'owwhwwso', 'owwwwsso', 'ooosssso', '.osssoo.', '..ssso..']
  for (let row = 0; row < tail.length; row++) {
    const line = tail[row] ?? ''
    for (let col = 0; col < line.length; col++) {
      const ch = line[col] ?? '.'
      if (ch !== '.') put(g, 22 + col, 21 + row, ch)
    }
  }
  blot(g, 10, 28, 4, 3, 'm')
  blot(g, 16, 28, 4, 3, 'b')
  return g
}

function boneRows(): string[] {
  const g = blank(12, 12)
  blot(g, 1, 1, 3, 3, 'h')
  blot(g, 8, 1, 3, 3, 'h')
  blot(g, 2, 2, 1, 1, 'w')
  blot(g, 9, 2, 1, 1, 'w')
  blot(g, 3, 3, 6, 2, 'm')
  blot(g, 4, 4, 4, 4, 'h')
  blot(g, 5, 5, 2, 2, 'w')
  blot(g, 3, 7, 6, 2, 'm')
  blot(g, 1, 8, 3, 3, 'h')
  blot(g, 8, 8, 3, 3, 'h')
  blot(g, 2, 9, 1, 1, 'd')
  blot(g, 9, 9, 1, 1, 'd')
  return g
}

function pawRows(): string[] {
  const g = blank(14, 16)
  blot(g, 2, 0, 10, 8, 'b')
  shave(g, 2, 0, 10, 8, 2)
  blot(g, 3, 1, 4, 3, 'h')
  blot(g, 4, 6, 6, 3, 'm')
  blot(g, 3, 8, 3, 6, 'b')
  blot(g, 8, 8, 3, 6, 'm')
  blot(g, 4, 13, 2, 3, 'd')
  blot(g, 8, 13, 2, 3, 'd')
  return g
}

function castleRows(live: boolean): string[] {
  const g = blank(BOSS_W, BOSS_H)
  const stone = live ? 'b' : 'm'
  const shade = live ? 'm' : 'd'
  const hi = live ? 'h' : 'b'
  const ear = 'p'
  const banner = live ? 'e' : 'p'
  blot(g, 8, 0, 12, 16, stone)
  blot(g, 52, 0, 12, 16, stone)
  shave(g, 8, 0, 12, 16, 4)
  shave(g, 52, 0, 12, 16, 4)
  blot(g, 12, 4, 4, 7, ear)
  blot(g, 56, 4, 4, 7, ear)
  blot(g, 6, 12, 16, 50, shade)
  blot(g, 50, 12, 16, 50, shade)
  blot(g, 8, 14, 6, 18, hi)
  blot(g, 18, 30, 36, 32, stone)
  blot(g, 20, 32, 10, 12, hi)
  for (let x = 22; x <= 46; x += 8) blot(g, x, 24, 4, 8, shade)
  blot(g, 30, 42, 12, 20, 'n')
  blot(g, 10, 34, 6, 8, 'n')
  blot(g, 56, 34, 6, 8, 'n')
  blot(g, 22, 36, 3, 12, banner)
  blot(g, 47, 36, 3, 12, banner)
  if (live) {
    blot(g, 11, 36, 4, 4, 'g')
    blot(g, 57, 36, 4, 4, 'g')
  }
  return g
}

function sealAll(name: string, frames: readonly (readonly string[])[], map: Record<string, string>): Seal[] {
  return frames.map((rows, i) => seal(`${name}-${i}`, rows, map))
}

export const crowdTan = sealAll('crowd-tan', CROWD_ROWS, TAN)
export const crowdWhite = sealAll('crowd-white', CROWD_ROWS, CREAM)

const catRows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => catFrame(i))
export const catArt = catRows.map((rows, i) => seal(`cat-${i}`, rows, CAT))

export const heroArt = [
  seal('hero-tan', hero(false, false), TAN),
  seal('hero-tan-blink', hero(true, false), TAN),
  seal('hero-white', hero(false, false), CREAM),
  seal('hero-white-blink', hero(true, false), CREAM),
  seal('hero-reward', hero(false, true), TAN),
]

export const boneArt = seal('bone', boneRows(), BONE_MAP)
export const pawArt = seal('paw', pawRows(), TAN)
export const castleLive = seal('castle', castleRows(true), CASTLE_MAP)
export const castleDim = seal('castle-dim', castleRows(false), CASTLE_MAP)

export const CROWD_FRAME_COUNT = CROWD_ROWS.length
export const CAT_FRAME_COUNT = catRows.length
