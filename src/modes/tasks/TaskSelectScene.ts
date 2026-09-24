import Phaser from "phaser"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { TaskRunner, type TaskId } from "./TaskRunner"
import { getContentFlags } from "../../core/ModeContext"
import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"

const TASK_ICONS: Record<string, string> = {
  night_watch: `
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
      <path d="M28 10a12 12 0 1 0 10 18 10 10 0 0 1-10-18z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M10 36h28" stroke="currentColor" stroke-width="2" opacity="0.35" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="1.6" fill="currentColor" opacity="0.55"/>
      <circle cx="22" cy="12" r="1.2" fill="currentColor" opacity="0.4"/>
    </svg>
  `,
  hide_and_seek: `
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
      <circle cx="20" cy="20" r="9" stroke="currentColor" stroke-width="2.4"/>
      <path d="M27 27l10 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="20" cy="20" r="3" stroke="currentColor" stroke-width="2" opacity="0.55"/>
    </svg>
  `,
  bunny_jump: `
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
      <path d="M14 36h20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M10 28h10M28 20h10M16 12h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="24" cy="22" r="5" stroke="currentColor" stroke-width="2.4"/>
      <path d="M21 18v-6M27 18v-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `,
}

const ENDLESS_ICON = `
  <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
    <path d="M14 24c0-5 4-9 9-9 3.2 0 5.4 1.4 7 3.6L24 24l6 5.4c-1.6 2.2-3.8 3.6-7 3.6-5 0-9-4-9-9z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M34 24c0 5-4 9-9 9-3.2 0-5.4-1.4-7-3.6L24 24l-6-5.4c1.6-2.2 3.8-3.6 7-3.6 5 0 9 4 9 9z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>
`

const MEADOW_ICON = `
  <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
    <path d="M8 34c6-4 10-12 16-12s10 8 16 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="24" cy="18" r="7" stroke="currentColor" stroke-width="2.4"/>
    <path d="M20 17h.01M28 17h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M12 38h24" stroke="currentColor" stroke-width="2" opacity="0.35" stroke-linecap="round"/>
  </svg>
`

function modeCard(opts: {
  attr: string
  title: string
  desc: string
  icon: string
}): string {
  return `
    <button type="button" class="bm-card bm-card-icon" ${opts.attr}>
      <span class="bm-mode-icon" aria-hidden="true">${opts.icon}</span>
      <span class="bm-card-copy">
        <strong>${opts.title}</strong>
        <span>${opts.desc}</span>
      </span>
    </button>
  `
}

export class TaskSelectScene extends Phaser.Scene {
  constructor() {
    super("TaskSelect")
  }

  create(): void {
    getAudio().playMusic("menu")
    const flags = getContentFlags()
    const runner = new TaskRunner()

    const meadowCard = flags.meadow
      ? modeCard({
          attr: "data-ui=\"meadow\"",
          title: t("mode.meadow"),
          desc: t("mode.meadow.desc"),
          icon: MEADOW_ICON,
        })
      : ""

    const cards = runner
      .list()
      .map((id) => {
        const def = runner.getDef(id)
        if (!def) {
          return ""
        }
        return modeCard({
          attr: `data-task="${id}"`,
          title: t(`task.${id}.name`),
          desc: t(`task.${id}.desc`),
          icon: TASK_ICONS[id] ?? MEADOW_ICON,
        })
      })
      .join("")

    const endlessCard = flags.endless
      ? modeCard({
          attr: "data-ui=\"endless\"",
          title: t("mode.endless"),
          desc: t("mode.endless.desc"),
          icon: ENDLESS_ICON,
        })
      : ""

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <div class="bm-eyebrow">${t("tasks.select.eyebrow")}</div>
        <h1>${t("tasks.select.title")}</h1>
        <p class="bm-tagline">${t("tasks.select.tagline")}</p>
        <div class="bm-grid">${meadowCard}${cards}${endlessCard}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    const meadowBtn = root.querySelector("[data-ui=meadow]") as HTMLButtonElement | null
    if (meadowBtn) {
      meadowBtn.onclick = () => {
        getAudio().playSfx("confirm")
        this.scene.start("Meadow")
      }
    }

    for (const id of runner.list()) {
      const btn = root.querySelector(`[data-task="${id}"]`) as HTMLButtonElement | null
      if (!btn) {
        continue
      }
      btn.onclick = () => {
        getAudio().playSfx("confirm")
        if (id === "bunny_jump") {
          this.scene.start("BunnyJump")
          return
        }
        this.scene.start("TaskRun", { taskId: id as TaskId })
      }
    }

    const endlessBtn = root.querySelector("[data-ui=endless]") as HTMLButtonElement | null
    if (endlessBtn) {
      endlessBtn.onclick = () => {
        getAudio().playSfx("confirm")
        this.scene.start("Endless")
      }
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("ModeSelect")
    }
  }
}
