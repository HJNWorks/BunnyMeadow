import Phaser from "phaser"
import { t } from "../core/i18n"
import type { AccessoryOption, EarsOption, FurOption } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { mountDomShell, requireEl } from "../ui/DomShell"

export class CustomizeScene extends Phaser.Scene {
  constructor() {
    super("Customize")
  }

  create(): void {
    const save = getSave()
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <h1>${t("customize.title")}</h1>
        <div class="bm-field">
          <label for="name">${t("customize.name")}</label>
          <input id="name" data-ui="name" value="${save.player.name}" maxlength="24" />
        </div>
        <div class="bm-field">
          <label for="fur">${t("customize.fur")}</label>
          <select id="fur" data-ui="fur">
            ${(["cream", "brown", "gray", "moon-white"] as FurOption[])
              .map(
                (v) =>
                  `<option value="${v}" ${save.player.fur === v ? "selected" : ""}>${v}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="bm-field">
          <label for="ears">${t("customize.ears")}</label>
          <select id="ears" data-ui="ears">
            ${(["upright", "lop", "tufted"] as EarsOption[])
              .map(
                (v) =>
                  `<option value="${v}" ${save.player.ears === v ? "selected" : ""}>${v}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="bm-field">
          <label for="accessory">${t("customize.accessory")}</label>
          <select id="accessory" data-ui="accessory">
            ${(["none", "scarf", "lantern", "blossom"] as AccessoryOption[])
              .map(
                (v) =>
                  `<option value="${v}" ${save.player.accessory === v ? "selected" : ""}>${v}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn warm" data-ui="save">${t("settings.save")}</button>
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    requireEl<HTMLButtonElement>(root, "[data-ui=save]").onclick = async () => {
      const next = getSave()
      next.player.name = requireEl<HTMLInputElement>(root, "[data-ui=name]").value.trim() || "Mei"
      next.player.fur = requireEl<HTMLSelectElement>(root, "[data-ui=fur]").value as FurOption
      next.player.ears = requireEl<HTMLSelectElement>(root, "[data-ui=ears]").value as EarsOption
      next.player.accessory = requireEl<HTMLSelectElement>(root, "[data-ui=accessory]")
        .value as AccessoryOption
      await persistSave()
      this.scene.start("Title")
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("Title")
  }
}
