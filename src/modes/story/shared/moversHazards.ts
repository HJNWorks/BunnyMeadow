import Phaser from "phaser"
import type { AssembledHazard, AssembledMover } from "../../../systems/ChunkAssembler"

export type MoverState = {
  sprite: Phaser.Physics.Arcade.Image
  baseX: number
  baseY: number
  axis: "x" | "y"
  amplitude: number
  speed: number
  phase: number
}

export function createMovers(
  scene: Phaser.Scene,
  movers: AssembledMover[],
  player: Phaser.Physics.Arcade.Sprite,
): MoverState[] {
  const states: MoverState[] = []
  for (const mover of movers) {
    const sprite = scene.physics.add.image(
      mover.worldX + mover.w / 2,
      mover.worldY + mover.h / 2,
      mover.kind === "bridge" ? "story_bridge" : "story_log",
    )
    sprite.setDisplaySize(mover.w, mover.h)
    sprite.setTint(mover.tint ?? 0x8b5a2b)
    sprite.setDepth(3)
    sprite.setImmovable(true)
    const body = sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setSize(sprite.frame.width, sprite.frame.height)
    body.updateFromGameObject()
    scene.physics.add.collider(player, sprite)
    states.push({
      sprite,
      baseX: mover.worldX + mover.w / 2,
      baseY: mover.worldY + mover.h / 2,
      axis: mover.axis,
      amplitude: mover.amplitude,
      speed: mover.speed,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return states
}

export function updateMovers(
  states: MoverState[],
  player: Phaser.Physics.Arcade.Sprite,
  dt: number,
): void {
  for (const mover of states) {
    mover.phase += dt * mover.speed
    const offset = Math.sin(mover.phase) * mover.amplitude
    const nextX = mover.axis === "x" ? mover.baseX + offset : mover.baseX
    const nextY = mover.axis === "y" ? mover.baseY + offset : mover.baseY
    const dx = nextX - mover.sprite.x
    const dy = nextY - mover.sprite.y
    mover.sprite.setPosition(nextX, nextY)
    ;(mover.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
    const body = player.body as Phaser.Physics.Arcade.Body
    if (body.blocked.down || body.touching.down) {
      const onMover =
        Math.abs(player.x - mover.sprite.x) < mover.sprite.displayWidth * 0.55 &&
        Math.abs(player.y - (mover.sprite.y - mover.sprite.displayHeight * 0.5)) < 40
      if (onMover) {
        player.x += dx
        player.y += dy
      }
    }
  }
}

export function createWaterHazards(
  scene: Phaser.Scene,
  hazards: AssembledHazard[],
  player: Phaser.Physics.Arcade.Sprite,
  onOverlap: (water: Phaser.GameObjects.Rectangle) => void,
): Phaser.GameObjects.Rectangle[] {
  const rects: Phaser.GameObjects.Rectangle[] = []
  for (const hazard of hazards) {
    const water = scene.add.rectangle(
      hazard.worldX + hazard.w / 2,
      hazard.worldY + hazard.h / 2,
      hazard.w,
      hazard.h,
      0x4a90b8,
      0.45,
    )
    water.setDepth(0.5)
    water.setData("current", hazard.current ?? 0)
    water.setData("kind", hazard.kind)
    scene.physics.add.existing(water, true)
    rects.push(water)
    scene.physics.add.overlap(player, water, () => onOverlap(water))
  }
  return rects
}

export function applyWaterPhysics(
  player: Phaser.Physics.Arcade.Sprite,
  water: Phaser.GameObjects.Rectangle,
): boolean {
  const body = player.body as Phaser.Physics.Arcade.Body
  if (body.blocked.down || body.touching.down) {
    return false
  }
  const current = Number(water.getData("current") || 0)
  if (current !== 0) {
    body.velocity.x += current * 0.04
  }
  body.velocity.y = Math.min(body.velocity.y, 120)
  const bounds = water.getBounds()
  return player.y > bounds.centerY + 10
}
