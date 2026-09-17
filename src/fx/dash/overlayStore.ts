import type { DashDef } from "./types"

export const DASH_OVERLAY_KEY = "bunnymeadow.dash.overlay.v1"

type OverlayFile = {
  v: 1
  dashes: Record<string, DashDef>
}

function emptyFile(): OverlayFile {
  return { v: 1, dashes: {} }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function readFile(): OverlayFile {
  try {
    const raw = localStorage.getItem(DASH_OVERLAY_KEY)
    if (!raw) {
      return emptyFile()
    }
    const parsed = JSON.parse(raw) as OverlayFile
    if (parsed?.v !== 1 || typeof parsed.dashes !== "object" || !parsed.dashes) {
      return emptyFile()
    }
    return parsed
  } catch {
    return emptyFile()
  }
}

function writeFile(file: OverlayFile): void {
  localStorage.setItem(DASH_OVERLAY_KEY, JSON.stringify(file))
}

export function getDashOverlay(id: string): DashDef | undefined {
  const entry = readFile().dashes[id]
  return entry ? cloneJson(entry) : undefined
}

export function setDashOverlay(def: DashDef): void {
  const file = readFile()
  file.dashes[def.id] = cloneJson(def)
  writeFile(file)
}

export function clearDashOverlay(id: string): void {
  const file = readFile()
  delete file.dashes[id]
  writeFile(file)
}

export function listDashOverlays(): Record<string, DashDef> {
  return cloneJson(readFile().dashes)
}

export function downloadDashJson(def: DashDef): void {
  const blob = new Blob([`${JSON.stringify(def, null, 2)}\n`], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${def.id}.dash.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
