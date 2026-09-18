import Phaser from "phaser"
import catalog from "../../../data/breakables.json"
import type { BreakSource, BreakSpec } from "../../../systems/ChunkAssembler"

type BreakProfile = {
  hp: number
  sources: BreakSource[]
  cracks: string
  debris: string
}

type Catalog = {
  profiles: Record<string, BreakProfile>
}

const DATA = catalog as Catalog

type BreakSprite = Phaser.GameObjects.GameObject & {
  x: number
  y: number
  displayWidth: number
  displayHeight: number
  active: boolean
  body?: object | null
  getData: (key: string) => unknown
  setData: (key: string, value: unknown) => unknown
  setVisible: (value: boolean) => unknown
  setTint?: (color: number) => unknown
}

type BreakEntry = {
  sprite: BreakSprite
  hp: number
  maxHp: number
  sources: BreakSource[]
  cracks: string
  crack: Phaser.GameObjects.Image | null
  broken: boolean
}

export function listBreakProfiles(): string[] {
  return Object.keys(DATA.profiles)
}

export function padBreakSpec(
  spec: BreakSpec | undefined,
  opts: { env: string; kind?: string; h: number },
): BreakSpec | undefined {
  if (spec) {
    return spec
  }
  if (opts.env === "moon" && opts.kind !== "wall" && opts.h <= 40) {
    return { profile: "stone" }
  }
  return undefined
}

export function resolveBreak(spec: BreakSpec): BreakProfile {
  const profile = DATA.profiles[spec.profile] ?? DATA.profiles.stone
  if (!profile) {
    return { hp: 5, sources: ["beam"], cracks: "stone", debris: "rubble" }
  }
  return {
    hp: spec.hp ?? profile.hp,
    sources: spec.sources ?? profile.sources,
    cracks: profile.cracks,
    debris: profile.debris,
  }
}

export function crackTextureKey(kind: string, stage: number): string {
  return `break_crack_${kind}_${stage}`
}

export function ensureBreakTextures(scene: Phaser.Scene): void {
  for (const kind of ["stone", "wood", "ice"]) {
    for (const stage of [1, 2, 3]) {
      const key = crackTextureKey(kind, stage)
      if (scene.textures.exists(key)) {
        scene.textures.remove(key)
      }
      const canvas = document.createElement("canvas")
      canvas.width = 64
      canvas.height = 32
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        continue
      }
      drawCrackSheet(ctx, kind, stage)
      scene.textures.addCanvas(key, canvas)
    }
  }
}

function drawCrackSheet(ctx: CanvasRenderingContext2D, kind: string, stage: number): void {
  ctx.clearRect(0, 0, 64, 32)
  if (stage > 1) {
    ctx.fillStyle = kind === "ice" ? "rgba(180, 220, 240, 0.22)" : "rgba(20, 14, 8, 0.28)"
    ctx.fillRect(0, 0, 64, 32)
  }
  if (kind === "wood") {
    ctx.strokeStyle = "#1a0e06"
    ctx.lineWidth = 2.4
    ctx.beginPath()
    ctx.moveTo(4, 16)
    ctx.lineTo(28, 14)
    if (stage > 1) {
      ctx.moveTo(24, 18)
      ctx.lineTo(60, 20)
    }
    ctx.stroke()
    if (stage > 2) {
      ctx.beginPath()
      ctx.moveTo(18, 8)
      ctx.lineTo(22, 24)
      ctx.moveTo(44, 6)
      ctx.lineTo(40, 26)
      ctx.stroke()
    }
    return
  }
  if (kind === "ice") {
    ctx.strokeStyle = "#f4ffff"
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.moveTo(32, 4)
    ctx.lineTo(28, 28)
    if (stage > 1) {
      ctx.moveTo(32, 16)
      ctx.lineTo(12, 22)
      ctx.moveTo(32, 16)
      ctx.lineTo(54, 10)
    }
    ctx.stroke()
    if (stage > 2) {
      ctx.beginPath()
      ctx.moveTo(20, 8)
      ctx.lineTo(48, 26)
      ctx.moveTo(10, 18)
      ctx.lineTo(22, 12)
      ctx.stroke()
    }
    return
  }
  ctx.strokeStyle = "#0a0804"
  ctx.lineWidth = 2.6
  ctx.beginPath()
  ctx.moveTo(6, 10)
  ctx.lineTo(18, 16)
  ctx.lineTo(30, 12)
  if (stage > 1) {
    ctx.lineTo(44, 20)
    ctx.lineTo(58, 14)
  }
  ctx.stroke()
  if (stage > 2) {
    ctx.beginPath()
    ctx.moveTo(22, 6)
    ctx.lineTo(26, 26)
    ctx.moveTo(48, 8)
    ctx.lineTo(40, 28)
    ctx.stroke()
  }
}

export class BreakField {
  private entries: BreakEntry[] = []
  private paused = false

  constructor(
    private scene: Phaser.Scene,
    private reducedMotion: boolean,
  ) {
    ensureBreakTextures(scene)
  }

  pause(): void {
    this.paused = true
  }

  register(sprite: Phaser.GameObjects.GameObject, spec: BreakSpec): void {
    const resolved = resolveBreak(spec)
    const target = sprite as BreakSprite
    sprite.setData("breakSpec", spec)
    this.entries.push({
      sprite: target,
      hp: resolved.hp,
      maxHp: resolved.hp,
      sources: resolved.sources,
      cracks: resolved.cracks,
      crack: null,
      broken: false,
    })
  }

  solids(): BreakSprite[] {
    return this.entries.filter((entry) => !entry.broken).map((entry) => entry.sprite)
  }

  hurt(obj: Phaser.GameObjects.GameObject, dt: number, source: BreakSource): void {
    if (this.paused || dt <= 0) {
      return
    }
    const entry = this.findEntry(obj)
    if (!entry || entry.broken || !entry.sources.includes(source)) {
      return
    }
    this.applyHurt(entry, dt)
  }

  hurtRay(
    ox: number,
    oy: number,
    ux: number,
    uy: number,
    len: number,
    dt: number,
    source: BreakSource,
  ): void {
    if (this.paused || dt <= 0 || len <= 0) {
      return
    }
    const px = -uy
    const py = ux
    for (const entry of this.entries) {
      if (entry.broken || !entry.sources.includes(source)) {
        continue
      }
      if (this.rayHits(entry.sprite, ox, oy, ux, uy, len, px, py)) {
        this.applyHurt(entry, dt)
      }
    }
    this.follow()
  }

  tickStand(player: Phaser.Physics.Arcade.Sprite, dt: number): void {
    if (this.paused) {
      return
    }
    const body = player.body as Phaser.Physics.Arcade.Body | null
    if (!body) {
      return
    }
    const onFloor = body.blocked.down || body.touching.down
    if (!onFloor) {
      this.follow()
      return
    }
    for (const entry of this.entries) {
      if (entry.broken || !entry.sources.includes("stand")) {
        continue
      }
      if (this.standingOn(player, entry.sprite)) {
        this.hurt(entry.sprite, dt, "stand")
      }
    }
    this.follow()
  }

  follow(): void {
    for (const entry of this.entries) {
      if (entry.broken || !entry.crack) {
        continue
      }
      entry.crack.setPosition(entry.sprite.x, entry.sprite.y)
      entry.crack.setDisplaySize(entry.sprite.displayWidth, entry.sprite.displayHeight)
    }
  }

  destroy(): void {
    for (const entry of this.entries) {
      entry.crack?.destroy()
    }
    this.entries = []
  }

  private findEntry(obj: Phaser.GameObjects.GameObject): BreakEntry | undefined {
    const direct = this.entries.find((row) => row.sprite === obj)
    if (direct) {
      return direct
    }
    const spec = obj.getData("breakSpec")
    if (!spec) {
      return undefined
    }
    return this.entries.find((row) => row.sprite.getData("breakSpec") === spec && row.sprite.active)
  }

  private applyHurt(entry: BreakEntry, dt: number): void {
    entry.hp = Math.max(0, entry.hp - dt)
    this.paintCrack(entry)
    if (entry.hp <= 0) {
      this.shatter(entry)
    }
  }

  private rayHits(
    sprite: BreakSprite,
    ox: number,
    oy: number,
    ux: number,
    uy: number,
    len: number,
    px: number,
    py: number,
  ): boolean {
    const left = sprite.x - sprite.displayWidth * 0.5
    const right = sprite.x + sprite.displayWidth * 0.5
    const top = sprite.y - sprite.displayHeight * 0.5
    const bottom = sprite.y + sprite.displayHeight * 0.5
    for (const offset of [-28, 0, 28]) {
      if (rayAabb(ox + px * offset, oy + py * offset, ux, uy, left, right, top, bottom, len + 6) !== null) {
        return true
      }
    }
    return false
  }

  private standingOn(player: Phaser.Physics.Arcade.Sprite, sprite: BreakSprite): boolean {
    const half = sprite.displayWidth * 0.55
    const top = sprite.y - sprite.displayHeight * 0.5
    return Math.abs(player.x - sprite.x) < half && Math.abs(player.y - top) < 44
  }

  private paintCrack(entry: BreakEntry): void {
    if (entry.broken) {
      return
    }
    const lost = 1 - entry.hp / entry.maxHp
    this.stain(entry, lost)
    let stage = lost >= 2 / 3 ? 3 : lost >= 1 / 3 ? 2 : lost > 0 ? 1 : 0
    if (this.reducedMotion && lost > 0) {
      stage = 1
    }
    if (stage <= 0) {
      entry.crack?.setVisible(false)
      return
    }
    const key = crackTextureKey(entry.cracks, this.reducedMotion ? 1 : stage)
    if (!entry.crack) {
      entry.crack = this.scene.add.image(entry.sprite.x, entry.sprite.y, key)
      entry.crack.setDepth(2.35)
    } else if (entry.crack.texture.key !== key) {
      entry.crack.setTexture(key)
    }
    entry.crack.setPosition(entry.sprite.x, entry.sprite.y)
    entry.crack.setDisplaySize(entry.sprite.displayWidth, entry.sprite.displayHeight)
    entry.crack.setVisible(true)
    entry.crack.setAlpha(this.reducedMotion ? 0.7 : 0.92)
  }

  private stain(entry: BreakEntry, lost: number): void {
    if (!entry.sprite.setTint) {
      return
    }
    if (lost <= 0) {
      entry.sprite.setTint(0xffffff)
      return
    }
    const shade = Math.round(255 - lost * 90)
    const cool = Math.round(255 - lost * 130)
    entry.sprite.setTint((shade << 16) | (cool << 8) | cool)
  }

  private shatter(entry: BreakEntry): void {
    entry.broken = true
    entry.sprite.setData("broken", true)
    entry.sprite.setVisible(false)
    const cap = entry.sprite.getData("cap") as Phaser.GameObjects.GameObject | undefined
    if (cap && "setVisible" in cap) {
      ;(cap as Phaser.GameObjects.Image).setVisible(false)
    }
    const body = entry.sprite.body as { enable?: boolean } | null | undefined
    if (body) {
      body.enable = false
    }
    entry.crack?.destroy()
    entry.crack = null
    if (this.reducedMotion) {
      return
    }
    const n = 4
    for (let i = 0; i < n; i += 1) {
      const bit = this.scene.add.rectangle(
        entry.sprite.x + (i - 1.5) * 10,
        entry.sprite.y,
        10 + (i % 2) * 6,
        8,
        0x6a5a40,
        0.9,
      )
      bit.setDepth(3)
      this.scene.physics.add.existing(bit)
      const bitBody = bit.body as Phaser.Physics.Arcade.Body
      bitBody.setVelocity((i - 1.5) * 80, -140 - i * 20)
      bitBody.setAllowGravity(true)
      this.scene.tweens.add({
        targets: bit,
        alpha: 0,
        duration: 700,
        onComplete: () => bit.destroy(),
      })
    }
  }
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
  if (tmin > tmax || tmin > maxLen) {
    return null
  }
  return Math.max(0, tmin)
}
