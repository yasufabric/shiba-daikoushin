import {
  BOSS_H,
  BOSS_W,
  HOME_H,
  BOSS_PX,
  HOME_W,
  CAT_BODY,
  CAT_DARK,
  CAT_LIGHT,
  CAT_MID,
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
  K: NIGHT,
  v: FUR_DARK,
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
  v: FUR_LIGHT,
  q: GOLD,
}

/** 胡麻柴: red fur with dark tips on the crown and back. */
const SESAME: Record<string, string> = {
  ...RED,
  o: FUR_MID,
  h: FUR_BODY,
  s: FUR_DARK,
  m: FUR_DARK,
}

/** 白柴: cream fur. Ears and curl keep an orange shade. */
const CREAM: Record<string, string> = {
  ...RED,
  L: WHITE_DARK,
  o: WHITE,
  h: WHITE,
  m: WHITE_MID,
  c: FUR_LIGHT,
  e: WHITE_MID,
  s: WHITE,
  q: DANGER,
}

/** ぶち柴: white fur with orange patches, so the frisbee thrower reads apart from the plain white healer. */
const BUCHI: Record<string, string> = {
  ...CREAM,
  s: FUR_BODY,
  o: WHITE,
  h: WHITE,
  m: WHITE_MID,
  c: FUR_LIGHT,
  e: FUR_BODY,
  L: FUR_DARK,
  q: GOLD,
}

/** 応援柴: a golden きなこ coat, so the cheerleader shines in the crowd. */
const KINAKO: Record<string, string> = {
  ...RED,
  L: GOLD_DARK,
  o: GOLD,
  h: GOLD_HOT,
  m: GOLD_DARK,
  c: GOLD_HOT,
  e: GOLD_LIGHT,
  s: GOLD,
  k: GOLD_DARK,
  n: GOLD_DARK,
  q: DANGER,
}

/** どっしり柴: a big grey-brown coat with a dark outline, for the slow stomper. */
const GRAY: Record<string, string> = {
  ...RED,
  L: NIGHT,
  o: WHITE_DARK,
  h: WHITE_MID,
  m: NIGHT_3,
  c: WHITE_MID,
  e: WHITE_MID,
  s: WHITE_DARK,
  k: NIGHT,
  n: NIGHT,
  w: WHITE,
  t: WHITE_MID,
  q: GOLD,
}

export const FUR_RED = 0
export const FUR_BLACK = 1
export const FUR_SESAME = 2
export const FUR_CREAM = 3
export const FUR_BUCHI = 4
export const FUR_GRAY = 5
export const FUR_KINAKO = 6
const FUR_MAPS = [RED, BLACK, SESAME, CREAM, BUCHI, GRAY, KINAKO] as const

const CAT: Record<string, string> = {
  L: CAT_DARK,
  d: CAT_DARK,
  m: CAT_MID,
  b: CAT_BODY,
  h: CAT_LIGHT,
  p: DANGER_LIGHT,
  e: NIGHT,
  x: WHITE,
  r: DANGER_DARK,
  R: DANGER,
  w: WHITE,
  n: NIGHT,
  g: GOLD_LIGHT,
  G: GOLD,
  y: GOLD_DARK,
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

const HOME_MAP: Record<string, string> = {
  d: FUR_DARK,
  r: FUR_MID,
  o: FUR_BODY,
  t: FUR_LIGHT,
  w: WHITE,
  n: NIGHT,
  N: NIGHT_1,
  g: GOLD_LIGHT,
  G: GOLD,
  y: GOLD_DARK,
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
 * Front-facing soldier shiba, 16×16. Left half, mirrored. Upright ears (left lit, right in shadow), bare
 * pricked ears, eyes with a highlight, white urajiro cheeks and muzzle, a dark nose and a
 * シバスマイル tongue. The curl sits on the right hip.
 */
const CROWD_HALF = [
  '..LL......',
  '.LhhL.....',
  '.LhcoL....',
  'LhhccoLLLL',
  'LhccoLhhhh',
  'LoccLhhhoo',
  'LoooLhooos',
  'LLovvooooo',
  'Lhooovvooo',
  'LhooKxKooo',
  'LwwoKKKooo',
  'Lwwwwwwwnn',
  '.Lwwwwwwwn',
  '..Lowwwwww',
  '.Lhoowwwww',
  '.Lhooswwww',
  '.Lhoooowww',
  '.Lhoooooww',
] as const

const PAW_DOWN = ['.LoooLwwww', '.LwwwL....'] as const
const PAW_UP = ['.LoooLwwww', '..........'] as const

const CROWD_SWAP: Record<string, string> = { h: 'o', O: 'o', u: 't', t: 'T' }

const CURL_UP = ['.LL.', 'LcoL', 'LomL', '.LL.'] as const
const CURL_WAG = ['LL..', 'LcoL', '.LmL', '.LL.'] as const

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

/** Dark patches for 胡麻柴: only the sesame coat paints 's' dark, every other coat paints it as plain fur. Patches are `cell`-pixel blocks, thickest on the crown and back (above `top`), so they read as a few soft blotches instead of noise. */
function speckle(rows: string[], top: number, cell: number): string[] {
  return rows.map((line, y) =>
    [...line]
      .map((ch, x) => {
        if (ch !== 'o' && ch !== 'h') return ch
        const cx = Math.floor(x / cell)
        const cy = Math.floor(y / cell)
        const n = (cx * 5 + cy * 7 + cx * cy) % 9
        return n < (y <= top ? 2 : 1) ? 's' : ch
      })
      .join(''),
  )
}

function crowdRows(pose: CrowdPose): string[] {
  const body = mirror([...CROWD_HALF], CROWD_SWAP, 'o', 'm')
  const left = pose.left ? PAW_DOWN : PAW_UP
  const right = pose.right ? PAW_DOWN : PAW_UP
  const feet = mirrorPair(left, right, CROWD_SWAP, 'o', 'm')
  const g = speckle([...body, ...feet], 8, 2)
  if (pose.mouth === 'shut') stamp(g, 8, 12, ['wwww'])
  if (pose.mouth === 'bark') stamp(g, 7, 11, ['nnnnnn', 'nppppn'])
  stamp(g, 16, 13, pose.wag ? CURL_WAG : CURL_UP)
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
  '...LL.........',
  '..LhhL........',
  '..LhcoL.......',
  '.LhhccoLLLLLLL',
  '.LhccooLhhhhhh',
  '.LhccooLhhhhoo',
  'LhhccoLhhhoooo',
  'LhhcoLhhooooos',
  'LhoooooooooooO',
  'LhhoooKKooooOO',
  'LhoooooKKoooOO',
  'LhooooooKxKoOO',
  'LwwoooooKKKoOO',
  'LwwwwooooooooO',
  'LwwwwwwwwooooO',
  'LwwwwwwwwwwooO',
  'Lwwwwwwwwwwwnn',
  '.Lwwwwwwwkwwwn',
  '..Lwwwwwwwkkww',
  '...Lwwwwwwwwww',
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
  const g = speckle(mirror(half, HERO_SWAP, 'o', 'm'), 14, 3).map((line) => `${line}....`)
  if (face === 'blink') {
    for (const y of [11, 12]) {
      for (let x = 0; x < HERO_PX; x++) {
        const ch = g[y]?.[x]
        if (ch === 'k' || ch === 'x' || ch === 'K') put(g, x, y, y === 11 ? 'o' : 'k')
      }
    }
  }
  if (face === 'smug') {
    // Heavy lids, eyes sliding sideways, one brow up, and a lopsided smirk instead of the tongue.
    for (let x = 0; x < HERO_PX; x++) {
      const ch = g[11]?.[x]
      if (ch === 'k' || ch === 'x' || ch === 'K') put(g, x, 11, 'L')
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

/**
 * Rival dogs, 20×20 front view, in the enemy purples so they never read as shibas. Left halves, mirrored.
 * Breed order matches BREED_* in balance: チワワ (huge ears, bug eyes), コーギー (tall ears, white blaze), ブルドッグ (rose ears, jowls, underbite).
 */
const DOG_HALVES: readonly (readonly string[])[] = [
  [
    '.LL.......',
    '.LpL......',
    '.LppL.....',
    '.LhppLLLLL',
    '..Lhbbbbbb',
    '..LhbLLbbb',
    '..LhLeeLbb',
    '..LhbLLbbb',
    '...Lhbbbww',
    '....Lbbwwd',
    '...LLbbwww',
    '..Lhbbbbbw',
    '..Lhbbbbbb',
    '..Lbbbbbbb',
  ],
  [
    '.LL.......',
    'LbbL......',
    'LbppL.....',
    'LbppbL....',
    'LbpppbLLLw',
    'Lhbbbbbbww',
    '.LhbLLbbww',
    '.LhLeeLbww',
    '.LhbLLbwww',
    '..Lhbbwwdd',
    '..LLhwwwww',
    '..Lhbwwwww',
    '..Lhbbwwww',
    '..Lbbbbbbb',
  ],
  [
    '..........',
    '..LLL.....',
    '.LmmbLLLLL',
    'Lhbbbbbbbb',
    'Lhbbbbbbww',
    'LhLLLbbbww',
    'LLeedLbwww',
    'LhLLLbbwww',
    'Lhbbbbbwdd',
    'LhwwwwwwdL',
    'LhwwLLLLLL',
    'LhwLwwLwww',
    '.Lhbwwwwww',
    '..Lbbbbbbb',
  ],
  [
    '..........',
    '...LLLLLLL',
    '..Lhbbbbbb',
    '.LLhbbbbbb',
    'LmLhbbbbbb',
    'LmLbbLLbbb',
    'LmLbLeeLbb',
    'LmLbbLLbww',
    'LmLhbbbwww',
    '.LmLbbwwdd',
    '..LLhbwwww',
    '..LhbwLLLL',
    '..Lhbbwwww',
    '..Lbbbbbbb',
  ],
  [
    '..LLLLLLLL',
    '.LmhbbbbbL',
    'LmmhbbbbbL',
    'LmpLbbbbbb',
    'LmpLbbbbbb',
    'LmLhbLLbbb',
    '.LLhLeeLbb',
    '..LhbLLbbb',
    '..Lhbbbbww',
    '..LhbbwwwL',
    '..LLhbwwpp',
    '..Lhbbwwpp',
    '..Lhbbbwww',
    '..Lbbbbbbb',
  ],
  [
    '......LLLL',
    '....LLhhbb',
    '..LLhhbbbb',
    '.LhhbbLbbb',
    'LhhbbbbLbb',
    'LhhbLLbbbb',
    'LhmbLeeLbb',
    'LhmbbLLbbb',
    '.Lhbbbbbww',
    '..LhbbwwwL',
    '...LLhwwwd',
    '..Lhhbbbbb',
    '..Lhbbbbbb',
    '..Lbbbbbbb',
  ],
  [
    '..........',
    '..LL......',
    '.LpbL..LLL',
    '.LppbLLhhh',
    'Lhhbbbbbbb',
    'LhbbLLbbbb',
    'LhbLeeLbbb',
    'LhbbLLbbbb',
    'Lwhbbbbbww',
    'Lwwhbbwwwd',
    'Lwwwwwwwww',
    '.Lwwwwwwww',
    '..Lhbbbbbb',
    '..Lbbbbbbb',
  ],
]

/** Right half: the lit edge turns to body on the shadow side. */
function twin(half: readonly string[]): string[] {
  return half.map((line) => line + [...line].reverse().map((ch) => (ch === 'h' ? 'b' : ch)).join(''))
}

const DOG_FEET = [
  ['..LbbbmLbbbbLmbbbL..', '..LmmmL.LLLL.LmmmL..', '..LmmmL......LLLLL..', '..LLLLL.............'],
  ['..LbbbmLbbbbLmbbbL..', '..LmmmL.LLLL.LmmmL..', '..LmmmL......LmmmL..', '..LLLLL......LLLLL..'],
  ['..LbbbmLbbbbLmbbbL..', '..LmmmL.LLLL.LmmmL..', '..LLLLL......LmmmL..', '.............LLLLL..'],
  ['..LbbbmLbbbbLmbbbL..', '..LmmmL.LLLL.LmmmL..', '..LmmmL......LmmmL..', '..LLLLL......LLLLL..'],
  ['..LbbbbbbbbbbbbbbL..', '..LmmmLLmmmmLLmmmL..', '..LmmmL......LmmmL..', '..LLLLL......LLLLL..'],
] as const

const DOG_TAIL_A = ['.LL', 'LbL', 'LmL', '.L.'] as const
const DOG_TAIL_B = ['LL.', 'LbL', 'LmL', 'L..'] as const
/** ゴールデン's bone shield, held across the chest. */
const DOG_SHIELD = ['.LLLLLLLL.', 'LgGGGGGGyL', 'LgGGLLGGyL', '.LGGGGGyL.', '..LLLLLL..'] as const

const DOG_PAW = ['LLLL.', 'LhbbL', '.LLL.'] as const

interface DogPose {
  feet: number
  tail: boolean
  blink: boolean
  swipe: boolean
}

const DOG_POSES: readonly DogPose[] = [
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

const DOG_SCARF = ['RRRRRR', '.rRRr.', '..rr..'] as const
/** Where the bandana sits on each breed (row of the 20×20 frame). */
const DOG_SCARF_Y = [14, 14, 14, 14, 14, 14, 14] as const

function dogFrame(breed: number, pose: DogPose): string[] {
  // Dark eyes with a white glint on the left of each (they used to glow red, which read as zombies).
  const g = ['.'.repeat(20), '.'.repeat(20), ...twin(DOG_HALVES[breed] ?? DOG_HALVES[0] ?? [])].map((line) => line.replace(/ee/g, 'xe'))
  for (const line of DOG_FEET[pose.feet] ?? DOG_FEET[0]) g.push(line)
  // The rival gang's red bandana, knotted under the chin.
  stamp(g, 7, DOG_SCARF_Y[breed] ?? 14, DOG_SCARF)
  if (pose.blink) {
    for (let y = 0; y < g.length; y++) g[y] = (g[y] ?? '').replace(/[ex]/g, 'L')
  }
  if (breed !== 1) stamp(g, 16, 11, pose.tail ? DOG_TAIL_B : DOG_TAIL_A)
  if (breed === 4) stamp(g, 5, 14, DOG_SHIELD)
  if (pose.swipe) stamp(g, 0, 12, DOG_PAW)
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
function arch(rows: string[], x: number, y: number, w: number, h: number, ch: string): void {
  const r = w / 2
  for (let i = 0; i < h; i++) {
    const dy = r - i - 0.5
    const half = i < r ? Math.sqrt(Math.max(0, r * r - dy * dy)) : r
    const from = Math.round(x + r - half)
    const to = Math.round(x + r + half)
    for (let xx = from; xx < to; xx++) put(rows, xx, y + i, ch)
  }
}

/** A front-on kennel: banded gable roof, plank wall with posts, and a recessed arched door. Returns the rows to dress. */
function kennel(w: number, h: number, c: { roof: string; roofHi: string; edge: string; wall: string; lit: string; shade: string; grain: string; door: string; inner: string }): string[] {
  const g = blank(w, h)
  const roofH = Math.round(h * 0.45)
  const wallY = roofH + 2
  // Wall: planks with grain lines, a lit left edge, a shadowed right edge, and a dark foundation.
  blot(g, 4, wallY, w - 8, h - wallY, c.wall)
  for (let x = 10; x < w - 8; x += 6) blot(g, x, wallY, 1, h - wallY, c.grain)
  blot(g, 5, wallY, 2, h - wallY, c.lit)
  blot(g, w - 8, wallY, 3, h - wallY, c.shade)
  blot(g, 3, h - 3, w - 6, 3, c.edge)
  // Gable: outer roof band, inner gable wall, shingle dashes along the slopes.
  tri(g, 0, 0, w, roofH, c.edge)
  tri(g, 1, 1, w - 2, roofH - 2, c.roof)
  tri(g, 7, 6, w - 14, roofH - 7, c.wall)
  for (let row = 3; row < roofH - 2; row += 3) {
    const span = 1 + Math.floor(((w - 3) * row) / (roofH - 1))
    const left = Math.floor((w - span) / 2)
    for (let i = 0; i < 4; i++) {
      put(g, left + 1 + i * 2 + (row % 2), row, c.roofHi)
      put(g, left + span - 2 - i * 2 - (row % 2), row, c.roofHi)
    }
  }
  blot(g, 0, roofH - 1, w, 3, c.edge)
  blot(g, 1, roofH, w - 2, 1, c.roof)
  blot(g, (w >> 1) - 2, 0, 4, 3, c.edge)
  // Door: frame, recessed arch with a lighter back wall for depth.
  const dw = Math.round(w * 0.36)
  const dx = (w - dw) >> 1
  const dy = wallY + 3
  arch(g, dx - 2, dy - 2, dw + 4, h - dy - 1, c.shade)
  arch(g, dx, dy, dw, h - dy - 3, c.door)
  arch(g, dx + 2, dy + 3, dw - 4, h - dy - 6, c.inner)
  return g
}

function bone(g: string[], cx: number, y: number, hi: string, mid: string, lo: string): void {
  blot(g, cx - 5, y + 1, 11, 3, mid)
  blot(g, cx - 5, y + 1, 11, 1, hi)
  blot(g, cx - 7, y, 3, 3, mid)
  blot(g, cx + 5, y, 3, 3, mid)
  blot(g, cx - 7, y + 3, 3, 3, lo)
  blot(g, cx + 5, y + 3, 3, 3, lo)
}

/** The enemy doghouse: a purple kennel with a red bone sign and a dark door whose glowing eyes and fangs look back. */
function castleRows(live: boolean): string[] {
  const g = kennel(BOSS_W, BOSS_H, { roof: 'm', roofHi: 'h', edge: 'd', wall: 'b', lit: 'h', shade: 'm', grain: 'm', door: 'n', inner: 'N' })
  const eye = live ? 'e' : 'r'
  const dw = Math.round(BOSS_W * 0.36)
  const cx = BOSS_W >> 1
  const top = BOSS_H - 24
  bone(g, cx, Math.round(BOSS_H * 0.2), 'e', 'r', 'd')
  for (const ex of [cx - 6, cx + 1]) {
    blot(g, ex, top + 6, 5, 4, eye)
    blot(g, ex + 1, top + 7, 2, 2, 'h')
  }
  for (let x = cx - dw / 2 + 4; x < cx + dw / 2 - 3; x += 4) {
    blot(g, x, BOSS_H - 12, 2, 4, 'h')
    put(g, x, BOSS_H - 8, 'h')
  }
  return g
}

/** 柴の家: a warm kennel with a gold bone sign, a recessed arched door, and a water bowl by the step. */
function homeRows(): string[] {
  const g = kennel(HOME_W, HOME_H, { roof: 'r', roofHi: 'o', edge: 'd', wall: 't', lit: 'w', shade: 'o', grain: 'o', door: 'n', inner: 'N' })
  bone(g, HOME_W >> 1, Math.round(HOME_H * 0.2), 'g', 'G', 'y')
  blot(g, HOME_W - 13, HOME_H - 6, 8, 3, 'y')
  blot(g, HOME_W - 12, HOME_H - 6, 6, 1, 'g')
  return g
}

function sealAll(name: string, frames: readonly (readonly string[])[], map: Record<string, string>): Seal[] {
  return frames.map((rows, i) => seal(`${name}-${i}`, rows, map))
}

const FUR_NAMES = ['red', 'black', 'sesame', 'cream', 'buchi', 'gray', 'kinako'] as const

/** One 10-frame strip per fur: 赤, 黒, 胡麻, 白, ぶち, どっしり. */
export const crowdArt: readonly Seal[][] = FUR_MAPS.map((map, i) => sealAll(`crowd-${FUR_NAMES[i] ?? i}`, CROWD_ROWS, map))

const BOSS_MAP: Record<string, string> = { ...CAT, g: GOLD_LIGHT, G: GOLD, y: GOLD_DARK }

/** セントバーナード, the boss: 32×32 front view with floppy ears, a white blaze and chest, and a gold barrel under its chin. Two walk frames. */
function bossRows(step: number): string[] {
  const g = blank(BOSS_PX, BOSS_PX)
  blot(g, 5, 16, 22, 12, 'b')
  shave(g, 5, 16, 22, 12, 3)
  blot(g, 6, 18, 1, 8, 'h')
  blot(g, 25, 18, 1, 8, 'm')
  blot(g, 10, 18, 12, 9, 'w')
  const back = step === 0 ? 0 : 1
  blot(g, 7, 27 + back, 5, 5 - back, 'm')
  blot(g, 20, 28 - back, 5, 4 + back, 'm')
  blot(g, 8, 31, 3, 1, 'w')
  blot(g, 21, 31, 3, 1, 'w')
  blot(g, 7, 2, 18, 16, 'b')
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3 - i; j++) {
      put(g, 7 + j, 2 + i, '.')
      put(g, 24 - j, 2 + i, '.')
    }
  }
  blot(g, 8, 5, 1, 10, 'h')
  for (const ex of [2, 24]) {
    blot(g, ex, 5, 6, 11, 'm')
    shave(g, ex, 5, 6, 11, 2)
    blot(g, ex + 2, 6, 2, 8, 'd')
  }
  blot(g, 14, 2, 4, 8, 'w')
  blot(g, 9, 10, 14, 7, 'w')
  for (const ex of [9, 18]) {
    blot(g, ex, 6, 5, 4, 'd')
    blot(g, ex + 1, 7, 2, 2, 'e')
  }
  blot(g, 14, 11, 4, 3, 'n')
  blot(g, 11, 15, 10, 1, 'd')
  blot(g, 12, 17, 8, 6, 'G')
  blot(g, 13, 18, 6, 1, 'g')
  blot(g, 12, 19, 8, 1, 'y')
  blot(g, 12, 21, 8, 1, 'y')
  return g
}

export const bossArt = [seal('boss-0', bossRows(0), BOSS_MAP), seal('boss-1', bossRows(1), BOSS_MAP)]

/** 黒バーナード, the late-stage boss: the same dog in a night coat with a red barrel. */
const BOSS_DARK_MAP: Record<string, string> = { ...BOSS_MAP, b: NIGHT_3, h: CAT_BODY, m: NIGHT_2, d: NIGHT, w: WHITE_MID, g: DANGER_LIGHT, G: DANGER, y: DANGER_DARK }
export const bossDarkArt = [seal('boss-dark-0', bossRows(0), BOSS_DARK_MAP), seal('boss-dark-1', bossRows(1), BOSS_DARK_MAP)]

const DOG_NAMES = ['chihuahua', 'corgi', 'bulldog', 'dachs', 'golden', 'poodle', 'pom'] as const

/** One 10-frame strip per breed, in BREED_* order. */
export const dogArt: readonly Seal[][] = DOG_NAMES.map((name, breed) =>
  DOG_POSES.map((pose, i) => seal(`${name}-${i}`, dogFrame(breed, pose), CAT)),
)

export const HERO_FACES: readonly Face[] = ['open', 'blink', 'smug']
const HERO_COATS = [
  ['red', RED],
  ['black', BLACK],
  ['sesame', SESAME],
  ['cream', CREAM],
  ['buchi', BUCHI],
  ['gray', GRAY],
  ['kinako', KINAKO],
] as const

/** Four coats in card order (赤, 黒, 胡麻, 白) × open, blink, smug, then the reward (red with a gold collar). Index with heroCell. */
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
export const homeArt = seal('home', homeRows(), HOME_MAP)

export const CROWD_FRAME_COUNT = CROWD_ROWS.length
export const CAT_FRAME_COUNT = DOG_POSES.length
