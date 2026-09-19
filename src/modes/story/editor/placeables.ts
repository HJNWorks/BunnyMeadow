import type { AssembledDecor } from "../../../systems/ChunkAssembler"
import { isLunarEnv } from "../shared/themeKit"

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

export function defaultDecor(kind: AssembledDecor["kind"], x: number, y: number): AssembledDecor {
  if (kind === "lantern") {
    return { kind, x, y, w: 28, h: 48, rotation: 0, asset: "lantern" }
  }
  if (kind === "log") {
    return { kind, x, y, w: 120, h: 20, rotation: 0, asset: "log" }
  }
  if (kind === "grass") {
    return { kind, x, y, w: 80, h: 16, rotation: 0, asset: "ground" }
  }
  if (kind === "burrow") {
    return { kind, x, y, w: 80, h: 50, rotation: 0, asset: "exit" }
  }
  if (kind === "vine") {
    return { kind, x, y, w: 24, h: 110, rotation: 0, asset: "hedge" }
  }
  if (kind === "falseMouth") {
    return { kind, x, y, w: 90, h: 70, rotation: 0, asset: "cave" }
  }
  if (kind === "rim") {
    return { kind, x, y, w: 120, h: 24, rotation: 0, asset: "rim" }
  }
  if (kind === "bowl") {
    return { kind, x, y, w: 140, h: 28, rotation: 0, asset: "bowl" }
  }
  if (kind === "wound") {
    return { kind, x, y, w: 140, h: 24, rotation: 0, asset: "wound" }
  }
  if (kind === "cave") {
    return { kind, x, y, w: 100, h: 80, rotation: 0, asset: "cave" }
  }
  if (kind === "column") {
    return { kind, x, y, w: 36, h: 120, rotation: 0, asset: "hedge" }
  }
  return { kind: "hedge", x, y, w: 36, h: 120, rotation: 0, asset: "hedge" }
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
