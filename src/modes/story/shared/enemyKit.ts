import Phaser from "phaser"

type EnemyKit = {
  texture: string
  source: string
  w: number
  h: number
  archetype: string
  speed: number
  fly?: boolean
}

const KITS: Record<string, EnemyKit> = {
  fox: { texture: "story_critter_fox", source: "story_fox", w: 48, h: 36, archetype: "chaser", speed: 90 },
  hedgehog: { texture: "story_critter_hedgehog", source: "story_hedgehog", w: 40, h: 32, archetype: "patrol", speed: 45 },
  crow: { texture: "story_critter_crow", source: "story_crow", w: 36, h: 28, archetype: "ranged_lob", speed: 40, fly: true },
  squirrel: { texture: "story_critter_squirrel", source: "story_squirrel", w: 36, h: 36, archetype: "ranged_lob", speed: 50 },
  frog: { texture: "story_critter_frog", source: "story_frog", w: 36, h: 28, archetype: "patrol", speed: 55 },
  heron: { texture: "story_critter_heron", source: "story_heron", w: 42, h: 52, archetype: "reach", speed: 0 },
  cat: { texture: "story_critter_cat", source: "story_cat", w: 40, h: 32, archetype: "reach", speed: 20 },
  owl: { texture: "story_critter_owl", source: "story_owl", w: 38, h: 32, archetype: "diver", speed: 150, fly: true },
  goat: { texture: "story_critter_goat", source: "story_goat", w: 44, h: 40, archetype: "blocker", speed: 110 },
  boar: { texture: "story_critter_boar", source: "story_boar", w: 48, h: 36, archetype: "blocker", speed: 95 },
  tortoise: { texture: "story_critter_tortoise", source: "story_tortoise", w: 40, h: 28, archetype: "patrol", speed: 22 },
  bees: { texture: "story_critter_bees", source: "story_bees", w: 44, h: 32, archetype: "swarm", speed: 36, fly: true },
  frost_wisp: { texture: "story_critter_frost_wisp", source: "story_wisp", w: 52, h: 36, archetype: "swarm", speed: 28, fly: true },
  ice_spit: { texture: "story_critter_ice_spit", source: "story_ice", w: 32, h: 32, archetype: "ranged_lob", speed: 0 },
  gale_magpie: { texture: "story_critter_gale_magpie", source: "story_magpie", w: 40, h: 28, archetype: "diver", speed: 160, fly: true },
}

export function critterTextureKey(id: string): string {
  return `story_critter_${id}`
}

export function getEnemyKit(id: string): EnemyKit {
  return KITS[id] ?? KITS.hedgehog!
}

export function listEnemyKits(): { id: string; kit: EnemyKit }[] {
  return Object.entries(KITS).map(([id, kit]) => ({ id, kit }))
}

export function freezeEnemyForEditor(sprite: Phaser.Physics.Arcade.Sprite): void {
  const body = sprite.body as Phaser.Physics.Arcade.Body | null
  if (!body) {
    return
  }
  body.setAllowGravity(false)
  body.setGravity(0, 0)
  body.setVelocity(0, 0)
  body.setImmovable(true)
}

function platformBody(
  obj: Phaser.GameObjects.GameObject,
): Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | null {
  return (obj as Phaser.GameObjects.GameObject & {
    body?: Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | null
  }).body ?? null
}

function highestFloorTop(
  sprite: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): number | null {
  const body = sprite.body as Phaser.Physics.Arcade.Body | null
  if (!body) {
    return null
  }
  const midX = sprite.x
  const feet = body.bottom
  let best: number | null = null
  for (const obj of platforms.getChildren()) {
    const pb = platformBody(obj)
    if (!pb) {
      continue
    }
    if (midX < pb.left - 8 || midX > pb.right + 8) {
      continue
    }
    const top = pb.top
    if (top > feet + 400 || top < feet - body.height - 8) {
      continue
    }
    if (best === null || top < best) {
      best = top
    }
  }
  return best
}

export function constrainCreatureToWorld(
  scene: Phaser.Scene,
  sprite: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): void {
  const body = sprite.body as Phaser.Physics.Arcade.Body | null
  if (!body) {
    return
  }
  body.updateFromGameObject()
  sprite.setCollideWorldBounds(true)
  body.setMaxVelocity(560, 720)
  const fly = sprite.getData("fly") === true
  if (fly) {
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setVelocity(0, 0)
    return
  }
  body.setAllowGravity(true)
  if (!sprite.getData("worldConstraint")) {
    scene.physics.add.collider(sprite, platforms)
    sprite.setData("worldConstraint", true)
  }
  const floor = highestFloorTop(sprite, platforms)
  if (floor !== null) {
    sprite.setY(floor - Math.max(8, sprite.displayHeight * 0.5))
    body.updateFromGameObject()
  }
  body.setVelocity(0, 0)
}

export function spawnEnemy(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  enemies: Phaser.Physics.Arcade.Group,
  opts?: { pin?: boolean },
): Phaser.Physics.Arcade.Sprite {
  const kit = getEnemyKit(id)
  const sprite = scene.physics.add.sprite(x, y, kit.texture)
  sprite.setData("id", id)
  sprite.setDisplaySize(kit.w, kit.h)
  sprite.setData("archetype", kit.archetype)
  sprite.setData("speed", kit.speed)
  sprite.setData("fly", kit.fly === true)
  if (kit.archetype === "patrol") {
    sprite.setData("dir", 1)
  }
  if (kit.archetype === "ranged_lob") {
    sprite.setData("cooldown", id === "ice_spit" ? 0.4 : 0)
  }
  if (kit.archetype === "blocker") {
    sprite.setData("stun", 0)
    sprite.setData("charging", 0)
  }
  if (kit.archetype === "swarm" || kit.archetype === "diver") {
    sprite.setData("homeX", x)
    sprite.setData("homeY", y)
    sprite.setData("hoverT", Math.random() * Math.PI * 2)
  }
  if (kit.archetype === "diver") {
    sprite.setData("phase", "hover")
    sprite.setData("timer", 0.8 + Math.random() * 0.8)
  }
  enemies.add(sprite)
  if (opts?.pin) {
    freezeEnemyForEditor(sprite)
  } else {
    constrainCreatureToWorld(scene, sprite, platforms)
  }
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
    } else if (arch === "reach") {
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
