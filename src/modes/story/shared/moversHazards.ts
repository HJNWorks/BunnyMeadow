import Phaser from "phaser"
import type { AssembledHazard, AssembledMover } from "../../../systems/ChunkAssembler"
import { getSave } from "../../../core/session"

export type MoverState = {
  sprite: Phaser.Physics.Arcade.Image
  baseX: number
  baseY: number
  axis: "x" | "y"
  amplitude: number
  speed: number
  phase: number
  kind?: "log" | "bridge" | "pestle" | "roller" | "screen" | "raft" | "bark"
  shadow?: Phaser.GameObjects.Ellipse
  struck?: boolean
  rider?: boolean
  /** Beat movers only: hold shut (the heartwood seals behind Mei while Penghou is awake). */
  held?: boolean
}

export type MoverHit = {
  kind: "pestle" | "roller" | "screen"
  fromX: number
  halfWidth: number
}

const TAU = Math.PI * 2

type BeatProfile = { liftEnd: number; holdEnd: number; dropEnd: number; tremble: number }

// Pestle: slow lift, hold, fast slam, rest in the bowl.
const PESTLE_BEAT: BeatProfile = { liftEnd: 0.45, holdEnd: 0.75, dropEnd: 0.81, tremble: 0.12 }
// Guest screen: quick open, long open hold, slower close, rest shut.
const SCREEN_BEAT: BeatProfile = { liftEnd: 0.15, holdEnd: 0.58, dropEnd: 0.7, tremble: 0.1 }
// Cassia bark cut: the slabs pull back, hold the cut open, then slide shut and heal.
const BARK_BEAT: BeatProfile = { liftEnd: 0.12, holdEnd: 0.5, dropEnd: 0.64, tremble: 0.1 }

function beatOf(kind: MoverState["kind"]): BeatProfile {
  return kind === "screen" ? SCREEN_BEAT : kind === "bark" ? BARK_BEAT : PESTLE_BEAT
}

function isBeat(kind: MoverState["kind"]): boolean {
  return kind === "pestle" || kind === "screen" || kind === "bark"
}

/** Hand-driven one-way tops. The raft is a plain ride, the others can also hit. */
function isStone(kind: MoverState["kind"]): boolean {
  return kind === "pestle" || kind === "roller" || kind === "screen" || kind === "raft" || kind === "bark"
}

function moverTexture(kind: MoverState["kind"]): string {
  if (kind === "bridge") {
    return "story_bridge"
  }
  if (kind === "pestle") {
    return "story_pestle_big"
  }
  if (kind === "roller") {
    return "story_roller"
  }
  if (kind === "screen") {
    return "story_screen"
  }
  if (kind === "raft") {
    return "story_raft"
  }
  if (kind === "bark") {
    return "story_bark"
  }
  return "story_log"
}

/** 0 = resting (pestle in the bowl, screen shut), 1 = fully lifted. `u` is the beat position in [0, 1). */
export function beatLift(u: number, beat: BeatProfile = PESTLE_BEAT): number {
  if (u < beat.liftEnd) {
    const k = u / beat.liftEnd
    return 1 - (1 - k) * (1 - k)
  }
  if (u < beat.holdEnd) {
    return 1
  }
  if (u < beat.dropEnd) {
    const k = (u - beat.holdEnd) / (beat.dropEnd - beat.holdEnd)
    return 1 - k * k
  }
  return 0
}

export function createMovers(
  scene: Phaser.Scene,
  movers: AssembledMover[],
  player: Phaser.Physics.Arcade.Sprite,
): MoverState[] {
  const states: MoverState[] = []
  for (const mover of movers) {
    const kind = mover.kind
    const sprite = scene.physics.add.image(
      mover.worldX + mover.w / 2,
      mover.worldY + mover.h / 2,
      moverTexture(kind),
    )
    sprite.setDisplaySize(mover.w, mover.h)
    const stone = isStone(kind)
    if (!stone || mover.tint !== undefined) {
      sprite.setTint(mover.tint ?? 0x8b5a2b)
    }
    // Guest screens slide up behind the gate pier, so they sit under the pads.
    // Bark slabs withdraw into the shelf wood, so they sit under the pads too.
    sprite.setDepth(kind === "screen" || kind === "bark" ? 0.9 : stone ? 2.5 : 3)
    sprite.setImmovable(true)
    const body = sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setSize(sprite.frame.width, sprite.frame.height)
    body.updateFromGameObject()
    if (stone) {
      // Driven by hand below. Arcade must not re-apply the frame delta in postUpdate.
      body.moves = false
    } else {
      scene.physics.add.collider(player, sprite)
    }
    let shadow: Phaser.GameObjects.Ellipse | undefined
    if (kind === "bark" && mover.amplitude < 0) {
      // The gold healing edge faces the cut: left slabs open leftward.
      sprite.setFlipX(false)
    } else if (kind === "bark") {
      sprite.setFlipX(true)
    }
    if (isBeat(kind) && kind !== "bark") {
      shadow = scene.add
        .ellipse(mover.worldX + mover.w / 2, mover.worldY + mover.h - 2, mover.w * 1.3, 12, 0x0a0c10, 0)
        .setDepth(kind === "screen" ? 1.6 : 2.4)
    }
    const fixedPhase = typeof mover.phase === "number" ? mover.phase * TAU : null
    states.push({
      sprite,
      baseX: mover.worldX + mover.w / 2,
      baseY: mover.worldY + mover.h / 2,
      axis: mover.axis,
      amplitude: mover.amplitude,
      speed: mover.speed,
      phase: fixedPhase ?? (isBeat(kind) ? 0 : Math.random() * TAU),
      kind,
      shadow,
      struck: false,
      rider: false,
    })
  }
  return states
}

function reducedMotion(): boolean {
  return getSave().settings.accessibility.reducedMotion
}

function thumpDust(scene: Phaser.Scene, x: number, y: number, width: number, frost = false): void {
  const count = reducedMotion() ? 2 : frost ? 5 : 7
  for (let i = 0; i < count; i += 1) {
    const side = i % 2 === 0 ? -1 : 1
    const puff = scene.add
      .circle(
        x + side * width * 0.3,
        y - 4,
        5 + (i % 3) * 2,
        frost ? (i % 2 === 0 ? 0xe8f4ff : 0xb8d0e4) : i % 3 === 0 ? 0xd8e4dc : 0xc8c0b0,
        0.8,
      )
      .setDepth(2.6)
    scene.tweens.add({
      targets: puff,
      x: puff.x + side * (26 + i * 9),
      y: puff.y - 14 - (i % 4) * 8,
      alpha: 0,
      scale: 1.8,
      duration: 520 + i * 40,
      ease: "Cubic.easeOut",
      onComplete: () => puff.destroy(),
    })
  }
}

/** Gold motes where two bark slabs meet and the cut heals. */
function healSpark(scene: Phaser.Scene, x: number, y: number): void {
  const count = reducedMotion() ? 2 : 6
  for (let i = 0; i < count; i += 1) {
    const mote = scene.add.circle(x, y, 2 + (i % 3), i % 2 === 0 ? 0xf0d27a : 0xd4b05a, 0.9).setDepth(2.6)
    const a = (i / count) * Math.PI * 2
    scene.tweens.add({
      targets: mote,
      x: x + Math.cos(a) * 18,
      y: y + Math.sin(a) * 14 - 8,
      alpha: 0,
      duration: 480,
      ease: "Cubic.easeOut",
      onComplete: () => mote.destroy(),
    })
  }
}

function tickBeat(mover: MoverState): { dx: number; dy: number; striking: boolean } {
  const beat = beatOf(mover.kind)
  const u = mover.held ? beat.dropEnd : (((mover.phase % TAU) + TAU) % TAU) / TAU
  const lift = beatLift(u, beat)
  const sideways = mover.axis === "x"
  let nextX = sideways ? mover.baseX + lift * mover.amplitude : mover.baseX
  let nextY = sideways ? mover.baseY : mover.baseY - lift * mover.amplitude
  const holding = u >= beat.holdEnd - beat.tremble && u < beat.holdEnd
  if (holding && !reducedMotion()) {
    const shake = Math.sin(u * 900) * 1.6
    if (sideways) {
      nextY += shake
    } else {
      nextX += shake
    }
  }
  const dx = nextX - mover.sprite.x
  const dy = nextY - mover.sprite.y
  mover.sprite.setPosition(nextX, nextY)
  if (mover.shadow) {
    const warn =
      u < beat.liftEnd
        ? 0.15
        : u < beat.holdEnd
          ? 0.15 + ((u - beat.liftEnd) / (beat.holdEnd - beat.liftEnd)) * 0.5
          : 0.65
    mover.shadow.setFillStyle(0x0a0c10, warn)
    mover.shadow.setScale(0.7 + (1 - lift) * 0.3, 1)
  }
  const landed = u >= beat.dropEnd
  if (landed && !mover.struck) {
    mover.struck = true
    const scene = mover.sprite.scene
    if (mover.kind === "bark") {
      healSpark(scene, mover.baseX + (mover.amplitude < 0 ? 1 : -1) * mover.sprite.displayWidth * 0.5, mover.baseY)
    } else {
      const frost = mover.kind === "screen"
      thumpDust(scene, mover.baseX, mover.baseY + mover.sprite.displayHeight / 2, mover.sprite.displayWidth, frost)
    }
  } else if (!landed) {
    mover.struck = false
  }
  const striking = u >= beat.holdEnd && u < beat.dropEnd + 0.03
  return { dx, dy, striking }
}

/**
 * Pestles and rollers are one-way tops that move faster than Arcade can resolve,
 * so Mei lands on them and rides them here instead of through a collider.
 */
function rideStone(
  mover: MoverState,
  player: Phaser.Physics.Arcade.Sprite,
  body: Phaser.Physics.Arcade.Body,
  top: number,
  dx: number,
  dt: number,
): boolean {
  const overX =
    body.right > mover.sprite.x - mover.sprite.displayWidth * 0.5 + 4 &&
    body.left < mover.sprite.x + mover.sprite.displayWidth * 0.5 - 4
  const feet = body.bottom
  const falling = body.velocity.y >= 0
  const reach = mover.rider ? 28 : 6 + Math.max(0, body.velocity.y) * dt * 1.5
  const landed = overX && falling && feet >= top - (mover.rider ? 28 : 4) && feet <= top + reach
  mover.rider = landed
  if (!landed) {
    return false
  }
  player.x += dx
  player.y += top - feet
  body.velocity.y = 0
  body.touching.none = false
  body.touching.down = true
  body.blocked.down = true
  return true
}

/**
 * Bark slabs are thin shelves. From below Mei bonks her head. If a closing slab
 * catches her inside it, she goes up onto it or down under it, never sideways.
 */
function blockBark(mover: MoverState, player: Phaser.Physics.Arcade.Sprite, body: Phaser.Physics.Arcade.Body): void {
  const halfW = mover.sprite.displayWidth * 0.5
  const halfH = mover.sprite.displayHeight * 0.5
  const top = mover.sprite.y - halfH
  const bottom = mover.sprite.y + halfH
  const overlap =
    body.right > mover.sprite.x - halfW + 2 &&
    body.left < mover.sprite.x + halfW - 2 &&
    body.bottom > top &&
    body.top < bottom
  if (!overlap) {
    return
  }
  if (body.center.y < mover.sprite.y) {
    player.y += top - body.bottom
    body.velocity.y = Math.min(body.velocity.y, 0)
    return
  }
  player.y += bottom - body.top + 1
  body.velocity.y = Math.max(body.velocity.y, 0)
}

export function updateMovers(
  states: MoverState[],
  player: Phaser.Physics.Arcade.Sprite,
  dt: number,
): MoverHit[] {
  const hits: MoverHit[] = []
  const body = player.body as Phaser.Physics.Arcade.Body
  for (const mover of states) {
    mover.phase += dt * mover.speed
    let dx = 0
    let dy = 0
    let striking = false
    if (isBeat(mover.kind)) {
      const step = tickBeat(mover)
      dx = step.dx
      dy = step.dy
      striking = step.striking
    } else {
      const offset = Math.sin(mover.phase) * mover.amplitude
      const nextX = mover.axis === "x" ? mover.baseX + offset : mover.baseX
      const nextY = mover.axis === "y" ? mover.baseY + offset : mover.baseY
      dx = nextX - mover.sprite.x
      dy = nextY - mover.sprite.y
      mover.sprite.setPosition(nextX, nextY)
      if (mover.kind === "roller") {
        mover.sprite.rotation += dx / Math.max(8, mover.sprite.displayWidth * 0.5)
      }
    }
    ;(mover.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
    const top = mover.sprite.y - mover.sprite.displayHeight * 0.5
    const halfW = mover.sprite.displayWidth * 0.5
    const overX = Math.abs(player.x - mover.sprite.x) < mover.sprite.displayWidth * 0.55
    if (!isStone(mover.kind)) {
      const grounded = body.blocked.down || body.touching.down
      if (grounded && overX && Math.abs(player.y - top) < 40) {
        player.x += dx
        player.y += dy
      }
      continue
    }
    if (rideStone(mover, player, body, top, dx, dt)) {
      continue
    }
    if (mover.kind === "bark") {
      blockBark(mover, player, body)
      continue
    }
    const overlap =
      body.right > mover.sprite.x - halfW + 6 &&
      body.left < mover.sprite.x + halfW - 6 &&
      body.bottom > top + 8 &&
      body.top < mover.sprite.y + mover.sprite.displayHeight * 0.5
    if (!overlap) {
      continue
    }
    if (mover.kind === "screen") {
      hits.push({ kind: "screen", fromX: mover.sprite.x, halfWidth: halfW })
    } else if (mover.kind === "pestle" && striking) {
      hits.push({ kind: "pestle", fromX: mover.sprite.x, halfWidth: halfW })
    } else if (mover.kind === "roller") {
      hits.push({ kind: "roller", fromX: mover.sprite.x, halfWidth: halfW })
    }
  }
  return hits
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
    if (hazard.kind !== "water") {
      // Dust Sea tides and pools draw and act in dustTides.ts. This rect only keeps
      // the editor's hazard index. Visible in Build so it can be picked.
      water.setFillStyle(0xd8d0c0, 0.25)
      water.setVisible(false)
      continue
    }
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
