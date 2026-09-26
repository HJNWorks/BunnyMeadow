import {
  ChunkAssembler,
  type AssembledLevel,
  type AssembledRect,
  type ChunkDef,
} from "../../../systems/ChunkAssembler"
import type { StoryLevelDef, MoonPoolDef } from "../levels"
import { worldToAnchor, type EditorLevelOverlay } from "./overlayStore"

export type EditorExportBundle = {
  levelId: string
  level: {
    playerSpawn: { x: number; y: number }
    moonPool?: MoonPoolDef
    moonPools?: MoonPoolDef[]
    exit: { chunk: number; x: number; y: number }
    boss?: { kind?: string; hitsNeeded?: number; x: number; y: number }
    env?: string
    sky?: string
  }
  look?: EditorLevelOverlay["look"]
  decor?: EditorLevelOverlay["decor"]
  chunks: Record<string, ChunkDef>
}

export function buildExportBundle(
  def: StoryLevelDef,
  overlay: EditorLevelOverlay,
  world: AssembledLevel,
): EditorExportBundle {
  const assembler = new ChunkAssembler()
  const chunks: Record<string, ChunkDef> = {}
  for (const id of world.chunks) {
    const src = assembler.getChunk(id)
    if (!src) {
      continue
    }
    const copy = JSON.parse(JSON.stringify(src)) as ChunkDef
    copy.platforms = []
    copy.walls = []
    copy.ceilings = []
    copy.enemies = []
    copy.movers = []
    copy.hazards = []
    copy.decor = []
    copy.items = []
    copy.carrots = []
    chunks[id] = copy
  }

  const pushRect = (
    kind: "platform" | "wall" | "ceiling",
    x: number,
    y: number,
    w: number,
    h: number,
    extra?: {
      surface?: string
      break?: ChunkDef["platforms"][number]["break"]
      asset?: AssembledRect["asset"]
      rotation?: number
      env?: string
    },
  ): void => {
    const anchor = worldToAnchor(world, x, y)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      return
    }
    const rect = {
      x: anchor.x,
      y,
      w,
      h,
      ...(extra?.surface === "slick" ? { surface: "slick" as const } : {}),
      ...(extra?.break ? { break: extra.break } : {}),
      ...(extra?.asset ? { asset: extra.asset } : {}),
      ...(typeof extra?.rotation === "number" ? { rotation: extra.rotation } : {}),
      ...(extra?.env ? { env: extra.env } : {}),
    }
    if (kind === "wall") {
      chunks[id].walls.push(rect)
    } else if (kind === "ceiling") {
      chunks[id].ceilings = chunks[id].ceilings ?? []
      chunks[id].ceilings.push(rect)
    } else {
      chunks[id].platforms.push(rect)
    }
  }

  for (const rect of overlay.platforms) {
    pushRect(rect.kind, rect.x, rect.y, rect.w, rect.h, {
      surface: rect.surface,
      break: rect.break,
      asset: rect.asset,
      rotation: rect.rotation,
      env: rect.env,
    })
  }

  for (const enemy of overlay.enemies) {
    if (enemy.id === "still") {
      continue
    }
    const anchor = worldToAnchor(world, enemy.worldX, enemy.worldY)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      continue
    }
    chunks[id].enemies = chunks[id].enemies ?? []
    chunks[id].enemies.push({ id: enemy.id, x: anchor.x, y: enemy.worldY })
  }

  for (const mover of overlay.movers) {
    const anchor = worldToAnchor(world, mover.worldX, mover.worldY)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      continue
    }
    chunks[id].movers = chunks[id].movers ?? []
    chunks[id].movers.push({
      x: anchor.x,
      y: mover.worldY,
      w: mover.w,
      h: mover.h,
      axis: mover.axis,
      amplitude: mover.amplitude,
      speed: mover.speed,
      tint: mover.tint,
      kind: mover.kind,
    })
  }

  for (const hazard of overlay.hazards ?? []) {
    const anchor = worldToAnchor(world, hazard.worldX, hazard.worldY)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      continue
    }
    chunks[id].hazards = chunks[id].hazards ?? []
    chunks[id].hazards.push({
      x: anchor.x,
      y: hazard.worldY,
      w: hazard.w,
      h: hazard.h,
      kind: "water",
      current: hazard.current,
      trigger: hazard.trigger,
    })
  }

  for (const piece of overlay.decor ?? []) {
    const anchor = worldToAnchor(world, piece.x, piece.y)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      continue
    }
    chunks[id].decor = chunks[id].decor ?? []
    chunks[id].decor.push({
      ...piece,
      x: anchor.x,
      y: piece.y,
    })
  }

  for (const pickup of overlay.pickups ?? []) {
    const worldX = typeof pickup.worldX === "number" ? pickup.worldX : pickup.x
    const worldY = typeof pickup.worldY === "number" ? pickup.worldY : pickup.y
    const anchor = worldToAnchor(world, worldX, worldY)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      continue
    }
    if (pickup.id === "carrot") {
      chunks[id].carrots = chunks[id].carrots ?? []
      chunks[id].carrots.push({ x: anchor.x, y: worldY })
      continue
    }
    chunks[id].items = chunks[id].items ?? []
    chunks[id].items.push({ id: pickup.id, x: anchor.x, y: worldY })
  }

  const lastId = world.chunks[world.chunks.length - 1]
  if (lastId && chunks[lastId]) {
    const origin = world.chunkOrigins[world.chunkOrigins.length - 1] ?? 0
    const span = Math.max(120, (overlay.worldWidth ?? world.width) - origin)
    chunks[lastId].width = span
  }

  const moonPools = (overlay.moonPools ?? []).map((pool) => {
    const worldPos = worldToAnchor(
      world,
      (world.chunkOrigins[pool.chunk] ?? 0) + pool.x,
      pool.y,
    )
    const next: MoonPoolDef = { ...worldPos }
    if (pool.line) {
      next.line = pool.line
    }
    return next
  })

  const exit = worldToAnchor(
    world,
    (world.chunkOrigins[overlay.exit.chunk] ?? 0) + overlay.exit.x,
    overlay.exit.y,
  )

  return {
    levelId: def.id,
    level: {
      playerSpawn: { ...overlay.playerSpawn },
      moonPools,
      moonPool: moonPools[0],
      exit,
      boss: overlay.boss
        ? {
            ...(def.boss ?? { kind: "still", hitsNeeded: 13 }),
            x: overlay.boss.x,
            y: overlay.boss.y,
          }
        : def.boss
          ? { kind: def.boss.kind, hitsNeeded: def.boss.hitsNeeded, x: def.boss.x ?? 0, y: def.boss.y ?? 0 }
          : undefined,
      env: overlay.look?.env,
      sky: overlay.look?.sky,
    },
    look: overlay.look,
    decor: overlay.decor,
    chunks,
  }
}

export function downloadEditorJson(
  def: StoryLevelDef,
  overlay: EditorLevelOverlay,
  world: AssembledLevel,
): void {
  const bundle = buildExportBundle(def, overlay, world)
  const blob = new Blob([`${JSON.stringify(bundle, null, 2)}\n`], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${def.id}.editor.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
