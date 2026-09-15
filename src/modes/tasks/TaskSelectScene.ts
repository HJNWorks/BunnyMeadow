import Phaser from "phaser"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { TaskRunner, type TaskId } from "./TaskRunner"
import { getSave } from "../../core/session"

export class TaskSelectScene extends Phaser.Scene {
  constructor() {
    super("TaskSelect")
  }

  create(): void {
    const runner = new TaskRunner()
    const completed = new Set(getSave().progress.tasksCompleted)
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
        <p class="bm-tagline">One to three minutes. Same meadow, clearer goals.</p>
        <div class="bm-grid">${cards}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">Back</button>
        </div>
      </div>
      `,
    )

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
