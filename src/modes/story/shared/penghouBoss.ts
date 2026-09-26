import Phaser from "phaser"
import { getAudio } from "../../../core/audio"

/**
 * Penghou (彭侯), the spirit of the moon cassia (Soushen ji: a cut tree bleeds and a
 * tailless dog-bodied spirit with a human face comes out). Wu Gang never stops
 * cutting, so this one never rests. It guards the gold heartwood and takes Mei for
 * one more woodcutter.
 *
 * Mei cannot hurt it. She closes the open gold cuts in the heartwood. Each closed cut
 * calms it. When every cut is closed it settles and the way up opens. Never eaten,
 * never beaten, never an axe.
 */

export type PenghouLine = "wake" | "mid" | "last" | "settled"

export type PenghouCourt = { left: number; right: number; top: number; bottom: number }

export type PenghouOpts = {
  reducedMotion: boolean
  platforms: Phaser.Physics.Arcade.StaticGroup
  court: PenghouCourt
  cuts: { x: number; y: number }[]
  speak?: (line: PenghouLine) => void
}

type Cut = {
  x: number
  y: number
  sprite: Phaser.GameObjects.Image
  glow: Phaser.GameObjects.Ellipse
  open: boolean
}

type Shard = { sprite: Phaser.GameObjects.Image; vx: number; vy: number; life: number }

const CUT_REACH = 44
const SHARD_SPEED = 250
const SHARD_LIFE = 2.6
const WINDUP = 0.55
const HOWL = 1.2

export class PenghouFight {
  readonly needed: number
  settled = false
  private sprite: Phaser.Physics.Arcade.Sprite
  private cuts: Cut[] = []
  private shards: Shard[] = []
  private state: "prowl" | "windup" | "howl" | "settled" = "prowl"
  private timer = 0
  private volleyCd = 2.2
  private jumpCd = 0.8
  private hitCd = 0
  private clock = 0
  private collider: Phaser.Physics.Arcade.Collider

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private player: Phaser.Physics.Arcade.Sprite,
    private opts: PenghouOpts,
  ) {
    this.sprite = scene.physics.add.sprite(x, y, "story_penghou")
    this.sprite.setDisplaySize(128, 90)
    this.sprite.setDepth(4)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(this.sprite.frame.width * 0.8, this.sprite.frame.height * 0.8)
    this.sprite.setCollideWorldBounds(true)
    this.collider = scene.physics.add.collider(this.sprite, opts.platforms)
    for (const spot of opts.cuts) {
      const glow = scene.add.ellipse(spot.x, spot.y, 70, 110, 0xf0c860, 0.18).setDepth(1.8)
      const sprite = scene.add.image(spot.x, spot.y, "story_cut").setDisplaySize(30, 80).setDepth(1.9)
      this.cuts.push({ x: spot.x, y: spot.y, sprite, glow, open: true })
    }
    this.needed = this.cuts.length
    opts.speak?.("wake")
  }

  /** Open cuts left. The HUD shows these as the spirit's hearts. */
  get hearts(): number {
    return this.cuts.filter((cut) => cut.open).length
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  update(dt: number): void {
    this.clock += dt
    this.hitCd = Math.max(0, this.hitCd - dt)
    this.pulseCuts()
    this.tickShards(dt)
    this.tryCloseCut()
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    if (this.sprite.y > this.opts.court.bottom + 80) {
      // Never lost below the room.
      this.sprite.setPosition((this.opts.court.left + this.opts.court.right) / 2, this.opts.court.bottom - 80)
      body.setVelocity(0, 0)
    }
    if (this.state === "settled") {
      body.setVelocityX(0)
      this.sprite.setAlpha(0.85 + Math.sin(this.clock * 2) * 0.1)
      return
    }
    const angry = this.hearts <= Math.ceil(this.needed / 2)
    if (this.state === "howl") {
      this.timer -= dt
      body.setVelocityX(0)
      if (this.timer <= 0) {
        this.state = "prowl"
        this.sprite.clearTint()
      }
      return
    }
    if (this.state === "windup") {
      this.timer -= dt
      body.setVelocityX(0)
      const flick = Math.sin(this.clock * 40) > 0
      this.sprite.setTint(flick ? 0xffd27a : 0xffffff)
      if (this.timer <= 0) {
        this.sprite.clearTint()
        this.fireVolley(angry ? 5 : 3)
        this.state = "prowl"
        this.volleyCd = angry ? 2.6 : 3.4
      }
      return
    }
    const dx = this.player.x - this.sprite.x
    const dir = Math.sign(dx) || 1
    const speed = angry ? 135 : 95
    body.setVelocityX(Math.abs(dx) > 24 ? dir * speed : 0)
    this.sprite.setFlipX(dir < 0)
    const court = this.opts.court
    if (this.sprite.x < court.left + 50 && body.velocity.x < 0) {
      body.setVelocityX(0)
    }
    if (this.sprite.x > court.right - 50 && body.velocity.x > 0) {
      body.setVelocityX(0)
    }
    this.jumpCd -= dt
    const onFloor = body.blocked.down || body.touching.down
    if (onFloor && this.jumpCd <= 0 && this.player.y < this.sprite.y - 90 && Math.abs(dx) < 360) {
      body.setVelocityY(-560)
      this.jumpCd = angry ? 1.1 : 1.6
    }
    this.volleyCd -= dt
    if (this.volleyCd <= 0 && onFloor) {
      this.state = "windup"
      this.timer = WINDUP
    }
  }

  /** Contact with the spirit or a shard. A dash slips past both. */
  takeHurt(dashTime: number): boolean {
    if (this.settled || this.hitCd > 0 || dashTime > 0) {
      return false
    }
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    for (const shard of this.shards) {
      if (Math.abs(shard.sprite.x - this.player.x) < 18 && Math.abs(shard.sprite.y - pb.center.y) < 22) {
        shard.life = 0
        this.hitCd = 0.9
        return true
      }
    }
    if (this.state === "howl") {
      return false
    }
    const sb = this.sprite.body as Phaser.Physics.Arcade.Body
    const touching = pb.right > sb.left + 6 && pb.left < sb.right - 6 && pb.bottom > sb.top + 6 && pb.top < sb.bottom
    if (touching) {
      this.hitCd = 1.0
      return true
    }
    return false
  }

  destroy(): void {
    this.collider.destroy()
    this.sprite.destroy()
    for (const cut of this.cuts) {
      cut.sprite.destroy()
      cut.glow.destroy()
    }
    for (const shard of this.shards) {
      shard.sprite.destroy()
    }
    this.cuts = []
    this.shards = []
  }

  private pulseCuts(): void {
    for (const cut of this.cuts) {
      if (!cut.open) {
        continue
      }
      const pulse = this.opts.reducedMotion ? 0.2 : 0.14 + Math.sin(this.clock * 3 + cut.x) * 0.08
      cut.glow.setFillStyle(0xf0c860, pulse)
    }
  }

  private tryCloseCut(): void {
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    for (const cut of this.cuts) {
      if (!cut.open) {
        continue
      }
      if (Math.abs(pb.center.x - cut.x) > CUT_REACH || Math.abs(pb.center.y - cut.y) > CUT_REACH + 20) {
        continue
      }
      cut.open = false
      cut.sprite.setTint(0x7a6a52)
      cut.glow.setFillStyle(0xf0c860, 0)
      this.spark(cut.x, cut.y)
      getAudio().playSfx("pickup")
      this.onCutClosed()
    }
  }

  private onCutClosed(): void {
    for (const shard of this.shards) {
      shard.life = 0
    }
    const left = this.hearts
    if (left <= 0) {
      this.settle()
      return
    }
    this.state = "howl"
    this.timer = HOWL
    this.sprite.setTint(0xfff0c0)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocityY(-220)
    if (left === 1) {
      this.opts.speak?.("last")
    } else if (left === this.needed - 1) {
      this.opts.speak?.("mid")
    }
  }

  private settle(): void {
    this.settled = true
    this.state = "settled"
    this.sprite.setTint(0xf6d88a)
    this.opts.speak?.("settled")
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    if (!this.opts.reducedMotion) {
      for (let i = 0; i < 12; i += 1) {
        this.scene.time.delayedCall(i * 60, () => this.spark(this.sprite.x, this.sprite.y - 10))
      }
    }
  }

  private fireVolley(count: number): void {
    const from = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y - 10)
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    const aim = Math.atan2(pb.center.y - from.y, pb.center.x - from.x)
    const spread = 0.24
    for (let i = 0; i < count; i += 1) {
      const a = aim + (i - (count - 1) / 2) * spread
      const sprite = this.scene.add.image(from.x, from.y, "story_barkchip").setDepth(4.5).setRotation(a)
      this.shards.push({ sprite, vx: Math.cos(a) * SHARD_SPEED, vy: Math.sin(a) * SHARD_SPEED, life: SHARD_LIFE })
    }
  }

  private tickShards(dt: number): void {
    for (const shard of this.shards) {
      shard.life -= dt
      shard.sprite.x += shard.vx * dt
      shard.sprite.y += shard.vy * dt
      shard.sprite.rotation += dt * 6
    }
    const live: Shard[] = []
    for (const shard of this.shards) {
      if (shard.life > 0) {
        live.push(shard)
      } else {
        shard.sprite.destroy()
      }
    }
    this.shards = live
  }

  private spark(x: number, y: number): void {
    const count = this.opts.reducedMotion ? 3 : 8
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2
      const mote = this.scene.add.circle(x, y, 3, i % 2 === 0 ? 0xf6d88a : 0xd4b05a, 0.95).setDepth(4.6)
      this.scene.tweens.add({
        targets: mote,
        x: x + Math.cos(a) * 34,
        y: y + Math.sin(a) * 34,
        alpha: 0,
        duration: 520,
        ease: "Cubic.easeOut",
        onComplete: () => mote.destroy(),
      })
    }
  }
}
