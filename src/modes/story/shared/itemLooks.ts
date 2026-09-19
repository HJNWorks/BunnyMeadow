export type ItemLook = {
  id: string
  texture: string
  source: string
}

const LOOKS: ItemLook[] = [
  { id: "carrot", texture: "story_item_carrot", source: "story_carrot" },
  { id: "mooncake", texture: "story_item_mooncake", source: "story_mooncake" },
  { id: "osmanthus_blossom", texture: "story_item_osmanthus_blossom", source: "story_blossom" },
  { id: "lantern", texture: "story_item_lantern", source: "story_lantern" },
  { id: "star_grit", texture: "story_item_star_grit", source: "story_grit" },
  { id: "elixir_crumb", texture: "story_item_elixir_crumb", source: "story_elixir" },
  { id: "well_silver", texture: "story_item_well_silver", source: "story_silver" },
]

export function itemTextureKey(id: string): string {
  return `story_item_${id}`
}

export function getItemLook(id: string): ItemLook {
  return LOOKS.find((look) => look.id === id) ?? LOOKS[0]!
}

export function listItemLooks(): ItemLook[] {
  return LOOKS.map((look) => ({ ...look }))
}
