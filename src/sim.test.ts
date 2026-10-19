import { describe, expect, it } from 'vitest'
import {
  BOSS_HP,
  STAGES,
  KIND_BIG,
  KIND_DISC,
  CALL_BONE,
  BONE_PER_KILL,
  BREED_BOSS,
  DOG_COUNT,
  BONE_PER_SHIBA,
  BONE_RATE,
  COUNT_BLACK,
  COUNT_SESAME,
  CUT_TIME,
  FX_TIME,
  HEAVY_HIT,
  KIND_BLACK,
  KIND_TAN,
  KIND_SESAME,
  KIND_WHITE,
  FREE_ZONE_Y,
  FREE_REACH,
  BARK_RANGE,
  BARK_SPLASH,
  HEAL_RADIUS,
  JERKY_TARGETS,
  CHEESE_STUN,
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
  BREED_POODLE,
  BREED_POM,
  COAT_UNLOCK,
  KIND_CHEER,
  BOSS_HOWL_FIRST,
  BOSS_STUN_FROM,
  WANWAN_T,
  HERO_REVIVE,
  HERO_SKILL_CD,
  CANNON_CHARGE,
  CANNON_REACH,
  HERO_SLOT,
  XP_NEED_BASE,
  PERK_A,
  HERO_HP,
  HERO_SKILL_R,
  HERO_HIT,
  HERO_RADIUS,
  POODLE_RANGE,
  BREED_GOLDEN,
  BREED_CHIHUAHUA,
  FIELD_W,
  PINCER_COUNT,
  SWARM_COUNT,
  WALL_COUNT,
  WAVE_MIXED,
  WAVE_PINCER,
  WAVE_SWARM,
  WAVE_WALL,
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
  spawnCat,
  stageOpen,
  spawnShiba,
  toggleDeck,
  coatOpen,
  deckReady,
  canCall,
  strikeSpecial,
  buyLevel,
  xpNeed,
  gainXp,
  perk,
  levelCost,
  NO_INPUT,
  phaseAt,
  dogsLeft,
  step,
  type Input,
  type Unit,
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
    step(sim, 1 / 30, { card: KIND_WHITE, restart: false })
    const healer = sim.shibas.find((u) => u.alive && u.kind === KIND_WHITE)
    expect(healer).toBeDefined()
    const hurt = sim.shibas.find((u) => u.alive && u.kind === KIND_TAN && u.lane === healer?.lane)
    expect(hurt).toBeDefined()
    if (!hurt) return
    hurt.hp = 10
    hurt.y = (healer?.y ?? 0) - 60
    play(sim, 1.2, () => NO_INPUT)
    expect(hurt.hp).toBeGreaterThanOrEqual(10 + HEAL_AMOUNT - 1)
    expect(sim.charge[KIND_WHITE] ?? 0).toBeGreaterThan(0)
    expect(sim.charge[KIND_TAN]).toBe(0)
  })

  it('brings every shiba back to full and mends the home with 「ササミ!!」', () => {
    const sim = createSim({ tutorial: false, seed: 6 })
    for (const unit of sim.shibas) if (unit.alive) unit.hp = 1
    sim.homeHp = 100
    strikeSpecial(sim, KIND_WHITE)
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

describe('free placement trial', () => {
  it('drops a shiba where the player taps, pulled down into the deploy zone', () => {
    const sim = createSim({ tutorial: false, seed: 2, free: true })
    sim.bones = 500
    step(sim, 1 / 30, { card: KIND_TAN, at: { x: 60, y: 500 }, restart: false })
    const placed = sim.shibas.filter((u) => u.alive && Math.abs(u.x - 60) < 12 && Math.abs(u.y - 500) < 12)
    expect(placed.length).toBe(1)
    sim.recharge.fill(0)
    step(sim, 1 / 30, { card: KIND_TAN, at: { x: 300, y: 40 }, restart: false })
    const pulled = sim.shibas.find((u) => u.alive && Math.abs(u.x - 300) < 12)
    expect(pulled?.y ?? 0).toBeGreaterThanOrEqual(FREE_ZONE_Y - 2)
  })

  it('sends a shiba to the nearest dog in sight and has the dog head for the house when none is', () => {
    const sim = createSim({ tutorial: false, seed: 2, free: true })
    for (const u of sim.shibas) u.alive = false
    sim.aliveShibas = 0
    const dog = sim.cats.find((u) => u.alive)
    expect(dog).toBeDefined()
    if (!dog) return
    dog.x = 80
    dog.y = 400
    play(sim, 1, () => NO_INPUT)
    expect(dog.y).toBeGreaterThan(400)
    sim.bones = 500
    step(sim, 1 / 30, { card: KIND_TAN, at: { x: 120, y: 450 }, restart: false })
    const shiba = sim.shibas.find((u) => u.alive)
    if (!shiba) throw new Error('no shiba')
    const before = Math.hypot(shiba.x - dog.x, shiba.y - dog.y)
    play(sim, 1, () => NO_INPUT)
    const after = Math.hypot(shiba.x - dog.x, shiba.y - dog.y)
    expect(after).toBeLessThan(before)
    expect(after).toBeLessThanOrEqual(FREE_REACH + 4)
  })
})

describe('free placement roles', () => {
  function emptyField(): Sim {
    const sim = createSim({ tutorial: false, seed: 2, free: true, best: [1, 1, 1, 1, 1, 1, 1, 1] })
    sim.deck = [0, 1, 2, 3]
    for (const u of sim.shibas) u.alive = false
    for (const u of sim.cats) u.alive = false
    sim.aliveShibas = 0
    sim.aliveCats = 0
    sim.toSend = 50
    sim.nextCat = 999
    sim.bones = 2000
    return sim
  }
  function drop(sim: Sim, card: number, x: number, y: number): Unit {
    sim.recharge.fill(0)
    step(sim, 1 / 30, { card, at: { x, y }, restart: false })
    const u = sim.shibas.find((v) => v.alive && v.kind === card && Math.abs(v.x - x) < 14 && Math.abs(v.y - y) < 14)
    if (!u) throw new Error('not placed')
    return u
  }

  it('sends a shiba after a dog far out of sight instead of waiting', () => {
    const sim = emptyField()
    const shiba = drop(sim, KIND_TAN, 300, 450)
    const dog = sim.cats[0]
    if (!dog) throw new Error('no dog')
    Object.assign(dog, { alive: true, fly: 0, kind: BREED_BULLDOG, hp: 9999, maxHp: 9999, dps: 0, speed: 0, x: 40, y: 200, stun: 0 })
    sim.aliveCats = 1
    const before = Math.hypot(shiba.x - dog.x, shiba.y - dog.y)
    expect(before).toBeGreaterThan(130)
    play(sim, 3, () => NO_INPUT)
    expect(Math.hypot(shiba.x - dog.x, shiba.y - dog.y)).toBeLessThan(before - 30)
  })

  it('sends a tapped shiba home, where it leaves the field and frees a slot', () => {
    const sim = emptyField()
    const shiba = drop(sim, KIND_TAN, 100, 450)
    expect(sim.aliveShibas).toBe(1)
    step(sim, 1 / 30, { card: -1, restart: false, recall: { x: shiba.x, y: shiba.y - 10 } })
    expect(shiba.recall).toBe(true)
    play(sim, 8, () => NO_INPUT)
    expect(shiba.alive).toBe(false)
    expect(sim.aliveShibas).toBe(0)
  })

  it('shaves the ゴールデン shield off every hit but lets a heavy hit through', () => {
    const sim = emptyField()
    const red = drop(sim, KIND_TAN, 200, 500)
    const dog = sim.cats[0]
    if (!dog) throw new Error('no dog')
    Object.assign(dog, { alive: true, fly: 0, kind: BREED_GOLDEN, hp: 1000, maxHp: 1000, dps: 0, speed: 0, x: 200, y: 480, stun: 0 })
    sim.aliveCats = 1
    red.speed = 0
    red.dps = 20
    play(sim, 4, () => NO_INPUT)
    const taken = 1000 - dog.hp
    expect(taken).toBeGreaterThan(0)
    expect(taken).toBeLessThan(20 * 4 * 0.8)
  })

  it('aims 「シバドリル!!」 at the toughest dogs on the field and notes each hit', () => {
    const sim = emptyField()
    const dogs = sim.cats.slice(0, JERKY_TARGETS + 3)
    dogs.forEach((dog, k) => Object.assign(dog, { alive: true, fly: 0, kind: BREED_BULLDOG, hp: 500 + k * 100, maxHp: 999, dps: 0, speed: 0, x: 20 + k * 25, y: 100 + k * 30 }))
    sim.aliveCats = dogs.length
    const before = dogs.map((d) => d.hp)
    strikeSpecial(sim, KIND_BLACK)
    const hit = dogs.filter((d, k) => d.hp < (before[k] ?? 0))
    expect(hit.length).toBe(JERKY_TARGETS)
    expect(hit.includes(dogs[dogs.length - 1] as (typeof dogs)[number])).toBe(true)
    expect(sim.fxHits.length).toBe(JERKY_TARGETS)
  })

  it('freezes every dog but the boss with 「チーズ!!」 and thaws them after CHEESE_STUN', () => {
    const sim = emptyField()
    const dogs = sim.cats.slice(0, 2)
    dogs.forEach((dog, k) => Object.assign(dog, { alive: true, fly: 0, kind: k === 0 ? BREED_BULLDOG : BREED_BOSS, hp: 999, maxHp: 999, dps: 0, speed: 40, x: 100 + k * 100, y: 300 }))
    sim.aliveCats = 2
    strikeSpecial(sim, KIND_SESAME)
    expect(dogs[0]?.stun).toBe(CHEESE_STUN)
    expect(dogs[1]?.stun).toBe(0)
    const y = dogs[0]?.y ?? 0
    play(sim, CHEESE_STUN - 0.5, () => NO_INPUT)
    expect(dogs[0]?.y).toBeCloseTo(y, 5)
    play(sim, 1.5, () => NO_INPUT)
    expect(dogs[0]?.y).toBeGreaterThan(y)
  })

  it('lets a beaten dog fly off the top instead of pinning it by the mansion', () => {
    const sim = emptyField()
    const dog = sim.cats[0]
    if (!dog) throw new Error('no dog')
    Object.assign(dog, { alive: true, fly: 0, kind: BREED_BULLDOG, hp: 1, maxHp: 1, dps: 0, speed: 0, x: 180, y: 200 })
    sim.aliveCats = 1
    dog.hp = 0
    play(sim, 2, () => NO_INPUT)
    expect(dog.alive).toBe(false)
  })

  it('makes a dog go for 黒 over a slightly nearer 赤', () => {
    const sim = emptyField()
    const red = drop(sim, KIND_TAN, 150, 500)
    const black = drop(sim, KIND_BLACK, 230, 500)
    red.speed = 0
    black.speed = 0
    const dog = sim.cats[0]
    if (!dog) throw new Error('no dog')
    Object.assign(dog, { alive: true, fly: 0, kind: BREED_CORGI, hp: 999, maxHp: 999, dps: 0, speed: 30, x: 175, y: 440 })
    sim.aliveCats = 1
    play(sim, 1.5, () => NO_INPUT)
    expect(Math.hypot(dog.x - black.x, dog.y - black.y)).toBeLessThan(Math.hypot(dog.x - red.x, dog.y - red.y))
  })

  it('has 白 bark from range and splash the dogs around its target', () => {
    const sim = emptyField()
    const white = drop(sim, KIND_SESAME, 180, 480)
    const dogs = sim.cats.slice(0, 2)
    dogs.forEach((dog, k) => Object.assign(dog, { alive: true, fly: 0, kind: BREED_BULLDOG, hp: 999, maxHp: 999, dps: 0, speed: 0, x: 180 + k * (BARK_SPLASH - 10), y: 480 - BARK_RANGE + 10 }))
    sim.aliveCats = 2
    play(sim, 2, () => NO_INPUT)
    expect(Math.hypot((dogs[0]?.x ?? 0) - white.x, (dogs[0]?.y ?? 0) - white.y)).toBeGreaterThan(FREE_REACH)
    for (const dog of dogs) expect(dog.hp).toBeLessThan(999)
  })

  it('has 胡麻 mend every hurt shiba inside its ring at once and none outside', () => {
    const sim = emptyField()
    const near = drop(sim, KIND_TAN, 150, 450)
    const near2 = drop(sim, KIND_TAN, 210, 450)
    const far = drop(sim, KIND_TAN, 40, 600)
    for (const u of [near, near2, far]) {
      u.speed = 0
      u.hp = 10
    }
    const healer = drop(sim, KIND_WHITE, 180, 470)
    healer.speed = 0
    play(sim, 1.2, () => NO_INPUT)
    expect(near.hp).toBeGreaterThan(10)
    expect(near2.hp).toBeGreaterThan(10)
    expect(far.hp).toBe(10)
    expect(Math.hypot(far.x - healer.x, far.y - healer.y)).toBeGreaterThan(HEAL_RADIUS)
  })

  it('has 胡麻 walk to a hurt shiba outside its ring, passing a healthy one, and mend it', () => {
    const sim = emptyField()
    const fine = drop(sim, KIND_TAN, 120, 460)
    const hurt = drop(sim, KIND_TAN, 300, 600)
    for (const u of [fine, hurt]) u.speed = 0
    hurt.hp = 10
    const healer = drop(sim, KIND_WHITE, 120, 480)
    expect(Math.hypot(hurt.x - healer.x, hurt.y - healer.y)).toBeGreaterThan(HEAL_RADIUS)
    play(sim, 8, () => NO_INPUT)
    expect(Math.hypot(hurt.x - healer.x, hurt.y - healer.y)).toBeLessThan(HEAL_RADIUS)
    expect(hurt.hp).toBeGreaterThan(10)
  })
})

describe('wave patterns', () => {
  function clashSim(): ReturnType<typeof createSim> {
    const sim = createSim({ tutorial: false, seed: 11, free: true })
    for (const u of sim.shibas) u.alive = false
    sim.aliveShibas = 0
    sim.time = CLASH_AT + 1
    for (const dog of sim.cats) dog.alive = false
    sim.aliveCats = 0
    return sim
  }

  it('sends the announced チワワ swarm from one side, then announces a different pattern', () => {
    const sim = clashSim()
    sim.planKind = WAVE_SWARM
    sim.planSide = 0
    sim.planCount = SWARM_COUNT
    sim.nextCat = sim.time
    step(sim, 1 / 30, NO_INPUT)
    const fresh = sim.cats.filter((c) => c.alive && c.fly !== 1)
    expect(fresh.length).toBe(SWARM_COUNT)
    for (const dog of fresh) {
      expect(dog.kind).toBe(BREED_CHIHUAHUA)
      expect(dog.x).toBeLessThan(FIELD_W / 2)
    }
    expect(sim.planKind).not.toBe(WAVE_SWARM)
  })

  it('sends a ブルドッグ wall shoulder to shoulder and a コーギー pincer to both edges', () => {
    const wall = clashSim()
    wall.planKind = WAVE_WALL
    wall.planCount = WALL_COUNT
    wall.nextCat = wall.time
    step(wall, 1 / 30, NO_INPUT)
    const bulls = wall.cats.filter((c) => c.alive && c.kind === BREED_BULLDOG)
    expect(bulls.length).toBe(WALL_COUNT)
    expect(Math.max(...bulls.map((c) => c.x)) - Math.min(...bulls.map((c) => c.x))).toBeGreaterThan(FIELD_W * 0.5)

    const pincer = clashSim()
    pincer.planKind = WAVE_PINCER
    pincer.planCount = PINCER_COUNT
    pincer.nextCat = pincer.time
    step(pincer, 1 / 30, NO_INPUT)
    const corgis = pincer.cats.filter((c) => c.alive && c.fly !== 1)
    expect(corgis.length).toBe(PINCER_COUNT)
    expect(corgis.filter((c) => c.x < FIELD_W * 0.3).length).toBe(PINCER_COUNT / 2)
    expect(corgis.filter((c) => c.x > FIELD_W * 0.7).length).toBe(PINCER_COUNT / 2)
  })

  it('announces nothing during the opening trickle', () => {
    const sim = createSim({ tutorial: false, seed: 11, free: true })
    play(sim, 20, () => NO_INPUT)
    expect(sim.planKind).toBe(WAVE_MIXED)
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
    const cost = costOf(sim, KIND_SESAME)
    step(sim, 1 / 30, { card: 2, restart: false })
    let whites = 0
    const lanes = new Set<number>()
    for (const unit of sim.shibas) {
      if (!unit.alive || unit.kind !== KIND_SESAME) continue
      whites += 1
      lanes.add(unit.lane)
    }
    expect(whites).toBe(COUNT_SESAME)
    expect(lanes.size).toBe(COUNT_SESAME)
    expect(costOf(sim, KIND_SESAME)).toBeGreaterThan(cost)
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
    expect(sim.charge[KIND_SESAME]).toBe(0)
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
    strikeSpecial(sim, KIND_SESAME)
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

  it('rates a win by 柴の家 HP left, opens the next stage, and replays after a loss', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true })
    expect(sim.stage).toBe(0)
    const clear = (): void => {
      for (const dog of sim.cats) dog.alive = false
      sim.aliveCats = 0
    }
    clear()
    sim.toSend = 0
    sim.boss = true
    sim.homeHp = HOME_HP
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.stars).toBe(3)
    expect(sim.best[0]).toBe(3)
    sim.rewardT = 0
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.stage).toBe(1)
    expect(sim.toSend).toBeLessThanOrEqual(STAGES[1]?.count ?? 0)
    clear()
    sim.toSend = 0
    sim.boss = true
    sim.homeHp = HOME_HP * 0.4
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.stars).toBe(2)
    sim.rewardT = 0
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.stage).toBe(2)

    sim.homeHp = 0
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.stars).toBe(0)
    sim.rewardT = 0
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.stage).toBe(2)
    expect(sim.best.slice(0, 3)).toEqual([3, 2, 0])
  })

  it('makes later stages tougher', () => {
    const hp = (stage: number): number => {
      const sim = createSim({ tutorial: false, seed: 4, free: true, stage })
      spawnCat(sim, 0, BREED_CORGI)
      return sim.cats.find((c) => c.alive)?.hp ?? 0
    }
    expect(hp(0)).toBeLessThan(hp(2))
    expect(hp(2)).toBeLessThan(hp(4))
  })

  it('calls the next wave early for bonus ホネ that pay out at the end', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true })
    play(sim, 5, () => NO_INPUT)
    const before = sim.toSend
    const wait = sim.nextCat - sim.time
    expect(wait).toBeGreaterThan(0.6)
    step(sim, 1 / 30, { ...NO_INPUT, callWave: true })
    expect(sim.toSend).toBeLessThan(before)
    expect(sim.callBonus).toBeGreaterThan(0)
    expect(sim.callBonus).toBeLessThanOrEqual(Math.round(wait * CALL_BONE))
    const lanes = createSim({ tutorial: false, seed: 4 })
    expect(canCall(lanes)).toBe(false)
  })

  it('walks dogs around a pond instead of through or into it', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true, stage: 4 })
    for (const dog of sim.cats) dog.alive = false
    sim.aliveCats = 0
    for (const shiba of sim.shibas) shiba.alive = false
    sim.aliveShibas = 0
    sim.toSend = 5
    sim.nextCat = 1e9
    const pond = STAGES[4]?.rocks[0]
    expect(pond).toBeDefined()
    if (!pond) return
    spawnCat(sim, 1, BREED_CORGI, { x: pond.x, y: pond.y - pond.r - 30 })
    const dog = sim.cats.find((c) => c.alive)
    expect(dog).toBeDefined()
    if (!dog) return
    let closest = Infinity
    for (let i = 0; i < 30 * 40 && dog.y < pond.y + pond.r + 30; i++) {
      step(sim, 1 / 30, NO_INPUT)
      closest = Math.min(closest, Math.hypot(dog.x - pond.x, dog.y - pond.y))
    }
    expect(dog.y).toBeGreaterThan(pond.y + pond.r)
    expect(closest).toBeGreaterThanOrEqual(pond.r)
  })

  it('keeps a four-coat deck: toggling swaps coats, an incomplete deck blocks START, and only deck coats deploy', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true, best: [1, 1, 1, 1, 1], deck: [0, 1, 2, 3] })
    expect(sim.deck).toEqual([0, 1, 2, 3])
    expect(toggleDeck(sim, 4)).toBe(false)
    expect(toggleDeck(sim, 3)).toBe(true)
    expect(toggleDeck(sim, 4)).toBe(true)
    expect(sim.deck).toEqual([0, 1, 2, 4])
    toggleDeck(sim, 0)
    expect(deckReady(sim)).toBe(false)
    sim.outcome = 'lost'
    sim.rewardT = 0
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.outcome).toBe('lost')
    toggleDeck(sim, 5)
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.outcome).toBe('play')
    expect(sim.deck).toEqual([1, 2, 4, 5])
    const alive = sim.aliveShibas
    step(sim, 1 / 30, { ...NO_INPUT, card: 3, at: { x: 100, y: 500 } })
    expect(sim.aliveShibas).toBe(alive)
    step(sim, 1 / 30, { ...NO_INPUT, card: 4, at: { x: 100, y: 500 } })
    expect(sim.aliveShibas).toBe(alive + 1)
    const saved = createSim({ tutorial: false, free: true, deck: [1, 2, 4, 5], best: [1, 1, 1, 1, 1] })
    expect(saved.deck).toEqual([1, 2, 4, 5])
    expect(createSim({ tutorial: false, free: true, deck: [1, 1, 4, 5] }).deck).toEqual([0])
    expect(createSim({ tutorial: false, deck: [1, 2, 4, 5] }).deck).toEqual([0, 1, 2, 3])
  })

  it('ぶち柴 cuts a frisbee through every dog in a line, and どっしり柴 stomps all dogs at its paws', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true })
    for (const u of [...sim.shibas, ...sim.cats]) u.alive = false
    sim.aliveShibas = 0
    sim.aliveCats = 0
    sim.nextCat = 1e9
    spawnShiba(sim, KIND_DISC, 0, 400)
    const thrower = sim.shibas.find((u) => u.alive)
    expect(thrower).toBeDefined()
    if (!thrower) return
    thrower.x = 100
    const line = [330, 290, 250]
    for (const y of line) spawnCat(sim, 0, BREED_CORGI, { x: 100, y })
    const off = spawnCat(sim, 0, BREED_CORGI, { x: 160, y: 320 })
    expect(off).toBe(true)
    const before = sim.cats.filter((c) => c.alive).map((c) => c.hp)
    step(sim, 1 / 30, NO_INPUT)
    const hit = sim.cats.filter((c) => c.alive && c.x === 100 && c.hp < c.maxHp)
    expect(hit.length).toBeGreaterThanOrEqual(2)
    expect(sim.cats.filter((c) => c.alive && c.x === 160)[0]?.hp).toBe(before[3])

    const heavy = createSim({ tutorial: false, seed: 4, free: true })
    for (const u of [...heavy.shibas, ...heavy.cats]) u.alive = false
    heavy.aliveShibas = 0
    heavy.aliveCats = 0
    heavy.nextCat = 1e9
    spawnShiba(heavy, KIND_BIG, 0, 300)
    const big = heavy.shibas.find((u) => u.alive)
    if (!big) return
    big.x = 100
    spawnCat(heavy, 0, BREED_CORGI, { x: 112, y: 280 })
    spawnCat(heavy, 0, BREED_CORGI, { x: 90, y: 292 })
    spawnCat(heavy, 0, BREED_CORGI, { x: 100, y: 200 })
    step(heavy, 1 / 30, NO_INPUT)
    const near = heavy.cats.filter((c) => c.alive && c.y > 250)
    expect(near.every((c) => c.hp < c.maxHp)).toBe(true)
    expect(heavy.cats.find((c) => c.alive && c.y < 250)?.hp).toBe(heavy.cats.find((c) => c.alive && c.y < 250)?.maxHp)
  })

  it('fires ボーロ across the front row and ミルク on the thickest knot', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true })
    for (const u of [...sim.shibas, ...sim.cats]) u.alive = false
    sim.aliveShibas = 0
    sim.aliveCats = 0
    sim.nextCat = 1e9
    spawnCat(sim, 0, BREED_CORGI, { x: 30, y: 300 })
    spawnCat(sim, 0, BREED_CORGI, { x: 300, y: 310 })
    spawnCat(sim, 0, BREED_CORGI, { x: 150, y: 100 })
    strikeSpecial(sim, KIND_DISC)
    const rows = sim.cats.filter((c) => c.alive && c.hp > 0)
    expect(rows.filter((c) => c.y > 250).every((c) => c.hp < c.maxHp)).toBe(true)
    expect(rows.find((c) => c.y < 150)?.hp).toBe(rows.find((c) => c.y < 150)?.maxHp)

    const knot = createSim({ tutorial: false, seed: 4, free: true })
    for (const u of [...knot.shibas, ...knot.cats]) u.alive = false
    knot.aliveShibas = 0
    knot.aliveCats = 0
    knot.nextCat = 1e9
    for (const [x, y] of [[100, 200], [120, 210], [110, 190], [330, 100]] as const) spawnCat(knot, 0, BREED_CORGI, { x, y })
    strikeSpecial(knot, KIND_BIG)
    const alive = knot.cats.filter((c) => c.alive)
    expect(alive.filter((c) => c.x < 200).every((c) => c.stun > 0)).toBe(true)
    expect(alive.find((c) => c.x > 300)?.stun).toBe(0)
  })

  it('opens on the title, locks stages until the one before is cleared, and goes home from the result screen', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true, title: true, stage: 1, best: [2, 0, 0, 0, 0] })
    const t0 = sim.time
    step(sim, 1, NO_INPUT)
    expect(sim.time).toBe(t0)
    expect(stageOpen(sim, 0)).toBe(true)
    expect(stageOpen(sim, 1)).toBe(true)
    expect(stageOpen(sim, 2)).toBe(false)
    step(sim, 1 / 30, { ...NO_INPUT, pickStage: 2 })
    expect(sim.title).toBe(true)
    step(sim, 1 / 30, { ...NO_INPUT, pickStage: 0 })
    expect(sim.title).toBe(false)
    expect(sim.stage).toBe(0)
    expect(sim.toSend).toBeLessThanOrEqual(STAGES[0]?.count ?? 0)
    sim.outcome = 'lost'
    sim.rewardT = 0
    step(sim, 1 / 30, { ...NO_INPUT, home: true })
    expect(sim.title).toBe(true)
    step(sim, 1 / 30, { ...NO_INPUT, pickStage: 1 })
    expect(sim.stage).toBe(1)
    expect(sim.outcome).toBe('play')
  })

  it('a poodle lobs from a distance and never closes to biting range', () => {
    const sim = createSim({ tutorial: false, seed: 5, free: true, stage: 1 })
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    for (const u of sim.shibas) u.alive = false
    sim.aliveShibas = 0
    sim.nextCat = 1e9
    spawnCat(sim, 0, BREED_POODLE, { x: 97, y: 150 })
    const shiba = spawnShiba(sim, KIND_BLACK, 0, 0) && sim.shibas.find((u) => u.alive)
    expect(!!shiba).toBe(true)
    if (!shiba) return
    Object.assign(shiba, { x: 97, y: 150 + POODLE_RANGE - 6, hp: 500, maxHp: 500, speed: 0, dps: 0, cd: 99 })
    const hp0 = shiba.hp
    for (let i = 0; i < 90; i++) step(sim, 1 / 30, NO_INPUT)
    const poodle = sim.cats.find((c) => c.alive && c.kind === BREED_POODLE)
    expect(!!poodle).toBe(true)
    expect(shiba.hp).toBeLessThan(hp0)
    expect(Math.hypot((poodle?.x ?? 0) - shiba.x, (poodle?.y ?? 0) - shiba.y)).toBeGreaterThan(60)
  })

  it('later stages mix poodles into the clash waves; stage 1 and ?lanes have none', () => {
    expect(STAGES[0]?.poodleEvery).toBe(0)
    expect((STAGES[4]?.poodleEvery ?? 0) > 0).toBe(true)
  })

  it('the hero walks to a tap, spins at dogs in reach, and returns after falling', () => {
    const sim = createSim({ tutorial: false, seed: 6, free: true, hero: true, stage: 0 })
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    sim.nextCat = 1e9
    expect(sim.hero.alive).toBe(true)
    step(sim, 1 / 30, { ...NO_INPUT, hero: { x: 40, y: 300 } })
    expect(sim.heroGo?.x).toBe(40)
    for (let i = 0; i < 400 && sim.heroGo; i++) step(sim, 1 / 30, NO_INPUT)
    expect(sim.heroGo).toBe(null)
    expect(Math.abs(sim.hero.x - 40)).toBeLessThan(4)
    spawnCat(sim, 0, BREED_BULLDOG, { x: sim.hero.x + HERO_RADIUS - 6, y: sim.hero.y })
    const dog = sim.cats.find((c) => c.alive)
    const hp0 = dog?.hp ?? 0
    Object.assign(dog ?? {}, { dps: 0, speed: 0 })
    for (let i = 0; i < 12; i++) step(sim, 1 / 30, NO_INPUT)
    expect((dog?.hp ?? 0) <= hp0 - HERO_HIT).toBe(true)
    sim.hero.hp = 0
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.hero.alive).toBe(false)
    for (let i = 0; i < HERO_REVIVE * 30 + 60; i++) step(sim, 1 / 30, NO_INPUT)
    expect(sim.hero.alive).toBe(true)
    expect(sim.hero.hp).toBeGreaterThan(0)
  })

  it('starts with 赤柴 alone and unlocks one coat per stage cleared, which joins the deck by itself', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true, deck: [0, 1, 4, 5] })
    expect(sim.deck).toEqual([0])
    expect(deckReady(sim)).toBe(true)
    expect(coatOpen(sim, 1)).toBe(false)
    expect(toggleDeck(sim, 1)).toBe(false)
    expect(buyLevel(sim, 4)).toBe(false)
    sim.stage = COAT_UNLOCK[1] ?? 0
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    sim.toSend = 0
    sim.boss = true
    sim.bossIndex = -1
    for (let i = 0; i < 120 && sim.outcome === 'play'; i++) step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.newCoat).toBe(1)
    expect(coatOpen(sim, 1)).toBe(true)
    expect(sim.deck).toEqual([0, 1])
    expect(deckReady(sim)).toBe(true)
  })

  it('応援柴 makes nearby shibas bite faster, fills its gauge, and ワンワン!! fires the whole pack up', () => {
    const run = (cheer: boolean): number => {
      const sim = createSim({ tutorial: false, seed: 7, free: true })
      for (const c of sim.cats) c.alive = false
      for (const u of sim.shibas) u.alive = false
      sim.aliveCats = 0
      sim.aliveShibas = 0
      sim.nextCat = 1e9
      spawnCat(sim, 0, BREED_BULLDOG, { x: 100, y: 300 })
      const dog = sim.cats.find((c) => c.alive)
      Object.assign(dog ?? {}, { hp: 99999, maxHp: 99999, dps: 0, speed: 0 })
      spawnShiba(sim, KIND_TAN, 0, 0)
      const biter = sim.shibas.find((u) => u.alive)
      Object.assign(biter ?? {}, { x: 100, y: 320, speed: 0 })
      if (cheer) {
        spawnShiba(sim, KIND_CHEER, 0, 0)
        const c = sim.shibas.find((u) => u.alive && u.kind === KIND_CHEER)
        Object.assign(c ?? {}, { x: 100, y: 340, speed: 0 })
      }
      for (let i = 0; i < 300; i++) step(sim, 1 / 30, NO_INPUT)
      if (cheer) expect((sim.charge[KIND_CHEER] ?? 0) > 0).toBe(true)
      return 99999 - (dog?.hp ?? 0)
    }
    const plain = run(false)
    const cheered = run(true)
    expect(cheered).toBeGreaterThan(plain * 1.2)
    const sim = createSim({ tutorial: false, seed: 7, free: true })
    strikeSpecial(sim, KIND_CHEER)
    expect(sim.wanT).toBe(WANWAN_T)
  })

  it('the boss howls: later stages call チワワ to its side and the last ones stun shibas near it', () => {
    const sim = createSim({ tutorial: false, seed: 8, free: true, stage: BOSS_STUN_FROM })
    for (const c of sim.cats) c.alive = false
    for (const u of sim.shibas) u.alive = false
    sim.aliveCats = 0
    sim.aliveShibas = 0
    sim.nextCat = 1e9
    spawnCat(sim, 0, BREED_BOSS, { x: 97, y: 200 })
    const boss = sim.cats.find((c) => c.alive)
    Object.assign(boss ?? {}, { cd: BOSS_HOWL_FIRST, speed: 0, dps: 0, hp: 99999, maxHp: 99999 })
    spawnShiba(sim, KIND_BLACK, 0, 0)
    const shiba = sim.shibas.find((u) => u.alive)
    Object.assign(shiba ?? {}, { x: 97, y: 240, speed: 0, dps: 0, hp: 9999, maxHp: 9999 })
    const before = sim.cats.filter((c) => c.alive).length
    for (let i = 0; i < (BOSS_HOWL_FIRST + 0.5) * 30; i++) step(sim, 1 / 30, NO_INPUT)
    expect(sim.howlAt).toBeGreaterThan(0)
    expect(sim.cats.filter((c) => c.alive && c.kind === BREED_CHIHUAHUA).length).toBeGreaterThan(0)
    expect(sim.cats.filter((c) => c.alive).length).toBeGreaterThan(before)
    expect((shiba?.stun ?? 0) > 0).toBe(true)
  })

  it('quitting from the pause menu goes back to the title, and a picked stage starts fresh', () => {
    const sim = createSim({ tutorial: false, seed: 9, free: true, stage: 0 })
    for (let i = 0; i < 60; i++) step(sim, 1 / 30, NO_INPUT)
    step(sim, 1 / 30, { ...NO_INPUT, quit: true })
    expect(sim.title).toBe(true)
    step(sim, 1 / 30, { ...NO_INPUT, pickStage: 0 })
    expect(sim.title).toBe(false)
    expect(sim.time).toBeLessThan(0.1)
  })

  it('tapping the hero fires its big spin, which then needs HERO_SKILL_CD to come back', () => {
    const sim = createSim({ tutorial: false, seed: 6, free: true, hero: true, stage: 0 })
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    sim.nextCat = 1e9
    spawnCat(sim, 0, BREED_BULLDOG, { x: sim.hero.x + HERO_SKILL_R - 8, y: sim.hero.y })
    const dog = sim.cats.find((c) => c.alive)
    Object.assign(dog ?? {}, { hp: 9999, maxHp: 9999, dps: 0, speed: 0 })
    step(sim, 1 / 30, { ...NO_INPUT, heroSkill: true })
    const after = dog?.hp ?? 0
    expect(after).toBeLessThan(9999)
    expect(sim.heroSkillT).toBeGreaterThan(HERO_SKILL_CD - 1)
    step(sim, 1 / 30, { ...NO_INPUT, heroSkill: true })
    expect(sim.heroSkillAt).toBeLessThan(sim.time - 0.01)
  })

  it('a ポメラニアン mends hurt dogs near it and hangs back from shibas', () => {
    const sim = createSim({ tutorial: false, seed: 10, free: true, stage: 0 })
    for (const c of sim.cats) c.alive = false
    for (const u of sim.shibas) u.alive = false
    sim.aliveCats = 0
    sim.aliveShibas = 0
    sim.nextCat = 1e9
    spawnCat(sim, 0, BREED_POM, { x: 100, y: 200 })
    spawnCat(sim, 0, BREED_BULLDOG, { x: 120, y: 210 })
    const bull = sim.cats.find((c) => c.alive && c.kind === BREED_BULLDOG)
    Object.assign(bull ?? {}, { speed: 0, hp: 10 })
    for (let i = 0; i < 60; i++) step(sim, 1 / 30, NO_INPUT)
    expect((bull?.hp ?? 0) > 10).toBe(true)
    spawnShiba(sim, KIND_TAN, 0, 0)
    const shiba = sim.shibas.find((u) => u.alive)
    Object.assign(shiba ?? {}, { x: 100, y: 240, speed: 0, dps: 0 })
    const pom = sim.cats.find((c) => c.alive && c.kind === BREED_POM)
    Object.assign(shiba ?? {}, { x: pom?.x ?? 100, y: (pom?.y ?? 200) + 40 })
    const y0 = pom?.y ?? 0
    for (let i = 0; i < 60; i++) step(sim, 1 / 30, NO_INPUT)
    expect(pom?.y ?? 999).toBeLessThan(y0 - 20)
  })

  it('a win leaves a 宝箱: the first START opens it for ホネ, the next one starts', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true })
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    sim.toSend = 0
    sim.boss = true
    sim.bossIndex = -1
    for (let i = 0; i < 120 && sim.outcome === 'play'; i++) step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.chest).toBe(1)
    expect(sim.chestBones).toBeGreaterThan(0)
    sim.rewardT = 0
    const purse = sim.purse
    step(sim, 1 / 30, { ...NO_INPUT, openChest: true })
    expect(sim.chest).toBe(2)
    expect(sim.purse).toBe(purse + sim.chestBones)
    expect(sim.outcome).toBe('won')
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.outcome).toBe('play')
    expect(sim.chest).toBe(0)
  })

  it('buys ヒーロー柴 levels on the result screen, and a stronger hero comes out next match', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true, hero: true, purse: 9999 })
    expect(sim.hero.maxHp).toBe(HERO_HP)
    // Free placement feeds おやつ (XP), so a few feeds make a level.
    for (let i = 0; i < 4; i++) expect(buyLevel(sim, HERO_SLOT)).toBe(true)
    expect(sim.levels[HERO_SLOT]).toBe(2)
    sim.outcome = 'lost'
    sim.rewardT = 0
    step(sim, 1 / 30, { ...NO_INPUT, restart: true })
    expect(sim.hero.maxHp).toBeGreaterThan(HERO_HP)
    expect(buyLevel(createSim({ tutorial: false, purse: 9999 }), HERO_SLOT)).toBe(false)
  })

  it('エンドレス opens after the last stage, never sends a boss, ramps dogs up and keeps the best score', () => {
    const last = STAGES.length - 1
    const locked = createSim({ tutorial: false, free: true, title: true, best: STAGES.map((_, i) => (i < last ? 1 : 0)) })
    expect(stageOpen(locked, STAGES.length)).toBe(false)
    const sim = createSim({ tutorial: false, seed: 3, free: true, title: true, best: STAGES.map(() => 1), endlessBest: 5 })
    expect(stageOpen(sim, STAGES.length)).toBe(true)
    step(sim, 1 / 30, { ...NO_INPUT, pickStage: STAGES.length })
    expect(sim.title).toBe(false)
    expect(sim.toSend).toBeGreaterThan(10000)
    const early = sim.cats.find((c) => c.alive)?.maxHp ?? 0
    sim.time = 300
    spawnCat(sim, 0, BREED_CORGI, { x: 100, y: 40 })
    const late = sim.cats.filter((c) => c.alive && c.kind === BREED_CORGI).reduce((m, c) => Math.max(m, c.maxHp), 0)
    expect(late).toBeGreaterThan(early)
    sim.kills = 12
    sim.homeHp = 0
    step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.endlessBest).toBe(12)
    expect(sim.endlessRecord).toBe(true)
  })

  it('the first meeting with a breed flags it for a NEW! card, once', () => {
    const sim = createSim({ tutorial: false, free: true })
    spawnCat(sim, 0, BREED_CORGI, { x: 50, y: 40 })
    expect(sim.introBreed).toBe(-1)
    spawnCat(sim, 0, BREED_POODLE, { x: 80, y: 40 })
    expect(sim.introBreed).toBe(BREED_POODLE)
    const at = sim.introAt
    sim.time += 5
    spawnCat(sim, 0, BREED_POODLE, { x: 90, y: 40 })
    expect(sim.introAt).toBe(at)
    expect(createSim({ tutorial: false, free: true, seenBreeds: sim.seenBreeds }).seenBreeds & (1 << BREED_POODLE)).toBeGreaterThan(0)
  })

  it('the おやつ砲 charges over time, hits and shoves back the dogs near the house, then starts over', () => {
    const sim = createSim({ tutorial: false, seed: 11, free: true })
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    sim.nextCat = 1e9
    step(sim, 1 / 30, { ...NO_INPUT, cannon: true })
    expect(sim.cannonAt).toBe(-9)
    sim.cannonT = CANNON_CHARGE
    spawnCat(sim, 0, BREED_BULLDOG, { x: 100, y: FIELD_H - 60 })
    spawnCat(sim, 0, BREED_BULLDOG, { x: 100, y: FIELD_H - CANNON_REACH - 60 })
    const [near, far] = sim.cats.filter((c) => c.alive)
    Object.assign(near ?? {}, { hp: 999, maxHp: 999, speed: 0, dps: 0 })
    Object.assign(far ?? {}, { hp: 999, maxHp: 999, speed: 0, dps: 0 })
    const y0 = near?.y ?? 0
    step(sim, 1 / 30, { ...NO_INPUT, cannon: true })
    expect(near?.hp ?? 999).toBeLessThan(999)
    expect(near?.y ?? 0).toBeLessThan(y0 - 20)
    expect(far?.hp).toBe(999)
    expect(sim.cannonT).toBeLessThan(1)
  })

  it('levels coats by themselves: a match pays XP for what each did, levels get steeper, Lv5 opens a perk', () => {
    const sim = createSim({ tutorial: false, seed: 4, free: true })
    expect(xpNeed(2)).toBeGreaterThan(xpNeed(1))
    expect(xpNeed(1)).toBe(XP_NEED_BASE)
    sim.dealt[KIND_TAN] = 1000
    for (const c of sim.cats) c.alive = false
    sim.aliveCats = 0
    sim.toSend = 0
    sim.boss = true
    sim.bossIndex = -1
    for (let i = 0; i < 120 && sim.outcome === 'play'; i++) step(sim, 1 / 30, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.levels[KIND_TAN] ?? 1).toBeGreaterThan(1)
    expect(sim.gained[KIND_TAN] ?? 0).toBeGreaterThan(0)
    expect(perk(sim, KIND_TAN, PERK_A)).toBe(false)
    gainXp(sim, KIND_TAN, 1e9)
    expect(sim.levels[KIND_TAN]).toBe(10)
    expect(perk(sim, KIND_TAN, PERK_A)).toBe(true)
    const purse = sim.purse
    const xp0 = sim.xp[KIND_BLACK] ?? 0
    sim.purse = 1000
    expect(buyLevel(sim, KIND_BLACK)).toBe(true)
    expect((sim.xp[KIND_BLACK] ?? 0) > xp0 || (sim.levels[KIND_BLACK] ?? 1) > 1).toBe(true)
    expect(sim.purse).toBeLessThan(1000)
    void purse
  })
})
