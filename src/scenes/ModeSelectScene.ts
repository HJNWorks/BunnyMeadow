import Phaser from "phaser"
import { getContentFlags } from "../core/ModeContext"
import { t } from "../core/i18n"
import { mountDomShell, requireEl } from "../ui/DomShell"

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super("ModeSelect")
  }

  create(): void {
    const flags = getContentFlags()
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <div class="bm-eyebrow">Bunny Meadow</div>
        <h1>${t("mode.title")}</h1>
        <div class="bm-grid">
          <button type="button" class="bm-card" data-ui="meadow" ${flags.meadow ? "" : "disabled"}>
            <strong>${t("mode.meadow")}</strong>
            <span>${t("mode.meadow.desc")}</span>
          </button>
          <button type="button" class="bm-card" data-ui="story">
            <strong>${t("mode.story")}</strong>
            <span>${t("mode.story.desc")}</span>
          </button>
          <button type="button" class="bm-card" data-ui="tasks">
            <strong>${t("mode.tasks")}</strong>
            <span>${t("mode.tasks.desc")}</span>
          </button>
          <button type="button" class="bm-card" data-ui="endless">
            <strong>${t("mode.endless")}</strong>
            <span>${t("mode.endless.desc")}</span>
          </button>
        </div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("mode.back")}</button>
        </div>
      </div>
      `,
    )

    requireEl<HTMLButtonElement>(root, "[data-ui=meadow]").onclick = () => {
      if (flags.meadow) this.scene.start("Meadow")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=story]").onclick = () => this.scene.start("WorldMap")
    requireEl<HTMLButtonElement>(root, "[data-ui=tasks]").onclick = () => this.scene.start("TaskSelect")
    requireEl<HTMLButtonElement>(root, "[data-ui=endless]").onclick = () => this.scene.start("Endless")
    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("Title")
  }
}
