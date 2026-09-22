export const EXIT_CONTACT = { w: 50, h: 34, ox: -25, oy: -8 }
export const POOL_CONTACT = { w: 74, h: 30, ox: -37, oy: -13 }

export const POOL_DORMANT_TINT = 0x5a6e82
export const POOL_AWAKE_TINT = 0xe8f4ff

export const EXIT_HOLE = { rx: 32, ry: 26, cy: 8 }

export function applyContactBody(
  go: Phaser.GameObjects.GameObject,
  size: { w: number; h: number; ox: number; oy: number },
): void {
  const body = (go as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody | null
  if (!body) {
    return
  }
  body.updateFromGameObject()
  body.setSize(size.w, size.h, false)
  body.setOffset(size.ox, size.oy)
}

export function playerInExitHole(
  player: Phaser.GameObjects.Sprite,
  exit: Phaser.GameObjects.Image,
): boolean {
  const nx = (player.x - exit.x) / EXIT_HOLE.rx
  const ny = (player.y - (exit.y + EXIT_HOLE.cy)) / EXIT_HOLE.ry
  return nx * nx + ny * ny <= 1
}
