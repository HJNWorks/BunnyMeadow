import Phaser from "phaser"
import { getAudio } from "../core/audio"
import { setLanguage } from "../core/i18n"
import { getInput } from "../core/input"
import { initSession } from "../core/session"
import { preloadStoryMapArt } from "../modes/story/mapArt"

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload")
  }

  async create(): Promise<void> {
    const { width, height } = this.scale
    const barWidth = Math.floor(width * 0.5)
    const barHeight = 12
    const x = (width - barWidth) / 2
    const y = height / 2

    const track = this.add.rectangle(x, y, barWidth, barHeight, 0x34583e).setOrigin(0, 0.5)
    const fill = this.add.rectangle(x, y, 4, barHeight, 0xdc854e).setOrigin(0, 0.5)
    const setRatio = (ratio: number): void => {
      fill.width = Math.max(4, barWidth * ratio)
    }

    const save = await initSession()
    setLanguage(save.settings.language)
    getAudio().applyFromSave(save)
    getAudio().listenForUnlock()
    getInput().setBindings(save.settings.bindings)
    setRatio(0.2)
    await preloadStoryMapArt((ratio) => setRatio(0.2 + ratio * 0.8))

    track.destroy()
    fill.destroy()
    this.scene.start("Title")
  }
}
