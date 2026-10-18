import { describe, expect, it } from 'vitest'
import {
  BOSS_AT,
  CANNON_NEED,
  CASTLE_HP,
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
  cannonReady,
  createSim,
  fillMarch,
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
  else if (sim.bones >= sim.costTan) card = 0
  return { card, cannon: cannonReady(sim), restart: false }
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
  it('starts ten shibas marching and the pointed card adds five', () => {
    const sim = createSim({ tutorial: true, seed: 2 })
    expect(sim.aliveShibas).toBe(START_SHIBAS)
    expect(sim.tutorial).toBe(true)
    const y0 = sim.shibas[0]?.y ?? 0
    step(sim, 0.2, NO_INPUT)
    expect(sim.shibas[0]?.y ?? 0).toBeLessThan(y0)
    const before = sim.bones
    step(sim, 1 / 30, { card: 0, cannon: false, restart: false })
    expect(sim.tutorial).toBe(false)
    expect(sim.aliveShibas).toBe(START_SHIBAS + COUNT_TAN)
    expect(sim.bones).toBeCloseTo(before + (1 / 30) * (12 + (START_SHIBAS + COUNT_TAN) * 0.12) - COST_TAN)
    expect(sim.costTan).toBe(COST_TAN + STEP_TAN)
    expect(sim.sfxDeploy).toBe(1)
  })

  it('refuses a card the purse cannot afford', () => {
    const sim = createSim({ tutorial: false })
    sim.bones = 0
    step(sim, 1 / 30, { card: 0, cannon: false, restart: false })
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
  it('holds the cannon until fifty shibas, then blasts cats for a damage total', () => {
    const sim = createSim({ tutorial: false, seed: 4 })
    expect(cannonReady(sim)).toBe(false)
    play(sim, 61, () => NO_INPUT)
    expect(sim.aliveCats).toBeGreaterThan(0)
    expect(sim.boss).toBe(false)
    fillMarch(sim, CANNON_NEED)
    expect(cannonReady(sim)).toBe(true)
    const cats = sim.aliveCats
    step(sim, 1 / 30, { card: -1, cannon: true, restart: false })
    expect(sim.floatDmg).toBeGreaterThan(0)
    expect(sim.aliveCats).toBeLessThan(cats)
    expect(sim.beam).toBeGreaterThan(0)
    expect(sim.sfxCannon).toBe(1)
    expect(cannonReady(sim)).toBe(false)
  })

  it('brings the cat castle at 150s and lets a deploying player destroy it', () => {
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
    step(sim, 0.2, { card: -1, cannon: false, restart: true })
    expect(sim.outcome).toBe('won')
    expect(sim.rewardT).toBeGreaterThan(2)
    step(sim, BANNER_HOLD, NO_INPUT)
    expect(sim.outcome).toBe('won')
    expect(sim.rewardT).toBe(0)
    step(sim, 1 / 30, { card: -1, cannon: false, restart: true })
    expect(sim.outcome).toBe('play')
    expect(sim.time).toBe(0)
    expect(sim.aliveShibas).toBe(START_SHIBAS)
  })

  it('loses an idle match and retries without a confirm', () => {
    const sim = createSim({ tutorial: true, seed: 9 })
    play(sim, 180, () => NO_INPUT)
    expect(sim.outcome).toBe('lost')
    expect(sim.boss).toBe(true)
    expect(sim.castleHp).toBeGreaterThan(1000)
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
