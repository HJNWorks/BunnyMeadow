import Phaser from "phaser"
import { getContentFlags } from "../core/ModeContext"
import { t } from "../core/i18n"
import { mountDomShell, requireEl } from "../ui/DomShell"

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super("ModeSelect")
  }

  create(): void {
    const flags = getContentFlags()
    const tasksLive = flags.tasks || flags.meadow
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <div class="bm-eyebrow">Bunny Meadow</div>
        <h1>${t("mode.title")}</h1>
        <div class="bm-grid">
          <button type="button" class="bm-card bm-card-icon" data-ui="story" ${flags.storyWorld1 ? "" : "disabled"}>
            <span class="bm-mode-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
                <path d="M8 36V12l12-4 8 4 12-4v28l-12 4-8-4-12 4z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M20 8v28M28 12v28" stroke="currentColor" stroke-width="2" opacity="0.55"/>
                <circle cx="14" cy="22" r="2.2" fill="currentColor"/>
                <circle cx="34" cy="28" r="2.2" fill="currentColor"/>
              </svg>
            </span>
            <span class="bm-card-copy">
              <strong>${t("mode.story")}</strong>
              <span>${flags.storyWorld1 ? "World 1 · Meadow and Hedgerows" : t("mode.story.desc")}</span>
            </span>
          </button>
          <button type="button" class="bm-card bm-card-icon" data-ui="tasks" ${tasksLive ? "" : "disabled"}>
            <span class="bm-mode-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
                <path d="M10 34c4-10 8-16 14-16s10 6 14 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                <circle cx="24" cy="14" r="5" stroke="currentColor" stroke-width="2.4"/>
                <path d="M18 22c2 3 4 4 6 4s4-1 6-4" stroke="currentColor" stroke-width="2" opacity="0.6"/>
                <path d="M8 38h32" stroke="currentColor" stroke-width="2" opacity="0.35" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="bm-card-copy">
              <strong>${t("mode.tasks")}</strong>
              <span>${tasksLive ? t("mode.tasks.desc") : "Coming soon"}</span>
            </span>
          </button>
          <button type="button" class="bm-card bm-card-icon" data-ui="endless" ${flags.endless ? "" : "disabled"}>
            <span class="bm-mode-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
                <path d="M14 24c0-5 4-9 9-9 3.2 0 5.4 1.4 7 3.6L24 24l6 5.4c-1.6 2.2-3.8 3.6-7 3.6-5 0-9-4-9-9z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M34 24c0 5-4 9-9 9-3.2 0-5.4-1.4-7-3.6L24 24l-6-5.4c1.6-2.2 3.8-3.6 7-3.6 5 0 9 4 9 9z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="bm-card-copy">
              <strong>${t("mode.endless")}</strong>
              <span>${flags.endless ? t("mode.endless.desc") : "Coming soon"}</span>
            </span>
          </button>
        </div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("mode.back")}</button>
        </div>
      </div>
      `,
    )

    requireEl<HTMLButtonElement>(root, "[data-ui=story]").onclick = () => {
      if (flags.storyWorld1) this.scene.start("WorldMap")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=tasks]").onclick = () => {
      if (tasksLive) this.scene.start("TaskSelect")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=endless]").onclick = () => {
      if (flags.endless) this.scene.start("Endless")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("Title")
  }
}
