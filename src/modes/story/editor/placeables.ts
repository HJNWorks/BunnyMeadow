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
  | "lantern"
  | "pool"
  | "falseMouth"
  | "rim"
  | "bowl"
  | "wound"
  | "cave"
  | "column"

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
  labelKey: string
  kinds: EditorEnvToken[]
}

const KIT_CORE: EditorEnvToken[] = ["platform", "wall", "ceiling", "bridge", "water", "pool"]

export const EDITOR_ENV_KITS: EditorEnvKit[] = [
  { id: "meadow", labelKey: "editor.envKit.meadow", kinds: [...KIT_CORE, "hedge", "vine", "grass", "burrow"] },
  { id: "orchard", labelKey: "editor.envKit.orchard", kinds: [...KIT_CORE, "hedge", "vine", "grass"] },
  { id: "bamboo", labelKey: "editor.envKit.bamboo", kinds: [...KIT_CORE, "hedge", "vine", "log"] },
  { id: "riverbank", labelKey: "editor.envKit.riverbank", kinds: [...KIT_CORE, "log", "grass"] },
  { id: "lantern", labelKey: "editor.envKit.lantern", kinds: [...KIT_CORE, "lantern", "hedge"] },
  { id: "osmanthus", labelKey: "editor.envKit.osmanthus", kinds: [...KIT_CORE, "lantern", "hedge"] },
  { id: "cloudsea", labelKey: "editor.envKit.cloudsea", kinds: [...KIT_CORE, "hedge"] },
  {
    id: "moon",
    labelKey: "editor.envKit.moon",
    kinds: [...KIT_CORE, "lantern", "cave", "column", "falseMouth", "rim", "bowl", "wound"],
  },
  { id: "ch2_outer", labelKey: "editor.envKit.ch2_outer", kinds: [...KIT_CORE, "lantern", "column"] },
  { id: "ch2_cassia", labelKey: "editor.envKit.ch2_cassia", kinds: [...KIT_CORE, "wound"] },
  { id: "ch2_mortar", labelKey: "editor.envKit.ch2_mortar", kinds: [...KIT_CORE, "bowl", "rim"] },
  { id: "ch2_dust", labelKey: "editor.envKit.ch2_dust", kinds: [...KIT_CORE, "rim"] },
  { id: "ch2_wells", labelKey: "editor.envKit.ch2_wells", kinds: [...KIT_CORE, "cave", "falseMouth"] },
  { id: "ch2_silver", labelKey: "editor.envKit.ch2_silver", kinds: [...KIT_CORE, "bowl", "lantern"] },
]

export const DECOR_LABELS: Record<AssembledDecor["kind"], string> = {
  hedge: "Hedge",
  vine: "Vine",
  grass: "Grass",
  lantern: "Lantern",
  log: "Log",
  burrow: "Burrow",
  falseMouth: "False mouth",
  rim: "Rim",
  bowl: "Bowl",
  wound: "Wound",
  cave: "Cave lip",
  column: "Column",
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
] as const

const PLACEABLES_BY_BIOME: Record<string, AssembledDecor["kind"][]> = {
  meadow: ["hedge", "grass", "burrow"],
  orchard: ["hedge", "grass"],
  bamboo: ["hedge", "log"],
  riverbank: ["log", "grass"],
  lantern: ["lantern", "hedge"],
  osmanthus: ["lantern", "hedge"],
  cloudsea: ["hedge"],
  moon: ["lantern", "cave", "column", "falseMouth", "rim", "bowl", "wound"],
}

export function placeablesForEnv(env: string): AssembledDecor["kind"][] {
  const key = isLunarEnv(env) ? "moon" : env
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
