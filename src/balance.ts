export const CLASH_AT = 60
/** Every match sends this many regular dogs. Once the last has left the mansion the boss follows; beat every dog to win. */
export const DOG_COUNT = 110
export const BONE_RATE = 12
export const BONE_PER_SHIBA = 0.3
export const START_BONES = 40
export const START_SHIBAS = 5

export const HOLD_Y = 240
/** Feet-to-feet gap. A 16×16 soldier is 32 world px tall, so 36 leaves a sliver of meadow between dogs. */
export const GAP = 36
/** Must reach past GAP, or the two front lines would stop just out of bite. */
export const ATTACK_RANGE = 40

export const MAX_CATS = 420
export const FLOAT_TIME = 1.15
/** Clear and defeat banners. Short enough that the next match starts fast. */
export const BANNER_HOLD = 2.4
export const LOSE_HOLD = BANNER_HOLD

/** Rival breeds. The code still calls every foe a "cat"; kind is the breed. */
export const BREED_CHIHUAHUA = 0
export const BREED_CORGI = 1
export const BREED_BULLDOG = 2
export const BREED_DACHS = 3
export const BREED_GOLDEN = 4
export const BREEDS = 5
/** The boss, セントバーナード. Not part of the wave mix; it walks out of the mansion once every regular dog has been sent. */
export const BREED_BOSS = 5
export const BOSS_HP = 1500
export const BOSS_DPS = 40
export const BOSS_SPEED = 10
/** チワワ fast and frail, コーギー the baseline, ブルドッグ slow and tough. */
export const BREED_HP = [20, 30, 60, 14, 46] as const
export const BREED_DPS = [10, 12, 16, 9, 13] as const
export const BREED_SPEED = [44, 30, 18, 64, 22] as const
/** ダックスフント: a long, low sprinter that is gone before it is noticed. ゴールデン: a slow retriever behind a bone shield, which takes this much off every single hit (never below a third of it), so quick nips bounce and heavy hits and splashes get through. */
export const GOLDEN_ARMOR = 8
/** In a clash wave, every Nth dog is a ダックス / ゴールデン. */
export const DACHS_EVERY = 5
export const GOLDEN_EVERY = 9
/** In a clash wave, every Nth dog is a ブルドッグ; N shrinks as the match runs on. */
export const BULLDOG_EVERY = 7
/** 柴の家 at the bottom of the field. Cats that reach it bite it; at 0 the match is lost. */
export const HOME_HP = 1500
/** How far above the field floor a cat must be to bite the home. */
export const HOME_REACH = 40
export const WAVE_EVERY = 2.3
export const TRICKLE_EVERY = 3.2
export const TRICKLE_COUNT = 2
/** Free placement, once the clash starts: waves come as named patterns, announced one wave ahead. 0 is the old mixed trickle. */
export const WAVE_MIXED = 0
export const WAVE_SWARM = 1
export const WAVE_WALL = 2
export const WAVE_PINCER = 3
/** Dogs per pattern: 8 quick チワワ from one side, 4 ブルドッグ shoulder to shoulder, 6 コーギー split to both edges. */
export const SWARM_COUNT = 10
export const WALL_COUNT = 5
export const PINCER_COUNT = 8

export const COST_TAN = 34
export const COST_BLACK = 90
export const STEP_TAN = 8
export const STEP_BLACK = 16
/** One shiba per tap, for every card. */
/** Seconds a card needs before it can send another shiba. Order: 赤, 黒, 胡麻, 白. */
export const RECHARGE = [2.5, 6, 4, 7] as const
/** One shiba per tap, for every card. */
export const COUNT_TAN = 1
export const COUNT_BLACK = 1
/** Front-line fighters trade bites on this beat instead of draining HP every frame, so each attack can be seen. */
export const BITE_EVERY = 1
/** 赤柴 bites twice as fast in small nips. */
export const TAN_BITE_EVERY = 0.55
export const HP_TAN = 48
export const HP_BLACK = 240
export const DPS_TAN = 30
export const DPS_BLACK = 24
export const SPEED_TAN = 52
export const SPEED_BLACK = 34

/** 胡麻柴: throws a ball from the second row. Each bark hits every cat in reach in its lane and both neighbors. */
export const COST_SESAME = 60
export const STEP_SESAME = 10
export const COUNT_SESAME = 1
export const HP_SESAME = 40
export const DPS_SESAME = 10
export const SPEED_SESAME = 46
export const BARK_EVERY = 2
export const BARK_HIT = 42
export const BARK_REACH = 90

/** 白柴: the healer. Every HEAL_EVERY it mends the most-hurt shiba near it, in its path or the two beside. */
export const COST_WHITE = 64
export const STEP_WHITE = 16
export const COUNT_WHITE = 1
export const HP_WHITE = 75
export const DPS_WHITE = 6
export const SPEED_WHITE = 50
export const HEAL_EVERY = 1.5
export const HEAL_AMOUNT = 7
/** How far ahead (and a little behind) the healer reaches, in world px along the path. */
export const HEAL_REACH = 180

/** 黒柴: one heavy bite at a time, enough to drop a cat. */
export const HEAVY_EVERY = 2.3
export const HEAVY_HIT = 180

/** Specials fire on their own once a coat has dealt this much damage (白: healed this much). Order: 赤, 黒, 胡麻, 白. */
export const SPECIAL_NEED = [1000, 800, 1400, 900] as const
export const CUT_TIME = 1.1
/** After the cut-in the special strikes; its field effect plays for this long. */
export const FX_TIME = 0.9
/** 赤「サツマイモ!!」: every 赤 charges at double pace and double bite. */
export const RUSH_TIME = 3
/** 黒「ジャーキー!!」: the front three dogs of every lane, the boss included. */
export const JERKY_HIT = 80
export const JERKY_DEPTH = 3
/** 白「ササミ!!」: every shiba back to full, and the 柴の家 mended by this much. */
export const SASAMI_HOME = 300
/** 胡麻「チーズ!!」: a field-wide shockwave that also shoves cats back. */
export const CHEESE_HIT = 26
export const CHEESE_PUSH = 60
/** Free placement 胡麻「チーズ!!」is crowd control: light damage, a big shove, and every dog but the boss freezes. */
export const CHEESE_FREE_HIT = 10
export const CHEESE_FREE_PUSH = 90
export const CHEESE_STUN = 1.8
/** Free placement 黒「ジャーキー!!」is a few heavy single hits on the dogs nearest the 柴の家 (per FREE_DOG_HP). */
export const JERKY_FREE_HIT = 130

export const VIEW_W = 390
export const VIEW_H = 844

export const FIELD_X = 12
export const FIELD_Y = 56
export const FIELD_W = 366
export const FIELD_H = 608
export const PANEL_Y = 676

/** Five marching paths. They steer the sim; the field draws no lane stripes. */
export const LANE_COUNT = 5

/** Free placement (the ?free trial): shibas drop where you tap, inside the lower part of the field, and every unit walks to the nearest foe it can see. */
/** Field-local y above which a tap is pulled down: the deploy zone is the lower part of the field. */
export const FREE_ZONE_Y = 440
/** How far a shiba / a dog looks for a foe, in world px. */
export const FREE_SIGHT_SHIBA = 110
export const FREE_SIGHT_DOG = 100
/** Centre-to-centre distance at which two foes bite. */
export const FREE_REACH = 34
/** Units of one side push apart below this distance. */
export const FREE_SPACE = 25
/** With nothing in sight, shibas walk up to this line and wait. */
export const FREE_HOLD_Y = 250
/** Shibas never chase above this line, so they can't camp the mansion gate. */
export const FREE_SHIBA_TOP = 190
/** Roles in free placement. 赤 is the cheap, quick biter; 黒 the slow tank that dogs prefer to bite; 胡麻 throws balls from range with a splash; 白 heals everyone around it and never bites. */
/** 黒 looks this much closer to a dog than it is, so dogs turn to it first. */
export const TAUNT = 0.55
/** 胡麻's bark range, centre to centre, and the splash around the dog it barks at. */
export const BARK_RANGE = 140
export const BARK_SPLASH = 56
/** 白 mends every shiba inside this radius at once, every HEAL_EVERY; it stays this far behind the nearest shiba it follows. */
export const HEAL_RADIUS = 80
export const HEAL_FOLLOW = 46
/** The healer walks to a hurt shiba until it is within this share of HEAL_RADIUS. */
export const HEAL_CLOSE = 0.5
/** Distance (field px) that weighs as much as a whole HP bar when the healer picks whom to help. */
export const HEAL_SEEK_SPAN = 300
/** 赤 in free placement walks this much faster than the others. */
export const TAN_HASTE = 1.35
/** 黒「ジャーキー!!」in free placement: a spear drops on each of the dogs nearest the 柴の家, this many. */
export const JERKY_TARGETS = 2
/** A dog this close to the 柴の家 door bites the house. */
export const FREE_HOME_REACH = 60
/** A dog with nothing in sight walks straight down and turns for the door only this close to the bottom. */
export const FREE_TURN = 150
/** Shibas gang up on dogs in free placement, so dogs there get tougher and bite harder. */
export const FREE_DOG_HP = 2.6
export const FREE_DOG_DPS = 2.2
/** Waves come this many times slower in free placement, so fewer dogs crowd the field at once. */
export const FREE_WAVE_SLOW = 1.4
/** Everything walks this much slower in free placement, so each chase and bite reads. */
export const FREE_PACE = 0.65
/** Cards recharge this many times slower, and ホネ come in at this share, so shibas can't be spammed. */
export const FREE_RECHARGE = 1.5
export const FREE_INCOME = 0.8
/** Free placement: no ホネ to spend on a shiba. The only gates are the card's recharge and this many shibas alive on the field at once. */
export const FIELD_CAP = 8
export const MAX_SHIBAS = 600
export const MARCH_COUNT = 240

export const KIND_TAN = 0
export const KIND_BLACK = 1
export const KIND_SESAME = 2
export const KIND_WHITE = 3
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

/** Free placement: a tap within this many px of a shiba's middle sends it home; its middle sits this far above its feet; it runs this much faster than it walks. */
export const RECALL_TAP = 18
export const RECALL_LIFT = 10
export const RECALL_PACE = 2.2

/**
 * ステージ: the same yard, but each walk gets harder. Counts, dog toughness and the breed mix change.
 * Stage 2 matches the old default toughness. `*Every` is how often the horde sends that breed (0 = never).
 */
export interface StageSpec {
  /** Dogs before the boss. */
  count: number
  hp: number
  dps: number
  dachsEvery: number
  goldenEvery: number
  bulldogEvery: number
  /** 岩 and 池 on the field: ground units walk around them. */
  rocks: readonly Rock[]
}
export interface Rock {
  x: number
  y: number
  r: number
  /** A pond is drawn as water; both block the same way. */
  pond?: boolean
}
export const STAGES: readonly StageSpec[] = [
  { count: 70, hp: 0.85, dps: 0.85, dachsEvery: 0, goldenEvery: 0, bulldogEvery: 9, rocks: [] },
  { count: 90, hp: 1, dps: 1, dachsEvery: 7, goldenEvery: 14, bulldogEvery: 8, rocks: [
      { x: 58, y: 230, r: 10 },
      { x: 140, y: 300, r: 10 },
    ] },
  { count: 110, hp: 1.2, dps: 1.15, dachsEvery: 5, goldenEvery: 9, bulldogEvery: 7, rocks: [
      { x: 97, y: 210, r: 22, pond: true },
      { x: 38, y: 330, r: 10 },
      { x: 158, y: 340, r: 10 },
    ] },
  { count: 130, hp: 1.5, dps: 1.35, dachsEvery: 4, goldenEvery: 8, bulldogEvery: 6, rocks: [
      { x: 48, y: 190, r: 20, pond: true },
      { x: 148, y: 260, r: 20, pond: true },
      { x: 97, y: 350, r: 10 },
    ] },
  { count: 150, hp: 1.9, dps: 1.6, dachsEvery: 4, goldenEvery: 6, bulldogEvery: 5, rocks: [
      { x: 97, y: 250, r: 26, pond: true },
      { x: 34, y: 180, r: 10 },
      { x: 160, y: 180, r: 10 },
      { x: 48, y: 350, r: 10 },
      { x: 146, y: 350, r: 10 },
    ] },
]
/** Home HP left (share of full) for 3 and 2 stars at a win; any win is at least 1. */
export const STAR3_AT = 0.7
export const STAR2_AT = 0.35

/** 波を早く呼ぶ: tapping the call button sends the next wave now and pays CALL_BONE ホネ for each second skipped. */
export const CALL_BONE = 3
/** The call button, in field-local logical pixels under the 柴の家 (left of centre). */
export const CALL_X = 6
export const CALL_Y = 36
export const CALL_W = 54
export const CALL_H = 16
