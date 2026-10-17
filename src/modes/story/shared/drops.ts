import Phaser from "phaser"
import type { AssembledHazard } from "../../../systems/ChunkAssembler"

/**
 * Hanging things that shiver when Mei passes under them, then fall the height of
 * their hazard rect. Peach Rows green fruit and Grotto Heaven stalactites.
 * A hit costs one heart (a dash passes). They hang again a moment later.
 */
export type DropState = {
  sprite: Phaser.GameObjects.Image
  homeX: number
  homeY: number
  floorY: number
  reach: number
  phase: "hang" | "shiver" | "fall" | "gone"
  t: number
  vy: number
}

const SHIVER_S = 0.55
const REHANG_S = 2.4
const GRAVITY = 1700

function dropTexture(hazard: AssembledHazard): string {
  return hazard.drop === "fruit" ? "story_greenfruit" : "story_stalactite_jade"
}

export function createDrops(scene: Phaser.Scene, hazards: AssembledHazard[]): DropState[] {
  const states: DropState[] = []
  for (const hazard of hazards) {
    if (hazard.kind !== "drop") {
      continue
    }
    const key = dropTexture(hazard)
    const frame = scene.textures.exists(key) ? scene.textures.getFrame(key) : null
    const w = frame?.width ?? 24
    const h = frame?.height ?? 24
    const x = hazard.worldX + hazard.w / 2
    const y = hazard.worldY + h / 2
    const sprite = scene.add.image(x, y, key).setDepth(2.2)
    states.push({
      sprite,
      homeX: x,
      homeY: y,
      floorY: hazard.worldY + hazard.h,
      reach: Math.max(hazard.w / 2, w / 2) + 40,
      phase: "hang",
      t: 0,
      vy: 0,
    })
  }
  return states
}

export function resetDrops(states: DropState[]): void {
  for (const drop of states) {
    drop.phase = "hang"
    drop.t = 0
    drop.vy = 0
    drop.sprite.setPosition(drop.homeX, drop.homeY).setAlpha(1).setVisible(true)
  }
}

/** Returns true when a falling drop strikes Mei this frame. */
export function tickDrops(
  states: DropState[],
  player: Phaser.Physics.Arcade.Sprite,
  dt: number,
  reducedMotion: boolean,
): boolean {
  let struck = false
  const body = player.body as Phaser.Physics.Arcade.Body | null
  for (const drop of states) {
    const sprite = drop.sprite
    if (drop.phase === "hang") {
      const under = Math.abs(player.x - drop.homeX) < drop.reach && player.y > drop.homeY && player.y < drop.floorY + 60
      if (under) {
        drop.phase = "shiver"
        drop.t = SHIVER_S
      }
      continue
    }
    if (drop.phase === "shiver") {
      drop.t -= dt
      sprite.x = drop.homeX + (reducedMotion ? 0 : Math.sin(drop.t * 60) * 2.5)
      if (drop.t <= 0) {
        sprite.x = drop.homeX
        drop.phase = "fall"
        drop.vy = 0
      }
      continue
    }
    if (drop.phase === "fall") {
      drop.vy += GRAVITY * dt
      sprite.y += drop.vy * dt
      const halfW = sprite.displayWidth / 2
      const halfH = sprite.displayHeight / 2
      if (
        body &&
        body.right > sprite.x - halfW + 4 &&
        body.left < sprite.x + halfW - 4 &&
        body.bottom > sprite.y - halfH + 4 &&
        body.top < sprite.y + halfH - 2
      ) {
        struck = true
        drop.phase = "gone"
        drop.t = REHANG_S
        sprite.setVisible(false)
        continue
      }
      if (sprite.y + halfH >= drop.floorY) {
        drop.phase = "gone"
        drop.t = REHANG_S
        sprite.setVisible(false)
      }
      continue
    }
    drop.t -= dt
    if (drop.t <= 0) {
      drop.phase = "hang"
      sprite.setPosition(drop.homeX, drop.homeY).setVisible(true).setAlpha(0)
      sprite.scene.tweens.add({ targets: sprite, alpha: 1, duration: 320 })
    }
  }
  return struck
}
