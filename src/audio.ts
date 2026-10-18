export interface Synth {
  unlock(): void
  deploy(): void
  fanfare(win: boolean): void
  special(kind: number): void
}

export function createSynth(): Synth {
  let ctx: AudioContext | null = null

  function context(): AudioContext | null {
    if (ctx) return ctx
    const Ctor = window.AudioContext
    try {
      ctx = new Ctor()
    } catch {
      ctx = null
    }
    return ctx
  }

  function tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    when: number,
    slide?: number,
  ): void {
    if (!ctx) return
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, when)
    if (slide !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slide), when + dur)
    amp.gain.setValueAtTime(gain, when)
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(when)
    osc.stop(when + dur + 0.02)
  }

  return {
    unlock() {
      const ac = context()
      if (ac && ac.state === 'suspended') void ac.resume()
    },
    deploy() {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      tone(480, 0.07, 'square', 0.05, t)
      tone(300, 0.09, 'square', 0.05, t + 0.06)
    },
    special(kind: number) {
      const ac = context()
      if (!ac) return
      const t = ac.currentTime
      // A low ゴゴゴ rumble, two barks, then a rising sting pitched per coat.
      tone(70, 0.4, 'sawtooth', 0.05, t, 55)
      tone(620, 0.06, 'square', 0.05, t + 0.05, 380)
      tone(620, 0.06, 'square', 0.05, t + 0.16, 380)
      const root = [392, 330, 523][kind] ?? 392
      const notes = [root, root * 1.25, root * 1.5, root * 2]
      for (let i = 0; i < notes.length; i++) tone(notes[i] ?? root, 0.1, 'square', 0.04, t + 0.28 + i * 0.06)
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
