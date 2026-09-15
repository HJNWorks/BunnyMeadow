import Phaser from "phaser"
import { getSave } from "../../core/session"
import { listWorld1Levels } from "../story/levels"
import { mountDomShell, requireEl } from "../../ui/DomShell"

const COMING_SOON = new Set(["w1_3_cart_chase"])

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
        const comingSoon = COMING_SOON.has(level.id)
        const unlocked = !comingSoon && (i === 0 || cleared.has(levels[i - 1].id))
        const done = cleared.has(level.id)
        const detail = comingSoon
          ? "Coming soon"
          : unlocked
            ? level.objective
            : "Clear the previous path first"
        return `
          <button type="button" class="bm-card${comingSoon ? " is-soon" : ""}" data-level="${level.id}" ${unlocked ? "" : "disabled"}>
            <strong>${level.index}. ${level.name}${done ? " ✓" : ""}${comingSoon ? " · Soon" : ""}</strong>
            <span>${detail}</span>
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
        <p class="bm-tagline">Soft paths and hedge walls. Fox Hu waits for another day.</p>
        <div class="bm-grid">${cards}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">Modes</button>
        </div>
      </div>
      <style>
        .bm-card.is-soon { opacity: 0.72; }
        .bm-card.is-soon span { color: #a07a4a; }
      </style>
      `,
    )

    for (const level of levels) {
      const btn = root.querySelector(`[data-level="${level.id}"]`) as HTMLButtonElement | null
      if (!btn || btn.disabled || COMING_SOON.has(level.id)) {
        continue
      }
      btn.onclick = () => this.scene.start("Story", { levelId: level.id })
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      this.scene.start("ModeSelect")
    }
  }
}
