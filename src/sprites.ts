import { KIND_BLACK, KIND_TAN } from './balance'

export const SCALE = 4
export const CELL = 8 * SCALE

const TAN = [
  '',
  '#3a2214',
  '#e8943a',
  '#f6c07a',
  '#a85a22',
  '#ffe6c2',
  '#5a3024',
  '#1c120c',
  '#fffaf4',
] as const

const BLACK = [
  '',
  '#1a1210',
  '#3a332e',
  '#c4844a',
  '#221c18',
  '#e6d2bc',
  '#2a1814',
  '#0c0a08',
  '#fff6ea',
] as const

const BONE = ['', '#6a4a28', '#ffe6b8', '#fff8e8'] as const

const CAT = [
  '',
  '#2a2430',
  '#7d7d8c',
  '#f3f3f8',
  '#4c465c',
  '#f2a0b4',
  '#3a2830',
  '#140e16',
  '#ffffff',
] as const

const CREAM = [
  '',
  '#8a5a18',
  '#fff1d0',
  '#ffe08a',
  '#e0a030',
  '#fffaf0',
  '#c4784a',
  '#5a3a20',
  '#ffffff',
] as const

/** Ears, eyes, cream muzzle, curled tail. Two paw poses. */
const FACE_A = [
  0, 4, 2, 0, 0, 2, 4, 0,
  4, 3, 2, 2, 2, 2, 3, 4,
  2, 7, 8, 2, 2, 8, 7, 2,
  2, 2, 5, 6, 6, 5, 2, 2,
  1, 2, 5, 5, 5, 5, 2, 1,
  0, 1, 2, 2, 2, 5, 4, 0,
  0, 2, 0, 0, 0, 2, 0, 0,
  2, 0, 0, 0, 0, 0, 0, 2,
] as const

const FACE_B = [
  0, 4, 2, 0, 0, 2, 4, 0,
  4, 3, 2, 2, 2, 2, 3, 4,
  2, 7, 8, 2, 2, 8, 7, 2,
  2, 2, 5, 6, 6, 5, 2, 2,
  1, 2, 5, 5, 5, 5, 2, 1,
  0, 1, 2, 2, 2, 5, 4, 0,
  2, 0, 0, 0, 0, 0, 2, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
] as const

const CAT_A = [
  0, 4, 0, 0, 0, 0, 4, 0,
  4, 5, 4, 0, 0, 4, 5, 4,
  2, 7, 8, 2, 2, 8, 7, 2,
  2, 2, 5, 6, 6, 5, 2, 2,
  1, 3, 3, 3, 3, 3, 3, 1,
  0, 1, 2, 3, 3, 2, 1, 0,
  0, 2, 0, 0, 0, 2, 0, 0,
  2, 0, 0, 0, 0, 0, 0, 2,
] as const

const CAT_B = [
  0, 4, 0, 0, 0, 0, 4, 0,
  4, 5, 4, 0, 0, 4, 5, 4,
  2, 7, 8, 2, 2, 8, 7, 2,
  2, 2, 5, 6, 6, 5, 2, 2,
  1, 3, 3, 3, 3, 3, 3, 1,
  0, 1, 2, 3, 3, 2, 1, 0,
  2, 0, 0, 0, 0, 0, 2, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
] as const

const BONE_PX = [
  0, 1, 2, 0, 0, 2, 1, 0, 1, 2, 3, 1, 1, 3, 2, 1, 1, 3, 2, 2, 2, 2, 3, 1, 1, 2, 3, 1, 1, 3,
  2, 1, 0, 1, 2, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0,
] as const

function blit(
  ctx: CanvasRenderingContext2D,
  pixels: readonly number[],
  palette: readonly string[],
  col: number,
): void {
  const ox = col * CELL
  for (let i = 0; i < 64; i++) {
    const index = pixels[i] ?? 0
    if (index === 0) continue
    const color = palette[index]
    if (!color) continue
    ctx.fillStyle = color
    const x = i % 8
    const y = (i / 8) | 0
    ctx.fillRect(ox + x * SCALE, y * SCALE, SCALE, SCALE)
  }
}

export function createSheet(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 8 * CELL
  canvas.height = CELL
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('spritesheet unavailable')
  ctx.imageSmoothingEnabled = false
  blit(ctx, FACE_A, TAN, 0)
  blit(ctx, FACE_B, TAN, 1)
  blit(ctx, FACE_A, BLACK, 2)
  blit(ctx, FACE_B, BLACK, 3)
  blit(ctx, BONE_PX, BONE, 4)
  blit(ctx, CAT_A, CAT, 5)
  blit(ctx, CAT_B, CAT, 6)
  blit(ctx, FACE_A, CREAM, 7)
  return canvas
}

export function spriteCol(kind: number, frame: number): number {
  const base = kind === KIND_BLACK ? 2 : KIND_TAN * 2
  return base + (frame & 1)
}

export const COL_BONE = 4
export const COL_CAT = 5
export const COL_REWARD = 7
export const CASTLE_SCALE = 3
export const CASTLE_W = 48
export const CASTLE_H = 40

export function createCastle(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = CASTLE_W * CASTLE_SCALE
  canvas.height = CASTLE_H * CASTLE_SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('castle unavailable')
  ctx.imageSmoothingEnabled = false
  const stone = '#6d5a72'
  const dark = '#322838'
  const pink = '#e890a8'
  const gate = '#140c12'
  const px = (x: number, y: number, color: string, w = 1, h = 1): void => {
    ctx.fillStyle = color
    ctx.fillRect(x * CASTLE_SCALE, y * CASTLE_SCALE, w * CASTLE_SCALE, h * CASTLE_SCALE)
  }
  px(2, 14, stone, 10, 24)
  px(36, 14, stone, 10, 24)
  px(10, 18, stone, 28, 20)
  px(3, 10, pink, 3, 5)
  px(8, 10, pink, 3, 5)
  px(37, 10, pink, 3, 5)
  px(42, 10, pink, 3, 5)
  px(4, 8, dark, 2, 3)
  px(8, 8, dark, 2, 3)
  px(38, 8, dark, 2, 3)
  px(42, 8, dark, 2, 3)
  for (let x = 12; x <= 33; x += 6) px(x, 16, dark, 3, 3)
  px(20, 26, gate, 8, 12)
  px(21, 23, gate, 6, 4)
  px(6, 22, dark, 3, 4)
  px(39, 22, dark, 3, 4)
  px(13, 30, dark, 5, 1)
  px(30, 30, dark, 5, 1)
  return canvas
}

export function createFinger(): HTMLCanvasElement {
  const w = 8
  const h = 12
  const canvas = document.createElement('canvas')
  canvas.width = w * SCALE
  canvas.height = h * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('finger unavailable')
  ctx.imageSmoothingEnabled = false
  const rows = [
    ' sss    ',
    'sssss   ',
    ' ssss   ',
    '  ssss  ',
    '   sss  ',
    '   ss   ',
    '   ss   ',
    '   ss   ',
    '   ss   ',
    '   s    ',
    '   s    ',
    '   n    ',
  ]
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] ?? ''
    for (let x = 0; x < w; x++) {
      const ch = row[x]
      if (ch !== 's' && ch !== 'n') continue
      ctx.fillStyle = ch === 'n' ? '#fff6ee' : '#f0b898'
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)
    }
  }
  return canvas
}
