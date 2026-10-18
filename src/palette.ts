/** The only colors that may be drawn. See AGENTS.md. */
export const PALETTE = [
  '#6b2e12',
  '#a8521e',
  '#e08a3c',
  '#f6c27a',
  '#8a7f86',
  '#c9c0c4',
  '#fffaf0',
  '#2b1d3a',
  '#5a3f7a',
  '#9a7ccf',
  '#d8c8f0',
  '#7a4a00',
  '#e0a200',
  '#ffe066',
  '#fffbd1',
  '#8a0f3a',
  '#ff3d7f',
  '#ffb3cf',
  '#0b0f1e',
  '#18213d',
  '#2c3a63',
  '#4a5d8f',
  '#120b10',
] as const

export type PaletteColor = (typeof PALETTE)[number]

export const FUR_DARK = '#6b2e12'
export const FUR_MID = '#a8521e'
export const FUR_BODY = '#e08a3c'
export const FUR_LIGHT = '#f6c27a'
export const WHITE_DARK = '#8a7f86'
export const WHITE_MID = '#c9c0c4'
export const WHITE = '#fffaf0'
export const CAT_DARK = '#2b1d3a'
export const CAT_MID = '#5a3f7a'
export const CAT_BODY = '#9a7ccf'
export const CAT_LIGHT = '#d8c8f0'
export const GOLD_DARK = '#7a4a00'
export const GOLD = '#e0a200'
export const GOLD_LIGHT = '#ffe066'
export const GOLD_HOT = '#fffbd1'
export const DANGER_DARK = '#8a0f3a'
export const DANGER = '#ff3d7f'
export const DANGER_LIGHT = '#ffb3cf'
export const NIGHT = '#0b0f1e'
export const NIGHT_1 = '#18213d'
export const NIGHT_2 = '#2c3a63'
export const NIGHT_3 = '#4a5d8f'
export const LINE = '#120b10'

export const INTERNAL_W = 195
export const INTERNAL_H = 422

export const CROWD_PX = 12
export const CAT_PX = 24
export const HERO_PX = 32
export const BOSS_W = 72
export const BOSS_H = 64
export const GLYPH_W = 8
export const GLYPH_H = 10
