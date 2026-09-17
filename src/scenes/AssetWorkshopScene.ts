import Phaser from "phaser"
import { t } from "../core/i18n"
import { getAudio } from "../core/audio"
import { getContentFlags } from "../core/ModeContext"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { isEditorEnabled } from "../modes/story/editor"
import { dashLookEditorHtml, bindDashLookEditor } from "../fx/dash/DashLookPanel"
import { workshopHtml, bindWorkshop } from "../fx/workshop/WorkshopPanel"

export class AssetWorkshopScene extends Phaser.Scene {
  constructor() {
    super("AssetWorkshop")
  }

  create(): void {
    getAudio().playMusic("menu")
    const showDash = isEditorEnabled()
    const showBrush = getContentFlags().assetWorkshop === true
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell bm-wide">
        <h1>${t("workshop.title")}</h1>
        <p class="bm-tagline">${t("workshop.pageNote")}</p>
        <div class="bm-workshop-grid">
          ${showDash ? `<section class="bm-tool-card">${dashLookEditorHtml()}</section>` : ""}
          ${showBrush ? `<section class="bm-tool-card">${workshopHtml()}</section>` : ""}
        </div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    if (showDash) {
      const stopDash = bindDashLookEditor(root)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, stopDash)
      this.events.once(Phaser.Scenes.Events.DESTROY, stopDash)
    }
    if (showBrush) {
      bindWorkshop(root)
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("Settings")
    }
  }
}
