import type { SaveV1 } from "./save"

export class AudioBus {
  private master = 1
  private music = 0.8
  private sfx = 1

  applyFromSave(save: SaveV1): void {
    this.master = save.settings.audio.master
    this.music = save.settings.audio.music
    this.sfx = save.settings.audio.sfx
  }

  setMaster(value: number): void {
    this.master = value
  }

  setMusic(value: number): void {
    this.music = value
  }

  setSfx(value: number): void {
    this.sfx = value
  }

  get volumes(): { master: number; music: number; sfx: number } {
    return { master: this.master, music: this.music, sfx: this.sfx }
  }

  playSfx(_id: string): void {}

  playMusic(_id: string): void {}

  stopMusic(): void {}
}

let audio: AudioBus | null = null

export function getAudio(): AudioBus {
  if (!audio) {
    audio = new AudioBus()
  }
  return audio
}
