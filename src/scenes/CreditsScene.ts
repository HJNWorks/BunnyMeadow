import Phaser from "phaser"
import achievementsData from "../data/achievements.json"
import { t } from "../core/i18n"
import { getPlatform } from "../core/platform"
import { getSave } from "../core/session"
import { mountDomShell, requireEl } from "../ui/DomShell"

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super("Credits")
  }

  create(): void {
    const save = getSave()
    const unlocked = new Set(save.progress.achievements)

    void getPlatform()
      .achievements.listUnlocked()
      .then((ids) => ids.forEach((id) => unlocked.add(id)))

    const items = achievementsData.achievements
      .map((item) => {
        const got = unlocked.has(item.id)
        return `<li class="${got ? "" : "locked"}"><strong>${item.name}</strong> — ${item.description}${got ? "" : " (locked)"}</li>`
      })
      .join("")

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <h1>${t("credits.title")}</h1>
        <p class="bm-tagline">Bunny Meadow. Family woodland adventure. Phaser 4 + Vite.</p>
        <h2>${t("credits.achievements")}</h2>
        <ul class="bm-list">${items}</ul>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("Title")
  }
}
