import { getContentFlags } from "../../../core/ModeContext"
import type { EditorMode } from "./BuildHud"
import { getLastEditorStation, setLastEditorStation } from "./worldIndex"

export { applyOverlay, cloneStoryLevel, clearOverlay, ensureOverlay, getOverlay, resolveWorldHeight } from "./overlayStore"
export { mountBuildHud, type EditorMode, type EditorSession } from "./BuildHud"

export function isEditorEnabled(): boolean {
  return import.meta.env.DEV && getContentFlags().storyMapEditor === true
}

export function startEditor(scene: Phaser.Scene, levelId?: string, mode: EditorMode = "build"): void {
  if (!isEditorEnabled()) {
    return
  }
  const id = levelId ?? getLastEditorStation()
  setLastEditorStation(id)
  scene.scene.start("Story", { levelId: id, editor: { mode } })
}
