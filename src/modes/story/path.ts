import type { SaveV1 } from "../../core/save"

export type StoryChapterId = "ch1" | "ch2" | "ch3"

export type Ch1WorldId = "w0" | "w1" | "w2" | "w3" | "w4" | "moon"

export type Ch2WorldId =
  | "ch2_outer"
  | "ch2_cassia"
  | "ch2_mortar"
  | "ch2_dust"
  | "ch2_wells"
  | "ch2_silver"

export type Ch3WorldId =
  | "ch3_shore"
  | "ch3_water"
  | "ch3_ridges"
  | "ch3_peach"
  | "ch3_grotto"
  | "ch3_pool"

export type StoryWorldId = Ch1WorldId | Ch2WorldId | Ch3WorldId

export type StoryStationKind = "lore" | "controls" | "level"

export type StoryWorldStatus = "live" | "soon"

export type StoryChapterStatus = "live" | "soon"

export type StoryChapterNode = {
  id: StoryChapterId
  status: StoryChapterStatus
}

export type StoryStation = {
  id: string
  kind: StoryStationKind
  title: string
  blurb: string
  lines: string[]
  levelId?: string
  soon?: boolean
  loreKeys?: string[]
}

export type StoryWorldNode = {
  id: StoryWorldId
  chapter: StoryChapterId
  world: number | "moon"
  title: string
  tagline: string
  status: StoryWorldStatus
  stationIds: string[]
  x: number
  y: number
}

type WorldDef = Omit<StoryWorldNode, "x" | "y">

const CHAPTERS: StoryChapterNode[] = [
  { id: "ch1", status: "live" },
  { id: "ch2", status: "live" },
  { id: "ch3", status: "live" },
]

const ART_POS: Record<Ch1WorldId, { x: number; y: number }> = {
  w0: { x: 24, y: 78 },
  w1: { x: 24, y: 48 },
  w2: { x: 48, y: 70 },
  w3: { x: 53, y: 33 },
  w4: { x: 78, y: 46 },
  moon: { x: 84, y: 23 },
}

const CH2_ART_POS: Record<Ch2WorldId, { x: number; y: number }> = {
  ch2_outer: { x: 14, y: 72 },
  ch2_cassia: { x: 30, y: 34 },
  ch2_mortar: { x: 50, y: 46 },
  ch2_dust: { x: 74, y: 78 },
  ch2_wells: { x: 82, y: 42 },
  ch2_silver: { x: 88, y: 16 },
}

const CH3_ART_POS: Record<Ch3WorldId, { x: number; y: number }> = {
  ch3_shore: { x: 18, y: 80 },
  ch3_water: { x: 22, y: 42 },
  ch3_ridges: { x: 46, y: 52 },
  ch3_peach: { x: 78, y: 50 },
  ch3_grotto: { x: 52, y: 18 },
  ch3_pool: { x: 86, y: 16 },
}

const STATIONS: Record<string, StoryStation> = {
  w0_setting: {
    id: "w0_setting",
    kind: "lore",
    title: "Burrow Eve",
    blurb: "Mid-Autumn. An osmanthus blossom falls glowing.",
    lines: [
      "Mid-Autumn eve. An osmanthus blossom drifts down glowing.",
      "Yue chases it. Mei watches from the burrow mouth.",
    ],
    loreKeys: ["mid-autumn", "wu-gang"],
  },
  w0_lore_moon: {
    id: "w0_lore_moon",
    kind: "level",
    title: "Moon in the Pool",
    blurb: "Reach the puddle. Hear the Moon. Reach the tiny exit.",
    lines: [],
    levelId: "w0_lore_moon",
    loreKeys: ["change"],
  },
  w0_controls: {
    id: "w0_controls",
    kind: "level",
    title: "Soft Paws",
    blurb: "Creatures, not controls. Hedgehog, fox, bees. Reach the burrow.",
    lines: [],
    levelId: "w0_controls",
  },
  w1_1_soft_paths: {
    id: "w1_1_soft_paths",
    kind: "level",
    title: "Soft Paths",
    blurb: "Reach the burrow. Soft grass remembers soft paws.",
    lines: [],
    levelId: "w1_1_soft_paths",
  },
  w1_2_hedge_maze: {
    id: "w1_2_hedge_maze",
    kind: "level",
    title: "Hedge Maze",
    blurb: "Climb the ledges. Bounce off hedges to keep hopping.",
    lines: [],
    levelId: "w1_2_hedge_maze",
  },
  w1_3_cart_chase: {
    id: "w1_3_cart_chase",
    kind: "level",
    title: "Cart Chase",
    blurb: "Beat Fox Hu's cart to the burrow basket.",
    lines: [],
    levelId: "w1_3_cart_chase",
  },
  w2_1_green_corridor: {
    id: "w2_1_green_corridor",
    kind: "level",
    title: "Green Corridor",
    blurb: "Climb the bamboo shafts. Bounce off the green walls.",
    lines: [],
    levelId: "w2_1_green_corridor",
  },
  w2_2_floating_logs: {
    id: "w2_2_floating_logs",
    kind: "level",
    title: "Floating Logs",
    blurb: "Hop the floating logs. The river carries you gently.",
    lines: [],
    levelId: "w2_2_floating_logs",
  },
  w2_3_raft_gauntlet: {
    id: "w2_3_raft_gauntlet",
    kind: "level",
    title: "Raft Gauntlet",
    blurb: "Two herons stoop over the rafts. The burrow stays open.",
    lines: [],
    levelId: "w2_3_raft_gauntlet",
  },
  w3_1_paper_lights: {
    id: "w3_1_paper_lights",
    kind: "level",
    title: "Paper Lights",
    blurb: "Hold jump to glide between lantern platforms.",
    lines: [],
    levelId: "w3_1_paper_lights",
  },
  w3_2_tiger_road: {
    id: "w3_2_tiger_road",
    kind: "level",
    title: "Tiger Road",
    blurb: "Hop on the tiger. It comes to you, then rides the water gaps.",
    lines: [],
    levelId: "w3_2_tiger_road",
  },
  w3_3_crane_summit: {
    id: "w3_3_crane_summit",
    kind: "level",
    title: "Crane Summit",
    blurb: "Dodge dives. When the Crane bows, ride to the Cloud Stair.",
    lines: [],
    levelId: "w3_3_crane_summit",
  },
  w4_1_first_steps: {
    id: "w4_1_first_steps",
    kind: "level",
    title: "First Steps",
    blurb: "Climb the first cloud steps. One hanging bridge. Soft frost.",
    lines: [],
    levelId: "w4_1_first_steps",
  },
  w4_2_no_return: {
    id: "w4_2_no_return",
    kind: "level",
    title: "No Return",
    blurb: "The stair climbs. No Moon Pool. A fall restarts the station.",
    lines: [],
    levelId: "w4_2_no_return",
  },
  w4_3_closing_gale: {
    id: "w4_3_closing_gale",
    kind: "level",
    title: "Closing Gale",
    blurb: "Reach the palace gate before the storm wall closes.",
    lines: [],
    levelId: "w4_3_closing_gale",
  },
  moon_guanghan: {
    id: "moon_guanghan",
    kind: "level",
    title: "Guanghan",
    blurb: "Duck the frost. Eat a mooncake, then dash Han.",
    lines: [],
    levelId: "moon_guanghan",
  },
  ch2_outer_1_courtyard: {
    id: "ch2_outer_1_courtyard",
    kind: "level",
    title: "Frost Courtyard",
    blurb: "Leave the palace door. Frost is slick.",
    lines: [],
    levelId: "ch2_outer_1_courtyard",
  },
  ch2_outer_2_columns: {
    id: "ch2_outer_2_columns",
    kind: "level",
    title: "Column Walk",
    blurb: "Chime stones between the columns.",
    lines: [],
    levelId: "ch2_outer_2_columns",
  },
  ch2_outer_3_gate: {
    id: "ch2_outer_3_gate",
    kind: "level",
    title: "Guest Gate",
    blurb: "Leave the last courtyard toward the cassia.",
    lines: [],
    levelId: "ch2_outer_3_gate",
  },
  ch2_cassia_1_grove: {
    id: "ch2_cassia_1_grove",
    kind: "level",
    title: "Grove Cut",
    blurb: "Hop the living wood.",
    lines: [],
    levelId: "ch2_cassia_1_grove",
  },
  ch2_cassia_2_closing: {
    id: "ch2_cassia_2_closing",
    kind: "level",
    title: "Closing Gap",
    blurb: "Hop before the cut slides shut.",
    lines: [],
    levelId: "ch2_cassia_2_closing",
  },
  ch2_cassia_3_core: {
    id: "ch2_cassia_3_core",
    kind: "level",
    title: "Gold Core",
    blurb: "The heartwood keeps a spirit. Close its gold cuts.",
    lines: [],
    levelId: "ch2_cassia_3_core",
  },
  ch2_mortar_1_bowls: {
    id: "ch2_mortar_1_bowls",
    kind: "level",
    title: "Stone Bowls",
    blurb: "Hop the bowl rims. Pound, do not cook.",
    lines: [],
    levelId: "ch2_mortar_1_bowls",
  },
  ch2_mortar_2_pestle: {
    id: "ch2_mortar_2_pestle",
    kind: "level",
    title: "Pestle Beat",
    blurb: "Wait the pestle. Then hop.",
    lines: [],
    levelId: "ch2_mortar_2_pestle",
  },
  ch2_mortar_3_rounds: {
    id: "ch2_mortar_3_rounds",
    kind: "level",
    title: "Cake Rounds",
    blurb: "Hop cake rounds across the yard.",
    lines: [],
    levelId: "ch2_mortar_3_rounds",
  },
  ch2_dust_1_rims: {
    id: "ch2_dust_1_rims",
    kind: "level",
    title: "Rim Walk",
    blurb: "Keep to the rims. The dust tide carries you.",
    lines: [],
    levelId: "ch2_dust_1_rims",
  },
  ch2_dust_2_lips: {
    id: "ch2_dust_2_lips",
    kind: "level",
    title: "Lip Gap",
    blurb: "Wide gaps, tides, and breathing vents.",
    lines: [],
    levelId: "ch2_dust_2_lips",
  },
  ch2_dust_3_wreck: {
    id: "ch2_dust_3_wreck",
    kind: "level",
    title: "Raft Wreck",
    blurb: "Planks over the dust. The star raft wreck.",
    lines: [],
    levelId: "ch2_dust_3_wreck",
  },
  ch2_wells_1_mouths: {
    id: "ch2_wells_1_mouths",
    kind: "level",
    title: "Cave Mouths",
    blurb: "Well silver lights the real lips. Still water only reflects.",
    lines: [],
    levelId: "ch2_wells_1_mouths",
  },
  ch2_wells_2_false: {
    id: "ch2_wells_2_false",
    kind: "level",
    title: "False Lip",
    blurb: "Reflections everywhere. Silver rests on real stone.",
    lines: [],
    levelId: "ch2_wells_2_false",
  },
  ch2_wells_3_silver: {
    id: "ch2_wells_3_silver",
    kind: "level",
    title: "Well Silver",
    blurb: "Long dark lips. The moon toad by the last well.",
    lines: [],
    levelId: "ch2_wells_3_silver",
  },
  ch2_silver_1_basin: {
    id: "ch2_silver_1_basin",
    kind: "level",
    title: "Quiet Basin",
    blurb: "Silver skin over still water. The bronze immortal holds its plate.",
    lines: [],
    levelId: "ch2_silver_1_basin",
  },
  ch2_silver_2_steps: {
    id: "ch2_silver_2_steps",
    kind: "level",
    title: "Silver Steps",
    blurb: "Stone steps and silver steps. Do not stop on silver.",
    lines: [],
    levelId: "ch2_silver_2_steps",
  },
  ch2_silver_3_one_pool: {
    id: "ch2_silver_3_one_pool",
    kind: "level",
    title: "One Moon Pool",
    blurb: "Still Silver keeps the first true pool.",
    lines: [],
    levelId: "ch2_silver_3_one_pool",
  },
}

const WORLD_DEFS: WorldDef[] = [
  {
    id: "w0",
    chapter: "ch1",
    world: 0,
    title: "Burrow Eve",
    tagline: "Setting, moon lore, and soft paws.",
    status: "live",
    stationIds: ["w0_setting", "w0_lore_moon", "w0_controls"],
  },
  {
    id: "w1",
    chapter: "ch1",
    world: 1,
    title: "Meadow and Hedgerows",
    tagline: "Soft paths, hedges, and Fox Hu's cart.",
    status: "live",
    stationIds: ["w1_1_soft_paths", "w1_2_hedge_maze", "w1_3_cart_chase"],
  },
  {
    id: "w2",
    chapter: "ch1",
    world: 2,
    title: "Bamboo and River",
    tagline: "Dusk water and tall green walls.",
    status: "live",
    stationIds: ["w2_1_green_corridor", "w2_2_floating_logs", "w2_3_raft_gauntlet"],
  },
  {
    id: "w3",
    chapter: "ch1",
    world: 3,
    title: "Lantern Peak",
    tagline: "Festival lights and a tiger road.",
    status: "live",
    stationIds: ["w3_1_paper_lights", "w3_2_tiger_road", "w3_3_crane_summit"],
  },
  {
    id: "w4",
    chapter: "ch1",
    world: 4,
    title: "Cloud Stair",
    tagline: "Wind, frost, and the last walk before the palace.",
    status: "live",
    stationIds: ["w4_1_first_steps", "w4_2_no_return", "w4_3_closing_gale"],
  },
  {
    id: "moon",
    chapter: "ch1",
    world: "moon",
    title: "Guanghan Palace",
    tagline: "Vast Cold. Duck, eat, dash Han.",
    status: "live",
    stationIds: ["moon_guanghan"],
  },
  {
    id: "ch2_outer",
    chapter: "ch2",
    world: 1,
    title: "Outer Cold",
    tagline: "Palace gardens. The cold still holds.",
    status: "live",
    stationIds: ["ch2_outer_1_courtyard", "ch2_outer_2_columns", "ch2_outer_3_gate"],
  },
  {
    id: "ch2_cassia",
    chapter: "ch2",
    world: 2,
    title: "Cassia Wound",
    tagline: "The tree will not stay cut.",
    status: "live",
    stationIds: ["ch2_cassia_1_grove", "ch2_cassia_2_closing", "ch2_cassia_3_core"],
  },
  {
    id: "ch2_mortar",
    chapter: "ch2",
    world: 3,
    title: "Mortar Yard",
    tagline: "Pestle and cakes. Not a kitchen.",
    status: "live",
    stationIds: ["ch2_mortar_1_bowls", "ch2_mortar_2_pestle", "ch2_mortar_3_rounds"],
  },
  {
    id: "ch2_dust",
    chapter: "ch2",
    world: 4,
    title: "Dust Sea",
    tagline: "Crater rims and pale dust.",
    status: "live",
    stationIds: ["ch2_dust_1_rims", "ch2_dust_2_lips", "ch2_dust_3_wreck"],
  },
  {
    id: "ch2_wells",
    chapter: "ch2",
    world: 5,
    title: "Quiet Wells",
    tagline: "Cave mouths and still water.",
    status: "live",
    stationIds: ["ch2_wells_1_mouths", "ch2_wells_2_false", "ch2_wells_3_silver"],
  },
  {
    id: "ch2_silver",
    chapter: "ch2",
    world: 6,
    title: "Far Silver",
    tagline: "A quiet basin under the moon.",
    status: "live",
    stationIds: ["ch2_silver_1_basin", "ch2_silver_2_steps", "ch2_silver_3_one_pool"],
  },
  {
    id: "ch3_shore",
    chapter: "ch3",
    world: 1,
    title: "Other Shore",
    tagline: "Inverted silver sky. Not Earth.",
    status: "soon",
    stationIds: [],
  },
  {
    id: "ch3_water",
    chapter: "ch3",
    world: 2,
    title: "Weak Water",
    tagline: "Nothing floats. Stone fords.",
    status: "soon",
    stationIds: [],
  },
  {
    id: "ch3_ridges",
    chapter: "ch3",
    world: 3,
    title: "Hanging Ridges",
    tagline: "Cliffs and copper pins.",
    status: "soon",
    stationIds: [],
  },
  {
    id: "ch3_peach",
    chapter: "ch3",
    world: 4,
    title: "Peach Rows",
    tagline: "Blossom. Not osmanthus.",
    status: "soon",
    stationIds: [],
  },
  {
    id: "ch3_grotto",
    chapter: "ch3",
    world: 5,
    title: "Grotto Heaven",
    tagline: "Jade caves. Mass above.",
    status: "soon",
    stationIds: [],
  },
  {
    id: "ch3_pool",
    chapter: "ch3",
    world: 6,
    title: "West Pool",
    tagline: "One still pool.",
    status: "soon",
    stationIds: [],
  },
]

function isCh2World(id: StoryWorldId): id is Ch2WorldId {
  return id.startsWith("ch2_")
}

function isCh3World(id: StoryWorldId): id is Ch3WorldId {
  return id.startsWith("ch3_")
}

function posFor(id: StoryWorldId): { x: number; y: number } | undefined {
  if (isCh3World(id)) {
    return CH3_ART_POS[id]
  }
  if (isCh2World(id)) {
    return CH2_ART_POS[id]
  }
  return ART_POS[id]
}

function positionedWorlds(chapter: StoryChapterId = "ch1"): StoryWorldNode[] {
  return WORLD_DEFS.filter((def) => def.chapter === chapter).flatMap((def) => {
    const pos = posFor(def.id)
    if (!pos) {
      return []
    }
    return [{ ...def, x: pos.x, y: pos.y }]
  })
}

const W0_IDS = ["w0_setting", "w0_lore_moon", "w0_controls"] as const
const W1_CHAIN = ["w1_1_soft_paths", "w1_2_hedge_maze", "w1_3_cart_chase"] as const
const W2_CHAIN = ["w2_1_green_corridor", "w2_2_floating_logs", "w2_3_raft_gauntlet"] as const
const W3_CHAIN = ["w3_1_paper_lights", "w3_2_tiger_road", "w3_3_crane_summit"] as const
const W4_CHAIN = ["w4_1_first_steps", "w4_2_no_return", "w4_3_closing_gale"] as const
const MOON_CHAIN = ["moon_guanghan"] as const
const CH2_OUTER = ["ch2_outer_1_courtyard", "ch2_outer_2_columns", "ch2_outer_3_gate"] as const
const CH2_CASSIA = ["ch2_cassia_1_grove", "ch2_cassia_2_closing", "ch2_cassia_3_core"] as const
const CH2_MORTAR = ["ch2_mortar_1_bowls", "ch2_mortar_2_pestle", "ch2_mortar_3_rounds"] as const
const CH2_DUST = ["ch2_dust_1_rims", "ch2_dust_2_lips", "ch2_dust_3_wreck"] as const
const CH2_WELLS = ["ch2_wells_1_mouths", "ch2_wells_2_false", "ch2_wells_3_silver"] as const
const CH2_SILVER = ["ch2_silver_1_basin", "ch2_silver_2_steps", "ch2_silver_3_one_pool"] as const

function worldPlayableCleared(save: SaveV1, ids: readonly string[]): boolean {
  const cleared = new Set(save.progress.story.cleared)
  return ids.every((id) => cleared.has(id))
}

export function listChapters(): StoryChapterNode[] {
  return [...CHAPTERS]
}

export function chapterOfWorld(worldId: StoryWorldId): StoryChapterId {
  const world = WORLD_DEFS.find((entry) => entry.id === worldId)
  return world?.chapter ?? "ch1"
}

export function worldIdForLevelId(id: string): StoryWorldId {
  if (id.startsWith("ch3_shore")) {
    return "ch3_shore"
  }
  if (id.startsWith("ch3_water")) {
    return "ch3_water"
  }
  if (id.startsWith("ch3_ridges")) {
    return "ch3_ridges"
  }
  if (id.startsWith("ch3_peach")) {
    return "ch3_peach"
  }
  if (id.startsWith("ch3_grotto")) {
    return "ch3_grotto"
  }
  if (id.startsWith("ch3_pool")) {
    return "ch3_pool"
  }
  if (id.startsWith("ch2_outer")) {
    return "ch2_outer"
  }
  if (id.startsWith("ch2_cassia")) {
    return "ch2_cassia"
  }
  if (id.startsWith("ch2_mortar")) {
    return "ch2_mortar"
  }
  if (id.startsWith("ch2_dust")) {
    return "ch2_dust"
  }
  if (id.startsWith("ch2_wells")) {
    return "ch2_wells"
  }
  if (id.startsWith("ch2_silver")) {
    return "ch2_silver"
  }
  if (id.startsWith("moon")) {
    return "moon"
  }
  if (id.startsWith("w0_")) {
    return "w0"
  }
  if (id.startsWith("w1_")) {
    return "w1"
  }
  if (id.startsWith("w2_")) {
    return "w2"
  }
  if (id.startsWith("w3_")) {
    return "w3"
  }
  if (id.startsWith("w4_")) {
    return "w4"
  }
  return "w0"
}

function devOpen(save: SaveV1): boolean {
  return save.progress.story.devUnlockAll === true
}

export function isChapterUnlocked(save: SaveV1, chapter: StoryChapterId): boolean {
  if (chapter === "ch1") {
    return true
  }
  if (devOpen(save) && (chapter === "ch2" || chapter === "ch3")) {
    return true
  }
  if (chapter === "ch2") {
    return worldPlayableCleared(save, MOON_CHAIN)
  }
  if (chapter === "ch3") {
    return save.progress.story.cleared.includes("ch2_silver_3_one_pool")
  }
  return false
}

export function listWorlds(chapter: StoryChapterId = "ch1"): StoryWorldNode[] {
  return positionedWorlds(chapter)
}

export function listAllWorlds(): StoryWorldNode[] {
  return [...listWorlds("ch1"), ...listWorlds("ch2"), ...listWorlds("ch3")]
}

export function findOverlappingWorldNodes(
  frameW = 980,
  frameH = 420,
  cardW = 160,
  cardH = 96,
  chapter: StoryChapterId = "ch1",
): string[] {
  const worlds = positionedWorlds(chapter)
  const halfW = (cardW / frameW) * 50
  const halfH = (cardH / frameH) * 50
  const hits: string[] = []
  for (let i = 0; i < worlds.length; i += 1) {
    for (let j = i + 1; j < worlds.length; j += 1) {
      const a = worlds[i]
      const b = worlds[j]
      const overlapX = Math.abs(a.x - b.x) < halfW * 2
      const overlapY = Math.abs(a.y - b.y) < halfH * 2
      if (overlapX && overlapY) {
        hits.push(`${a.title} overlaps ${b.title} (dx=${Math.abs(a.x - b.x).toFixed(1)} dy=${Math.abs(a.y - b.y).toFixed(1)})`)
      }
    }
  }
  return hits
}

export function getWorld(id: StoryWorldId): StoryWorldNode | undefined {
  return listAllWorlds().find((world) => world.id === id)
}

export function getStation(id: string): StoryStation | undefined {
  return STATIONS[id]
}

export function listStations(worldId: StoryWorldId): StoryStation[] {
  const world = WORLD_DEFS.find((entry) => entry.id === worldId)
  if (!world) {
    return []
  }
  return world.stationIds.map((id) => STATIONS[id]).filter(Boolean)
}

export function isW0Complete(save: SaveV1): boolean {
  const cleared = new Set(save.progress.story.cleared)
  return W0_IDS.every((id) => cleared.has(id))
}

export function isWorldUnlocked(save: SaveV1, worldId: StoryWorldId): boolean {
  const world = WORLD_DEFS.find((entry) => entry.id === worldId)
  if (!world) {
    return false
  }
  if (world.status === "soon") {
    return false
  }
  if (devOpen(save)) {
    return true
  }
  if (worldId === "w0") {
    return true
  }
  if (worldId === "w1") {
    return isW0Complete(save)
  }
  if (worldId === "w2") {
    return isW0Complete(save) && worldPlayableCleared(save, W1_CHAIN)
  }
  if (worldId === "w3") {
    return isW0Complete(save) && worldPlayableCleared(save, W2_CHAIN)
  }
  if (worldId === "w4") {
    return isW0Complete(save) && worldPlayableCleared(save, W3_CHAIN)
  }
  if (worldId === "moon") {
    return isW0Complete(save) && worldPlayableCleared(save, W4_CHAIN)
  }
  if (worldId === "ch2_outer") {
    return isChapterUnlocked(save, "ch2")
  }
  if (worldId === "ch2_cassia") {
    return isChapterUnlocked(save, "ch2") && worldPlayableCleared(save, CH2_OUTER)
  }
  if (worldId === "ch2_mortar") {
    return isChapterUnlocked(save, "ch2") && worldPlayableCleared(save, CH2_CASSIA)
  }
  if (worldId === "ch2_dust") {
    return isChapterUnlocked(save, "ch2") && worldPlayableCleared(save, CH2_MORTAR)
  }
  if (worldId === "ch2_wells") {
    return isChapterUnlocked(save, "ch2") && worldPlayableCleared(save, CH2_DUST)
  }
  if (worldId === "ch2_silver") {
    return isChapterUnlocked(save, "ch2") && worldPlayableCleared(save, CH2_WELLS)
  }
  return false
}

function previousInChain(ids: readonly string[], stationId: string): string | null {
  const index = ids.indexOf(stationId)
  if (index <= 0) {
    return null
  }
  return ids[index - 1]
}

export function isStationUnlocked(save: SaveV1, stationId: string): boolean {
  const station = getStation(stationId)
  if (!station || station.soon) {
    return false
  }
  if (devOpen(save)) {
    return true
  }
  const cleared = new Set(save.progress.story.cleared)
  if (stationId.startsWith("w0_")) {
    const prev = previousInChain(W0_IDS, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("ch2_")) {
    if (!isChapterUnlocked(save, "ch2")) {
      return false
    }
    if (stationId.startsWith("ch2_outer")) {
      const prev = previousInChain(CH2_OUTER, stationId)
      return prev === null || cleared.has(prev)
    }
    if (stationId.startsWith("ch2_cassia")) {
      if (!worldPlayableCleared(save, CH2_OUTER)) {
        return false
      }
      const prev = previousInChain(CH2_CASSIA, stationId)
      return prev === null || cleared.has(prev)
    }
    if (stationId.startsWith("ch2_mortar")) {
      if (!worldPlayableCleared(save, CH2_CASSIA)) {
        return false
      }
      const prev = previousInChain(CH2_MORTAR, stationId)
      return prev === null || cleared.has(prev)
    }
    if (stationId.startsWith("ch2_dust")) {
      if (!worldPlayableCleared(save, CH2_MORTAR)) {
        return false
      }
      const prev = previousInChain(CH2_DUST, stationId)
      return prev === null || cleared.has(prev)
    }
    if (stationId.startsWith("ch2_wells")) {
      if (!worldPlayableCleared(save, CH2_DUST)) {
        return false
      }
      const prev = previousInChain(CH2_WELLS, stationId)
      return prev === null || cleared.has(prev)
    }
    if (stationId.startsWith("ch2_silver")) {
      if (!worldPlayableCleared(save, CH2_WELLS)) {
        return false
      }
      const prev = previousInChain(CH2_SILVER, stationId)
      return prev === null || cleared.has(prev)
    }
    return false
  }
  if (!isW0Complete(save)) {
    return false
  }
  if (stationId.startsWith("w1_")) {
    const prev = previousInChain(W1_CHAIN, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("w2_")) {
    if (!worldPlayableCleared(save, W1_CHAIN)) {
      return false
    }
    const prev = previousInChain(W2_CHAIN, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("w3_")) {
    if (!worldPlayableCleared(save, W2_CHAIN)) {
      return false
    }
    const prev = previousInChain(W3_CHAIN, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("w4_")) {
    if (!worldPlayableCleared(save, W3_CHAIN)) {
      return false
    }
    const prev = previousInChain(W4_CHAIN, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("moon_")) {
    if (!worldPlayableCleared(save, W4_CHAIN)) {
      return false
    }
    const prev = previousInChain(MOON_CHAIN, stationId)
    return prev === null || cleared.has(prev)
  }
  return false
}

export function isStationCleared(save: SaveV1, stationId: string): boolean {
  return save.progress.story.cleared.includes(stationId)
}

export function worldClearCount(save: SaveV1, worldId: StoryWorldId): { done: number; total: number } {
  const stations = listStations(worldId)
  const playable = stations.filter((station) => !station.soon)
  const done = playable.filter((station) => isStationCleared(save, station.id)).length
  return { done, total: playable.length }
}

export function ensureStoryPathProgress(save: SaveV1): boolean {
  const cleared = save.progress.story.cleared
  const hasW1 = cleared.some((id) => id.startsWith("w1_"))
  if (!hasW1) {
    return false
  }
  let changed = false
  for (const id of W0_IDS) {
    if (!cleared.includes(id)) {
      cleared.push(id)
      changed = true
    }
  }
  return changed
}

export function defaultExpandedWorld(save: SaveV1): StoryWorldId {
  if (!isW0Complete(save)) {
    return "w0"
  }
  if (!worldPlayableCleared(save, W1_CHAIN)) {
    return "w1"
  }
  if (!worldPlayableCleared(save, W2_CHAIN)) {
    return "w2"
  }
  if (!worldPlayableCleared(save, W3_CHAIN)) {
    return "w3"
  }
  if (!worldPlayableCleared(save, W4_CHAIN)) {
    return "w4"
  }
  if (!worldPlayableCleared(save, MOON_CHAIN)) {
    return "moon"
  }
  if (!worldPlayableCleared(save, CH2_OUTER)) {
    return "ch2_outer"
  }
  if (!worldPlayableCleared(save, CH2_CASSIA)) {
    return "ch2_cassia"
  }
  if (!worldPlayableCleared(save, CH2_MORTAR)) {
    return "ch2_mortar"
  }
  if (!worldPlayableCleared(save, CH2_DUST)) {
    return "ch2_dust"
  }
  if (!worldPlayableCleared(save, CH2_WELLS)) {
    return "ch2_wells"
  }
  if (!worldPlayableCleared(save, CH2_SILVER)) {
    return "ch2_silver"
  }
  return "ch2_silver"
}

export function storyClockChapters(): { id: StoryChapterId; stations: { id: string; title: string }[] }[] {
  const chapters: StoryChapterId[] = ["ch1", "ch2", "ch3"]
  return chapters.map((id) => ({
    id,
    stations: WORLD_DEFS.filter((world) => world.chapter === id && world.status === "live")
      .flatMap((world) => world.stationIds)
      .map((stationId) => STATIONS[stationId])
      .filter((station): station is NonNullable<typeof station> => station?.kind === "level")
      .map((station) => ({ id: station.id, title: station.title })),
  }))
}
