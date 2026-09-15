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
    kind: "controls",
    title: "Soft Paws",
    blurb: "How Mei hops the meadow.",
    lines: [
      "Move with A and D. Jump with Space. Dash with R. Pause with P.",
      "Moon Pools mark where you continue after a tumble. Levels always restart at the start.",
    ],
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
    status: "soon",
    stationIds: [],
    x: 52,
    y: 44,
  },
  {
    id: "w3",
    world: 3,
    title: "Lantern Peak",
    tagline: "Festival lights and a tiger road.",
    status: "soon",
    stationIds: [],
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
  return false
}

export function isStationUnlocked(save: SaveV1, stationId: string): boolean {
  const station = getStation(stationId)
  if (!station || station.soon) {
    return false
  }
  const cleared = new Set(save.progress.story.cleared)
  if (stationId.startsWith("w0_")) {
    const index = W0_IDS.indexOf(stationId as (typeof W0_IDS)[number])
    if (index <= 0) {
      return true
    }
    return cleared.has(W0_IDS[index - 1])
  }
  if (!isW0Complete(save)) {
    return false
  }
  if (stationId === "w1_1_soft_paths") {
    return true
  }
  if (stationId === "w1_2_hedge_maze") {
    return cleared.has("w1_1_soft_paths")
  }
  if (stationId === "w1_3_cart_chase") {
    return false
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
  return "w1"
}
