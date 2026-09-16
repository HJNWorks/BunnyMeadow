import type { SaveV1 } from "./save"

export type MusicId = "menu" | "meadow" | "dusk" | "night" | "moon" | "boss"

type OscType = OscillatorType

type MusicPattern = {
  notes: number[]
  dur: number
  type: OscType
  drone?: number[]
  droneType?: OscType
}

type SfxSpec = {
  f0: number
  f1: number
  dur: number
  type: OscType
  vol: number
}

const MUSIC: Record<MusicId, MusicPattern> = {
  menu: { notes: [196, 247, 220, 294, 247, 330, 294, 196], dur: 0.48, type: "triangle" },
  meadow: { notes: [262, 330, 392, 330, 294, 392, 440, 330], dur: 0.4, type: "triangle" },
  dusk: { notes: [220, 277, 330, 277, 247, 330, 370, 220], dur: 0.52, type: "sine" },
  night: { notes: [174, 220, 196, 261, 220, 311, 261, 174], dur: 0.6, type: "sine" },
  moon: { notes: [155, 196, 185, 233, 196, 277, 233, 155], dur: 0.68, type: "sine" },
  boss: {
    notes: [196, 233, 220, 277, 247, 311, 277, 185, 196, 247, 220, 294, 247, 330, 277, 165],
    drone: [73, 73, 65, 73, 82, 73, 65, 55, 73, 73, 65, 73, 82, 73, 98, 55],
    dur: 0.24,
    type: "sawtooth",
    droneType: "triangle",
  },
}

const SFX: Record<string, SfxSpec> = {
  jump: { f0: 480, f1: 320, dur: 0.09, type: "square", vol: 0.11 },
  dash: { f0: 220, f1: 90, dur: 0.12, type: "sawtooth", vol: 0.1 },
  pickup: { f0: 660, f1: 990, dur: 0.12, type: "sine", vol: 0.13 },
  hurt: { f0: 240, f1: 90, dur: 0.16, type: "sawtooth", vol: 0.15 },
  heart: { f0: 150, f1: 70, dur: 0.22, type: "triangle", vol: 0.18 },
  mist: { f0: 90, f1: 40, dur: 0.55, type: "sawtooth", vol: 0.2 },
  confirm: { f0: 520, f1: 780, dur: 0.1, type: "sine", vol: 0.12 },
  cancel: { f0: 400, f1: 240, dur: 0.1, type: "sine", vol: 0.1 },
}

export function musicIdForEnv(env: string): MusicId {
  if (env === "moon") {
    return "moon"
  }
  if (env === "lantern" || env === "osmanthus") {
    return "night"
  }
  if (env === "bamboo" || env === "riverbank") {
    return "dusk"
  }
  return "meadow"
}

export class AudioBus {
  private master = 1
  private music = 0.8
  private sfx = 1
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private currentMusic: MusicId | null = null
  private noteIndex = 0
  private nextNote = 0
  private musicTimer = 0
  private listening = false

  applyFromSave(save: SaveV1): void {
    this.setMaster(save.settings.audio.master)
    this.setMusic(save.settings.audio.music)
    this.setSfx(save.settings.audio.sfx)
  }

  setMaster(value: number): void {
    this.master = value
    this.masterGain?.gain.setTargetAtTime(value, this.now(), 0.02)
  }

  setMusic(value: number): void {
    this.music = value
    this.musicGain?.gain.setTargetAtTime(value * 0.22, this.now(), 0.02)
  }

  setSfx(value: number): void {
    this.sfx = value
    this.sfxGain?.gain.setTargetAtTime(value, this.now(), 0.02)
  }

  get volumes(): { master: number; music: number; sfx: number } {
    return { master: this.master, music: this.music, sfx: this.sfx }
  }

  listenForUnlock(): void {
    if (this.listening || typeof window === "undefined") {
      return
    }
    this.listening = true
    const go = (): void => {
      this.unlock()
    }
    window.addEventListener("pointerdown", go)
    window.addEventListener("keydown", go)
  }

  unlock(): void {
    this.ensureGraph()
    if (!this.ctx) {
      return
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().then(() => {
        if (this.currentMusic) {
          if (this.musicTimer) {
            window.clearTimeout(this.musicTimer)
            this.musicTimer = 0
          }
          this.nextNote = this.now() + 0.02
          this.pumpMusic()
        }
      })
    }
  }

  playSfx(id: string): void {
    this.unlock()
    const spec = SFX[id]
    if (!spec || !this.ctx || !this.sfxGain) {
      return
    }
    this.beep(spec.f0, spec.f1, spec.dur, spec.type, this.sfxGain, spec.vol, this.ctx.currentTime)
  }

  playMusic(id: string): void {
    this.unlock()
    const key = MUSIC[id as MusicId] ? (id as MusicId) : "menu"
    if (this.currentMusic === key) {
      return
    }
    this.stopMusic()
    this.currentMusic = key
    this.noteIndex = 0
    this.nextNote = this.now() + 0.04
    this.pumpMusic()
  }

  stopMusic(): void {
    this.currentMusic = null
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer)
      this.musicTimer = 0
    }
  }

  private now(): number {
    return this.ctx?.currentTime ?? 0
  }

  private ensureGraph(): void {
    if (this.ctx) {
      return
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) {
      return
    }
    this.ctx = new Ctor()
    this.masterGain = this.ctx.createGain()
    this.musicGain = this.ctx.createGain()
    this.sfxGain = this.ctx.createGain()
    this.masterGain.gain.value = this.master
    this.musicGain.gain.value = this.music * 0.22
    this.sfxGain.gain.value = this.sfx
    this.musicGain.connect(this.masterGain)
    this.sfxGain.connect(this.masterGain)
    this.masterGain.connect(this.ctx.destination)
  }

  private pumpMusic(): void {
    if (!this.ctx || !this.musicGain || !this.currentMusic) {
      return
    }
    const pattern = MUSIC[this.currentMusic]
    while (this.nextNote < this.ctx.currentTime + 0.9) {
      const i = this.noteIndex % pattern.notes.length
      const freq = pattern.notes[i]
      if (freq > 1) {
        this.beep(
          freq,
          freq * 1.02,
          pattern.dur * 0.72,
          pattern.type,
          this.musicGain,
          pattern.drone ? 0.42 : 0.55,
          this.nextNote,
        )
      }
      const drone = pattern.drone?.[i] ?? 0
      if (drone > 1) {
        this.beep(
          drone,
          drone * 0.98,
          pattern.dur * 0.92,
          pattern.droneType ?? "triangle",
          this.musicGain,
          0.62,
          this.nextNote,
        )
      }
      this.nextNote += pattern.dur
      this.noteIndex += 1
    }
    this.musicTimer = window.setTimeout(() => this.pumpMusic(), 140)
  }

  private beep(
    f0: number,
    f1: number,
    dur: number,
    type: OscType,
    dest: GainNode,
    vol: number,
    when: number,
  ): void {
    if (!this.ctx) {
      return
    }
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(f0, when)
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), when + dur)
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(vol, when + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    osc.connect(gain)
    gain.connect(dest)
    osc.start(when)
    osc.stop(when + dur + 0.02)
  }
}

let audio: AudioBus | null = null

export function getAudio(): AudioBus {
  if (!audio) {
    audio = new AudioBus()
    audio.listenForUnlock()
  }
  return audio
}
