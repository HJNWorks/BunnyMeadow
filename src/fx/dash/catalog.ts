import dashesData from "../../data/dashes.json"
import { getSave } from "../../core/session"
import { getDashOverlay } from "./overlayStore"
import { DASH_IDS, type DashDef, type DashId } from "./types"

const SHIPPED = (dashesData as { dashes: DashDef[] }).dashes

export function listShippedDashes(): DashDef[] {
  return SHIPPED.map((def) => ({ ...def, particle: { ...def.particle } }))
}

export function getShippedDash(id: string): DashDef | undefined {
  const found = SHIPPED.find((def) => def.id === id)
  return found ? { ...found, particle: { ...found.particle } } : undefined
}

export function resolveDashDef(id: string): DashDef {
  const overlay = getDashOverlay(id)
  if (overlay) {
    return overlay
  }
  return getShippedDash(id) ?? getShippedDash("meadow") ?? SHIPPED[0]
}

export function isDashUnlocked(id: string, achievements: string[] = getSave().progress.achievements): boolean {
  const def = getShippedDash(id) ?? resolveDashDef(id)
  if (!def.unlockAchievement) {
    return true
  }
  return achievements.includes(def.unlockAchievement)
}

export function equippedDashId(saveAchievements: string[] = getSave().progress.achievements): string {
  const raw = getSave().player.equippedDash
  const id = typeof raw === "string" && raw.length > 0 ? raw : "meadow"
  if (isDashUnlocked(id, saveAchievements)) {
    return id
  }
  return "meadow"
}

export function equippedDashDef(): DashDef {
  return resolveDashDef(equippedDashId())
}

export function isDashId(value: string): value is DashId {
  return (DASH_IDS as readonly string[]).includes(value)
}
