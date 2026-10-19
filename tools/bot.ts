/**
 * Balance bot: plays free-placement stages headlessly with a simple scripted player and prints
 * win rate and final 柴の家 HP per stage and level. It is a weak player on purpose, so a person
 * should do a little better than its numbers.
 *
 *   node --import $(npm root -g)/tsx/dist/esm/index.mjs tools/bot.ts [options]
 *
 * Options:
 *   --stages 1-8      stages to play (1-based; a range or a comma list; 9 is エンドレス, scored by dogs beaten in MAX_TIME)
 *   --levels 1,5,10   coat level for every coat in the deck
 *   --deck 0,1,2,3    coats in the deck (0 赤, 1 黒, 2 胡麻, 3 白, 4 ぶち, 5 どっしり, 6 応援)
 *   --seeds 3         seeds per cell
 *   --aim threat      where shibas go: threat (at the dog nearest the house) or random (anywhere in the deploy zone, like a new player)
 *   --tap 0.4         seconds between taps
 *   --nospecial       keep every skill gauge empty (skills never fire)
 *   --verbose         one line per match
 *
 * tsconfig only includes src/, so this file is not part of the build or the typecheck.
 */
import { createSim, step, reset, NO_INPUT, skillReady, casterOf, isOut, type Input, type Sim } from '../src/sim'
import { FIELD_W, KINDS, HOME_HP, STAGES, KIND_SESAME, KIND_WHITE, KIND_CHEER } from '../src/balance'

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback
}
function list(text: string): number[] {
  return text.split(',').flatMap((part) => {
    const [a, b] = part.split('-').map(Number)
    if (b === undefined) return [a as number]
    return Array.from({ length: b - (a as number) + 1 }, (_, i) => (a as number) + i)
  })
}

const stages = list(arg('stages', `1-${STAGES.length}`))
const levels = list(arg('levels', '1'))
const deck = list(arg('deck', '0,1,2,3'))
const seeds = Number(arg('seeds', '3'))
const tap = Number(arg('tap', '0.4'))
const aim = arg('aim', 'threat') === 'random' ? 'random' : 'threat'
const noSpecial = process.argv.includes('--nospecial')
const verbose = process.argv.includes('--verbose')

const DT = 1 / 30
const MAX_TIME = 900

export interface Result {
  won: boolean
  home: number
  kills: number
  time: number
  specials: number[]
}

/** One match: stage is 0-based. Every earlier stage counts as cleared, so its coats are open. */
export interface Player {
  /** Tap full skill gauges (false keeps every gauge empty). */
  specials?: boolean
  /** Seconds between taps. */
  tap?: number
  /** threat: drop at the dog nearest the house; random: anywhere in the deploy zone. */
  aim?: 'threat' | 'random'
  /** Per-coat levels, overriding `level` where given. */
  levels?: readonly number[]
}

export function play(stage: number, level: number, coats: readonly number[], seed: number, player: Player = {}): Result {
  const specials = player.specials !== false
  const tapEvery = player.tap ?? 0.4
  const sim: Sim = createSim({
    free: true,
    tutorial: false,
    seed,
    stage,
    best: STAGES.map((_, i) => (i < stage ? 3 : 0)),
    levels: Array.from({ length: KINDS + 1 }, (_, k) => player.levels?.[k] ?? level),
    deck: coats,
  })
  // A fixed deck for the run, whatever the unlocks say.
  sim.deck = [...coats]
  if (stage >= STAGES.length) {
    // エンドレス: createSim clamps the stage, so step onto it by hand.
    sim.stage = STAGES.length
    reset(sim)
  }
  const fired = new Array(KINDS).fill(0)
  let think = 0
  let rr = seed * 7919 + stage * 31 + 1
  while (sim.outcome === 'play' && sim.time < MAX_TIME) {
    let input: Input = NO_INPUT
    if (!specials) for (let k = 0; k < KINDS; k++) sim.charge[k] = 0
    think -= DT
    if (think <= 0) {
      think = tapEvery
      // Aim at the dog nearest the house.
      let tx = FIELD_W / 2
      let ty = -1
      for (const c of sim.cats) if (c?.alive && c.fly !== 1 && c.hp > 0 && c.y > ty) {
        ty = c.y
        tx = c.x
      }
      // 1種1匹: send whichever deck coat is not out and has waited out its respawn, in deck order.
      for (const k of sim.deck) {
        if (isOut(sim, k) || (sim.recharge[k] ?? 0) > 0) continue
        rr = (Math.imul(rr, 1103515245) + 12345) >>> 0
        const jitter = ((rr >>> 8) % 60) - 30
        const back = k === KIND_SESAME || k === KIND_WHITE || k === KIND_CHEER
        const x = player.aim === 'random' ? 14 + ((rr >>> 10) % (FIELD_W - 28)) : tx + jitter
        input = { ...NO_INPUT, card: k, at: { x: Math.max(14, Math.min(FIELD_W - 14, x)), y: back ? 560 : 470 } }
        break
      }
    }
    // Skills: tap a full card once its caster has a dog within reach.
    if (specials && sim.spGapT <= 0) {
      for (const k of sim.deck) {
        if (!skillReady(sim, k)) continue
        const c = casterOf(sim, k)
        if (!c || !sim.cats.some((d) => d?.alive && d.fly !== 1 && d.hp > 0 && Math.hypot(d.x - c.x, d.y - c.y) < 120)) continue
        input = { ...input, pick: k }
        break
      }
    }
    const castBefore = sim.castId
    step(sim, DT, input)
    if (sim.castId > castBefore) fired[sim.casts[sim.casts.length - 1]?.kind ?? 0] += 1
  }
  return { won: sim.outcome === 'won', home: Math.max(0, sim.homeHp) / HOME_HP, kills: sim.kills, time: sim.time, specials: fired }
}

const pct = (v: number): string => `${Math.round(v * 100)}`
const isMain = process.argv[1]?.endsWith('bot.ts')
if (isMain) {
  console.log(`deck ${deck.join(',')}  seeds ${seeds}  aim ${aim}  tap ${tap}s${noSpecial ? '  no specials' : ''}  cell: wins/runs avg-house% [house% per run]`)
  console.log(['stage', ...levels.map((l) => `Lv${l}`)].map((s) => s.padEnd(30)).join(''))
  for (const st of stages) {
    const cells: string[] = []
    for (const lv of levels) {
      const runs: Result[] = []
      for (let s = 1; s <= seeds; s++) {
        const r = play(st - 1, lv, deck, s * 101, { specials: !noSpecial, tap, aim })
        runs.push(r)
        if (verbose) console.log(`  st${st} Lv${lv} seed${s} ${r.won ? 'won ' : 'lost'} t=${r.time.toFixed(0)}s house=${pct(r.home)}% specials=${r.specials.join(',')}`)
      }
      const wins = runs.filter((r) => r.won).length
      const avg = runs.reduce((n, r) => n + r.home, 0) / runs.length
      if (st > STAGES.length) cells.push(`∞ kills ${Math.round(runs.reduce((n, r) => n + r.kills, 0) / runs.length)} [${runs.map((r) => `${r.kills}@${r.time.toFixed(0)}s`).join(',')}]`)
      else cells.push(`${wins}/${runs.length} ${pct(avg)}% [${runs.map((r) => pct(r.home)).join(',')}]`)
    }
    console.log([`${st}`, ...cells].map((s) => s.padEnd(30)).join(''))
  }
}
