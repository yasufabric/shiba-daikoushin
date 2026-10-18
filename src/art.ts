import {
  BOSS_H,
  BOSS_W,
  CAT_BODY,
  CAT_DARK,
  CAT_LIGHT,
  CAT_MID,
  CAT_PX,
  DANGER,
  DANGER_DARK,
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
  NIGHT_1,
  NIGHT_2,
  NIGHT_3,
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

/** Shared letters: L outline (inner L stays the darkest fur), o fur, h lit fur, m shade, w urajiro white, c curl cream, e brow, s sesame tip, k eye, x eye highlight, n nose, p tongue. */
const RED: Record<string, string> = {
  L: FUR_DARK,
  o: FUR_BODY,
  h: FUR_LIGHT,
  m: FUR_MID,
  w: WHITE,
  c: FUR_LIGHT,
  e: FUR_LIGHT,
  s: FUR_BODY,
  k: FUR_DARK,
  x: WHITE,
  n: FUR_DARK,
  p: DANGER_LIGHT,
  g: GOLD_LIGHT,
  G: GOLD,
  t: WHITE_MID,
  T: WHITE_DARK,
  u: WHITE,
  q: WHITE_DARK,
}

/** 黒柴: night fur, tan まろ眉 and tan curl underside, white urajiro. */
const BLACK: Record<string, string> = {
  ...RED,
  L: NIGHT,
  o: NIGHT_2,
  h: NIGHT_3,
  m: NIGHT_1,
  c: FUR_LIGHT,
  e: FUR_LIGHT,
  s: NIGHT_2,
  k: NIGHT,
  q: GOLD,
}

/** 胡麻柴: red fur with dark tips on the crown and back. */
const SESAME: Record<string, string> = {
  ...RED,
  s: FUR_DARK,
}

/** 白柴: cream fur. Ears and curl keep an orange shade. */
const CREAM: Record<string, string> = {
  ...RED,
  L: FUR_MID,
  o: FUR_LIGHT,
  h: WHITE,
  m: FUR_BODY,
  c: WHITE,
  e: WHITE,
  s: FUR_LIGHT,
  q: DANGER,
}

export const FUR_RED = 0
export const FUR_BLACK = 1
export const FUR_SESAME = 2
export const FUR_CREAM = 3
const FUR_MAPS = [RED, BLACK, SESAME, CREAM] as const

const CAT: Record<string, string> = {
  L: CAT_DARK,
  d: CAT_DARK,
  m: CAT_MID,
  b: CAT_BODY,
  h: CAT_LIGHT,
  p: DANGER_LIGHT,
  e: DANGER,
  r: DANGER_DARK,
  w: WHITE,
  n: NIGHT,
}

const BONE_MAP: Record<string, string> = {
  L: GOLD_DARK,
  d: GOLD_DARK,
  m: GOLD,
  h: GOLD_LIGHT,
  w: GOLD_HOT,
}

const CASTLE_MAP: Record<string, string> = {
  L: CAT_DARK,
  d: CAT_DARK,
  m: CAT_MID,
  b: CAT_BODY,
  h: CAT_LIGHT,
  p: DANGER_LIGHT,
  e: DANGER,
  r: DANGER_DARK,
  g: GOLD_LIGHT,
  G: GOLD,
  n: NIGHT,
  N: NIGHT_1,
}

function stamp(rows: string[], x: number, y: number, art: readonly string[]): void {
  for (let j = 0; j < art.length; j++) {
    const line = art[j] ?? ''
    for (let i = 0; i < line.length; i++) {
      const ch = line[i] ?? '.'
      if (ch !== '.') put(rows, x + i, y + j, ch)
    }
  }
}

/** Mirror a left half into a full row. Lit letters turn to body on the shadow side, and the last fur pixel before the right outline takes the shade. */
function mirror(half: readonly string[], swap: Record<string, string>, fur: string, shade: string): string[] {
  return half.map((line) => {
    const right = [...line].reverse().map((ch) => swap[ch] ?? ch)
    const full = [...line, ...right]
    for (let x = full.length - 1; x > 0; x--) {
      if (full[x] === 'L' && full[x - 1] === fur) {
        full[x - 1] = shade
        break
      }
    }
    return full.join('')
  })
}

/**
 * Front-facing soldier shiba, 24×24. Left half, mirrored. A steel helmet sits between upright ears
 * (left lit, right in shadow) with a coat-colored band, then brows, open eyes with a highlight,
 * white urajiro cheeks and muzzle, a dark nose and a シバスマイル tongue. The curl sits on the right hip.
 */
const CROWD_HALF = [
  '..L.........',
  '.LhL........',
  '.LhoL...LLLL',
  'LhhcoL.Luutt',
  'LhccoLLuuttt',
  'LhccLuuttttt',
  'LhcLtttttttt',
  'LhoLqqqqqqqq',
  'LhhooooooooO',
  'LhoooeeooooO',
  'LhoooookxooO',
  'LwwooookkooO',
  'LwwwwooooooO',
  'Lwwwwwwwwooo',
  'Lwwwwwwwwwnn',
  '.Lwwwwwwkwwn',
  '..Lwwwwwwkpp',
  '...Lwwwwwwww',
  '...Lowwwwwww',
  '..Lhoswwwwww',
  '..Lhooowwwww',
] as const

const PAW_DOWN = ['..LhoooLwwwL', '..LhooLwwwwL', '..LLLLLLLLLL'] as const
const PAW_UP = ['..LhooLwwwwL', '..LLLLLLLLLL', '............'] as const

const CROWD_SWAP: Record<string, string> = { h: 'o', O: 'o', u: 't', t: 'T' }

const CURL_UP = [
  '..LLLL..',
  '.LhoooL.',
  'LhoLLomL',
  'LoLccLmL',
  'LoLcLomL',
  'LocLoomL',
  '.LmmmmL.',
  '..LLLL..',
] as const
const CURL_WAG = [
  '.LLLL...',
  'LhoooL..',
  'LoLLomL.',
  'LLccLmL.',
  'LcLLomL.',
  '.LcoomL.',
  '..LmmL..',
  '...LL...',
] as const

type Mouth = 'smile' | 'shut' | 'bark'

interface CrowdPose {
  left: boolean
  right: boolean
  wag: boolean
  mouth: Mouth
}

/** Walk ×4, idle tail wag ×2, attack windup, bark, and two recovery frames. true = paw down. */
const CROWD_POSES: readonly CrowdPose[] = [
  { left: true, right: false, wag: false, mouth: 'smile' },
  { left: true, right: true, wag: true, mouth: 'smile' },
  { left: false, right: true, wag: false, mouth: 'smile' },
  { left: true, right: true, wag: true, mouth: 'smile' },
  { left: true, right: true, wag: false, mouth: 'smile' },
  { left: true, right: true, wag: true, mouth: 'smile' },
  { left: true, right: true, wag: false, mouth: 'shut' },
  { left: true, right: false, wag: true, mouth: 'bark' },
  { left: true, right: true, wag: false, mouth: 'smile' },
  { left: true, right: true, wag: true, mouth: 'smile' },
]

function crowdRows(pose: CrowdPose): string[] {
  const half = [...CROWD_HALF.map((line) => line.replace(/O/g, 'o'))]
  const body = mirror(half, CROWD_SWAP, 'o', 'm')
  const left = pose.left ? PAW_DOWN : PAW_UP
  const right = pose.right ? PAW_DOWN : PAW_UP
  const feet = mirrorPair(left, right, CROWD_SWAP, 'o', 'm')
  const g = [...body, ...feet]
  if (pose.mouth === 'shut') stamp(g, 10, 16, ['wwww'])
  if (pose.mouth === 'bark') stamp(g, 9, 14, ['wnnnnw', 'nppppn', 'wnnnnw'])
  if (pose.wag) stamp(g, 17, 14, CURL_WAG)
  else stamp(g, 16, 14, CURL_UP)
  return g
}

/** Mirror a right half from its own left-half rows, so each paw can lift on its own. */
function mirrorPair(
  left: readonly string[],
  right: readonly string[],
  swap: Record<string, string>,
  fur: string,
  shade: string,
): string[] {
  return left.map((line, i) => {
    const mirrored = mirror([right[i] ?? ''], swap, fur, shade)[0] ?? ''
    return line + mirrored.slice(line.length)
  })
}

const CROWD_ROWS = CROWD_POSES.map(crowdRows)

/** Card portrait: the crowd face with a bigger head, lit eyes, and a thick curl. Left half, mirrored. */
const HERO_HALF = [
  '...L..........',
  '..LhL.........',
  '..LhoL....LLLL',
  '.LhhooL.LLuutt',
  '.LhcooLLuuuttt',
  '.LhccoLuuttttt',
  'LhhccLuttttttt',
  'LhhcLttttttttt',
  'LhoLqqqqqqqqqq',
  'LhhoooooooooOO',
  'LhoooooeeoooOO',
  'LhooooookxkoOO',
  'LwwoooookkkoOO',
  'LwwwwooooooooO',
  'LwwwwwwwwooooO',
  'LwwwwwwwwwwooO',
  'Lwwwwwwwwwwwnn',
  '.Lwwwwwwwkwwwn',
  '..Lwwwwwwwkkpp',
  '...Lwwwwwwwwpp',
  '....Lwwwwwwwww',
  '....Lowwwwwwww',
  '...Lhoowwwwwww',
  '...Lhooowwwwww',
  '...Lhsoowwwwww',
  '...Lhoooowwwww',
  '...Lhooooowwww',
  '...Lhoooooowww',
  '...LhoooooomwL',
  '...LhooLwwwwwL',
  '...LhooLwkwkwL',
  '...LLLLLLLLLLL',
] as const

const HERO_CURL = [
  '..LLLLL...',
  '.LhhoooL..',
  'LhoooooomL',
  'LhoLLLLomL',
  'LoLcccLomL',
  'LoLcLLoomL',
  'LocLooommL',
  '.LcooommL.',
  '..LLLLLL..',
] as const

const HERO_SWAP: Record<string, string> = { h: 'o', O: 'o', u: 't', t: 'T' }

export type Face = 'open' | 'blink' | 'smug'

function hero(face: Face, reward: boolean): string[] {
  const half = HERO_HALF.map((line) => line.replace(/O/g, 'o'))
  const g = mirror(half, HERO_SWAP, 'o', 'm').map((line) => `${line}....`)
  if (face === 'blink') {
    for (const y of [11, 12]) {
      for (let x = 0; x < HERO_PX; x++) {
        const ch = g[y]?.[x]
        if (ch === 'k' || ch === 'x') put(g, x, y, y === 11 ? 'o' : 'k')
      }
    }
  }
  if (face === 'smug') {
    // Heavy lids, eyes sliding sideways, one brow up, and a lopsided smirk instead of the tongue.
    for (let x = 0; x < HERO_PX; x++) {
      const ch = g[11]?.[x]
      if (ch === 'k' || ch === 'x') put(g, x, 11, 'L')
    }
    put(g, 9, 12, 'x')
    put(g, 20, 12, 'x')
    stamp(g, 6, 9, ['eee'])
    stamp(g, 7, 10, ['oo'])
    stamp(g, 12, 18, ['wwww', 'wwww'])
    stamp(g, 9, 17, ['w'])
    stamp(g, 12, 18, ['kk'])
    stamp(g, 18, 16, ['wk'])
    stamp(g, 18, 17, ['k'])
  }
  stamp(g, 22, 18, HERO_CURL)
  if (reward) {
    blot(g, 6, 20, 16, 2, 'G')
    blot(g, 6, 20, 16, 1, 'g')
    stamp(g, 12, 22, ['gg', 'GG'])
  }
  return g
}

/** Angry cat, 28×28 front view. Left half, mirrored. Pink slit eyes and a ω mouth. */
const CAT_HALF = [
  '..L...........',
  '.LbL..........',
  '.LbpL.........',
  '.LhppL........',
  'LhbppbL.......',
  'LhbpppbL......',
  'LhbppppbLLLLLL',
  'LhhbbbbbbbbbbB',
  'LhhbbbbbbbbbbB',
  'Lhbbbbbbbbbbbb',
  'LhbbbbddLbbbbb',
  'LhbbbbbbdeLbbb',
  'LhbbbbbbLeeLbb',
  'LhbbbbbbbLLbbb',
  'Lhbbbbbbbbbbhp',
  'Lhbbbbbbbbhdhd',
  '.Lbbbbbbbbhhhh',
  '..LLbbbbbbhhhh',
  '....LbbbbbhhhH',
  '...LhbbbbbhhhH',
  '...LhbbbbbbhhH',
  '...LhbbbbbbbhH',
  '...LhbbbbbbbbB',
  '...LbbbbbbbbbB',
] as const

const CAT_SWAP: Record<string, string> = { h: 'b', B: 'm', H: 'h' }

const CAT_FEET = [
  ['...LbbbbmLbbbbbbbbLmbbbbL...', '...LmmmmL.LLLLLLLL.LmmmmL...', '...LmmmmL..........LLLLLL...', '...LLLLLL...................'],
  ['...LbbbbmLbbbbbbbbLmbbbbL...', '...LmmmmL.LLLLLLLL.LmmmmL...', '...LmmmmL..........LmmmmL...', '...LLLLLL..........LLLLLL...'],
  ['...LbbbbmLbbbbbbbbLmbbbbL...', '...LmmmmL.LLLLLLLL.LmmmmL...', '...LLLLLL..........LmmmmL...', '...................LLLLLL...'],
  ['...LbbbbmLbbbbbbbbLmbbbbL...', '...LmmmmL.LLLLLLLL.LmmmmL...', '...LmmmmL..........LmmmmL...', '...LLLLLL..........LLLLLL...'],
  ['...LbbbbbbbbbbbbbbbbbbbbL...', '...LmmmmLLmmmmmmmmLLmmmmL...', '...LmmmmL..........LmmmmL...', '...LLLLLL..........LLLLLL...'],
] as const

const CAT_TAIL_A = ['..LL', '.LbL', 'LbL.', 'LmL.', 'LmL.', 'LmL.'] as const
const CAT_TAIL_B = ['LL..', 'LbL.', '.LbL', '.LmL', 'LmL.', 'LmL.'] as const
const CAT_PAW = ['LLLLL.', 'LhhhbL', 'LhbbbL', '.LmmL.'] as const

interface CatPose {
  feet: number
  tail: boolean
  blink: boolean
  swipe: boolean
}

const CAT_POSES: readonly CatPose[] = [
  { feet: 0, tail: false, blink: false, swipe: false },
  { feet: 1, tail: true, blink: false, swipe: false },
  { feet: 2, tail: false, blink: false, swipe: false },
  { feet: 3, tail: true, blink: false, swipe: false },
  { feet: 4, tail: false, blink: false, swipe: false },
  { feet: 4, tail: true, blink: true, swipe: false },
  { feet: 4, tail: false, blink: false, swipe: false },
  { feet: 4, tail: true, blink: false, swipe: true },
  { feet: 4, tail: false, blink: false, swipe: false },
  { feet: 4, tail: true, blink: false, swipe: false },
]

function catFrame(pose: CatPose): string[] {
  const g = mirror(CAT_HALF, CAT_SWAP, 'b', 'm').map((line) => line.replace(/B/g, 'b').replace(/H/g, 'h'))
  for (const line of CAT_FEET[pose.feet] ?? CAT_FEET[0]) g.push(line)
  if (pose.blink) {
    for (let x = 0; x < CAT_PX; x++) {
      if (g[12]?.[x] === 'e') put(g, x, 12, 'L')
      if (g[11]?.[x] === 'e') put(g, x, 11, 'b')
    }
  }
  stamp(g, 24, 16, pose.tail ? CAT_TAIL_B : CAT_TAIL_A)
  if (pose.swipe) stamp(g, 0, 17, CAT_PAW)
  return g
}

const BONE_ROWS = [
  '............',
  '............',
  '.LL......LL.',
  'LwhL....LhhL',
  'LhhhLLLLLhmL',
  '.LhwhhhhhmL.',
  '.LhhmmmmmmL.',
  'LhmLLLLLLmmL',
  'LhmL....LmmL',
  '.LL......LL.',
  '............',
  '............',
] as const

/** Tutorial pointer: a shiba front leg with a white paw, pointing down. */
const PAW_ROWS = [
  '...LLLLLLL....',
  '...LhooooL....',
  '...LhoooomL...',
  '...LhoooomL...',
  '...LhoooomL...',
  '...LhoooomL...',
  '..LLwwwwwwLL..',
  '.LwwwwwwwwwwL.',
  '.LwwwwwwwwwwL.',
  '.LwwwwwwwwwwL.',
  '.LwwwLwwLwwwL.',
  '.LwwwLwwLwwwL.',
  '..LLLLLLLLLL..',
  '..............',
  '..............',
  '..............',
] as const

/** Cat castle: two ear-roofed towers and a keep with a cat face. The gate is the mouth. */
function castleRows(live: boolean): string[] {
  const g = blank(BOSS_W, BOSS_H)
  const eye = live ? 'e' : 'r'
  const glow = live ? 'g' : 'm'
  for (const tx of [2, 52]) {
    blot(g, tx, 14, 18, 50, 'b')
    tri(g, tx - 1, 0, 20, 16, 'm')
    tri(g, tx + 4, 5, 10, 9, live ? 'p' : 'b')
    blot(g, tx + 1, 15, 2, 48, 'h')
    blot(g, tx + 15, 15, 2, 48, 'm')
    for (let y = 22; y < 62; y += 7) {
      blot(g, tx + 1, y, 16, 1, 'm')
      put(g, tx + 6 + ((y / 7) & 1) * 6, y + 3, 'm')
      put(g, tx + 6 + ((y / 7) & 1) * 6, y + 4, 'm')
    }
    blot(g, tx + 6, 24, 6, 9, 'n')
    shave(g, tx + 6, 24, 6, 9, 2)
    blot(g, tx + 7, 27, 4, 5, glow)
    blot(g, tx + 7, 40, 4, 14, live ? 'e' : 'p')
    blot(g, tx + 7, 40, 1, 14, live ? 'p' : 'h')
  }
  blot(g, 18, 22, 36, 42, 'b')
  tri(g, 18, 6, 14, 18, 'b')
  tri(g, 40, 6, 14, 18, 'b')
  tri(g, 21, 12, 8, 10, live ? 'p' : 'm')
  tri(g, 43, 12, 8, 10, live ? 'p' : 'm')
  blot(g, 19, 23, 10, 3, 'h')
  blot(g, 18, 22, 1, 42, 'd')
  blot(g, 53, 22, 1, 42, 'd')
  blot(g, 50, 24, 3, 40, 'm')
  for (const ex of [23, 41]) {
    blot(g, ex, 30, 8, 6, 'd')
    blot(g, ex + 1, 31, 6, 4, eye)
    blot(g, ex + 3, 31, 2, 4, 'n')
  }
  blot(g, 34, 37, 4, 2, 'p')
  blot(g, 35, 39, 2, 1, 'd')
  blot(g, 28, 46, 16, 18, 'n')
  shave(g, 28, 46, 16, 18, 4)
  blot(g, 28, 60, 16, 4, 'n')
  for (let x = 31; x < 42; x += 3) blot(g, x, 47, 1, 17, 'N')
  for (const fx of [29, 39]) {
    tri(g, fx, 46, 4, 4, 'h')
  }
  return g
}

function sealAll(name: string, frames: readonly (readonly string[])[], map: Record<string, string>): Seal[] {
  return frames.map((rows, i) => seal(`${name}-${i}`, rows, map))
}

const FUR_NAMES = ['red', 'black', 'sesame', 'cream'] as const

/** One 10-frame strip per fur: 赤, 黒, 胡麻, 白. */
export const crowdArt: readonly Seal[][] = FUR_MAPS.map((map, i) => sealAll(`crowd-${FUR_NAMES[i] ?? i}`, CROWD_ROWS, map))

export const catArt = CAT_POSES.map((pose, i) => seal(`cat-${i}`, catFrame(pose), CAT))

export const HERO_FACES: readonly Face[] = ['open', 'blink', 'smug']
const HERO_COATS = [
  ['red', RED],
  ['black', BLACK],
  ['cream', CREAM],
] as const

/** Three coats × open, blink, smug, then the reward (red with a gold collar). Index with heroCell. */
export const heroArt = [
  ...HERO_COATS.flatMap(([name, map]) => HERO_FACES.map((face) => seal(`hero-${name}-${face}`, hero(face, false), map))),
  seal('hero-reward', hero('open', true), RED),
]

export const HERO_REWARD = HERO_COATS.length * HERO_FACES.length

export function heroCell(coat: number, face: Face): number {
  return coat * HERO_FACES.length + HERO_FACES.indexOf(face)
}

export const boneArt = seal('bone', [...BONE_ROWS], BONE_MAP)
export const pawArt = seal('paw', [...PAW_ROWS], RED)
export const castleLive = seal('castle', castleRows(true), CASTLE_MAP)
export const castleDim = seal('castle-dim', castleRows(false), CASTLE_MAP)

export const CROWD_FRAME_COUNT = CROWD_ROWS.length
export const CAT_FRAME_COUNT = CAT_POSES.length
