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
  { id: "story_ground_moon", label: "Lunar ground" },
  { id: "story_hedge_moon", label: "Stone column" },
  { id: "story_rim", label: "Crater rim" },
  { id: "story_bowl", label: "Mortar bowl" },
  { id: "story_wound", label: "Cassia wound" },
  { id: "story_cave", label: "Cave rock" },
  { id: "story_sky_moon", label: "Moon sky" },
  { id: "story_far_moon", label: "Moon far" },
]

export function listWorkshopTargets(group: WorkshopGroup = "props"): WorkshopTarget[] {
  if (group === "creatures") {
    return [
      { id: "story_han", label: "Han" },
      { id: "story_still", label: "Still Silver" },
      ...ALL_CRITTERS.filter((id) => id !== "still").map((id) => ({
        id: critterTextureKey(id),
        label: CRITTER_LABELS[id] ?? id,
      })),
    ]
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
