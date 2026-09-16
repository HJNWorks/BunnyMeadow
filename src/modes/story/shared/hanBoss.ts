import Phaser from "phaser"
import { getAudio } from "../../../core/audio"

const HEARTS = 5
export const HAN_WARMTH = 3.0
const FROST_GAPS = [0.42, 0.42, 0.9, 0.28, 0.28, 1.1]
const STAR_GAPS = [0.78, 0.52, 1.0]
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

export function hanTextureKey(lost: number): string {
  return `story_han_${Math.max(0, Math.min(4, lost))}`
}

export class HanFight {
  sprite: Phaser.Physics.Arcade.Sprite
  hearts = HEARTS
  needed = HEARTS
  warmth = 0
  settled = false
  private frostCd = 0.35
  private starCd = 0.7
  private frostIndex = 0
  private starIndex = 0
  private cake: Phaser.Physics.Arcade.Image | null = null
  private cakeCd = 0.3
  private cakeSpot = 0
  private hitCd = 0
  private worldWidth: number
  private roamT = 0
  private aimX: number
  private aimY: number

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private player: Phaser.Physics.Arcade.Sprite,
    private projectiles: Phaser.Physics.Arcade.Group,
    worldWidth: number,
  ) {
    this.worldWidth = worldWidth
    this.aimX = x
    this.aimY = y
    this.sprite = scene.physics.add.sprite(x, y, hanTextureKey(0))
    this.sprite.setDisplaySize(88, 110)
    this.sprite.setData("archetype", "han_boss")
    this.sprite.setImmovable(true)
    this.sprite.setDepth(6)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setSize(this.sprite.frame.width, this.sprite.frame.height)
    body.updateFromGameObject()
    this.pickRoam()
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
    this.roam(dt)
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
    this.applyLook()
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

  private applyLook(): void {
    const lost = this.lostHearts()
    const key = hanTextureKey(lost)
    if (this.sprite.texture.key !== key) {
      this.sprite.setTexture(key)
    }
    const w = 88 + lost * 10
    const h = 110 + lost * 12
    this.sprite.setDisplaySize(w, h)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(this.sprite.frame.width, this.sprite.frame.height)
    body.updateFromGameObject()
  }

  private pace(): number {
    return 1 / (1 + 0.2 * this.lostHearts())
  }

  private pickRoam(): void {
    const pad = 140
    this.aimX = Phaser.Math.Between(pad, Math.max(pad + 40, this.worldWidth - pad))
    this.aimY = Phaser.Math.Between(240, 520)
    this.roamT = 1.2 + Math.random() * 1.6
  }

  private roam(dt: number): void {
    this.roamT -= dt
    if (this.roamT <= 0 || Math.hypot(this.aimX - this.sprite.x, this.aimY - this.sprite.y) < 36) {
      this.pickRoam()
    }
    const speed = 88 + this.lostHearts() * 32
    const dx = this.aimX - this.sprite.x
    const dy = this.aimY - this.sprite.y + Math.sin(this.scene.time.now / 380) * 18
    const dist = Math.hypot(dx, dy) || 1
    this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed)
    this.sprite.setFlipX(this.player.x < this.sprite.x)
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 120, this.worldWidth - 120)
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 220, 560)
  }

  private aimAngle(): number {
    return Math.atan2(this.player.y - this.sprite.y, this.player.x - this.sprite.x)
  }

  private fireFan(
    key: string,
    count: number,
    spread: number,
    speed: number,
    dw: number,
    dh: number,
    rotOff: number,
  ): void {
    const base = this.aimAngle()
    const lost = this.lostHearts()
    const n = count + (lost >= 3 ? 1 : 0)
    for (let i = 0; i < n; i += 1) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5
      const ang = base + t * spread
      const shot = this.scene.physics.add.image(this.sprite.x, this.sprite.y, key)
      shot.setDisplaySize(dw, dh)
      shot.setDepth(5)
      shot.setRotation(ang + rotOff)
      const body = shot.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      const spd = speed + lost * 28
      body.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd)
      this.projectiles.add(shot)
    }
  }

  private tickFrost(): void {
    if (this.frostCd > 0) {
      return
    }
    this.fireFan("story_frost", 3, 0.55, 340, 46, 10, 0)
    const gap = FROST_GAPS[this.frostIndex % FROST_GAPS.length] * this.pace()
    this.frostIndex += 1
    this.frostCd = gap
  }

  private tickStar(): void {
    if (this.starCd > 0) {
      return
    }
    this.fireFan("story_star", 4, 0.85, 300, 14, 28, Math.PI / 2)
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
      if (shot.x < -80 || shot.x > this.worldWidth + 80 || shot.y > 1100 || shot.y < -80) {
        shot.destroy()
      }
    })
  }
}
