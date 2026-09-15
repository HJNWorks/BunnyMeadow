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
          <button type="button" class="bm-card" data-ui="story" ${flags.storyWorld1 ? "" : "disabled"}>
            <strong>${t("mode.story")}</strong>
            <span>${flags.storyWorld1 ? "World 1 · Meadow and Hedgerows" : t("mode.story.desc")}</span>
          </button>
          <button type="button" class="bm-card" data-ui="tasks" ${flags.tasks ? "" : "disabled"}>
            <strong>${t("mode.tasks")}</strong>
            <span>${flags.tasks ? t("mode.tasks.desc") : "Coming soon"}</span>
          </button>
          <button type="button" class="bm-card" data-ui="endless" ${flags.endless ? "" : "disabled"}>
            <strong>${t("mode.endless")}</strong>
            <span>${flags.endless ? t("mode.endless.desc") : "Coming soon"}</span>
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
    requireEl<HTMLButtonElement>(root, "[data-ui=story]").onclick = () => {
      if (flags.storyWorld1) this.scene.start("WorldMap")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=tasks]").onclick = () => {
      if (flags.tasks) this.scene.start("TaskSelect")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=endless]").onclick = () => {
      if (flags.endless) this.scene.start("Endless")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("Title")
  }
}
