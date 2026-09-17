import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"
import { requireEl } from "../../ui/DomShell"
import { getPalette, listPaletteIds } from "../../modes/story/shared/themeKit"
import {
  clearWorkshopTexture,
  getWorkshopTexture,
  listWorkshopTargets,
  setWorkshopTexture,
} from "./overlayStore"

export function workshopHtml(): string {
  return `
    <h2>${t("workshop.title")}</h2>
    <p class="bm-tagline">${t("workshop.note")}</p>
    <canvas data-ui="wsCanvas" width="64" height="72" style="display:block;margin:0 auto 12px;width:192px;height:216px;image-rendering:pixelated;border-radius:8px;background:#2a3d24;cursor:crosshair;"></canvas>
    <div class="bm-field">
      <label>${t("workshop.target")}
        <select data-ui="wsTarget">${listWorkshopTargets().map((id) => `<option value="${id}">${id}</option>`).join("")}</select>
      </label>
    </div>
    <div class="bm-field">
      <label>${t("workshop.palette")}
        <select data-ui="wsPalette">${listPaletteIds().map((id) => `<option value="${id}">${id}</option>`).join("")}</select>
      </label>
    </div>
    <div class="bm-field">
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
    </div>
    <div class="bm-field">
      <label>${t("workshop.size")} <input data-ui="wsSize" type="range" min="1" max="8" value="3" /></label>
    </div>
    <div class="bm-actions bm-start">
      <button type="button" class="bm-btn" data-ui="wsSave">${t("settings.save")}</button>
      <button type="button" class="bm-btn ghost" data-ui="wsDownload">${t("workshop.download")}</button>
      <button type="button" class="bm-btn ghost" data-ui="wsClear">${t("editor.clear")}</button>
    </div>
    <p class="bm-tagline" data-ui="wsStatus"></p>
  `
}

export function bindWorkshop(root: ParentNode): void {
  const canvas = requireEl<HTMLCanvasElement>(root, "[data-ui=wsCanvas]")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return
  }
  ctx.imageSmoothingEnabled = false
  const targetEl = requireEl<HTMLSelectElement>(root, "[data-ui=wsTarget]")
  const paletteEl = requireEl<HTMLSelectElement>(root, "[data-ui=wsPalette]")
  const tokenEl = requireEl<HTMLSelectElement>(root, "[data-ui=wsToken]")
  const sizeEl = requireEl<HTMLInputElement>(root, "[data-ui=wsSize]")
  const status = requireEl<HTMLElement>(root, "[data-ui=wsStatus]")
  let drawing = false

  const color = (): string => {
    const pal = getPalette(paletteEl.value)
    const token = tokenEl.value as keyof typeof pal
    const value = pal[token]
    return typeof value === "string" ? value : pal.accent
  }

  const paint = (e: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)
    const size = Number(sizeEl.value) || 3
    ctx.fillStyle = color()
    ctx.fillRect(x - Math.floor(size / 2), y - Math.floor(size / 2), size, size)
  }

  const load = (): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const data = getWorkshopTexture(targetEl.value)
    if (!data) {
      return
    }
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = data
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
  load()

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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    status.textContent = t("workshop.cleared")
  }
}
