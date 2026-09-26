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
  if (kind === "trough" || asset === "trough") {
    return "story_trough"
  }
  if (kind === "reflection") {
    return "story_reflection"
  }
  if (kind === "stalactite" || asset === "stalactite") {
    return "story_stalactite"
  }
  if (kind === "wellhead" || asset === "wellhead") {
    return "story_wellhead"
  }
  if (kind === "dewPlate" || asset === "dewplate") {
    return "story_dewplate"
  }
  if (kind === "toad" || asset === "toad") {
    return "story_toad"
  }
  if (kind === "heartwood" || asset === "heartwood") {
    return "story_heartwood"
  }
  if (kind === "crater" || asset === "crater") {
    return "story_crater"
  }
  if (kind === "mast" || asset === "mast") {
    return "story_mast"
  }
  if (kind === "moonDoor" || asset === "moondoor") {
    return "story_moondoor"
  }
  if (kind === "chimeFrame" || asset === "chimeframe") {
    return "story_chimeframe"
  }
  if (kind === "mortar" || asset === "mortar") {
    return "story_mortar"
  }
  if (kind === "rack" || asset === "rack") {
    return "story_rack"
  }
  if (kind === "column") {
    return "story_hedge_moon"
  }
  if (kind === "kit") {
    return "story_bunny"
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
  // Moon doors and chime frames stand behind the pads Mei uses.
  const behind =
    item.kind === "heartwood"
      ? 0.6
      : item.kind === "moonDoor" || item.kind === "crater"
        ? 0.8
      : item.kind === "chimeFrame" || item.kind === "mast"
        ? 0.9
        : null
  sprite.setDepth(behind ?? (item.kind === "grass" ? 1.4 : item.kind === "kit" ? 3 : 2))
  if (item.kind === "kit") {
    sprite.setTint(index % 2 === 0 ? 0xf2d4b8 : 0xe8c8a0)
  }
  if (item.kind === "lantern") {
    sprite.setTint(0xe07040)
  }
  if (item.kind === "vine" && !isLunarEnv(item.env || env)) {
    sprite.setTint(0x6f8f52)
  }
  if (item.kind === "reflection") {
    // Looks like a lip until well silver lights it. No collider.
    sprite.setDepth(1)
    sprite.setData("reflection", true)
  }
  sprite.setData("editKind", "decor")
  sprite.setData("editIndex", index)
  applyPlaceableTrigger(item)
  return sprite
}
