import Phaser from "phaser"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { t } from "../core/i18n"
import { getAudio } from "../core/audio"
import { preloadStoryMapArt } from "../modes/story/mapArt"

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title")
  }

  create(): void {
    getAudio().playMusic("menu")
    void preloadStoryMapArt()
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell bm-center-text">
        <div class="bm-eyebrow">${t("title.eyebrow")}</div>
        <h1>Bunny Meadow<span>.</span></h1>
        <p class="bm-tagline">${t("title.tagline")}</p>
        <div class="bm-actions">
          <button type="button" class="bm-btn" data-ui="play">${t("title.play")}</button>
          <button type="button" class="bm-btn ghost" data-ui="settings">${t("title.settings")}</button>
          <button type="button" class="bm-btn ghost" data-ui="customize">${t("title.customize")}</button>
          <button type="button" class="bm-btn ghost" data-ui="achievements">${t("title.achievements")}</button>
        </div>
      </div>
      `,
      { center: true },
    )

    requireEl<HTMLButtonElement>(root, "[data-ui=play]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("ModeSelect")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=settings]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Settings")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=customize]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Customize")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=achievements]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Achievements")
    }
  }
}
