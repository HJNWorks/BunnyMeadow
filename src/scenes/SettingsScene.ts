import Phaser from "phaser"
import { t, setLanguage } from "../core/i18n"
import { getAudio } from "../core/audio"
import { getPlatform } from "../core/platform"
import type { LanguageId } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { applyAccessibilityDom, applyThemeDom } from "../core/a11y"
import { getInput } from "../core/input"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { isEditorEnabled, startEditor } from "../modes/story/editor"
import { getContentFlags } from "../core/ModeContext"

export class SettingsScene extends Phaser.Scene {
  private returnTo = "Title"
  private returnData: Record<string, unknown> = {}

  constructor() {
    super("Settings")
  }

  init(data?: { returnTo?: string; taskId?: string }): void {
    this.returnTo = data?.returnTo ?? "Title"
    this.returnData = {}
    if (data?.taskId) {
      this.returnData.taskId = data.taskId
    }
  }

  create(): void {
    getAudio().playMusic("menu")
    const save = getSave()
    const showMap = isEditorEnabled()
    const showWorkshop = showMap || getContentFlags().assetWorkshop === true
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell bm-settings">
        <div class="bm-settings-head">
          <h1>${t("settings.title")}</h1>
          <div class="bm-settings-tools">
            <div class="bm-field bm-theme-field">
              <label for="theme">${t("settings.theme")}</label>
              <button type="button" id="theme" class="bm-theme" data-ui="theme" aria-pressed="${save.settings.theme === "dark" ? "true" : "false"}" aria-label="${t(save.settings.theme === "dark" ? "settings.theme.light" : "settings.theme.dark")}">
                <svg class="bm-theme-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M15 3.2A8.2 8.2 0 1 0 20.8 14 7 7 0 0 1 15 3.2z" fill="currentColor"/>
                </svg>
                <svg class="bm-theme-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" fill="currentColor"/>
                  <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M19.2 4.8l-1.6 1.6M6.4 17.6l-1.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="bm-field">
              <label for="language">${t("settings.language")}</label>
              <select id="language" data-ui="language">
                <option value="en" ${save.settings.language === "en" ? "selected" : ""}>English</option>
                <option value="de" ${save.settings.language === "de" ? "selected" : ""}>Deutsch</option>
                <option value="zh" ${save.settings.language === "zh" ? "selected" : ""}>中文</option>
              </select>
            </div>
          </div>
        </div>
        <h2>${t("settings.section.audio")}</h2>
        <div class="bm-settings-audio">
          <div class="bm-field">
            <label>${t("settings.audio.master")} <span data-ui="masterVal">${Math.round(save.settings.audio.master * 100)}</span>%</label>
            <input data-ui="master" type="range" min="0" max="100" value="${Math.round(save.settings.audio.master * 100)}" />
          </div>
          <div class="bm-field">
            <label>${t("settings.audio.music")} <span data-ui="musicVal">${Math.round(save.settings.audio.music * 100)}</span>%</label>
            <input data-ui="music" type="range" min="0" max="100" value="${Math.round(save.settings.audio.music * 100)}" />
          </div>
          <div class="bm-field">
            <label>${t("settings.audio.sfx")} <span data-ui="sfxVal">${Math.round(save.settings.audio.sfx * 100)}</span>%</label>
            <input data-ui="sfx" type="range" min="0" max="100" value="${Math.round(save.settings.audio.sfx * 100)}" />
          </div>
        </div>
        <h2>${t("settings.a11y")}</h2>
        <div class="bm-settings-checks">
        ${(["invincible", "slowTime", "autoDash", "highContrast", "reducedMotion", "largerText", "oneButtonTouch"] as const)
          .map(
            (key) => `
          <label class="bm-check">
            <input type="checkbox" data-a11y="${key}" ${save.settings.accessibility[key] ? "checked" : ""} />
            ${t(`a11y.${key}`)}
          </label>`,
          )
          .join("")}
        </div>
        ${showMap || showWorkshop
          ? `
        <div class="bm-tool-row">
          ${showMap
            ? `
          <section class="bm-tool-card">
            <h2>${t("editor.title")}</h2>
            <p class="bm-tagline">${t("editor.note")}</p>
            <div class="bm-actions bm-start">
              <button type="button" class="bm-btn" data-ui="editorOpen">${t("editor.open")}</button>
            </div>
          </section>
            `
            : ""}
          ${showWorkshop
            ? `
          <section class="bm-tool-card">
            <h2>${t("workshop.title")}</h2>
            <p class="bm-tagline">${t("workshop.cardNote")}</p>
            <div class="bm-actions bm-start">
              <button type="button" class="bm-btn" data-ui="openWorkshop">${t("workshop.open")}</button>
            </div>
          </section>
            `
            : ""}
        </div>
          `
          : ""}
        <h2>${t("settings.section.keys")}</h2>
        <div class="bm-settings-keys">
          <div class="bm-field">
            <label>${t("settings.dashKey")}</label>
            <input data-ui="dashKey" value="${save.settings.bindings.dash[0] ?? "KeyR"}" />
          </div>
          <div class="bm-field">
            <label>${t("settings.jumpKey")}</label>
            <input data-ui="jumpKey" value="${save.settings.bindings.jump[0] ?? "Space"}" />
          </div>
          <div class="bm-field">
            <label>${t("settings.pauseKey")}</label>
            <input data-ui="pauseKey" value="${save.settings.bindings.pause[0] ?? "KeyP"}" />
          </div>
        </div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn" data-ui="fullscreen">${t("settings.fullscreen")}</button>
          <button type="button" class="bm-btn warm" data-ui="save">${t("settings.save")}</button>
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    const bindRange = (ui: string, valUi: string, apply: (n: number) => void): void => {
      const input = requireEl<HTMLInputElement>(root, `[data-ui=${ui}]`)
      const label = requireEl<HTMLElement>(root, `[data-ui=${valUi}]`)
      input.oninput = () => {
        const n = Number(input.value) / 100
        label.textContent = String(Math.round(n * 100))
        apply(n)
      }
    }

    const themeBtn = requireEl<HTMLButtonElement>(root, "[data-ui=theme]")
    themeBtn.onclick = () => {
      getAudio().playSfx("confirm")
      const next = getSave()
      next.settings.theme = next.settings.theme === "dark" ? "light" : "dark"
      applyThemeDom(next.settings.theme)
      const dark = next.settings.theme === "dark"
      themeBtn.setAttribute("aria-pressed", dark ? "true" : "false")
      themeBtn.setAttribute("aria-label", t(dark ? "settings.theme.light" : "settings.theme.dark"))
      void persistSave()
    }

    bindRange("master", "masterVal", (n) => getAudio().setMaster(n))
    bindRange("music", "musicVal", (n) => getAudio().setMusic(n))
    bindRange("sfx", "sfxVal", (n) => getAudio().setSfx(n))

    requireEl<HTMLButtonElement>(root, "[data-ui=fullscreen]").onclick = () => {
      void getPlatform().window.setFullscreen(!getPlatform().window.isFullscreen())
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=save]").onclick = async () => {
      getAudio().playSfx("confirm")
      const next = getSave()
      next.settings.language = requireEl<HTMLSelectElement>(root, "[data-ui=language]")
        .value as LanguageId
      next.settings.audio.master =
        Number(requireEl<HTMLInputElement>(root, "[data-ui=master]").value) / 100
      next.settings.audio.music =
        Number(requireEl<HTMLInputElement>(root, "[data-ui=music]").value) / 100
      next.settings.audio.sfx = Number(requireEl<HTMLInputElement>(root, "[data-ui=sfx]").value) / 100
      for (const key of [
        "invincible",
        "slowTime",
        "autoDash",
        "highContrast",
        "reducedMotion",
        "largerText",
        "oneButtonTouch",
      ] as const) {
        next.settings.accessibility[key] = requireEl<HTMLInputElement>(
          root,
          `[data-a11y=${key}]`,
        ).checked
      }
      next.settings.bindings.dash = [
        requireEl<HTMLInputElement>(root, "[data-ui=dashKey]").value || "KeyR",
      ]
      next.settings.bindings.jump = [
        requireEl<HTMLInputElement>(root, "[data-ui=jumpKey]").value || "Space",
      ]
      next.settings.bindings.pause = [
        requireEl<HTMLInputElement>(root, "[data-ui=pauseKey]").value || "KeyP",
      ]
      setLanguage(next.settings.language)
      getAudio().applyFromSave(next)
      getInput().setBindings(next.settings.bindings)
      applyAccessibilityDom(next.settings.accessibility)
      await persistSave()
      this.scene.restart()
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start(this.returnTo, this.returnData)
    }

    if (showMap) {
      requireEl<HTMLButtonElement>(root, "[data-ui=editorOpen]").onclick = () => {
        getAudio().playSfx("confirm")
        startEditor(this)
      }
    }
    if (showWorkshop) {
      requireEl<HTMLButtonElement>(root, "[data-ui=openWorkshop]").onclick = () => {
        getAudio().playSfx("confirm")
        this.scene.start("AssetWorkshop")
      }
    }
  }
}
