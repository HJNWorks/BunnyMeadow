import endlessData from "../../data/endless.json"
import { ENDLESS_CHUNKS, type ChunkDef, type EndlessEnv } from "../../systems/ChunkAssembler"

export type BandMeters = {
  min: number
  max: number
}

export type EndlessTuning = {
  chaseSpeed: number
  chaseRampPer100m: number
  chaseMaxBehind: number
  startTier: number
  tierRampMeters: number
  breatherEvery: number
  carrotChance: number
  bandMeters: BandMeters
}

export type EnvKit = {
  env: EndlessEnv
  sky: string
  name: string
}

type GraphNode = {
  sky: string
  name: string
}

type GraphEdge = {
  from: EndlessEnv
  to: EndlessEnv
  climb: number
}

type BiomeGraph = {
  nodes: Record<string, GraphNode>
  edges: GraphEdge[]
}

const BIOME_GRAPH = endlessData.biomeGraph as BiomeGraph

export function getEnvKit(env: string): EnvKit {
  const key = BIOME_GRAPH.nodes[env] ? env : "meadow"
  const node = BIOME_GRAPH.nodes[key]
  return { env: key as EndlessEnv, sky: node.sky, name: node.name }
}

export function getTuning(preset: string): EndlessTuning {
  const table = endlessData.difficulty as Record<string, EndlessTuning>
  return table[preset] ?? table.hopper
}

export const METER_PER_PX = endlessData.meterPerPx as number

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class EndlessGenerator {
  private rng: () => number
  private tuning: EndlessTuning
  private lastId = ""
  private produced = 0
  private currentEnv: EndlessEnv = "meadow"
  private bandUntilM = 0
  private sameInARow = 1

  constructor(public readonly seed: number, preset: string) {
    this.rng = mulberry32(seed)
    this.tuning = getTuning(preset)
    this.bandUntilM = this.drawBandLength()
  }

  get env(): EndlessEnv {
    return this.currentEnv
  }

  get startChunkId(): string {
    return "endless_start"
  }

  private drawBandLength(): number {
    const { min, max } = this.tuning.bandMeters
    return min + Math.floor(this.rng() * (max - min + 1))
  }

  private outgoing(env: EndlessEnv): GraphEdge[] {
    return BIOME_GRAPH.edges.filter((e) => e.from === env)
  }

  private climbBias(distanceM: number): number {
    return Math.min(2, distanceM / 400)
  }

  private edgeWeight(edge: GraphEdge, distanceM: number): number {
    return Math.max(0.05, 1 + (this.climbBias(distanceM) - 1) * edge.climb)
  }

  private pickEdge(distanceM: number): GraphEdge | null {
    const edges = this.outgoing(this.currentEnv)
    if (edges.length === 0) {
      return null
    }
    const allowed = edges.filter((e) => {
      if (e.to !== this.currentEnv) {
        return true
      }
      return this.sameInARow < 2
    })
    const pool = allowed.length > 0 ? allowed : edges
    const weights = pool.map((e) => this.edgeWeight(e, distanceM))
    const total = weights.reduce((sum, w) => sum + w, 0)
    let roll = this.rng() * total
    for (let i = 0; i < pool.length; i += 1) {
      roll -= weights[i]
      if (roll <= 0) {
        return pool[i]
      }
    }
    return pool[pool.length - 1]
  }

  private stepRoute(distanceM: number): void {
    const edge = this.pickEdge(distanceM)
    if (!edge) {
      this.sameInARow += 1
      this.bandUntilM = distanceM + this.drawBandLength()
      return
    }
    if (edge.to === this.currentEnv) {
      this.sameInARow += 1
    } else {
      this.currentEnv = edge.to
      this.sameInARow = 1
    }
    this.bandUntilM = distanceM + this.drawBandLength()
  }

  private tierForMeters(distanceM: number): number {
    const raw = this.tuning.startTier + Math.floor(distanceM / this.tuning.tierRampMeters)
    const jitter = Math.floor(this.rng() * 3) - 1
    return Math.max(1, Math.min(5, raw + jitter))
  }

  private candidates(env: EndlessEnv, tier: number): ChunkDef[] {
    return ENDLESS_CHUNKS.filter((c) => c.endless?.env === env && c.endless?.tier === tier)
  }

  private pick(env: EndlessEnv, tier: number): ChunkDef {
    const tiers = [tier, tier - 1, tier + 1, tier - 2, tier + 2]
    for (const t of tiers) {
      if (t < 1 || t > 5) {
        continue
      }
      const pool = this.candidates(env, t).filter((c) => c.id !== this.lastId)
      if (pool.length > 0) {
        return pool[Math.floor(this.rng() * pool.length)]
      }
    }
    const anyEnv = ENDLESS_CHUNKS.filter(
      (c) => c.endless && c.endless.tier <= tier && c.id !== this.lastId,
    )
    if (anyEnv.length > 0) {
      return anyEnv[Math.floor(this.rng() * anyEnv.length)]
    }
    return ENDLESS_CHUNKS[0]
  }

  next(distanceM: number): ChunkDef {
    if (distanceM >= this.bandUntilM) {
      this.stepRoute(distanceM)
    }
    let tier = this.tierForMeters(distanceM)
    this.produced += 1
    if (this.tuning.breatherEvery > 0 && this.produced % this.tuning.breatherEvery === 0) {
      tier = Math.min(tier, 2)
    }
    const chunk = this.pick(this.currentEnv, tier)
    this.lastId = chunk.id
    return chunk
  }

  rollCarrot(): boolean {
    return this.rng() < this.tuning.carrotChance
  }
}
