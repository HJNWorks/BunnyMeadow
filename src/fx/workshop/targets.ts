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
  { id: "story_pestle_big", label: "Yard pestle" },
  { id: "story_roller", label: "Cake round" },
  { id: "story_trough", label: "Roller trough" },
  { id: "story_rack", label: "Drying rack" },
  { id: "story_mortar", label: "Yard mortar" },
  { id: "story_screen", label: "Guest screen" },
  { id: "story_chime", label: "Chime stone" },
  { id: "story_chimeframe", label: "Chime frame" },
  { id: "story_moondoor", label: "Moon door" },
  { id: "story_far_outer", label: "Outer Cold far" },
  { id: "story_raft", label: "Star raft plank" },
  { id: "story_crater", label: "Crater" },
  { id: "story_mast", label: "Raft mast" },
  { id: "story_far_dust", label: "Dust Sea far" },
  { id: "story_bark", label: "Bark cut" },
  { id: "story_heartwood", label: "Heartwood" },
  { id: "story_cut", label: "Gold cut" },
  { id: "story_far_cassia", label: "Cassia far" },
  { id: "story_reflection", label: "Reflection lip" },
  { id: "story_stalactite", label: "Stalactite" },
  { id: "story_wellhead", label: "Well head" },
  { id: "story_toad", label: "Moon toad" },
  { id: "story_far_wells", label: "Quiet Wells far" },
  { id: "story_skin", label: "Silver skin" },
  { id: "story_dewplate", label: "Dew-plate immortal" },
  { id: "story_far_silver", label: "Far Silver far" },
  { id: "story_far_mortar", label: "Mortar Yard far" },
]

export function listWorkshopTargets(group: WorkshopGroup = "props"): WorkshopTarget[] {
  if (group === "creatures") {
    return [
      { id: "story_han", label: "Han" },
      { id: "story_still", label: "Still Silver" },
      { id: "story_penghou", label: "Penghou" },
      { id: "story_barkchip", label: "Bark chip" },
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
