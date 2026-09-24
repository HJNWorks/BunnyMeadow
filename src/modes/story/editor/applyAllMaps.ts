import { ChunkAssembler } from "../../../systems/ChunkAssembler"
import { writeRepoFile } from "../../../core/devWrite"
import { listStoryLevels } from "../levels"
import { getOverlay } from "./overlayStore"
import { buildExportBundle } from "./exportJson"

export async function writeAllStoryOverlays(): Promise<number> {
  const assembler = new ChunkAssembler()
  let wrote = 0
  for (const def of listStoryLevels()) {
    const overlay = getOverlay(def.id)
    if (!overlay) {
      continue
    }
    const world = assembler.assemble(def.chunks)
    if (typeof overlay.worldWidth === "number" && overlay.worldWidth > 0) {
      world.width = overlay.worldWidth
    }
    const bundle = buildExportBundle(def, overlay, world)
    const ok = await writeRepoFile(
      `src/data/editor-out/${def.id}.editor.json`,
      `${JSON.stringify(bundle, null, 2)}\n`,
    )
    if (ok) {
      wrote += 1
    }
  }
  return wrote
}
