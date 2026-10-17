export const MATCH_SECONDS = 180
export const CLASH_AT = 60
export const BOSS_AT = 150
export const BONE_RATE = 10
export const START_BONES = 40

export type Phase = 'grow' | 'clash' | 'boss'

export interface Sim {
  time: number
  bones: number
}

export function phaseAt(time: number): Phase {
  if (time >= BOSS_AT) return 'boss'
  if (time >= CLASH_AT) return 'clash'
  return 'grow'
}

export function createSim(): Sim {
  return { time: 0, bones: START_BONES }
}

export function step(sim: Sim, dt: number): void {
  if (!(dt > 0) || sim.time >= MATCH_SECONDS) return
  const next = Math.min(MATCH_SECONDS, sim.time + dt)
  const elapsed = next - sim.time
  sim.time = next
  sim.bones += elapsed * BONE_RATE
}
