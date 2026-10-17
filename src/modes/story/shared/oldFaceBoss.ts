import Phaser from "phaser"

/**
 * The pool seal's old face. One body, two poses. Mei cannot hurt it.
 * Standing still on an unused rim lip lifts one quarter of the false stamp.
 */

export type OldFaceLine = "wake" | "mask" | "settled" | "refused"

export type OldFaceOpts = {
  lips: { x: number; y: number }[]
  platforms: Phaser.Physics.Arcade.StaticGroup
  speak?: (line: OldFaceLine) => void
}

const PLANT = 0.8
const STILL_X = 30
const LIP_X = 70
const LIP_Y = 48

type Lip = {
  x: number
  y: number
  open: boolean
  mark: Phaser.GameObjects.Ellipse
}

export class OldFaceFight {
  readonly needed: number
  settled = false
  private lips: Lip[] = []
  private seal: Phaser.GameObjects.Image
  private face: Phaser.GameObjects.Ellipse
  private wisps: Phaser.GameObjects.Ellipse[] = []
  emerged = false
  private boarded = false
  private pads: Phaser.Physics.Arcade.StaticGroup
  private plant = 0
  private hurtCd = 0
  private linger = 0
  private lunge = 0
  private lungeX = 0
  private lungeY = 0
  private maskSpoken = false
  private clock = 0
  private faceX: number
  private faceY: number
  private speak?: (line: OldFaceLine) => void

  constructor(
    scene: Phaser.Scene,
    private cx: number,
    private cy: number,
    private player: Phaser.Physics.Arcade.Sprite,
    opts: OldFaceOpts,
  ) {
    const key = scene.textures.exists("story_seal") ? "story_seal" : "story_bunny"
    this.seal = scene.add.image(cx, cy + 48, key).setDisplaySize(132, 62).setDepth(1.6).setAlpha(0.9)
    this.face = scene.add.ellipse(cx, cy, 72, 30, 0x2a3a34, 0.9).setDepth(3.2).setVisible(false)
    this.faceX = cx
    this.faceY = cy
    this.speak = opts.speak
    for (let i = 0; i < 3; i += 1) {
      this.wisps.push(scene.add.ellipse(cx, cy, 18, 18, 0xf4f7f2, 0.85).setDepth(3.4))
    }
    for (const spot of opts.lips) {
      const mark = scene.add.ellipse(spot.x, spot.y - 18, 36, 14, 0x1f6b52, 0.85).setDepth(2.2)
      this.lips.push({ x: spot.x, y: spot.y, open: true, mark })
    }
    this.snapLips(opts.platforms)
    this.centerBetweenRisePads()
    this.pads = opts.platforms
    this.needed = this.lips.length
    this.speak = opts.speak
    this.speak?.("wake")
  }

  get hearts(): number {
    return this.lips.filter((lip) => lip.open).length
  }

  update(dt: number): void {
    if (this.boarded) {
      return
    }
    this.clock += dt
    this.hurtCd = Math.max(0, this.hurtCd - dt)
    this.linger = Math.max(0, this.linger - dt)
    const lifted = this.needed - this.hearts
    this.tickWisps(lifted)
    this.tickFace(dt, lifted)
    if (!this.settled) {
      this.tickPlant(dt, lifted)
    }
  }

  /** A wisp or a lunge. A dash passes through. The plant window itself does not hit. */
  takeHurt(dashTime: number): boolean {
    if (this.settled || this.hurtCd > 0 || dashTime > 0 || this.plant > 0) {
      return false
    }
    const lifted = this.needed - this.hearts
    if (lifted < 2) {
      for (const wisp of this.wisps) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, wisp.x, wisp.y) < 28) {
          this.hurtCd = 0.85
          return true
        }
      }
      return false
    }
    if (this.linger > 0) {
      return false
    }
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.face.x, this.face.y) < 42 && this.face.visible) {
      this.hurtCd = 0.85
      return true
    }
    return false
  }

  destroy(): void {
    this.seal.destroy()
    this.face.destroy()
    for (const wisp of this.wisps) {
      wisp.destroy()
    }
    for (const lip of this.lips) {
      lip.mark.destroy()
    }
  }

  private tickWisps(lifted: number): void {
    const show = lifted < 2 && !this.settled
    for (let i = 0; i < this.wisps.length; i += 1) {
      const wisp = this.wisps[i]
      wisp.setVisible(show)
      if (!show) {
        continue
      }
      const angle = this.clock * 1.3 + (i * Math.PI * 2) / this.wisps.length
      wisp.setPosition(this.cx + Math.cos(angle) * 150, this.cy + Math.sin(angle) * 36)
    }
  }

  private tickFace(dt: number, lifted: number): void {
    if (this.settled) {
      return
    }
    const show = lifted >= 2
    this.face.setVisible(show)
    if (!show) {
      return
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const held = this.heldClosedLip(body)
    if (this.lunge <= 0) {
      if (held && this.linger <= 0) {
        this.lunge = 0.001
        const side = held.x >= this.cx ? -40 : 40
        this.lungeX = held.x + side
        this.lungeY = held.y - 30
      } else {
        this.faceX = Phaser.Math.Linear(this.faceX, this.cx + Math.sin(this.clock) * 80, Math.min(1, dt * 2))
        this.faceY = this.cy
      }
    } else {
      this.lunge += dt
      const out = 0.42
      const hold = 0.28
      const back = 0.42
      if (this.lunge < out) {
        const u = this.lunge / out
        this.faceX = Phaser.Math.Linear(this.cx, this.lungeX, u)
        this.faceY = Phaser.Math.Linear(this.cy, this.lungeY, u)
      } else if (this.lunge < out + hold) {
        this.faceX = this.lungeX
        this.faceY = this.lungeY
      } else if (this.lunge < out + hold + back) {
        const u = (this.lunge - out - hold) / back
        this.faceX = Phaser.Math.Linear(this.lungeX, this.cx, u)
        this.faceY = Phaser.Math.Linear(this.lungeY, this.cy, u)
      } else {
        this.lunge = 0
        this.faceX = this.cx
        this.faceY = this.cy
      }
    }
    this.face.setPosition(this.faceX, this.faceY)
  }

  /** Put each stamp on the pad it belongs to, at the top center. */
  private snapLips(platforms: Phaser.Physics.Arcade.StaticGroup): void {
    for (const lip of this.lips) {
      let best: { cx: number; top: number; d: number } | null = null
      for (const obj of platforms.getChildren()) {
        const go = obj as Phaser.GameObjects.GameObject
        if (go.getData("rectKind") !== "platform") {
          continue
        }
        const pad = go.body as Phaser.Physics.Arcade.StaticBody | null
        if (!pad) {
          continue
        }
        const cx = (pad.left + pad.right) / 2
        const d = Phaser.Math.Distance.Between(lip.x, lip.y, cx, pad.top)
        if (!best || d < best.d) {
          best = { cx, top: pad.top, d }
        }
      }
      if (!best || best.d > 140) {
        continue
      }
      lip.x = best.cx
      lip.y = best.top + 14
      lip.mark.setPosition(best.cx, best.top - 8)
    }
  }

  private tickPlant(dt: number, lifted: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const still = body.blocked.down && Math.abs(body.velocity.x) < STILL_X
    const lip = still ? this.openLipUnder(body) : null
    if (!lip) {
      this.plant = 0
      return
    }
    this.plant += dt
    lip.mark.setScale(1 + Math.min(this.plant / PLANT, 1) * 0.35)
    if (this.plant < PLANT) {
      return
    }
    this.plant = 0
    lip.open = false
    lip.mark.setAlpha(0.2)
    lip.mark.setScale(1)
    this.linger = 0.45
    const nowLifted = lifted + 1
    if (nowLifted === 2 && !this.maskSpoken) {
      this.maskSpoken = true
      this.speak?.("mask")
    }
    if (nowLifted >= this.needed) {
      this.settle()
    }
  }

  speakRefused(): void {
    this.speak?.("refused")
  }

  get sealImage(): Phaser.GameObjects.Image {
    return this.seal
  }

  /** True once, when Mei is standing on the risen seal. */
  takeLanding(): boolean {
    if (!this.emerged || this.boarded) {
      return false
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const top = this.seal.y - this.seal.displayHeight * 0.45
    const onIt =
      body.blocked.down &&
      Math.abs(this.player.x - this.seal.x) < 70 &&
      Math.abs(body.bottom - top) < 18
    if (!onIt) {
      return false
    }
    this.boarded = true
    return true
  }

  private settle(): void {
    this.settled = true
    for (const wisp of this.wisps) {
      wisp.setVisible(false)
    }
    this.face.setVisible(false)
    this.speak?.("settled")
    this.sceneRef().tweens.add({
      targets: this.seal,
      x: this.cx,
      y: this.riseY(),
      alpha: 1,
      displayWidth: 168,
      displayHeight: 78,
      duration: 900,
      ease: "Sine.easeOut",
      onComplete: () => this.makeLanding(),
    })
  }

  private centerBetweenRisePads(): void {
    if (this.lips.length < 2) {
      return
    }
    const ranked = [...this.lips].sort((a, b) => a.y - b.y)
    const left = ranked[0]
    const right = ranked[1]
    this.cx = (left.x + right.x) / 2
    this.faceX = this.cx
    this.seal.setX(this.cx)
  }

  private riseY(): number {
    if (this.lips.length < 2) {
      return this.cy - 160
    }
    const ranked = [...this.lips].sort((a, b) => a.y - b.y)
    return Math.min(ranked[0].y, ranked[1].y) - 110
  }

  private sceneRef(): Phaser.Scene {
    return this.seal.scene
  }

  private makeLanding(): void {
    this.seal.setDepth(2)
    this.sceneRef().physics.add.existing(this.seal, true)
    const body = this.seal.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(this.seal.width * 0.72, this.seal.height * 0.35)
    body.setOffset(this.seal.width * 0.14, this.seal.height * 0.2)
    this.pads.add(this.seal)
    body.updateFromGameObject()
    this.emerged = true
  }

  private openLipUnder(body: Phaser.Physics.Arcade.Body): Lip | null {
    for (const lip of this.lips) {
      if (!lip.open) {
        continue
      }
      if (Math.abs(this.player.x - lip.x) <= LIP_X && Math.abs(body.bottom - (lip.y - 14)) <= LIP_Y) {
        return lip
      }
    }
    return null
  }

  private heldClosedLip(body: Phaser.Physics.Arcade.Body): Lip | null {
    if (!body.blocked.down) {
      return null
    }
    for (const lip of this.lips) {
      if (lip.open) {
        continue
      }
      if (Math.abs(this.player.x - lip.x) <= LIP_X && Math.abs(body.bottom - (lip.y - 14)) <= LIP_Y) {
        return lip
      }
    }
    return null
  }
}
