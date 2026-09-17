import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"
import { writeRepoFile } from "../../core/devWrite"
import { requireEl } from "../../ui/DomShell"
import {
  clearDashOverlay,
  downloadDashJson,
  equippedDashId,
  filterLiveDashParticles,
  listShippedDashes,
  paintDashPreview,
  resolveDashDef,
  setDashOverlay,
  type CanvasDashParticle,
  type DashDef,
} from "./index"
import { getSave } from "../../core/session"

export function dashLookEditorHtml(): string {
  const dashes = listShippedDashes()
  const current = equippedDashId()
  return `
    <h2>${t("editor.dash.title")}</h2>
    <p class="bm-tagline">${t("editor.dash.note")}</p>
    <canvas data-ui="dashPreview" width="220" height="140" aria-label="${t("common.preview")}" style="display:block;margin:0 auto 12px;border-radius:14px;background:#bed593;"></canvas>
    <div class="bm-field">
      <label for="dashId">${t("customize.dash")}</label>
      <select id="dashId" data-ui="dashId">
        ${dashes.map((def) => `<option value="${def.id}" ${def.id === current ? "selected" : ""}>${t(`customize.dash.${def.id}`)}</option>`).join("")}
      </select>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.tint")} <input data-ui="dashTint" type="text" /></label>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.stretch")} <input data-ui="dashStretch" type="number" step="0.02" min="1" max="1.6" /></label>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.afterimages")} <input data-ui="dashGhosts" type="number" min="0" max="4" step="1" /></label>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.shape")}
        <select data-ui="dashShape">
          <option value="speck">speck</option>
          <option value="carrot">carrot</option>
          <option value="streak">streak</option>
          <option value="crescent">crescent</option>
        </select>
      </label>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.count")} <input data-ui="dashCount" type="number" min="0" max="24" /></label>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.life")} <input data-ui="dashLife" type="number" step="0.02" min="0.08" max="1" /></label>
    </div>
    <div class="bm-field">
      <label>${t("editor.dash.color")} <input data-ui="dashColor" type="text" /></label>
    </div>
    <div class="bm-actions bm-start">
      <button type="button" class="bm-btn warm" data-ui="dashActive">${t("editor.setActive")}</button>
      <button type="button" class="bm-btn ghost" data-ui="dashCopy">${t("editor.copyJson")}</button>
      <button type="button" class="bm-btn ghost" data-ui="dashClear">${t("editor.clear")}</button>
    </div>
    <p class="bm-tagline" data-ui="dashStatus"></p>
  `
}

export function bindDashLookEditor(root: ParentNode): () => void {
  const save = getSave()
  const idEl = requireEl<HTMLSelectElement>(root, "[data-ui=dashId]")
  const tintEl = requireEl<HTMLInputElement>(root, "[data-ui=dashTint]")
  const stretchEl = requireEl<HTMLInputElement>(root, "[data-ui=dashStretch]")
  const ghostsEl = requireEl<HTMLInputElement>(root, "[data-ui=dashGhosts]")
  const shapeEl = requireEl<HTMLSelectElement>(root, "[data-ui=dashShape]")
  const countEl = requireEl<HTMLInputElement>(root, "[data-ui=dashCount]")
  const lifeEl = requireEl<HTMLInputElement>(root, "[data-ui=dashLife]")
  const colorEl = requireEl<HTMLInputElement>(root, "[data-ui=dashColor]")
  const preview = requireEl<HTMLCanvasElement>(root, "[data-ui=dashPreview]")
  const status = requireEl<HTMLElement>(root, "[data-ui=dashStatus]")
  const reduced = save.settings.accessibility.reducedMotion
  let particles: CanvasDashParticle[] = []
  let elapsed = 0
  let running = true
  let raf = 0

  const readDef = (): DashDef => {
    const base = resolveDashDef(idEl.value)
    return {
      ...base,
      tint: tintEl.value || base.tint,
      stretchX: Number(stretchEl.value) || base.stretchX,
      afterimages: Math.max(0, Number(ghostsEl.value) || 0),
      particle: {
        ...base.particle,
        shape: shapeEl.value as DashDef["particle"]["shape"],
        count: Math.max(0, Number(countEl.value) || 0),
        life: Number(lifeEl.value) || base.particle.life,
        color: colorEl.value || base.particle.color,
      },
    }
  }

  const fill = (): void => {
    const def = resolveDashDef(idEl.value)
    tintEl.value = def.tint
    stretchEl.value = String(def.stretchX)
    ghostsEl.value = String(def.afterimages)
    shapeEl.value = def.particle.shape
    countEl.value = String(def.particle.count)
    lifeEl.value = String(def.particle.life)
    colorEl.value = def.particle.color
    particles = []
  }

  const cosmetics = {
    fur: save.player.fur,
    ears: save.player.ears,
    accessory: save.player.accessory,
  }

  const loop = (): void => {
    if (!running) {
      return
    }
    const ctx = preview.getContext("2d")
    if (ctx) {
      elapsed += 1 / 60
      particles = filterLiveDashParticles(particles)
      paintDashPreview(ctx, preview.width, preview.height, cosmetics, readDef(), elapsed, reduced, particles)
    }
    raf = window.requestAnimationFrame(loop)
  }

  fill()
  idEl.onchange = fill
  raf = window.requestAnimationFrame(loop)

  requireEl<HTMLButtonElement>(root, "[data-ui=dashActive]").onclick = () => {
    getAudio().playSfx("confirm")
    const def = readDef()
    setDashOverlay(def)
    void writeRepoFile("src/data/dashes.json", `${JSON.stringify({ dashes: listShippedDashes().map((item) => (item.id === def.id ? def : item)) }, null, 2)}\n`).then((ok) => {
      status.textContent = ok ? t("editor.dash.activeDev") : t("editor.dash.activeDone")
    })
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=dashCopy]").onclick = () => {
    getAudio().playSfx("confirm")
    downloadDashJson(readDef())
    status.textContent = t("editor.dash.copyDone")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=dashClear]").onclick = () => {
    getAudio().playSfx("cancel")
    clearDashOverlay(idEl.value)
    fill()
    status.textContent = t("editor.dash.cleared")
  }

  return () => {
    running = false
    window.cancelAnimationFrame(raf)
  }
}
