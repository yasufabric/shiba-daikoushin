import { createMusic, type Music, type Track } from './music'

export interface Synth {
  unlock(): void
  deploy(): void
  fanfare(win: boolean): void
  special(kind: number): void
  strike(kind: number): void
  /** One shiba attack of this coat landed. */
  hit(kind: number): void
  /** A dog went down. */
  pop(): void
  heal(): void
  call(): void
  tap(): void
  /** A star jingle: `count` rising notes. */
  stars(count: number): void
  setMuted(muted: boolean): void
  /** Which piece of music should play (switches at the next bar). */
  setMusic(track: Track): void
  isMuted(): boolean
}

const MUTE_KEY = 'shiba-daikoushin-mute'

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function createSynth(): Synth {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let muted = readMuted()
  let music: Music | null = null
  let wanted: Track = 'title'

  function context(): AudioContext | null {
    if (ctx) return ctx
    const Ctor = window.AudioContext
    try {
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = muted ? 0 : 1
      // A gentle compressor glues music and effects together and keeps peaks in check.
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -16
      comp.ratio.value = 3
      comp.attack.value = 0.005
      comp.release.value = 0.2
      master.connect(comp)
      comp.connect(ctx.destination)
      music = createMusic(ctx, master)
      music.setTrack(wanted)
    } catch {
      ctx = null
    }
    return ctx
  }

  function tone(freq: number, dur: number, type: OscillatorType, gain: number, when: number, slide?: number): void {
    if (!ctx || !master || muted) return
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, when)
    if (slide !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slide), when + dur)
    amp.gain.setValueAtTime(gain, when)
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    osc.connect(amp)
    amp.connect(master)
    osc.start(when)
    osc.stop(when + dur + 0.02)
  }

  function startMusic(): void {
    if (!ctx || muted) return
    music?.start()
  }

  function stopMusic(): void {
    music?.stop()
  }

  return {
    unlock() {
      const ac = context()
      if (ac && ac.state === 'suspended') void ac.resume()
      startMusic()
    },
    setMuted(value) {
      muted = value
      try {
        localStorage.setItem(MUTE_KEY, value ? '1' : '0')
      } catch {
        // Private mode can reject storage; the choice still holds for this visit.
      }
      if (master) master.gain.value = value ? 0 : 1
      if (value) stopMusic()
      else startMusic()
    },
    isMuted() {
      return muted
    },
    setMusic(track: Track) {
      wanted = track
      music?.setTrack(track)
    },
    deploy() {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      tone(480, 0.07, 'square', 0.05, t)
      tone(300, 0.09, 'square', 0.05, t + 0.06)
    },
    tap() {
      const ac = context()
      if (!ac) return
      tone(660, 0.05, 'square', 0.035, ac.currentTime, 880)
    },
    call() {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      tone(520, 0.06, 'square', 0.05, t)
      tone(780, 0.06, 'square', 0.05, t + 0.07)
      tone(1040, 0.1, 'square', 0.05, t + 0.14)
    },
    heal() {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      tone(880, 0.1, 'sine', 0.05, t)
      tone(1320, 0.14, 'sine', 0.04, t + 0.08)
    },
    pop() {
      const ac = context()
      if (!ac) return
      tone(420, 0.08, 'square', 0.03, ac.currentTime, 120)
    },
    hit(kind: number) {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      // 赤 a quick nip, 黒 a heavy slam, 胡麻 a ball thump, ぶち a whoosh, どっしり a stomp.
      if (kind === 0) tone(760, 0.05, 'square', 0.03, t, 320)
      else if (kind === 1) tone(120, 0.18, 'sawtooth', 0.05, t, 50)
      else if (kind === 2) tone(260, 0.1, 'triangle', 0.06, t, 140)
      else if (kind === 4) tone(300, 0.2, 'sawtooth', 0.03, t, 1200)
      else if (kind === 5) {
        tone(80, 0.25, 'sawtooth', 0.06, t, 35)
        tone(200, 0.06, 'square', 0.03, t, 90)
      }
    },
    stars(count: number) {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime + 1.0
      const notes = [784, 988, 1175]
      for (let i = 0; i < count; i++) tone(notes[i] ?? 784, 0.2, 'square', 0.05, t + i * 0.18)
    },
    special(kind: number) {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      // A low ゴゴゴ rumble, two barks, then a rising sting pitched per coat.
      tone(70, 0.4, 'sawtooth', 0.05, t, 55)
      tone(620, 0.06, 'square', 0.05, t + 0.05, 380)
      tone(620, 0.06, 'square', 0.05, t + 0.16, 380)
      const root = [392, 330, 523, 440, 494, 294, 587][kind] ?? 392
      const notes = [root, root * 1.25, root * 1.5, root * 2]
      for (let i = 0; i < notes.length; i++) tone(notes[i] ?? root, 0.1, 'square', 0.04, t + 0.28 + i * 0.06)
    },
    strike(kind: number) {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      // The hit itself: 赤 a run of pops, 黒 a sharp rising zip, ぶち a long sweep, 白 a chime, the rest a heavy thud.
      if (kind === 0) {
        for (let i = 0; i < 5; i++) tone(700 + i * 90, 0.05, 'square', 0.04, t + i * 0.05, 300)
      } else if (kind === 1) {
        tone(180, 0.22, 'sawtooth', 0.06, t, 1400)
      } else if (kind === 4) {
        tone(240, 0.35, 'sawtooth', 0.05, t, 1600)
      } else if (kind === 3) {
        for (let i = 0; i < 4; i++) tone(660 * (1 + i * 0.25), 0.16, 'sine', 0.05, t + i * 0.06)
      } else if (kind === 6) {
        // ワンワン!!: two barks, then a bright major chord.
        tone(700, 0.08, 'square', 0.05, t, 420)
        tone(760, 0.08, 'square', 0.05, t + 0.14, 440)
        for (const f of [587, 740, 880]) tone(f, 0.35, 'triangle', 0.04, t + 0.3)
      } else {
        tone(110, 0.3, 'sawtooth', 0.07, t, 40)
        tone(440, 0.08, 'square', 0.04, t + 0.02, 220)
      }
    },
    fanfare(win: boolean) {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      const notes = win ? [523, 659, 784, 1046, 784, 1046] : [494, 392, 330, 262]
      for (let i = 0; i < notes.length; i++) {
        const freq = notes[i]
        if (freq === undefined) continue
        tone(freq, 0.18, 'square', 0.05, t + i * 0.12)
      }
    },
  }
}
