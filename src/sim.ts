import {
  BONE_RATE,
  BOSS_AT,
  CLASH_AT,
  FIELD_H,
  FIELD_W,
  KIND_BLACK,
  KIND_TAN,
  LANE_COUNT,
  MARCH_COUNT,
  MATCH_SECONDS,
  MAX_SHIBAS,
  START_BONES,
} from './balance'

export { MATCH_SECONDS, BONE_RATE, START_BONES }

export type Phase = 'grow' | 'clash' | 'boss'

export interface Unit {
  alive: boolean
  x: number
  y: number
  speed: number
  kind: number
  lane: number
}

export interface Sim {
  time: number
  bones: number
  alive: number
  cursor: number
  shibas: Unit[]
}

export function phaseAt(time: number): Phase {
  if (time >= BOSS_AT) return 'boss'
  if (time >= CLASH_AT) return 'clash'
  return 'grow'
}

function makePool(max: number): Unit[] {
  const units: Unit[] = []
  for (let i = 0; i < max; i++) {
    units.push({ alive: false, x: 0, y: 0, speed: 0, kind: KIND_TAN, lane: 0 })
  }
  return units
}

export function createSim(): Sim {
  const sim: Sim = {
    time: 0,
    bones: START_BONES,
    alive: 0,
    cursor: 0,
    shibas: makePool(MAX_SHIBAS),
  }
  for (let i = 0; i < MARCH_COUNT; i++) {
    spawnShiba(sim, i, i % 9 === 0 ? KIND_BLACK : KIND_TAN)
  }
  return sim
}

export function spawnShiba(sim: Sim, seed: number, kind: number): boolean {
  const unit = acquire(sim)
  if (!unit) return false
  const lane = seed % LANE_COUNT
  const laneW = FIELD_W / LANE_COUNT
  const jitter = (seed % 5) - 2
  unit.alive = true
  unit.lane = lane
  unit.kind = kind
  unit.speed = 62 + (seed % 5) * 7
  unit.x = laneW * (lane + 0.5) + jitter * 4
  unit.y = 12 + ((seed * 97) % (FIELD_H - 24))
  sim.alive += 1
  return true
}

function acquire(sim: Sim): Unit | null {
  const units = sim.shibas
  const n = units.length
  for (let k = 0; k < n; k++) {
    const i = (sim.cursor + k) % n
    const unit = units[i]
    if (unit && !unit.alive) {
      sim.cursor = (i + 1) % n
      return unit
    }
  }
  return null
}

export function step(sim: Sim, dt: number): void {
  if (!(dt > 0)) return
  if (sim.time < MATCH_SECONDS) {
    const next = Math.min(MATCH_SECONDS, sim.time + dt)
    sim.bones += (next - sim.time) * BONE_RATE
    sim.time = next
  }
  const units = sim.shibas
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (!unit?.alive) continue
    unit.y -= unit.speed * dt
    if (unit.y < 0) {
      const wrapped = unit.y % FIELD_H
      unit.y = wrapped < 0 ? wrapped + FIELD_H : wrapped
    }
  }
}
