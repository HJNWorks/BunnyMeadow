import Phaser from "phaser"
import { getAudio } from "../../../core/audio"

const HEARTS = 5
export const HAN_WARMTH = 3.0
const FROST_GAPS = [0.32, 0.32, 0.82, 0.22, 0.22, 1.05]
const STAR_GAPS = [0.72, 0.48, 0.94]
const CAKE_SPOTS = [
  { x: 385, y: 800 },
  { x: 900, y: 800 },
  { x: 1120, y: 800 },
]

export type HanPhase = "frost" | "star" | "both"

export function hanPhaseForHearts(hearts: number): HanPhase {
  if (hearts <= 1) {
    return "both"
  }
  if (hearts <= 3) {
    return "star"
  }
  return "frost"
}

export class HanFight {
  sprite: Phaser.Physics.Arcade.Sprite
  hearts = HEARTS
  needed = HEARTS
  warmth = 0
  settled = false
  private frostCd = 0.4
  private starCd = 0.8
  private frostIndex = 0
  private starIndex = 0
  private cake: Phaser.Physics.Arcade.Image | null = null
  private cakeCd = 0.3
  private cakeSpot = 0
  private hitCd = 0
  private worldWidth: number

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private player: Phaser.Physics.Arcade.Sprite,
    private projectiles: Phaser.Physics.Arcade.Group,
    worldWidth: number,
  ) {
    this.worldWidth = worldWidth
    this.sprite = scene.physics.add.sprite(x, y, "story_han")
    this.sprite.setDisplaySize(88, 110)
    this.sprite.setData("archetype", "han_boss")
    this.sprite.setImmovable(true)
    this.sprite.setDepth(6)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setSize(this.sprite.frame.width, this.sprite.frame.height)
    body.updateFromGameObject()
  }

  get phase(): HanPhase {
    return hanPhaseForHearts(this.hearts)
  }

  cakePos(): { x: number; y: number } | null {
    if (!this.cake || !this.cake.active) {
      return null
    }
    return { x: this.cake.x, y: this.cake.y }
  }

  lostHearts(): number {
    return this.needed - this.hearts
  }

  update(dt: number): void {
    this.warmth = Math.max(0, this.warmth - dt)
    this.hitCd = Math.max(0, this.hitCd - dt)
    this.frostCd = Math.max(0, this.frostCd - dt)
    this.starCd = Math.max(0, this.starCd - dt)
    this.cakeCd = Math.max(0, this.cakeCd - dt)
    if (this.settled) {
      this.cake?.destroy()
      this.cake = null
      this.sprite.setVelocity(0, 0)
      this.sprite.setAlpha(0.35)
      return
    }
    const bob = Math.sin(this.scene.time.now / 420) * 18
    this.sprite.y = 700 + bob
    this.sprite.setVelocity(0, 0)
    ;(this.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
    if (this.warmth > 0) {
      this.player.setTint(0xffe6a8)
    } else if (this.player.tintTopLeft === 0xffe6a8) {
      this.player.clearTint()
    }
    this.tickCake()
    const phase = this.phase
    if (phase === "frost" || phase === "both") {
      this.tickFrost()
    }
    if (phase === "star" || phase === "both") {
      this.tickStar()
    }
    this.cullShots()
  }

  tryEatCake(): void {
    if (!this.cake || !this.cake.active) {
      return
    }
    if (Math.abs(this.player.x - this.cake.x) > 40 || Math.abs(this.player.y - this.cake.y) > 56) {
      return
    }
    this.cake.destroy()
    this.cake = null
    this.warmth = HAN_WARMTH
    this.cakeCd = 1.35
    getAudio().playSfx("pickup")
  }

  tryDashHit(dashTime: number): "hit" | "hurt" | "none" {
    if (this.settled || this.hitCd > 0) {
      return "none"
    }
    if (dashTime <= 0 || this.warmth <= 0) {
      this.hitCd = 0.85
      return "hurt"
    }
    this.hearts -= 1
    this.hitCd = 0.7
    this.warmth = 0
    this.player.clearTint()
    this.sprite.setTint(0xffffff)
    this.scene.time.delayedCall(140, () => this.sprite.clearTint())
    getAudio().playSfx("hurt")
    if (this.hearts <= 0) {
      this.hearts = 0
      this.settled = true
      this.sprite.setAlpha(0.35)
      this.sprite.setVelocity(0, 0)
      getAudio().playSfx("mist")
    }
    return "hit"
  }

  private pace(): number {
    return 1 / (1 + 0.2 * this.lostHearts())
  }

  private tickFrost(): void {
    if (this.frostCd > 0) {
      return
    }
    const dir = this.player.x < this.sprite.x ? -1 : 1
    const shot = this.scene.physics.add.image(this.sprite.x + dir * 40, 808, "story_frost")
    shot.setDisplaySize(46, 10)
    shot.setDepth(5)
    const body = shot.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setVelocity(dir * (360 + this.lostHearts() * 36), 0)
    this.projectiles.add(shot)
    const gap = FROST_GAPS[this.frostIndex % FROST_GAPS.length] * this.pace()
    this.frostIndex += 1
    this.frostCd = gap
  }

  private tickStar(): void {
    if (this.starCd > 0) {
      return
    }
    const spread = this.lostHearts() >= 2 ? 2 : 1
    for (let i = 0; i < spread; i += 1) {
      const x = this.player.x + (i === 0 ? 0 : 70 * (i % 2 === 0 ? 1 : -1))
      const shot = this.scene.physics.add.image(x, 90 + i * 40, "story_star")
      shot.setDisplaySize(14, 28)
      shot.setDepth(5)
      const body = shot.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      body.setVelocity(0, 280 + this.lostHearts() * 28)
      this.projectiles.add(shot)
    }
    const gap = STAR_GAPS[this.starIndex % STAR_GAPS.length] * this.pace()
    this.starIndex += 1
    this.starCd = gap
  }

  private tickCake(): void {
    if (this.cake && this.cake.active) {
      this.cake.y = CAKE_SPOTS[this.cakeSpot].y + Math.sin(this.scene.time.now / 260) * 4
      return
    }
    if (this.cakeCd > 0) {
      return
    }
    this.cakeSpot = (this.cakeSpot + 1) % CAKE_SPOTS.length
    const spot = CAKE_SPOTS[this.cakeSpot]
    this.cake = this.scene.physics.add.image(spot.x, spot.y, "story_mooncake")
    this.cake.setDisplaySize(28, 28)
    this.cake.setDepth(4)
    ;(this.cake.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
  }

  private cullShots(): void {
    this.projectiles.getChildren().forEach((obj) => {
      const shot = obj as Phaser.Physics.Arcade.Image
      if (!shot.active) {
        return
      }
      if (shot.x < -80 || shot.x > this.worldWidth + 80 || shot.y > 1100) {
        shot.destroy()
      }
    })
  }
}
