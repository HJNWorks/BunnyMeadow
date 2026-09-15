import Phaser from "phaser"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { t } from "../core/i18n"

export function createStubScene(key: string, backScene = "ModeSelect"): new () => Phaser.Scene {
  return class StubScene extends Phaser.Scene {
    constructor() {
      super(key)
    }

    create(): void {
      const { root } = mountDomShell(
        this,
        `
        <div class="bm-shell bm-center-text">
          <div class="bm-eyebrow">${key}</div>
          <h1>${t("stub.title")}</h1>
          <p class="bm-tagline">${t("stub.body")}</p>
          <div class="bm-actions">
            <button type="button" class="bm-btn" data-ui="back">${t("stub.back")}</button>
          </div>
        </div>
        `,
        { center: true },
      )
      requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
        this.scene.start(backScene)
      }
    }
  }
}
