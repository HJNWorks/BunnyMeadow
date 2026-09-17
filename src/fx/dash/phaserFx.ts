import Phaser from "phaser"
import type { DashDef } from "./types"

type Speck = {
  sprite: Phaser.GameObjects.Image
  vx: number
  vy: number
  life: number
  maxLife: number
}

function ensureDashTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("dash_speck")) {
    const g = scene.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xffffff, 1)
    g.fillCircle(4, 4, 4)
    g.generateTexture("dash_speck", 8, 8)
    g.destroy()
  }
  if (!scene.textures.exists("dash_carrot")) {
    const g = scene.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xf0a04a, 1)
    g.fillEllipse(5, 8, 6, 14)
    g.fillStyle(0x6a9a4a, 1)
    g.fillRect(3, 0, 4, 4)
    g.generateTexture("dash_carrot", 10, 16)
    g.destroy()
  }
  if (!scene.textures.exists("dash_streak")) {
    const g = scene.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xffffff, 1)
    g.fillRoundedRect(0, 3, 18, 4, 2)
    g.generateTexture("dash_streak", 18, 10)
    g.destroy()
  }
  if (!scene.textures.exists("dash_crescent")) {
    const g = scene.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xf7fbff, 1)
    g.fillCircle(8, 8, 7)
    g.fillStyle(0x151b2e, 1)
    g.fillCircle(5, 8, 6)
    g.generateTexture("dash_crescent", 16, 16)
    g.destroy()
  }
}

function textureForShape(shape: DashDef["particle"]["shape"]): string {
  if (shape === "carrot") {
    return "dash_carrot"
  }
  if (shape === "streak") {
    return "dash_streak"
  }
  if (shape === "crescent") {
    return "dash_crescent"
  }
  return "dash_speck"
}

function hexToNum(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16) || 0xffffff
}

export class PhaserDashFx {
  private specks: Speck[] = []
  private ghosts: Phaser.GameObjects.Image[] = []
  private wasDashing = false
  private baseW = 48
  private baseH = 56

  constructor(
    private readonly scene: Phaser.Scene,
    private def: DashDef,
    private reducedMotion: boolean,
  ) {
    ensureDashTextures(scene)
  }

  setDef(def: DashDef): void {
    this.def = def
  }

  tick(player: Phaser.Physics.Arcade.Sprite, dashTime: number, facing: number, dt: number): void {
    const dashing = dashTime > 0
    if (dashing && !this.wasDashing) {
      this.baseW = player.displayWidth
      this.baseH = player.displayHeight
      this.burst(player, facing)
    }
    if (dashing) {
      const stretch = this.reducedMotion ? 1.05 : this.def.stretchX
      player.setDisplaySize(this.baseW * stretch, this.baseH)
      this.trail(player, facing, dt)
    } else if (this.wasDashing) {
      player.setDisplaySize(this.baseW, this.baseH)
      this.clearGhosts()
    }
    this.step(dt)
    this.wasDashing = dashing
  }

  destroy(): void {
    for (const speck of this.specks) {
      speck.sprite.destroy()
    }
    this.specks = []
    this.clearGhosts()
  }

  private burst(player: Phaser.Physics.Arcade.Sprite, facing: number): void {
    if (this.reducedMotion) {
      return
    }
    const tex = textureForShape(this.def.particle.shape)
    const tint = hexToNum(this.def.particle.color)
    for (let i = 0; i < this.def.particle.count; i += 1) {
      const sprite = this.scene.add.image(
        player.x - facing * 12,
        player.y + (Math.random() - 0.5) * 18,
        tex,
      )
      sprite.setDepth(4)
      sprite.setTint(tint)
      sprite.setAlpha(0.85)
      const life = this.def.particle.life * (0.7 + Math.random() * 0.4)
      this.specks.push({
        sprite,
        vx: -facing * (50 + Math.random() * this.def.particle.spread * 4),
        vy: (Math.random() - 0.5) * 70,
        life,
        maxLife: life,
      })
    }
    const ghosts = this.def.afterimages
    for (let i = 0; i < ghosts; i += 1) {
      const ghost = this.scene.add.image(player.x, player.y, player.texture.key)
      ghost.setDisplaySize(player.displayWidth, player.displayHeight)
      ghost.setAlpha(0.28 - i * 0.07)
      ghost.setTint(hexToNum(this.def.tint))
      ghost.setDepth(4)
      this.ghosts.push(ghost)
    }
  }

  private trail(player: Phaser.Physics.Arcade.Sprite, facing: number, dt: number): void {
    for (let i = 0; i < this.ghosts.length; i += 1) {
      const ghost = this.ghosts[i]
      if (!ghost) {
        continue
      }
      const lag = 0.18 + i * 0.12
      ghost.x += (player.x - facing * 16 * (i + 1) - ghost.x) * Math.min(1, dt / lag)
      ghost.y += (player.y - ghost.y) * Math.min(1, dt / lag)
      ghost.setAlpha(Math.max(0.08, ghost.alpha - dt * 0.4))
    }
  }

  private step(dt: number): void {
    const live: Speck[] = []
    for (const speck of this.specks) {
      speck.life -= dt
      speck.sprite.x += speck.vx * dt
      speck.sprite.y += speck.vy * dt
      speck.sprite.setAlpha(Math.max(0, speck.life / speck.maxLife))
      if (speck.life > 0) {
        live.push(speck)
      } else {
        speck.sprite.destroy()
      }
    }
    this.specks = live
  }

  private clearGhosts(): void {
    for (const ghost of this.ghosts) {
      ghost.destroy()
    }
    this.ghosts = []
  }
}
