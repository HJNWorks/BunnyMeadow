import { listStoryLevels, getStoryLevel, type StoryLevelDef } from "../levels"
import { listWorlds, getStation, type StoryWorldId } from "../path"
import { storyEnvForLevel } from "../shared/themeKit"
import {
  ALL_CRITTERS,
  ALL_ITEMS,
  CRITTER_LABELS,
  ITEM_LABELS,
  crittersForEnv,
  itemsForEnv,
} from "./roster"
import { DECOR_LABELS, placeablesForEnv } from "./placeables"
import type { AssembledDecor } from "../../../systems/ChunkAssembler"

export type EditorWorldId = StoryWorldId

export type EditorEnvToken =
  | "platform"
  | "wall"
  | "bridge"
  | "water"
  | "hedge"
  | "vine"
  | "grass"
  | "log"
  | "burrow"
  | "lantern"
  | "pool"

export type EditorWorldEntry = {
  id: EditorWorldId
  titleKey: string
  stations: StoryLevelDef[]
  envs: string[]
  critters: string[]
  items: string[]
  placeables: AssembledDecor["kind"][]
}

const LAST_STATION_KEY = "bunnymeadow.editor.lastStation.v1"

const SHARED_ENV: EditorEnvToken[] = [
  "platform",
  "wall",
  "bridge",
  "water",
  "hedge",
  "vine",
  "grass",
  "log",
  "burrow",
  "lantern",
  "pool",
]

export function editorWorldIdForLevel(level: StoryLevelDef): EditorWorldId {
  if (level.id.startsWith("moon")) {
    return "moon"
  }
  if (level.id.startsWith("w0_")) {
    return "w0"
  }
  if (level.id.startsWith("w1_")) {
    return "w1"
  }
  if (level.id.startsWith("w2_")) {
    return "w2"
  }
  if (level.id.startsWith("w3_")) {
    return "w3"
  }
  if (level.id.startsWith("w4_")) {
    return "w4"
  }
  return "w0"
}

export function envForEditorLevel(level: StoryLevelDef): string {
  return level.env ?? storyEnvForLevel(level.world, level.index, level.id)
}

export function listEditorWorldIndex(): EditorWorldEntry[] {
  const playable = new Map(listStoryLevels().map((level) => [level.id, level]))
  return listWorlds().map((world) => {
    const stations = world.stationIds
      .map((id) => getStation(id))
      .map((station) => (station?.levelId ? playable.get(station.levelId) : undefined))
      .filter((level): level is StoryLevelDef => Boolean(level))
    const envs = [...new Set(stations.map((level) => envForEditorLevel(level)))]
    const critters = [...new Set(envs.flatMap((env) => crittersForEnv(env).native))]
    const items = [...new Set(envs.flatMap((env) => itemsForEnv(env).native))]
    const placeables = [...new Set(envs.flatMap((env) => placeablesForEnv(env)))]
    return {
      id: world.id,
      titleKey: `story.world.${world.id}.title`,
      stations,
      envs,
      critters,
      items,
      placeables,
    }
  })
}

export function stationsForWorld(worldId: EditorWorldId): StoryLevelDef[] {
  return listEditorWorldIndex().find((entry) => entry.id === worldId)?.stations ?? []
}

export function getLastEditorStation(): string {
  try {
    const raw = localStorage.getItem(LAST_STATION_KEY)
    if (raw && getStoryLevel(raw)) {
      return raw
    }
  } catch {
    return "w0_controls"
  }
  return "w0_controls"
}

export function setLastEditorStation(id: string): void {
  localStorage.setItem(LAST_STATION_KEY, id)
}

export function sharedEnvTokens(): EditorEnvToken[] {
  return [...SHARED_ENV]
}

export function envTokenLabel(token: string): string {
  if (token === "platform") {
    return "Platform"
  }
  if (token === "wall") {
    return "Wall"
  }
  if (token === "bridge") {
    return "Bridge"
  }
  if (token === "water") {
    return "Water"
  }
  if (token === "pool") {
    return "Moon Pool"
  }
  if (token in DECOR_LABELS) {
    return DECOR_LABELS[token as keyof typeof DECOR_LABELS]
  }
  return token
}

export function critterLabel(id: string): string {
  return CRITTER_LABELS[id] ?? id
}

export function itemLabel(id: string): string {
  return ITEM_LABELS[id] ?? id
}

export function allCritterIds(): string[] {
  return [...ALL_CRITTERS]
}

export function allItemIds(): string[] {
  return [...ALL_ITEMS]
}
