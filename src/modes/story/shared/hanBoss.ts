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
const BEAM_LEN = 1800
const BEAM_HALF = 28
const IN_S = 1.3
const OUT_S = 1.5
const MOTE_N = 22

export type HanPhase = "frost" | "star" | "both"
export type HanLine = "full" | "mid" | "last" | "beaten"

type BeamMode = "idle" | "charge" | "beam"
type SettlePhase = "none" | "in" | "out"

type Mote = { angle: number; radius: number; spin: number }

type Burn = {
  sprite: Phaser.GameObjects.Image
  life: number
  maxLife: number
}

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

export type HanFightOpts = {
  reducedMotion: boolean
  speak?: (line: HanLine) => void
  platforms: Phaser.Physics.Arcade.StaticGroup
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
  private reducedMotion: boolean
  private speak?: (line: HanLine) => void
  private spoken = new Set<HanLine>()
  private beamMode: BeamMode = "idle"
  private beamCd = 0
  private beamRoll = 0
  private chargeT = 0
  private beamT = 0
  private beamAng = 0
  private beamHit = false
  private beamForce = -1
  private beamSlab: Phaser.GameObjects.Rectangle
  private beamCore: Phaser.GameObjects.Rectangle
  private beamLen = BEAM_LEN
  private burnAcc = 0
  private lastBurnX = 0
  private lastBurnY = 0
  private burns: Burn[] = []
  private platforms: Phaser.Physics.Arcade.StaticGroup
  private settlePhase: SettlePhase = "none"
  private settleT = 0
  private settleX = 0
  private settleY = 0
  private motes: Mote[] = []
  private fxGfx: Phaser.GameObjects.Graphics
  private moon: Phaser.GameObjects.Image | null = null

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private player: Phaser.Physics.Arcade.Sprite,
    private projectiles: Phaser.Physics.Arcade.Group,
    worldWidth: number,
    opts: HanFightOpts,
  ) {
    this.worldWidth = worldWidth
    this.reducedMotion = opts.reducedMotion
    this.speak = opts.speak
    this.platforms = opts.platforms
    this.aimX = x
    this.aimY = y
    ensureScorch(scene)
    this.sprite = scene.physics.add.sprite(x, y, hanTextureKey(0))
    this.sprite.setDisplaySize(110, 138)
    this.sprite.setData("archetype", "han_boss")
    this.sprite.setImmovable(true)
    this.sprite.setDepth(6)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setSize(this.sprite.frame.width, this.sprite.frame.height)
    body.updateFromGameObject()
    this.beamSlab = scene.add.rectangle(x, y, BEAM_LEN, 56, 0xc8e8ff, 0.55)
    this.beamSlab.setOrigin(0, 0.5)
    this.beamSlab.setDepth(8)
    this.beamSlab.setVisible(false)
    this.beamCore = scene.add.rectangle(x, y, BEAM_LEN, 18, 0xfff8d0, 0.95)
    this.beamCore.setOrigin(0, 0.5)
    this.beamCore.setDepth(9)
    this.beamCore.setVisible(false)
    this.fxGfx = scene.add.graphics().setDepth(10)
    ensurePalaceMoon(scene)
    this.pickRoam()
    this.say("full")
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

  takeBeamHit(): boolean {
    if (!this.beamHit) {
      return false
    }
    this.beamHit = false
    return true
  }

  destroy(): void {
    this.clearBurns()
    this.beamSlab.destroy()
    this.beamCore.destroy()
    this.fxGfx.destroy()
    this.moon?.destroy()
    this.moon = null
    this.cake?.destroy()
    this.cake = null
  }

  update(dt: number): void {
    this.warmth = Math.max(0, this.warmth - dt)
    this.hitCd = Math.max(0, this.hitCd - dt)
    this.frostCd = Math.max(0, this.frostCd - dt)
    this.starCd = Math.max(0, this.starCd - dt)
    this.cakeCd = Math.max(0, this.cakeCd - dt)
    this.tickBurns(dt)
    if (this.settled) {
      this.cake?.destroy()
      this.cake = null
      this.sprite.setVelocity(0, 0)
      return
    }
    if (this.settlePhase !== "none") {
      this.tickSettle(dt)
      return
    }
    const locking = this.beamMode === "charge" || this.beamMode === "beam"
    if (locking) {
      this.sprite.setVelocity(0, 0)
    } else {
      this.roam(dt)
    }
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
    this.tickBeam(dt)
    this.cullShots()
  }

  tryEatCake(): void {
    if (this.settlePhase !== "none" || this.settled) {
      return
    }
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
    if (this.settled || this.settlePhase !== "none" || this.hitCd > 0) {
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
    if (this.hearts === 3) {
      this.say("mid")
      this.beamForce = 0.7
    }
    if (this.hearts === 1) {
      this.say("last")
      if (this.beamMode === "idle") {
        this.beamForce = 0.45
        this.beamCd = 0
      }
    }
    if (this.hearts <= 0) {
      this.hearts = 0
      this.beginSettle()
    }
    return "hit"
  }

  private say(line: HanLine): void {
    if (this.spoken.has(line)) {
      return
    }
    this.spoken.add(line)
    this.speak?.(line)
  }

  private applyLook(): void {
    const lost = this.lostHearts()
    const key = hanTextureKey(lost)
    if (this.sprite.texture.key !== key) {
      this.sprite.setTexture(key)
    }
    const w = 110 + lost * 22
    const h = 138 + lost * 26
    this.sprite.setDisplaySize(w, h)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(this.sprite.frame.width, this.sprite.frame.height)
    body.updateFromGameObject()
    this.sprite.setTint(lost >= 3 ? 0xa8c8ff : 0xd0e4ff)
    this.scene.time.delayedCall(220, () => {
      if (this.sprite.active) {
        this.sprite.clearTint()
      }
    })
  }

  private pace(): number {
    return 1 / (1 + 0.2 * this.lostHearts())
  }

  private roamSpeed(): number {
    if (this.hearts <= 1) {
      return 248
    }
    if (this.hearts <= 3) {
      return 168
    }
    return 96
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
    const speed = this.roamSpeed()
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

  private turnToward(cur: number, target: number, maxStep: number): number {
    let d = Phaser.Math.Angle.Wrap(target - cur)
    if (d > maxStep) {
      d = maxStep
    }
    if (d < -maxStep) {
      d = -maxStep
    }
    return cur + d
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

  private chargeDur(): number {
    if (this.reducedMotion) {
      return 0.55
    }
    return this.hearts <= 1 ? 1 : 2
  }

  private beamTurn(dt: number): number {
    if (this.hearts <= 1) {
      return 1.85 * dt
    }
    return 1.15 * dt
  }

  private tickBeam(dt: number): void {
    this.beamCd = Math.max(0, this.beamCd - dt)
    if (this.beamForce >= 0) {
      this.beamForce = Math.max(0, this.beamForce - dt)
    }
    if (this.hearts > 3) {
      this.hideBeam()
      return
    }
    if (this.beamMode === "idle") {
      this.hideBeam()
      if (this.beamForce === 0) {
        this.beamForce = -1
        this.startCharge()
        return
      }
      if (this.beamCd > 0) {
        return
      }
      this.beamRoll += dt
      if (this.beamRoll >= 0.5) {
        this.beamRoll = 0
        if (Math.random() < 0.45) {
          this.startCharge()
        }
      }
      return
    }
    const want = this.aimAngle()
    if (this.beamMode === "charge") {
      this.chargeT += dt
      this.beamAng = this.turnToward(this.beamAng, want, 5 * dt)
      this.beamLen = this.clipBeam()
      this.drawBeam(false)
      this.paintImpact(dt, false)
      if (this.chargeT >= this.chargeDur()) {
        this.beamMode = "beam"
        this.beamT = 0
      }
      return
    }
    this.beamT += dt
    this.beamAng = this.turnToward(this.beamAng, want, this.beamTurn(dt))
    this.beamLen = this.clipBeam()
    this.drawBeam(true)
    this.paintImpact(dt, true)
    if (this.playerInBeam()) {
      this.beamHit = true
    }
    if (this.beamT >= 4) {
      this.beamMode = "idle"
      this.beamCd = 10
      this.beamRoll = 0
      this.hideBeam()
    }
  }

  private startCharge(): void {
    this.beamMode = "charge"
    this.chargeT = 0
    this.beamAng = this.aimAngle()
    this.sprite.setTint(0xe8f4ff)
  }

  private hideBeam(): void {
    this.beamSlab.setVisible(false)
    this.beamCore.setVisible(false)
    if (this.beamMode === "idle" && this.sprite.tintTopLeft === 0xe8f4ff) {
      this.sprite.clearTint()
    }
  }

  private drawBeam(hot: boolean): void {
    const x = this.sprite.x
    const y = this.sprite.y
    this.beamSlab.setPosition(x, y)
    this.beamSlab.setRotation(this.beamAng)
    this.beamSlab.setVisible(true)
    this.beamSlab.setFillStyle(hot ? 0xf4fbff : 0x7ec8ff, hot ? 0.5 : 0.42)
    this.beamSlab.setDisplaySize(this.beamLen, hot ? 64 : 22)
    this.beamCore.setPosition(x, y)
    this.beamCore.setRotation(this.beamAng)
    this.beamCore.setVisible(true)
    this.beamCore.setFillStyle(hot ? 0xfff8d0 : 0xffffff, hot ? 0.96 : 0.7)
    this.beamCore.setDisplaySize(this.beamLen, hot ? 20 : 8)
  }

  private clipBeam(): number {
    const ox = this.sprite.x
    const oy = this.sprite.y
    const ux = Math.cos(this.beamAng)
    const uy = Math.sin(this.beamAng)
    let reach = BEAM_LEN
    for (const obj of this.platforms.getChildren()) {
      const body = (obj as Phaser.GameObjects.GameObject).body as Phaser.Physics.Arcade.StaticBody | null
      if (!body) {
        continue
      }
      const hit = rayAabb(ox, oy, ux, uy, body.left, body.right, body.top, body.bottom, reach)
      if (hit !== null && hit < reach) {
        reach = hit
      }
    }
    return Math.max(24, reach)
  }

  private paintImpact(dt: number, hot: boolean): void {
    if (this.beamLen >= BEAM_LEN - 2) {
      this.fxGfx.clear()
      return
    }
    const x = this.sprite.x + Math.cos(this.beamAng) * this.beamLen
    const y = this.sprite.y + Math.sin(this.beamAng) * this.beamLen
    this.fxGfx.clear()
    const now = this.scene.time.now
    if (!hot) {
      const glow = 8 + Math.sin(now / 90) * 3
      this.fxGfx.fillStyle(0xff9a4a, 0.5)
      this.fxGfx.fillCircle(x, y, glow)
      this.fxGfx.fillStyle(0xffe08a, 0.35)
      this.fxGfx.fillCircle(x, y, glow * 0.45)
      return
    }
    const spark = 7 + Math.sin(now / 50) * 5
    this.fxGfx.fillStyle(0xff6a20, 0.55)
    this.fxGfx.fillCircle(x, y, spark + 10)
    this.fxGfx.fillStyle(0xffe08a, 0.92)
    this.fxGfx.fillCircle(x, y, spark)
    this.fxGfx.fillStyle(0xfff8d0, 0.8)
    this.fxGfx.fillCircle(x - Math.cos(this.beamAng) * 8, y - Math.sin(this.beamAng) * 8, spark * 0.5)
    for (let i = 0; i < 5; i += 1) {
      const t = now / 80 + i * 1.6
      const lift = 6 + ((t * 11) % 22)
      const wobble = Math.sin(t + i) * 7
      this.fxGfx.fillStyle(0xffc060, 0.55 - (lift / 40))
      this.fxGfx.fillCircle(x + wobble, y - lift, 2.4)
    }
    if (this.reducedMotion) {
      if (this.burns.length === 0) {
        this.spawnBurn(x, y, 1.6)
      }
      return
    }
    this.burnAcc += dt
    const dist = Math.hypot(x - this.lastBurnX, y - this.lastBurnY)
    if (this.burnAcc >= 0.04 && (this.burns.length === 0 || dist > 10)) {
      this.burnAcc = 0
      this.lastBurnX = x
      this.lastBurnY = y
      this.spawnBurn(x, y, 1.15)
    }
  }

  private spawnBurn(x: number, y: number, life: number): void {
    const mark = this.scene.add.image(x, y, "story_han_scorch")
    mark.setDepth(2.2)
    mark.setRotation(this.beamAng + Math.PI / 2)
    mark.setDisplaySize(28 + Math.random() * 18, 16 + Math.random() * 10)
    mark.setAlpha(0.9)
    this.burns.push({ sprite: mark, life, maxLife: life })
  }

  private tickBurns(dt: number): void {
    if (this.beamMode === "idle") {
      this.fxGfx.clear()
    }
    const live: Burn[] = []
    const now = this.scene.time.now
    for (const burn of this.burns) {
      burn.life -= dt
      const u = Math.max(0, burn.life / burn.maxLife)
      const flicker = this.reducedMotion ? 1 : 0.82 + 0.18 * Math.sin(now / 55 + burn.life * 9)
      burn.sprite.setAlpha(u * 0.92 * flicker)
      if (burn.life > 0) {
        live.push(burn)
      } else {
        burn.sprite.destroy()
      }
    }
    this.burns = live
  }

  private clearBurns(): void {
    for (const burn of this.burns) {
      burn.sprite.destroy()
    }
    this.burns = []
    this.fxGfx.clear()
  }

  private playerInBeam(): boolean {
    const dx = this.player.x - this.sprite.x
    const dy = this.player.y - this.sprite.y
    const ux = Math.cos(this.beamAng)
    const uy = Math.sin(this.beamAng)
    const along = dx * ux + dy * uy
    if (along < 0 || along > this.beamLen - 6) {
      return false
    }
    const dist = Math.abs(dx * uy - dy * ux)
    return dist <= BEAM_HALF
  }

  private beginSettle(): void {
    this.say("beaten")
    this.settleX = this.sprite.x
    this.settleY = this.sprite.y
    this.sprite.setVelocity(0, 0)
    this.cake?.destroy()
    this.cake = null
    this.beamMode = "idle"
    this.hideBeam()
    this.projectiles.getChildren().slice().forEach((obj) => {
      (obj as Phaser.Physics.Arcade.Image).destroy()
    })
    getAudio().playSfx("mist")
    if (this.reducedMotion) {
      this.sprite.setVisible(false)
      this.placeMoon(1)
      this.finishSettle()
      return
    }
    this.settlePhase = "in"
    this.settleT = 0
    this.motes = []
    for (let i = 0; i < MOTE_N; i += 1) {
      this.motes.push({
        angle: (i / MOTE_N) * Math.PI * 2,
        radius: 70 + (i % 5) * 18,
        spin: 4.2 + (i % 3) * 0.6,
      })
    }
  }

  private tickSettle(dt: number): void {
    this.settleT += dt
    this.sprite.setVelocity(0, 0)
    this.sprite.x = this.settleX
    this.sprite.y = this.settleY
    if (this.settlePhase === "in") {
      const u = Math.min(1, this.settleT / IN_S)
      this.sprite.setAlpha(1 - u)
      this.sprite.setDisplaySize(110 * (1 - u * 0.85), 138 * (1 - u * 0.85))
      this.paintMotes(u, true)
      if (this.settleT >= IN_S) {
        this.settlePhase = "out"
        this.settleT = 0
        this.sprite.setVisible(false)
        this.placeMoon(0.08)
      }
      return
    }
    const u = Math.min(1, this.settleT / OUT_S)
    this.placeMoon(0.08 + u * 0.92)
    this.paintMotes(u, false)
    if (this.settleT >= OUT_S) {
      this.fxGfx.clear()
      this.placeMoon(1)
      this.finishSettle()
    }
  }

  private paintMotes(u: number, inward: boolean): void {
    this.fxGfx.clear()
    for (const mote of this.motes) {
      const t = inward ? 1 - u : u
      const r = mote.radius * t
      const a = mote.angle + this.settleT * mote.spin * (inward ? 1 : -1)
      const x = this.settleX + Math.cos(a) * r
      const y = this.settleY + Math.sin(a) * r
      this.fxGfx.fillStyle(0xf7fbff, 0.35 + t * 0.5)
      this.fxGfx.fillCircle(x, y, 3 + t * 4)
    }
  }

  private placeMoon(scale: number): void {
    if (!this.moon) {
      this.moon = this.scene.add.image(this.settleX, this.settleY, "story_han_moon")
      this.moon.setDepth(5)
    }
    this.moon.setPosition(this.settleX, this.settleY)
    this.moon.setDisplaySize(200 * scale, 200 * scale)
    this.moon.setAlpha(Math.min(1, 0.35 + scale))
  }

  private finishSettle(): void {
    this.settlePhase = "none"
    this.settled = true
    this.sprite.setVisible(false)
    this.sprite.setAlpha(0)
    this.sprite.setVelocity(0, 0)
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

function ensurePalaceMoon(scene: Phaser.Scene): void {
  if (scene.textures.exists("story_han_moon")) {
    return
  }
  const canvas = document.createElement("canvas")
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return
  }
  ctx.fillStyle = "#f7fbff"
  ctx.beginPath()
  ctx.arc(100, 100, 92, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#d4e4f2"
  ctx.beginPath()
  ctx.arc(118, 92, 70, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#c8d8e8"
  ctx.beginPath()
  ctx.arc(70, 120, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(130, 140, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(110, 64, 10, 0, Math.PI * 2)
  ctx.fill()
  scene.textures.addCanvas("story_han_moon", canvas)
}

function ensureScorch(scene: Phaser.Scene): void {
  if (scene.textures.exists("story_han_scorch")) {
    return
  }
  const canvas = document.createElement("canvas")
  canvas.width = 36
  canvas.height = 24
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return
  }
  ctx.fillStyle = "#2a2018"
  ctx.beginPath()
  ctx.ellipse(18, 12, 16, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#c45a2a"
  ctx.beginPath()
  ctx.ellipse(18, 12, 11, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#ffe08a"
  ctx.beginPath()
  ctx.ellipse(18, 12, 5, 2.4, 0, 0, Math.PI * 2)
  ctx.fill()
  scene.textures.addCanvas("story_han_scorch", canvas)
}

function rayAabb(
  ox: number,
  oy: number,
  ux: number,
  uy: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  maxLen: number,
): number | null {
  let tmin = 0
  let tmax = maxLen
  if (Math.abs(ux) < 1e-6) {
    if (ox < left || ox > right) {
      return null
    }
  } else {
    let t1 = (left - ox) / ux
    let t2 = (right - ox) / ux
    if (t1 > t2) {
      const swap = t1
      t1 = t2
      t2 = swap
    }
    tmin = Math.max(tmin, t1)
    tmax = Math.min(tmax, t2)
    if (tmin > tmax) {
      return null
    }
  }
  if (Math.abs(uy) < 1e-6) {
    if (oy < top || oy > bottom) {
      return null
    }
  } else {
    let t1 = (top - oy) / uy
    let t2 = (bottom - oy) / uy
    if (t1 > t2) {
      const swap = t1
      t1 = t2
      t2 = swap
    }
    tmin = Math.max(tmin, t1)
    tmax = Math.min(tmax, t2)
    if (tmin > tmax) {
      return null
    }
  }
  if (tmin <= 8) {
    return null
  }
  return tmin
}
