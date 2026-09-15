import Phaser from "phaser"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { TaskRunner, type TaskId } from "./TaskRunner"
import { getContentFlags } from "../../core/ModeContext"
import { t } from "../../core/i18n"

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
}

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
          title: def.name,
          desc: def.description,
          icon: TASK_ICONS[id] ?? MEADOW_ICON,
        })
      })
      .join("")

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <div class="bm-eyebrow">Moon Tasks</div>
        <h1>Short hops</h1>
        <p class="bm-tagline">Meadow free-play and short moon goals.</p>
        <div class="bm-grid">${meadowCard}${cards}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">Back</button>
        </div>
      </div>
      `,
    )

    const meadowBtn = root.querySelector("[data-ui=meadow]") as HTMLButtonElement | null
    if (meadowBtn) {
      meadowBtn.onclick = () => this.scene.start("Meadow")
    }

    for (const id of runner.list()) {
      const btn = root.querySelector(`[data-task="${id}"]`) as HTMLButtonElement | null
      if (!btn) {
        continue
      }
      btn.onclick = () => {
        this.scene.start("TaskRun", { taskId: id as TaskId })
      }
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      this.scene.start("ModeSelect")
    }
  }
}
