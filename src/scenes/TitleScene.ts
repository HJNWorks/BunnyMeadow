import Phaser from "phaser"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { setLanguage, t } from "../core/i18n"
import { getAudio } from "../core/audio"
import { preloadStoryMapArt } from "../modes/story/mapArt"
import type { LanguageId } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { applyThemeDom } from "../core/a11y"

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title")
  }

  create(): void {
    getAudio().playMusic("menu")
    void preloadStoryMapArt()
    const save = getSave()
    const dark = save.settings.theme === "dark"
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-title-utils" aria-label="${t("title.utils")}">
        <button type="button" class="bm-theme" data-ui="theme" aria-pressed="${dark ? "true" : "false"}" aria-label="${t(dark ? "settings.theme.light" : "settings.theme.dark")}">
          <svg class="bm-theme-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M15 3.2A8.2 8.2 0 1 0 20.8 14 7 7 0 0 1 15 3.2z" fill="currentColor"/>
          </svg>
          <svg class="bm-theme-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="currentColor"/>
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M19.2 4.8l-1.6 1.6M6.4 17.6l-1.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
        <label class="bm-title-lang">
          <span class="bm-sr-only">${t("settings.language")}</span>
          <select data-ui="language" aria-label="${t("settings.language")}">
            <option value="en" ${save.settings.language === "en" ? "selected" : ""}>EN</option>
            <option value="de" ${save.settings.language === "de" ? "selected" : ""}>DE</option>
            <option value="zh" ${save.settings.language === "zh" ? "selected" : ""}>中文</option>
          </select>
        </label>
      </div>
      <div class="bm-shell bm-center-text">
        <div class="bm-eyebrow">${t("title.eyebrow")}</div>
        <h1>Bunny Meadow<span>.</span></h1>
        <p class="bm-tagline">${t("title.tagline")}</p>
        <div class="bm-actions">
          <button type="button" class="bm-btn" data-ui="play">${t("title.play")}</button>
          <button type="button" class="bm-btn ghost" data-ui="settings">${t("title.settings")}</button>
          <button type="button" class="bm-btn ghost" data-ui="customize">${t("title.customize")}</button>
          <button type="button" class="bm-btn ghost" data-ui="achievements">${t("title.achievements")}</button>
        </div>
      </div>
      <div class="bm-title-motif" aria-hidden="true"></div>
      <p class="bm-dedication">${t("title.dedication")}</p>
      `,
      { center: true },
    )

    const themeBtn = requireEl<HTMLButtonElement>(root, "[data-ui=theme]")
    themeBtn.onclick = () => {
      getAudio().playSfx("confirm")
      const next = getSave()
      next.settings.theme = next.settings.theme === "dark" ? "light" : "dark"
      applyThemeDom(next.settings.theme)
      const isDark = next.settings.theme === "dark"
      themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false")
      themeBtn.setAttribute("aria-label", t(isDark ? "settings.theme.light" : "settings.theme.dark"))
      void persistSave()
    }

    requireEl<HTMLSelectElement>(root, "[data-ui=language]").onchange = (event) => {
      const select = event.currentTarget as HTMLSelectElement
      const next = getSave()
      next.settings.language = select.value as LanguageId
      setLanguage(next.settings.language)
      void persistSave().then(() => {
        this.scene.restart()
      })
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=play]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("ModeSelect")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=settings]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Settings")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=customize]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Customize")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=achievements]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Achievements")
    }
  }
}
