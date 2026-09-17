export const EXIT_CONTACT = { w: 74, h: 50, ox: -37, oy: -18 }
export const POOL_CONTACT = { w: 74, h: 30, ox: -37, oy: -13 }

export const POOL_DORMANT_TINT = 0x5a6e82
export const POOL_AWAKE_TINT = 0xe8f4ff

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
