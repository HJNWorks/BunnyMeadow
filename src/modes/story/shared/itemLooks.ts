export type ItemLook = {
  id: string
  texture: string
  source: string
  tint?: number
}

const LOOKS: ItemLook[] = [
  { id: "carrot", texture: "story_item_carrot", source: "story_carrot" },
  { id: "mooncake", texture: "story_item_mooncake", source: "story_carrot", tint: 0xe8c45a },
  { id: "osmanthus_blossom", texture: "story_item_osmanthus_blossom", source: "story_carrot", tint: 0xf2d4e8 },
  { id: "lantern", texture: "story_item_lantern", source: "story_carrot", tint: 0xf08a3a },
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
