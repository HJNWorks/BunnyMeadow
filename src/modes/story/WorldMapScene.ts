import Phaser from "phaser"
import { getSave } from "../../core/session"
import { listWorld1Levels } from "../story/levels"
import { mountDomShell, requireEl } from "../../ui/DomShell"

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMap")
  }

  create(): void {
    const save = getSave()
    const cleared = new Set(save.progress.story.cleared)
    const levels = listWorld1Levels()

    const cards = levels
      .map((level, i) => {
        const unlocked = i === 0 || cleared.has(levels[i - 1].id)
        const done = cleared.has(level.id)
        return `
          <button type="button" class="bm-card" data-level="${level.id}" ${unlocked ? "" : "disabled"}>
            <strong>${level.index}. ${level.name}${done ? " ✓" : ""}</strong>
            <span>${unlocked ? level.objective : "Clear the previous path first"}</span>
          </button>
        `
      })
      .join("")

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <div class="bm-eyebrow">World 1</div>
        <h1>Meadow and Hedgerows</h1>
        <p class="bm-tagline">Soft paths, hedges, and Fox Hu's cart.</p>
        <div class="bm-grid">${cards}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">Modes</button>
        </div>
      </div>
      `,
    )

    for (const level of levels) {
      const btn = root.querySelector(`[data-level="${level.id}"]`) as HTMLButtonElement | null
      if (!btn || btn.disabled) {
        continue
      }
      btn.onclick = () => this.scene.start("Story", { levelId: level.id })
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      this.scene.start("ModeSelect")
    }
  }
}
