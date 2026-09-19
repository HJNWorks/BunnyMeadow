import Phaser from "phaser"
import type { AssembledDecor } from "../../../systems/ChunkAssembler"
import { isLunarEnv } from "../shared/themeKit"
import { applyPlaceableTrigger } from "./placeables"

function textureForDecor(kind: AssembledDecor["kind"], asset?: string, env = ""): string {
  const lunar = isLunarEnv(env)
  if (kind === "falseMouth" || kind === "cave" || asset === "cave") {
    return "story_cave"
  }
  if (kind === "rim" || asset === "rim") {
    return "story_rim"
  }
  if (kind === "bowl" || asset === "bowl") {
    return "story_bowl"
  }
  if (kind === "wound" || asset === "wound") {
    return "story_wound"
  }
  if (kind === "column") {
    return "story_hedge_moon"
  }
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
    return "story_lantern"
  }
  if (kind === "grass") {
    return lunar ? "story_ground_moon" : "story_ground"
  }
  return lunar ? "story_hedge_moon" : "story_hedge"
}

export function spawnDecorItem(
  scene: Phaser.Scene,
  item: AssembledDecor,
  index: number,
  env = "",
): Phaser.GameObjects.Image {
  const sprite = scene.add.image(
    item.x + item.w / 2,
    item.y + item.h / 2,
    textureForDecor(item.kind, item.asset, item.env || env),
  )
  sprite.setDisplaySize(item.w, item.h)
  sprite.setAngle(item.rotation ?? 0)
  sprite.setDepth(item.kind === "grass" ? 1.4 : 2)
  if (item.kind === "lantern") {
    sprite.setTint(0xe07040)
  }
  if (item.kind === "vine" && !isLunarEnv(item.env || env)) {
    sprite.setTint(0x6f8f52)
  }
  sprite.setData("editKind", "decor")
  sprite.setData("editIndex", index)
  applyPlaceableTrigger(item)
  return sprite
}
