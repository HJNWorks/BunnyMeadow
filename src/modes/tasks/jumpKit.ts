import Phaser from "phaser"
import { getEnemyKit } from "../story/shared/enemyKit"

export type JumpMob = {
  sprite: Phaser.Physics.Arcade.Sprite
  role: "perch"
  pad: Phaser.GameObjects.Image
  dir: number
  id: string
}

export function spawnJumpPerch(
  scene: Phaser.Scene,
  pad: Phaser.GameObjects.Image,
  id: "fox" | "hedgehog",
): JumpMob {
  const kit = getEnemyKit(id)
  const sprite = scene.physics.add.sprite(pad.x, pad.y - pad.displayHeight * 0.5 - kit.h * 0.42, kit.texture)
  sprite.setDisplaySize(kit.w, kit.h)
  sprite.setDepth(6)
  const body = sprite.body as Phaser.Physics.Arcade.Body
  body.setAllowGravity(false)
  body.setImmovable(true)
  return {
    sprite,
    role: "perch",
    pad,
    dir: Math.random() < 0.5 ? -1 : 1,
    id,
  }
}

export function updateJumpMobs(mobs: JumpMob[], dt: number): void {
  for (const mob of mobs) {
    if (!mob.sprite.active) {
      continue
    }
    const half = mob.pad.displayWidth * 0.32
    mob.sprite.x += mob.dir * 42 * dt
    if (Math.abs(mob.sprite.x - mob.pad.x) > half) {
      mob.dir *= -1
      mob.sprite.x = mob.pad.x + mob.dir * half
    }
    mob.sprite.y = mob.pad.y - mob.pad.displayHeight * 0.5 - mob.sprite.displayHeight * 0.42
    if (mob.dir !== 0) {
      mob.sprite.setFlipX(mob.dir > 0)
    }
  }
}

// TODO: hop_ledge, drop_shot, stoop, column_swipe, ledge_charge, drift wildlife

export function stompOrSide(
  player: Phaser.Physics.Arcade.Sprite,
  mob: JumpMob,
): "stomp" | "side" | null {
  if (!mob.sprite.active) {
    return null
  }
  const pb = player.body as Phaser.Physics.Arcade.Body
  const mb = mob.sprite.body as Phaser.Physics.Arcade.Body
  if (!pb || !mb) {
    return null
  }
  const overlapX = Math.abs(player.x - mob.sprite.x) < (pb.width + mb.width) * 0.42
  const overlapY = Math.abs(player.y - mob.sprite.y) < (pb.height + mb.height) * 0.48
  if (!overlapX || !overlapY) {
    return null
  }
  if (pb.velocity.y > 80 && pb.bottom <= mb.top + 22) {
    return "stomp"
  }
  return "side"
}
