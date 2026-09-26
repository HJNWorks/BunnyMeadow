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
  carp: "Carp",
  frost_hare: "Frost hare",
  lantern_moth: "Lantern moth",
  frost_wisp: "Frost wisp",
  ice_spit: "Ice spit",
  gale_magpie: "Gale magpie",
  dust_mite: "Dust mite",
  star_wisp: "Star wisp",
  pestle_sentry: "Pestle sentry",
  cassia_grub: "Cassia grub",
  crater_crab: "Crater crab",
  silver_bat: "Silver bat",
  silver_carp: "Silver carp",
  still: "Still Silver",
}

export const ITEM_LABELS: Record<string, string> = {
  carrot: "Carrot",
  mooncake: "Mooncake",
  heart_cake: "Heart cake",
  osmanthus_blossom: "Blossom",
  osmanthus_seed: "Osmanthus seed",
  dew: "Dew",
  sparkler: "Sparkler",
  lantern: "Lantern",
  star_grit: "Star grit",
  elixir_crumb: "Elixir crumb",
  well_silver: "Well silver",
  glide: "Glide",
}

const CRITTERS_BY_BIOME: Record<string, string[]> = {
  meadow: ["fox", "hedgehog", "crow", "bees", "tortoise"],
  orchard: ["fox", "hedgehog", "crow", "squirrel", "bees", "boar"],
  bamboo: ["crow", "squirrel", "frog", "goat", "boar"],
  riverbank: ["crow", "frog", "heron", "tortoise", "carp"],
  lantern: ["crow", "cat", "owl", "lantern_moth"],
  osmanthus: ["cat", "owl", "goat", "lantern_moth"],
  cloudsea: ["frost_wisp", "ice_spit", "gale_magpie", "frost_hare"],
  moon: ["frost_wisp", "lantern_moth", "star_wisp", "dust_mite", "pestle_sentry"],
  ch2_cassia: ["cassia_grub"],
  ch2_mortar: ["cassia_grub", "pestle_sentry", "dust_mite"],
  ch2_dust: ["crater_crab", "dust_mite", "star_wisp"],
  ch2_wells: ["silver_bat", "star_wisp"],
  ch2_silver: ["still", "silver_carp", "star_wisp", "frost_wisp"],
}

const ITEMS_BY_BIOME: Record<string, string[]> = {
  meadow: ["carrot", "osmanthus_seed", "dew"],
  orchard: ["carrot", "mooncake", "dew"],
  bamboo: ["carrot", "lantern"],
  riverbank: ["carrot", "mooncake"],
  lantern: ["carrot", "lantern", "mooncake", "sparkler", "glide"],
  osmanthus: ["carrot", "osmanthus_blossom", "mooncake", "glide"],
  cloudsea: ["carrot", "osmanthus_blossom", "glide"],
  moon: ["mooncake", "heart_cake", "star_grit", "elixir_crumb", "well_silver"],
  ch2_silver: ["mooncake", "heart_cake"],
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
        ids: ["fox", "hedgehog", "crow", "squirrel", "frog", "heron", "cat", "owl", "goat", "bees", "tortoise", "boar", "carp", "lantern_moth"],
      },
      {
        id: "moon",
        labelKey: "editor.critterGroup.moon",
        ids: ["frost_wisp", "ice_spit", "gale_magpie", "frost_hare", "dust_mite", "star_wisp", "pestle_sentry"],
      },
    ],
  },
  {
    id: "ch2",
    labelKey: "story.chapter.ch2.title",
    groups: [
      {
        id: "cassia",
        labelKey: "editor.critterGroup.cassia",
        ids: ["cassia_grub"],
      },
      {
        id: "yard",
        labelKey: "editor.critterGroup.yard",
        ids: ["pestle_sentry"],
      },
      {
        id: "dust",
        labelKey: "editor.critterGroup.dust",
        ids: ["crater_crab"],
      },
      {
        id: "wells",
        labelKey: "editor.critterGroup.wells",
        ids: ["silver_bat"],
      },
      {
        id: "silver",
        labelKey: "editor.critterGroup.silver",
        ids: ["still", "silver_carp"],
      },
    ],
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
  const key = CRITTERS_BY_BIOME[env] ? env : isLunarEnv(env) ? "moon" : env
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
