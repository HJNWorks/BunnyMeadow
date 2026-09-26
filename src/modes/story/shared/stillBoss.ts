import Phaser from "phaser"
import { getAudio } from "../../../core/audio"
import type { HanCakeSpot } from "./hanBoss"

export const STILL_HEARTS = 13
export const STILL_WARMTH = 5.0
export const STILL_ASPECTS = 8

export type StillSize = "full" | "quarter" | "eighth"
export type StillLine = "rise" | "split" | "aspects" | "portal"

export type StillShoreRail = {
  left: number
  right: number
  standY: number
}

type BodyRow = {
  sprite: Phaser.Physics.Arcade.Sprite
  size: StillSize
  dir: number
  patrolCd: number
  abilityCd: number
  windup: number
  windupKind: "none" | "stream" | "tsunami"
  hopCd: number
  hopPhase: number
  hitFlash: number
}

type AspectMote = {
  sprite: Phaser.GameObjects.Image
  tx: number
  ty: number
  gather: boolean
}

type StreamVol = {
  owner: BodyRow
  life: number
  tick: number
  dir: number
  length: number
  age: number
  originX: number
  originY: number
}

type TsunamiVol = {
  rect: Phaser.GameObjects.Rectangle
  vx: number
  life: number
}

type CakeSlot = {
  spot: HanCakeSpot
  cake: Phaser.Physics.Arcade.Image | null
  cd: number
}

const SIZE_LOOK: Record<StillSize, { key: string; w: number; h: number; speed: number }> = {
  full: { key: "story_still", w: 288, h: 216, speed: 42 },
  quarter: { key: "story_still_q", w: 144, h: 108, speed: 72 },
  eighth: { key: "story_still_e", w: 72, h: 54, speed: 110 },
}

export type StillFightOpts = {
  reducedMotion: boolean
  speak?: (line: StillLine) => void
  platforms: Phaser.Physics.Arcade.StaticGroup
  clipExtras?: Phaser.GameObjects.GameObject[]
  poolCenterX: number
  poolCenterY: number
  shoreRail?: StillShoreRail
  cakeSpots?: HanCakeSpot[]
  frozen?: boolean
  onStreamHurt?: () => void
  onTsunamiPush?: (dir: number) => void
  onPortalReady?: () => void
}

export function stillTextureKey(size: StillSize): string {
  return SIZE_LOOK[size].key
}

export function stillDisplaySize(size: StillSize): { w: number; h: number } {
  const look = SIZE_LOOK[size]
  return { w: look.w, h: look.h }
}

export class StillFight {
  hearts = STILL_HEARTS
  needed = STILL_HEARTS
  warmth = 0
  settled = false
  portalReady = false
  private bodies: BodyRow[] = []
  private aspects: AspectMote[] = []
  private streams: StreamVol[] = []
  private tsunamis: TsunamiVol[] = []
  private cakeSlots: CakeSlot[] = []
  private hitCd = 0
  private worldWidth: number
  private reducedMotion: boolean
  private speak?: (line: StillLine) => void
  private spoken = new Set<StillLine>()
  private platforms: Phaser.Physics.Arcade.StaticGroup
  private poolCenterX: number
  private poolCenterY: number
  private shoreLeft: number
  private shoreRight: number
  private standY: number
  private frozen: boolean
  private onStreamHurt?: () => void
  private onTsunamiPush?: (dir: number) => void
  private onPortalReady?: () => void
  private portal: Phaser.GameObjects.Image | null = null
  private fxGfx: Phaser.GameObjects.Graphics
  private dripAcc = 0
  private gatherT = 0
  private gathering = false
  private gone = false

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private player: Phaser.Physics.Arcade.Sprite,
    worldWidth: number,
    opts: StillFightOpts,
  ) {
    this.worldWidth = worldWidth
    this.reducedMotion = opts.reducedMotion
    this.speak = opts.speak
    this.platforms = opts.platforms
    this.poolCenterX = opts.poolCenterX
    this.poolCenterY = opts.poolCenterY
    this.frozen = opts.frozen === true
    this.onStreamHurt = opts.onStreamHurt
    this.onTsunamiPush = opts.onTsunamiPush
    this.onPortalReady = opts.onPortalReady
    const rail = opts.shoreRail ?? this.measureShoreRail(x, y)
    this.shoreLeft = rail.left
    this.shoreRight = Math.max(rail.left + 120, rail.right)
    this.standY = rail.standY
    this.fxGfx = scene.add.graphics().setDepth(11)
    const spots = (opts.cakeSpots ?? []).slice(0, 2)
    if (spots.length === 0) {
      spots.push(...this.findAirborneCakeSpots().slice(0, 2))
    }
    while (spots.length < 2 && spots.length > 0) {
      spots.push({ ...spots[0] })
    }
    this.cakeSlots = spots.map((spot, index) => ({
      spot,
      cake: null,
      cd: 0.25 + index * 0.35,
    }))
    const spawnX = Phaser.Math.Clamp(x, this.shoreLeft + 60, this.shoreRight - 60)
    this.spawnBody(spawnX, this.standY, "full")
    this.say("rise")
  }

  get primarySprite(): Phaser.Physics.Arcade.Sprite | null {
    return this.bodies[0]?.sprite ?? null
  }

  get aspectCount(): number {
    return this.aspects.length
  }

  cakePos(): { x: number; y: number } | null {
    for (const slot of this.cakeSlots) {
      if (slot.cake && slot.cake.active) {
        return { x: slot.cake.x, y: slot.cake.y }
      }
    }
    return null
  }

  portalPos(): { x: number; y: number } | null {
    if (!this.portal || !this.portal.active) {
      return null
    }
    return { x: this.portal.x, y: this.portal.y }
  }

  setFrozen(value: boolean): void {
    this.frozen = value
    for (const row of this.bodies) {
      row.sprite.setVelocity(0, 0)
      const body = row.sprite.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      body.setGravity(0, 0)
    }
  }

  movePrimary(x: number, _y: number): void {
    const row = this.bodies[0]
    if (!row) {
      return
    }
    row.sprite.setPosition(
      Phaser.Math.Clamp(x, this.shoreLeft + 60, this.shoreRight - 60),
      this.standY,
    )
    ;(row.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
  }

  destroy(): void {
    if (this.gone) {
      return
    }
    this.gone = true
    for (const row of this.bodies) {
      row.sprite.destroy()
    }
    this.bodies = []
    for (const mote of this.aspects) {
      mote.sprite.destroy()
    }
    this.aspects = []
    this.streams = []
    for (const wave of this.tsunamis) {
      wave.rect.destroy()
    }
    this.tsunamis = []
    for (const slot of this.cakeSlots) {
      slot.cake?.destroy()
      slot.cake = null
    }
    this.portal?.destroy()
    this.portal = null
    this.fxGfx.destroy()
  }

  update(dt: number): void {
    if (this.gone || this.settled) {
      return
    }
    this.warmth = Math.max(0, this.warmth - dt)
    this.hitCd = Math.max(0, this.hitCd - dt)
    this.dripAcc += dt
    if (this.warmth <= 0) {
      this.player.clearTint()
    } else {
      this.player.setTint(0xffe8b0)
    }
    this.tickCakes(dt)
    this.tickStreams(dt)
    this.tickTsunamis(dt)
    this.tickAspects(dt)
    this.drawFx()
    if (this.frozen) {
      for (const row of this.bodies) {
        row.sprite.setVelocity(0, 0)
        this.pinToRail(row, 0)
      }
      return
    }
    if (this.gathering) {
      this.tickGather(dt)
      return
    }
    for (const row of this.bodies) {
      this.tickBody(row, dt)
    }
  }

  tryEatCake(): void {
    if (this.settled || this.gathering) {
      return
    }
    for (const slot of this.cakeSlots) {
      if (!slot.cake || !slot.cake.active) {
        continue
      }
      if (Math.abs(this.player.x - slot.cake.x) > 40 || Math.abs(this.player.y - slot.cake.y) > 56) {
        continue
      }
      slot.cake.destroy()
      slot.cake = null
      slot.cd = 1.4
      this.warmth = STILL_WARMTH
      getAudio().playSfx("pickup")
      return
    }
  }

  tryDashHit(dashTime: number): "hit" | "hurt" | "none" {
    if (this.settled || this.gathering || this.hitCd > 0 || this.bodies.length === 0) {
      return "none"
    }
    const near = this.bodies.filter((row) => this.nearBody(row, dashTime > 0))
    if (near.length === 0) {
      return "none"
    }
    if (dashTime <= 0 || this.warmth <= 0) {
      return "none"
    }
    let any = false
    for (const row of [...near]) {
      if (!this.bodies.includes(row)) {
        continue
      }
      this.splitOrKill(row)
      any = true
    }
    if (!any) {
      return "none"
    }
    this.hitCd = 0.18
    getAudio().playSfx("hurt")
    return "hit"
  }

  takeContactHurt(dashTime: number): boolean {
    if (this.settled || this.gathering || this.frozen || this.hitCd > 0) {
      return false
    }
    if (dashTime > 0 && this.warmth > 0) {
      return false
    }
    for (const row of this.bodies) {
      if (row.size !== "eighth") {
        continue
      }
      if (!this.nearBody(row, false)) {
        continue
      }
      const leaping = Math.abs(Math.sin(row.hopPhase)) > 0.35
      if (!leaping) {
        continue
      }
      this.hitCd = 0.75
      return true
    }
    return false
  }

  tryTouchPortal(): boolean {
    if (!this.portalReady || !this.portal || !this.portal.active) {
      return false
    }
    return (
      Math.abs(this.player.x - this.portal.x) < 56 &&
      Math.abs(this.player.y - this.portal.y) < 72
    )
  }

  private nearBody(row: BodyRow, dash: boolean): boolean {
    const pad = dash ? 18 : 8
    const look = SIZE_LOOK[row.size]
    return (
      Math.abs(this.player.x - row.sprite.x) < look.w * 0.42 + pad &&
      Math.abs(this.player.y - row.sprite.y) < look.h * 0.42 + pad
    )
  }

  private railPad(size: StillSize): number {
    return SIZE_LOOK[size].w * 0.34
  }

  private pinToRail(row: BodyRow, bob: number): void {
    const pad = this.railPad(row.size)
    const left = this.shoreLeft + pad
    const right = Math.max(left + 8, this.shoreRight - pad)
    row.sprite.x = Phaser.Math.Clamp(row.sprite.x, left, right)
    row.sprite.y = this.standY + bob
    const body = row.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setVelocity(0, 0)
    body.updateFromGameObject()
  }

  private spawnBody(x: number, _y: number, size: StillSize): BodyRow {
    const look = SIZE_LOOK[size]
    const key = this.scene.textures.exists(look.key) ? look.key : "story_still"
    const pad = this.railPad(size)
    const spawnX = Phaser.Math.Clamp(x, this.shoreLeft + pad, this.shoreRight - pad)
    const sprite = this.scene.physics.add.sprite(spawnX, this.standY, key)
    sprite.setDisplaySize(look.w, look.h)
    sprite.setData("archetype", "still_boss")
    sprite.setData("stillSize", size)
    sprite.setDepth(6)
    sprite.setImmovable(true)
    const body = sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setGravity(0, 0)
    body.setCollideWorldBounds(false)
    body.setBounce(0, 0)
    body.setDrag(0, 0)
    body.setVelocity(0, 0)
    body.setSize(sprite.frame.width * 0.75, sprite.frame.height * 0.55)
    body.setOffset(sprite.frame.width * 0.125, sprite.frame.height * 0.4)
    body.updateFromGameObject()
    const row: BodyRow = {
      sprite,
      size,
      dir: Math.random() < 0.5 ? -1 : 1,
      patrolCd: 0.5 + Math.random() * 0.8,
      abilityCd: size === "eighth" ? 99 : 1.4 + Math.random(),
      windup: 0,
      windupKind: "none",
      hopCd: 0.25 + Math.random() * 0.4,
      hopPhase: Math.random() * Math.PI * 2,
      hitFlash: 0,
    }
    this.bodies.push(row)
    this.pinToRail(row, 0)
    return row
  }

  private removeBody(row: BodyRow): void {
    const index = this.bodies.indexOf(row)
    if (index >= 0) {
      this.bodies.splice(index, 1)
    }
    row.sprite.destroy()
  }

  private splitOrKill(row: BodyRow): void {
    if (this.warmth <= 0) {
      return
    }
    const x = row.sprite.x
    const y = row.sprite.y
    this.burstAt(x, y, row.size)
    row.sprite.setTint(0xffffff)
    if (row.size === "full") {
      this.removeBody(row)
      this.hearts = Math.max(0, this.hearts - 1)
      for (const gap of [-70, -24, 24, 70]) {
        this.spawnBody(x + gap, y, "quarter")
      }
      this.say("split")
      return
    }
    if (row.size === "quarter") {
      this.removeBody(row)
      this.hearts = Math.max(0, this.hearts - 1)
      this.spawnBody(x - 28, y, "eighth")
      this.spawnBody(x + 28, y, "eighth")
      return
    }
    this.removeBody(row)
    this.hearts = Math.max(0, this.hearts - 1)
    this.spawnAspect(x, y)
    if (this.aspects.length >= STILL_ASPECTS && !this.gathering) {
      this.beginGather()
    }
  }

  private spawnAspect(x: number, y: number): void {
    const key = this.scene.textures.exists("story_still_aspect") ? "story_still_aspect" : "story_still"
    const sprite = this.scene.add.image(x, y, key)
    sprite.setDisplaySize(28, 28)
    sprite.setDepth(5)
    sprite.setAlpha(0.92)
    this.aspects.push({
      sprite,
      tx: this.poolCenterX + (Math.random() - 0.5) * 120,
      ty: Math.min(y, this.poolCenterY - 40),
      gather: false,
    })
    if (this.aspects.length === 1) {
      this.say("aspects")
    }
  }

  private beginGather(): void {
    this.gathering = true
    this.gatherT = 0
    for (const mote of this.aspects) {
      mote.gather = true
      mote.tx = this.poolCenterX
      mote.ty = this.poolCenterY - 24
    }
    for (const row of [...this.bodies]) {
      this.removeBody(row)
    }
    this.say("portal")
  }

  private tickGather(dt: number): void {
    this.gatherT += dt
    let allIn = true
    for (const mote of this.aspects) {
      const dx = mote.tx - mote.sprite.x
      const dy = mote.ty - mote.sprite.y
      const dist = Math.hypot(dx, dy)
      if (dist > 6) {
        allIn = false
        const step = Math.min(dist, 220 * dt)
        mote.sprite.x += (dx / dist) * step
        mote.sprite.y += (dy / dist) * step
      }
    }
    if ((allIn || this.gatherT > 2.4) && !this.portalReady) {
      this.openPortal()
    }
  }

  private openPortal(): void {
    for (const mote of this.aspects) {
      mote.sprite.destroy()
    }
    this.aspects = []
    const key = this.scene.textures.exists("story_still_portal") ? "story_still_portal" : "story_pool"
    this.portal = this.scene.add.image(this.poolCenterX, this.poolCenterY - 20, key)
    this.portal.setDisplaySize(96, 72)
    this.portal.setDepth(4)
    this.portal.setTint(0xc8e8ff)
    this.portalReady = true
    this.gathering = false
    this.hearts = 0
    this.onPortalReady?.()
    getAudio().playSfx("confirm")
  }

  private tickBody(row: BodyRow, dt: number): void {
    row.hitFlash = Math.max(0, row.hitFlash - dt)
    row.patrolCd = Math.max(0, row.patrolCd - dt)
    row.abilityCd = Math.max(0, row.abilityCd - dt)
    row.hopCd = Math.max(0, row.hopCd - dt)
    const look = SIZE_LOOK[row.size]
    const pad = this.railPad(row.size)
    const left = this.shoreLeft + pad
    const right = Math.max(left + 8, this.shoreRight - pad)

    if (row.windup > 0) {
      row.windup = Math.max(0, row.windup - dt)
      row.sprite.setTint(0xa8d0f0)
      this.pinToRail(row, 0)
      if (row.windup <= 0) {
        row.sprite.clearTint()
        if (row.windupKind === "stream") {
          this.castStream(row)
        } else if (row.windupKind === "tsunami") {
          this.castTsunami(row)
        }
        row.windupKind = "none"
        row.abilityCd = row.size === "full" ? 3.4 : 2.6
      }
      return
    }

    if (row.size === "eighth") {
      row.hopPhase += dt * 9
      if (row.hopCd <= 0) {
        const toward = this.player.x >= row.sprite.x ? 1 : -1
        const nextX = row.sprite.x + toward * 28
        row.dir = nextX < left || nextX > right ? -toward : toward
        row.hopCd = 0.4 + Math.random() * 0.3
        this.splashAt(row.sprite.x, this.standY + look.h * 0.2)
      }
      row.sprite.x += row.dir * look.speed * dt
      const bob = Math.abs(Math.sin(row.hopPhase)) * 18
      this.pinToRail(row, -bob)
      return
    }

    if (row.patrolCd <= 0) {
      row.dir *= -1
      row.patrolCd = 1.6 + Math.random() * 1.4
      this.splashAt(row.sprite.x, this.standY + look.h * 0.2)
    }
    const ahead = row.sprite.x + row.dir * (look.w * 0.3 + 10)
    if (ahead < left || ahead > right) {
      row.dir *= -1
      row.patrolCd = 0.8 + Math.random() * 0.5
    }
    row.sprite.x += row.dir * look.speed * dt
    this.pinToRail(row, 0)

    if (row.abilityCd <= 0 && row.windup <= 0) {
      if (row.size === "full" && Math.random() < 0.42) {
        row.windupKind = "tsunami"
        row.windup = 0.85
      } else {
        row.windupKind = "stream"
        row.windup = 0.55
      }
    }
    if (this.dripAcc > 0.12) {
      this.dripAcc = 0
      if (!this.reducedMotion && Math.random() < 0.35) {
        this.dripAt(row.sprite.x, this.standY + look.h * 0.15)
      }
    }
  }

  private castStream(row: BodyRow): void {
    const aim = this.player.x - row.sprite.x
    const dir = Math.sign(aim) || row.dir
    row.dir = dir
    const length = row.size === "full" ? 360 : 260
    this.streams.push({
      owner: row,
      life: 1.7,
      tick: 0,
      dir,
      length,
      age: 0,
      originX: row.sprite.x,
      originY: row.sprite.y - 10,
    })
    this.splashAt(row.sprite.x + dir * 24, row.sprite.y)
  }

  private castTsunami(row: BodyRow): void {
    const y = row.sprite.y + 20
    for (const dir of [-1, 1] as const) {
      const rect = this.scene.add.rectangle(row.sprite.x, y, 96, 72, 0x5a90b0, 0.35)
      rect.setDepth(5)
      this.scene.physics.add.existing(rect, false)
      const body = rect.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      body.setVelocity(dir * 420, 0)
      this.tsunamis.push({ rect, vx: dir * 420, life: 2.4 })
    }
    this.splashAt(row.sprite.x, row.sprite.y)
  }

  private streamBounds(stream: StreamVol): { left: number; right: number; top: number; bottom: number } {
    const ox = stream.originX
    const oy = stream.originY
    const tip = ox + stream.dir * stream.length
    const left = Math.min(ox, tip)
    const right = Math.max(ox, tip)
    const half = 28
    return { left, right, top: oy - half, bottom: oy + half }
  }

  private tickStreams(dt: number): void {
    for (let i = this.streams.length - 1; i >= 0; i -= 1) {
      const stream = this.streams[i]
      stream.life -= dt
      stream.tick -= dt
      stream.age += dt
      if (stream.owner.sprite.active) {
        stream.originX = stream.owner.sprite.x
        stream.originY = stream.owner.sprite.y - 10
      }
      const bounds = this.streamBounds(stream)
      if (
        this.player.x > bounds.left &&
        this.player.x < bounds.right &&
        this.player.y > bounds.top - 8 &&
        this.player.y < bounds.bottom + 8
      ) {
        if (stream.tick <= 0) {
          stream.tick = 0.28
          this.onStreamHurt?.()
        }
      }
      if (stream.life <= 0) {
        this.streams.splice(i, 1)
      }
    }
  }

  private tickTsunamis(dt: number): void {
    for (let i = this.tsunamis.length - 1; i >= 0; i -= 1) {
      const wave = this.tsunamis[i]
      wave.life -= dt
      wave.rect.x += wave.vx * dt
      const body = wave.rect.body as Phaser.Physics.Arcade.Body | null
      body?.updateFromGameObject()
      const bounds = wave.rect.getBounds()
      if (
        this.player.x > bounds.left &&
        this.player.x < bounds.right &&
        this.player.y > bounds.top &&
        this.player.y < bounds.bottom
      ) {
        this.onTsunamiPush?.(Math.sign(wave.vx) || 1)
      }
      if (wave.life <= 0 || wave.rect.x < -80 || wave.rect.x > this.worldWidth + 80) {
        wave.rect.destroy()
        this.tsunamis.splice(i, 1)
      }
    }
  }

  private tickAspects(dt: number): void {
    if (this.gathering) {
      return
    }
    for (const mote of this.aspects) {
      const dx = mote.tx - mote.sprite.x
      const dy = mote.ty - mote.sprite.y
      const dist = Math.hypot(dx, dy)
      if (dist > 4) {
        const step = Math.min(dist, 36 * dt)
        mote.sprite.x += (dx / dist) * step
        mote.sprite.y += (dy / dist) * step
      } else {
        mote.sprite.y += Math.sin(this.scene.time.now / 420 + mote.sprite.x) * 0.15
      }
    }
  }

  private tickCakes(dt: number): void {
    if (this.settled || this.gathering || this.portalReady) {
      return
    }
    for (const slot of this.cakeSlots) {
      slot.cd = Math.max(0, slot.cd - dt)
      if (slot.cake && slot.cake.active) {
        slot.cake.y = slot.spot.y + Math.sin(this.scene.time.now / 260) * 4
        continue
      }
      if (slot.cd > 0) {
        continue
      }
      slot.cake = this.scene.physics.add.image(slot.spot.x, slot.spot.y, "story_mooncake")
      slot.cake.setDisplaySize(28, 28)
      slot.cake.setDepth(4)
      ;(slot.cake.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    }
  }

  private measureShoreRail(hintX: number, hintY: number): StillShoreRail {
    type Seg = { left: number; right: number; top: number; w: number }
    const segs: Seg[] = []
    for (const child of this.platforms.getChildren()) {
      const body = (child as Phaser.GameObjects.GameObject).body as Phaser.Physics.Arcade.StaticBody | undefined
      if (!body || body.width < 200) {
        continue
      }
      segs.push({
        left: body.x,
        right: body.x + body.width,
        top: body.y,
        w: body.width,
      })
    }
    if (segs.length === 0) {
      return {
        left: Math.max(80, hintX - 400),
        right: Math.min(this.worldWidth - 80, hintX + 400),
        standY: hintY,
      }
    }
    segs.sort((a, b) => a.top - b.top || b.w - a.w)
    const bandTop = segs[0].top
    const band = segs.filter((seg) => Math.abs(seg.top - bandTop) <= 28)
    band.sort((a, b) => a.left - b.left)
    let left = band[0].left
    let right = band[0].right
    for (const seg of band.slice(1)) {
      if (seg.left <= right + 40) {
        right = Math.max(right, seg.right)
        left = Math.min(left, seg.left)
      }
    }
    const look = SIZE_LOOK.full
    return {
      left,
      right,
      standY: bandTop - look.h * 0.28,
    }
  }

  private findAirborneCakeSpots(): HanCakeSpot[] {
    const pads: { x: number; y: number; top: number }[] = []
    const shoreTop = this.standY + SIZE_LOOK.full.h * 0.5
    for (const child of this.platforms.getChildren()) {
      const body = (child as Phaser.GameObjects.GameObject).body as Phaser.Physics.Arcade.StaticBody | undefined
      if (!body) {
        continue
      }
      if (body.width < 48 || body.width > 220 || body.height > 36) {
        continue
      }
      if (body.y > shoreTop - 160) {
        continue
      }
      pads.push({ x: body.x + body.width * 0.5, y: body.y - 18, top: body.y })
    }
    if (pads.length === 0) {
      return [
        { x: this.shoreLeft + 120, y: this.standY - 200 },
        { x: this.shoreRight - 120, y: this.standY - 200 },
      ]
    }
    const highTop = Math.min(...pads.map((pad) => pad.top))
    const high = pads.filter((pad) => pad.top <= highTop + 48).sort((a, b) => a.x - b.x)
    if (high.length >= 2) {
      return [
        { x: high[0].x, y: high[0].y },
        { x: high[high.length - 1].x, y: high[high.length - 1].y },
      ]
    }
    pads.sort((a, b) => a.x - b.x)
    return [pads[0], pads[pads.length - 1] ?? pads[0]]
  }

  private burstAt(x: number, y: number, size: StillSize): void {
    if (this.reducedMotion) {
      return
    }
    const n = size === "full" ? 10 : size === "quarter" ? 6 : 4
    for (let i = 0; i < n; i += 1) {
      const drop = this.scene.add.ellipse(
        x + (Math.random() - 0.5) * 40,
        y + (Math.random() - 0.5) * 20,
        6 + Math.random() * 6,
        4 + Math.random() * 4,
        0xb8d8ec,
        0.8,
      )
      drop.setDepth(8)
      this.scene.tweens.add({
        targets: drop,
        y: y + 40 + Math.random() * 30,
        alpha: 0,
        duration: 320 + Math.random() * 200,
        onComplete: () => drop.destroy(),
      })
    }
  }

  private splashAt(x: number, y: number): void {
    if (this.reducedMotion) {
      return
    }
    const ring = this.scene.add.ellipse(x, y, 28, 10, 0xd0e8f4, 0.5)
    ring.setDepth(7)
    this.scene.tweens.add({
      targets: ring,
      scaleX: 1.8,
      scaleY: 1.4,
      alpha: 0,
      duration: 280,
      onComplete: () => ring.destroy(),
    })
  }

  private dripAt(x: number, y: number): void {
    const drop = this.scene.add.ellipse(x + (Math.random() - 0.5) * 24, y, 5, 7, 0xa8c8dc, 0.7)
    drop.setDepth(7)
    this.scene.tweens.add({
      targets: drop,
      y: y + 28,
      alpha: 0,
      duration: 380,
      onComplete: () => drop.destroy(),
    })
  }

  private drawFx(): void {
    this.fxGfx.clear()
    this.drawStreamsFx()
    if (this.portalReady && this.portal) {
      const pulse = 0.45 + Math.sin(this.scene.time.now / 280) * 0.2
      this.fxGfx.fillStyle(0xc8e8ff, pulse)
      this.fxGfx.fillCircle(this.portal.x, this.portal.y, 40 + Math.sin(this.scene.time.now / 200) * 6)
    }
  }

  private drawStreamsFx(): void {
    if (this.streams.length === 0) {
      return
    }
    const t = this.scene.time.now / 1000
    for (const stream of this.streams) {
      const fade = Phaser.Math.Clamp(stream.life / 0.35, 0, 1)
      const grow = Phaser.Math.Clamp(stream.age / 0.22, 0, 1)
      const len = stream.length * grow
      const ox = stream.originX
      const oy = stream.originY
      const dir = stream.dir
      const steps = 18
      for (let i = 0; i < steps; i += 1) {
        const u = (i + 0.5) / steps
        const along = u * len
        const swirl = Math.sin(t * 9 + u * 14 + stream.age * 6) * (10 + u * 16)
        const widen = 6 + u * 22 + Math.sin(t * 7 + i) * 3
        const x = ox + dir * along
        const y = oy + swirl * 0.55
        const a = (0.55 - u * 0.25) * fade
        this.fxGfx.fillStyle(0x6eb4d4, a * 0.55)
        this.fxGfx.fillEllipse(x, y, widen * 1.6, widen * 0.7)
        this.fxGfx.fillStyle(0xb8e4f4, a * 0.7)
        this.fxGfx.fillEllipse(x + dir * 2, y - widen * 0.15, widen * 0.9, widen * 0.4)
      }
      for (let k = 0; k < 7; k += 1) {
        const u = ((t * 1.4 + k * 0.14 + stream.age * 0.5) % 1) * grow
        const along = u * len
        const spiral = Math.sin(t * 12 + k * 1.7 + u * 18) * (8 + u * 18)
        const x = ox + dir * along
        const y = oy + spiral
        const r = 3 + (1 - u) * 4
        this.fxGfx.fillStyle(0xe8f8ff, 0.55 * fade)
        this.fxGfx.fillCircle(x, y, r)
        this.fxGfx.fillStyle(0x4a90b0, 0.35 * fade)
        this.fxGfx.fillCircle(x - dir * 3, y + 2, r * 0.55)
      }
      const tipX = ox + dir * len
      const tipPulse = 14 + Math.sin(t * 14) * 4
      this.fxGfx.fillStyle(0xa8d8ec, 0.4 * fade)
      this.fxGfx.fillCircle(tipX, oy, tipPulse)
      this.fxGfx.lineStyle(2, 0xd8f0fa, 0.55 * fade)
      this.fxGfx.strokeCircle(tipX, oy, tipPulse * 0.7)
      this.fxGfx.strokeCircle(tipX, oy, tipPulse * 1.15)
    }
  }

  private say(line: StillLine): void {
    if (this.spoken.has(line)) {
      return
    }
    this.spoken.add(line)
    this.speak?.(line)
  }
}
