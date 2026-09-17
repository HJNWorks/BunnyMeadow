import {
  ChunkAssembler,
  type AssembledLevel,
  type ChunkDef,
} from "../../../systems/ChunkAssembler"
import type { StoryLevelDef } from "../levels"
import { worldToAnchor, type EditorLevelOverlay } from "./overlayStore"

export type EditorExportBundle = {
  levelId: string
  level: {
    playerSpawn: { x: number; y: number }
    moonPool?: { chunk: number; x: number; y: number }
    exit: { chunk: number; x: number; y: number }
  }
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
    copy.enemies = []
    copy.movers = []
    chunks[id] = copy
  }

  const pushRect = (
    kind: "platform" | "wall",
    x: number,
    y: number,
    w: number,
    h: number,
  ): void => {
    const anchor = worldToAnchor(world, x, y)
    const id = world.chunks[anchor.chunk]
    if (!id || !chunks[id]) {
      return
    }
    const rect = { x: anchor.x, y, w, h }
    if (kind === "wall") {
      chunks[id].walls.push(rect)
    } else {
      chunks[id].platforms.push(rect)
    }
  }

  for (const rect of overlay.platforms) {
    pushRect(rect.kind, rect.x, rect.y, rect.w, rect.h)
  }

  for (const enemy of overlay.enemies) {
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

  const lastId = world.chunks[world.chunks.length - 1]
  if (lastId && chunks[lastId]) {
    const origin = world.chunkOrigins[world.chunkOrigins.length - 1] ?? 0
    const span = Math.max(120, (overlay.worldWidth ?? world.width) - origin)
    chunks[lastId].width = span
  }

  const moonPool = overlay.moonPool
    ? worldToAnchor(
        world,
        (world.chunkOrigins[overlay.moonPool.chunk] ?? 0) + overlay.moonPool.x,
        overlay.moonPool.y,
      )
    : undefined

  const exit = worldToAnchor(
    world,
    (world.chunkOrigins[overlay.exit.chunk] ?? 0) + overlay.exit.x,
    overlay.exit.y,
  )

  return {
    levelId: def.id,
    level: {
      playerSpawn: { ...overlay.playerSpawn },
      moonPool,
      exit,
    },
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
