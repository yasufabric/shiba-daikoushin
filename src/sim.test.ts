import { describe, expect, it } from 'vitest'
import {
  BOSS_HP,
  BONE_PER_KILL,
  BREED_BOSS,
  DOG_COUNT,
  BONE_PER_SHIBA,
  BONE_RATE,
  COUNT_BLACK,
  COUNT_WHITE,
  CUT_TIME,
  FX_TIME,
  HEAVY_HIT,
  KIND_BLACK,
  KIND_TAN,
  KIND_WHITE,
  KIND_SESAME,
  RECHARGE,
  LEVEL_COST_BASE,
  LEVEL_STEP,
  LOSS_PAY,
  MAX_LEVEL,
  WIN_PAY,
  HEAL_AMOUNT,
  SASAMI_HOME,
  SPECIAL_NEED,
  BREED_BULLDOG,
  BREED_CHIHUAHUA,
  BREED_CORGI,
  BREED_HP,
  BREED_SPEED,
  HOME_HP,
  CLASH_AT,
  COST_TAN,
  COUNT_TAN,
  FIELD_H,
  BANNER_HOLD,
  LOSE_HOLD,
  START_BONES,
  START_SHIBAS,
  STEP_TAN,
} from './balance'
import {
  costOf,
  createSim,
  strikeSpecial,
  buyLevel,
  levelCost,
  NO_INPUT,
  phaseAt,
  dogsLeft,
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

/** Every dog sent and the field cleared, so the next step decides the match. */
function clearField(sim: Sim): void {
  sim.toSend = 0
  sim.boss = true
  for (const dog of sim.cats) dog.alive = false
  sim.aliveCats = 0
}

function greedy(sim: Sim): Input {
  let card = -1
  if (sim.bones >= sim.costBlack && sim.aliveShibas >= 8) card = 1
  else if (sim.bones >= sim.costWhite && sim.aliveShibas >= 6 && sim.seq % 4 === 3) card = 2
  else if (sim.bones >= sim.costTan) card = 0
  return { card, restart: false }
}

describe('match clock', () => {
  it('opens in the grow phase, turns to the clash, and holds a fixed pack of dogs plus the boss', () => {
    const sim = createSim({ tutorial: false })
    expect(sim.time).toBe(0)
    expect(phaseAt(0)).toBe('grow')
    expect(phaseAt(CLASH_AT - 0.01)).toBe('grow')
    expect(phaseAt(CLASH_AT)).toBe('clash')
    expect(sim.bones).toBe(START_BONES)
    expect(sim.toSend).toBeLessThan(DOG_COUNT)
    expect(dogsLeft(sim)).toBe(DOG_COUNT + 1)
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

  it('picks a card, then sends each tap down the path the player chose', () => {
    const sim = createSim({ tutorial: false, seed: 3 })
    sim.bones = 500
    expect(sim.picked).toBe(KIND_TAN)
    step(sim, 1 / 30, { card: -1, pick: KIND_BLACK, restart: false })
    expect(sim.picked).toBe(KIND_BLACK)
    for (const lane of [4, 4, 0]) {
      step(sim, 1 / 30, { card: sim.picked, lane, restart: false })
      sim.recharge.fill(0)
    }
    const blacks = sim.shibas.filter((u) => u.alive && u.kind === KIND_BLACK).map((u) => u.lane)
    expect(blacks.sort()).toEqual([0, 4, 4])
  })

  it('makes each card wait out its recharge before it sends another shiba', () => {
    const sim = createSim({ tutorial: false, seed: 3 })
    sim.bones = 1000
    step(sim, 1 / 30, { card: KIND_TAN, lane: 1, restart: false })
    const after = sim.aliveShibas
    expect(sim.recharge[KIND_TAN]).toBeCloseTo(RECHARGE[KIND_TAN] - 1 / 30, 3)
    step(sim, 1 / 30, { card: KIND_TAN, lane: 1, restart: false })
    expect(sim.aliveShibas).toBe(after)
    expect(sim.deny0).toBeGreaterThan(0)
    step(sim, 1 / 30, { card: KIND_BLACK, lane: 1, restart: false })
    expect(sim.aliveShibas).toBe(after + 1)
    play(sim, RECHARGE[KIND_TAN], () => NO_INPUT)
    expect(sim.recharge[KIND_TAN]).toBe(0)
    const ready = sim.aliveShibas
    step(sim, 1 / 30, { card: KIND_TAN, lane: 1, restart: false })
    expect(sim.aliveShibas).toBe(ready + 1)
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
      if (sim.time >= CLASH_AT && !sim.boss) clashPeak = Math.max(clashPeak, sim.aliveCats)
    }
    expect(openingPeak).toBeGreaterThan(0)
    expect(openingPeak).toBeLessThan(12)
    expect(clashPeak).toBeGreaterThan(10)
    expect(clashPeak).toBeGreaterThan(openingPeak)
    expect(sim.boss).toBe(false)
  })
})

describe('battle', () => {
  it('sends the boss once the last dog has left, and wins when every dog is beaten', () => {
    const sim = createSim({ tutorial: false, seed: 3 })
    sim.toSend = 1
    play(sim, 30, (current) => {
      if (current.boss) current.homeHp = Math.max(current.homeHp, 1)
      return NO_INPUT
    })
    expect(sim.toSend).toBe(0)
    expect(sim.boss).toBe(true)
    const boss = sim.cats[sim.bossIndex]
    expect(boss?.kind).toBe(BREED_BOSS)
    expect(boss?.maxHp).toBe(BOSS_HP)
    expect(sim.outcome).toBe('play')
    for (const dog of sim.cats) if (dog.alive) dog.hp = 0
    const kills = sim.kills
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.kills).toBeGreaterThan(kills)
    expect(sim.earned).toBe(WIN_PAY + sim.kills * BONE_PER_KILL)
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

  it('loses an idle match, pays a little, and waits on the level-up screen for START', () => {
    const sim = createSim({ tutorial: true, seed: 9 })
    play(sim, 180, () => NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.homeHp).toBe(0)
    expect(dogsLeft(sim)).toBeGreaterThan(0)
    expect(sim.tutorial).toBe(true)
    expect(sim.rewardT).toBe(LOSE_HOLD)
    expect(LOSE_HOLD).toBe(BANNER_HOLD)
    expect(sim.earned).toBe(LOSS_PAY + sim.kills * BONE_PER_KILL)
    expect(sim.purse).toBe(sim.earned)
    const paid = sim.earned
    step(sim, 1, NO_INPUT)
    expect(sim.outcome).toBe('lost')
    step(sim, LOSE_HOLD, NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.rewardT).toBe(0)
    step(sim, 1 / 30, { card: -1, restart: true })
    expect(sim.outcome).toBe('play')
    expect(sim.time).toBe(0)
    expect(sim.aliveShibas).toBe(START_SHIBAS)
    expect(sim.tutorial).toBe(true)
    expect(sim.purse).toBe(paid)
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

describe('胡麻柴', () => {
  it('mends the most-hurt shiba nearby and fills its own gauge with the healing', () => {
    const sim = createSim({ tutorial: false, seed: 6 })
    sim.bones = 500
    step(sim, 1 / 30, { card: KIND_SESAME, restart: false })
    const healer = sim.shibas.find((u) => u.alive && u.kind === KIND_SESAME)
    expect(healer).toBeDefined()
    const hurt = sim.shibas.find((u) => u.alive && u.kind === KIND_TAN && u.lane === healer?.lane)
    expect(hurt).toBeDefined()
    if (!hurt) return
    hurt.hp = 10
    hurt.y = (healer?.y ?? 0) - 60
    play(sim, 1.2, () => NO_INPUT)
    expect(hurt.hp).toBeGreaterThanOrEqual(10 + HEAL_AMOUNT - 1)
    expect(sim.charge[KIND_SESAME] ?? 0).toBeGreaterThan(0)
    expect(sim.charge[KIND_TAN]).toBe(0)
  })

  it('brings every shiba back to full and mends the home with 「ササミ!!」', () => {
    const sim = createSim({ tutorial: false, seed: 6 })
    for (const unit of sim.shibas) if (unit.alive) unit.hp = 1
    sim.homeHp = 100
    strikeSpecial(sim, KIND_SESAME)
    for (const unit of sim.shibas) if (unit.alive) expect(unit.hp).toBe(unit.maxHp)
    expect(sim.homeHp).toBe(100 + SASAMI_HOME)
  })
})

describe('levels', () => {
  it('pays every match into a purse that buys coat levels on the level-up screen', () => {
    const sim = createSim({ tutorial: false, seed: 3, purse: 0 })
    play(sim, 5, greedy)
    clearField(sim)
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.earned).toBeGreaterThanOrEqual(WIN_PAY)
    expect(sim.purse).toBe(sim.earned)
    step(sim, BANNER_HOLD + 0.1, NO_INPUT)
    const purse = sim.purse
    step(sim, 1 / 30, { card: -1, levelUp: KIND_BLACK, restart: false })
    expect(sim.levels[KIND_BLACK]).toBe(2)
    expect(sim.purse).toBe(purse - levelCost(1))
    expect(levelCost(1)).toBe(LEVEL_COST_BASE)
    step(sim, 1 / 30, { card: -1, restart: true })
    expect(sim.outcome).toBe('play')
    expect(sim.levels[KIND_BLACK]).toBe(2)
  })

  it('makes a leveled coat tougher and harder-biting, and stops at the cap or an empty purse', () => {
    const base = createSim({ tutorial: false, seed: 1 })
    const strong = createSim({ tutorial: false, seed: 1, levels: [5, 1, 1, 1] })
    const a = base.shibas.find((u) => u.alive)
    const b = strong.shibas.find((u) => u.alive)
    expect(b?.maxHp).toBe(Math.round((a?.maxHp ?? 0) * (1 + 4 * LEVEL_STEP)))
    expect(b?.dps ?? 0).toBeGreaterThan(a?.dps ?? 0)
    const capped = createSim({ tutorial: false, levels: [MAX_LEVEL, 1, 1, 1], purse: 1e6 })
    expect(buyLevel(capped, 0)).toBe(false)
    const broke = createSim({ tutorial: false, purse: 0 })
    expect(buyLevel(broke, 0)).toBe(false)
    expect(broke.levels[0]).toBe(1)
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
    step(sim, 1 / 30, { card: -1, restart: true })
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
    sim.recharge.fill(0)
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
    sim.cutT = 0
    sim.cutKind = -1
    sim.fxT = 0
    sim.fxKind = -1
    sim.rushT = 0
    const strikes = sim.fxId
    sim.charge[KIND_TAN] = SPECIAL_NEED[KIND_TAN]
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.sfxSpecial).toBe(KIND_TAN)
    expect(sim.cutKind).toBe(KIND_TAN)
    expect(sim.charge[KIND_TAN]).toBe(0)
    // The cut-in plays first; the rush lands when it ends, with its field effect.
    expect(sim.rushT).toBe(0)
    expect(sim.fxKind).toBe(-1)
    play(sim, CUT_TIME + 0.05, () => NO_INPUT)
    expect(sim.cutKind).toBe(-1)
    expect(sim.rushT).toBeGreaterThan(0)
    expect(sim.fxKind).toBe(KIND_TAN)
    expect(sim.fxId).toBe(strikes + 1)
    play(sim, FX_TIME, () => NO_INPUT)
    expect(sim.fxKind).toBe(-1)
  })

  it('shoves every dog back with 白「チーズ!!」 and pierces the boss with 黒「ジャーキー!!」', () => {
    const sim = createSim({ tutorial: false, seed: 4 })
    play(sim, 70, () => NO_INPUT)
    const ys = sim.cats.filter((c) => c.alive && c.fly === 0).map((c) => c.y)
    expect(ys.length).toBeGreaterThan(0)
    strikeSpecial(sim, KIND_WHITE)
    const after = sim.cats.filter((c) => c.alive && c.fly === 0)
    expect(after.every((c) => c.hp < (BREED_HP[c.kind] ?? 0))).toBe(true)
    expect(sim.floatDmg).toBeGreaterThan(0)

    const field = createSim({ tutorial: false, seed: 4 })
    field.toSend = 0
    for (const dog of field.cats) dog.alive = false
    field.aliveCats = 0
    step(field, 1 / 30, NO_INPUT)
    const boss = field.cats[field.bossIndex]
    expect(boss?.kind).toBe(BREED_BOSS)
    strikeSpecial(field, KIND_BLACK)
    expect(boss?.hp ?? BOSS_HP).toBeLessThan(BOSS_HP)
  })
})
