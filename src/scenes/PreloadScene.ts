import Phaser from "phaser"
import { getAudio } from "../core/audio"
import { setLanguage } from "../core/i18n"
import { getInput } from "../core/input"
import { initSession } from "../core/session"

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload")
  }

  preload(): void {
    const { width, height } = this.scale
    const barWidth = Math.floor(width * 0.5)
    const barHeight = 12
    const x = (width - barWidth) / 2
    const y = height / 2

    const track = this.add.rectangle(x, y, barWidth, barHeight, 0x34583e).setOrigin(0, 0.5)
    const fill = this.add.rectangle(x, y, 4, barHeight, 0xdc854e).setOrigin(0, 0.5)

    this.load.on("progress", (value: number) => {
      fill.width = Math.max(4, barWidth * value)
    })

    this.load.on("complete", () => {
      track.destroy()
      fill.destroy()
    })
  }

  async create(): Promise<void> {
    const save = await initSession()
    setLanguage(save.settings.language)
    getAudio().applyFromSave(save)
    getAudio().listenForUnlock()
    getInput().setBindings(save.settings.bindings)
    this.scene.start("Title")
  }
}
