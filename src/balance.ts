export const MATCH_SECONDS = 180
export const CLASH_AT = 60
export const BOSS_AT = 150
export const BONE_RATE = 12
export const BONE_PER_SHIBA = 0.3
export const START_BONES = 40
export const START_SHIBAS = 5

export const HOLD_Y = 118
export const CASTLE_REACH = 100
export const GATE_DEPTH = 210
/** Feet-to-feet gap. A 24×24 soldier is 48 world px tall, so 52 leaves a sliver of meadow between dogs. */
export const GAP = 52
/** Must reach past GAP, or the two front lines would stop just out of bite. */
export const ATTACK_RANGE = 56

export const MAX_CATS = 420
export const FLOAT_TIME = 1.15
/** Clear and defeat banners. Short enough that the next match starts fast. */
export const BANNER_HOLD = 2.4
export const LOSE_HOLD = BANNER_HOLD

/** Rival breeds. The code still calls every foe a "cat"; kind is the breed. */
export const BREED_CHIHUAHUA = 0
export const BREED_CORGI = 1
export const BREED_BULLDOG = 2
export const BREEDS = 3
/** チワワ fast and frail, コーギー the baseline, ブルドッグ slow and tough. */
export const BREED_HP = [20, 30, 60] as const
export const BREED_DPS = [7, 9, 12] as const
export const BREED_SPEED = [72, 50, 30] as const
/** In a clash wave, every Nth dog is a ブルドッグ; N shrinks as the match runs on. */
export const BULLDOG_EVERY = 8
export const CASTLE_HP = 6000
/** 柴の家 at the bottom of the field. Cats that reach it bite it; at 0 the match is lost. */
export const HOME_HP = 1500
/** How far above the field floor a cat must be to bite the home. */
export const HOME_REACH = 40
export const WAVE_EVERY = 3.2
export const TRICKLE_EVERY = 3.2
export const TRICKLE_COUNT = 2
export const GUARD_CATS = 10

export const COST_TAN = 34
export const COST_BLACK = 90
export const STEP_TAN = 8
export const STEP_BLACK = 16
/** One shiba per tap, for every card. */
export const COUNT_TAN = 1
export const COUNT_BLACK = 1
export const HP_TAN = 70
export const HP_BLACK = 180
export const DPS_TAN = 26
export const DPS_BLACK = 24
export const SPEED_TAN = 88
export const SPEED_BLACK = 70

/** 白柴: barks from the second row. Each bark hits every cat in reach in its lane and both neighbors. */
export const COST_WHITE = 60
export const STEP_WHITE = 10
export const COUNT_WHITE = 1
export const HP_WHITE = 80
export const DPS_WHITE = 10
export const SPEED_WHITE = 76
export const BARK_EVERY = 1.1
export const BARK_HIT = 13
export const BARK_REACH = 90

/** 黒柴: one heavy bite at a time, enough to drop a cat. */
export const HEAVY_EVERY = 1.3
export const HEAVY_HIT = 80

/** Specials fire on their own once a coat has dealt this much damage. Order: 赤, 黒, 白. */
export const SPECIAL_NEED = [700, 480, 1000] as const
export const CUT_TIME = 1.1
/** 赤「サツマイモ!!」: every 赤 charges at double pace and double bite. */
export const RUSH_TIME = 4
/** 黒「ジャーキー!!」: the front three cats of every lane, and the castle once it can be hit. */
export const JERKY_HIT = 80
export const JERKY_DEPTH = 3
export const JERKY_CASTLE = 500
/** 白「チーズ!!」: a field-wide shockwave that also shoves cats back. */
export const CHEESE_HIT = 26
export const CHEESE_PUSH = 60

export const VIEW_W = 390
export const VIEW_H = 844

export const FIELD_X = 12
export const FIELD_Y = 56
export const FIELD_W = 366
export const FIELD_H = 608
export const PANEL_Y = 676

/** Five marching paths. They steer the sim; the field draws no lane stripes. */
export const LANE_COUNT = 5
export const MAX_SHIBAS = 600
export const MARCH_COUNT = 240

export const KIND_TAN = 0
export const KIND_BLACK = 1
export const KIND_WHITE = 2
export const KINDS = 3

export const BONE_X = 16
export const BONE_Y = 678
export const CARD_Y = 714
export const CARD_W = 114
export const CARD_H = 110
export const CARD_X0 = 16
export const CARD_X1 = 138
export const CARD_X2 = 260
export const CARD_XS = [CARD_X0, CARD_X1, CARD_X2] as const
