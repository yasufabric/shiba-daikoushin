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
  canvas.width = 5 * CELL
  canvas.height = CELL
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('spritesheet unavailable')
  ctx.imageSmoothingEnabled = false
  blit(ctx, FACE_A, TAN, 0)
  blit(ctx, FACE_B, TAN, 1)
  blit(ctx, FACE_A, BLACK, 2)
  blit(ctx, FACE_B, BLACK, 3)
  blit(ctx, BONE_PX, BONE, 4)
  return canvas
}

export function spriteCol(kind: number, frame: number): number {
  const base = kind === KIND_BLACK ? 2 : KIND_TAN * 2
  return base + (frame & 1)
}

export const COL_BONE = 4
