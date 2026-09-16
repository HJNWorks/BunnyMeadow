import endlessData from "../../data/endless.json"
import enemiesData from "../../data/enemies.json"
import itemsData from "../../data/items.json"
import {
  ENDLESS_CHUNKS,
  type ChunkDef,
  type ChunkEnemySlot,
  type ChunkItemSlot,
  type EndlessEnv,
} from "../../systems/ChunkAssembler"

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

export type FilledEnemy = { id: string; x: number; y: number }
export type FilledItem = { id: string; x: number; y: number }

export type FilledChunk = {
  chunk: ChunkDef
  enemies: FilledEnemy[]
  items: FilledItem[]
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

type EnemyDef = {
  id: string
  archetype: string
  homeBiomes?: string[]
  minTier?: number
}

type ItemDef = {
  id: string
  category: string
  weightKey: string
}

const BIOME_GRAPH = endlessData.biomeGraph as BiomeGraph
const ENEMY_ROSTER = enemiesData.enemies as EnemyDef[]
const ITEM_CATALOG = itemsData.catalog as ItemDef[]
const ITEM_BIOMES = itemsData.biomes as Record<string, Record<string, number>>
export const MIST_PUSH_METERS = (itemsData as { mistPushMeters?: number }).mistPushMeters ?? 80

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
  private pendingBridge: ChunkDef | null = null

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
      const from = this.currentEnv
      this.currentEnv = edge.to
      this.sameInARow = 1
      const bridgeId = `bridge_${from}_${edge.to}`
      const bridge = ENDLESS_CHUNKS.find((c) => c.id === bridgeId)
      if (bridge) {
        this.pendingBridge = bridge
      }
    }
    this.bandUntilM = distanceM + this.drawBandLength()
  }

  private tierForMeters(distanceM: number): number {
    const raw = this.tuning.startTier + Math.floor(distanceM / this.tuning.tierRampMeters)
    const jitter = Math.floor(this.rng() * 3) - 1
    return Math.max(1, Math.min(5, raw + jitter))
  }

  private candidates(env: EndlessEnv, tier: number): ChunkDef[] {
    return ENDLESS_CHUNKS.filter(
      (c) => c.endless?.env === env && c.endless?.tier === tier && !c.endless.bridgeTo,
    )
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
      (c) =>
        c.endless &&
        !c.endless.bridgeTo &&
        c.endless.tier <= tier &&
        c.id !== this.lastId,
    )
    if (anyEnv.length > 0) {
      return anyEnv[Math.floor(this.rng() * anyEnv.length)]
    }
    return ENDLESS_CHUNKS[0]
  }

  next(distanceM: number): FilledChunk {
    if (distanceM >= this.bandUntilM) {
      this.stepRoute(distanceM)
    }
    if (this.pendingBridge) {
      const bridge = this.pendingBridge
      this.pendingBridge = null
      this.produced += 1
      this.lastId = bridge.id
      return this.fill(bridge, bridge.endless?.env ?? this.currentEnv, 1)
    }
    let tier = this.tierForMeters(distanceM)
    this.produced += 1
    if (this.tuning.breatherEvery > 0 && this.produced % this.tuning.breatherEvery === 0) {
      tier = Math.min(tier, 2)
    }
    const chunk = this.pick(this.currentEnv, tier)
    this.lastId = chunk.id
    return this.fill(chunk, this.currentEnv, tier)
  }

  fill(chunk: ChunkDef, env: EndlessEnv, tier: number): FilledChunk {
    const enemySlots = this.enemySlotsOf(chunk)
    const itemSlots = this.itemSlotsOf(chunk)
    const enemies: FilledEnemy[] = []
    for (const slot of enemySlots) {
      if (slot.minTier > tier) {
        continue
      }
      const id = this.pickEnemyId(env, slot.allow, tier)
      if (id) {
        enemies.push({ id, x: slot.x, y: slot.y })
      }
    }
    const items: FilledItem[] = []
    for (const slot of itemSlots) {
      if (slot.minTier > tier) {
        continue
      }
      if (this.rng() >= this.tuning.carrotChance) {
        continue
      }
      const id = this.pickItemId(env, slot.allow)
      if (id) {
        items.push({ id, x: slot.x, y: slot.y })
      }
    }
    return { chunk, enemies, items }
  }

  private enemySlotsOf(chunk: ChunkDef): ChunkEnemySlot[] {
    if (chunk.enemySlots && chunk.enemySlots.length > 0) {
      return chunk.enemySlots
    }
    return (chunk.enemies ?? []).map((e) => {
      const def = ENEMY_ROSTER.find((r) => r.id === e.id)
      return {
        x: e.x,
        y: e.y,
        allow: [def?.archetype ?? "patrol"],
        minTier: 1,
      }
    })
  }

  private itemSlotsOf(chunk: ChunkDef): ChunkItemSlot[] {
    if (chunk.itemSlots && chunk.itemSlots.length > 0) {
      return chunk.itemSlots
    }
    return (chunk.carrots ?? []).map((c) => ({
      x: c.x,
      y: c.y,
      allow: ["currency"],
      minTier: 1,
    }))
  }

  private pickEnemyId(env: EndlessEnv, allow: string[], tier: number): string | null {
    const home = ENEMY_ROSTER.filter(
      (e) =>
        (e.homeBiomes ?? []).includes(env) &&
        (e.minTier ?? 1) <= tier &&
        allow.includes(e.archetype),
    )
    const pool = home.length > 0
      ? home
      : ENEMY_ROSTER.filter((e) => (e.homeBiomes ?? []).includes(env) && (e.minTier ?? 1) <= tier)
    if (pool.length === 0) {
      return null
    }
    return pool[Math.floor(this.rng() * pool.length)].id
  }

  private pickItemId(env: EndlessEnv, allow: string[]): string | null {
    const weights = ITEM_BIOMES[env] ?? ITEM_BIOMES.meadow
    const options: { id: string; w: number }[] = []
    for (const item of ITEM_CATALOG) {
      if (!allow.includes(item.category)) {
        continue
      }
      const w = weights[item.weightKey] ?? 0
      if (w > 0) {
        options.push({ id: item.id, w })
      }
    }
    if (options.length === 0) {
      return null
    }
    const total = options.reduce((sum, o) => sum + o.w, 0)
    let roll = this.rng() * total
    for (const o of options) {
      roll -= o.w
      if (roll <= 0) {
        return o.id
      }
    }
    return options[options.length - 1].id
  }

  rollCarrot(): boolean {
    return this.rng() < this.tuning.carrotChance
  }
}
