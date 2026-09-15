import type { AccessoryOption, EarsOption, FurOption, SaveV1 } from "./save"

const CARROTS_PER_LEVEL = 24

export function addPantryCarrots(save: SaveV1, amount: number): void {
  save.progress.pantryCarrots += amount
  save.progress.pantryLevel = Math.max(
    1,
    Math.floor(save.progress.pantryCarrots / CARROTS_PER_LEVEL) + 1,
  )
}

export function isFurUnlocked(_save: SaveV1, _fur: FurOption): boolean {
  return true
}

export function isEarsUnlocked(save: SaveV1, ears: EarsOption): boolean {
  if (ears === "upright") {
    return true
  }
  return save.progress.pantryLevel >= 2
}

export function isAccessoryUnlocked(save: SaveV1, accessory: AccessoryOption): boolean {
  if (accessory === "none") {
    return true
  }
  return save.progress.pantryLevel >= 3
}
