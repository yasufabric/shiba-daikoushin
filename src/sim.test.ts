import { describe, expect, it } from 'vitest'
import {
  BOSS_AT,
  BONE_PER_SHIBA,
  BONE_RATE,
  COUNT_BLACK,
  COUNT_WHITE,
  CUT_TIME,
  HEAVY_HIT,
  KIND_BLACK,
  KIND_TAN,
  KIND_WHITE,
  SPECIAL_NEED,
  BREED_BULLDOG,
  BREED_CHIHUAHUA,
  BREED_CORGI,
  BREED_HP,
  BREED_SPEED,
  CASTLE_HP,
  HOME_HP,
  CLASH_AT,
  COST_TAN,
  COUNT_TAN,
  FIELD_H,
  BANNER_HOLD,
  LOSE_HOLD,
  MATCH_SECONDS,
  START_BONES,
  START_SHIBAS,
  STEP_TAN,
} from './balance'
import {
  costOf,
  createSim,
  fireSpecial,
  NO_INPUT,
  phaseAt,
  step,
  type Input,
  type Sim,
} from './sim'

function play(sim: Sim, seconds: number, inputFor: (sim: Sim) => Input): void {
  const n = Math.round(seconds * 30)
  for (let i = 0; i < n; i++) {
    if (sim.outcome !== 'play') return
    step(sim, 1 / 30, inputFor(sim))
  }
}

function greedy(sim: Sim): Input {
  let card = -1
  if (sim.bones >= sim.costBlack && sim.aliveShibas >= 8) card = 1
  else if (sim.bones >= sim.costWhite && sim.aliveShibas >= 6 && sim.seq % 4 === 3) card = 2
  else if (sim.bones >= sim.costTan) card = 0
  return { card, restart: false }
}

describe('match clock', () => {
  it('opens in the grow phase and changes at the clash and boss marks', () => {
    const sim = createSim({ tutorial: false })
    expect(sim.time).toBe(0)
    expect(phaseAt(0)).toBe('grow')
    expect(phaseAt(CLASH_AT - 0.01)).toBe('grow')
    expect(phaseAt(CLASH_AT)).toBe('clash')
    expect(phaseAt(BOSS_AT - 0.01)).toBe('clash')
    expect(phaseAt(BOSS_AT)).toBe('boss')
    expect(phaseAt(MATCH_SECONDS)).toBe('boss')
    expect(sim.bones).toBe(START_BONES)
    expect(sim.castleHp).toBe(CASTLE_HP)
    expect(sim.boss).toBe(false)
  })
})

describe('deploy', () => {
  it('starts a shiba on every path and each tap of the pointed card adds one', () => {
    const sim = createSim({ tutorial: true, seed: 2 })
    expect(sim.aliveShibas).toBe(START_SHIBAS)
    expect(sim.tutorial).toBe(true)
    const y0 = sim.shibas[0]?.y ?? 0
    step(sim, 0.2, NO_INPUT)
    expect(sim.shibas[0]?.y ?? 0).toBeLessThan(y0)
    const before = sim.bones
    step(sim, 1 / 30, { card: 0, restart: false })
    expect(sim.tutorial).toBe(false)
    expect(sim.aliveShibas).toBe(START_SHIBAS + COUNT_TAN)
    expect(sim.bones).toBeCloseTo(before + (1 / 30) * (BONE_RATE + (START_SHIBAS + COUNT_TAN) * BONE_PER_SHIBA) - COST_TAN)
    expect(sim.costTan).toBe(COST_TAN + STEP_TAN)
    expect(sim.sfxDeploy).toBe(1)
  })

  it('refuses a card the purse cannot afford', () => {
    const sim = createSim({ tutorial: false })
    sim.bones = 0
    step(sim, 1 / 30, { card: 0, restart: false })
    expect(sim.aliveShibas).toBe(START_SHIBAS)
    expect(sim.deny0).toBeGreaterThan(0)
    expect(sim.sfxDeploy).toBe(0)
  })
})

describe('cats', () => {
  it('trickles onto the field within ten seconds and swarms during the clash', () => {
    const sim = createSim({ tutorial: false, seed: 7 })
    expect(sim.aliveCats).toBeGreaterThan(0)
    let highest = FIELD_H
    for (let i = 0; i < sim.cats.length; i++) {
      const cat = sim.cats[i]
      if (cat?.alive && cat.y < highest) highest = cat.y
    }
    expect(highest).toBeLessThan(120)

    let openingPeak = 0
    let clashPeak = 0
    const steps = Math.round(80 * 30)
    for (let i = 0; i < steps; i++) {
      step(sim, 1 / 30, NO_INPUT)
      if (sim.time <= 10) openingPeak = Math.max(openingPeak, sim.aliveCats)
      if (sim.time >= CLASH_AT && sim.time < BOSS_AT) clashPeak = Math.max(clashPeak, sim.aliveCats)
    }
    expect(openingPeak).toBeGreaterThan(0)
    expect(openingPeak).toBeLessThan(12)
    expect(clashPeak).toBeGreaterThan(10)
    expect(clashPeak).toBeGreaterThan(openingPeak)
    expect(sim.boss).toBe(false)
  })
})

describe('battle', () => {
  it('brings the dog mansion at 150s and lets a deploying player destroy it', () => {
    const sim = createSim({ tutorial: false, seed: 3 })
    let sawCats = false
    let sawBoss = false
    play(sim, 180, (current) => {
      if (current.time >= CLASH_AT && current.time < BOSS_AT && current.aliveCats > 0) sawCats = true
      if (current.boss) sawBoss = true
      return greedy(current)
    })
    expect(sawCats).toBe(true)
    expect(sawBoss).toBe(true)
    expect(sim.outcome).toBe('won')
    expect(sim.time).toBeGreaterThan(BOSS_AT)
    expect(sim.time).toBeLessThan(MATCH_SECONDS)
    expect(sim.castleHp).toBe(0)
    expect(sim.rewardT).toBe(BANNER_HOLD)
    expect(BANNER_HOLD).toBeGreaterThanOrEqual(2)
    expect(BANNER_HOLD).toBeLessThanOrEqual(3)
    step(sim, 0.2, { card: -1, restart: true })
    expect(sim.outcome).toBe('won')
    expect(sim.rewardT).toBeGreaterThan(2)
    step(sim, BANNER_HOLD, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.rewardT).toBe(0)
    step(sim, 1 / 30, { card: -1, restart: true })
    expect(sim.outcome).toBe('play')
    expect(sim.time).toBe(0)
    expect(sim.aliveShibas).toBe(START_SHIBAS)
  })

  it('loses an idle match and retries without a confirm', () => {
    const sim = createSim({ tutorial: true, seed: 9 })
    play(sim, 180, () => NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.homeHp).toBe(0)
    expect(sim.time).toBeLessThan(BOSS_AT)
    expect(sim.castleHp).toBe(CASTLE_HP)
    expect(sim.tutorial).toBe(true)
    expect(sim.rewardT).toBe(LOSE_HOLD)
    expect(LOSE_HOLD).toBe(BANNER_HOLD)
    step(sim, 1, NO_INPUT)
    expect(sim.outcome).toBe('lost')
    step(sim, LOSE_HOLD, NO_INPUT)
    expect(sim.outcome).toBe('play')
    expect(sim.time).toBe(0)
    expect(sim.aliveShibas).toBe(START_SHIBAS)
    expect(sim.tutorial).toBe(true)
  })
})

describe('rival dogs', () => {
  it('sends チワワ and コーギー first, then mixes in ブルドッグ once the clash starts', () => {
    const sim = createSim({ tutorial: false, seed: 7 })
    const seen = new Set<number>()
    const note = (): void => {
      for (const dog of sim.cats) if (dog.alive && dog.fly === 0) seen.add(dog.kind)
    }
    play(sim, CLASH_AT - 1, () => {
      note()
      return NO_INPUT
    })
    expect(seen.has(BREED_BULLDOG)).toBe(false)
    expect(seen.has(BREED_CHIHUAHUA) || seen.has(BREED_CORGI)).toBe(true)
    play(sim, 40, () => {
      note()
      return NO_INPUT
    })
    expect(seen.has(BREED_BULLDOG)).toBe(true)
  })

  it('gives each breed its own toughness and pace', () => {
    expect(BREED_HP[BREED_BULLDOG]).toBeGreaterThan(BREED_HP[BREED_CORGI])
    expect(BREED_HP[BREED_CORGI]).toBeGreaterThan(BREED_HP[BREED_CHIHUAHUA])
    expect(BREED_SPEED[BREED_CHIHUAHUA]).toBeGreaterThan(BREED_SPEED[BREED_CORGI])
    expect(BREED_SPEED[BREED_CORGI]).toBeGreaterThan(BREED_SPEED[BREED_BULLDOG])
  })
})

describe('home', () => {
  it('takes bites from cats that reach the field floor', () => {
    const sim = createSim({ tutorial: false, seed: 5 })
    expect(sim.homeHp).toBe(HOME_HP)
    for (const unit of sim.shibas) unit.alive = false
    sim.aliveShibas = 0
    play(sim, 40, () => NO_INPUT)
    expect(sim.homeHp).toBeLessThan(HOME_HP)
  })

  it('loses the match the moment the home falls, before the clock runs out', () => {
    const sim = createSim({ tutorial: false, seed: 5 })
    for (const unit of sim.shibas) unit.alive = false
    sim.aliveShibas = 0
    sim.homeHp = 1
    play(sim, 60, () => NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.homeHp).toBe(0)
    expect(sim.time).toBeLessThan(60)
    step(sim, LOSE_HOLD, NO_INPUT)
    expect(sim.outcome).toBe('play')
    expect(sim.homeHp).toBe(HOME_HP)
  })
})

describe('soldiers', () => {
  it('deploys the 白柴 card as barkers spread across paths', () => {
    const sim = createSim({ tutorial: false })
    sim.bones = 500
    const cost = costOf(sim, KIND_WHITE)
    step(sim, 1 / 30, { card: 2, restart: false })
    let whites = 0
    const lanes = new Set<number>()
    for (const unit of sim.shibas) {
      if (!unit.alive || unit.kind !== KIND_WHITE) continue
      whites += 1
      lanes.add(unit.lane)
    }
    expect(whites).toBe(COUNT_WHITE)
    expect(lanes.size).toBe(COUNT_WHITE)
    expect(costOf(sim, KIND_WHITE)).toBeGreaterThan(cost)
  })

  it('lands 黒柴 bites as single heavy hits and fills only that coat', () => {
    const sim = createSim({ tutorial: false, seed: 5 })
    for (const unit of sim.shibas) if (unit.alive) unit.hp = 0
    sim.bones = 1000
    step(sim, 1 / 30, { card: 1, restart: false })
    step(sim, 1 / 30, { card: 1, restart: false })
    expect(sim.aliveShibas).toBe(COUNT_BLACK * 2)
    play(sim, 20, () => NO_INPUT)
    // One heavy bite drops a チワワ or コーギー outright, so each lands whole up to the dog's hp.
    expect(HEAVY_HIT).toBeGreaterThanOrEqual(BREED_HP[BREED_CORGI])
    expect(sim.charge[KIND_BLACK] ?? 0).toBeGreaterThanOrEqual(BREED_HP[BREED_CHIHUAHUA] * 2)
    expect(sim.charge[KIND_TAN]).toBe(0)
    expect(sim.charge[KIND_WHITE]).toBe(0)
  })

  it('fires a special on its own once the gauge fills, with a cut-in beat', () => {
    const sim = createSim({ tutorial: false, seed: 2 })
    play(sim, 61, () => NO_INPUT)
    sim.charge[KIND_TAN] = SPECIAL_NEED[KIND_TAN]
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.sfxSpecial).toBe(KIND_TAN)
    expect(sim.cutKind).toBe(KIND_TAN)
    expect(sim.rushT).toBeGreaterThan(0)
    expect(sim.charge[KIND_TAN]).toBe(0)
    play(sim, CUT_TIME + 0.1, () => NO_INPUT)
    expect(sim.cutKind).toBe(-1)
  })

  it('shoves every cat back with 白「チーズ!!」 and hits the castle with 黒「ジャーキー!!」', () => {
    const sim = createSim({ tutorial: false, seed: 4 })
    play(sim, 70, () => NO_INPUT)
    const ys = sim.cats.filter((c) => c.alive && c.fly === 0).map((c) => c.y)
    expect(ys.length).toBeGreaterThan(0)
    fireSpecial(sim, KIND_WHITE)
    const after = sim.cats.filter((c) => c.alive && c.fly === 0)
    expect(after.every((c) => c.hp < (BREED_HP[c.kind] ?? 0))).toBe(true)
    expect(sim.floatDmg).toBeGreaterThan(0)

    const boss = createSim({ tutorial: false, seed: 4 })
    boss.boss = true
    const hp = boss.castleHp
    fireSpecial(boss, KIND_BLACK)
    expect(boss.castleHp).toBeLessThan(hp)
  })
})
