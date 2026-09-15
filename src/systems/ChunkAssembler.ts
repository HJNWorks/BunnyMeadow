import chunkMeadowStart from "../data/chunks/chunk_meadow_start.json"
import chunkMeadowGap from "../data/chunks/chunk_meadow_gap.json"
import chunkMeadowPool from "../data/chunks/chunk_meadow_pool.json"
import chunkOrchardA from "../data/chunks/chunk_orchard_a.json"
import chunkOrchardB from "../data/chunks/chunk_orchard_b.json"
import chunkHedgeEnd from "../data/chunks/chunk_hedge_end.json"
import chunkChaseA from "../data/chunks/chunk_chase_a.json"
import chunkChaseB from "../data/chunks/chunk_chase_b.json"

export type ChunkId = string

export type ChunkRect = { x: number; y: number; w: number; h: number }

export type ChunkEnemySpawn = { id: string; x: number; y: number }

export type ChunkDef = {
  id: string
  width: number
  height: number
  groundY: number
  platforms: ChunkRect[]
  walls: ChunkRect[]
  enemies: ChunkEnemySpawn[]
  color: string
}

export type AssembledRect = ChunkRect & { kind: "platform" | "wall" }

export type AssembledEnemy = ChunkEnemySpawn & { worldX: number; worldY: number }

export type AssembledLevel = {
  width: number
  height: number
  chunks: ChunkId[]
  platforms: AssembledRect[]
  enemies: AssembledEnemy[]
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
}

export class ChunkAssembler {
  getChunk(id: ChunkId): ChunkDef | undefined {
    return REGISTRY[id]
  }

  assemble(ids: ChunkId[]): AssembledLevel {
    const platforms: AssembledRect[] = []
    const enemies: AssembledEnemy[] = []
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
        platforms.push({ x: x + p.x, y: p.y, w: p.w, h: p.h, kind: "platform" })
      }
      for (const w of chunk.walls) {
        platforms.push({ x: x + w.x, y: w.y, w: w.w, h: w.h, kind: "wall" })
      }
      for (const e of chunk.enemies) {
        enemies.push({
          id: e.id,
          x: e.x,
          y: e.y,
          worldX: x + e.x,
          worldY: e.y,
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
