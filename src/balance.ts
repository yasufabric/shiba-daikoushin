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
export const BREED_POODLE = 5
/** ポメラニアン: a fluffy medic that hangs back and mends the dogs around it. */
export const BREED_POM = 6
export const BREEDS = 7
/** The boss, セントバーナード. Not part of the wave mix; it walks out of the mansion once every regular dog has been sent. */
export const BREED_BOSS = 7
export const BOSS_HP = 1500
export const BOSS_DPS = 40
export const BOSS_SPEED = 10
/** チワワ fast and frail, コーギー the baseline, ブルドッグ slow and tough. */
export const BREED_HP = [20, 30, 60, 14, 46, 22, 26] as const
export const BREED_DPS = [10, 12, 16, 9, 13, 5, 4] as const
export const BREED_SPEED = [44, 30, 18, 64, 22, 26, 28] as const
/** ダックスフント: a long, low sprinter that is gone before it is noticed. ゴールデン: a slow retriever behind a bone shield, which takes this much off every single hit (never below a third of it), so quick nips bounce and heavy hits and splashes get through. */
export const GOLDEN_ARMOR = 8
/** プードル: stops well short and lobs a ball over the front line, then keeps lobbing. Frail, so shibas that get through to it end it quickly. */
export const POODLE_RANGE = 92
export const POODLE_EVERY = 2.2
/** In a clash wave, every Nth dog is a ダックス / ゴールデン. */
export const DACHS_EVERY = 5
export const GOLDEN_EVERY = 9
/** In a clash wave, every Nth dog is a ブルドッグ; N shrinks as the match runs on. */
export const BULLDOG_EVERY = 7
/** 柴の家 at the bottom of the field. Dogs that reach it hit it (free placement: once, see BREACH); at 0 the match is lost. */
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
/** Most dogs per pattern: quick チワワ from one side, ブルドッグ shoulder to shoulder, コーギー split to both edges. Early stages send fewer (see `patternSize`). */
export const SWARM_COUNT = 10
export const WALL_COUNT = 5
export const PINCER_COUNT = 8
/** Dogs in a pattern wave on this stage (0-based): swarm 4+stage, pincer 4+stage, wall 2+stage/2, each up to its cap. */
export function patternSize(kind: number, stage: number): number {
  if (kind === WAVE_SWARM) return Math.min(SWARM_COUNT, 4 + stage)
  if (kind === WAVE_PINCER) return Math.min(PINCER_COUNT, 4 + stage)
  if (kind === WAVE_WALL) return Math.min(WALL_COUNT, 2 + (stage >> 1))
  return 0
}
/** The clash ramps in: for its first CLASH_RAMP s every wave is cut to between CLASH_RAMP_FROM and full size. */
export const CLASH_RAMP = 60
export const CLASH_RAMP_FROM = 0.4
/** A dog that reaches the 柴の家 in free placement lands one breach hit (this share of HOME_HP) and leaves the field. Order: the breeds, then the boss. */
export const BREACH = [0.04, 0.04, 0.1, 0.04, 0.1, 0.04, 0.04, 0.3] as const
/** Free placement: a dog heading for a shiba that already has this many dogs at its side gives up on shibas and slips by for the house, so a thin line leaks a little at a time instead of holding until it breaks. */
export const CROWD_CAP = 3
/** 黒, the tank, holds this many. */
export const CROWD_CAP_TANK = 5

export const COST_TAN = 34
export const COST_BLACK = 90
export const STEP_TAN = 8
export const STEP_BLACK = 16
/** One shiba per tap, for every card. */
/** Seconds a card needs before it can send another shiba. Order: 赤, 黒, 胡麻, 白. */
export const RECHARGE = [2.5, 6, 4, 7, 5, 9, 8] as const
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

/** Skill gauge per coat: damage it has landed (白: healed; 応援: cheered). Order: 赤, 黒, 胡麻, 白, ぶち, どっしり, 応援. ?lanes fires on its own at this; free placement waits for a tap on the full card. */
export const SPECIAL_NEED = [2000, 1600, 3200, 1850, 2400, 2000, 1250] as const
/** Splash and pass-through hits (胡麻's ball, どっしり's stomp, ぶち's disc) fill the gauge at this share; only the dog aimed at counts in full. */
export const SPLASH_CHARGE = 0.3
/** ?lanes: after a special lands, no other special fires for this many seconds. */
export const SPECIAL_GAP = 7
/** ?lanes: the cut-in, then the strike's field effect. */
export const CUT_TIME = 1.1
export const FX_TIME = 0.9
/** ?lanes 赤: every 赤 charges at double pace and double bite. */
export const RUSH_TIME = 2
/** ?lanes 黒: the front three dogs of every lane, the boss included. */
export const JERKY_HIT = 80
export const JERKY_DEPTH = 3
/** ?lanes 白: every shiba back to full, and the 柴の家 mended by this much. */
export const SASAMI_HOME = 75
/** ?lanes 胡麻: a field-wide shockwave that also shoves dogs back. */
export const CHEESE_HIT = 26
export const CHEESE_PUSH = 60

/** Free placement skills: one per coat, fired by tapping its card when the gauge is full. The unit of that coat nearest a dog casts it. */
export const SKILL_NAMES = ['シバダッシュ', 'ホネのカベ', 'ボールの雨', 'ペロペロ', 'ブーメラン', 'ドスン', 'おうえん旗'] as const
/** No two skills within this many seconds. */
export const SKILL_GAP = 2
/** Skill damage is × the coat's level power × the stage's dog hp (× FREE_DOG_HP); the boss takes this share of it. */
export const SKILL_BOSS = 0.5
/** 赤「シバダッシュ」: the caster dashes this far up; every dog within DASH_WIDTH of the path takes DASH_HIT. */
export const DASH_LEN = 150
export const DASH_WIDTH = 26
export const DASH_HIT = 150
/** 黒「ホネのカベ」: a bone wall BONE_WALL_AHEAD px ahead of the caster, BONE_WALL_W wide on the 195 grid, BONE_WALL_HP × stage hp, for BONE_WALL_T s. */
export const BONE_WALL_AHEAD = 50
export const BONE_WALL_W = 60
export const BONE_WALL_HP = 900
export const BONE_WALL_T = 14
/** 胡麻「ボールの雨」: balls rain on the thickest knot of dogs, everything within BALL_RADIUS. */
export const BALL_RADIUS = 66
export const BALL_HIT = 50
export const BALL_STUN = 1.2
/** 白「ペロペロ」: every shiba within LICK_RADIUS of the caster gets LICK_HEAL of its max hp back; the 柴の家 gets LICK_HOME. */
export const LICK_RADIUS = 130
export const LICK_HEAL = 0.6
export const LICK_HOME = 75
/** ぶち「ブーメラン」: a big frisbee flies BOOM_LEN toward the nearest dog and back in BOOM_TIME s, hitting each dog within BOOM_WIDTH once each way. */
export const BOOM_LEN = 230
export const BOOM_WIDTH = 18
export const BOOM_HIT = 55
export const BOOM_TIME = 1.1
/** どっしり「ドスン」: every dog within STOMP_RADIUS takes STOMP_HIT and is stunned STOMP_STUN s. */
export const STOMP_RADIUS = 84
export const STOMP_HIT = 45
export const STOMP_STUN = 2
/** 応援「おうえん旗」: a flag for FLAG_T s; shibas within FLAG_RADIUS attack FLAG_HASTE× as often and regen FLAG_REGEN of max hp per second. */
export const FLAG_T = 10
export const FLAG_RADIUS = 96
export const FLAG_HASTE = 1.6
export const FLAG_REGEN = 0.03

export const VIEW_W = 390
export const VIEW_H = 844

export const FIELD_X = 12
export const FIELD_Y = 56
export const FIELD_W = 366
export const FIELD_H = 608
export const PANEL_Y = 676
/** Free placement: dogs walk out this far below the old spawn rows, so the HUD band at the top of the field (STAGE n, dogs left, the wave warning) stays clear. Field px (20 internal px). */
export const HUD_DROP = 40

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
export const FREE_SPACE = 34
/** A shiba and a dog never stand closer than this (centre to centre), so one is never drawn on top of the other. */
export const FOE_SPACE = 28
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
/** A dog this close to the 柴の家 door bites the house. */
export const FREE_HOME_REACH = 60
/** A dog with nothing in sight walks straight down and turns for the door only this close to the bottom. */
export const FREE_TURN = 150
/** Shibas gang up on dogs in free placement, so dogs there get tougher and bite harder. */
export const FREE_DOG_HP = 1.5
export const FREE_DOG_DPS = 2.2
/** Waves come this many times slower in free placement, so fewer dogs crowd the field at once. */
export const FREE_WAVE_SLOW = 1.4
/** Everything walks this much slower in free placement, so each chase and bite reads. */
export const FREE_PACE = 0.65
/** Cards recharge this many times slower, and ホネ come in at this share, so shibas can't be spammed. */
export const FREE_RECHARGE = 1.5
export const FREE_INCOME = 0.8
/** ?lanes-era cap on shibas alive at once. Free placement is one per coat now (at most DECK_SIZE out), so it never bites there. */
export const FIELD_CAP = 8
/** 1種1匹 (free placement): seconds a coat's card waits after its shiba falls before it can go out again. Order: 赤, 黒, 胡麻, 白, ぶち, どっしり, 応援. */
export const RESPAWN = [8, 13, 10, 11, 10, 14, 11] as const
/** A shiba recalled home (long press) is back this many seconds after it walks in the door. */
export const RECALL_BACK = 2
/** Each coat fights alone, so its hp and every per-hit number (bites, slams, balls, discs, stomps, heals) are × this in free placement. Skills are not. */
export const SOLO = [2.5, 2.3, 2.6, 2.4, 2.6, 2.2, 2.4] as const
/** Seconds for a skill gauge to fill on its own while its shiba is on the field (damage and healing still add on top). */
export const SKILL_PASSIVE = [50, 45, 50, 22, 50, 40, 22] as const
export const MAX_SHIBAS = 600
export const MARCH_COUNT = 240

export const KIND_TAN = 0
export const KIND_BLACK = 1
export const KIND_SESAME = 2
export const KIND_WHITE = 3
/** ぶち柴 (the frisbee thrower) and どっしり柴 (the slow stomper). Free placement only. */
export const KIND_DISC = 4
export const KIND_BIG = 5
/** 応援柴: a golden shiba with a flag; it deals no damage, but every shiba near it bites faster. */
export const KIND_CHEER = 6
export const KINDS = 7
/** Cards in a deck: the shop picks this many of the roster. */
export const DECK_SIZE = 4
export const DEFAULT_DECK = [0, 1, 2, 3] as const

export const BONE_X = 16
export const BONE_Y = 678
export const CARD_Y = 714
/** Between matches: ホネ saved across matches buy coat levels. Every level adds LEVEL_STEP to a coat's HP, bite, bark, and heal. */
export const MAX_LEVEL = 10
export const LEVEL_STEP = 0.07
export const LEVEL_COST_BASE = 120
/** Match pay: a win pays WIN_PAY, a loss LOSS_PAY, plus BONE_PER_KILL for every dog beaten. */
export const WIN_PAY = 300
export const LOSS_PAY = 80
export const BONE_PER_KILL = 2

/** Level-up screen layout, in world px: a two-column grid of coat cards (portrait zone picks the deck, the rest buys a level), then START. */
export const SHOP_X0 = 12
export const SHOP_Y0 = 236
export const SHOP_CELL_W = 179
export const SHOP_CELL_H = 124
export const SHOP_GAP = 8
/** The left part of a cell, in world px, that toggles the coat in the deck. */
export const SHOP_PICK_W = 84
/** Top-left of a coat's cell. */
export function shopCell(kind: number): { x: number; y: number } {
  return { x: SHOP_X0 + (kind % 2) * (SHOP_CELL_W + SHOP_GAP), y: SHOP_Y0 + Math.floor(kind / 2) * (SHOP_CELL_H + SHOP_GAP) }
}
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
/** Recall needs a press held this long (s) on the shiba; a quicker tap there deploys as usual. */
export const RECALL_HOLD = 0.3

/**
 * ステージ: the same yard, but each walk gets harder. Counts, dog toughness and the breed mix change.
 * `*Every` is how often the horde sends that breed (0 = never). Tuned with `tools/bot.ts`: the numbers are not monotonic on purpose,
 * because the deck grows (stage 1 has 赤+黒 only, stage 2 adds 胡麻, stage 3 白) and fences and ponds change how hard a field is.
 */
export interface StageSpec {
  /** Dogs before the boss. */
  count: number
  hp: number
  dps: number
  dachsEvery: number
  /** Every Nth clash dog is a プードル (0: none). */
  poodleEvery: number
  /** Every Nth clash dog is a ポメラニアン (0: none). */
  pomEvery: number
  goldenEvery: number
  bulldogEvery: number
  /** 岩 and 池 on the field: ground units walk around them. */
  rocks: readonly Rock[]
  /** 柵: wooden fences across the field. Everyone walks around them; dogs that bump into one bite it down. */
  walls?: readonly Wall[]
}
/** Rocks and walls are authored on a 195-wide grid across the field (x) and in field px down it (y); see `gridX`. */
export interface Wall {
  x: number
  y: number
  w: number
}
/** A 柵 takes this much biting (× the stage's dog hp) before it breaks. */
export const WALL_HP = 700
/** Half the fence's thickness, in field px. */
export const WALL_HALF = 8
/** Authoring grid → field px across. */
export function gridX(x: number): number {
  return (x * FIELD_W) / 195
}
export interface Rock {
  x: number
  y: number
  r: number
  /** A pond is drawn as water; both block the same way. */
  pond?: boolean
}
export const STAGES: readonly StageSpec[] = [
  { count: 75, hp: 1.3, dps: 1.15, dachsEvery: 0, poodleEvery: 0, pomEvery: 0, goldenEvery: 0, bulldogEvery: 9, rocks: [] },
  { count: 150, hp: 2.35, dps: 1.85, dachsEvery: 7, poodleEvery: 9, pomEvery: 0, goldenEvery: 14, bulldogEvery: 8, rocks: [
      { x: 58, y: 230, r: 10 },
      { x: 140, y: 300, r: 10 },
    ], walls: [{ x: 97, y: 370, w: 50 }] },
  { count: 150, hp: 2.43, dps: 1.76, dachsEvery: 5, poodleEvery: 7, pomEvery: 0, goldenEvery: 9, bulldogEvery: 7, rocks: [
      { x: 97, y: 210, r: 22, pond: true },
      { x: 38, y: 330, r: 10 },
      { x: 158, y: 340, r: 10 },
    ], walls: [{ x: 40, y: 270, w: 44 }, { x: 155, y: 270, w: 44 }] },
  { count: 150, hp: 2.75, dps: 1.9, dachsEvery: 4, poodleEvery: 6, pomEvery: 11, goldenEvery: 8, bulldogEvery: 6, rocks: [
      { x: 48, y: 190, r: 20, pond: true },
      { x: 148, y: 260, r: 20, pond: true },
      { x: 97, y: 350, r: 10 },
    ], walls: [{ x: 52, y: 320, w: 50 }] },
  { count: 160, hp: 2.8, dps: 1.9, dachsEvery: 4, poodleEvery: 5, pomEvery: 9, goldenEvery: 6, bulldogEvery: 5, rocks: [
      { x: 97, y: 250, r: 26, pond: true },
      { x: 34, y: 180, r: 10 },
      { x: 160, y: 180, r: 10 },
      { x: 48, y: 350, r: 10 },
      { x: 146, y: 350, r: 10 },
    ], walls: [{ x: 40, y: 310, w: 40 }, { x: 155, y: 310, w: 40 }] },
  { count: 170, hp: 3, dps: 2, dachsEvery: 3, poodleEvery: 4, pomEvery: 8, goldenEvery: 6, bulldogEvery: 5, rocks: [
      { x: 40, y: 220, r: 22, pond: true },
      { x: 154, y: 220, r: 22, pond: true },
      { x: 97, y: 320, r: 12 },
    ], walls: [{ x: 97, y: 220, w: 30 }] },
  { count: 180, hp: 3.2, dps: 2.1, dachsEvery: 3, poodleEvery: 3, pomEvery: 7, goldenEvery: 5, bulldogEvery: 4, rocks: [
      { x: 30, y: 170, r: 10 },
      { x: 70, y: 260, r: 10 },
      { x: 124, y: 260, r: 10 },
      { x: 164, y: 170, r: 10 },
      { x: 97, y: 360, r: 16, pond: true },
    ], walls: [{ x: 40, y: 320, w: 40 }, { x: 155, y: 320, w: 40 }] },
  { count: 190, hp: 3.5, dps: 2.2, dachsEvery: 3, poodleEvery: 3, pomEvery: 6, goldenEvery: 4, bulldogEvery: 4, rocks: [
      { x: 97, y: 200, r: 30, pond: true },
      { x: 30, y: 300, r: 18, pond: true },
      { x: 164, y: 300, r: 18, pond: true },
      { x: 97, y: 370, r: 10 },
    ], walls: [{ x: 97, y: 300, w: 56 }] },
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

/** ぶち柴: throws a frisbee in a straight line; it cuts through every dog along the way. */
export const HP_DISC = 36
export const DPS_DISC = 8
export const SPEED_DISC = 50
export const DISC_EVERY = 1.9
export const DISC_HIT = 32
/** Starts throwing from this far, and the disc flies this far from the thrower. */
export const DISC_REACH = 125
export const DISC_RANGE = 190
/** Half-width of the disc's path. */
export const DISC_WIDTH = 13

/** どっしり柴: slow and sturdy; every beat it stomps everything within reach of its own paws. */
export const HP_BIG = 300
export const DPS_BIG = 0
export const SPEED_BIG = 24
export const BIG_EVERY = 2.2
export const BIG_HIT = 52
export const BIG_RADIUS = 44

/** ヒーロー柴: one extra shiba the player steers. Tap the field above the deploy strip and it walks there, spinning at every dog in reach; when it falls it comes back at the 柴の家 after HERO_REVIVE seconds. */
export const HERO_HP = 320
export const HERO_SPEED = 62
export const HERO_EVERY = 0.9
export const HERO_HIT = 26
export const HERO_RADIUS = 30
export const HERO_REVIVE = 16
/** Field taps above this y (below FREE_ZONE_Y) steer the hero instead of deploying. */
export const HERO_TAP_Y = 420

/** にゃんこ-style unlocks: a coat joins once this stage (index) has a star; -1 is open from the start. 赤柴 and 黒柴 start (a new player needs a tank); each stage cleared brings the next coat (胡麻 after stage 1, 白 after 2, ぶち after 3, どっしり after 4, 応援 after 5). */
export const COAT_UNLOCK = [-1, -1, 0, 1, 2, 3, 4] as const

/** 応援柴 stats. It trails the nearest shiba; every shiba within CHEER_RADIUS attacks CHEER_HASTE× as often. Its gauge fills CHEER_CHARGE per second while it has a shiba in range. */
export const HP_CHEER = 70
export const DPS_CHEER = 0
export const SPEED_CHEER = 40
export const CHEER_RADIUS = 58
export const CHEER_HASTE = 1.4
export const CHEER_CHARGE = 24

/** The boss howls every BOSS_HOWL_EVERY s (first one BOSS_HOWL_FIRST s after it walks out). From stage BOSS_CALL_FROM (index) the howl calls BOSS_CALL チワワ to its side; from BOSS_STUN_FROM it also freezes every shiba within BOSS_HOWL_R for BOSS_STUN s. */
export const BOSS_HOWL_EVERY = 9
export const BOSS_HOWL_FIRST = 5
export const BOSS_CALL_FROM = 2
export const BOSS_CALL = 3
export const BOSS_STUN_FROM = 5
export const BOSS_HOWL_R = 64
export const BOSS_STUN = 1.5

/** ヒーロー柴's own move (tap the hero): a big spin that hits every dog within HERO_SKILL_R for HERO_SKILL_HIT, then HERO_SKILL_CD s to recharge. Taps within HERO_TAP_R of it count. */
export const HERO_SKILL_R = 62
export const HERO_SKILL_HIT = 90
export const HERO_SKILL_CD = 14
export const HERO_TAP_R = 28
/** The hero is aimed at a little above its feet, where the sprite is. */
export const HERO_TAP_LIFT = 28

/** ポメラニアン: every POM_EVERY s it mends each dog within POM_RADIUS (not itself, not the boss) by POM_HEAL, and keeps POM_KEEP behind the nearest shiba. */
export const POM_EVERY = 1.6
export const POM_RADIUS = 52
export const POM_HEAL = 8
export const POM_KEEP = 70

/** 宝箱: a win leaves a chest where START goes; tapping it pays CHEST_BASE + CHEST_STAGE per stage, × (1 + CHEST_STAR per star), ±20%. */
export const CHEST_BASE = 30
export const CHEST_STAGE = 15
export const CHEST_STAR = 0.25

/** The ヒーロー柴 levels up on the result screen like a coat: its level lives at levels[HERO_SLOT], after the coats. */
export const HERO_SLOT = KINDS

/** エンドレス: opens after the last stage. Stage 8's mix with no boss and no end; dogs get ENDLESS_RAMP× tougher and harder-biting every 100 s. The score is dogs beaten. */
export const ENDLESS_STAGE: StageSpec = { count: 999999, hp: 3.5, dps: 2.2, dachsEvery: 3, poodleEvery: 3, pomEvery: 6, goldenEvery: 4, bulldogEvery: 4, rocks: [
  { x: 60, y: 230, r: 12 },
  { x: 134, y: 230, r: 12 },
], walls: [{ x: 97, y: 330, w: 56 }] }
export const ENDLESS_RAMP = 0.5

/** From this stage (index) on, and in エンドレス, the boss is the dark 黒バーナード. */
export const BOSS_DARK_FROM = 4

/** おやつ砲 (the 柴の家's cannon, after にゃんこ砲): charges over CANNON_CHARGE s; when full, tapping the house fires a wave up the field to CANNON_REACH (field y from the bottom) that hits every dog for CANNON_HIT × stage hp and shoves it back CANNON_PUSH. */
export const CANNON_CHARGE = 45
export const CANNON_REACH = 300
export const CANNON_HIT = 40
export const CANNON_PUSH = 40
/** Taps within this of the house's middle (field coords, measured from the floor up CANNON_TAP_UP) fire it. */
export const CANNON_TAP = 40
export const CANNON_TAP_UP = 30

/** ヒーロー柴 is switched off for now (it got in the way: taps above the strip moved it instead of placing shibas). Flip to true to bring it, its level cell and its taps back. */
export const HERO_ENABLED = false

/** Free placement levels itself: after every match each deck coat gains XP_BASE_GAIN + XP_PER_STAGE × stage, × (1 + its share of the deck's damage, healing and cheering), × XP_WIN on a win. XP_NEED_BASE × level^XP_NEED_EXP takes it to the next level, so it gets steep. */
export const XP_BASE_GAIN = 150
export const XP_PER_STAGE = 25
export const XP_WIN = 1.5
export const XP_NEED_BASE = 300
export const XP_NEED_EXP = 1.5
/** おやつ: feeding a coat on the result screen trades ホネ for XP (FEED_COST × level ホネ for FEED_SHARE of the level's need). */
export const FEED_COST = 80
export const FEED_SHARE = 0.3
/** Levels that unlock a coat's perks: PERK_A its own trick, PERK_B a faster special gauge (PERK_B_CHARGE×). */
export const PERK_A = 5
export const PERK_B = 10
export const PERK_B_CHARGE = 1.3
/** Perk A numbers: 赤 bites faster, 黒 knocks back, 胡麻 splashes wider, 白 heals wider, ぶち throws farther, どっしり stuns, 応援 reaches wider. */
export const PERK_TAN_HASTE = 1.25
export const PERK_BLACK_PUSH = 16
export const PERK_WIDE = 1.3
/** 胡麻's wider splash. Smaller than PERK_WIDE: a 1.3× radius (1.7× the area) made Lv5 a cliff on every later stage. */
export const PERK_SPLASH = 1.12
export const PERK_DISC_RANGE = 1.25
export const PERK_BIG_STUN = 0.5

/** おやつ砲 is switched off (play-test: tapping the house was not wanted). */
export const CANNON_ENABLED = false
