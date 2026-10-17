import { describe, expect, it } from 'vitest'
import {
  BONE_RATE,
  BOSS_AT,
  CLASH_AT,
  MATCH_SECONDS,
  START_BONES,
  createSim,
  phaseAt,
  step,
} from './sim'

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
