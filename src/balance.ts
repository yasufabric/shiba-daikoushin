export const CLASH_AT = 60
/** Every match sends this many regular dogs. Once the last has left the mansion the boss follows; beat every dog to win. */
export const DOG_COUNT = 110
export const BONE_RATE = 12
export const BONE_PER_SHIBA = 0.3
export const START_BONES = 40
export const START_SHIBAS = 5

export const HOLD_Y = 240
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
/** The boss, セントバーナード. Not part of the wave mix; it walks out of the mansion once every regular dog has been sent. */
export const BREED_BOSS = 3
export const BOSS_HP = 2400
export const BOSS_DPS = 40
export const BOSS_SPEED = 10
/** チワワ fast and frail, コーギー the baseline, ブルドッグ slow and tough. */
export const BREED_HP = [20, 30, 60] as const
export const BREED_DPS = [10, 12, 16] as const
export const BREED_SPEED = [44, 30, 18] as const
/** In a clash wave, every Nth dog is a ブルドッグ; N shrinks as the match runs on. */
export const BULLDOG_EVERY = 7
/** 柴の家 at the bottom of the field. Cats that reach it bite it; at 0 the match is lost. */
export const HOME_HP = 1500
/** How far above the field floor a cat must be to bite the home. */
export const HOME_REACH = 40
export const WAVE_EVERY = 2.3
export const TRICKLE_EVERY = 3.2
export const TRICKLE_COUNT = 2

export const COST_TAN = 34
export const COST_BLACK = 90
export const STEP_TAN = 8
export const STEP_BLACK = 16
/** One shiba per tap, for every card. */
/** Seconds a card needs before it can send another shiba. Order: 赤, 黒, 白, 胡麻. */
export const RECHARGE = [2.5, 6, 4, 7] as const
/** One shiba per tap, for every card. */
export const COUNT_TAN = 1
export const COUNT_BLACK = 1
/** Front-line fighters trade bites on this beat instead of draining HP every frame, so each attack can be seen. */
export const BITE_EVERY = 0.7
export const HP_TAN = 70
export const HP_BLACK = 180
export const DPS_TAN = 26
export const DPS_BLACK = 24
export const SPEED_TAN = 52
export const SPEED_BLACK = 42

/** 白柴: barks from the second row. Each bark hits every cat in reach in its lane and both neighbors. */
export const COST_WHITE = 60
export const STEP_WHITE = 10
export const COUNT_WHITE = 1
export const HP_WHITE = 80
export const DPS_WHITE = 10
export const SPEED_WHITE = 46
export const BARK_EVERY = 1.1
export const BARK_HIT = 13
export const BARK_REACH = 90

/** 胡麻柴: the healer. Every HEAL_EVERY it mends the most-hurt shiba near it, in its path or the two beside. */
export const COST_SESAME = 64
export const STEP_SESAME = 16
export const COUNT_SESAME = 1
export const HP_SESAME = 70
export const DPS_SESAME = 6
export const SPEED_SESAME = 50
export const HEAL_EVERY = 1
export const HEAL_AMOUNT = 10
/** How far ahead (and a little behind) the healer reaches, in world px along the path. */
export const HEAL_REACH = 180

/** 黒柴: one heavy bite at a time, enough to drop a cat. */
export const HEAVY_EVERY = 1.3
export const HEAVY_HIT = 80

/** Specials fire on their own once a coat has dealt this much damage (胡麻: healed this much). Order: 赤, 黒, 白, 胡麻. */
export const SPECIAL_NEED = [700, 480, 1000, 600] as const
export const CUT_TIME = 1.1
/** After the cut-in the special strikes; its field effect plays for this long. */
export const FX_TIME = 0.9
/** 赤「サツマイモ!!」: every 赤 charges at double pace and double bite. */
export const RUSH_TIME = 4
/** 黒「ジャーキー!!」: the front three dogs of every lane, the boss included. */
export const JERKY_HIT = 80
export const JERKY_DEPTH = 3
/** 胡麻「ササミ!!」: every shiba back to full, and the 柴の家 mended by this much. */
export const SASAMI_HOME = 300
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
export const KIND_SESAME = 3
export const KINDS = 4

export const BONE_X = 16
export const BONE_Y = 678
export const CARD_Y = 714
/** Between matches: ホネ saved across matches buy coat levels. Every level adds LEVEL_STEP to a coat's HP, bite, bark, and heal. */
export const MAX_LEVEL = 10
export const LEVEL_STEP = 0.12
export const LEVEL_COST_BASE = 120
/** Match pay: a win pays WIN_PAY, a loss LOSS_PAY, plus BONE_PER_KILL for every dog beaten. */
export const WIN_PAY = 300
export const LOSS_PAY = 80
export const BONE_PER_KILL = 2

/** Level-up screen layout, in world px. Four coat rows, then the START button. */
export const SHOP_ROW_X = 30
export const SHOP_ROW_W = 330
export const SHOP_ROW_Y0 = 236
export const SHOP_ROW_H = 92
export const SHOP_ROW_GAP = 10
export const START_X = 95
export const START_Y = 660
export const START_W = 200
export const START_H = 72

export const CARD_W = 90
export const CARD_H = 110
export const CARD_X0 = 8
export const CARD_X1 = 102
export const CARD_X2 = 196
export const CARD_X3 = 290
export const CARD_XS = [CARD_X0, CARD_X1, CARD_X2, CARD_X3] as const
