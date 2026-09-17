import Phaser from "phaser"
import { t } from "../core/i18n"
import { getAudio } from "../core/audio"
import type { AccessoryOption, EarsOption, FurOption } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { mountDomShell, requireEl } from "../ui/DomShell"
import {
  filterLiveDashParticles,
  isDashUnlocked,
  listShippedDashes,
  paintDashPreview,
  resolveDashDef,
  type CanvasDashParticle,
} from "../fx/dash"

export class CustomizeScene extends Phaser.Scene {
  constructor() {
    super("Customize")
  }

  create(): void {
    getAudio().playMusic("menu")
    const save = getSave()
    const dashes = listShippedDashes()
    const equipped = save.player.equippedDash || "meadow"
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <h1>${t("customize.title")}</h1>
        <canvas data-ui="preview" width="180" height="180" aria-label="${t("common.preview")}" style="display:block;margin:0 auto 16px;border-radius:16px;background:#bed593;"></canvas>
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
                  `<option value="${v}" ${save.player.fur === v ? "selected" : ""}>${t(`customize.fur.${v}`)}</option>`,
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
                  `<option value="${v}" ${save.player.ears === v ? "selected" : ""}>${t(`customize.ears.${v}`)}</option>`,
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
                  `<option value="${v}" ${save.player.accessory === v ? "selected" : ""}>${t(`customize.accessory.${v}`)}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="bm-field">
          <label for="dash">${t("customize.dash")}</label>
          <select id="dash" data-ui="dash">
            ${dashes
              .map((def) => {
                const unlocked = isDashUnlocked(def.id, save.progress.achievements)
                const label = t(`customize.dash.${def.id}`)
                const text = unlocked
                  ? label
                  : t("customize.dash.locked", {
                      name: def.unlockAchievement ? t(`ach.${def.unlockAchievement}.name`) : label,
                    })
                const selected = def.id === equipped ? "selected" : ""
                const disabled = unlocked ? "" : "disabled"
                return `<option value="${def.id}" ${selected} ${disabled}>${text}</option>`
              })
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
    const dashEl = requireEl<HTMLSelectElement>(root, "[data-ui=dash]")
    const reducedMotion = save.settings.accessibility.reducedMotion
    let particles: CanvasDashParticle[] = []
    let elapsed = 0
    let raf = 0
    let running = true

    const cosmetics = () => ({
      fur: furEl.value as FurOption,
      ears: earsEl.value as EarsOption,
      accessory: accessoryEl.value as AccessoryOption,
    })

    const paint = (dt: number): void => {
      const ctx = preview.getContext("2d")
      if (!ctx) {
        return
      }
      elapsed += dt
      particles = filterLiveDashParticles(particles)
      paintDashPreview(
        ctx,
        preview.width,
        preview.height,
        cosmetics(),
        resolveDashDef(dashEl.value),
        elapsed,
        reducedMotion,
        particles,
      )
    }

    const loop = (now: number): void => {
      if (!running) {
        return
      }
      paint(1 / 60)
      raf = window.requestAnimationFrame(() => loop(now))
    }
    paint(0)
    raf = window.requestAnimationFrame(loop)

    furEl.onchange = () => paint(0)
    earsEl.onchange = () => paint(0)
    accessoryEl.onchange = () => paint(0)
    dashEl.onchange = () => {
      particles = []
      paint(0)
    }

    const stop = (): void => {
      running = false
      window.cancelAnimationFrame(raf)
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, stop)
    this.events.once(Phaser.Scenes.Events.DESTROY, stop)

    requireEl<HTMLButtonElement>(root, "[data-ui=save]").onclick = async () => {
      getAudio().playSfx("confirm")
      stop()
      const next = getSave()
      next.player.name = requireEl<HTMLInputElement>(root, "[data-ui=name]").value.trim() || "Mei"
      next.player.fur = furEl.value as FurOption
      next.player.ears = earsEl.value as EarsOption
      next.player.accessory = accessoryEl.value as AccessoryOption
      const dashId = dashEl.value
      next.player.equippedDash = isDashUnlocked(dashId, next.progress.achievements) ? dashId : "meadow"
      await persistSave()
      this.scene.start("Title")
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      stop()
      this.scene.start("Title")
    }
  }
}
