import Phaser from "phaser"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { t } from "../core/i18n"

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title")
  }

  create(): void {
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

    requireEl<HTMLButtonElement>(root, "[data-ui=play]").onclick = () => this.scene.start("ModeSelect")
    requireEl<HTMLButtonElement>(root, "[data-ui=settings]").onclick = () => this.scene.start("Settings")
    requireEl<HTMLButtonElement>(root, "[data-ui=customize]").onclick = () => this.scene.start("Customize")
    requireEl<HTMLButtonElement>(root, "[data-ui=achievements]").onclick = () => this.scene.start("Achievements")
  }
}
