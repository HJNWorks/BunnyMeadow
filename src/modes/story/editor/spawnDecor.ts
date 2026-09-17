import Phaser from "phaser"
import type { AssembledDecor } from "../../../systems/ChunkAssembler"

function textureForDecor(kind: AssembledDecor["kind"], asset?: string): string {
  if (asset === "exit" || kind === "burrow") {
    return "story_exit"
  }
  if (asset === "log" || kind === "log") {
    return "story_log"
  }
  if (asset === "bridge") {
    return "story_bridge"
  }
  if (asset === "pool") {
    return "story_pool"
  }
  if (kind === "lantern" || asset === "lantern") {
    return "story_pool"
  }
  if (kind === "grass") {
    return "story_ground"
  }
  return "story_hedge"
}

export function spawnDecorItem(
  scene: Phaser.Scene,
  item: AssembledDecor,
  index: number,
): Phaser.GameObjects.Image {
  const sprite = scene.add.image(item.x + item.w / 2, item.y + item.h / 2, textureForDecor(item.kind, item.asset))
  sprite.setDisplaySize(item.w, item.h)
  sprite.setAngle(item.rotation ?? 0)
  sprite.setDepth(item.kind === "grass" ? 1.4 : 2)
  if (item.kind === "lantern") {
    sprite.setTint(0xe07040)
  }
  if (item.kind === "vine") {
    sprite.setTint(0x6f8f52)
  }
  sprite.setData("editKind", "decor")
  sprite.setData("editIndex", index)
  return sprite
}
