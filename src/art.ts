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

const CANNON_LIVE: Record<string, string> = {
  L: GOLD_DARK,
  d: GOLD_DARK,
  m: GOLD,
  o: GOLD_LIGHT,
  h: GOLD_HOT,
  w: WHITE,
  n: FUR_DARK,
  k: NIGHT,
}

const CANNON_DIM: Record<string, string> = {
  L: NIGHT,
  d: NIGHT,
  m: NIGHT_1,
  o: NIGHT_2,
  h: NIGHT_3,
  w: NIGHT_3,
  n: NIGHT,
  k: NIGHT,
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
 * Front-facing marching shiba, 16×16. Rows 0–10 are the head: upright ears (left lit, right in shadow),
 * brows, a happy squint, white urajiro cheeks and muzzle, dark nose and a シバスマイル tongue.
 * Rows 11–13 are the white chest. The curl sits on the right hip.
 */
const CROWD_HEAD = [
  '.L..........L...',
  'LoL........LmL..',
  'LhoL......LmmL..',
  'LhooLLLLLLmmmL..',
  'LhhoosoosoommL..',
  'LhooeoooooeomL..',
  'LookkooookkomL..',
  'LwwwwwoowwwwwL..',
  'LwwwwwnnwwwwwL..',
  '.LwwwwppwwwwL...',
  '..LLwwwwwwLL....',
] as const

const CROWD_CHEST = ['...LowwwwoL.....', '...LoowwooL.....', '...LhossomL.....'] as const

const CURL_UP = ['..LLLL', '.LhooL', 'LocccL', 'LoLmmL', 'LmmmL.', '.LLL..'] as const
const CURL_WAG = ['.LLL.', 'LhooL', 'LocmL', 'LmmmL', '.LL..'] as const

const CROWD_FEET = [
  ['...LmLLmL.......', '...LL..LL.......'],
  ['...LmL.LmL......', '...LL..LL.......'],
  ['....LmLmL.......', '....LL.LL.......'],
  ['..LmL.LmL.......', '..LL..LL........'],
  ['...LmLLmL.......', '...LLLLLL.......'],
] as const

type Mouth = 'smile' | 'shut' | 'bark'

interface CrowdPose {
  feet: number
  wag: boolean
  mouth: Mouth
}

/** Walk ×4, idle tail wag ×2, attack windup, bark, and two recovery frames. */
const CROWD_POSES: readonly CrowdPose[] = [
  { feet: 0, wag: false, mouth: 'smile' },
  { feet: 1, wag: true, mouth: 'smile' },
  { feet: 2, wag: false, mouth: 'smile' },
  { feet: 3, wag: true, mouth: 'smile' },
  { feet: 4, wag: false, mouth: 'smile' },
  { feet: 4, wag: true, mouth: 'smile' },
  { feet: 4, wag: false, mouth: 'shut' },
  { feet: 0, wag: true, mouth: 'bark' },
  { feet: 2, wag: false, mouth: 'smile' },
  { feet: 4, wag: true, mouth: 'smile' },
]

function crowdRows(pose: CrowdPose): string[] {
  const feet = CROWD_FEET[pose.feet] ?? CROWD_FEET[0]
  const g = [...CROWD_HEAD, ...CROWD_CHEST, ...feet]
  if (pose.mouth === 'shut') stamp(g, 6, 9, ['ww'])
  if (pose.mouth === 'bark') stamp(g, 5, 8, ['wnnw', 'nppn'])
  if (pose.wag) stamp(g, 11, 8, CURL_WAG)
  else stamp(g, 10, 7, CURL_UP)
  return g
}

const CROWD_ROWS = CROWD_POSES.map(crowdRows)

/** Card portrait: the crowd face with a bigger head, lit eyes, and a thick curl. Left half, mirrored. */
const HERO_HALF = [
  '...L..........',
  '..LhL.........',
  '..LhoL........',
  '.LhhooL.......',
  '.LhcooL.......',
  '.LhccooL......',
  'LhhcccooLLLLLL',
  'LhhcccoooooooO',
  'LhoooooosoooOO',
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

const HERO_SWAP: Record<string, string> = { h: 'o', O: 'o' }

function hero(blink: boolean, reward: boolean): string[] {
  const half = HERO_HALF.map((line) => line.replace(/O/g, 'o'))
  const g = mirror(half, HERO_SWAP, 'o', 'm').map((line) => `${line}....`)
  if (blink) {
    for (const y of [11, 12]) {
      for (let x = 0; x < HERO_PX; x++) {
        const ch = g[y]?.[x]
        if (ch === 'k' || ch === 'x') put(g, x, y, y === 11 ? 'o' : 'k')
      }
    }
  }
  stamp(g, 22, 18, HERO_CURL)
  if (reward) {
    blot(g, 6, 20, 16, 2, 'G')
    blot(g, 6, 20, 16, 1, 'g')
    stamp(g, 12, 22, ['gg', 'GG'])
  }
  return g
}

/** Angry cat, 24×24 front view. Left half, mirrored. Pink slit eyes and a ω mouth. */
const CAT_HALF = [
  '..L.........',
  '.LbL........',
  '.LbpL.......',
  '.LhppL......',
  'LhbppbL.....',
  'LhbpppbLLLLL',
  'LhhbbbbbbbbB',
  'Lhhbbbbbbbbb',
  'Lhbbbbbbbbbb',
  'LhbbbdLbbbbb',
  'LhbbbbdeLbbb',
  'LhbbbbLeeLbb',
  'LhbbbbbLLbbb',
  'Lhbbbbbbbhhp',
  '.Lbbbbbbhdhd',
  '..LLbbbbhhhh',
  '....LbbbhhhH',
  '...LhbbbhhhH',
  '...LhbbbbhhH',
  '...LhbbbbbhH',
  '...LbbbbbbbB',
] as const

const CAT_SWAP: Record<string, string> = { h: 'b', B: 'm', H: 'h' }

const CAT_FEET = [
  ['...LbbbmLbbbbbbLmbbbL...', '...LmmmL..LLLL..LmmmL...', '...LLLLL........LLLLL...'],
  ['...LbbbmLbbbbbbLmbbbL...', '...LLLLL..LLLL..LmmmL...', '................LLLLL...'],
  ['...LbbbmLbbbbbbLmbbbL...', '...LmmmL..LLLL..LmmmL...', '...LLLLL........LLLLL...'],
  ['...LbbbmLbbbbbbLmbbbL...', '...LmmmL..LLLL..LLLLL...', '...LLLLL................'],
  ['...LbbbbbbbbbbbbbbbbL...', '...LmmmLLmmmmmmLLmmmL...', '...LLLLLLLLLLLLLLLLLL...'],
] as const

const CAT_TAIL_A = ['..LL', '.LbL', 'LbL.', 'LmL.', 'LmL.'] as const
const CAT_TAIL_B = ['LL..', 'LbL.', '.LbL', '.LmL', 'LmL.'] as const
const CAT_PAW = ['LLLL.', 'LhhbL', 'LhbbL', '.LmL.'] as const

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
      if (g[11]?.[x] === 'e') put(g, x, 11, 'L')
      if (g[10]?.[x] === 'e') put(g, x, 10, 'b')
    }
  }
  stamp(g, 20, 14, pose.tail ? CAT_TAIL_B : CAT_TAIL_A)
  if (pose.swipe) stamp(g, 0, 15, CAT_PAW)
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

/** わんわん砲: a gold cannon with shiba ears and a barking bore. Left half, mirrored. */
const CANNON_HALF = [
  '.L........',
  'LhL.......',
  'LhoL......',
  'LhooLLLLLL',
  'LhhooooooO',
  'LhoookoooO',
  'LhooooooOO',
  'LhwoLLLLLL',
  'LwwLkkkkkk',
  'LwwLkkkkkk',
  'LwwLkkkkkk',
  'LhwoLkkkkk',
  'LhooLLLLLL',
  'LhoooooooO',
  '.LhooooooO',
  '..LLLmmLLL',
  '...LmmmmmL',
  '...LmLLmmL',
  '....LL.LLL',
  '..........',
] as const

function cannonRows(): string[] {
  const g = mirror(CANNON_HALF, { h: 'o', O: 'm' }, 'o', 'm')
  return g.map((line) => line.replace(/O/g, 'o'))
}

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

/** Red, red blink, black, black blink, reward (red with a gold collar). */
export const heroArt = [
  seal('hero-red', hero(false, false), RED),
  seal('hero-red-blink', hero(true, false), RED),
  seal('hero-black', hero(false, false), BLACK),
  seal('hero-black-blink', hero(true, false), BLACK),
  seal('hero-reward', hero(false, true), RED),
]

export const boneArt = seal('bone', [...BONE_ROWS], BONE_MAP)
export const pawArt = seal('paw', [...PAW_ROWS], RED)
export const cannonLive = seal('cannon', cannonRows(), CANNON_LIVE)
export const cannonDim = seal('cannon-dim', cannonRows(), CANNON_DIM)
export const castleLive = seal('castle', castleRows(true), CASTLE_MAP)
export const castleDim = seal('castle-dim', castleRows(false), CASTLE_MAP)

export const CROWD_FRAME_COUNT = CROWD_ROWS.length
export const CAT_FRAME_COUNT = CAT_POSES.length
