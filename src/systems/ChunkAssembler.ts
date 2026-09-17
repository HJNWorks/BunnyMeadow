import chunkMeadowStart from "../data/chunks/chunk_meadow_start.json"
import chunkMeadowGap from "../data/chunks/chunk_meadow_gap.json"
import chunkMeadowPool from "../data/chunks/chunk_meadow_pool.json"
import chunkOrchardA from "../data/chunks/chunk_orchard_a.json"
import chunkOrchardB from "../data/chunks/chunk_orchard_b.json"
import chunkHedgeEnd from "../data/chunks/chunk_hedge_end.json"
import chunkChaseA from "../data/chunks/chunk_chase_a.json"
import chunkChaseB from "../data/chunks/chunk_chase_b.json"
import chunkBambooStart from "../data/chunks/chunk_bamboo_start.json"
import chunkBambooShaft from "../data/chunks/chunk_bamboo_shaft.json"
import chunkBambooPool from "../data/chunks/chunk_bamboo_pool.json"
import chunkRiverStart from "../data/chunks/chunk_river_start.json"
import chunkRiverLogs from "../data/chunks/chunk_river_logs.json"
import chunkRiverPool from "../data/chunks/chunk_river_pool.json"
import chunkLanternStart from "../data/chunks/chunk_lantern_start.json"
import chunkLanternGlide from "../data/chunks/chunk_lantern_glide.json"
import chunkLanternPool from "../data/chunks/chunk_lantern_pool.json"
import chunkOsmanthusStart from "../data/chunks/chunk_osmanthus_start.json"
import chunkOsmanthusRide from "../data/chunks/chunk_osmanthus_ride.json"
import chunkOsmanthusPool from "../data/chunks/chunk_osmanthus_pool.json"
import chunkPawsMove from "../data/chunks/chunk_paws_move.json"
import chunkPawsJump from "../data/chunks/chunk_paws_jump.json"
import chunkPawsBurrow from "../data/chunks/chunk_paws_burrow.json"
import chunkRaftA from "../data/chunks/chunk_raft_a.json"
import chunkRaftB from "../data/chunks/chunk_raft_b.json"
import chunkCraneA from "../data/chunks/chunk_crane_a.json"
import chunkCraneB from "../data/chunks/chunk_crane_b.json"
import chunkMoonA from "../data/chunks/chunk_moon_a.json"
import chunkMoonB from "../data/chunks/chunk_moon_b.json"
import chunkStairStart from "../data/chunks/chunk_stair_start.json"
import chunkStairAscent from "../data/chunks/chunk_stair_ascent.json"
import chunkStairMidA from "../data/chunks/chunk_stair_mid_a.json"
import chunkStairMidB from "../data/chunks/chunk_stair_mid_b.json"
import chunkStairGaleA from "../data/chunks/chunk_stair_gale_a.json"
import chunkStairGaleB from "../data/chunks/chunk_stair_gale_b.json"

export type ChunkId = string

export type ChunkRect = { x: number; y: number; w: number; h: number }

export type PlaceableTrigger = {
  kind: "proximity"
  radius: number
}

export type ChunkEnemySpawn = { id: string; x: number; y: number }

export type ChunkEnemySlot = { x: number; y: number; allow: string[]; minTier: number }

export type ChunkItemSlot = { x: number; y: number; allow: string[]; minTier: number }

export type ChunkMover = ChunkRect & {
  axis: "x" | "y"
  amplitude: number
  speed: number
  tint?: number
  kind?: "log" | "bridge"
}

export type ChunkHazard = ChunkRect & {
  kind: "water"
  current?: number
  trigger?: PlaceableTrigger
}

export type ChunkCarrot = { x: number; y: number }

export type EndlessEnv =
  | "meadow"
  | "orchard"
  | "bamboo"
  | "riverbank"
  | "lantern"
  | "osmanthus"

export type ChunkEndlessMeta = {
  env: EndlessEnv
  tier: number
  entryY: number
  exitY: number
  bridgeTo?: EndlessEnv
}

export type ChunkDef = {
  id: string
  width: number
  height: number
  groundY: number
  platforms: ChunkRect[]
  walls: ChunkRect[]
  enemies?: ChunkEnemySpawn[]
  enemySlots?: ChunkEnemySlot[]
  movers?: ChunkMover[]
  hazards?: ChunkHazard[]
  carrots?: ChunkCarrot[]
  itemSlots?: ChunkItemSlot[]
  endless?: ChunkEndlessMeta
  color: string
}

export type AssembledRect = ChunkRect & {
  kind: "platform" | "wall"
  asset?: "ground" | "hedge" | "bridge" | "log" | "pool" | "exit"
  rotation?: number
}

export type AssembledDecor = {
  kind: "hedge" | "vine" | "grass" | "lantern" | "log" | "burrow"
  x: number
  y: number
  w: number
  h: number
  rotation?: number
  asset?: string
  trigger?: PlaceableTrigger
}

export type AssembledEnemy = ChunkEnemySpawn & { worldX: number; worldY: number }

export type AssembledMover = ChunkMover & { worldX: number; worldY: number }

export type AssembledHazard = ChunkHazard & { worldX: number; worldY: number }

export type AssembledCarrot = ChunkCarrot & { worldX: number; worldY: number }

export type AssembledLevel = {
  width: number
  height: number
  chunks: ChunkId[]
  platforms: AssembledRect[]
  enemies: AssembledEnemy[]
  movers: AssembledMover[]
  hazards: AssembledHazard[]
  carrots: AssembledCarrot[]
  decor: AssembledDecor[]
  chunkOrigins: number[]
  colors: { x: number; width: number; color: string }[]
}

const REGISTRY: Record<string, ChunkDef> = {
  chunk_meadow_start: chunkMeadowStart as ChunkDef,
  chunk_meadow_gap: chunkMeadowGap as ChunkDef,
  chunk_meadow_pool: chunkMeadowPool as ChunkDef,
  chunk_orchard_a: chunkOrchardA as ChunkDef,
  chunk_orchard_b: chunkOrchardB as ChunkDef,
  chunk_hedge_end: chunkHedgeEnd as ChunkDef,
  chunk_chase_a: chunkChaseA as ChunkDef,
  chunk_chase_b: chunkChaseB as ChunkDef,
  chunk_bamboo_start: chunkBambooStart as ChunkDef,
  chunk_bamboo_shaft: chunkBambooShaft as ChunkDef,
  chunk_bamboo_pool: chunkBambooPool as ChunkDef,
  chunk_river_start: chunkRiverStart as ChunkDef,
  chunk_river_logs: chunkRiverLogs as ChunkDef,
  chunk_river_pool: chunkRiverPool as ChunkDef,
  chunk_lantern_start: chunkLanternStart as ChunkDef,
  chunk_lantern_glide: chunkLanternGlide as ChunkDef,
  chunk_lantern_pool: chunkLanternPool as ChunkDef,
  chunk_osmanthus_start: chunkOsmanthusStart as ChunkDef,
  chunk_osmanthus_ride: chunkOsmanthusRide as ChunkDef,
  chunk_osmanthus_pool: chunkOsmanthusPool as ChunkDef,
  chunk_paws_move: chunkPawsMove as ChunkDef,
  chunk_paws_jump: chunkPawsJump as ChunkDef,
  chunk_paws_burrow: chunkPawsBurrow as ChunkDef,
  chunk_raft_a: chunkRaftA as ChunkDef,
  chunk_raft_b: chunkRaftB as ChunkDef,
  chunk_crane_a: chunkCraneA as ChunkDef,
  chunk_crane_b: chunkCraneB as ChunkDef,
  chunk_moon_a: chunkMoonA as ChunkDef,
  chunk_moon_b: chunkMoonB as ChunkDef,
  chunk_stair_start: chunkStairStart as ChunkDef,
  chunk_stair_ascent: chunkStairAscent as ChunkDef,
  chunk_stair_mid_a: chunkStairMidA as ChunkDef,
  chunk_stair_mid_b: chunkStairMidB as ChunkDef,
  chunk_stair_gale_a: chunkStairGaleA as ChunkDef,
  chunk_stair_gale_b: chunkStairGaleB as ChunkDef,
}

const endlessModules = import.meta.glob<{ default: ChunkDef }>(
  "../data/chunks/endless/*.json",
  { eager: true },
)

export const ENDLESS_CHUNKS: ChunkDef[] = []
for (const mod of Object.values(endlessModules)) {
  const def = mod.default
  REGISTRY[def.id] = def
  if (def.endless) {
    ENDLESS_CHUNKS.push(def)
  }
}

export class ChunkAssembler {
  getChunk(id: ChunkId): ChunkDef | undefined {
    return REGISTRY[id]
  }

  assemble(ids: ChunkId[]): AssembledLevel {
    const platforms: AssembledRect[] = []
    const enemies: AssembledEnemy[] = []
    const movers: AssembledMover[] = []
    const hazards: AssembledHazard[] = []
    const carrots: AssembledCarrot[] = []
    const decor: AssembledDecor[] = []
    const chunkOrigins: number[] = []
    const colors: { x: number; width: number; color: string }[] = []
    let x = 0
    let height = 1080

    for (const id of ids) {
      const chunk = REGISTRY[id]
      if (!chunk) {
        continue
      }
      chunkOrigins.push(x)
      height = Math.max(height, chunk.height)
      colors.push({ x, width: chunk.width, color: chunk.color })
      for (const p of chunk.platforms) {
        platforms.push({ x: x + p.x, y: p.y, w: p.w, h: p.h, kind: "platform", asset: "ground" })
      }
      for (const w of chunk.walls) {
        platforms.push({ x: x + w.x, y: w.y, w: w.w, h: w.h, kind: "wall", asset: "hedge" })
        decor.push({
          kind: "hedge",
          x: x + w.x,
          y: w.y,
          w: w.w,
          h: w.h,
          rotation: 0,
          asset: "hedge",
        })
      }
      for (const e of chunk.enemies ?? []) {
        enemies.push({
          id: e.id,
          x: e.x,
          y: e.y,
          worldX: x + e.x,
          worldY: e.y,
        })
      }
      for (const m of chunk.movers ?? []) {
        movers.push({
          ...m,
          worldX: x + m.x,
          worldY: m.y,
        })
      }
      for (const h of chunk.hazards ?? []) {
        hazards.push({
          ...h,
          worldX: x + h.x,
          worldY: h.y,
        })
      }
      for (const c of chunk.carrots ?? []) {
        carrots.push({
          ...c,
          worldX: x + c.x,
          worldY: c.y,
        })
      }
      x += chunk.width
    }

    return {
      width: x,
      height,
      chunks: [...ids],
      platforms,
      enemies,
      movers,
      hazards,
      carrots,
      decor,
      chunkOrigins,
      colors,
    }
  }

  worldPoint(
    assembled: AssembledLevel,
    anchor: { chunk: number; x: number; y: number },
  ): { x: number; y: number } {
    const origin = assembled.chunkOrigins[anchor.chunk] ?? 0
    return { x: origin + anchor.x, y: anchor.y }
  }
}
