import type { AssembledDecor } from "../../../systems/ChunkAssembler"

export const DECOR_LABELS: Record<AssembledDecor["kind"], string> = {
  hedge: "Hedge",
  vine: "Vine",
  grass: "Grass",
  lantern: "Lantern",
  log: "Log",
  burrow: "Burrow",
}

export const PLATFORM_ASSETS = ["ground", "hedge", "bridge", "log", "pool", "exit"] as const

const PLACEABLES_BY_BIOME: Record<string, AssembledDecor["kind"][]> = {
  meadow: ["hedge", "grass", "burrow"],
  orchard: ["hedge", "grass"],
  bamboo: ["hedge", "log"],
  riverbank: ["log", "grass"],
  lantern: ["lantern", "hedge"],
  osmanthus: ["lantern", "hedge"],
  cloudsea: ["hedge"],
  moon: ["hedge", "lantern"],
}

export function placeablesForEnv(env: string): AssembledDecor["kind"][] {
  return PLACEABLES_BY_BIOME[env] ?? PLACEABLES_BY_BIOME.meadow ?? ["hedge"]
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
  return { kind: "hedge", x, y, w: 36, h: 120, rotation: 0, asset: "hedge" }
}
