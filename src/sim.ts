import {
  ATTACK_RANGE,
  BONE_PER_SHIBA,
  BONE_RATE,
  DOG_COUNT,
  STAGES,
  type Rock,
  STAR2_AT,
  STAR3_AT,
  HOME_HP,
  COAT_UNLOCK,
  HERO_HP,
  HERO_SPEED,
  HERO_EVERY,
  HERO_HIT,
  HERO_RADIUS,
  HERO_REVIVE,
  HERO_TAP_Y,
  CHEST_BASE,
  CHEST_STAGE,
  CHEST_STAR,
  HERO_SKILL_R,
  HERO_SKILL_HIT,
  HERO_SKILL_CD,
  HOME_REACH,
  BREED_BULLDOG,
  BREED_DACHS,
  BREED_GOLDEN,
  BREED_POODLE,
  BREED_POM,
  POM_EVERY,
  POM_RADIUS,
  POM_HEAL,
  POM_KEEP,
  POODLE_EVERY,
  POODLE_RANGE,
  GOLDEN_ARMOR,
  BREED_CHIHUAHUA,
  BREED_CORGI,
  BREED_DPS,
  BREED_HP,
  BREED_SPEED,
  WAVE_MIXED,
  WAVE_SWARM,
  WAVE_WALL,
  WAVE_PINCER,
  SWARM_COUNT,
  WALL_COUNT,
  PINCER_COUNT,
  CALL_BONE,
  CLASH_AT,
  COST_BLACK,
  COST_TAN,
  COUNT_BLACK,
  COUNT_TAN,
  DPS_BLACK,
  DPS_TAN,
  FIELD_H,
  FIELD_W,
  FLOAT_TIME,
  GAP,
  HOLD_Y,
  HP_BLACK,
  HP_TAN,
  KIND_BIG,
  KIND_CHEER,
  BOSS_HOWL_EVERY,
  BOSS_HOWL_FIRST,
  BOSS_CALL_FROM,
  BOSS_CALL,
  BOSS_STUN_FROM,
  BOSS_HOWL_R,
  BOSS_STUN,
  HP_CHEER,
  DPS_CHEER,
  SPEED_CHEER,
  CHEER_RADIUS,
  CHEER_HASTE,
  CHEER_CHARGE,
  WANWAN_T,
  WANWAN_HASTE,
  KIND_DISC,
  DISC_EVERY,
  DISC_HIT,
  DISC_REACH,
  DISC_RANGE,
  DISC_WIDTH,
  BORO_HIT,
  BORO_BAND,
  BIG_EVERY,
  BIG_HIT,
  BIG_RADIUS,
  MILK_HIT,
  MILK_RADIUS,
  MILK_STUN,
  HP_DISC,
  HP_BIG,
  DPS_DISC,
  DPS_BIG,
  SPEED_DISC,
  SPEED_BIG,
  KIND_BLACK,
  KIND_TAN,
  LANE_COUNT,
  BANNER_HOLD,
  LOSE_HOLD,
  MAX_CATS,
  MAX_SHIBAS,
  SPEED_BLACK,
  SPEED_TAN,
  START_BONES,
  START_SHIBAS,
  STEP_BLACK,
  STEP_TAN,
  TRICKLE_COUNT,
  TRICKLE_EVERY,
  WAVE_EVERY,
  BARK_EVERY,
  BARK_HIT,
  BARK_REACH,
  CHEESE_HIT,
  CHEESE_PUSH,
  CHEESE_FREE_HIT,
  CHEESE_FREE_PUSH,
  CHEESE_STUN,
  JERKY_FREE_HIT,
  COST_SESAME,
  COUNT_SESAME,
  CUT_TIME,
  FX_TIME,
  DPS_SESAME,
  HEAVY_EVERY,
  HEAVY_HIT,
  HP_SESAME,
  JERKY_DEPTH,
  JERKY_HIT,
  KIND_SESAME,
  KIND_WHITE,
  COST_WHITE,
  COUNT_WHITE,
  DPS_WHITE,
  HP_WHITE,
  SPEED_WHITE,
  STEP_WHITE,
  HEAL_AMOUNT,
  HEAL_EVERY,
  HEAL_REACH,
  FREE_HOLD_Y,
  FREE_HOME_REACH,
  RECALL_TAP,
  RECALL_LIFT,
  RECALL_PACE,
  FREE_REACH,
  FREE_SIGHT_DOG,
  FREE_SIGHT_SHIBA,
  FREE_SPACE,
  FREE_TURN,
  FREE_DOG_DPS,
  FREE_DOG_HP,
  FREE_WAVE_SLOW,
  FREE_INCOME,
  FIELD_CAP,
  FREE_PACE,
  FREE_SHIBA_TOP,
  TAUNT,
  BARK_RANGE,
  BARK_SPLASH,
  HEAL_RADIUS,
  HEAL_FOLLOW,
  HEAL_CLOSE,
  HEAL_SEEK_SPAN,
  TAN_HASTE,
  TAN_BITE_EVERY,
  JERKY_TARGETS,
  FREE_RECHARGE,
  FREE_ZONE_Y,
  BITE_EVERY,
  RECHARGE,
  BONE_PER_KILL,
  BOSS_DPS,
  BOSS_HP,
  BOSS_SPEED,
  BREED_BOSS,
  LEVEL_COST_BASE,
  LEVEL_STEP,
  LOSS_PAY,
  MAX_LEVEL,
  WIN_PAY,
  SASAMI_HOME,
  KINDS,
  DECK_SIZE,
  DEFAULT_DECK,
  RUSH_TIME,
  SPECIAL_NEED,
  SPEED_SESAME,
  STEP_SESAME,
} from './balance'

export type Phase = 'grow' | 'clash'
export type Outcome = 'play' | 'won' | 'lost'

export interface Unit {
  alive: boolean
  x: number
  y: number
  speed: number
  kind: number
  lane: number
  hp: number
  /** Full health for this unit; healing stops here. */
  maxHp: number
  dps: number
  fly: number
  /** Seconds until the next heavy bite or bark. */
  cd: number
  /** Seconds until this unit's next front-line bite. */
  bite: number
  /** Match time of the last bite this unit landed, for the lunge and spark. */
  bitAt: number
  /** Where 胡麻's last bark landed, for its sound wave. */
  aimX: number
  aimY: number
  /** Match time 白 last mended this unit, for the plus over its head. */
  mendAt: number
  /** Seconds a dog stays frozen in place (チーズ!!). */
  stun: number
  /** Free placement: ordered home; walks to the 柴の家 and leaves the field there. */
  recall: boolean
}

export interface Input {
  /** Deploy this card now (-1 for none). */
  card: number
  /** Path to deploy into; when left out, the card goes down the next path in turn. */
  lane?: number
  /** Free placement: field-local point to deploy at. */
  at?: { x: number; y: number }
  /** Free placement: field-local point of a tap; the shiba standing there is sent home to the 柴の家. */
  recall?: { x: number; y: number }
  /** Free placement: send the ヒーロー柴 to this field-local point. */
  hero?: { x: number; y: number }
  /** Free placement: fire the ヒーロー柴's big spin. */
  heroSkill?: boolean
  /** Pick this card for the next field tap (-1 or left out for no change). */
  pick?: number
  /** 波を早く呼ぶ: send the next wave now for bonus ホネ. */
  callWave?: boolean
  /** On the title screen, play this stage. */
  pickStage?: number
  /** On the result screen, go back to the title. */
  home?: boolean
  /** On the result screen: open the 宝箱. */
  openChest?: boolean
  /** From the pause menu: give up this match and go back to the title. */
  quit?: boolean
  /** On the level-up screen, buy a level for this coat. */
  levelUp?: number
  /** On the level-up screen, put this coat in or take it out of the deck. */
  toggleDeck?: number
  restart: boolean
}

export const NO_INPUT: Input = { card: -1, restart: false }

export interface Sim {
  time: number
  bones: number
  seed: number
  aliveShibas: number
  aliveCats: number
  cursorS: number
  cursorC: number
  shibas: Unit[]
  cats: Unit[]
  costTan: number
  costBlack: number
  costWhite: number
  costSesame: number
  /** The boss dog's slot in sim.cats once it has come out, or -1. */
  bossIndex: number
  /** Dogs beaten this match. */
  kills: number
  /** Regular dogs still waiting in the mansion. */
  toSend: number
  homeHp: number
  boss: boolean
  floatT: number
  floatDmg: number
  outcome: Outcome
  tutorial: boolean
  /** The ?free trial is on. */
  free: boolean
  /** The card a field tap will deploy. */
  picked: number
  /** Seconds until each card can send another shiba; 0 when ready. */
  recharge: number[]
  /** Coat levels, in card order. Kept across matches. */
  levels: number[]
  /** ホネ saved for levels. Kept across matches. */
  purse: number
  /** What the last match paid into the purse. */
  earned: number
  /** Bumps whenever levels or the purse change, so the shell knows to save. */
  saveSeq: number
  /** The title screen is up: nothing plays until a stage is picked. */
  title: boolean
  /** The coats brought to a match, in dock order: DECK_SIZE of the roster. */
  deck: number[]
  /** A coat this result unlocked (shown NEW! on the result screen), or -1. */
  newCoat: number
  /** 宝箱 on the result screen: 0 none, 1 waiting to be opened, 2 opened. chestBones is what it pays. */
  chest: number
  chestBones: number
  /** Current stage index (0-based). */
  stage: number
  /** Best stars per stage, 0 = not cleared. Kept across matches. */
  best: number[]
  /** Stars won by the last match (0 after a loss). */
  stars: number
  /** ホネ banked this match by calling waves early. */
  callBonus: number
  /** Where the last special landed, for 白 ボーロ (row y) and ミルク (point). */
  fxX: number
  fxY: number
  /** Pulse timer for the call button after a call. */
  callT: number
  rewardT: number
  nextCat: number
  deny0: number
  deny1: number
  deny2: number
  deny3: number
  /** Special gauge per coat, in damage dealt. Fires at SPECIAL_NEED. */
  charge: number[]
  /** The coat whose special cut-in is showing, or -1. */
  cutKind: number
  cutT: number
  /** The special whose field effect is playing, or -1, and its remaining time. Set when the cut-in ends and the special strikes. */
  fxKind: number
  fxT: number
  /** Counts strikes so the renderer can spot a new one. */
  fxId: number
  /** What the last strike did to each unit it touched: field-local spot, amount, and whether it was a heal. */
  fxHits: { x: number; y: number; v: number; heal: boolean }[]
  /** Coat whose special struck this step, or -1. */
  sfxStrike: number
  rushT: number
  /** ワンワン!! time left: every shiba attacks faster. */
  wanT: number
  /** Match time of the boss's last howl (for the rings and the growl), -9 for none. */
  howlAt: number
  /** ヒーロー柴: a steered shiba kept outside the pools. alive=false while it waits to come back (heroT seconds). */
  hero: Unit
  heroT: number
  heroOn: boolean
  /** The player has steered the hero at least once (ever, via the save); until then the field shows a TAP! hint. */
  heroUsed: boolean
  /** Where the last tap sent it; null when it holds. */
  heroGo: { x: number; y: number } | null
  /** Match time of its last spin, for the renderer. */
  heroSpinAt: number
  /** Seconds until the big spin is ready again; match time it last fired. */
  heroSkillT: number
  heroSkillAt: number
  /** Coat whose special just fired this step, or -1. */
  sfxSpecial: number
  seq: number
  /** Free placement: the pattern of the NEXT wave (WAVE_*), which side it comes from (0 left, 1 right, 2 middle), and how many dogs. */
  planKind: number
  planSide: number
  planCount: number
  /** Clash-wave dogs sent so far; every stage-set bulldogEvery-th is a ブルドッグ. */
  horde: number
  sfxDeploy: number
  laneS: Int16Array[]
  laneC: Int16Array[]
  laneSN: Int16Array
  laneCN: Int16Array
}

export interface SimOptions {
  tutorial?: boolean
  seed?: number
  /** Saved coat levels, in card order. */
  levels?: readonly number[]
  /** Saved ホネ for buying levels. */
  purse?: number
  /** The ?free trial: tap anywhere in the lower field, units chase the nearest foe. */
  free?: boolean
  /** Include the steered ヒーロー柴 (free placement only). Off by default so unit tests stay about the cards. */
  hero?: boolean
  /** Stage to start on and the best stars per stage so far. */
  stage?: number
  best?: readonly number[]
  /** Open on the title screen. */
  title?: boolean
  /** Saved deck: coat numbers in dock order. */
  deck?: readonly number[]
}

const OPEN_Y = [430, 470, 510, 550, 400, 500, 540, 580, 620, 470]
const OPEN_LANE = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]

export function phaseAt(time: number): Phase {
  if (time >= CLASH_AT) return 'clash'
  return 'grow'
}

function makePool(max: number): Unit[] {
  const units: Unit[] = []
  for (let i = 0; i < max; i++) {
    units.push({
      alive: false,
      x: 0,
      y: 0,
      speed: 0,
      kind: KIND_TAN,
      lane: 0,
      hp: 0,
      maxHp: 0,
      dps: 0,
      fly: 0,
      cd: 0,
      bite: 0,
      bitAt: -9,
      aimX: 0,
      aimY: 0,
      mendAt: -9,
      stun: 0,
      recall: false,
    })
  }
  return units
}

export function createSim(opts?: SimOptions): Sim {
  const sim: Sim = {
    time: 0,
    bones: START_BONES,
    seed: opts?.seed ?? 1,
    aliveShibas: 0,
    aliveCats: 0,
    cursorS: 0,
    cursorC: 0,
    shibas: makePool(MAX_SHIBAS),
    cats: makePool(MAX_CATS),
    costTan: COST_TAN,
    costBlack: COST_BLACK,
    costWhite: COST_SESAME,
    costSesame: COST_WHITE,
    bossIndex: -1,
    kills: 0,
    toSend: DOG_COUNT,
    homeHp: HOME_HP,
    boss: false,
    floatT: 0,
    floatDmg: 0,
    outcome: 'play',
    tutorial: opts?.tutorial !== false,
    free: opts?.free === true,
    picked: KIND_TAN,
    recharge: Array.from({ length: KINDS }, () => 0),
    levels: Array.from({ length: KINDS }, (_, i) => Math.min(MAX_LEVEL, Math.max(1, Math.floor(opts?.levels?.[i] ?? 1)))),
    purse: Math.max(0, Math.floor(opts?.purse ?? 0)),
    earned: 0,
    saveSeq: 0,
    title: opts?.title === true,
    deck: [...DEFAULT_DECK],
    newCoat: -1,
    chest: 0,
    chestBones: 0,
    stage: Math.min(STAGES.length - 1, Math.max(0, Math.floor(opts?.stage ?? 0))),
    best: STAGES.map((_, i) => Math.min(3, Math.max(0, Math.floor(opts?.best?.[i] ?? 0)))),
    stars: 0,
    callBonus: 0,
    fxX: 0,
    fxY: 0,
    callT: 0,
    rewardT: 0,
    nextCat: CLASH_AT,
    planKind: WAVE_MIXED,
    planSide: 2,
    planCount: 0,
    deny0: 0,
    deny1: 0,
    deny2: 0,
    deny3: 0,
    charge: [0, 0, 0, 0],
    cutKind: -1,
    cutT: 0,
    fxKind: -1,
    fxT: 0,
    fxId: 0,
    fxHits: [],
    sfxStrike: -1,
    rushT: 0,
    wanT: 0,
    howlAt: -9,
    hero: makePool(1)[0] as Unit,
    heroT: 0,
    heroOn: opts?.hero === true,
    heroUsed: false,
    heroGo: null,
    heroSpinAt: -9,
    heroSkillT: 0,
    heroSkillAt: -9,
    sfxSpecial: -1,
    seq: 0,
    horde: 0,
    sfxDeploy: 0,
    laneS: Array.from({ length: LANE_COUNT }, () => new Int16Array(MAX_SHIBAS)),
    laneC: Array.from({ length: LANE_COUNT }, () => new Int16Array(MAX_CATS)),
    laneSN: new Int16Array(LANE_COUNT),
    laneCN: new Int16Array(LANE_COUNT),
  }
  if (opts?.free === true) {
    sim.deck = cleanDeck(opts?.deck)
    if (!sim.deck.every((k) => coatOpen(sim, k))) sim.deck = [...DEFAULT_DECK]
  }
  sim.picked = sim.deck[0] ?? KIND_TAN
  boot(sim)
  return sim
}

/** A saved deck is kept only if it is DECK_SIZE different coats of the roster; otherwise the default deck. */
function cleanDeck(deck: readonly number[] | undefined): number[] {
  if (!deck || deck.length !== DECK_SIZE) return [...DEFAULT_DECK]
  const seen = new Set<number>()
  for (const k of deck) {
    if (!Number.isInteger(k) || k < 0 || k >= KINDS || seen.has(k)) return [...DEFAULT_DECK]
    seen.add(k)
  }
  return [...deck]
}

/** Is this coat unlocked? Lanes mode and coats with no unlock stage always are. */
export function coatOpen(sim: Sim, kind: number): boolean {
  const need = COAT_UNLOCK[kind] ?? -1
  return !sim.free || need < 0 || (sim.best[need] ?? 0) > 0
}

/** A stage is open once the one before it has been cleared. */
export function stageOpen(sim: Sim, stage: number): boolean {
  return stage >= 0 && stage < STAGES.length && (stage === 0 || (sim.best[stage - 1] ?? 0) > 0)
}

/** Title screen: start this stage fresh. */
export function selectStage(sim: Sim, stage: number): boolean {
  if (!sim.title || !stageOpen(sim, stage)) return false
  sim.title = false
  sim.stage = stage
  sim.saveSeq += 1
  boot(sim)
  sim.picked = sim.deck[0] ?? KIND_TAN
  return true
}

export function deckReady(sim: Sim): boolean {
  return sim.deck.length === DECK_SIZE
}

/** Put a coat in the deck, or take it out. A full deck needs one out first. */
export function toggleDeck(sim: Sim, kind: number): boolean {
  if (!sim.free || kind < 0 || kind >= KINDS) return false
  const at = sim.deck.indexOf(kind)
  if (at >= 0) {
    sim.deck.splice(at, 1)
  } else if (sim.deck.length < DECK_SIZE && coatOpen(sim, kind)) {
    sim.deck.push(kind)
  } else {
    return false
  }
  sim.saveSeq += 1
  return true
}

const OLD_STAGE: (typeof STAGES)[number] = { count: DOG_COUNT, hp: 1, dps: 1, dachsEvery: 5, poodleEvery: 0, pomEvery: 0, goldenEvery: 9, bulldogEvery: 7, rocks: [] }

/** Can the next wave be called now? Free play, before the boss, with dogs left and a wait to skip. */
export function canCall(sim: Sim): boolean {
  return sim.free && sim.outcome === 'play' && !sim.boss && sim.toSend > 0 && sim.nextCat - sim.time > 0.6
}

/** 波を早く呼ぶ: bring the next wave in now and bank ホネ for the seconds skipped. */
export function callWave(sim: Sim): boolean {
  if (!canCall(sim)) return false
  const skipped = sim.nextCat - sim.time
  sim.callBonus += Math.round(skipped * CALL_BONE)
  sim.callT = 0.5
  sim.nextCat = sim.time
  return true
}

/** The stage in play. ?lanes keeps the plain old numbers. */
export function spec(sim: Sim): (typeof STAGES)[number] {
  return sim.free ? (STAGES[sim.stage] ?? OLD_STAGE) : OLD_STAGE
}

export function reset(sim: Sim): void {
  // A win opens the next stage; a loss replays this one.
  if (sim.outcome === 'won' && sim.stage < STAGES.length - 1) {
    sim.stage += 1
    sim.saveSeq += 1
  }
  boot(sim)
  sim.picked = sim.deck[0] ?? KIND_TAN
}

function spawnHero(sim: Sim): void {
  const h = sim.hero
  h.alive = sim.free && sim.heroOn
  h.x = FIELD_W / 2
  h.y = FREE_ZONE_Y - 24
  h.hp = HERO_HP
  h.maxHp = HERO_HP
  h.speed = HERO_SPEED
  h.cd = 0
  h.bitAt = -9
  h.fly = 0
  h.kind = KIND_TAN
  h.stun = 0
  sim.heroT = 0
  sim.heroGo = null
  sim.heroSpinAt = -9
  sim.heroSkillT = 0
  sim.heroSkillAt = -9
}

/** The hero's big spin: every dog within HERO_SKILL_R takes HERO_SKILL_HIT. */
function heroSkill(sim: Sim): void {
  const h = sim.hero
  sim.heroSkillT = HERO_SKILL_CD
  sim.heroSkillAt = sim.time
  sim.heroUsed = true
  for (const dog of sim.cats) {
    if (!dog?.alive || dog.fly === 1 || dog.hp <= 0) continue
    if (Math.hypot(dog.x - h.x, dog.y - h.y) <= HERO_SKILL_R) dog.hp -= HERO_SKILL_HIT * (dog.kind === BREED_BOSS ? 1 : spec(sim).hp)
  }
}

/** ポメラニアン: mend the pack on a timer, and keep POM_KEEP back from the nearest shiba. Returns true when it handled its own move (a shiba is in sight). */
function pomFree(sim: Sim, pom: Unit, dt: number, beat: number): boolean {
  pom.cd -= beat
  if (pom.cd <= 0) {
    pom.cd = POM_EVERY
    let any = false
    for (const d of sim.cats) {
      if (!d?.alive || d === pom || d.fly === 1 || d.hp <= 0 || d.hp >= d.maxHp || d.kind === BREED_BOSS) continue
      if (Math.hypot(d.x - pom.x, d.y - pom.y) > POM_RADIUS) continue
      d.hp = Math.min(d.maxHp, d.hp + POM_HEAL * spec(sim).hp)
      d.mendAt = sim.time
      any = true
    }
    if (any) pom.bitAt = sim.time
  }
  const near = nearest(sim.shibas, pom, FREE_SIGHT_DOG, true)
  if (!near) return false
  const d = Math.hypot(near.x - pom.x, near.y - pom.y)
  if (d < POM_KEEP - 6) {
    // Back off, straight away from the shiba.
    const ux = (pom.x - near.x) / Math.max(1, d)
    const uy = (pom.y - near.y) / Math.max(1, d)
    stepToward(pom, pom.x + ux * 20, Math.max(16, pom.y + uy * 20), pom.speed * dt)
  } else if (d > POM_KEEP + 10) {
    stepToward(pom, near.x, near.y, Math.min(d - POM_KEEP, pom.speed * dt))
  }
  return true
}

/** Open the result screen's 宝箱 (if one is waiting) and bank its ホネ. */
function openChest(sim: Sim): void {
  if (sim.chest !== 1) return
  sim.chest = 2
  sim.purse += sim.chestBones
  sim.saveSeq += 1
}

/** The boss howls: later stages call チワワ to its side, and the last ones freeze shibas near it. */
function howl(sim: Sim, boss: Unit): void {
  sim.howlAt = sim.time
  if (sim.stage >= BOSS_CALL_FROM) {
    for (let k = 0; k < BOSS_CALL; k++) spawnCat(sim, 0, BREED_CHIHUAHUA, { x: boss.x - 28 + k * 28, y: boss.y + 14 + (k & 1) * 8 })
  }
  if (sim.stage >= BOSS_STUN_FROM) {
    for (const u of [...sim.shibas, sim.hero]) {
      if (!u?.alive || u.hp <= 0) continue
      if (Math.hypot(u.x - boss.x, u.y - boss.y) <= BOSS_HOWL_R) u.stun = BOSS_STUN
    }
  }
}

/** The hero walks to its tap (or the nearest dog it can see), and spins at everything within HERO_RADIUS. */
function stepHero(sim: Sim, dt: number, beat: number): void {
  const h = sim.hero
  if (!sim.free || !sim.heroOn) return
  if (!h.alive) {
    sim.heroT -= beat
    if (sim.heroT <= 0) {
      spawnHero(sim)
      h.alive = true
    }
    return
  }
  if (sim.heroSkillT > 0) sim.heroSkillT -= beat
  if (h.stun > 0) {
    h.stun -= beat
    return
  }
  const go = sim.heroGo
  let target: { x: number; y: number } | null = go
  if (go && Math.hypot(go.x - h.x, go.y - h.y) < 3) {
    sim.heroGo = null
    target = null
  }
  if (!target) {
    const foe = nearest(sim.cats, h, FREE_SIGHT_SHIBA, true)
    if (foe && Math.hypot(foe.x - h.x, foe.y - h.y) > HERO_RADIUS * 0.7) target = foe
  }
  if (target) stepToward(h, target.x, target.y, Math.min(Math.hypot(target.x - h.x, target.y - h.y), h.speed * dt))
  h.cd -= beat
  if (h.cd <= 0) {
    let any = false
    for (const dog of sim.cats) {
      if (!dog?.alive || dog.fly === 1 || dog.hp <= 0) continue
      if (Math.hypot(dog.x - h.x, dog.y - h.y) <= HERO_RADIUS) {
        dog.hp -= HERO_HIT
        any = true
      }
    }
    if (any) {
      h.cd = HERO_EVERY
      sim.heroSpinAt = sim.time
    } else h.cd = 0.1
  }
}

function boot(sim: Sim): void {
  sim.newCoat = -1
  sim.chest = 0
  sim.chestBones = 0
  sim.time = 0
  sim.bones = START_BONES
  sim.aliveShibas = 0
  sim.aliveCats = 0
  sim.costTan = COST_TAN
  sim.costBlack = COST_BLACK
  sim.costWhite = COST_SESAME
  sim.costSesame = COST_WHITE
  sim.bossIndex = -1
  sim.kills = 0
  sim.toSend = spec(sim).count
  sim.homeHp = HOME_HP
  sim.stars = 0
  sim.callBonus = 0
  sim.boss = false
  sim.floatT = 0
  sim.floatDmg = 0
  sim.outcome = 'play'
  sim.rewardT = 0
  sim.nextCat = TRICKLE_EVERY
  sim.planKind = WAVE_MIXED
  sim.planSide = 2
  sim.planCount = 0
  sim.deny0 = 0
  sim.deny1 = 0
  sim.deny2 = 0
  sim.deny3 = 0
  sim.recharge.fill(0)
  sim.charge.fill(0)
  sim.cutKind = -1
  sim.cutT = 0
  sim.fxKind = -1
  sim.fxT = 0
  sim.sfxStrike = -1
  sim.rushT = 0
  sim.wanT = 0
  sim.howlAt = -9
  spawnHero(sim)
  sim.sfxSpecial = -1
  sim.seq = 0
  sim.horde = 0
  sim.sfxDeploy = 0
  clear(sim.shibas)
  clear(sim.cats)
  for (let i = 0; i < START_SHIBAS; i++) {
    spawnShiba(sim, KIND_TAN, OPEN_LANE[i] ?? 0, OPEN_Y[i] ?? 480)
  }
  for (let i = 0; i < TRICKLE_COUNT; i++) {
    sim.toSend -= 1
    spawnCat(sim, i, i % 2 === 0 ? BREED_CHIHUAHUA : BREED_CORGI)
  }
}

function clear(units: Unit[]): void {
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (unit) unit.alive = false
  }
}

export function spawnShiba(sim: Sim, kind: number, lane: number, y: number): boolean {
  const unit = acquire(sim.shibas, sim, 's')
  if (!unit) return false
  const laneW = FIELD_W / LANE_COUNT
  const k = kind >= 0 && kind < KINDS ? kind : KIND_TAN
  unit.alive = true
  unit.lane = lane
  unit.kind = k
  unit.hp = Math.round((HP_OF[k] ?? HP_TAN) * power(sim, k))
  unit.maxHp = unit.hp
  unit.dps = (DPS_OF[k] ?? DPS_TAN) * power(sim, k)
  unit.speed = SPEED_OF[k] ?? SPEED_TAN
  unit.fly = 0
  unit.cd = 0
  unit.bite = BITE_EVERY * 0.5
  unit.bitAt = -9
  unit.mendAt = -9
  unit.stun = 0
  unit.recall = false
  unit.y = y
  unit.x = laneW * (lane + 0.5) + ((lane * 7 + (y | 0) * 3) % 21) - 10
  sim.aliveShibas += 1
  return true
}

const HP_OF = [HP_TAN, HP_BLACK, HP_SESAME, HP_WHITE, HP_DISC, HP_BIG, HP_CHEER] as const
const DPS_OF = [DPS_TAN, DPS_BLACK, DPS_SESAME, DPS_WHITE, DPS_DISC, DPS_BIG, DPS_CHEER] as const
const SPEED_OF = [SPEED_TAN, SPEED_BLACK, SPEED_SESAME, SPEED_WHITE, SPEED_DISC, SPEED_BIG, SPEED_CHEER] as const
const COUNT_OF = [COUNT_TAN, COUNT_BLACK, COUNT_SESAME, COUNT_WHITE, 1, 1, 1] as const
const STEP_OF = [STEP_TAN, STEP_BLACK, STEP_SESAME, STEP_WHITE, 0, 0, 0] as const

export function fillMarch(sim: Sim, count: number): number {
  let spawned = 0
  const span = FIELD_H - HOLD_Y - 24
  for (let i = 0; i < count; i++) {
    const lane = i % LANE_COUNT
    const y = HOLD_Y + 12 + ((i * 47) % span)
    const kind = i % 11 === 0 ? KIND_BLACK : KIND_TAN
    if (spawnShiba(sim, kind, lane, y)) spawned += 1
  }
  return spawned
}

/** Spawn a rival dog of the given breed at the top of a path. */
export function spawnCat(sim: Sim, lane: number, breed: number, at?: { x: number; y: number }): boolean {
  const unit = acquire(sim.cats, sim, 'c')
  if (!unit) return false
  const laneW = FIELD_W / LANE_COUNT
  unit.alive = true
  unit.lane = lane
  unit.kind = breed
  unit.hp = Math.round((BREED_HP[breed] ?? BREED_HP[BREED_CORGI]) * (sim.free ? FREE_DOG_HP * spec(sim).hp : 1))
  unit.maxHp = unit.hp
  unit.dps = (BREED_DPS[breed] ?? BREED_DPS[BREED_CORGI]) * (sim.free ? FREE_DOG_DPS * spec(sim).dps : 1)
  unit.speed = BREED_SPEED[breed] ?? BREED_SPEED[BREED_CORGI]
  unit.fly = 0
  unit.cd = 0
  unit.bite = BITE_EVERY * 0.5
  unit.bitAt = -9
  unit.mendAt = -9
  unit.stun = 0
  unit.y = 22 + (lane % 4) * 16
  unit.x = laneW * (lane + 0.5) + ((sim.aliveCats * 7 + lane * 5) % 17) - 8
  if (at) {
    unit.x = Math.max(14, Math.min(FIELD_W - 14, at.x))
    unit.y = at.y
    unit.lane = laneOfX(unit.x)
  }
  sim.aliveCats += 1
  return true
}

/** The boss walks out of the mansion down the middle path. */
function spawnBoss(sim: Sim): void {
  const lane = LANE_COUNT >> 1
  if (!spawnCat(sim, lane, BREED_CORGI)) return
  for (let i = 0; i < sim.cats.length; i++) {
    const unit = sim.cats[i]
    if (!unit?.alive || unit.lane !== lane || unit.y > 80 || unit.kind !== BREED_CORGI || unit.hp !== unit.maxHp) continue
    unit.kind = BREED_BOSS
    unit.hp = Math.round(BOSS_HP * spec(sim).hp)
    unit.maxHp = unit.hp
    unit.dps = BOSS_DPS
    unit.speed = BOSS_SPEED
    unit.cd = BOSS_HOWL_FIRST
    unit.x = (FIELD_W / LANE_COUNT) * (lane + 0.5)
    sim.bossIndex = i
    return
  }
}

function acquire(units: Unit[], sim: Sim, which: 's' | 'c'): Unit | null {
  const n = units.length
  let cursor = which === 's' ? sim.cursorS : sim.cursorC
  for (let k = 0; k < n; k++) {
    const i = (cursor + k) % n
    const unit = units[i]
    if (unit && !unit.alive) {
      cursor = (i + 1) % n
      if (which === 's') sim.cursorS = cursor
      else sim.cursorC = cursor
      return unit
    }
  }
  return null
}

export function step(sim: Sim, dt: number, input: Input = NO_INPUT): void {
  if (!(dt > 0)) return
  if (sim.title) {
    if (input.pickStage !== undefined) selectStage(sim, input.pickStage)
    return
  }
  if (input.quit && sim.outcome === 'play') {
    sim.title = true
    return
  }
  if (sim.outcome !== 'play') {
    if (input.home && sim.rewardT <= 0) {
      openChest(sim)
      sim.title = true
      return
    }
    // The CLEAR!/LOSE! banner holds, then the level-up screen waits for START.
    if (sim.rewardT > 0) {
      sim.rewardT -= dt
      if (sim.rewardT < 0) sim.rewardT = 0
      return
    }
    if (input.levelUp !== undefined) buyLevel(sim, input.levelUp)
    if (input.toggleDeck !== undefined) toggleDeck(sim, input.toggleDeck)
    if (input.openChest) openChest(sim)
    // START with the chest still shut banks it on the way out.
    if (input.restart && deckReady(sim)) {
      openChest(sim)
      reset(sim)
    }
    return
  }

  if (input.pick !== undefined && input.pick >= 0 && input.pick < KINDS && (!sim.free || sim.deck.includes(input.pick))) sim.picked = input.pick
  if (input.heroSkill && sim.free && sim.hero.alive && sim.heroSkillT <= 0 && sim.hero.stun <= 0) heroSkill(sim)
  if (input.hero && sim.free && sim.hero.alive) sim.heroUsed = true
  if (input.hero && sim.free && sim.hero.alive) sim.heroGo = { x: Math.max(10, Math.min(FIELD_W - 10, input.hero.x)), y: Math.max(20, Math.min(HERO_TAP_Y, input.hero.y)) }
  if (input.recall && sim.free) recallAt(sim, input.recall.x, input.recall.y)
  if (input.callWave) callWave(sim)
  if (input.card >= 0 && input.card < KINDS && (!sim.free || sim.deck.includes(input.card))) tryDeploy(sim, input.card, input.lane, input.at)

  const income = (BONE_RATE + sim.aliveShibas * BONE_PER_SHIBA) * (sim.free ? FREE_INCOME : 1)
  const tick = dt
  sim.bones += tick * income
  sim.time += tick

  let waves = 0
  while (sim.time >= sim.nextCat && sim.toSend > 0 && waves < 3) {
    const every = (sim.time >= CLASH_AT ? WAVE_EVERY : TRICKLE_EVERY) * (sim.free ? FREE_WAVE_SLOW : 1)
    spawnWave(sim)
    sim.nextCat += every
    waves += 1
  }
  if (sim.toSend <= 0 && !sim.boss) {
    sim.boss = true
    spawnBoss(sim)
  }

  flyCats(sim, tick)
  fight(sim, tick)
  if (!sim.free) {
    bark(sim, tick)
    heal(sim, tick)
  }
  reap(sim)
  if (sim.rushT > 0) sim.rushT -= tick
  if (sim.wanT > 0) sim.wanT -= tick
  if (sim.fxT > 0) {
    sim.fxT -= tick
    if (sim.fxT <= 0) sim.fxKind = -1
  }
  if (sim.cutT > 0) {
    sim.cutT -= tick
    if (sim.cutT <= 0) {
      const kind = sim.cutKind
      sim.cutKind = -1
      strikeSpecial(sim, kind)
      reap(sim)
    }
  }
  if (sim.cutT <= 0 && sim.fxT <= 0) {
    for (let kind = 0; kind < KINDS; kind++) {
      if ((sim.charge[kind] ?? 0) < (SPECIAL_NEED[kind] ?? Infinity)) continue
      fireSpecial(sim, kind)
      break
    }
  }

  if (sim.callT > 0) sim.callT -= tick
  if (sim.floatT > 0) sim.floatT -= tick
  if (sim.deny0 > 0) sim.deny0 -= tick
  if (sim.deny1 > 0) sim.deny1 -= tick
  if (sim.deny2 > 0) sim.deny2 -= tick
  if (sim.deny3 > 0) sim.deny3 -= tick
  for (let k = 0; k < KINDS; k++) {
    const left = sim.recharge[k] ?? 0
    if (left > 0) sim.recharge[k] = Math.max(0, left - tick)
  }

  if (sim.boss && sim.toSend <= 0 && sim.aliveCats <= 0) {
    sim.outcome = 'won'
    sim.rewardT = BANNER_HOLD
    pay(sim)
    return
  }
  if (sim.homeHp <= 0) {
    sim.homeHp = 0
    sim.outcome = 'lost'
    sim.rewardT = LOSE_HOLD
    pay(sim)
  }
}

/** Match pay: a base for the result plus ホネ for damage done to the mansion. */
function pay(sim: Sim): void {
  const base = sim.outcome === 'won' ? WIN_PAY : LOSS_PAY
  if (sim.outcome === 'won') {
    const left = sim.homeHp / HOME_HP
    sim.stars = left >= STAR3_AT ? 3 : left >= STAR2_AT ? 2 : 1
    const firstClear = (sim.best[sim.stage] ?? 0) === 0
    sim.best[sim.stage] = Math.max(sim.best[sim.stage] ?? 0, sim.stars)
    if (firstClear) sim.newCoat = COAT_UNLOCK.findIndex((need) => need === sim.stage)
    sim.seed = (Math.imul(sim.seed, 1103515245) + 12345) >>> 0
    const wobble = 0.8 + ((sim.seed >>> 8) % 41) / 100
    sim.chestBones = Math.round((CHEST_BASE + CHEST_STAGE * sim.stage) * (1 + CHEST_STAR * sim.stars) * wobble)
    sim.chest = 1
  } else {
    sim.stars = 0
  }
  sim.earned = base + sim.kills * BONE_PER_KILL + sim.callBonus
  sim.purse += sim.earned
  sim.saveSeq += 1
}

/** Dogs left to beat this match, the boss included. */
export function dogsLeft(sim: Sim): number {
  return sim.toSend + sim.aliveCats + (sim.boss ? 0 : 1)
}

/** ホネ to take a coat from `level` to the next. */
export function levelCost(level: number): number {
  return LEVEL_COST_BASE * level
}

/** How much stronger a coat is for its level: 1 at level 1. */
export function power(sim: Sim, kind: number): number {
  return 1 + LEVEL_STEP * ((sim.levels[kind] ?? 1) - 1)
}

export function buyLevel(sim: Sim, kind: number): boolean {
  if (kind < 0 || kind >= KINDS || !coatOpen(sim, kind)) return false
  const level = sim.levels[kind] ?? 1
  if (level >= MAX_LEVEL) return false
  const cost = levelCost(level)
  if (sim.purse < cost) return false
  sim.purse -= cost
  sim.levels[kind] = level + 1
  sim.saveSeq += 1
  return true
}

function tryDeploy(sim: Sim, card: number, chosen?: number, at?: { x: number; y: number }): void {
  const cost = costOf(sim, card)
  const count = COUNT_OF[card] ?? COUNT_TAN
  if ((sim.recharge[card] ?? 0) > 0) {
    deny(sim, card)
    return
  }
  if (sim.free) {
    if (sim.aliveShibas >= FIELD_CAP) {
      deny(sim, card)
      return
    }
  } else if (sim.bones < cost) {
    deny(sim, card)
    return
  }
  const pinned = chosen !== undefined && chosen >= 0 && chosen < LANE_COUNT
  const start = pinned ? chosen : sim.seq % LANE_COUNT
  sim.seq += 1
  let spawned = 0
  if (sim.free && at) {
    const x = Math.max(12, Math.min(FIELD_W - 12, at.x))
    const y = Math.max(FREE_ZONE_Y, Math.min(FIELD_H - 8, at.y))
    const lane = laneOfX(x)
    if (spawnShiba(sim, card, lane, y)) {
      const unit = sim.shibas[(sim.cursorS - 1 + sim.shibas.length) % sim.shibas.length]
      if (unit) unit.x = x
      spawned += 1
    }
  }
  for (let i = 0; i < count && !(sim.free && at); i++) {
    const lane = (start + i * (card === KIND_SESAME ? 3 : 1)) % LANE_COUNT
    const y = laneBack(sim, lane)
    if (y > FIELD_H + 240) continue
    if (spawnShiba(sim, card, lane, y)) spawned += 1
  }
  if (spawned === 0) {
    deny(sim, card)
    return
  }
  if (!sim.free) sim.bones -= cost
  sim.recharge[card] = (RECHARGE[card] ?? 0) * (sim.free ? FREE_RECHARGE : 1)
  const step = sim.free ? 0 : (STEP_OF[card] ?? STEP_TAN)
  sim.tutorial = false
  if (card === KIND_TAN) {
    sim.costTan += step
  } else if (card === KIND_BLACK) {
    sim.costBlack += step
  } else if (card === KIND_SESAME) {
    sim.costWhite += step
  } else {
    sim.costSesame += step
  }
  sim.sfxDeploy = 1
}

export function costOf(sim: Sim, card: number): number {
  if (card === KIND_BLACK) return sim.costBlack
  if (card === KIND_SESAME) return sim.costWhite
  if (card === KIND_WHITE) return sim.costSesame
  return sim.costTan
}

function deny(sim: Sim, card: number): void {
  if (card === KIND_BLACK) sim.deny1 = 0.18
  else if (card === KIND_SESAME) sim.deny2 = 0.18
  else if (card === KIND_WHITE) sim.deny3 = 0.18
  else sim.deny0 = 0.18
}

function laneBack(sim: Sim, lane: number): number {
  let y = FIELD_H - 8
  const units = sim.shibas
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (!unit?.alive || unit.lane !== lane) continue
    if (unit.y + GAP > y) y = unit.y + GAP
  }
  return y
}

function spawnWave(sim: Sim): void {
  const horde = sim.time >= CLASH_AT
  if (sim.free && horde && sim.planKind !== WAVE_MIXED) {
    spawnPattern(sim)
    planNext(sim)
    return
  }
  const size = horde ? 5 + Math.floor((sim.time - CLASH_AT) / 18) : TRICKLE_COUNT
  const st = spec(sim)
  const every = Math.max(4, st.bulldogEvery - Math.floor(Math.max(0, sim.time - CLASH_AT) / 30))
  const count = Math.min(size, sim.toSend)
  for (let i = 0; i < count; i++) {
    sim.toSend -= 1
    const lane = nextLane(sim, i)
    let breed = (sim.seed >>> 9) & 1 ? BREED_CHIHUAHUA : BREED_CORGI
    if (horde) {
      sim.horde += 1
      if (sim.horde % every === 0) breed = BREED_BULLDOG
      else if (st.goldenEvery > 0 && sim.horde % st.goldenEvery === 0) breed = BREED_GOLDEN
      else if (st.pomEvery > 0 && sim.horde % st.pomEvery === 0) breed = BREED_POM
      else if (st.poodleEvery > 0 && sim.horde % st.poodleEvery === 0) breed = BREED_POODLE
      else if (st.dachsEvery > 0 && sim.horde % st.dachsEvery === 0) breed = BREED_DACHS
    }
    spawnCat(sim, lane, breed)
  }
  if (sim.free) planNext(sim)
}

/** Free placement: pick the pattern of the wave after this one, never the same twice in a row, so the HUD can announce it. */
function planNext(sim: Sim): void {
  if (sim.time + TRICKLE_EVERY * FREE_WAVE_SLOW < CLASH_AT) {
    sim.planKind = WAVE_MIXED
    sim.planCount = 0
    return
  }
  sim.seed = (Math.imul(sim.seed, 1664525) + 1013904223) >>> 0
  const roll = (sim.seed >>> 11) % 4
  let kind = roll === 0 ? WAVE_MIXED : roll
  if (kind === sim.planKind) kind = kind === WAVE_PINCER ? WAVE_SWARM : kind + 1
  sim.planKind = kind
  sim.planSide = (sim.seed >>> 17) % 3
  sim.planCount = kind === WAVE_SWARM ? SWARM_COUNT : kind === WAVE_WALL ? WALL_COUNT : kind === WAVE_PINCER ? PINCER_COUNT : 0
}

/** One announced wave: チワワ swarm from one side, ブルドッグ wall across the field, or コーギー pincer on both edges. */
function spawnPattern(sim: Sim): void {
  const count = Math.min(sim.planCount, sim.toSend)
  const mid = FIELD_W / 2
  for (let i = 0; i < count; i++) {
    sim.toSend -= 1
    sim.horde += 1
    if (sim.planKind === WAVE_SWARM) {
      const cx = sim.planSide === 0 ? 70 : sim.planSide === 1 ? FIELD_W - 70 : mid
      spawnCat(sim, 0, BREED_CHIHUAHUA, { x: cx - 36 + (i % 4) * 24, y: 22 + Math.floor(i / 4) * 16 })
    } else if (sim.planKind === WAVE_WALL) {
      const span = FIELD_W - 90
      spawnCat(sim, 0, BREED_BULLDOG, { x: 45 + (span * (i + 0.5)) / Math.max(1, count), y: 24 })
    } else {
      const half = count >> 1
      const left = i < half
      const k = left ? i : i - half
      spawnCat(sim, 0, BREED_CORGI, { x: left ? 28 + k * 22 : FIELD_W - 28 - k * 22, y: 24 + (k % 2) * 14 })
    }
  }
}

function nextLane(sim: Sim, i: number): number {
  sim.seed = (Math.imul(sim.seed, 1664525) + 1013904223) >>> 0
  return (sim.seed + i) % LANE_COUNT
}

function flyCats(sim: Sim, dt: number): void {
  const cats = sim.cats
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    if (!cat?.alive || cat.fly !== 1) continue
    cat.y -= 680 * dt
    if (cat.y < -40) cat.alive = false
  }
}

function fight(sim: Sim, dt: number): void {
  sim.laneSN.fill(0)
  sim.laneCN.fill(0)
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    if (!unit?.alive) continue
    const n = sim.laneSN[unit.lane] ?? 0
    const lane = sim.laneS[unit.lane]
    if (!lane) continue
    lane[n] = i
    sim.laneSN[unit.lane] = n + 1
  }
  const cats = sim.cats
  for (let i = 0; i < cats.length; i++) {
    const unit = cats[i]
    if (!unit?.alive || unit.fly === 1) continue
    const n = sim.laneCN[unit.lane] ?? 0
    const lane = sim.laneC[unit.lane]
    if (!lane) continue
    lane[n] = i
    sim.laneCN[unit.lane] = n + 1
  }
  if (sim.free) {
    moveFree(sim, dt)
    return
  }
  for (let lane = 0; lane < LANE_COUNT; lane++) moveLane(sim, lane, dt)
}

export function laneOfX(x: number): number {
  return Math.max(0, Math.min(LANE_COUNT - 1, Math.floor((x * LANE_COUNT) / FIELD_W)))
}

/** The nearest live foe within sight, or undefined. */
function nearest(units: Unit[], from: Unit, sight: number, skipFlying: boolean): Unit | undefined {
  let best: Unit | undefined
  let bestD = sight * sight
  for (let i = 0; i < units.length; i++) {
    const u = units[i]
    if (!u?.alive || u.hp <= 0 || (skipFlying && u.fly === 1)) continue
    const dx = u.x - from.x
    const dy = u.y - from.y
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = u
    }
  }
  return best
}

function stepToward(unit: Unit, tx: number, ty: number, dist: number): void {
  const dx = tx - unit.x
  const dy = ty - unit.y
  const len = Math.hypot(dx, dy)
  if (len <= 1e-3) return
  const go = Math.min(len, dist)
  unit.x += (dx / len) * go
  unit.y += (dy / len) * go
  walkAround(unit, go)
}

/** Rocks of the stage being stepped; set by moveFree. */
let activeRocks: readonly Rock[] = []

/** Push a unit out of any rock, sliding it along the edge so it walks around instead of sticking. */
function walkAround(unit: Unit, step: number): void {
  for (const rock of activeRocks) {
    const ox = unit.x - rock.x
    const oy = unit.y - rock.y
    const gap = rock.r + 7
    const d = Math.hypot(ox, oy)
    if (d >= gap) continue
    const nx = d < 0.5 ? 0 : ox / d
    const ny = d < 0.5 ? -1 : oy / d
    // Slide to whichever side the unit is already on; dead centre goes right, and the slide itself keeps it there.
    const side = ox < 0 ? -1 : 1
    unit.x = rock.x + nx * gap - ny * side * step * 0.6
    unit.y = rock.y + ny * gap + nx * side * step * 0.6
  }
}

/** The shiba a dog goes for: the nearest in sight, with 黒 counted as nearer than it is. */
function nearestTaunt(shibas: Unit[], dog: Unit, sight: number): Unit | undefined {
  let best: Unit | undefined
  let bestD = sight
  for (const u of shibas) {
    if (!u?.alive || u.hp <= 0) continue
    const raw = Math.hypot(u.x - dog.x, u.y - dog.y)
    if (raw > sight) continue
    const d = u.kind === KIND_BLACK ? raw * TAUNT : raw
    if (d < bestD) {
      bestD = d
      best = u
    }
  }
  return best
}

/** 白: walk to the most-hurt shiba (else trail the nearest one from just behind), and every HEAL_EVERY mend every shiba inside HEAL_RADIUS. */
/** How much faster this shiba attacks: near a 応援柴, and during ワンワン!!. */
function hasteOf(sim: Sim, unit: Unit): number {
  let h = sim.wanT > 0 ? WANWAN_HASTE : 1
  for (const u of sim.shibas) {
    if (!u?.alive || u.kind !== KIND_CHEER || u === unit || u.hp <= 0) continue
    if (Math.hypot(u.x - unit.x, u.y - unit.y) <= CHEER_RADIUS) {
      h *= CHEER_HASTE
      break
    }
  }
  return h
}

/** 応援柴: trail the nearest fighting shiba a little behind, wave the flag, and fill the gauge while anyone is in range. */
function cheerFree(sim: Sim, cheer: Unit, dt: number, beat: number): void {
  let lead: Unit | undefined
  let leadD = Infinity
  let near = false
  for (const u of sim.shibas) {
    if (!u?.alive || u === cheer || u.kind === KIND_CHEER || u.kind === KIND_WHITE || u.recall) continue
    const d = Math.hypot(u.x - cheer.x, u.y - cheer.y)
    if (d < leadD) {
      leadD = d
      lead = u
    }
    if (d <= CHEER_RADIUS) near = true
  }
  if (lead) {
    const tx = lead.x
    const ty = lead.y + 18
    const d = Math.hypot(tx - cheer.x, ty - cheer.y)
    if (d > 8) stepToward(cheer, tx, ty, Math.min(d, cheer.speed * dt))
  } else if (cheer.y > FREE_HOLD_Y + 20) {
    stepToward(cheer, cheer.x, FREE_HOLD_Y + 20, cheer.speed * dt)
  }
  if (near) {
    sim.charge[KIND_CHEER] = (sim.charge[KIND_CHEER] ?? 0) + CHEER_CHARGE * power(sim, KIND_CHEER) * beat
    cheer.cd -= beat
    if (cheer.cd <= 0) {
      cheer.cd = 1.2
      cheer.bitAt = sim.time
    }
  }
}

function mendFree(sim: Sim, healer: Unit, dt: number, beat: number): void {
  // Head for the shiba that needs it most (low HP share, nearer wins ties); with nobody hurt, trail the nearest shiba.
  let hurt: Unit | undefined
  let hurtScore = Infinity
  let lead: Unit | undefined
  let leadD = Infinity
  for (const u of sim.shibas) {
    if (!u?.alive || u === healer || u.kind === KIND_WHITE) continue
    const d = Math.hypot(u.x - healer.x, u.y - healer.y)
    if (d < leadD) {
      leadD = d
      lead = u
    }
    if (u.hp <= 0 || u.hp >= u.maxHp) continue
    const score = u.hp / u.maxHp + d / HEAL_SEEK_SPAN
    if (score < hurtScore) {
      hurtScore = score
      hurt = u
    }
  }
  if (hurt) {
    const d = Math.hypot(hurt.x - healer.x, hurt.y - healer.y)
    if (d > HEAL_RADIUS * HEAL_CLOSE) stepToward(healer, hurt.x, hurt.y, Math.min(d, healer.speed * dt))
  } else if (lead) {
    const tx = lead.x
    const ty = lead.y + HEAL_FOLLOW
    const d = Math.hypot(tx - healer.x, ty - healer.y)
    if (d > 6) stepToward(healer, tx, ty, Math.min(d, healer.speed * dt))
  } else if (healer.y > FREE_HOLD_Y + HEAL_FOLLOW) {
    stepToward(healer, healer.x, FREE_HOLD_Y + HEAL_FOLLOW, healer.speed * dt)
  }
  healer.cd -= beat
  if (healer.cd > 0) return
  let mended = 0
  const amount = HEAL_AMOUNT * power(sim, KIND_WHITE)
  for (const u of sim.shibas) {
    if (!u?.alive || u.hp <= 0 || u.hp >= u.maxHp) continue
    if (Math.hypot(u.x - healer.x, u.y - healer.y) > HEAL_RADIUS) continue
    const gain = Math.min(amount, u.maxHp - u.hp)
    u.hp += gain
    u.mendAt = sim.time
    mended += gain
  }
  healer.cd = HEAL_EVERY
  if (mended > 0) {
    healer.bitAt = sim.time
    sim.charge[KIND_WHITE] = (sim.charge[KIND_WHITE] ?? 0) + mended
  }
}

/** Push units of one side apart so a crowd spreads instead of stacking on one spot. */
function spread(units: Unit[], dt: number): void {
  for (let i = 0; i < units.length; i++) {
    const a = units[i]
    if (!a?.alive || a.fly === 1) continue
    for (let j = i + 1; j < units.length; j++) {
      const b = units[j]
      if (!b?.alive || b.fly === 1) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d2 = dx * dx + dy * dy
      if (d2 >= FREE_SPACE * FREE_SPACE) continue
      const d = Math.sqrt(d2) || 0.01
      const push = ((FREE_SPACE - d) / 2) * Math.min(1, dt * 8)
      const nx = d2 > 0 ? dx / d : 1
      const ny = d2 > 0 ? dy / d : 0
      a.x -= nx * push
      a.y -= ny * push
      b.x += nx * push
      b.y += ny * push
    }
  }
  for (const u of units) {
    // A beaten dog is flying off the top of the field; clamping it here would pin it by the mansion for good.
    if (!u?.alive || u.fly === 1) continue
    u.x = Math.max(10, Math.min(FIELD_W - 10, u.x))
    u.y = Math.max(16, Math.min(FIELD_H - 4, u.y))
  }
}

/** Tapping a shiba sends it home: it walks to the 柴の家 and leaves the field, freeing a slot under FIELD_CAP. */
function recallAt(sim: Sim, x: number, y: number): void {
  let best: Unit | undefined
  let bestD = RECALL_TAP
  for (const u of sim.shibas) {
    if (!u?.alive || u.recall) continue
    const d = Math.hypot(u.x - x, u.y - RECALL_LIFT - y)
    if (d < bestD) {
      bestD = d
      best = u
    }
  }
  if (best) best.recall = true
}

/** Free placement: every shiba and dog walks to the nearest foe it can see and bites on the beat; dogs with nothing in sight head for the 柴の家. */
/** ぶち柴's frisbee: one straight cut from the thrower through the target, hitting every dog on the way. */
function throwDisc(sim: Sim, shiba: Unit, foe: Unit): void {
  const dx = foe.x - shiba.x
  const dy = foe.y - shiba.y
  const len = Math.max(1, Math.hypot(dx, dy))
  const ux = dx / len
  const uy = dy / len
  const hit = DISC_HIT * power(sim, KIND_DISC)
  for (const dog of sim.cats) {
    if (!dog?.alive || dog.fly === 1 || dog.hp <= 0) continue
    const rx = dog.x - shiba.x
    const ry = dog.y - shiba.y
    const along = rx * ux + ry * uy
    if (along < 0 || along > DISC_RANGE) continue
    if (Math.abs(rx * uy - ry * ux) <= DISC_WIDTH) hurt(sim, dog, hit, KIND_DISC)
  }
  shiba.aimX = shiba.x + ux * DISC_RANGE
  shiba.aimY = shiba.y + uy * DISC_RANGE
  shiba.bitAt = sim.time
}

function moveFree(sim: Sim, rawDt: number): void {
  activeRocks = spec(sim).rocks
  // Movement runs slower; bites keep their beat.
  const dt = rawDt * FREE_PACE
  const beat = rawDt
  const homeX = FIELD_W / 2
  const homeY = FIELD_H - 6
  stepHero(sim, dt, beat)
  for (const shiba of sim.shibas) {
    if (!shiba?.alive || shiba.hp <= 0) continue
    if (shiba.recall) {
      const d = Math.hypot(homeX - shiba.x, homeY - shiba.y)
      if (d <= FREE_HOME_REACH * 0.5) {
        shiba.alive = false
        sim.aliveShibas -= 1
      } else {
        stepToward(shiba, homeX, homeY, Math.min(d, shiba.speed * RECALL_PACE * dt))
      }
      continue
    }
    if (shiba.stun > 0) {
      shiba.stun -= rawDt
      continue
    }
    const hbeat = beat * hasteOf(sim, shiba)
    if (shiba.kind === KIND_WHITE) {
      mendFree(sim, shiba, dt, hbeat)
      continue
    }
    if (shiba.kind === KIND_CHEER) {
      cheerFree(sim, shiba, dt, beat)
      continue
    }
    const haste = shiba.kind === KIND_TAN ? TAN_HASTE : 1
    const pace = (shiba.kind === KIND_TAN && sim.rushT > 0 ? 1.8 : 1) * haste
    // A dog out of sight is still hunted: no shiba stands idle far from the fight.
    const foe = nearest(sim.cats, shiba, FREE_SIGHT_SHIBA, true) ?? nearest(sim.cats, shiba, Infinity, true)
    if (!foe) {
      if (shiba.y > FREE_HOLD_Y) stepToward(shiba, shiba.x, FREE_HOLD_Y, shiba.speed * pace * dt)
      shiba.bite = BITE_EVERY * 0.5
      continue
    }
    const reach = shiba.kind === KIND_SESAME ? BARK_RANGE : shiba.kind === KIND_DISC ? DISC_REACH : FREE_REACH
    const d = Math.hypot(foe.x - shiba.x, foe.y - shiba.y)
    if (d > reach + 4) {
      stepToward(shiba, foe.x, foe.y, Math.min(d - reach * 0.9, shiba.speed * pace * dt))
      continue
    }
    if (shiba.kind === KIND_BLACK) {
      shiba.cd -= hbeat
      if (shiba.cd <= 0) {
        shiba.cd = HEAVY_EVERY
        hurt(sim, foe, HEAVY_HIT * power(sim, KIND_BLACK), KIND_BLACK)
        shiba.aimX = foe.x
        shiba.aimY = foe.y
        shiba.bitAt = sim.time
      }
    } else if (shiba.kind === KIND_DISC) {
      shiba.cd -= hbeat
      if (shiba.cd <= 0) {
        shiba.cd = DISC_EVERY
        throwDisc(sim, shiba, foe)
      }
    } else if (shiba.kind === KIND_BIG) {
      shiba.cd -= hbeat
      if (shiba.cd <= 0) {
        shiba.cd = BIG_EVERY
        const hit = BIG_HIT * power(sim, KIND_BIG)
        for (const dog of sim.cats) {
          if (!dog?.alive || dog.fly === 1 || dog.hp <= 0) continue
          if (Math.hypot(dog.x - shiba.x, dog.y - shiba.y) <= BIG_RADIUS) hurt(sim, dog, hit, KIND_BIG)
        }
        shiba.aimX = foe.x
        shiba.aimY = foe.y
        shiba.bitAt = sim.time
      }
    } else if (shiba.kind === KIND_SESAME) {
      shiba.cd -= hbeat
      if (shiba.cd <= 0) {
        shiba.cd = BARK_EVERY
        const hit = BARK_HIT * power(sim, KIND_SESAME)
        for (const dog of sim.cats) {
          if (!dog?.alive || dog.fly === 1 || dog.hp <= 0) continue
          if (Math.hypot(dog.x - foe.x, dog.y - foe.y) <= BARK_SPLASH) hurt(sim, dog, hit, KIND_SESAME)
        }
        shiba.aimX = foe.x
        shiba.aimY = foe.y
        shiba.bitAt = sim.time
      }
    } else {
      shiba.bite -= hbeat * pace
      if (shiba.bite <= 0) {
        const every = shiba.kind === KIND_TAN ? TAN_BITE_EVERY : BITE_EVERY
        shiba.bite += every
        hurt(sim, foe, shiba.dps * every, shiba.kind)
        shiba.aimX = foe.x
        shiba.aimY = foe.y
        shiba.bitAt = sim.time
      }
    }
  }
  for (const dog of sim.cats) {
    if (!dog?.alive || dog.fly === 1 || dog.hp <= 0) continue
    if (dog.stun > 0) {
      dog.stun -= rawDt
      continue
    }
    if (dog.kind === BREED_BOSS) {
      dog.cd -= beat
      if (dog.cd <= 0) {
        dog.cd = BOSS_HOWL_EVERY
        howl(sim, dog)
      }
    }
    if (dog.kind === BREED_POM && pomFree(sim, dog, dt, beat)) continue
    let foe = nearestTaunt(sim.shibas, dog, FREE_SIGHT_DOG)
    if (sim.hero.alive) {
      const dh = Math.hypot(sim.hero.x - dog.x, sim.hero.y - dog.y)
      if (dh <= FREE_SIGHT_DOG && (!foe || dh < Math.hypot(foe.x - dog.x, foe.y - dog.y))) foe = sim.hero
    }
    if (!foe) {
      const d = Math.hypot(homeX - dog.x, homeY - dog.y)
      if (d > FREE_HOME_REACH) {
        // Walk straight down the field, and only turn for the door near the bottom, so where shibas stand matters.
        const turn = dog.y > FIELD_H - FREE_TURN
        const tx = turn ? homeX : dog.x
        const ty = turn ? homeY : FIELD_H
        stepToward(dog, tx, ty, Math.min(d - FREE_HOME_REACH * 0.9, dog.speed * dt))
        dog.bite = BITE_EVERY * 0.5
      } else {
        dog.bite -= beat
        if (dog.bite <= 0) {
          dog.bite += BITE_EVERY
          sim.homeHp -= dog.dps * BITE_EVERY
          dog.bitAt = sim.time
        }
      }
      continue
    }
    const d = Math.hypot(foe.x - dog.x, foe.y - dog.y)
    const poodle = dog.kind === BREED_POODLE
    const reach = poodle ? POODLE_RANGE : FREE_REACH
    if (d > reach + 4) {
      stepToward(dog, foe.x, foe.y, Math.min(d - reach * 0.9, dog.speed * dt))
      continue
    }
    const every = poodle ? POODLE_EVERY : BITE_EVERY
    dog.bite -= beat
    if (dog.bite <= 0) {
      dog.bite += every
      foe.hp -= dog.dps * every
      dog.bitAt = sim.time
      dog.aimX = foe.x
      dog.aimY = foe.y
    }
  }
  if (sim.hero.alive && sim.hero.hp <= 0) {
    sim.hero.alive = false
    sim.heroT = HERO_REVIVE
    sim.heroGo = null
  }
  spread(sim.shibas, rawDt)
  spread(sim.cats, rawDt)
  for (const u of sim.shibas) {
    if (!u?.alive) continue
    if (u.y < FREE_SHIBA_TOP) u.y = FREE_SHIBA_TOP
    u.lane = laneOfX(u.x)
  }
  for (const u of sim.cats) if (u?.alive && u.fly !== 1) u.lane = laneOfX(u.x)
}

function moveLane(sim: Sim, lane: number, dt: number): void {
  const sn = sim.laneSN[lane] ?? 0
  const cn = sim.laneCN[lane] ?? 0
  const sIdx = sim.laneS[lane]
  const cIdx = sim.laneC[lane]
  if (!sIdx || !cIdx) return
  sortLane(sIdx, sn, sim.shibas, true)
  sortLane(cIdx, cn, sim.cats, false)

  const frontCat = cn > 0 ? sim.cats[cIdx[0] ?? -1] : undefined
  let stop = HOLD_Y
  if (frontCat?.alive) stop = Math.max(stop, frontCat.y + GAP)
  for (let i = 0; i < sn; i++) {
    const unit = sim.shibas[sIdx[i] ?? -1]
    if (!unit?.alive) continue
    const pace = unit.kind === KIND_TAN && sim.rushT > 0 ? 1.8 : 1
    if (unit.y > stop) unit.y = Math.max(stop, unit.y - unit.speed * pace * dt)
    stop = unit.y + GAP
  }

  const frontShiba = sn > 0 ? sim.shibas[sIdx[0] ?? -1] : undefined
  let catStop = FIELD_H - 6
  if (frontShiba?.alive) catStop = Math.min(catStop, frontShiba.y - GAP)
  for (let i = 0; i < cn; i++) {
    const cat = sim.cats[cIdx[i] ?? -1]
    if (!cat?.alive) continue
    if (cat.y < catStop) cat.y = Math.min(catStop, cat.y + cat.speed * dt)
    catStop = cat.y - GAP
    if (cat.fly !== 1 && cat.hp > 0 && cat.y >= FIELD_H - HOME_REACH) sim.homeHp -= cat.dps * dt
  }

  const shiba = sn > 0 ? sim.shibas[sIdx[0] ?? -1] : undefined
  const cat = cn > 0 ? sim.cats[cIdx[0] ?? -1] : undefined
  if (shiba?.alive && cat?.alive && Math.abs(shiba.y - cat.y) <= ATTACK_RANGE) {
    cat.bite -= dt
    if (cat.bite <= 0) {
      cat.bite += BITE_EVERY
      shiba.hp -= cat.dps * BITE_EVERY
      cat.bitAt = sim.time
    }
    if (shiba.kind === KIND_BLACK) {
      shiba.cd -= dt
      if (shiba.cd <= 0) {
        shiba.cd = HEAVY_EVERY
        hurt(sim, cat, HEAVY_HIT * power(sim, KIND_BLACK), KIND_BLACK)
        shiba.bitAt = sim.time
      }
    } else {
      const rushing = shiba.kind === KIND_TAN && sim.rushT > 0
      shiba.bite -= dt * (rushing ? 2 : 1)
      if (shiba.bite <= 0) {
        shiba.bite += BITE_EVERY
        hurt(sim, cat, shiba.dps * BITE_EVERY, shiba.kind)
        shiba.bitAt = sim.time
      }
    }
  } else {
    // Out of reach the next bite comes a beat after contact, so a fresh pair does not trade on the first frame.
    if (shiba?.alive) shiba.bite = BITE_EVERY * 0.5
    if (cat?.alive) cat.bite = BITE_EVERY * 0.5
  }
}

/** Damage a cat and fill that coat's special gauge with what landed. */
function hurt(sim: Sim, cat: Unit, rawAmount: number, kind: number): number {
  const amount = cat.kind === BREED_GOLDEN ? Math.max(rawAmount / 3, rawAmount - GOLDEN_ARMOR) : rawAmount
  const landed = Math.min(Math.max(0, cat.hp), amount)
  cat.hp -= amount
  sim.charge[kind] = (sim.charge[kind] ?? 0) + landed
  return landed
}

/** 胡麻柴 bark: a short-range blast into its own lane and both neighbors. */
function bark(sim: Sim, dt: number): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    if (!unit?.alive || unit.kind !== KIND_SESAME) continue
    if (unit.cd > 0) unit.cd -= dt
    if (unit.cd > 0) continue
    let hit = false
    for (let lane = unit.lane - 1; lane <= unit.lane + 1; lane++) {
      if (lane < 0 || lane >= LANE_COUNT) continue
      const n = sim.laneCN[lane] ?? 0
      const idx = sim.laneC[lane]
      if (!idx) continue
      for (let j = 0; j < n; j++) {
        const cat = sim.cats[idx[j] ?? -1]
        if (!cat?.alive || cat.fly === 1 || cat.hp <= 0) continue
        if (cat.y > unit.y || unit.y - cat.y > BARK_REACH) continue
        hurt(sim, cat, BARK_HIT * power(sim, KIND_SESAME), KIND_SESAME)
        hit = true
      }
    }
    if (hit) unit.cd = BARK_EVERY
  }
}

/** 白柴 heal: mend the most-hurt shiba near it, in its own path or a neighbor. Healing fills the 白 gauge. */
function heal(sim: Sim, dt: number): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const healer = shibas[i]
    if (!healer?.alive || healer.kind !== KIND_WHITE) continue
    if (healer.cd > 0) healer.cd -= dt
    if (healer.cd > 0) continue
    let best: Unit | undefined
    let bestRatio = 1
    for (let j = 0; j < shibas.length; j++) {
      const unit = shibas[j]
      if (!unit?.alive || unit.hp <= 0 || unit.hp >= unit.maxHp) continue
      if (Math.abs(unit.lane - healer.lane) > 1) continue
      if (healer.y - unit.y > HEAL_REACH || unit.y - healer.y > HEAL_REACH / 3) continue
      const ratio = unit.hp / unit.maxHp
      if (ratio < bestRatio) {
        bestRatio = ratio
        best = unit
      }
    }
    if (!best) continue
    const mended = Math.min(HEAL_AMOUNT * power(sim, KIND_WHITE), best.maxHp - best.hp)
    best.hp += mended
    sim.charge[KIND_WHITE] = (sim.charge[KIND_WHITE] ?? 0) + mended
    healer.cd = HEAL_EVERY
  }
}

/** Specials: 赤「サツマイモ!!」rush, 黒「ジャーキー!!」pierce, 胡麻「チーズ!!」shockwave, 白「ササミ!!」full heal. Firing starts the cut-in; strikeSpecial lands it. */
export function fireSpecial(sim: Sim, kind: number): void {
  sim.charge[kind] = 0
  sim.cutKind = kind
  sim.cutT = CUT_TIME
  sim.sfxSpecial = kind
}

/** The cut-in is over: the special lands now, with its field effect. */
export function strikeSpecial(sim: Sim, kind: number): void {
  if (kind < 0) return
  sim.fxKind = kind
  sim.fxT = FX_TIME
  sim.fxId += 1
  sim.sfxStrike = kind
  sim.fxHits = []
  let dealt = 0
  const cats = sim.cats
  // Free placement dogs are tougher, so specials hit as much harder there.
  const scale = sim.free ? FREE_DOG_HP : 1
  const note = (u: Unit, v: number, heal: boolean): void => {
    if (v > 0) sim.fxHits.push({ x: u.x, y: u.y, v, heal })
  }
  if (kind === KIND_TAN) {
    sim.rushT = RUSH_TIME
    for (const u of sim.shibas) if (u?.alive && u.kind === KIND_TAN) note(u, 2, false)
  } else if (kind === KIND_BLACK && sim.free) {
    const targets = cats.filter((c) => c?.alive && c.fly !== 1 && c.hp > 0).sort((a, b) => b.y - a.y).slice(0, JERKY_TARGETS)
    for (const cat of targets) {
      const hit = Math.min(Math.max(0, cat.hp), JERKY_FREE_HIT * scale)
      dealt += hit
      cat.hp -= JERKY_FREE_HIT * scale
      note(cat, hit, false)
    }
  } else if (kind === KIND_BLACK) {
    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const n = Math.min(JERKY_DEPTH, sim.laneCN[lane] ?? 0)
      const idx = sim.laneC[lane]
      if (!idx) continue
      for (let j = 0; j < n; j++) {
        const cat = cats[idx[j] ?? -1]
        if (!cat?.alive || cat.fly === 1) continue
        const hit = Math.min(Math.max(0, cat.hp), JERKY_HIT)
        dealt += hit
        cat.hp -= JERKY_HIT
        note(cat, hit, false)
      }
    }
  } else if (kind === KIND_WHITE) {
    for (let i = 0; i < sim.shibas.length; i++) {
      const unit = sim.shibas[i]
      if (!unit?.alive || unit.hp <= 0) continue
      note(unit, unit.maxHp - unit.hp, true)
      unit.hp = unit.maxHp
      unit.mendAt = sim.time
    }
    sim.homeHp = Math.min(HOME_HP, sim.homeHp + SASAMI_HOME)
  } else if (kind === KIND_DISC) {
    // ボーロ!!: the whole row of the most advanced dog.
    let front = -Infinity
    for (const c of cats) if (c?.alive && c.fly !== 1 && c.hp > 0 && c.y > front) front = c.y
    sim.fxY = front
    for (const c of cats) {
      if (!c?.alive || c.fly === 1 || c.hp <= 0 || Math.abs(c.y - front) > BORO_BAND) continue
      const hit = Math.min(Math.max(0, c.hp), BORO_HIT * scale)
      dealt += hit
      c.hp -= BORO_HIT * scale
      note(c, hit, false)
    }
  } else if (kind === KIND_CHEER) {
    // ワンワン!!: the whole pack gets fired up; every shiba also gets a little health back.
    sim.wanT = WANWAN_T
    for (const u of sim.shibas) {
      if (!u?.alive || u.hp <= 0) continue
      const gain = Math.min(u.maxHp * 0.15, u.maxHp - u.hp)
      u.hp += gain
      note(u, Math.round(gain), true)
    }
  } else if (kind === KIND_BIG) {
    // ミルク!!: the thickest knot of dogs.
    let bestN = -1
    let bx = FIELD_W / 2
    let by = FIELD_H / 3
    for (const a of cats) {
      if (!a?.alive || a.fly === 1 || a.hp <= 0) continue
      let n = 0
      for (const b of cats) if (b?.alive && b.fly !== 1 && b.hp > 0 && Math.hypot(a.x - b.x, a.y - b.y) <= MILK_RADIUS) n += 1
      if (n > bestN) {
        bestN = n
        bx = a.x
        by = a.y
      }
    }
    sim.fxX = bx
    sim.fxY = by
    for (const c of cats) {
      if (!c?.alive || c.fly === 1 || c.hp <= 0 || Math.hypot(c.x - bx, c.y - by) > MILK_RADIUS) continue
      const hit = Math.min(Math.max(0, c.hp), MILK_HIT * scale)
      dealt += hit
      c.hp -= MILK_HIT * scale
      note(c, hit, false)
      if (c.kind !== BREED_BOSS) c.stun = MILK_STUN
    }
  } else {
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i]
      if (!cat?.alive || cat.fly === 1) continue
      const base = sim.free ? CHEESE_FREE_HIT : CHEESE_HIT
      const hit = Math.min(Math.max(0, cat.hp), base * scale)
      dealt += hit
      cat.hp -= base * scale
      note(cat, hit, false)
      cat.y = Math.max(22, cat.y - (sim.free ? CHEESE_FREE_PUSH : CHEESE_PUSH))
      if (sim.free && cat.kind !== BREED_BOSS) cat.stun = CHEESE_STUN
    }
  }
  if (dealt > 0) {
    sim.floatDmg = dealt
    sim.floatT = FLOAT_TIME
  }
}

function sortLane(indices: Int16Array, n: number, units: Unit[], ascending: boolean): void {
  for (let i = 1; i < n; i++) {
    const key = indices[i] ?? 0
    const keyY = units[key]?.y ?? 0
    let j = i - 1
    while (j >= 0) {
      const other = indices[j] ?? 0
      const otherY = units[other]?.y ?? 0
      const disordered = ascending ? otherY > keyY : otherY < keyY
      if (!disordered) break
      indices[j + 1] = other
      j -= 1
    }
    indices[j + 1] = key
  }
}

function reap(sim: Sim): void {
  const shibas = sim.shibas
  for (let i = 0; i < shibas.length; i++) {
    const unit = shibas[i]
    if (!unit?.alive || unit.hp > 0) continue
    unit.alive = false
    sim.aliveShibas -= 1
  }
  const cats = sim.cats
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    if (!cat?.alive || cat.fly === 1 || cat.hp > 0) continue
    cat.hp = 0
    cat.fly = 1
    sim.aliveCats -= 1
    sim.kills += 1
  }
}
