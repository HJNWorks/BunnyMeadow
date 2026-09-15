import level00 from "../../data/story/w0/w0_controls.json"
import level11 from "../../data/story/w1/w1_1_soft_paths.json"
import level12 from "../../data/story/w1/w1_2_hedge_maze.json"
import level13 from "../../data/story/w1/w1_3_cart_chase.json"
import level21 from "../../data/story/w2/w2_1_green_corridor.json"
import level22 from "../../data/story/w2/w2_2_floating_logs.json"
import level31 from "../../data/story/w3/w3_1_paper_lights.json"
import level32 from "../../data/story/w3/w3_2_tiger_road.json"

export type StoryLevelDef = {
  id: string
  world: number
  index: number
  name: string
  chunks: string[]
  playerSpawn: { x: number; y: number }
  moonPool: { chunk: number; x: number; y: number }
  exit: { chunk: number; x: number; y: number }
  moonLine: string
  objective: string
  wallBounce?: boolean
  glide?: boolean
  tutorial?: boolean
  sky?: string
  foxHu?: { startX: number; y: number; speed: number }
  ride?: {
    w: number
    h: number
    speed: number
    waypoints: { chunk: number; x: number; y: number }[]
  }
}

const LEVELS: StoryLevelDef[] = [
  level00 as StoryLevelDef,
  level11 as StoryLevelDef,
  level12 as StoryLevelDef,
  level13 as StoryLevelDef,
  level21 as StoryLevelDef,
  level22 as StoryLevelDef,
  level31 as StoryLevelDef,
  level32 as StoryLevelDef,
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
