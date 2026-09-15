import type { AccessoryOption, EarsOption, FurOption, SaveV1 } from "./save"

const CARROTS_PER_LEVEL = 24

const MAP_UNLOCK_LEVEL: Record<string, number> = {
  meadow_home: 1,
  orchard_rows: 2,
  bamboo_clearing: 3,
  festival_yard: 4,
}

export function addPantryCarrots(save: SaveV1, amount: number): void {
  save.progress.pantryCarrots += amount
  save.progress.pantryLevel = Math.max(
    1,
    Math.floor(save.progress.pantryCarrots / CARROTS_PER_LEVEL) + 1,
  )
  syncMeadowMapUnlocks(save)
}

export function syncMeadowMapUnlocks(save: SaveV1): void {
  const unlocked = new Set(save.progress.meadowMapsUnlocked)
  for (const [id, level] of Object.entries(MAP_UNLOCK_LEVEL)) {
    if (save.progress.pantryLevel >= level) {
      unlocked.add(id)
    }
  }
  save.progress.meadowMapsUnlocked = [...unlocked]
}

export function isMapUnlocked(save: SaveV1, mapId: string): boolean {
  syncMeadowMapUnlocks(save)
  return save.progress.meadowMapsUnlocked.includes(mapId)
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
