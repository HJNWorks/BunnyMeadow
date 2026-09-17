import Phaser from "phaser"
import { getContentFlags } from "../../../core/ModeContext"
import type { EditorMode } from "./BuildHud"

export { applyOverlay, cloneStoryLevel, clearOverlay, ensureOverlay, getOverlay } from "./overlayStore"
export { mountBuildHud, type EditorMode, type EditorSession } from "./BuildHud"

export function isEditorEnabled(): boolean {
  return getContentFlags().storyMapEditor === true
}

export function startEditor(scene: Phaser.Scene, levelId: string, mode: EditorMode): void {
  if (!isEditorEnabled()) {
    return
  }
  scene.scene.start("Story", { levelId, editor: { mode } })
}
