import { describe, expect, it } from 'vitest'
import {
  BONE_RATE,
  BOSS_AT,
  CLASH_AT,
  FIELD_H,
  MARCH_COUNT,
  MATCH_SECONDS,
  MAX_SHIBAS,
  START_BONES,
} from './balance'
import { createSim, phaseAt, spawnShiba, step } from './sim'

describe('match clock', () => {
  it('starts in the grow phase with a deployable purse', () => {
    const sim = createSim()
    expect(sim.time).toBe(0)
    expect(sim.bones).toBe(START_BONES)
    expect(phaseAt(0)).toBe('grow')
  })

  it('changes phase at the clash and boss marks', () => {
    expect(phaseAt(CLASH_AT - 0.01)).toBe('grow')
    expect(phaseAt(CLASH_AT)).toBe('clash')
    expect(phaseAt(BOSS_AT - 0.01)).toBe('clash')
    expect(phaseAt(BOSS_AT)).toBe('boss')
    expect(phaseAt(MATCH_SECONDS)).toBe('boss')
  })

  it('accumulates bones from elapsed time and stops at three minutes', () => {
    const sim = createSim()
    step(sim, 2.5)
    expect(sim.time).toBe(2.5)
    expect(sim.bones).toBeCloseTo(START_BONES + 2.5 * BONE_RATE)

    step(sim, -1)
    expect(sim.time).toBe(2.5)

    step(sim, MATCH_SECONDS)
    expect(sim.time).toBe(MATCH_SECONDS)
    expect(sim.bones).toBeCloseTo(START_BONES + MATCH_SECONDS * BONE_RATE)

    const frozen = sim.bones
    step(sim, 10)
    expect(sim.time).toBe(MATCH_SECONDS)
    expect(sim.bones).toBe(frozen)
  })
})

describe('march', () => {
  it('fills the field with a few hundred shibas', () => {
    const sim = createSim()
    expect(sim.alive).toBe(MARCH_COUNT)
    expect(MARCH_COUNT).toBeGreaterThanOrEqual(200)
    let seen = 0
    for (let i = 0; i < sim.shibas.length; i++) {
      if (sim.shibas[i]?.alive) seen++
    }
    expect(seen).toBe(MARCH_COUNT)
  })

  it('marches every living shiba upward and keeps them on the field', () => {
    const sim = createSim()
    for (let i = 0; i < sim.shibas.length; i++) {
      const unit = sim.shibas[i]
      if (unit?.alive) unit.y = 300
    }
    step(sim, 0.1)
    let sum = 0
    let n = 0
    for (let i = 0; i < sim.shibas.length; i++) {
      const unit = sim.shibas[i]
      if (!unit?.alive) continue
      expect(unit.y).toBeGreaterThanOrEqual(0)
      expect(unit.y).toBeLessThan(FIELD_H)
      sum += unit.y
      n++
    }
    expect(n).toBe(MARCH_COUNT)
    expect(sum / n).toBeLessThan(300)
  })

  it('wraps a shiba that walks off the top back to the bottom', () => {
    const sim = createSim()
    const unit = sim.shibas[0]
    if (!unit) throw new Error('missing shiba')
    unit.y = 2
    unit.speed = 100
    step(sim, 0.05)
    expect(unit.y).toBeGreaterThan(FIELD_H - 10)
  })

  it('refuses to spawn past the pool', () => {
    const sim = createSim()
    let added = 0
    for (let i = 0; i < MAX_SHIBAS; i++) {
      if (spawnShiba(sim, 1000 + i, 0)) added++
    }
    expect(sim.alive).toBe(MAX_SHIBAS)
    expect(added).toBe(MAX_SHIBAS - MARCH_COUNT)
    expect(spawnShiba(sim, 7, 0)).toBe(false)
  })
})
