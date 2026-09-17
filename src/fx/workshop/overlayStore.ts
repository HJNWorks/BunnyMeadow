export const WORKSHOP_OVERLAY_KEY = "bunnymeadow.workshop.overlay.v1"

type OverlayFile = {
  v: 1
  textures: Record<string, string>
}

function emptyFile(): OverlayFile {
  return { v: 1, textures: {} }
}

function readFile(): OverlayFile {
  try {
    const raw = localStorage.getItem(WORKSHOP_OVERLAY_KEY)
    if (!raw) {
      return emptyFile()
    }
    const parsed = JSON.parse(raw) as OverlayFile
    if (parsed?.v !== 1 || typeof parsed.textures !== "object" || !parsed.textures) {
      return emptyFile()
    }
    return parsed
  } catch {
    return emptyFile()
  }
}

function writeFile(file: OverlayFile): void {
  localStorage.setItem(WORKSHOP_OVERLAY_KEY, JSON.stringify(file))
}

export function listWorkshopTargets(): string[] {
  return ["story_hedge", "story_ground", "story_log", "story_player", "dash_speck"]
}

export function getWorkshopTexture(id: string): string | undefined {
  return readFile().textures[id]
}

export function setWorkshopTexture(id: string, dataUrl: string): void {
  const file = readFile()
  file.textures[id] = dataUrl
  writeFile(file)
}

export function clearWorkshopTexture(id: string): void {
  const file = readFile()
  delete file.textures[id]
  writeFile(file)
}

export function listWorkshopTextures(): Record<string, string> {
  return { ...readFile().textures }
}
