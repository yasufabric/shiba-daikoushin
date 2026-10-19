/**
 * The soundtrack: a small sequencer with Japanese-flavoured instruments, all synthesized.
 * 笛 (a breathy flute lead with vibrato), 三味線 (a bright plucked counter-line), 琴 (soft arpeggio plucks),
 * a warm pad, a plucked bass, and 太鼓 / clap / shaker drums. Everything runs through a generated reverb and
 * a compressor. Four tracks: title, battle, boss and result; a change waits for the next bar.
 */

export type Track = 'title' | 'battle' | 'boss' | 'result'

interface Song {
  bpm: number
  /** One chord per bar: note names (the first is the root for the bass). */
  chords: readonly (readonly string[])[]
  /** Lead line, one entry per eighth note ('' = rest, '-' = hold). Length = bars × 8. */
  lead: readonly string[]
  /** Counter line (三味線 plucks), per eighth, same length; '' = rest. */
  counter: readonly string[]
  /** Drum pattern per sixteenth over one bar: T 太鼓, t small 太鼓, C clap, S shaker, '.' rest. Letters stack. */
  drums: readonly string[]
  /** Lead voice. */
  voice: 'flute' | 'koto'
  /** Bass rhythm per eighth over one bar: R root, O octave, 5 fifth, '.' rest. */
  bass: string
  arp: boolean
}

const A = (s: string): string[] => s.split(' ').map((n) => (n === '.' ? '' : n))

const BATTLE: Song = {
  bpm: 132,
  chords: [
    ['D3', 'F#4', 'A4', 'D5'],
    ['B2', 'D4', 'F#4', 'B4'],
    ['G2', 'B3', 'D4', 'G4'],
    ['A2', 'C#4', 'E4', 'A4'],
    ['D3', 'F#4', 'A4', 'D5'],
    ['B2', 'D4', 'F#4', 'B4'],
    ['G2', 'B3', 'D4', 'G4'],
    ['A2', 'C#4', 'E4', 'A4'],
  ],
  lead: A(
    'A4 . D5 E5 F#5 - E5 D5 ' +
      'F#5 - E5 D5 B4 - A4 . ' +
      'B4 . D5 E5 D5 B4 A4 - ' +
      'A4 - . E5 - F#5 E5 . ' +
      'A4 . D5 E5 F#5 A5 F#5 E5 ' +
      'D5 - F#5 - B5 - A5 - ' +
      'G5 F#5 E5 D5 E5 - F#5 E5 ' +
      'D5 - - - A4 . D5 .',
  ),
  counter: A(
    '. D4 . A4 . D4 . A4 ' +
      '. B3 . F#4 . B3 . F#4 ' +
      '. G3 . D4 . G3 . D4 ' +
      '. A3 . E4 . A3 . C#4 ' +
      '. D4 . A4 . D4 . A4 ' +
      '. B3 . F#4 . B3 . F#4 ' +
      '. G3 . D4 . A3 . E4 ' +
      '. D4 . A4 D5 . . .',
  ),
  drums: ['T', '.', 'S', '.', 'CS', '.', 'tS', '.', 'T', '.', 'TS', '.', 'CS', '.', 'S', 't'],
  voice: 'flute',
  bass: 'R.ROR.5.',
  arp: false,
}

const BOSS: Song = {
  bpm: 146,
  chords: [
    ['D3', 'F4', 'A4', 'D5'],
    ['D3', 'F4', 'A4', 'D5'],
    ['A#2', 'D4', 'F4', 'A#4'],
    ['C3', 'E4', 'G4', 'C5'],
    ['D3', 'F4', 'A4', 'D5'],
    ['D3', 'F4', 'A4', 'D5'],
    ['A#2', 'D4', 'F4', 'A#4'],
    ['A2', 'C#4', 'E4', 'A4'],
  ],
  lead: A(
    'D5 - D5 F5 - G5 A5 - ' +
      'C6 - A5 G5 F5 - D5 - ' +
      'F5 - F5 G5 - A5 A#5 - ' +
      'C6 - A#5 A5 G5 - E5 - ' +
      'D5 - D5 F5 - G5 A5 - ' +
      'D6 - C6 A5 G5 - A5 - ' +
      'A#5 - A5 G5 F5 - G5 F5 ' +
      'E5 - - - C#5 - E5 -',
  ),
  counter: A(
    'D4 D4 . D4 A3 . D4 . ' +
      'D4 D4 . D4 A3 . D4 . ' +
      'A#3 A#3 . A#3 F3 . A#3 . ' +
      'C4 C4 . C4 G3 . C4 . ' +
      'D4 D4 . D4 A3 . D4 . ' +
      'D4 D4 . D4 A3 . D4 . ' +
      'A#3 A#3 . A#3 F3 . A#3 . ' +
      'A3 A3 . A3 E3 . C#4 .',
  ),
  drums: ['T', '.', 'T', 'S', 'C', 'S', 'T', '.', 'T', 'S', 'T', 'S', 'C', 'S', 'tC', 't'],
  voice: 'flute',
  bass: 'RRORRORO',
  arp: false,
}

const TITLE: Song = {
  bpm: 96,
  chords: [
    ['D3', 'F#4', 'A4', 'D5'],
    ['G2', 'B3', 'D4', 'G4'],
    ['B2', 'D4', 'F#4', 'B4'],
    ['A2', 'C#4', 'E4', 'A4'],
  ],
  lead: A(
    'F#5 - - E5 D5 - E5 - ' +
      'D5 - B4 - A4 - - - ' +
      'B4 - D5 - F#5 - E5 D5 ' +
      'E5 - - - - - . .',
  ),
  counter: A('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'),
  drums: ['t', '.', '.', '.', 'S', '.', '.', '.', 't', '.', 't', '.', 'S', '.', '.', '.'],
  voice: 'koto',
  bass: 'R...5...',
  arp: true,
}

const RESULT: Song = {
  bpm: 108,
  chords: [
    ['D3', 'F#4', 'A4', 'D5'],
    ['G2', 'B3', 'D4', 'G4'],
    ['A2', 'C#4', 'E4', 'A4'],
    ['D3', 'F#4', 'A4', 'D5'],
  ],
  lead: A('A5 - F#5 - E5 - D5 - ' + 'B4 - D5 - E5 - - - ' + 'C#5 - E5 - A5 - G5 F#5 ' + 'D5 - - - - - . .'),
  counter: A('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'),
  drums: ['t', '.', 'S', '.', 'S', '.', 'S', '.', 't', '.', 'S', '.', 'S', '.', 'S', '.'],
  voice: 'koto',
  bass: 'R.5.O.5.',
  arp: true,
}

const SONGS: Record<Track, Song> = { title: TITLE, battle: BATTLE, boss: BOSS, result: RESULT }

const SEMI: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }

/** "F#4" → Hz. */
export function freqOf(name: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(name)
  if (!m) return 440
  const semis = (SEMI[m[1] ?? 'A'] ?? 9) + (Number(m[2]) + 1) * 12
  return 440 * Math.pow(2, (semis - 69) / 12)
}

export interface Music {
  start(): void
  stop(): void
  setTrack(track: Track): void
  /** Schedule everything up to `until` seconds of context time now (for offline rendering). */
  prime(until: number): void
}

/** A sequencer bound to an audio context; `out` is where the music bus goes (before the master gain). */
export function createMusic(ctx: AudioContext, out: AudioNode): Music {
  const bus = ctx.createGain()
  bus.gain.value = 0.55
  // Reverb: generated impulse, about 1.8 s of decaying stereo noise.
  const verb = ctx.createConvolver()
  const len = Math.floor(ctx.sampleRate * 1.8)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  verb.buffer = ir
  const wet = ctx.createGain()
  wet.gain.value = 0.28
  bus.connect(out)
  bus.connect(verb)
  verb.connect(wet)
  wet.connect(out)
  // Shared noise for drums.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const nd = noise.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1

  let track: Track = 'title'
  let pending: Track | null = null
  let timer: number | undefined
  let next = 0
  let step = 0

  function env(node: AudioParam, t: number, peak: number, attack: number, decay: number): void {
    node.setValueAtTime(0.0001, t)
    node.exponentialRampToValueAtTime(peak, t + attack)
    node.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  }

  function flute(f: number, t: number, dur: number): void {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(f, t)
    const vib = ctx.createOscillator()
    vib.frequency.value = 5.5
    const vibAmt = ctx.createGain()
    vibAmt.gain.setValueAtTime(0, t)
    vibAmt.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.25, dur))
    vib.connect(vibAmt)
    vibAmt.connect(o.frequency)
    // Breath: a little filtered noise at the start.
    const br = ctx.createBufferSource()
    br.buffer = noise
    const bf = ctx.createBiquadFilter()
    bf.type = 'bandpass'
    bf.frequency.value = f * 2
    const bg = ctx.createGain()
    env(bg.gain, t, 0.03, 0.01, 0.12)
    br.connect(bf)
    bf.connect(bg)
    bg.connect(bus)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.04)
    g.gain.setValueAtTime(0.16, t + Math.max(0.05, dur - 0.08))
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05)
    o.connect(g)
    g.connect(bus)
    o.start(t)
    vib.start(t)
    br.start(t, Math.random() * 0.5, 0.2)
    o.stop(t + dur + 0.1)
    vib.stop(t + dur + 0.1)
  }

  function pluck(f: number, t: number, bright: number, gain: number, decay: number): void {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f, t)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(bright, t)
    lp.frequency.exponentialRampToValueAtTime(Math.max(200, f * 1.5), t + decay * 0.6)
    lp.Q.value = 4
    const g = ctx.createGain()
    env(g.gain, t, gain, 0.004, decay)
    o.connect(lp)
    lp.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + decay + 0.05)
  }

  function pad(notes: readonly string[], t: number, dur: number): void {
    for (const n of notes.slice(1)) {
      for (const det of [-6, 6]) {
        const o = ctx.createOscillator()
        o.type = 'triangle'
        o.frequency.value = freqOf(n)
        o.detune.value = det
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 1400
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(0.022, t + 0.3)
        g.gain.setValueAtTime(0.022, t + dur - 0.2)
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3)
        o.connect(lp)
        lp.connect(g)
        g.connect(bus)
        o.start(t)
        o.stop(t + dur + 0.4)
      }
    }
  }

  function bass(f: number, t: number, dur: number): void {
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = f
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(900, t)
    lp.frequency.exponentialRampToValueAtTime(220, t + dur)
    const g = ctx.createGain()
    env(g.gain, t, 0.14, 0.005, dur)
    o.connect(lp)
    lp.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  function taiko(t: number, big: boolean): void {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(big ? 130 : 190, t)
    o.frequency.exponentialRampToValueAtTime(big ? 48 : 90, t + 0.22)
    const g = ctx.createGain()
    env(g.gain, t, big ? 0.55 : 0.28, 0.003, big ? 0.35 : 0.18)
    o.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + 0.45)
    const n = ctx.createBufferSource()
    n.buffer = noise
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const ng = ctx.createGain()
    env(ng.gain, t, big ? 0.18 : 0.08, 0.002, 0.06)
    n.connect(lp)
    lp.connect(ng)
    ng.connect(bus)
    n.start(t, Math.random() * 0.5, 0.1)
  }

  function hitNoise(t: number, type: BiquadFilterType, freq: number, gain: number, decay: number): void {
    const n = ctx.createBufferSource()
    n.buffer = noise
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    const g = ctx.createGain()
    env(g.gain, t, gain, 0.002, decay)
    n.connect(f)
    f.connect(g)
    g.connect(bus)
    n.start(t, Math.random() * 0.5, decay + 0.05)
  }

  function playStep(t: number, s: number): void {
    const song = SONGS[track]
    const sixteenth = 60 / song.bpm / 4
    const bars = song.chords.length
    const barStep = s % 16
    const bar = Math.floor(s / 16) % bars
    const chord = song.chords[bar] ?? []
    // Drums every sixteenth.
    const hit = song.drums[barStep] ?? '.'
    if (hit.includes('T')) taiko(t, true)
    if (hit.includes('t')) taiko(t, false)
    if (hit.includes('C')) hitNoise(t, 'bandpass', 1600, 0.22, 0.09)
    if (hit.includes('S')) hitNoise(t, 'highpass', 7000, 0.05, 0.035)
    if (barStep === 0) pad(chord, t, sixteenth * 16)
    if (song.arp && barStep % 2 === 0) {
      // 琴: up and down the chord in eighths.
      const order = [1, 2, 3, 2, 1, 2, 3, 2]
      const n = chord[order[(barStep >> 1) % 8] ?? 1]
      if (n) pluck(freqOf(n) * 2, t, 3500, 0.07, 0.6)
    }
    if (barStep % 2 !== 0) return
    const eighth = Math.floor(s / 2) % (bars * 8)
    const e8 = barStep >> 1
    // Bass.
    const b = song.bass[e8] ?? '.'
    const root = freqOf(chord[0] ?? 'D3')
    if (b === 'R') bass(root, t, sixteenth * 1.8)
    if (b === 'O') bass(root * 2, t, sixteenth * 1.8)
    if (b === '5') bass(root * 1.5, t, sixteenth * 1.8)
    // Lead: length = this note plus any '-' holds after it.
    const lead = song.lead[eighth] ?? ''
    if (lead && lead !== '-') {
      let held = 1
      while (song.lead[(eighth + held) % song.lead.length] === '-') held += 1
      const dur = held * sixteenth * 2 * 0.95
      if (song.voice === 'flute') flute(freqOf(lead), t, dur)
      else pluck(freqOf(lead), t, 2600, 0.13, Math.max(0.5, dur))
    }
    const counter = song.counter[eighth] ?? ''
    if (counter) pluck(freqOf(counter), t, 5000, 0.07, 0.28)
  }

  function schedule(until = ctx.currentTime + 0.25): void {
    if (next < ctx.currentTime) next = ctx.currentTime + 0.05
    while (next < until) {
      if (pending && step % 16 === 0) {
        track = pending
        pending = null
        step = 0
      }
      playStep(next, step)
      next += 60 / SONGS[track].bpm / 4
      step += 1
    }
  }

  return {
    start() {
      if (timer !== undefined) return
      next = ctx.currentTime + 0.08
      timer = window.setInterval(() => schedule(), 50)
    },
    stop() {
      if (timer !== undefined) window.clearInterval(timer)
      timer = undefined
    },
    prime(until: number) {
      schedule(until)
    },
    setTrack(t: Track) {
      if (t === track && pending === null) return
      if (t === pending) return
      if (timer === undefined) {
        track = t
        step = 0
        return
      }
      pending = t
    },
  }
}
