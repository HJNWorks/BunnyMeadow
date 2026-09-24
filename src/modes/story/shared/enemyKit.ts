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
  perch?: boolean
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
  heron: { texture: "story_critter_heron", source: "story_heron", w: 36, h: 64, archetype: "fisher", speed: 80, fly: true },
  cat: { texture: "story_critter_cat", source: "story_cat", w: 40, h: 32, archetype: "reach", speed: 20 },
  owl: { texture: "story_critter_owl", source: "story_owl", w: 38, h: 32, archetype: "diver", speed: 150, fly: true },
  goat: { texture: "story_critter_goat", source: "story_goat", w: 44, h: 40, archetype: "blocker", speed: 110 },
  boar: { texture: "story_critter_boar", source: "story_boar", w: 48, h: 36, archetype: "blocker", speed: 95 },
  tortoise: { texture: "story_critter_tortoise", source: "story_tortoise", w: 40, h: 28, archetype: "patrol", speed: 22 },
  bees: { texture: "story_critter_bees", source: "story_bees", w: 44, h: 32, archetype: "swarm", speed: 36, fly: true },
  frost_wisp: { texture: "story_critter_frost_wisp", source: "story_wisp", w: 64, h: 44, archetype: "swarm", speed: 28, fly: true },
  ice_spit: { texture: "story_critter_ice_spit", source: "story_ice", w: 32, h: 32, archetype: "ranged_lob", speed: 0, perch: true },
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

function enemyRow(id: string): { safeFromAbove?: boolean; contactDamage?: number } | undefined {
  return (enemiesData.enemies as { id: string; safeFromAbove?: boolean; contactDamage?: number }[]).find(
    (entry) => entry.id === id,
  )
}

function enemySafeFromAbove(id: string): boolean {
  return enemyRow(id)?.safeFromAbove === true
}

function enemyContactDamage(id: string): number {
  const value = enemyRow(id)?.contactDamage
  return typeof value === "number" ? value : 1
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

export function bindSquirrelToTrunk(
  sprite: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  decor: { kind: string; x: number; y: number; w: number; h: number }[],
): void {
  type Trunk = { cx: number; top: number; bottom: number; side: number }
  const trunks: Trunk[] = []
  for (const obj of platforms.getChildren()) {
    const go = obj as Phaser.GameObjects.GameObject & {
      getData?: (key: string) => unknown
      body?: Phaser.Physics.Arcade.StaticBody | null
    }
    if (go.getData?.("rectKind") !== "wall") {
      continue
    }
    const body = go.body
    if (!body) {
      continue
    }
    const cx = (body.left + body.right) * 0.5
    const side = sprite.x >= cx ? body.right + 10 : body.left - 10
    trunks.push({ cx, top: body.top, bottom: body.bottom, side })
  }
  for (const piece of decor) {
    if (piece.kind !== "vine" && piece.kind !== "hedge" && piece.kind !== "column") {
      continue
    }
    const cx = piece.x + piece.w * 0.5
    const side = sprite.x >= cx ? piece.x + piece.w + 8 : piece.x - 8
    trunks.push({ cx, top: piece.y, bottom: piece.y + piece.h, side })
  }
  if (!trunks.length) {
    return
  }
  let best = trunks[0]
  let bestDist = Number.POSITIVE_INFINITY
  for (const trunk of trunks) {
    const dist = Math.hypot(sprite.x - trunk.cx, sprite.y - (trunk.top + trunk.bottom) * 0.5)
    if (!best || dist < bestDist) {
      best = trunk
      bestDist = dist
    }
  }
  if (!best) {
    return
  }
  const top = best.top + 18
  const bottom = Math.max(top + 24, best.bottom - 18)
  const body = sprite.body as Phaser.Physics.Arcade.Body
  body.setAllowGravity(false)
  body.setGravity(0, 0)
  sprite.setData("fly", true)
  sprite.setData("climbX", best.side)
  sprite.setData("climbTop", top)
  sprite.setData("climbBottom", bottom)
  sprite.setData("climbDir", -1)
  sprite.setPosition(best.side, Phaser.Math.Clamp(sprite.y, top, bottom))
  body.updateFromGameObject()
}

function frogLanding(
  enemy: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): { x: number; dir: number } | null {
  const body = enemy.body as Phaser.Physics.Arcade.Body
  const feet = body.bottom
  let best: { x: number; dir: number } | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (const obj of platforms.getChildren()) {
    const plat = obj as Phaser.GameObjects.GameObject & {
      getData?: (key: string) => unknown
      body?: Phaser.Physics.Arcade.StaticBody | null
    }
    const kind = plat.getData?.("rectKind")
    if (kind === "wall" || kind === "ceiling") {
      continue
    }
    const pb = plat.body
    if (!pb) {
      continue
    }
    const cx = (pb.left + pb.right) * 0.5
    const dx = cx - enemy.x
    const dist = Math.abs(dx)
    if (dist < 48 || dist > 150) {
      continue
    }
    if (Math.abs(pb.top - feet) > 64) {
      continue
    }
    if (dist < bestDist) {
      best = { x: cx, dir: dx < 0 ? -1 : 1 }
      bestDist = dist
    }
  }
  return best
}

function tickFrog(
  scene: Phaser.Scene,
  enemy: Phaser.Physics.Arcade.Sprite,
  projectiles: Phaser.Physics.Arcade.Group,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  target: { x: number; y: number },
  dt: number,
): void {
  const body = enemy.body as Phaser.Physics.Arcade.Body
  const onFloor = body.blocked.down || body.touching.down
  let phase = String(enemy.getData("phase") || "sit")
  let timer = Number(enemy.getData("timer") || 0) - dt
  const dx = target.x - enemy.x
  const dy = target.y - enemy.y
  const dist = Math.hypot(dx, dy)
  if (phase === "sit") {
    enemy.setVelocityX(0)
    if (onFloor && dist > 42 && dist < 168 && Math.abs(dy) < 90) {
      phase = "lick"
      timer = 0.2
      enemy.setFlipX(dx < 0)
    } else if (onFloor && timer <= 0) {
      const land = frogLanding(enemy, platforms)
      const dir = land?.dir ?? (patrolHasFloorAhead(enemy, Number(enemy.getData("dir") || 1), platforms) ? Number(enemy.getData("dir") || 1) : -Number(enemy.getData("dir") || 1))
      enemy.setData("dir", dir)
      if (dir !== 0 && (land || patrolHasFloorAhead(enemy, dir, platforms))) {
        enemy.setVelocity(dir * 150, -260)
        enemy.setFlipX(dir < 0)
        phase = "hop"
        timer = 0.55
      } else {
        timer = 0.4
      }
    }
  } else if (phase === "hop") {
    if (onFloor && timer < 0.25) {
      phase = "sit"
      timer = 0.35 + Math.random() * 0.45
      enemy.setVelocityX(0)
    }
  } else {
    enemy.setVelocityX(0)
    if (timer <= 0) {
      if (dist > 42 && dist < 168) {
        const ang = Math.atan2(dy * 0.15, dx)
        fireRadialShot(scene, projectiles, enemy.x, enemy.y - 4, ang, 460, "story_frost", 34, 8, {
          tint: 0xe85878,
          lifeMs: 220,
        })
      }
      phase = "sit"
      timer = 1.15
    }
  }
  enemy.setData("phase", phase)
  enemy.setData("timer", timer)
}

function tickSquirrelClimb(enemy: Phaser.Physics.Arcade.Sprite, speed: number): void {
  const body = enemy.body as Phaser.Physics.Arcade.Body
  body.setAllowGravity(false)
  body.setGravity(0, 0)
  let dir = Number(enemy.getData("climbDir") || -1)
  const top = Number(enemy.getData("climbTop"))
  const bottom = Number(enemy.getData("climbBottom"))
  const x = Number(enemy.getData("climbX"))
  enemy.setVelocity(0, dir * Math.max(36, speed))
  enemy.x = x
  if (enemy.y <= top) {
    dir = 1
    enemy.y = top
  }
  if (enemy.y >= bottom) {
    dir = -1
    enemy.y = bottom
  }
  enemy.setData("climbDir", dir)
  body.updateFromGameObject()
}

export function bindHeronToWater(
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
    const cy = hazard.worldY
    const dist = Math.hypot(sprite.x - cx, sprite.y - cy)
    if (dist < bestDist) {
      best = hazard
      bestDist = dist
    }
  }
  if (!best) {
    sprite.setData("loopX", sprite.x)
    sprite.setData("loopY", sprite.y - 40)
    sprite.setData("loopRx", 90)
    return
  }
  sprite.setData("loopX", best.worldX + best.w * 0.5)
  sprite.setData("loopY", best.worldY - 78)
  sprite.setData("loopRx", Math.max(90, best.w * 0.28))
  sprite.setData("waterTop", best.worldY)
  sprite.setData("waterLeft", best.worldX)
  sprite.setData("waterRight", best.worldX + best.w)
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

function nearestPad(
  sprite: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): { top: number; left: number; right: number } | null {
  const midX = sprite.x
  let best: { top: number; left: number; right: number; dist: number } | null = null
  for (const obj of platforms.getChildren()) {
    const pb = platformBody(obj)
    if (!pb) {
      continue
    }
    const overlap = midX >= pb.left - 16 && midX <= pb.right + 16
    const cx = (pb.left + pb.right) * 0.5
    const dx = overlap ? 0 : Math.abs(midX - cx)
    const dy = Math.abs(pb.top - sprite.y)
    const dist = dx * 2 + dy
    if (!best || dist < best.dist) {
      best = { top: pb.top, left: pb.left, right: pb.right, dist }
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
  const perch = sprite.getData("perch") === true
  if (fly) {
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setVelocity(0, 0)
    return
  }
  if (perch) {
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setImmovable(true)
    body.setVelocity(0, 0)
    const pad = nearestPad(sprite, platforms)
    if (pad) {
      const half = Math.max(8, sprite.displayHeight * 0.5)
      sprite.setY(pad.top - half)
      if (sprite.x < pad.left + 8) {
        sprite.setX(pad.left + 8)
      }
      if (sprite.x > pad.right - 8) {
        sprite.setX(pad.right - 8)
      }
      body.updateFromGameObject()
    }
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
  sprite.setData("perch", kit.perch === true)
  sprite.setData("safeFromAbove", enemySafeFromAbove(id))
  sprite.setData("contactDamage", enemyContactDamage(id))
  if (kit.archetype === "fisher") {
    sprite.setData("phase", "hover")
    sprite.setData("hoverX", x)
    sprite.setData("hoverY", 480)
    sprite.setData("homeX", x)
    sprite.setData("homeY", y)
    sprite.setData("contactDamage", 0)
    sprite.setPosition(x, 480)
  }
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
  if (id === "boar") {
    sprite.setData("phase", "idle")
    sprite.setData("contactDamage", 0)
    sprite.setData("homeX", x)
    sprite.setData("homeY", y)
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
  if (id === "frog") {
    sprite.setData("phase", "sit")
    sprite.setData("timer", 0.3 + Math.random() * 0.4)
    sprite.setData("dir", 1)
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
  const sign = dir < 0 ? -1 : 1
  const probeX = sign > 0 ? body.right + 16 : body.left - 16
  const probeY = body.bottom + 8
  for (const obj of platforms.getChildren()) {
    const plat = obj as Phaser.GameObjects.GameObject & {
      getData?: (key: string) => unknown
      body?: Phaser.Physics.Arcade.StaticBody
    }
    if (plat.getData?.("rectKind") === "wall" || plat.getData?.("rectKind") === "ceiling") {
      continue
    }
    const pb = plat.body
    if (!pb) {
      continue
    }
    if (probeX >= pb.left && probeX <= pb.right && probeY >= pb.top && probeY <= pb.bottom + 12) {
      return true
    }
  }
  return false
}

function keepRoamerOnLedge(
  enemy: Phaser.Physics.Arcade.Sprite,
  dir: number,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): number {
  if (enemy.getData("fly") === true || enemy.getData("perch") === true) {
    return dir
  }
  const body = enemy.body as Phaser.Physics.Arcade.Body
  const onFloor = body.blocked.down || body.touching.down
  const sign = dir < 0 ? -1 : dir > 0 ? 1 : 0
  if (onFloor && sign !== 0 && !patrolHasFloorAhead(enemy, sign, platforms)) {
    enemy.setVelocityX(0)
    enemy.x -= sign * 4
    body.updateFromGameObject()
    return 0
  }
  if (!onFloor && body.velocity.y > 60) {
    enemy.setVelocity(0, 0)
    enemy.y -= 6
    body.updateFromGameObject()
    return 0
  }
  return dir
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
      arch === "heron_done" ||
      arch === "gale"
    ) {
      return
    }
    const speed = Number(enemy.getData("speed") || 40)
    if (arch === "patrol") {
      let dir = Number(enemy.getData("dir") || 1)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      const onFloor = body.blocked.down || body.touching.down
      const id = String(enemy.getData("id") || "")
      if (id === "frog") {
        tickFrog(scene, enemy, projectiles, platforms, target, dt)
        return
      }
      if (id === "frost_hare" && Math.hypot(target.x - enemy.x, target.y - enemy.y) < 220) {
        dir = target.x >= enemy.x ? 1 : -1
        enemy.setData("dir", dir)
      }
      if (body.blocked.left || body.blocked.right || (onFloor && !patrolHasFloorAhead(enemy, dir, platforms))) {
        dir *= -1
        enemy.setData("dir", dir)
      }
      dir = keepRoamerOnLedge(enemy, dir, platforms)
      enemy.setData("dir", dir || Number(enemy.getData("dir") || 1))
      enemy.setVelocityX((dir || 0) * speed)
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
      let dir = Math.sign(dx) || 1
      if (arch === "foxhu") {
        enemy.setVelocityX(speed)
      } else {
        dir = keepRoamerOnLedge(enemy, dir, platforms)
        enemy.setVelocityX(dir * speed)
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
      if (id === "squirrel" && Number.isFinite(Number(enemy.getData("climbTop")))) {
        tickSquirrelClimb(enemy, speed)
        return
      }
      enemy.setVelocityX(0)
      if (enemy.getData("perch") === true) {
        const body = enemy.body as Phaser.Physics.Arcade.Body
        body.setAllowGravity(false)
        enemy.setVelocityY(0)
      }
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
      const id = String(enemy.getData("id") || "")
      if (id === "boar") {
        tickBoarCharge(enemy, target, platforms, dt)
        return
      }
      let stun = Number(enemy.getData("stun") || 0) - dt
      let charging = Number(enemy.getData("charging") || 0)
      const body = enemy.body as Phaser.Physics.Arcade.Body
      if (stun > 0) {
        enemy.setVelocityX(0)
        enemy.setData("stun", stun)
        return
      }
      if (charging === 0 && Math.abs(target.x - enemy.x) < (id === "goat" ? 560 : 220)) {
        charging = Math.sign(target.x - enemy.x) || 1
        enemy.setData("charging", charging)
      }
      if (charging !== 0) {
        if (id === "goat") {
          charging = Math.sign(target.x - enemy.x) || charging
          enemy.setData("charging", charging)
        }
        const held = keepRoamerOnLedge(enemy, charging, platforms)
        if (held === 0) {
          enemy.setData("charging", 0)
          enemy.setData("stun", 0.45)
          enemy.setVelocityX(0)
          return
        }
        const rush = id === "goat" ? speed + 90 : speed
        enemy.setVelocityX(charging * rush)
        enemy.setFlipX(charging < 0)
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
    } else if (arch === "fisher") {
      tickHeronCircuit(enemy, target, dt)
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

function setBoarPose(enemy: Phaser.Physics.Arcade.Sprite, pose: "idle" | "rage" | "run"): void {
  const step = Math.floor(enemy.scene.time.now / 120) % 2 === 0
  const key =
    pose === "rage"
      ? "story_boar_rage"
      : pose === "run"
        ? step
          ? "story_boar_run"
          : "story_boar_step"
        : step
          ? "story_boar_step"
          : "story_boar"
  if (enemy.texture.key !== key && enemy.scene.textures.exists(key)) {
    enemy.setTexture(key)
  }
  if (pose === "rage") {
    enemy.setDisplaySize(56, 32)
  } else if (pose === "run") {
    enemy.setDisplaySize(64, 30)
  } else {
    enemy.setDisplaySize(52, 32)
  }
}

function tickBoarCharge(
  enemy: Phaser.Physics.Arcade.Sprite,
  target: { x: number; y: number },
  platforms: Phaser.Physics.Arcade.StaticGroup,
  dt: number,
): void {
  let phase = String(enemy.getData("phase") || "idle")
  const body = enemy.body as Phaser.Physics.Arcade.Body
  if (phase === "idle") {
    enemy.setVelocityX(0)
    enemy.setData("contactDamage", 0)
    setBoarPose(enemy, "idle")
    const dx = target.x - enemy.x
    const dy = Math.abs(target.y - enemy.y)
    if (Math.abs(dx) < 420) {
      enemy.setFlipX(dx < 0)
    }
    if (Math.abs(dx) < 260 && dy < 96) {
      phase = "rage"
      enemy.setData("lockT", 0.45)
      enemy.setData("charging", Math.sign(dx) || 1)
      enemy.setVelocityX(0)
    }
  } else if (phase === "rage") {
    let left = Number(enemy.getData("lockT") || 0) - dt
    const dir = Math.sign(target.x - enemy.x) || Number(enemy.getData("charging")) || 1
    enemy.setData("charging", dir)
    enemy.setVelocityX(0)
    enemy.setFlipX(dir < 0)
    enemy.setData("contactDamage", 0)
    setBoarPose(enemy, "rage")
    if (left <= 0) {
      phase = "charge"
      enemy.setData("sweepT", 0.85)
      enemy.setData("contactDamage", 2)
    }
    enemy.setData("lockT", left)
  } else if (phase === "charge") {
    let left = Number(enemy.getData("sweepT") || 0) - dt
    const dir = Number(enemy.getData("charging")) || 1
    const held = keepRoamerOnLedge(enemy, dir, platforms)
    if (held === 0 || body.blocked.left || body.blocked.right || left <= 0) {
      phase = "stun"
      enemy.setData("stun", 0.7)
      enemy.setData("contactDamage", 0)
      enemy.setVelocityX(0)
      setBoarPose(enemy, "idle")
    } else {
      enemy.setVelocityX(dir * 460)
      enemy.setFlipX(dir < 0)
      enemy.setData("contactDamage", 2)
      setBoarPose(enemy, "run")
    }
    enemy.setData("sweepT", left)
  } else {
    let stun = Number(enemy.getData("stun") || 0) - dt
    enemy.setVelocityX(0)
    enemy.setData("contactDamage", 0)
    setBoarPose(enemy, "idle")
    enemy.setData("stun", stun)
    if (stun <= 0) {
      phase = "idle"
    }
  }
  enemy.setData("phase", phase)
}

function setHeronPose(enemy: Phaser.Physics.Arcade.Sprite, pose: "hover" | "lock" | "sweep"): void {
  const flap = Math.floor(enemy.scene.time.now / 180) % 2 === 0 ? "story_heron_up" : "story_heron"
  const key = pose === "lock" ? "story_heron_lock" : pose === "sweep" ? "story_heron_sweep" : flap
  if (enemy.texture.key !== key && enemy.scene.textures.exists(key)) {
    enemy.setTexture(key)
  }
  if (pose === "lock") {
    enemy.setDisplaySize(88, 40)
  } else if (pose === "sweep") {
    enemy.setDisplaySize(72, 36)
  } else {
    enemy.setDisplaySize(64, 44)
  }
}

function tickHeronCircuit(
  enemy: Phaser.Physics.Arcade.Sprite,
  target: { x: number; y: number },
  dt: number,
): void {
  let phase = String(enemy.getData("phase") || "hover")
  const hoverX = Number(enemy.getData("hoverX") ?? enemy.getData("homeX") ?? enemy.x)
  const hoverY = Number(enemy.getData("hoverY") ?? 480)
  const drift = Math.sin(enemy.scene.time.now / 900) * 70
  if (phase === "hover") {
    const aimX = hoverX + drift
    enemy.setVelocity((aimX - enemy.x) * 1.4, (hoverY - enemy.y) * 2.2)
    enemy.setRotation(0)
    enemy.setFlipX(target.x < enemy.x)
    enemy.setData("contactDamage", 0)
    setHeronPose(enemy, "hover")
    const dx = target.x - enemy.x
    const dy = target.y - enemy.y
    if (Math.abs(dx) < 300 && dy > 40 && dy < 720) {
      phase = "lock"
      enemy.setData("lockT", 0.42)
      enemy.setVelocity(0, 0)
    }
  } else if (phase === "lock") {
    let left = Number(enemy.getData("lockT") || 0) - dt
    enemy.setVelocity(0, 0)
    enemy.setRotation(0)
    enemy.setFlipX(target.x < enemy.x)
    enemy.setData("contactDamage", 0)
    setHeronPose(enemy, "lock")
    const dx = target.x - enemy.x
    const dy = target.y - enemy.y
    const n = Math.hypot(dx, dy) || 1
    const speed = 620
    enemy.setData("sweepVx", (dx / n) * speed)
    enemy.setData("sweepVy", (dy / n) * speed)
    if (left <= 0) {
      phase = "sweep"
      const travel = n + 120
      enemy.setData("sweepT", travel / speed)
      enemy.setVelocity(Number(enemy.getData("sweepVx")), Number(enemy.getData("sweepVy")))
    }
    enemy.setData("lockT", left)
  } else if (phase === "sweep") {
    let left = Number(enemy.getData("sweepT") || 0) - dt
    const vx = Number(enemy.getData("sweepVx") || 0)
    const vy = Number(enemy.getData("sweepVy") || 200)
    enemy.setVelocity(vx, vy)
    enemy.setRotation(Math.atan2(vy, vx))
    enemy.setFlipX(false)
    enemy.setData("contactDamage", 2)
    setHeronPose(enemy, "sweep")
    if (left <= 0 || enemy.y > 980) {
      phase = "climb"
      enemy.setData("contactDamage", 0)
      enemy.setRotation(0)
    }
    enemy.setData("sweepT", left)
  } else {
    const dx = hoverX - enemy.x
    const dy = hoverY - enemy.y
    const n = Math.hypot(dx, dy) || 1
    enemy.setVelocity((dx / n) * 220, (dy / n) * 220)
    enemy.setRotation(0)
    enemy.setFlipX(dx < 0)
    enemy.setData("contactDamage", 0)
    setHeronPose(enemy, "hover")
    if (n < 28) {
      phase = "hover"
      enemy.setVelocity(0, 0)
    }
  }
  enemy.setData("phase", phase)
}
