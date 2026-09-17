import { CRITTER_LABELS, ITEM_LABELS, ALL_CRITTERS, ALL_ITEMS } from "../../modes/story/editor/roster"
import { critterTextureKey } from "../../modes/story/shared/enemyKit"
import { itemTextureKey } from "../../modes/story/shared/itemLooks"

export type WorkshopGroup = "props" | "creatures" | "items"

export type WorkshopTarget = {
  id: string
  label: string
}

const PROP_TARGETS: WorkshopTarget[] = [
  { id: "story_hedge", label: "Hedge" },
  { id: "story_ground", label: "Ground" },
  { id: "story_log", label: "Log" },
  { id: "story_player", label: "Mei" },
  { id: "dash_speck", label: "Dash speck" },
]

export function listWorkshopTargets(group: WorkshopGroup = "props"): WorkshopTarget[] {
  if (group === "creatures") {
    return ALL_CRITTERS.map((id) => ({
      id: critterTextureKey(id),
      label: CRITTER_LABELS[id] ?? id,
    }))
  }
  if (group === "items") {
    return ALL_ITEMS.map((id) => ({
      id: itemTextureKey(id),
      label: ITEM_LABELS[id] ?? id,
    }))
  }
  return PROP_TARGETS.map((target) => ({ ...target }))
}

export function workshopGroupTitleKey(group: WorkshopGroup): string {
  if (group === "creatures") {
    return "workshop.tabCreatures"
  }
  if (group === "items") {
    return "workshop.tabItems"
  }
  return "workshop.tabProps"
}
