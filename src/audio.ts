export interface Synth {
  unlock(): void
  deploy(): void
  cannon(): void
  fanfare(win: boolean): void
}

export function createSynth(): Synth {
  let ctx: AudioContext | null = null
  let noise: AudioBuffer | null = null

  function context(): AudioContext | null {
    if (ctx) return ctx
    const Ctor = window.AudioContext
    try {
      ctx = new Ctor()
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    } catch {
      ctx = null
      noise = null
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
    cannon() {
      const ac = context()
      if (!ac || !noise) return
      const t = ac.currentTime
      tone(150, 0.34, 'sawtooth', 0.06, t, 40)
      const src = ac.createBufferSource()
      src.buffer = noise
      const amp = ac.createGain()
      const filter = ac.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1600, t)
      filter.frequency.exponentialRampToValueAtTime(160, t + 0.3)
      amp.gain.setValueAtTime(0.16, t)
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
      src.connect(filter)
      filter.connect(amp)
      amp.connect(ac.destination)
      src.start(t)
      src.stop(t + 0.34)
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
