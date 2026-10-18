import {
  ATTACK_RANGE,
  BONE_PER_SHIBA,
  BONE_RATE,
  BOSS_AT,
  CANNON_CASTLE,
  CANNON_COOLDOWN,
  CANNON_NEED,
  CASTLE_HP,
  CASTLE_REACH,
  CAT_DPS,
  CAT_HP,
  CAT_SPEED,
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
  GATE_DEPTH,
  GUARD_CATS,
  HOLD_Y,
  HP_BLACK,
  HP_TAN,
  KIND_BLACK,
  KIND_TAN,
  LANE_COUNT,
  BANNER_HOLD,
  LOSE_HOLD,
  MATCH_SECONDS,
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
  BEAM_TIME,
} from './balance'

export type Phase = 'grow' | 'clash' | 'boss'
export type Outcome = 'play' | 'won' | 'lost'

export interface Unit {
  alive: boolean
  x: number
  y: number
  speed: number
  kind: number
  lane: number
  hp: number
  dps: number
  fly: number
}

export interface Input {
  card: number
  cannon: boolean
  restart: boolean
}

export const NO_INPUT: Input = { card: -1, cannon: false, restart: false }

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
  castleHp: number
  boss: boolean
  cannonCd: number
  beam: number
  floatT: number
  floatDmg: number
  outcome: Outcome
  tutorial: boolean
  rewardT: number
  nextCat: number
  guard: boolean
  deny0: number
  deny1: number
  seq: number
  sfxDeploy: number
  sfxCannon: number
  laneS: Int16Array[]
  laneC: Int16Array[]
  laneSN: Int16Array
  laneCN: Int16Array
}

export interface SimOptions {
  tutorial?: boolean
  seed?: number
}

const OPEN_Y = [430, 470, 510, 550, 400, 460, 520, 570, 390, 500]
const OPEN_LANE = [0, 1, 2, 3, 4, 5, 6, 7, 2, 5]

export function phaseAt(time: number): Phase {
  if (time >= BOSS_AT) return 'boss'
  if (time >= CLASH_AT) return 'clash'
  return 'grow'
}

export function cannonReady(sim: Sim): boolean {
  return sim.outcome === 'play' && sim.aliveShibas >= CANNON_NEED && sim.cannonCd <= 0 && sim.beam <= 0
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
      dps: 0,
      fly: 0,
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
    castleHp: CASTLE_HP,
    boss: false,
    cannonCd: 0,
    beam: 0,
    floatT: 0,
    floatDmg: 0,
    outcome: 'play',
    tutorial: opts?.tutorial !== false,
    rewardT: 0,
    nextCat: CLASH_AT,
    guard: false,
    deny0: 0,
    deny1: 0,
    seq: 0,
    sfxDeploy: 0,
    sfxCannon: 0,
    laneS: Array.from({ length: LANE_COUNT }, () => new Int16Array(MAX_SHIBAS)),
    laneC: Array.from({ length: LANE_COUNT }, () => new Int16Array(MAX_CATS)),
    laneSN: new Int16Array(LANE_COUNT),
    laneCN: new Int16Array(LANE_COUNT),
  }
  boot(sim)
  return sim
}

export function reset(sim: Sim): void {
  boot(sim)
}

function boot(sim: Sim): void {
  sim.time = 0
  sim.bones = START_BONES
  sim.aliveShibas = 0
  sim.aliveCats = 0
  sim.costTan = COST_TAN
  sim.costBlack = COST_BLACK
  sim.castleHp = CASTLE_HP
  sim.boss = false
  sim.cannonCd = 0
  sim.beam = 0
  sim.floatT = 0
  sim.floatDmg = 0
  sim.outcome = 'play'
  sim.rewardT = 0
  sim.nextCat = TRICKLE_EVERY
  sim.guard = false
  sim.deny0 = 0
  sim.deny1 = 0
  sim.seq = 0
  sim.sfxDeploy = 0
  sim.sfxCannon = 0
  clear(sim.shibas)
  clear(sim.cats)
  for (let i = 0; i < START_SHIBAS; i++) {
    spawnShiba(sim, KIND_TAN, OPEN_LANE[i] ?? 0, OPEN_Y[i] ?? 480)
  }
  for (let i = 0; i < TRICKLE_COUNT; i++) spawnCat(sim, i)
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
  const black = kind === KIND_BLACK
  const laneW = FIELD_W / LANE_COUNT
  unit.alive = true
  unit.lane = lane
  unit.kind = black ? KIND_BLACK : KIND_TAN
  unit.hp = black ? HP_BLACK : HP_TAN
  unit.dps = black ? DPS_BLACK : DPS_TAN
  unit.speed = black ? SPEED_BLACK : SPEED_TAN
  unit.fly = 0
  unit.y = y
  unit.x = laneW * (lane + 0.5) + ((lane * 3 + (y | 0)) % 7) - 3
  sim.aliveShibas += 1
  return true
}

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

function spawnCat(sim: Sim, lane: number): boolean {
  const unit = acquire(sim.cats, sim, 'c')
  if (!unit) return false
  const laneW = FIELD_W / LANE_COUNT
  unit.alive = true
  unit.lane = lane
  unit.kind = 2
  unit.hp = CAT_HP
  unit.dps = CAT_DPS
  unit.speed = CAT_SPEED
  unit.fly = 0
  unit.y = 22 + (lane % 4) * 16
  unit.x = laneW * (lane + 0.5)
  sim.aliveCats += 1
  return true
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
  if (sim.outcome === 'lost') {
    sim.rewardT -= dt
    if (sim.rewardT <= 0) reset(sim)
    return
  }
  if (sim.outcome === 'won') {
    if (sim.rewardT > 0) {
      sim.rewardT -= dt
      if (sim.rewardT < 0) sim.rewardT = 0
    }
    if (input.restart && sim.rewardT <= 0) reset(sim)
    return
  }

  if (input.card === 0) tryDeploy(sim, 0)
  else if (input.card === 1) tryDeploy(sim, 1)
  if (input.cannon) fireCannon(sim)

  const income = BONE_RATE + sim.aliveShibas * BONE_PER_SHIBA
  const next = sim.time + dt >= MATCH_SECONDS - 1e-4 ? MATCH_SECONDS : sim.time + dt
  const tick = next - sim.time
  sim.bones += tick * income
  sim.time = next

  let waves = 0
  while (sim.time >= sim.nextCat && sim.time < BOSS_AT && waves < 3) {
    const every = sim.time >= CLASH_AT ? WAVE_EVERY : TRICKLE_EVERY
    spawnWave(sim)
    sim.nextCat += every
    waves += 1
  }
  if (sim.time >= BOSS_AT && !sim.boss) {
    sim.boss = true
    if (!sim.guard) {
      sim.guard = true
      for (let i = 0; i < GUARD_CATS; i++) spawnCat(sim, i % LANE_COUNT)
    }
  }

  flyCats(sim, tick)
  fight(sim, tick)
  reap(sim)

  if (sim.cannonCd > 0) sim.cannonCd -= tick
  if (sim.beam > 0) sim.beam -= tick
  if (sim.floatT > 0) sim.floatT -= tick
  if (sim.deny0 > 0) sim.deny0 -= tick
  if (sim.deny1 > 0) sim.deny1 -= tick

  if (sim.castleHp <= 0) {
    sim.castleHp = 0
    sim.outcome = 'won'
    sim.rewardT = BANNER_HOLD
    return
  }
  if (sim.time >= MATCH_SECONDS) {
    sim.outcome = 'lost'
    sim.rewardT = LOSE_HOLD
  }
}

function tryDeploy(sim: Sim, card: 0 | 1): void {
  const cost = card === 0 ? sim.costTan : sim.costBlack
  const count = card === 0 ? COUNT_TAN : COUNT_BLACK
  const kind = card === 0 ? KIND_TAN : KIND_BLACK
  if (sim.bones < cost) {
    if (card === 0) sim.deny0 = 0.18
    else sim.deny1 = 0.18
    return
  }
  const start = sim.seq % LANE_COUNT
  sim.seq += 1
  let spawned = 0
  for (let i = 0; i < count; i++) {
    const lane = (start + i) % LANE_COUNT
    const y = laneBack(sim, lane)
    if (y > FIELD_H + 240) continue
    if (spawnShiba(sim, kind, lane, y)) spawned += 1
  }
  if (spawned === 0) {
    if (card === 0) sim.deny0 = 0.18
    else sim.deny1 = 0.18
    return
  }
  sim.bones -= cost
  if (card === 0) {
    sim.costTan += STEP_TAN
    sim.tutorial = false
  } else {
    sim.costBlack += STEP_BLACK
  }
  sim.sfxDeploy = 1
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
  const size = horde ? 8 + Math.floor((sim.time - CLASH_AT) / 12) : TRICKLE_COUNT
  for (let i = 0; i < size; i++) spawnCat(sim, nextLane(sim, i))
}

function nextLane(sim: Sim, i: number): number {
  sim.seed = (Math.imul(sim.seed, 1664525) + 1013904223) >>> 0
  return (sim.seed + i) % LANE_COUNT
}

function fireCannon(sim: Sim): void {
  if (!cannonReady(sim)) return
  sim.cannonCd = CANNON_COOLDOWN
  sim.beam = BEAM_TIME
  let dealt = 0
  const cats = sim.cats
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    if (!cat?.alive || cat.fly) continue
    dealt += cat.hp
    cat.hp = 0
  }
  if (sim.boss && sim.castleHp > 0) {
    const hit = sim.aliveShibas * CANNON_CASTLE
    const applied = Math.min(sim.castleHp, hit)
    sim.castleHp -= applied
    dealt += applied
  }
  sim.floatDmg = dealt
  sim.floatT = FLOAT_TIME
  sim.sfxCannon = 1
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
  for (let lane = 0; lane < LANE_COUNT; lane++) moveLane(sim, lane, dt)
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
  let stop = sim.boss ? CASTLE_REACH : HOLD_Y
  if (frontCat?.alive) stop = Math.max(stop, frontCat.y + GAP)
  for (let i = 0; i < sn; i++) {
    const unit = sim.shibas[sIdx[i] ?? -1]
    if (!unit?.alive) continue
    if (unit.y > stop) unit.y = Math.max(stop, unit.y - unit.speed * dt)
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
  }

  const shiba = sn > 0 ? sim.shibas[sIdx[0] ?? -1] : undefined
  const cat = cn > 0 ? sim.cats[cIdx[0] ?? -1] : undefined
  if (shiba?.alive && cat?.alive && Math.abs(shiba.y - cat.y) <= ATTACK_RANGE) {
    shiba.hp -= cat.dps * dt
    cat.hp -= shiba.dps * dt
  }

  if (sim.boss && cn === 0) {
    const limit = CASTLE_REACH + GATE_DEPTH
    for (let i = 0; i < sn; i++) {
      const unit = sim.shibas[sIdx[i] ?? -1]
      if (!unit?.alive) continue
      if (unit.y > limit) break
      sim.castleHp -= unit.dps * dt
    }
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
  }
}
