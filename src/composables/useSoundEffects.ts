import { readonly, shallowRef } from 'vue'

const sfxEnabled = shallowRef(true)
let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (!sfxEnabled.value || typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) {
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.14,
  delay = 0,
  endFreq?: number,
): void {
  const ctx = getContext()
  if (!ctx) return

  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration)
  }

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function useSoundEffects() {
  function unlockAudio(): void {
    getContext()
  }

  function toggleSfx(): void {
    sfxEnabled.value = !sfxEnabled.value
    if (sfxEnabled.value) {
      playTap()
    }
  }

  function playTap(): void {
    // Warm wooden paper tap with slight organic pitch jitter
    const jitter = 0.96 + Math.random() * 0.08
    playTone(480 * jitter, 0.075, 'triangle', 0.11, 0, 320 * jitter)
  }

  function playSuccess(): void {
    // Warm pentatonic marimba chime (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((n, idx) => {
      playTone(n, 0.22, 'triangle', 0.13, idx * 0.065)
    })
  }

  function playGentleHint(): void {
    // Soft encouraging two-note woodblock (never harsh buzzer)
    playTone(349.23, 0.12, 'sine', 0.1, 0)
    playTone(311.13, 0.16, 'sine', 0.09, 0.11)
  }

  function playStar(): void {
    playTone(880, 0.14, 'sine', 0.12, 0)
    playTone(1318.5, 0.24, 'sine', 0.11, 0.07)
  }

  function playPageTurn(): void {
    const ctx = getContext()
    if (!ctx) return
    const bufferSize = Math.floor(ctx.sampleRate * 0.16)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.25
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(900, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.15)
    filter.Q.value = 1.6

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  }

  function playLevelFanfare(): void {
    const melody = [
      { f: 523.25, t: 0, d: 0.16 },
      { f: 659.25, t: 0.1, d: 0.16 },
      { f: 783.99, t: 0.2, d: 0.16 },
      { f: 1046.5, t: 0.32, d: 0.24 },
      { f: 880, t: 0.48, d: 0.14 },
      { f: 1046.5, t: 0.6, d: 0.38 },
    ]
    melody.forEach((m) => {
      playTone(m.f, m.d, 'triangle', 0.14, m.t)
    })
  }

  function playLullabyNote(index = 0): void {
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
    const freq = scale[Math.abs(index) % scale.length]
    playTone(freq, 0.45, 'sine', 0.09, 0)
  }

  return {
    sfxEnabled: readonly(sfxEnabled),
    unlockAudio,
    toggleSfx,
    playTap,
    playSuccess,
    playGentleHint,
    playStar,
    playPageTurn,
    playLevelFanfare,
    playLullabyNote,
  }
}
