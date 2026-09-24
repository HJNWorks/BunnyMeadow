import type {
  AssembledDecor,
  AssembledEnemy,
  AssembledHazard,
  AssembledLevel,
  AssembledMover,
  AssembledRect,
} from "../../../systems/ChunkAssembler"
import type { MoonPoolDef, StoryLevelDef } from "../levels"
import { cloneMoonPool, poolsOf } from "../levels"
import type { PaletteHour, WeatherPreset } from "../shared/themeKit"

export const EDITOR_OVERLAY_KEY = "bunnymeadow.editor.overlay.v2"
const EDITOR_OVERLAY_LEGACY_KEY = "bunnymeadow.editor.overlay.v1"

export type EditorPickup = {
  id: string
  x: number
  y: number
  worldX: number
  worldY: number
}

export type EditorLook = {
  env?: string
  sky?: string
  far?: string
  fog?: string
  hour?: PaletteHour
  weather?: WeatherPreset
  night?: boolean
  nightAmount?: number
  haze?: boolean
  lanternGlow?: boolean
  lowGravity?: boolean
}

export type EditorRide = {
  w: number
  h: number
  speed: number
  points: { x: number; y: number }[]
}

export type EditorLevelOverlay = {
  playerSpawn: { x: number; y: number }
  ride?: EditorRide
  moonPool?: MoonPoolDef
  moonPools?: MoonPoolDef[]
  exit: { chunk: number; x: number; y: number }
  cartFlag?: { x: number; y: number }
  worldWidth: number
  shippedWidth?: number
  worldHeight?: number
  shippedHeight?: number
  shippedChunks?: string[]
  platforms: AssembledRect[]
  movers: AssembledMover[]
  enemies: AssembledEnemy[]
  pickups: EditorPickup[]
  decor?: AssembledDecor[]
  hazards?: AssembledHazard[]
  look?: EditorLook
}

type OverlayFile = {
  v: 1
  levels: Record<string, EditorLevelOverlay>
}

function emptyFile(): OverlayFile {
  return { v: 1, levels: {} }
}

function parseOverlayRaw(raw: string | null): OverlayFile | null {
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as OverlayFile
    if (parsed?.v !== 1 || typeof parsed.levels !== "object" || !parsed.levels) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function readFile(): OverlayFile {
  try {
    const current = parseOverlayRaw(localStorage.getItem(EDITOR_OVERLAY_KEY))
    const legacy = parseOverlayRaw(localStorage.getItem(EDITOR_OVERLAY_LEGACY_KEY))
    if (!current && !legacy) {
      return emptyFile()
    }
    if (!current && legacy) {
      writeFile(legacy)
      return legacy
    }
    if (current && legacy) {
      let changed = false
      for (const [levelId, overlay] of Object.entries(legacy.levels)) {
        if (!current.levels[levelId]) {
          current.levels[levelId] = overlay
          changed = true
        }
      }
      if (changed) {
        writeFile(current)
      }
      return current
    }
    return current ?? emptyFile()
  } catch {
    return emptyFile()
  }
}

function writeFile(file: OverlayFile): void {
  localStorage.setItem(EDITOR_OVERLAY_KEY, JSON.stringify(file))
}

export function overlayPools(overlay: EditorLevelOverlay): MoonPoolDef[] {
  if (overlay.moonPools) {
    return overlay.moonPools.map((pool) => cloneMoonPool(pool))
  }
  if (overlay.moonPool) {
    return [cloneMoonPool(overlay.moonPool)]
  }
  return []
}

function normalizeOverlay(overlay: EditorLevelOverlay): EditorLevelOverlay {
  overlay.moonPools = overlayPools(overlay)
  delete overlay.moonPool
  return overlay
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getOverlay(levelId: string): EditorLevelOverlay | undefined {
  const entry = readFile().levels[levelId]
  return entry ? normalizeOverlay(cloneJson(entry)) : undefined
}

export function setOverlay(levelId: string, overlay: EditorLevelOverlay): void {
  const file = readFile()
  file.levels[levelId] = normalizeOverlay(cloneJson(overlay))
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

export function overlayMatchesShipped(
  overlay: EditorLevelOverlay,
  def: StoryLevelDef,
  world: AssembledLevel,
): boolean {
  if (overlay.shippedChunks && overlay.shippedChunks.join(",") !== def.chunks.join(",")) {
    return false
  }
  if (!overlay.shippedChunks && typeof overlay.shippedWidth !== "number") {
    return overlay.worldWidth === world.width
  }
  return true
}

export function captureOverlay(
  def: StoryLevelDef,
  world: AssembledLevel,
  assembledWidth = world.width,
): EditorLevelOverlay {
  return {
    playerSpawn: { ...def.playerSpawn },
    moonPools: poolsOf(def),
    exit: { ...def.exit },
    cartFlag: def.cartFlag ? { ...def.cartFlag } : undefined,
    worldWidth: Math.max(world.width, assembledWidth),
    shippedWidth: assembledWidth,
    worldHeight: def.height ?? world.height,
    shippedHeight: def.height ?? world.height,
    shippedChunks: [...def.chunks],
    platforms: world.platforms.map((rect) => ({ ...rect })),
    movers: world.movers.map((mover) => ({ ...mover })),
    enemies: world.enemies.map((enemy) => ({ ...enemy })),
    pickups: [
      ...(world.items ?? []).map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        worldX: item.worldX,
        worldY: item.worldY,
      })),
      ...(world.carrots ?? []).map((carrot) => ({
        id: "carrot",
        x: carrot.x,
        y: carrot.y,
        worldX: carrot.worldX,
        worldY: carrot.worldY,
      })),
    ],
    decor: (world.decor ?? []).map((item) => ({ ...item })),
    hazards: (world.hazards ?? []).map((item) => ({ ...item })),
    look: {
      env: def.env,
      sky: def.sky,
    },
    ride: rideFromLevel(def, world),
  }
}

export function resolveWorldHeight(
  def: StoryLevelDef,
  assembledHeight: number,
  overlay?: EditorLevelOverlay,
): number {
  if (overlay && typeof overlay.worldHeight === "number" && overlay.worldHeight >= 1080) {
    return overlay.worldHeight
  }
  if (typeof def.height === "number" && def.height >= 1080) {
    return def.height
  }
  return assembledHeight > 0 ? assembledHeight : 1080
}

export function applyOverlay(def: StoryLevelDef, world: AssembledLevel): AssembledLevel {
  const overlay = getOverlay(def.id)
  if (!overlay) {
    return world
  }
  if (!overlayMatchesShipped(overlay, def, world)) {
    clearOverlay(def.id)
    return world
  }
  def.playerSpawn = { ...overlay.playerSpawn }
  def.moonPools = overlayPools(overlay)
  def.moonPool = undefined
  def.exit = { ...overlay.exit }
  if (overlay.cartFlag) {
    def.cartFlag = { ...overlay.cartFlag }
  }
  if (def.ride && overlay.ride && overlay.ride.points.length > 0) {
    def.ride = {
      w: overlay.ride.w,
      h: overlay.ride.h,
      speed: overlay.ride.speed,
      waypoints: overlay.ride.points.map((point) => worldToAnchor(world, point.x, point.y)),
    }
  }
  const width =
    typeof overlay.worldWidth === "number" && overlay.worldWidth > 0
      ? overlay.worldWidth
      : world.width
  const height = resolveWorldHeight(def, world.height, overlay)
  const pickups = overlay.pickups ?? []
  if (overlay.look?.env) {
    def.env = overlay.look.env
  }
  if (overlay.look?.sky) {
    def.sky = overlay.look.sky
  }
  return {
    ...world,
    width,
    height,
    platforms: overlay.platforms.map((rect) => ({ ...rect })),
    movers: overlay.movers.map((mover) => ({ ...mover })),
    enemies: overlay.enemies.map((enemy) => ({ ...enemy })),
    hazards: (overlay.hazards ?? world.hazards).map((item) => ({ ...item })),
    decor: (overlay.decor ?? world.decor ?? []).map((item) => ({ ...item })),
    carrots: pickups
      .filter((item) => item.id === "carrot")
      .map((item) => ({
        x: item.x,
        y: item.y,
        worldX: item.worldX,
        worldY: item.worldY,
      })),
    items: pickups
      .filter((item) => item.id !== "carrot")
      .map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        worldX: item.worldX,
        worldY: item.worldY,
      })),
  }
}

export function ensureOverlay(
  def: StoryLevelDef,
  world: AssembledLevel,
  assembledWidth = world.width,
): EditorLevelOverlay {
  const existing = getOverlay(def.id)
  if (!existing || !overlayMatchesShipped(existing, def, world)) {
    if (existing) {
      clearOverlay(def.id)
    }
    return captureOverlay(def, world, assembledWidth)
  }
  normalizeOverlay(existing)
  if (existing.shippedWidth !== assembledWidth) {
    existing.shippedWidth = assembledWidth
    setOverlay(def.id, existing)
  }
  if (typeof existing.worldWidth !== "number" || existing.worldWidth <= 0) {
    existing.worldWidth = Math.max(world.width, assembledWidth)
  }
  const authoredHeight = def.height ?? world.height
  if (typeof existing.worldHeight !== "number" || existing.worldHeight <= 0) {
    existing.worldHeight = authoredHeight
    existing.shippedHeight = authoredHeight
    setOverlay(def.id, existing)
  } else if (existing.worldHeight === existing.shippedHeight && existing.shippedHeight !== authoredHeight) {
    existing.worldHeight = authoredHeight
    existing.shippedHeight = authoredHeight
    setOverlay(def.id, existing)
  }
  if (!existing.pickups) {
    existing.pickups = []
  }
  if (!existing.decor) {
    existing.decor = (world.decor ?? []).map((item) => ({ ...item }))
  }
  if (!existing.hazards) {
    existing.hazards = (world.hazards ?? []).map((item) => ({ ...item }))
  }
  if (!existing.look) {
    existing.look = { env: def.env, sky: def.sky }
  }
  if (!existing.cartFlag && def.cartFlag) {
    existing.cartFlag = { ...def.cartFlag }
  }
  if (!existing.ride && def.ride) {
    existing.ride = rideFromLevel(def, world)
  }
  return existing
}

function rideFromLevel(def: StoryLevelDef, world: AssembledLevel): EditorRide | undefined {
  if (!def.ride || def.ride.waypoints.length === 0) {
    return undefined
  }
  return {
    w: def.ride.w,
    h: def.ride.h,
    speed: def.ride.speed,
    points: def.ride.waypoints.map((point) => ({
      x: (world.chunkOrigins[point.chunk] ?? 0) + point.x,
      y: point.y,
    })),
  }
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
