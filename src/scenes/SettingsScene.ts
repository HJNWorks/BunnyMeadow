import Phaser from "phaser"
import { listDifficultyIds } from "../core/difficulty"
import { t, setLanguage } from "../core/i18n"
import { getAudio } from "../core/audio"
import { getPlatform } from "../core/platform"
import type { DifficultyId, LanguageId } from "../core/save"
import { getSave, persistSave } from "../core/session"
import { applyAccessibilityDom } from "../core/a11y"
import { getInput } from "../core/input"
import { mountDomShell, requireEl } from "../ui/DomShell"

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
    const save = getSave()
    const diffs = listDifficultyIds()
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <h1>${t("settings.title")}</h1>
        <div class="bm-field">
          <label for="difficulty">${t("settings.difficulty")}</label>
          <select id="difficulty" data-ui="difficulty">
            ${diffs.map((id) => `<option value="${id}" ${save.settings.difficulty === id ? "selected" : ""}>${id}</option>`).join("")}
          </select>
        </div>
        <div class="bm-field">
          <label for="language">${t("settings.language")}</label>
          <select id="language" data-ui="language">
            <option value="en" ${save.settings.language === "en" ? "selected" : ""}>English</option>
            <option value="de" ${save.settings.language === "de" ? "selected" : ""}>Deutsch</option>
            <option value="zh" ${save.settings.language === "zh" ? "selected" : ""}>中文</option>
          </select>
        </div>
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
        <h2>${t("settings.a11y")}</h2>
        ${(["invincible", "slowTime", "autoDash", "highContrast", "reducedMotion", "largerText", "oneButtonTouch"] as const)
          .map(
            (key) => `
          <label class="bm-check">
            <input type="checkbox" data-a11y="${key}" ${save.settings.accessibility[key] ? "checked" : ""} />
            ${key}
          </label>`,
          )
          .join("")}
        <div class="bm-field">
          <label>Dash key</label>
          <input data-ui="dashKey" value="${save.settings.bindings.dash[0] ?? "KeyR"}" />
        </div>
        <div class="bm-field">
          <label>Jump key</label>
          <input data-ui="jumpKey" value="${save.settings.bindings.jump[0] ?? "Space"}" />
        </div>
        <div class="bm-field">
          <label>Pause key</label>
          <input data-ui="pauseKey" value="${save.settings.bindings.pause[0] ?? "KeyP"}" />
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

    bindRange("master", "masterVal", (n) => getAudio().setMaster(n))
    bindRange("music", "musicVal", (n) => getAudio().setMusic(n))
    bindRange("sfx", "sfxVal", (n) => getAudio().setSfx(n))

    requireEl<HTMLButtonElement>(root, "[data-ui=fullscreen]").onclick = () => {
      void getPlatform().window.setFullscreen(!getPlatform().window.isFullscreen())
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=save]").onclick = async () => {
      const next = getSave()
      next.settings.difficulty = requireEl<HTMLSelectElement>(root, "[data-ui=difficulty]")
        .value as DifficultyId
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

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () =>
      this.scene.start(this.returnTo, this.returnData)
  }
}
