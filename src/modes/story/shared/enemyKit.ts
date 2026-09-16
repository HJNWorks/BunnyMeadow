import Phaser from "phaser"

export function spawnEnemy(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  enemies: Phaser.Physics.Arcade.Group,
): Phaser.Physics.Arcade.Sprite {
  const texture = id === "crow" ? "story_crow" : "story_bunny"
  const sprite = scene.physics.add.sprite(x, y, texture)
  sprite.setDisplaySize(id === "crow" ? 36 : 36, id === "crow" ? 28 : 36)
  if (id === "fox") {
    sprite.setTint(0xdf8b4c)
    sprite.setData("archetype", "chaser")
    sprite.setData("speed", 90)
  } else if (id === "crow") {
    sprite.setData("archetype", "ranged_lob")
    sprite.setData("speed", 40)
    sprite.setData("cooldown", 0)
    ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
  } else {
    sprite.setTint(0xa8845c)
    sprite.setData("archetype", "patrol")
    sprite.setData("speed", 45)
    sprite.setData("dir", 1)
  }
  sprite.setCollideWorldBounds(true)
  scene.physics.add.collider(sprite, platforms)
  enemies.add(sprite)
  return sprite
}

export function patrolHasFloorAhead(
  enemy: Phaser.Physics.Arcade.Sprite,
  dir: number,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): boolean {
  const body = enemy.body as Phaser.Physics.Arcade.Body
  const probeX = dir > 0 ? body.right + 6 : body.left - 6
  const probeY = body.bottom + 6
  for (const obj of platforms.getChildren()) {
    const plat = obj as Phaser.GameObjects.GameObject & {
      body?: Phaser.Physics.Arcade.StaticBody
    }
    const pb = plat.body
    if (!pb) {
      continue
    }
    if (probeX >= pb.left && probeX <= pb.right && probeY >= pb.top && probeY <= pb.bottom + 8) {
      return true
    }
  }
  return false
}

export function updateEnemies(
  scene: Phaser.Scene,
  enemies: Phaser.Physics.Arcade.Group,
  projectiles: Phaser.Physics.Arcade.Group,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  target: { x: number; y: number },
  dt: number,
): void {
  enemies.getChildren().forEach((obj) => {
    const enemy = obj as Phaser.Physics.Arcade.Sprite
    if (!enemy.active || !enemy.body) {
      return
    }
    const arch = enemy.getData("archetype") as string
    const speed = Number(enemy.getData("speed") || 40)
    if (arch === "patrol") {
      let dir = Number(enemy.getData("dir") || 1)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      const onFloor = body.blocked.down || body.touching.down
      if (body.blocked.left || body.blocked.right || (onFloor && !patrolHasFloorAhead(enemy, dir, platforms))) {
        dir *= -1
        enemy.setData("dir", dir)
      }
      enemy.setVelocityX(dir * speed)
    } else if (arch === "chaser" || arch === "foxhu") {
      const dx = target.x - enemy.x
      enemy.setVelocityX(Math.sign(dx) * speed)
      if (arch === "foxhu") {
        enemy.setVelocityX(speed)
      }
    } else if (arch === "ranged_lob") {
      let cd = Number(enemy.getData("cooldown") || 0) - dt
      if (cd <= 0 && Math.abs(target.x - enemy.x) < 420) {
        const shot = scene.physics.add.image(enemy.x, enemy.y, "story_bunny")
        shot.setDisplaySize(14, 14)
        shot.setTint(0x4a3a2a)
        const dx = target.x - enemy.x
        const dy = target.y - enemy.y
        const n = Math.hypot(dx, dy) || 1
        shot.setVelocity((dx / n) * 220, (dy / n) * 180 - 80)
        projectiles.add(shot)
        scene.time.delayedCall(2000, () => shot.destroy())
        cd = 1.8
      }
      enemy.setData("cooldown", cd)
      enemy.setVelocityX(0)
    }
  })
}
