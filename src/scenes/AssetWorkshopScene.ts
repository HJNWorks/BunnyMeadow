import Phaser from "phaser"
import { t } from "../core/i18n"
import { getAudio } from "../core/audio"
import { getContentFlags } from "../core/ModeContext"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { isEditorEnabled } from "../modes/story/editor"
import { dashLookEditorHtml, bindDashLookEditor } from "../fx/dash/DashLookPanel"
import { workshopHtml, bindWorkshop } from "../fx/workshop/WorkshopPanel"
import type { WorkshopGroup } from "../fx/workshop/targets"
import { ensureStoryTextures } from "../modes/story/shared/storyTextures"

const TAB_KEY = "bunnymeadow.workshop.tab"

type WorkshopTab = "dash" | WorkshopGroup

function readTab(allowed: WorkshopTab[]): WorkshopTab {
  try {
    const stored = sessionStorage.getItem(TAB_KEY)
    if (stored && allowed.includes(stored as WorkshopTab)) {
      return stored as WorkshopTab
    }
  } catch {
    return allowed[0] ?? "props"
  }
  return allowed[0] ?? "props"
}

function writeTab(id: WorkshopTab): void {
  try {
    sessionStorage.setItem(TAB_KEY, id)
  } catch {
    return
  }
}

export class AssetWorkshopScene extends Phaser.Scene {
  constructor() {
    super("AssetWorkshop")
  }

  create(): void {
    ensureStoryTextures(this)
    getAudio().playMusic("menu")
    const showDash = isEditorEnabled()
    const showBrush = getContentFlags().assetWorkshop === true
    const allowed: WorkshopTab[] = []
    if (showDash) {
      allowed.push("dash")
    }
    if (showBrush) {
      allowed.push("props", "creatures", "items")
    }
    const initial = readTab(allowed)
    const tabBtn = (id: WorkshopTab, label: string): string =>
      `<button type="button" class="bm-btn ${id === initial ? "warm" : "ghost"}" data-tab="${id}" aria-pressed="${id === initial}">${label}</button>`
    const pane = (id: WorkshopTab, body: string): string =>
      `<section class="bm-tool-card bm-workshop-pane" data-pane="${id}" ${id === initial ? "" : "hidden"}>${body}</section>`
    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell bm-wide">
        <h1>${t("workshop.title")}</h1>
        <p class="bm-tagline">${t("workshop.pageNote")}</p>
        <div class="bm-workshop-tabs" role="tablist">
          ${showDash ? tabBtn("dash", t("workshop.tabDash")) : ""}
          ${showBrush ? tabBtn("props", t("workshop.tabProps")) : ""}
          ${showBrush ? tabBtn("creatures", t("workshop.tabCreatures")) : ""}
          ${showBrush ? tabBtn("items", t("workshop.tabItems")) : ""}
        </div>
        <div class="bm-workshop-grid">
          ${showDash ? pane("dash", dashLookEditorHtml()) : ""}
          ${showBrush ? pane("props", workshopHtml("props")) : ""}
          ${showBrush ? pane("creatures", workshopHtml("creatures")) : ""}
          ${showBrush ? pane("items", workshopHtml("items")) : ""}
        </div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    if (showDash) {
      const dashPane = requireEl<HTMLElement>(root, "[data-pane=dash]")
      const stopDash = bindDashLookEditor(dashPane)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, stopDash)
      this.events.once(Phaser.Scenes.Events.DESTROY, stopDash)
    }
    if (showBrush) {
      const stopBrush = [
        bindWorkshop(requireEl(root, "[data-pane=props]")),
        bindWorkshop(requireEl(root, "[data-pane=creatures]")),
        bindWorkshop(requireEl(root, "[data-pane=items]")),
      ]
      const stopAll = (): void => {
        for (const stop of stopBrush) {
          stop()
        }
      }
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, stopAll)
      this.events.once(Phaser.Scenes.Events.DESTROY, stopAll)
    }

    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-tab]"))
    const panes = Array.from(root.querySelectorAll<HTMLElement>("[data-pane]"))
    const show = (id: WorkshopTab): void => {
      writeTab(id)
      for (const btn of buttons) {
        const on = btn.dataset.tab === id
        btn.classList.toggle("warm", on)
        btn.classList.toggle("ghost", !on)
        btn.setAttribute("aria-pressed", on ? "true" : "false")
      }
      for (const card of panes) {
        card.hidden = card.dataset.pane !== id
      }
    }
    for (const btn of buttons) {
      btn.onclick = () => {
        getAudio().playSfx("confirm")
        show((btn.dataset.tab ?? initial) as WorkshopTab)
      }
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("Settings")
    }
  }
}
