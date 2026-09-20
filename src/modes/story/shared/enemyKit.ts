import Phaser from "phaser"
import enemiesData from "../../../data/enemies.json"
import type { AssembledDecor, AssembledHazard } from "../../../systems/ChunkAssembler"

type EnemyKit = {
  texture: string
  source: string
  w: number
  h: number
  archetype: string
  speed: number
  fly?: boolean
}

const RADIAL_SPAWN = 28

export function fireRadialShot(
  scene: Phaser.Scene,
  projectiles: Phaser.Physics.Arcade.Group,
  ox: number,
  oy: number,
  ang: number,
  speed: number,
  key: string,
  dw: number,
  dh: number,
  opts?: { tint?: number; rotOff?: number; lifeMs?: number; depth?: number },
): Phaser.Physics.Arcade.Image {
  const x = ox + Math.cos(ang) * RADIAL_SPAWN
  const y = oy + Math.sin(ang) * RADIAL_SPAWN
  const shot = scene.add.image(x, y, key)
  shot.setDisplaySize(dw, dh)
  shot.setRotation(ang + (opts?.rotOff ?? 0))
  shot.setDepth(opts?.depth ?? 5)
  if (opts?.tint !== undefined) {
    shot.setTint(opts.tint)
  }
  projectiles.add(shot)
  const body = shot.body as Phaser.Physics.Arcade.Body
  body.setAllowGravity(false)
  body.setGravity(0, 0)
  body.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed)
  const lifeMs = opts?.lifeMs
  if (lifeMs && lifeMs > 0) {
    scene.time.delayedCall(lifeMs, () => {
      if (shot.active) {
        shot.destroy()
      }
    })
  }
  return shot as Phaser.Physics.Arcade.Image
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
  frost_wisp: { texture: "story_critter_frost_wisp", source: "story_wisp", w: 64, h: 44, archetype: "swarm", speed: 28, fly: true },
  ice_spit: { texture: "story_critter_ice_spit", source: "story_ice", w: 32, h: 32, archetype: "ranged_lob", speed: 0 },
  dust_mite: { texture: "story_critter_dust_mite", source: "story_dust", w: 52, h: 36, archetype: "swarm", speed: 28, fly: true },
  star_wisp: { texture: "story_critter_star_wisp", source: "story_starwisp", w: 64, h: 44, archetype: "swarm", speed: 18, fly: true },
  pestle_sentry: { texture: "story_critter_pestle_sentry", source: "story_pestle", w: 32, h: 36, archetype: "ranged_lob", speed: 0 },
  gale_magpie: { texture: "story_critter_gale_magpie", source: "story_magpie", w: 40, h: 28, archetype: "diver", speed: 160, fly: true },
  carp: { texture: "story_critter_carp", source: "story_carp", w: 48, h: 24, archetype: "water_patrol", speed: 40, fly: true },
  frost_hare: { texture: "story_critter_frost_hare", source: "story_frost_hare", w: 40, h: 32, archetype: "patrol", speed: 70 },
  lantern_moth: { texture: "story_critter_lantern_moth", source: "story_moth", w: 48, h: 32, archetype: "diver", speed: 90, fly: true },
}

export function critterTextureKey(id: string): string {
  return `story_critter_${id}`
}

export function getEnemyKit(id: string): EnemyKit {
  return KITS[id] ?? KITS.hedgehog!
}

function enemySafeFromAbove(id: string): boolean {
  const row = (enemiesData.enemies as { id: string; safeFromAbove?: boolean }[]).find((entry) => entry.id === id)
  return row?.safeFromAbove === true
}

export function bindCarpToWater(
  sprite: Phaser.Physics.Arcade.Sprite,
  hazards: AssembledHazard[],
): void {
  let best: AssembledHazard | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (const hazard of hazards) {
    if (hazard.kind !== "water") {
      continue
    }
    const cx = hazard.worldX + hazard.w * 0.5
    const cy = hazard.worldY + hazard.h * 0.5
    const dist = Math.hypot(sprite.x - cx, sprite.y - cy)
    if (dist < bestDist) {
      best = hazard
      bestDist = dist
    }
  }
  if (!best) {
    return
  }
  sprite.setData("waterLeft", best.worldX)
  sprite.setData("waterRight", best.worldX + best.w)
  sprite.setData("waterTop", best.worldY)
  sprite.setData("waterBottom", best.worldY + best.h)
  sprite.setData("homeY", best.worldY + 20)
  sprite.setPosition(sprite.x, best.worldY + 20)
}

export function bindMothToLantern(
  sprite: Phaser.Physics.Arcade.Sprite,
  decor: AssembledDecor[],
): void {
  let best: AssembledDecor | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (const piece of decor) {
    if (piece.kind !== "lantern") {
      continue
    }
    const cx = piece.x + piece.w * 0.5
    const cy = piece.y + piece.h * 0.5
    const dist = Math.hypot(sprite.x - cx, sprite.y - cy)
    if (dist < bestDist) {
      best = piece
      bestDist = dist
    }
  }
  if (!best) {
    return
  }
  sprite.setData("lightX", best.x + best.w * 0.5)
  sprite.setData("lightY", best.y + best.h * 0.5)
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
  sprite.setData("safeFromAbove", enemySafeFromAbove(id))
  if (kit.archetype === "patrol") {
    sprite.setData("dir", 1)
  }
  if (kit.archetype === "reach") {
    sprite.setData("phase", "idle")
    sprite.setData("timer", 0.5 + Math.random() * 0.6)
    sprite.setData("facing", 1)
  }
  if (kit.archetype === "water_patrol") {
    sprite.setData("dir", 1)
    sprite.setData("phase", "hover")
    sprite.setData("timer", 0.8 + Math.random() * 0.6)
    sprite.setData("homeX", x)
    sprite.setData("homeY", y)
  }
  if (kit.archetype === "ranged_lob") {
    sprite.setData("cooldown", id === "ice_spit" || id === "pestle_sentry" ? 0.4 : 0)
  }
  if (id === "frost_wisp") {
    sprite.setData("cooldown", 0.5 + Math.random() * 0.8)
  }
  if (id === "star_wisp") {
    sprite.setData("pulseCd", 0.35 + Math.random() * 0.5)
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
  if (id === "lantern_moth") {
    sprite.setData("dashThrough", true)
  }
  if (id === "frost_hare") {
    sprite.setData("hop", 0.2 + Math.random() * 0.3)
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
    if (
      arch === "han_boss" ||
      arch === "heron_boss" ||
      arch === "crane_boss" ||
      arch === "heron_done"
    ) {
      return
    }
    const speed = Number(enemy.getData("speed") || 40)
    if (arch === "patrol") {
      let dir = Number(enemy.getData("dir") || 1)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      const onFloor = body.blocked.down || body.touching.down
      const id = String(enemy.getData("id") || "")
      if (id === "frost_hare" && Math.hypot(target.x - enemy.x, target.y - enemy.y) < 220) {
        dir = target.x >= enemy.x ? 1 : -1
        enemy.setData("dir", dir)
      }
      if (body.blocked.left || body.blocked.right || (onFloor && !patrolHasFloorAhead(enemy, dir, platforms))) {
        dir *= -1
        enemy.setData("dir", dir)
      }
      enemy.setVelocityX(dir * speed)
      if (id === "frost_hare") {
        let hop = Number(enemy.getData("hop") || 0) - dt
        if (onFloor && hop <= 0) {
          enemy.setVelocityY(-220)
          hop = 0.55 + Math.random() * 0.25
        }
        enemy.setData("hop", hop)
      }
    } else if (arch === "chaser" || arch === "foxhu") {
      const dx = target.x - enemy.x
      enemy.setVelocityX(Math.sign(dx) * speed)
      if (arch === "foxhu") {
        enemy.setVelocityX(speed)
      }
    } else if (arch === "ranged_lob") {
      let cd = Number(enemy.getData("cooldown") || 0) - dt
      const id = String(enemy.getData("id") || "")
      const radial = id === "ice_spit" || id === "pestle_sentry"
      const dx = target.x - enemy.x
      const dy = target.y - enemy.y
      const reach = radial ? Math.hypot(dx, dy) : Math.abs(dx)
      if (cd <= 0 && reach < 420) {
        if (radial) {
          const ang = Math.atan2(dy, dx)
          fireRadialShot(scene, projectiles, enemy.x, enemy.y, ang, 220, "story_frost", 28, 12, {
            tint: id === "pestle_sentry" ? 0x8a8e92 : undefined,
            lifeMs: 2000,
          })
        } else {
          const shot = scene.add.image(enemy.x, enemy.y, "story_bunny")
          shot.setDisplaySize(14, 14)
          shot.setTint(0x4a3a2a)
          projectiles.add(shot)
          const n = Math.hypot(dx, dy) || 1
          const body = shot.body as Phaser.Physics.Arcade.Body
          body.setAllowGravity(true)
          body.setVelocity((dx / n) * 220, (dy / n) * 180 - 80)
          scene.time.delayedCall(2000, () => {
            if (shot.active) {
              shot.destroy()
            }
          })
        }
        cd = radial ? 1.7 : 1.8
      }
      enemy.setData("cooldown", cd)
      enemy.setVelocityX(0)
    } else if (arch === "reach") {
      enemy.setVelocityX(0)
      let phase = String(enemy.getData("phase") || "idle")
      let timer = Number(enemy.getData("timer") || 0) - dt
      if (phase === "idle") {
        if (timer <= 0 && Math.abs(target.x - enemy.x) < 280) {
          const facing = target.x >= enemy.x ? 1 : -1
          phase = "coil"
          timer = 0.45
          enemy.setFlipX(facing < 0)
          enemy.setData("facing", facing)
          enemy.setTint(0xc8b090)
        }
      } else if (phase === "coil") {
        if (timer <= 0) {
          phase = "strike"
          timer = 0.35
          enemy.clearTint()
          const id = String(enemy.getData("id") || "")
          const cat = id === "cat"
          const dir = Number(enemy.getData("facing") || 1)
          const poke = scene.physics.add.image(
            enemy.x + dir * (cat ? 28 : 40),
            enemy.y + (cat ? 4 : -6),
            "story_frost",
          )
          poke.setDisplaySize(cat ? 28 : 42, cat ? 14 : 10)
          poke.setTint(cat ? 0xe8c4a0 : 0xf4e8d0)
          poke.setData("archetype", "reach_poke")
          poke.setData("safeFromAbove", false)
          const pokeBody = poke.body as Phaser.Physics.Arcade.Body
          pokeBody.setAllowGravity(false)
          pokeBody.setGravity(0, 0)
          enemies.add(poke)
          enemy.setData("poke", poke)
        }
      } else if (phase === "strike") {
        const poke = enemy.getData("poke") as Phaser.Physics.Arcade.Image | undefined
        const dir = Number(enemy.getData("facing") || 1)
        const cat = String(enemy.getData("id") || "") === "cat"
        poke?.setPosition(enemy.x + dir * (cat ? 28 : 40), enemy.y + (cat ? 4 : -6))
        if (timer <= 0) {
          phase = "recover"
          timer = 1.6
          poke?.destroy()
          enemy.setData("poke", null)
        }
      } else if (timer <= 0) {
        phase = "idle"
        timer = 1.2 + Math.random() * 0.8
      }
      enemy.setData("phase", phase)
      enemy.setData("timer", timer)
    } else if (arch === "water_patrol") {
      const left = Number(enemy.getData("waterLeft") ?? enemy.x - 80)
      const right = Number(enemy.getData("waterRight") ?? enemy.x + 80)
      const top = Number(enemy.getData("waterTop") ?? enemy.y)
      const homeY = Number(enemy.getData("homeY") ?? top + 20)
      let phase = String(enemy.getData("phase") || "hover")
      let timer = Number(enemy.getData("timer") || 0) - dt
      let dir = Number(enemy.getData("dir") || 1)
      if (phase === "hover") {
        if (enemy.x <= left + 16) {
          dir = 1
        }
        if (enemy.x >= right - 16) {
          dir = -1
        }
        enemy.setData("dir", dir)
        enemy.setVelocityX(dir * speed)
        enemy.setVelocityY((homeY - enemy.y) * 4)
        if (timer <= 0) {
          phase = "breach"
          timer = 0.42
          enemy.setVelocityY(-220)
        }
      } else if (phase === "breach") {
        if (timer <= 0) {
          phase = "return"
          timer = 0.7
        }
      } else {
        enemy.setVelocityY((homeY - enemy.y) * 5)
        enemy.setVelocityX(dir * speed * 0.4)
        if (Math.abs(enemy.y - homeY) < 8 || timer <= 0) {
          phase = "hover"
          timer = 1.1 + Math.random() * 0.7
          enemy.setY(homeY)
        }
      }
      if (enemy.x < left + 8) {
        enemy.setX(left + 8)
      }
      if (enemy.x > right - 8) {
        enemy.setX(right - 8)
      }
      enemy.setData("phase", phase)
      enemy.setData("timer", timer)
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
      const id = String(enemy.getData("id") || "")
      if (id === "frost_wisp") {
        tickFrostWispShot(scene, enemy, projectiles, target, dt)
      } else if (id === "star_wisp") {
        tickStarWispPulse(scene, enemy, projectiles, target, dt)
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
          timer = String(enemy.getData("id") || "") === "lantern_moth" ? 0.55 : 0.7
          const lightX = Number(enemy.getData("lightX"))
          const lightY = Number(enemy.getData("lightY"))
          const aimX = Number.isFinite(lightX) ? lightX : target.x
          const aimY = Number.isFinite(lightY) ? lightY : target.y
          const dx = aimX - enemy.x
          const dy = aimY - enemy.y
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

function tickFrostWispShot(
  scene: Phaser.Scene,
  enemy: Phaser.Physics.Arcade.Sprite,
  projectiles: Phaser.Physics.Arcade.Group,
  target: { x: number; y: number },
  dt: number,
): void {
  let cd = Number(enemy.getData("cooldown") || 0) - dt
  const dx = target.x - enemy.x
  const dy = target.y - enemy.y
  const dist = Math.hypot(dx, dy)
  if (cd <= 0 && dist < 480) {
    const base = Math.atan2(dy, dx)
    const count = 3
    const spread = 0.5
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1) - 0.5
      fireRadialShot(scene, projectiles, enemy.x, enemy.y, base + t * spread, 280, "story_frost", 40, 10, {
        lifeMs: 2200,
      })
    }
    cd = 1.85 + Math.random() * 0.45
  }
  enemy.setData("cooldown", cd)
}

function tickStarWispPulse(
  scene: Phaser.Scene,
  enemy: Phaser.Physics.Arcade.Sprite,
  projectiles: Phaser.Physics.Arcade.Group,
  target: { x: number; y: number },
  dt: number,
): void {
  let cd = Number(enemy.getData("pulseCd") || 0) - dt
  const dist = Math.hypot(target.x - enemy.x, target.y - enemy.y)
  if (cd <= 0 && dist < 150) {
    emitStarPulse(scene, projectiles, enemy.x, enemy.y)
    enemy.setTint(0xffe8a0)
    scene.time.delayedCall(160, () => {
      if (enemy.active) {
        enemy.clearTint()
      }
    })
    cd = 1.55
  }
  enemy.setData("pulseCd", cd)
}

function emitStarPulse(
  scene: Phaser.Scene,
  projectiles: Phaser.Physics.Arcade.Group,
  ox: number,
  oy: number,
): void {
  const hitR = 124
  const hit = scene.add.circle(ox, oy, hitR, 0xfff4c8, 0.14)
  hit.setStrokeStyle(3, 0xffe08a, 0.92)
  hit.setDepth(7)
  scene.physics.add.existing(hit)
  const body = hit.body as Phaser.Physics.Arcade.Body
  body.setAllowGravity(false)
  body.setGravity(0, 0)
  body.setCircle(hitR)
  projectiles.add(hit)
  hit.setData("passPlatforms", true)
  scene.time.delayedCall(280, () => {
    if (hit.active) {
      hit.destroy()
    }
  })
  for (let i = 1; i <= 2; i += 1) {
    scene.time.delayedCall(i * 90, () => {
      if (!scene.sys.isActive()) {
        return
      }
      const ring = scene.add.circle(ox, oy, 42 + i * 34, 0xfff4c8, 0.08)
      ring.setStrokeStyle(2, 0xffe08a, 0.7)
      ring.setDepth(7)
      scene.tweens.add({
        targets: ring,
        scale: 1.4,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          ring.destroy()
        },
      })
    })
  }
}
