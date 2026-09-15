import Phaser from "phaser"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { TaskRunner, type TaskId } from "./TaskRunner"
import { getSave } from "../../core/session"
import { getContentFlags } from "../../core/ModeContext"
import { t } from "../../core/i18n"

export class TaskSelectScene extends Phaser.Scene {
  constructor() {
    super("TaskSelect")
  }

  create(): void {
    const flags = getContentFlags()
    const runner = new TaskRunner()
    const completed = new Set(getSave().progress.tasksCompleted)

    const meadowCard = flags.meadow
      ? `
          <button type="button" class="bm-card bm-card-icon" data-ui="meadow">
            <span class="bm-mode-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
                <path d="M8 34c6-4 10-12 16-12s10 8 16 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                <circle cx="24" cy="18" r="7" stroke="currentColor" stroke-width="2.4"/>
                <path d="M20 17h.01M28 17h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                <path d="M12 38h24" stroke="currentColor" stroke-width="2" opacity="0.35" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="bm-card-copy">
              <strong>${t("mode.meadow")}</strong>
              <span>${t("mode.meadow.desc")}</span>
            </span>
          </button>
        `
      : ""

    const cards = runner
      .list()
      .map((id) => {
        const def = runner.getDef(id)
        if (!def) {
          return ""
        }
        const done = completed.has(id)
        return `
          <button type="button" class="bm-card" data-task="${id}">
            <strong>${def.name}${done ? " ✓" : ""}</strong>
            <span>${def.description}</span>
          </button>
        `
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
