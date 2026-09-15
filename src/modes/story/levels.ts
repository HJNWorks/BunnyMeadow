import level11 from "../../data/story/w1/w1_1_soft_paths.json"
import level12 from "../../data/story/w1/w1_2_hedge_maze.json"
import level13 from "../../data/story/w1/w1_3_cart_chase.json"

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
  foxHu?: { startX: number; y: number; speed: number }
}

const W1: StoryLevelDef[] = [
  level11 as StoryLevelDef,
  level12 as StoryLevelDef,
  level13 as StoryLevelDef,
]

export function listWorld1Levels(): StoryLevelDef[] {
  return [...W1]
}

export function getStoryLevel(id: string): StoryLevelDef | undefined {
  return W1.find((level) => level.id === id)
}
