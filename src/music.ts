/**
 * The soundtrack, chiptune style (play-test: the "Japanese ensemble" synth sounded naff; pixel art wants 8-bit).
 * Four voices like the old consoles: two pulse channels (lead with vibrato and a short echo, and a fast chord
 * arpeggio), a triangle bass, and a noise channel for drums (kick is a triangle drop). Songs are data; a change
 * waits for the next bar.
 */

export type Track = 'title' | 'battle' | 'boss' | 'result'

interface Song {
  bpm: number
  /** One chord per bar; the first note is the root (bass), the rest feed the arpeggio. */
  chords: readonly (readonly string[])[]
  /** Lead per eighth note: a note, '' rest, '-' hold. Length = bars × 8. */
  lead: readonly string[]
  /** Lead duty: 0.125, 0.25 or 0.5. */
  duty: number
  /** Drums per sixteenth over one bar: K kick, S snare, h hat, o open hat, '.' rest. */
  drums: string
  /** Bass per eighth over one bar: R root, O octave up, 5 fifth, '.' rest. */
  bass: string
  /** Arpeggio speed in steps per sixteenth (1 or 2), 0 for none. */
  arp: number
}

const A = (s: string): string[] =>
  s
    .trim()
    .split(/\s+/)
    .map((n) => (n === '.' ? '' : n))

const BATTLE: Song = {
  bpm: 150,
  chords: [
    ['G2', 'G4', 'B4', 'D5'],
    ['E2', 'E4', 'G4', 'B4'],
    ['C3', 'C5', 'E5', 'G5'],
    ['D3', 'D5', 'F#5', 'A5'],
    ['G2', 'G4', 'B4', 'D5'],
    ['E2', 'E4', 'G4', 'B4'],
    ['C3', 'C5', 'E5', 'A5'],
    ['D3', 'D5', 'F#5', 'A5'],
    ['G2', 'G4', 'B4', 'D5'],
    ['B2', 'B4', 'D5', 'F#5'],
    ['C3', 'C5', 'E5', 'G5'],
    ['A2', 'A4', 'C5', 'E5'],
    ['G2', 'G4', 'B4', 'D5'],
    ['E2', 'E4', 'G4', 'B4'],
    ['C3', 'C5', 'E5', 'G5'],
    ['D3', 'D5', 'F#5', 'A5'],
  ],
  lead: A(`
    D5 . G5 . B5 A5 G5 .
    E5 - G5 - B5 - A5 G5
    E5 . G5 . C6 B5 A5 G5
    F#5 - A5 - D6 - - -
    D5 . G5 . B5 A5 G5 B5
    D6 - B5 - G5 - E5 G5
    A5 - G5 F#5 E5 - F#5 A5
    G5 - - - - - D5 .
    B5 - - A5 G5 - D5 -
    F#5 - - E5 D5 - B4 -
    C5 - E5 - G5 - C6 -
    B5 - A5 - G5 - E5 -
    D5 - G5 - B5 - D6 -
    E6 - D6 - B5 - G5 -
    A5 - B5 - C6 - E6 -
    D6 - - - F#5 - A5 -
  `),
  duty: 0.25,
  drums: 'K.h.S.h.K.KhS.ho',
  bass: 'ROROROR5',
  arp: 1,
}

const BOSS: Song = {
  bpm: 162,
  chords: [
    ['D3', 'D5', 'F5', 'A5'],
    ['D3', 'D5', 'F5', 'A5'],
    ['A#2', 'A#4', 'D5', 'F5'],
    ['C3', 'C5', 'E5', 'G5'],
    ['D3', 'D5', 'F5', 'A5'],
    ['D3', 'D5', 'F5', 'A5'],
    ['A#2', 'A#4', 'D5', 'F5'],
    ['A2', 'A4', 'C#5', 'E5'],
  ],
  lead: A(`
    D5 D5 . D5 F5 . G5 .
    A5 - - G5 F5 - E5 -
    F5 F5 . F5 G5 . A5 .
    A#5 - A5 - G5 - E5 -
    D6 - C6 - A5 - F5 -
    G5 - A5 - D6 - - -
    D6 - C6 - A#5 - A5 -
    C#6 - - - E6 - - -
  `),
  duty: 0.5,
  drums: 'K.hhS.hhK.KhS.SS',
  bass: 'RRORRORO',
  arp: 2,
}

const TITLE: Song = {
  bpm: 118,
  chords: [
    ['C3', 'C5', 'E5', 'G5'],
    ['A2', 'A4', 'C5', 'E5'],
    ['F2', 'F4', 'A4', 'C5'],
    ['G2', 'G4', 'B4', 'D5'],
    ['C3', 'C5', 'E5', 'G5'],
    ['A2', 'A4', 'C5', 'E5'],
    ['F2', 'F4', 'A4', 'C5'],
    ['G2', 'G4', 'B4', 'D5'],
  ],
  lead: A(`
    E5 - G5 - C6 - - B5
    A5 - - - E5 - - -
    F5 - A5 - C6 - B5 A5
    G5 - - - - - . .
    E5 - G5 - C6 - D6 -
    E6 - - D6 C6 - A5 -
    F5 - G5 - A5 - B5 -
    C6 - - - - - . .
  `),
  duty: 0.125,
  drums: 'K...h...S...h...',
  bass: 'R.5.O.5.',
  arp: 1,
}

const RESULT: Song = {
  bpm: 132,
  chords: [
    ['F2', 'F4', 'A4', 'C5'],
    ['G2', 'G4', 'B4', 'D5'],
    ['E2', 'E4', 'G4', 'B4'],
    ['A2', 'A4', 'C5', 'E5'],
    ['F2', 'F4', 'A4', 'C5'],
    ['G2', 'G4', 'B4', 'D5'],
    ['C3', 'C5', 'E5', 'G5'],
    ['C3', 'C5', 'E5', 'G5'],
  ],
  lead: A(`
    A5 - C6 - F6 - E6 -
    D6 - B5 - G5 - - -
    G5 - B5 - E6 - D6 -
    C6 - A5 - E5 - - -
    F5 - A5 - C6 - A5 -
    B5 - D6 - G6 - F6 -
    E6 - - - G5 - C6 -
    E6 - - - - - . .
  `),
  duty: 0.25,
  drums: 'K.h.S.h.K.h.S.h.',
  bass: 'R.O.R.O.',
  arp: 1,
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

/** A pulse wave with the given duty, as a PeriodicWave (Fourier series of a rectangle). */
function pulseWave(ctx: BaseAudioContext, duty: number): PeriodicWave {
  const n = 48
  const real = new Float32Array(n)
  const imag = new Float32Array(n)
  for (let k = 1; k < n; k++) {
    real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty) * Math.cos(k * Math.PI * duty)
    imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty) * Math.sin(k * Math.PI * duty)
  }
  return ctx.createPeriodicWave(real, imag)
}

/** A sequencer bound to an audio context; `out` is where the music bus goes (before the master gain). */
export function createMusic(ctx: BaseAudioContext, out: AudioNode): Music {
  const bus = ctx.createGain()
  bus.gain.value = 0.38
  // A gentle low-pass takes the harsh edge off the pulses, like a TV speaker.
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 7000
  bus.connect(tone)
  tone.connect(out)
  // Lead echo: a 3/16 delay, fed back a little.
  const echo = ctx.createDelay(1)
  const echoFb = ctx.createGain()
  const echoOut = ctx.createGain()
  echoFb.gain.value = 0.3
  echoOut.gain.value = 0.25
  echo.connect(echoFb)
  echoFb.connect(echo)
  echo.connect(echoOut)
  echoOut.connect(bus)
  const waves = {
    0.125: pulseWave(ctx, 0.125),
    0.25: pulseWave(ctx, 0.25),
    0.5: pulseWave(ctx, 0.5),
  } as Record<number, PeriodicWave>
  // 1 s of white noise and a short "metallic" loop for hats.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const nd = noise.getChannelData(0)
  let lfsr = 1
  for (let i = 0; i < nd.length; i++) {
    // NES-style LFSR noise: grittier than Math.random.
    const bit = (lfsr ^ (lfsr >> 1)) & 1
    lfsr = (lfsr >> 1) | (bit << 14)
    nd[i] = (lfsr & 1) * 2 - 1
  }

  let track: Track = 'title'
  let pending: Track | null = null
  let timer: number | undefined
  let next = 0
  let step = 0

  function gate(param: AudioParam, t: number, peak: number, dur: number, release = 0.02): void {
    param.setValueAtTime(0, t)
    param.linearRampToValueAtTime(peak, t + 0.004)
    param.setValueAtTime(peak, t + Math.max(0.005, dur - release))
    param.linearRampToValueAtTime(0, t + dur)
  }

  function pulse(f: number, t: number, dur: number, duty: number, gain: number, vibrato: boolean, toEcho: boolean): void {
    const o = ctx.createOscillator()
    o.setPeriodicWave(waves[duty] ?? waves[0.5] as PeriodicWave)
    o.frequency.setValueAtTime(f, t)
    if (vibrato && dur > 0.2) {
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 6
      const depth = ctx.createGain()
      depth.gain.setValueAtTime(0, t)
      depth.gain.linearRampToValueAtTime(f * 0.015, t + dur * 0.6)
      lfo.connect(depth)
      depth.connect(o.frequency)
      lfo.start(t)
      lfo.stop(t + dur + 0.02)
    }
    const g = ctx.createGain()
    // A little decay on the sustain like the old volume envelopes.
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + 0.004)
    g.gain.linearRampToValueAtTime(gain * 0.7, t + Math.min(dur, 0.25))
    g.gain.setValueAtTime(gain * 0.7, t + Math.max(0.01, dur - 0.02))
    g.gain.linearRampToValueAtTime(0, t + dur)
    o.connect(g)
    g.connect(bus)
    if (toEcho) g.connect(echo)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  function triangle(f: number, t: number, dur: number): void {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(f, t)
    const g = ctx.createGain()
    gate(g.gain, t, 0.32, dur)
    o.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  function kick(t: number): void {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(180, t)
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12)
    const g = ctx.createGain()
    gate(g.gain, t, 0.55, 0.14, 0.06)
    o.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + 0.16)
  }

  function noiseHit(t: number, dur: number, gain: number, hp: number, rate: number): void {
    const n = ctx.createBufferSource()
    n.buffer = noise
    n.playbackRate.value = rate
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = hp
    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    n.connect(f)
    f.connect(g)
    g.connect(bus)
    n.start(t, (step * 0.137) % 0.8, dur + 0.02)
  }

  function playStep(t: number, s: number): void {
    const song = SONGS[track]
    const sixteenth = 60 / song.bpm / 4
    const bars = song.chords.length
    const barStep = s % 16
    const bar = Math.floor(s / 16) % bars
    const chord = song.chords[bar] ?? []
    // Drums.
    const d = song.drums[barStep] ?? '.'
    if (d === 'K') kick(t)
    if (d === 'S') {
      noiseHit(t, 0.12, 0.32, 1200, 1)
      kick(t)
    }
    if (d === 'h') noiseHit(t, 0.03, 0.12, 7000, 2)
    if (d === 'o') noiseHit(t, 0.12, 0.1, 6000, 2)
    // Arpeggio on pulse 2: rolls through the chord tones each sixteenth (or twice).
    if (song.arp > 0) {
      const tones = chord.slice(1)
      for (let k = 0; k < song.arp; k++) {
        const note = tones[(s * song.arp + k) % tones.length]
        if (note) pulse(freqOf(note), t + (k * sixteenth) / song.arp, sixteenth / song.arp, 0.125, 0.05, false, false)
      }
    }
    if (barStep % 2 !== 0) return
    const e8 = barStep >> 1
    // Triangle bass.
    const b = song.bass[e8] ?? '.'
    const root = freqOf(chord[0] ?? 'C3')
    if (b === 'R') triangle(root, t, sixteenth * 1.7)
    if (b === 'O') triangle(root * 2, t, sixteenth * 1.7)
    if (b === '5') triangle(root * 1.5, t, sixteenth * 1.7)
    // Lead on pulse 1.
    const eighth = Math.floor(s / 2) % (bars * 8)
    const lead = song.lead[eighth] ?? ''
    if (lead && lead !== '-') {
      let held = 1
      while (song.lead[(eighth + held) % song.lead.length] === '-') held += 1
      pulse(freqOf(lead), t, held * sixteenth * 2 * 0.92, song.duty, 0.13, true, true)
    }
  }

  function schedule(until = ctx.currentTime + 0.25): void {
    if (next < ctx.currentTime) next = ctx.currentTime + 0.05
    while (next < until) {
      if (pending && step % 16 === 0) {
        track = pending
        pending = null
        step = 0
        echo.delayTime.setValueAtTime((60 / SONGS[track].bpm / 4) * 3, next)
      }
      playStep(next, step)
      next += 60 / SONGS[track].bpm / 4
      step += 1
    }
  }

  echo.delayTime.value = (60 / SONGS[track].bpm / 4) * 3

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
        echo.delayTime.value = (60 / SONGS[track].bpm / 4) * 3
        return
      }
      pending = t
    },
  }
}
