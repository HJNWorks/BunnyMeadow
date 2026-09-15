import type { SaveV1 } from "../../core/save"

export type StoryWorldId = "w0" | "w1" | "w2" | "w3" | "moon"

export type StoryStationKind = "lore" | "controls" | "level"

export type StoryWorldStatus = "live" | "soon"

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
  world: number | "moon"
  title: string
  tagline: string
  status: StoryWorldStatus
  stationIds: string[]
  x: number
  y: number
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
    kind: "lore",
    title: "Moon in the Pool",
    blurb: "Chang'e answers through the water.",
    lines: [
      "Mei runs to the pond. Chang'e answers through the water.",
      "Follow the blossoms. Each night I will light a pool for you.",
    ],
    loreKeys: ["change"],
  },
  w0_controls: {
    id: "w0_controls",
    kind: "level",
    title: "Soft Paws",
    blurb: "In-game intro: move, jump, dash, then the burrow.",
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
    blurb: "Fox Hu's carrot cart waits.",
    lines: [],
    levelId: "w1_3_cart_chase",
    soon: true,
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
    blurb: "Heron Fisher waits on the rafts.",
    lines: [],
    levelId: "w2_3_raft_gauntlet",
    soon: true,
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
    blurb: "Ride the tiger across the gaps. Hop when you must.",
    lines: [],
    levelId: "w3_2_tiger_road",
  },
  w3_3_crane_summit: {
    id: "w3_3_crane_summit",
    kind: "level",
    title: "Crane Summit",
    blurb: "The Crane Envoy waits above the blossoms.",
    lines: [],
    levelId: "w3_3_crane_summit",
    soon: true,
  },
}

const WORLDS: StoryWorldNode[] = [
  {
    id: "w0",
    world: 0,
    title: "Burrow Eve",
    tagline: "Setting, moon lore, and soft controls.",
    status: "live",
    stationIds: ["w0_setting", "w0_lore_moon", "w0_controls"],
    x: 12,
    y: 72,
  },
  {
    id: "w1",
    world: 1,
    title: "Meadow and Hedgerows",
    tagline: "Soft paths, hedges, and Fox Hu's cart.",
    status: "live",
    stationIds: ["w1_1_soft_paths", "w1_2_hedge_maze", "w1_3_cart_chase"],
    x: 32,
    y: 58,
  },
  {
    id: "w2",
    world: 2,
    title: "Bamboo and River",
    tagline: "Dusk water and tall green walls.",
    status: "live",
    stationIds: ["w2_1_green_corridor", "w2_2_floating_logs", "w2_3_raft_gauntlet"],
    x: 52,
    y: 44,
  },
  {
    id: "w3",
    world: 3,
    title: "Lantern Peak",
    tagline: "Festival lights and a tiger road.",
    status: "live",
    stationIds: ["w3_1_paper_lights", "w3_2_tiger_road", "w3_3_crane_summit"],
    x: 70,
    y: 30,
  },
  {
    id: "moon",
    world: "moon",
    title: "Guanghan Palace",
    tagline: "Quiet moon garden. Path continues later.",
    status: "soon",
    stationIds: [],
    x: 88,
    y: 16,
  },
]

const W0_IDS = ["w0_setting", "w0_lore_moon", "w0_controls"] as const

const W1_PLAYABLE = ["w1_1_soft_paths", "w1_2_hedge_maze"] as const
const W2_PLAYABLE = ["w2_1_green_corridor", "w2_2_floating_logs"] as const
const W3_PLAYABLE = ["w3_1_paper_lights", "w3_2_tiger_road"] as const

function worldPlayableCleared(save: SaveV1, ids: readonly string[]): boolean {
  const cleared = new Set(save.progress.story.cleared)
  return ids.every((id) => cleared.has(id))
}

export function listWorlds(): StoryWorldNode[] {
  return [...WORLDS]
}

export function getWorld(id: StoryWorldId): StoryWorldNode | undefined {
  return WORLDS.find((world) => world.id === id)
}

export function getStation(id: string): StoryStation | undefined {
  return STATIONS[id]
}

export function listStations(worldId: StoryWorldId): StoryStation[] {
  const world = getWorld(worldId)
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
  const world = getWorld(worldId)
  if (!world) {
    return false
  }
  if (world.status === "soon") {
    return false
  }
  if (worldId === "w0") {
    return true
  }
  if (worldId === "w1") {
    return isW0Complete(save)
  }
  if (worldId === "w2") {
    return isW0Complete(save) && worldPlayableCleared(save, W1_PLAYABLE)
  }
  if (worldId === "w3") {
    return isW0Complete(save) && worldPlayableCleared(save, W2_PLAYABLE)
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
  const cleared = new Set(save.progress.story.cleared)
  if (stationId.startsWith("w0_")) {
    const prev = previousInChain(W0_IDS, stationId)
    return prev === null || cleared.has(prev)
  }
  if (!isW0Complete(save)) {
    return false
  }
  if (stationId.startsWith("w1_")) {
    const prev = previousInChain(W1_PLAYABLE, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("w2_")) {
    if (!worldPlayableCleared(save, W1_PLAYABLE)) {
      return false
    }
    const prev = previousInChain(W2_PLAYABLE, stationId)
    return prev === null || cleared.has(prev)
  }
  if (stationId.startsWith("w3_")) {
    if (!worldPlayableCleared(save, W2_PLAYABLE)) {
      return false
    }
    const prev = previousInChain(W3_PLAYABLE, stationId)
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
  if (!worldPlayableCleared(save, W1_PLAYABLE)) {
    return "w1"
  }
  if (!worldPlayableCleared(save, W2_PLAYABLE)) {
    return "w2"
  }
  if (!worldPlayableCleared(save, W3_PLAYABLE)) {
    return "w3"
  }
  return "w3"
}
