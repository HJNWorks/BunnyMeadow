import type { SaveV1 } from "./save"
import { applyAccessibilityDom, applyThemeDom } from "./a11y"
import { loadActiveSave, loadSlot, writeMeta, writeSlot } from "./save"

let active: SaveV1 | null = null

export function getSave(): SaveV1 {
  if (!active) {
    throw new Error("Session not loaded")
  }
  return active
}

export function setSave(save: SaveV1): void {
  active = save
  applyAccessibilityDom(save.settings.accessibility)
  applyThemeDom(save.settings.theme)
}

export async function initSession(): Promise<SaveV1> {
  const save = await loadActiveSave()
  setSave(save)
  return save
}

export async function persistSave(): Promise<void> {
  const save = getSave()
  await writeSlot(save)
  await writeMeta({ activeSlot: save.slot })
}

export async function switchSlot(slot: number): Promise<SaveV1> {
  const save = await loadSlot(slot)
  setSave(save)
  await writeMeta({ activeSlot: slot })
  await writeSlot(save)
  return save
}
