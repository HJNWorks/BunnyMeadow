import type { AssembledDecor } from "../../../systems/ChunkAssembler"
import { isLunarEnv } from "../shared/themeKit"

export type EditorEnvToken =
  | "platform"
  | "wall"
  | "ceiling"
  | "bridge"
  | "water"
  | "hedge"
  | "vine"
  | "grass"
  | "log"
  | "burrow"
  | "kit"
  | "lantern"
  | "pool"
  | "falseMouth"
  | "rim"
  | "bowl"
  | "wound"
  | "cave"
  | "column"
  | "ice"
  | "pestle"
  | "roller"
  | "trough"
  | "rack"
  | "mortar"
  | "screen"
  | "chime"
  | "moonDoor"
  | "chimeFrame"
  | "tide"
  | "dust"
  | "raft"
  | "crater"
  | "mast"
  | "bark"
  | "heartwood"
  | "dim"
  | "reflection"
  | "stalactite"
  | "wellhead"
  | "toad"
  | "skin"
  | "dewPlate"

export type EditorKitId =
  | "meadow"
  | "orchard"
  | "bamboo"
  | "riverbank"
  | "lantern"
  | "osmanthus"
  | "cloudsea"
  | "moon"
  | "ch2_outer"
  | "ch2_cassia"
  | "ch2_mortar"
  | "ch2_dust"
  | "ch2_wells"
  | "ch2_silver"

export type EditorEnvKit = {
  id: EditorKitId
  chapter: "ch1" | "ch2" | "ch3"
  labelKey: string
  kinds: EditorEnvToken[]
}

const KIT_CORE: EditorEnvToken[] = ["platform", "wall", "ceiling", "bridge", "water", "pool"]

export const EDITOR_ENV_KITS: EditorEnvKit[] = [
  { id: "meadow", chapter: "ch1", labelKey: "editor.envKit.meadow", kinds: [...KIT_CORE, "hedge", "vine", "grass", "burrow", "kit"] },
  { id: "orchard", chapter: "ch1", labelKey: "editor.envKit.orchard", kinds: [...KIT_CORE, "hedge", "vine", "grass"] },
  { id: "bamboo", chapter: "ch1", labelKey: "editor.envKit.bamboo", kinds: [...KIT_CORE, "hedge", "vine", "log"] },
  { id: "riverbank", chapter: "ch1", labelKey: "editor.envKit.riverbank", kinds: [...KIT_CORE, "log", "grass"] },
  { id: "lantern", chapter: "ch1", labelKey: "editor.envKit.lantern", kinds: [...KIT_CORE, "lantern", "hedge"] },
  { id: "osmanthus", chapter: "ch1", labelKey: "editor.envKit.osmanthus", kinds: [...KIT_CORE, "lantern", "hedge"] },
  { id: "cloudsea", chapter: "ch1", labelKey: "editor.envKit.cloudsea", kinds: [...KIT_CORE, "hedge", "ice"] },
  {
    id: "moon",
    chapter: "ch1",
    labelKey: "editor.envKit.moon",
    kinds: [...KIT_CORE, "lantern", "cave", "column", "falseMouth", "rim", "bowl", "wound"],
  },
  {
    id: "ch2_outer",
    chapter: "ch2",
    labelKey: "editor.envKit.ch2_outer",
    kinds: [...KIT_CORE, "ice", "lantern", "column", "moonDoor", "chime", "chimeFrame", "screen"],
  },
  { id: "ch2_cassia", chapter: "ch2", labelKey: "editor.envKit.ch2_cassia", kinds: [...KIT_CORE, "wound", "bark", "heartwood"] },
  { id: "ch2_mortar", chapter: "ch2", labelKey: "editor.envKit.ch2_mortar", kinds: [...KIT_CORE, "bowl", "rim", "mortar", "pestle", "roller", "trough", "rack"] },
  {
    id: "ch2_dust",
    chapter: "ch2",
    labelKey: "editor.envKit.ch2_dust",
    kinds: [...KIT_CORE, "rim", "crater", "tide", "dust", "raft", "mast"],
  },
  {
    id: "ch2_wells",
    chapter: "ch2",
    labelKey: "editor.envKit.ch2_wells",
    kinds: [...KIT_CORE, "cave", "falseMouth", "dim", "reflection", "stalactite", "wellhead", "toad"],
  },
  {
    id: "ch2_silver",
    chapter: "ch2",
    labelKey: "editor.envKit.ch2_silver",
    kinds: [...KIT_CORE, "bowl", "lantern", "skin", "dewPlate"],
  },
]

export const DECOR_LABELS: Record<AssembledDecor["kind"], string> = {
  hedge: "Hedge",
  vine: "Vine",
  grass: "Grass",
  lantern: "Lantern",
  log: "Log",
  burrow: "Burrow",
  kit: "Kit",
  falseMouth: "False mouth",
  rim: "Rim",
  bowl: "Bowl",
  wound: "Wound",
  cave: "Cave lip",
  column: "Column",
  trough: "Roller trough",
  rack: "Drying rack",
  mortar: "Mortar",
  moonDoor: "Moon door",
  chimeFrame: "Chime frame",
  crater: "Crater",
  mast: "Raft mast",
  heartwood: "Heartwood",
  reflection: "Reflection lip",
  stalactite: "Stalactite",
  wellhead: "Well head",
  toad: "Moon toad",
  dewPlate: "Dew-plate immortal",
}

export const PLATFORM_ASSETS = [
  "ground",
  "hedge",
  "bridge",
  "log",
  "pool",
  "exit",
  "rim",
  "bowl",
  "wound",
  "cave",
  "ice",
  "chime",
  "raft",
  "skin",
] as const

const PLACEABLES_BY_BIOME: Record<string, AssembledDecor["kind"][]> = {
  meadow: ["hedge", "grass", "burrow", "kit"],
  orchard: ["hedge", "grass"],
  bamboo: ["hedge", "log"],
  riverbank: ["log", "grass"],
  lantern: ["lantern", "hedge"],
  osmanthus: ["lantern", "hedge"],
  cloudsea: ["hedge"],
  moon: ["lantern", "cave", "column", "falseMouth", "rim", "bowl", "wound"],
  ch2_mortar: ["rim", "bowl", "mortar", "trough", "rack"],
  ch2_outer: ["lantern", "column", "moonDoor", "chimeFrame"],
  ch2_dust: ["rim", "crater", "mast"],
  ch2_cassia: ["wound", "heartwood"],
  ch2_silver: ["bowl", "lantern", "dewPlate"],
  ch2_wells: ["cave", "falseMouth", "reflection", "stalactite", "wellhead", "toad"],
}

export function placeablesForEnv(env: string): AssembledDecor["kind"][] {
  const key = PLACEABLES_BY_BIOME[env] ? env : isLunarEnv(env) ? "moon" : env
  return PLACEABLES_BY_BIOME[key] ?? PLACEABLES_BY_BIOME.meadow ?? ["hedge"]
}

export function defaultDecor(
  kind: AssembledDecor["kind"],
  x: number,
  y: number,
  env?: string,
): AssembledDecor {
  if (kind === "lantern") {
    return { kind, x, y, w: 28, h: 48, rotation: 0, asset: "lantern", env }
  }
  if (kind === "log") {
    return { kind, x, y, w: 120, h: 20, rotation: 0, asset: "log", env }
  }
  if (kind === "grass") {
    return { kind, x, y, w: 80, h: 16, rotation: 0, asset: "ground", env }
  }
  if (kind === "burrow") {
    return { kind, x, y, w: 80, h: 50, rotation: 0, asset: "exit", env }
  }
  if (kind === "kit") {
    return { kind, x, y, w: 40, h: 48, rotation: 0, env }
  }
  if (kind === "vine") {
    return { kind, x, y, w: 24, h: 110, rotation: 0, asset: "hedge", env }
  }
  if (kind === "falseMouth") {
    return { kind, x, y, w: 90, h: 70, rotation: 0, asset: "cave", env }
  }
  if (kind === "rim") {
    return { kind, x, y, w: 120, h: 24, rotation: 0, asset: "rim", env }
  }
  if (kind === "bowl") {
    return { kind, x, y, w: 140, h: 28, rotation: 0, asset: "bowl", env }
  }
  if (kind === "wound") {
    return { kind, x, y, w: 140, h: 24, rotation: 0, asset: "wound", env }
  }
  if (kind === "cave") {
    return { kind, x, y, w: 100, h: 80, rotation: 0, asset: "cave", env }
  }
  if (kind === "column") {
    return { kind, x, y, w: 36, h: 120, rotation: 0, asset: "hedge", env }
  }
  if (kind === "trough") {
    return { kind, x, y, w: 320, h: 40, rotation: 0, asset: "trough", env }
  }
  if (kind === "dewPlate") {
    return { kind, x, y, w: 120, h: 300, rotation: 0, asset: "dewplate", env }
  }
  if (kind === "reflection") {
    return { kind, x, y, w: 140, h: 24, rotation: 0, asset: "ground", env }
  }
  if (kind === "stalactite") {
    return { kind, x, y, w: 60, h: 120, rotation: 0, asset: "stalactite", env }
  }
  if (kind === "wellhead") {
    return { kind, x, y, w: 180, h: 90, rotation: 0, asset: "wellhead", env }
  }
  if (kind === "toad") {
    return { kind, x, y, w: 90, h: 64, rotation: 0, asset: "toad", env }
  }
  if (kind === "heartwood") {
    return { kind, x, y, w: 640, h: 640, rotation: 0, asset: "heartwood", env }
  }
  if (kind === "crater") {
    return { kind, x, y, w: 360, h: 140, rotation: 0, asset: "crater", env }
  }
  if (kind === "mast") {
    return { kind, x, y, w: 96, h: 240, rotation: 0, asset: "mast", env }
  }
  if (kind === "moonDoor") {
    return { kind, x, y, w: 260, h: 260, rotation: 0, asset: "moondoor", env }
  }
  if (kind === "chimeFrame") {
    return { kind, x, y, w: 150, h: 160, rotation: 0, asset: "chimeframe", env }
  }
  if (kind === "mortar") {
    return { kind, x, y, w: 200, h: 180, rotation: 0, asset: "mortar", env }
  }
  if (kind === "rack") {
    return { kind, x, y, w: 64, h: 96, rotation: 0, asset: "rack", env }
  }
  return { kind: "hedge", x, y, w: 36, h: 120, rotation: 0, asset: "hedge", env }
}

export function applyPlaceableTrigger(item: AssembledDecor): void {
  if (item.kind === "burrow") {
    return
  }
  if (item.trigger?.kind !== "proximity") {
    return
  }
  void item.trigger.radius
}
