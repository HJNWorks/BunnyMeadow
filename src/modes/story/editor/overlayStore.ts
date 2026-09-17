import type {
  AssembledEnemy,
  AssembledLevel,
  AssembledMover,
  AssembledRect,
} from "../../../systems/ChunkAssembler"
import type { StoryLevelDef } from "../levels"

export const EDITOR_OVERLAY_KEY = "bunnymeadow.editor.overlay.v1"

export type EditorLevelOverlay = {
  playerSpawn: { x: number; y: number }
  moonPool?: { chunk: number; x: number; y: number }
  exit: { chunk: number; x: number; y: number }
  platforms: AssembledRect[]
  movers: AssembledMover[]
  enemies: AssembledEnemy[]
}

type OverlayFile = {
  v: 1
  levels: Record<string, EditorLevelOverlay>
}

function emptyFile(): OverlayFile {
  return { v: 1, levels: {} }
}

function readFile(): OverlayFile {
  try {
    const raw = localStorage.getItem(EDITOR_OVERLAY_KEY)
    if (!raw) {
      return emptyFile()
    }
    const parsed = JSON.parse(raw) as OverlayFile
    if (parsed?.v !== 1 || typeof parsed.levels !== "object" || !parsed.levels) {
      return emptyFile()
    }
    return parsed
  } catch {
    return emptyFile()
  }
}

function writeFile(file: OverlayFile): void {
  localStorage.setItem(EDITOR_OVERLAY_KEY, JSON.stringify(file))
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getOverlay(levelId: string): EditorLevelOverlay | undefined {
  const entry = readFile().levels[levelId]
  return entry ? cloneJson(entry) : undefined
}

export function setOverlay(levelId: string, overlay: EditorLevelOverlay): void {
  const file = readFile()
  file.levels[levelId] = cloneJson(overlay)
  writeFile(file)
}

export function clearOverlay(levelId: string): void {
  const file = readFile()
  delete file.levels[levelId]
  writeFile(file)
}

export function hasOverlay(levelId: string): boolean {
  return Boolean(readFile().levels[levelId])
}

export function cloneStoryLevel(def: StoryLevelDef): StoryLevelDef {
  return cloneJson(def)
}

export function captureOverlay(def: StoryLevelDef, world: AssembledLevel): EditorLevelOverlay {
  return {
    playerSpawn: { ...def.playerSpawn },
    moonPool: def.moonPool ? { ...def.moonPool } : undefined,
    exit: { ...def.exit },
    platforms: world.platforms.map((rect) => ({ ...rect })),
    movers: world.movers.map((mover) => ({ ...mover })),
    enemies: world.enemies.map((enemy) => ({ ...enemy })),
  }
}

export function applyOverlay(def: StoryLevelDef, world: AssembledLevel): AssembledLevel {
  const overlay = getOverlay(def.id)
  if (!overlay) {
    return world
  }
  def.playerSpawn = { ...overlay.playerSpawn }
  if (overlay.moonPool) {
    def.moonPool = { ...overlay.moonPool }
  }
  def.exit = { ...overlay.exit }
  return {
    ...world,
    platforms: overlay.platforms.map((rect) => ({ ...rect })),
    movers: overlay.movers.map((mover) => ({ ...mover })),
    enemies: overlay.enemies.map((enemy) => ({ ...enemy })),
  }
}

export function ensureOverlay(def: StoryLevelDef, world: AssembledLevel): EditorLevelOverlay {
  return getOverlay(def.id) ?? captureOverlay(def, world)
}

export function snap10(n: number): number {
  return Math.round(n / 10) * 10
}

export function chunkIndexForX(world: AssembledLevel, worldX: number): number {
  const origins = world.chunkOrigins
  if (origins.length === 0) {
    return 0
  }
  let idx = 0
  for (let i = 0; i < origins.length; i += 1) {
    const origin = origins[i] ?? 0
    const next = origins[i + 1] ?? world.width
    if (worldX >= origin && worldX < next) {
      idx = i
    }
  }
  if (worldX >= world.width) {
    idx = origins.length - 1
  }
  return Math.max(0, idx)
}

export function worldToAnchor(
  world: AssembledLevel,
  worldX: number,
  worldY: number,
): { chunk: number; x: number; y: number } {
  const chunk = chunkIndexForX(world, worldX)
  const origin = world.chunkOrigins[chunk] ?? 0
  return { chunk, x: worldX - origin, y: worldY }
}
