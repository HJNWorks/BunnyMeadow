import endlessData from "../../data/endless.json"
import { ENDLESS_CHUNKS, type ChunkDef, type EndlessEnv } from "../../systems/ChunkAssembler"

export type EndlessTuning = {
  chaseSpeed: number
  chaseRampPer100m: number
  chaseMaxBehind: number
  startTier: number
  tierRampMeters: number
  breatherEvery: number
  carrotChance: number
}

export type EnvBand = {
  env: EndlessEnv
  untilM: number
  sky: string
  name: string
}

const ENV_SCHEDULE = endlessData.envSchedule as EnvBand[]

export function getEnvBand(distanceM: number): EnvBand {
  for (const band of ENV_SCHEDULE) {
    if (distanceM < band.untilM) {
      return band
    }
  }
  return ENV_SCHEDULE[ENV_SCHEDULE.length - 1]
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

  constructor(public readonly seed: number, preset: string) {
    this.rng = mulberry32(seed)
    this.tuning = getTuning(preset)
  }

  get startChunkId(): string {
    return "endless_start"
  }

  private tierForMeters(distanceM: number): number {
    const raw = this.tuning.startTier + Math.floor(distanceM / this.tuning.tierRampMeters)
    return Math.max(1, Math.min(5, raw))
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
    const band = getEnvBand(distanceM)
    let tier = this.tierForMeters(distanceM)
    this.produced += 1
    if (this.tuning.breatherEvery > 0 && this.produced % this.tuning.breatherEvery === 0) {
      tier = Math.min(tier, 2)
    }
    const chunk = this.pick(band.env, tier)
    this.lastId = chunk.id
    return chunk
  }

  rollCarrot(): boolean {
    return this.rng() < this.tuning.carrotChance
  }
}
