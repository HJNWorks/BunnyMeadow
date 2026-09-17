export const CRITTER_LABELS: Record<string, string> = {
  fox: "Fox",
  hedgehog: "Hedgehog",
  crow: "Crow",
  squirrel: "Squirrel",
  frog: "Frog",
  heron: "Heron",
  cat: "Cat",
  owl: "Owl",
  goat: "Goat",
  boar: "Boar",
  tortoise: "Tortoise",
  bees: "Bees",
  frost_wisp: "Frost wisp",
  ice_spit: "Ice spit",
  gale_magpie: "Gale magpie",
}

export const ITEM_LABELS: Record<string, string> = {
  carrot: "Carrot",
  mooncake: "Mooncake",
  osmanthus_blossom: "Blossom",
  lantern: "Lantern",
}

const CRITTERS_BY_BIOME: Record<string, string[]> = {
  meadow: ["fox", "hedgehog", "crow", "squirrel", "bees", "tortoise"],
  orchard: ["fox", "hedgehog", "crow", "squirrel", "bees", "boar"],
  bamboo: ["crow", "squirrel", "frog", "goat", "boar"],
  riverbank: ["crow", "frog", "heron", "tortoise"],
  lantern: ["crow", "cat", "owl"],
  osmanthus: ["cat", "owl", "goat"],
  cloudsea: ["frost_wisp", "ice_spit", "gale_magpie"],
  moon: ["frost_wisp", "ice_spit"],
}

const ITEMS_BY_BIOME: Record<string, string[]> = {
  meadow: ["carrot"],
  orchard: ["carrot", "mooncake"],
  bamboo: ["carrot", "lantern"],
  riverbank: ["carrot", "mooncake"],
  lantern: ["carrot", "lantern", "mooncake"],
  osmanthus: ["carrot", "osmanthus_blossom", "mooncake"],
  cloudsea: ["carrot", "osmanthus_blossom"],
  moon: ["carrot", "mooncake"],
}

export const ALL_CRITTERS = Object.keys(CRITTER_LABELS)
export const ALL_ITEMS = Object.keys(ITEM_LABELS)

function splitList(all: string[], native: string[]): { native: string[]; other: string[] } {
  const seen = new Set(native)
  return {
    native: native.filter((id) => all.includes(id)),
    other: all.filter((id) => !seen.has(id)),
  }
}

export function crittersForEnv(env: string): { native: string[]; other: string[] } {
  return splitList(ALL_CRITTERS, CRITTERS_BY_BIOME[env] ?? CRITTERS_BY_BIOME.meadow ?? [])
}

export function itemsForEnv(env: string): { native: string[]; other: string[] } {
  return splitList(ALL_ITEMS, ITEMS_BY_BIOME[env] ?? ITEMS_BY_BIOME.meadow ?? [])
}

export function optionGroupHtml(
  native: string[],
  other: string[],
  labels: Record<string, string>,
  nativeTitle: string,
  otherTitle: string,
): string {
  const opt = (id: string): string =>
    `<option value="${id}">${labels[id] ?? id}</option>`
  return `
    <optgroup label="${nativeTitle}">${native.map(opt).join("")}</optgroup>
    <optgroup label="${otherTitle}">${other.map(opt).join("")}</optgroup>
  `
}
