import level00 from "../../data/story/w0/w0_controls.json"
import levelPool from "../../data/story/w0/w0_lore_moon.json"
import level11 from "../../data/story/w1/w1_1_soft_paths.json"
import level12 from "../../data/story/w1/w1_2_hedge_maze.json"
import level13 from "../../data/story/w1/w1_3_cart_chase.json"
import level21 from "../../data/story/w2/w2_1_green_corridor.json"
import level22 from "../../data/story/w2/w2_2_floating_logs.json"
import level23 from "../../data/story/w2/w2_3_raft_gauntlet.json"
import level31 from "../../data/story/w3/w3_1_paper_lights.json"
import level32 from "../../data/story/w3/w3_2_tiger_road.json"
import level33 from "../../data/story/w3/w3_3_crane_summit.json"
import level41 from "../../data/story/w4/w4_1_first_steps.json"
import level42 from "../../data/story/w4/w4_2_no_return.json"
import level43 from "../../data/story/w4/w4_3_closing_gale.json"
import levelMoon from "../../data/story/moon/moon_guanghan.json"
import levelCh2Outer from "../../data/story/ch2/ch2_outer_1_courtyard.json"
import levelCh2Cassia from "../../data/story/ch2/ch2_cassia_1_grove.json"
import levelCh2Mortar from "../../data/story/ch2/ch2_mortar_1_bowls.json"
import levelCh2Dust from "../../data/story/ch2/ch2_dust_1_rims.json"
import levelCh2Wells from "../../data/story/ch2/ch2_wells_1_mouths.json"
import levelCh2Silver from "../../data/story/ch2/ch2_silver_1_basin.json"

export type StoryBossDef = {
  kind: "fox_cart" | "heron" | "crane" | "gale" | "han"
  hitsNeeded?: number
  divesNeeded?: number
  x?: number
  y?: number
}

export type StoryLeftChase = {
  kind: "fox_cart" | "gale"
  startX: number
  y: number
  speed: number
}

export type MoonPoolDef = {
  chunk: number
  x: number
  y: number
  line?: string
}

export type StoryLevelDef = {
  id: string
  chapter?: "ch1" | "ch2" | "ch3"
  world: number
  index: number
  name: string
  chunks: string[]
  playerSpawn: { x: number; y: number }
  moonPool?: MoonPoolDef
  moonPools?: MoonPoolDef[]
  exit: { chunk: number; x: number; y: number }
  moonLine: string
  objective: string
  wallBounce?: boolean
  glide?: boolean
  tutorial?: boolean
  lowGravity?: boolean
  epilogue?: boolean
  noCheckpoint?: boolean
  height?: number
  sky?: string
  env?: string
  hour?: string
  weather?: string
  foxHu?: { startX: number; y: number; speed: number }
  cartFlag?: { x: number; y: number }
  leftChase?: StoryLeftChase
  boss?: StoryBossDef
  ride?: {
    w: number
    h: number
    speed: number
    waypoints: { chunk: number; x: number; y: number }[]
  }
}

const LEVELS: StoryLevelDef[] = [
  levelPool as StoryLevelDef,
  level00 as StoryLevelDef,
  level11 as StoryLevelDef,
  level12 as StoryLevelDef,
  level13 as StoryLevelDef,
  level21 as StoryLevelDef,
  level22 as StoryLevelDef,
  level23 as StoryLevelDef,
  level31 as StoryLevelDef,
  level32 as StoryLevelDef,
  level33 as StoryLevelDef,
  level41 as StoryLevelDef,
  level42 as StoryLevelDef,
  level43 as StoryLevelDef,
  levelMoon as StoryLevelDef,
  levelCh2Outer as StoryLevelDef,
  levelCh2Cassia as StoryLevelDef,
  levelCh2Mortar as StoryLevelDef,
  levelCh2Dust as StoryLevelDef,
  levelCh2Wells as StoryLevelDef,
  levelCh2Silver as StoryLevelDef,
]

export function listStoryLevels(): StoryLevelDef[] {
  return [...LEVELS]
}

export function listWorld1Levels(): StoryLevelDef[] {
  return LEVELS.filter((level) => level.world === 1)
}

export function getStoryLevel(id: string): StoryLevelDef | undefined {
  return LEVELS.find((level) => level.id === id)
}

export function cloneMoonPool(pool: MoonPoolDef): MoonPoolDef {
  const next: MoonPoolDef = { chunk: pool.chunk, x: pool.x, y: pool.y }
  if (pool.line) {
    next.line = pool.line
  }
  return next
}

export function poolsOf(def: Pick<StoryLevelDef, "moonPool" | "moonPools">): MoonPoolDef[] {
  if (def.moonPools) {
    return def.moonPools.map((pool) => cloneMoonPool(pool))
  }
  if (def.moonPool) {
    return [cloneMoonPool(def.moonPool)]
  }
  return []
}
