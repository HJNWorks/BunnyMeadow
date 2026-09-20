import { isLunarEnv } from "../shared/themeKit"

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
  dust_mite: "Dust mite",
  star_wisp: "Star wisp",
  pestle_sentry: "Pestle sentry",
}

export const ITEM_LABELS: Record<string, string> = {
  carrot: "Carrot",
  mooncake: "Mooncake",
  osmanthus_blossom: "Blossom",
  osmanthus_seed: "Osmanthus seed",
  lantern: "Lantern",
  star_grit: "Star grit",
  elixir_crumb: "Elixir crumb",
  well_silver: "Well silver",
}

const CRITTERS_BY_BIOME: Record<string, string[]> = {
  meadow: ["fox", "hedgehog", "crow", "bees"],
  orchard: ["fox", "hedgehog", "crow", "squirrel", "bees"],
  bamboo: ["crow", "squirrel", "frog", "goat"],
  riverbank: ["crow", "frog", "heron"],
  lantern: ["crow", "cat", "owl"],
  osmanthus: ["cat", "owl", "goat"],
  cloudsea: ["frost_wisp", "ice_spit", "gale_magpie"],
  moon: ["dust_mite", "star_wisp", "pestle_sentry"],
}

const ITEMS_BY_BIOME: Record<string, string[]> = {
  meadow: ["carrot", "osmanthus_seed"],
  orchard: ["carrot", "mooncake"],
  bamboo: ["carrot", "lantern"],
  riverbank: ["carrot", "mooncake"],
  lantern: ["carrot", "lantern", "mooncake"],
  osmanthus: ["carrot", "osmanthus_blossom", "mooncake"],
  cloudsea: ["carrot", "osmanthus_blossom"],
  moon: ["mooncake", "star_grit", "elixir_crumb", "well_silver"],
}

export const ALL_CRITTERS = Object.keys(CRITTER_LABELS)
export const ALL_ITEMS = Object.keys(ITEM_LABELS)

export type CritterGroup = {
  id: string
  labelKey: string
  ids: string[]
}

export type CritterChapter = {
  id: "ch1" | "ch2" | "ch3"
  labelKey: string
  groups: CritterGroup[]
}

export const CRITTER_CHAPTERS: CritterChapter[] = [
  {
    id: "ch1",
    labelKey: "story.chapter.ch1.title",
    groups: [
      {
        id: "path",
        labelKey: "editor.critterGroup.path",
        ids: ["fox", "hedgehog", "crow", "squirrel", "frog", "heron", "cat", "owl", "goat", "bees", "tortoise", "boar"],
      },
      {
        id: "moon",
        labelKey: "editor.critterGroup.moon",
        ids: ["frost_wisp", "ice_spit", "gale_magpie", "dust_mite", "star_wisp", "pestle_sentry"],
      },
    ],
  },
  {
    id: "ch2",
    labelKey: "story.chapter.ch2.title",
    groups: [],
  },
  {
    id: "ch3",
    labelKey: "story.chapter.ch3.title",
    groups: [],
  },
]

export const CRITTER_GROUPS: CritterGroup[] = CRITTER_CHAPTERS.flatMap((chapter) => chapter.groups)

function splitList(all: string[], native: string[]): { native: string[]; other: string[] } {
  const seen = new Set(native)
  return {
    native: native.filter((id) => all.includes(id)),
    other: all.filter((id) => !seen.has(id)),
  }
}

export function crittersForEnv(env: string): { native: string[]; other: string[] } {
  const key = isLunarEnv(env) ? "moon" : env
  return splitList(ALL_CRITTERS, CRITTERS_BY_BIOME[key] ?? CRITTERS_BY_BIOME.meadow ?? [])
}

export function itemsForEnv(env: string): { native: string[]; other: string[] } {
  const key = isLunarEnv(env) ? "moon" : env
  return splitList(ALL_ITEMS, ITEMS_BY_BIOME[key] ?? ITEMS_BY_BIOME.meadow ?? [])
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
