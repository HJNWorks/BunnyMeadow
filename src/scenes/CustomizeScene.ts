import Phaser from "phaser"
import { t } from "../core/i18n"
import { getAudio } from "../core/audio"
import { isAccessoryUnlocked } from "../core/unlocks"
import type { AccessoryOption, EarsOption, FurOption } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { mountDomShell, requireEl } from "../ui/DomShell"
import {
  filterLiveDashParticles,
  isDashUnlocked,
  listShippedDashes,
  paintDashPreview,
  paintMeiIdle,
  resolveDashDef,
  type CanvasDashParticle,
} from "../fx/dash"
import {
  meiClipSeconds,
  paintBoundMeiClip,
  pickNextMeiClip,
  type MeiBoundClip,
} from "../render/meiPreview"

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
        <canvas data-ui="preview" class="bm-dash-preview" width="280" height="180" aria-label="${t("common.preview")}"></canvas>
        <div class="bm-preview-anim">
          <label class="bm-check">
            <input type="checkbox" data-ui="animStop" checked />
            ${t("customize.anim.stop")}
          </label>
        </div>
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
            ${(["none", "scarf", "lantern", "blossom", "osmanthus", "moon-helmet"] as AccessoryOption[])
              .map((v) => {
                const unlocked = isAccessoryUnlocked(save, v)
                const label = t(`customize.accessory.${v}`)
                const text = unlocked
                  ? label
                  : t("customize.accessory.locked", { name: label })
                const selected = save.player.accessory === v ? "selected" : ""
                const disabled = unlocked ? "" : "disabled"
                return `<option value="${v}" ${selected} ${disabled}>${text}</option>`
              })
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
    const stopEl = requireEl<HTMLInputElement>(root, "[data-ui=animStop]")
    const reducedMotion = save.settings.accessibility.reducedMotion
    let particles: CanvasDashParticle[] = []
    let clip: MeiBoundClip | null = null
    let clipElapsed = 0
    let lastStamp = 0
    let raf = 0
    let playing = false
    let alive = true

    const cosmetics = () => ({
      fur: furEl.value as FurOption,
      ears: earsEl.value as EarsOption,
      accessory: accessoryEl.value as AccessoryOption,
    })

    const paintIdle = (): void => {
      const ctx = preview.getContext("2d")
      if (!ctx) {
        return
      }
      paintMeiIdle(ctx, preview.width, preview.height, cosmetics())
    }

    const paintPlaying = (dt: number): void => {
      const ctx = preview.getContext("2d")
      if (!ctx || !clip) {
        return
      }
      clipElapsed += dt
      if (clipElapsed >= meiClipSeconds(clip)) {
        clip = pickNextMeiClip(clip)
        clipElapsed = 0
        particles = []
      }
      particles = filterLiveDashParticles(particles)
      paintBoundMeiClip(clip, {
        dash: () => {
          paintDashPreview(
            ctx,
            preview.width,
            preview.height,
            cosmetics(),
            resolveDashDef(dashEl.value),
            clipElapsed,
            reducedMotion,
            particles,
            dt,
          )
        },
      })
    }

    const halt = (): void => {
      playing = false
      clip = null
      clipElapsed = 0
      lastStamp = 0
      particles = []
      window.cancelAnimationFrame(raf)
      raf = 0
      stopEl.checked = true
      paintIdle()
    }

    const loop = (now: number): void => {
      if (!alive || !playing) {
        return
      }
      const dt = lastStamp ? Math.min(0.05, (now - lastStamp) / 1000) : 1 / 60
      lastStamp = now
      paintPlaying(dt)
      raf = window.requestAnimationFrame(loop)
    }

    const startPlay = (): void => {
      stopEl.checked = false
      playing = true
      clip = pickNextMeiClip(clip)
      clipElapsed = 0
      lastStamp = 0
      particles = []
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(loop)
    }

    paintIdle()

    furEl.onchange = () => {
      if (playing) {
        return
      }
      paintIdle()
    }
    earsEl.onchange = () => {
      if (playing) {
        return
      }
      paintIdle()
    }
    accessoryEl.onchange = () => {
      if (playing) {
        return
      }
      paintIdle()
    }
    dashEl.onchange = () => {
      particles = []
      if (!playing) {
        paintIdle()
      }
    }
    stopEl.onchange = () => {
      if (stopEl.checked) {
        halt()
        return
      }
      startPlay()
    }

    const stop = (): void => {
      alive = false
      playing = false
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
      const accessory = accessoryEl.value as AccessoryOption
      next.player.accessory = isAccessoryUnlocked(next, accessory) ? accessory : "none"
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
