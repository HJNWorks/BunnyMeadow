import Phaser from "phaser"
import { t } from "../core/i18n"
import type { AccessoryOption, EarsOption, FurOption } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { drawBunny } from "../render/drawBunny"

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
        <canvas data-ui="preview" width="180" height="180" aria-label="Bunny preview" style="display:block;margin:0 auto 16px;border-radius:16px;background:#bed593;"></canvas>
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

    const preview = requireEl<HTMLCanvasElement>(root, "[data-ui=preview]")
    const furEl = requireEl<HTMLSelectElement>(root, "[data-ui=fur]")
    const earsEl = requireEl<HTMLSelectElement>(root, "[data-ui=ears]")
    const accessoryEl = requireEl<HTMLSelectElement>(root, "[data-ui=accessory]")

    const paint = (): void => {
      const ctx = preview.getContext("2d")
      if (!ctx) {
        return
      }
      ctx.clearRect(0, 0, preview.width, preview.height)
      ctx.fillStyle = "#bed593"
      ctx.fillRect(0, 0, preview.width, preview.height)
      drawBunny(ctx, preview.width / 2, preview.height / 2 + 10, {
        fur: furEl.value as FurOption,
        ears: earsEl.value as EarsOption,
        accessory: accessoryEl.value as AccessoryOption,
      })
    }

    furEl.onchange = paint
    earsEl.onchange = paint
    accessoryEl.onchange = paint
    paint()

    requireEl<HTMLButtonElement>(root, "[data-ui=save]").onclick = async () => {
      const next = getSave()
      next.player.name = requireEl<HTMLInputElement>(root, "[data-ui=name]").value.trim() || "Mei"
      next.player.fur = furEl.value as FurOption
      next.player.ears = earsEl.value as EarsOption
      next.player.accessory = accessoryEl.value as AccessoryOption
      await persistSave()
      this.scene.start("Title")
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("Title")
  }
}
