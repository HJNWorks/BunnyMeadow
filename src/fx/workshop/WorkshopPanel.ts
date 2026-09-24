import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"
import { requireEl } from "../../ui/DomShell"
import { getPalette, listPaletteIds } from "../../modes/story/shared/themeKit"
import { getEnemyKit } from "../../modes/story/shared/enemyKit"
import { getItemLook } from "../../modes/story/shared/itemLooks"
import { drawBunny } from "../../render/drawBunny"
import { hasStamp, paintStampCentered } from "../../render/stamps"
import {
  clearWorkshopTexture,
  getWorkshopTexture,
  setWorkshopTexture,
} from "./overlayStore"
import { bindItemDemo, type ItemDemo } from "./itemDemo"
import { listWorkshopTargets, workshopGroupTitleKey, type WorkshopGroup } from "./targets"

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function stampPaper(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#efe6c8"
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = "#e4d8b055"
  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      if (((x + y) / 8) % 2 === 0) {
        ctx.fillRect(x, y, 8, 8)
      }
    }
  }
}

function stampTarget(ctx: CanvasRenderingContext2D, id: string): void {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  stampPaper(ctx, width, height)
  if (id === "story_hedge") {
    ctx.fillStyle = "#35532c"
    ctx.fillRect(width * 0.28, height * 0.32, width * 0.44, height * 0.58)
    ellipse(ctx, width * 0.5, height * 0.28, width * 0.38, height * 0.22, "#4d6f3d")
    ellipse(ctx, width * 0.28, height * 0.48, width * 0.24, height * 0.18, "#4d6f3d")
    ellipse(ctx, width * 0.72, height * 0.52, width * 0.26, height * 0.2, "#4d6f3d")
    ellipse(ctx, width * 0.48, height * 0.2, width * 0.2, height * 0.12, "#6f8f52")
    return
  }
  if (id === "story_ground") {
    ctx.fillStyle = "#6a7540"
    ctx.fillRect(4, height * 0.28, width - 8, height * 0.66)
    ctx.fillStyle = "#80924f"
    ctx.fillRect(4, height * 0.28, width - 8, 12)
    ellipse(ctx, 22, height * 0.62, 6, 6, "#556234")
    ellipse(ctx, width - 24, height * 0.74, 5, 5, "#556234")
    return
  }
  if (id === "story_log") {
    ellipse(ctx, width * 0.5, height * 0.55, width * 0.42, height * 0.18, "#8b5a2b")
    ellipse(ctx, width * 0.5, height * 0.52, width * 0.38, height * 0.12, "#a56a38")
    return
  }
  if (id === "story_player") {
    drawBunny(ctx, width * 0.5, height * 0.58, {
      fur: "cream",
      ears: "upright",
      accessory: "none",
    })
    return
  }
  if (id === "story_han") {
    paintStampCentered(ctx, "story_han", width, height, 1.15)
    return
  }
  if (id.startsWith("story_critter_")) {
    const kit = getEnemyKit(id.slice("story_critter_".length))
    paintStampCentered(ctx, kit.source, width, height)
    return
  }
  if (id.startsWith("story_item_")) {
    const look = getItemLook(id.slice("story_item_".length))
    paintStampCentered(ctx, look.source, width, height)
    return
  }
  if (hasStamp(id)) {
    paintStampCentered(ctx, id, width, height)
    return
  }
  ellipse(ctx, width * 0.5, height * 0.5, 10, 10, "#e8f0c8")
}

export function workshopHtml(group: WorkshopGroup): string {
  const options = listWorkshopTargets(group)
    .map((target) => `<option value="${target.id}">${target.label}</option>`)
    .join("")
  const itemHead =
    group === "items"
      ? `
    <div class="bm-workshop-item-head">
      <canvas data-ui="wsCanvas" class="bm-workshop-canvas" width="128" height="144" aria-label="${t("workshop.canvas")}"></canvas>
      <div class="bm-workshop-item-copy">
        <p><strong>${t("workshop.itemStory")}</strong> <span data-ui="wsStory"></span></p>
        <p><strong>${t("workshop.itemEffect")}</strong> <span data-ui="wsEffect"></span></p>
        <canvas data-ui="wsDemo" class="bm-dash-preview" width="280" height="180" aria-label="${t("common.preview")}"></canvas>
        <div class="bm-preview-anim">
          <label class="bm-check">
            <input type="checkbox" data-ui="animStop" checked />
            ${t("customize.anim.stop")}
          </label>
        </div>
      </div>
    </div>`
      : `<canvas data-ui="wsCanvas" class="bm-workshop-canvas" width="128" height="144" aria-label="${t("workshop.canvas")}"></canvas>`
  return `
    <h2>${t(workshopGroupTitleKey(group))}</h2>
    <p class="bm-tagline">${t("workshop.note")}</p>
    ${itemHead}
    <div class="bm-field">
      <label>${t("workshop.target")}
        <select data-ui="wsTarget">${options}</select>
      </label>
    </div>
    <div class="bm-field bm-swatch-row">
      <label>${t("workshop.palette")}
        <select data-ui="wsPalette">${listPaletteIds().map((id) => `<option value="${id}">${id}</option>`).join("")}</select>
      </label>
      <label>${t("workshop.token")}
        <select data-ui="wsToken">
          <option value="sky">sky</option>
          <option value="far">far</option>
          <option value="mid">mid</option>
          <option value="ground">ground</option>
          <option value="accent">accent</option>
          <option value="fog">fog</option>
        </select>
      </label>
      <span class="bm-swatch" data-ui="wsSwatch" aria-hidden="true"></span>
    </div>
    <div class="bm-field">
      <label>${t("workshop.size")} <input data-ui="wsSize" type="range" min="2" max="16" value="6" /></label>
    </div>
    <div class="bm-actions bm-start">
      <button type="button" class="bm-btn" data-ui="wsSave">${t("settings.save")}</button>
      <button type="button" class="bm-btn ghost" data-ui="wsDownload">${t("workshop.download")}</button>
      <button type="button" class="bm-btn ghost" data-ui="wsClear">${t("editor.clear")}</button>
    </div>
    <p class="bm-tagline" data-ui="wsStatus"></p>
  `
}

export function bindWorkshop(root: ParentNode): () => void {
  const canvas = requireEl<HTMLCanvasElement>(root, "[data-ui=wsCanvas]")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return () => undefined
  }
  ctx.imageSmoothingEnabled = false
  const targetEl = requireEl<HTMLSelectElement>(root, "[data-ui=wsTarget]")
  const paletteEl = requireEl<HTMLSelectElement>(root, "[data-ui=wsPalette]")
  const tokenEl = requireEl<HTMLSelectElement>(root, "[data-ui=wsToken]")
  const sizeEl = requireEl<HTMLInputElement>(root, "[data-ui=wsSize]")
  const swatch = requireEl<HTMLElement>(root, "[data-ui=wsSwatch]")
  const status = requireEl<HTMLElement>(root, "[data-ui=wsStatus]")
  const storyEl = root.querySelector<HTMLElement>("[data-ui=wsStory]")
  const effectEl = root.querySelector<HTMLElement>("[data-ui=wsEffect]")
  const demoCanvas = root.querySelector<HTMLCanvasElement>("[data-ui=wsDemo]")
  const stopEl = root.querySelector<HTMLInputElement>("[data-ui=animStop]")
  let drawing = false
  let demo: ItemDemo | null = null
  const itemId = (): string => {
    const raw = targetEl.value
    return raw.startsWith("story_item_") ? raw.slice("story_item_".length) : "carrot"
  }
  const syncCopy = (): void => {
    if (!storyEl || !effectEl) {
      return
    }
    const id = itemId()
    storyEl.textContent = t(`workshop.item.${id}.story`)
    effectEl.textContent = t(`workshop.item.${id}.effect`)
    demo?.repaint()
  }
  if (demoCanvas && stopEl) {
    demo = bindItemDemo(demoCanvas, stopEl, itemId)
  }

  const color = (): string => {
    const pal = getPalette(paletteEl.value)
    const token = tokenEl.value as keyof typeof pal
    const value = pal[token]
    return typeof value === "string" ? value : pal.accent
  }

  const syncSwatch = (): void => {
    swatch.style.background = color()
  }

  const paint = (e: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)
    const size = Number(sizeEl.value) || 6
    ctx.fillStyle = color()
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const load = (): void => {
    stampTarget(ctx, targetEl.value)
    const data = getWorkshopTexture(targetEl.value)
    if (!data) {
      syncSwatch()
      syncCopy()
      return
    }
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = data
    syncSwatch()
    syncCopy()
  }

  canvas.onpointerdown = (e) => {
    drawing = true
    canvas.setPointerCapture(e.pointerId)
    paint(e)
  }
  canvas.onpointermove = (e) => {
    if (drawing) {
      paint(e)
    }
  }
  canvas.onpointerup = () => {
    drawing = false
  }
  targetEl.onchange = load
  paletteEl.onchange = syncSwatch
  tokenEl.onchange = syncSwatch
  load()
  syncCopy()

  requireEl<HTMLButtonElement>(root, "[data-ui=wsSave]").onclick = () => {
    getAudio().playSfx("confirm")
    setWorkshopTexture(targetEl.value, canvas.toDataURL("image/png"))
    status.textContent = t("workshop.saved")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=wsDownload]").onclick = () => {
    getAudio().playSfx("confirm")
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `${targetEl.value}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=wsClear]").onclick = () => {
    getAudio().playSfx("cancel")
    clearWorkshopTexture(targetEl.value)
    stampTarget(ctx, targetEl.value)
    status.textContent = t("workshop.cleared")
  }

  return () => {
    demo?.stop()
  }
}
