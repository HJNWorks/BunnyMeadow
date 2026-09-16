import Phaser from "phaser"

export function spawnEnemy(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  enemies: Phaser.Physics.Arcade.Group,
): Phaser.Physics.Arcade.Sprite {
  const texture =
    id === "crow"
      ? "story_crow"
      : id === "frost_wisp"
        ? "story_wisp"
        : id === "ice_spit"
          ? "story_ice"
          : id === "gale_magpie"
            ? "story_magpie"
            : "story_bunny"
  const sprite = scene.physics.add.sprite(x, y, texture)
  sprite.setData("id", id)
  if (id === "fox") {
    sprite.setDisplaySize(36, 36)
    sprite.setTint(0xdf8b4c)
    sprite.setData("archetype", "chaser")
    sprite.setData("speed", 90)
  } else if (id === "crow") {
    sprite.setDisplaySize(36, 28)
    sprite.setData("archetype", "ranged_lob")
    sprite.setData("speed", 40)
    sprite.setData("cooldown", 0)
    ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
  } else if (id === "goat") {
    sprite.setTint(0xd6c4a8)
    sprite.setDisplaySize(44, 40)
    sprite.setData("archetype", "blocker")
    sprite.setData("speed", 110)
    sprite.setData("stun", 0)
    sprite.setData("charging", 0)
  } else if (id === "frost_wisp") {
    sprite.setDisplaySize(52, 36)
    sprite.setData("archetype", "swarm")
    sprite.setData("speed", 28)
    sprite.setData("homeX", x)
    sprite.setData("homeY", y)
    sprite.setData("hoverT", Math.random() * Math.PI * 2)
    ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
  } else if (id === "ice_spit") {
    sprite.setDisplaySize(32, 32)
    sprite.setData("archetype", "ranged_lob")
    sprite.setData("speed", 0)
    sprite.setData("cooldown", 0.4)
  } else if (id === "gale_magpie") {
    sprite.setDisplaySize(40, 28)
    sprite.setData("archetype", "diver")
    sprite.setData("speed", 160)
    sprite.setData("homeX", x)
    sprite.setData("homeY", y)
    sprite.setData("phase", "hover")
    sprite.setData("timer", 0.8 + Math.random() * 0.8)
    sprite.setData("hoverT", Math.random() * Math.PI * 2)
    ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
  } else {
    sprite.setDisplaySize(36, 36)
    sprite.setTint(0xa8845c)
    sprite.setData("archetype", "patrol")
    sprite.setData("speed", 45)
    sprite.setData("dir", 1)
  }
  sprite.setCollideWorldBounds(true)
  const airborne = id === "frost_wisp" || id === "gale_magpie" || id === "crow"
  if (!airborne) {
    scene.physics.add.collider(sprite, platforms)
  }
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
        const ice = enemy.getData("id") === "ice_spit"
        const shot = scene.physics.add.image(enemy.x, enemy.y, ice ? "story_frost" : "story_bunny")
        shot.setDisplaySize(ice ? 28 : 14, ice ? 12 : 14)
        if (!ice) {
          shot.setTint(0x4a3a2a)
        }
        const dx = target.x - enemy.x
        const dy = target.y - enemy.y
        const n = Math.hypot(dx, dy) || 1
        shot.setVelocity((dx / n) * 220, (dy / n) * 180 - 80)
        projectiles.add(shot)
        scene.time.delayedCall(2000, () => shot.destroy())
        cd = ice ? 1.7 : 1.8
      }
      enemy.setData("cooldown", cd)
      enemy.setVelocityX(0)
    } else if (arch === "blocker") {
      let stun = Number(enemy.getData("stun") || 0) - dt
      let charging = Number(enemy.getData("charging") || 0)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      if (stun > 0) {
        enemy.setVelocityX(0)
        enemy.setData("stun", stun)
        return
      }
      if (charging === 0 && Math.abs(target.x - enemy.x) < 220) {
        charging = Math.sign(target.x - enemy.x) || 1
        enemy.setData("charging", charging)
      }
      if (charging !== 0) {
        enemy.setVelocityX(charging * speed)
        if (body.blocked.left || body.blocked.right) {
          enemy.setData("charging", 0)
          enemy.setData("stun", 0.7)
          enemy.setVelocityX(0)
        }
      } else {
        enemy.setVelocityX(0)
      }
    } else if (arch === "swarm") {
      const hoverT = Number(enemy.getData("hoverT") || 0) + dt
      enemy.setData("hoverT", hoverT)
      const homeX = Number(enemy.getData("homeX") ?? enemy.x)
      const homeY = Number(enemy.getData("homeY") ?? enemy.y)
      enemy.setVelocity(
        Math.sin(hoverT) * speed,
        Math.cos(hoverT * 0.8) * (speed * 0.6) + (homeY - enemy.y) * 0.4,
      )
      if (Math.abs(enemy.x - homeX) > 90) {
        enemy.setVelocityX(Math.sign(homeX - enemy.x) * speed)
      }
    } else if (arch === "diver") {
      let phase = String(enemy.getData("phase") || "hover")
      let timer = Number(enemy.getData("timer") || 0) - dt
      const homeX = Number(enemy.getData("homeX") ?? enemy.x)
      const homeY = Number(enemy.getData("homeY") ?? enemy.y)
      const hoverT = Number(enemy.getData("hoverT") || 0) + dt
      enemy.setData("hoverT", hoverT)
      if (phase === "hover") {
        enemy.setVelocity(Math.sin(hoverT) * 50, Math.cos(hoverT) * 28)
        if (timer <= 0 && Math.abs(target.x - enemy.x) < 420) {
          phase = "dive"
          timer = 0.7
          const dx = target.x - enemy.x
          const dy = target.y - enemy.y
          const n = Math.hypot(dx, dy) || 1
          enemy.setVelocity((dx / n) * speed, (dy / n) * speed)
        }
      } else if (phase === "dive") {
        if (timer <= 0) {
          phase = "return"
          timer = 1.1
        }
      } else {
        const dx = homeX - enemy.x
        const dy = homeY - enemy.y
        const n = Math.hypot(dx, dy) || 1
        enemy.setVelocity((dx / n) * 90, (dy / n) * 90)
        if (n < 24) {
          phase = "hover"
          timer = 0.9 + Math.random() * 0.7
          enemy.setPosition(homeX, homeY)
        }
      }
      enemy.setData("phase", phase)
      enemy.setData("timer", timer)
    }
  })
}
