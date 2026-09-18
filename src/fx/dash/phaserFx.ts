import Phaser from "phaser"
import type { DashDef } from "./types"
import { listDashStampIds, stampCanvas } from "../../render/stamps"

type Speck = {
  sprite: Phaser.GameObjects.Image
  vx: number
  vy: number
  life: number
  maxLife: number
}

function ensureDashTextures(scene: Phaser.Scene): void {
  for (const id of listDashStampIds()) {
    const canvas = stampCanvas(id)
    if (!canvas) {
      continue
    }
    if (scene.textures.exists(id)) {
      scene.textures.remove(id)
    }
    scene.textures.addCanvas(id, canvas)
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
  private emitAcc = 0
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
      this.emitAcc = 0
      this.burst(player, facing)
    }
    if (dashing) {
      const stretch = this.reducedMotion ? 1.05 : this.def.stretchX
      player.setDisplaySize(this.baseW * stretch, this.baseH)
      this.trail(player, facing, dt)
    } else if (this.wasDashing) {
      player.setDisplaySize(this.baseW, this.baseH)
      this.clearGhosts()
      this.emitAcc = 0
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
    for (let i = 0; i < this.def.particle.count; i += 1) {
      this.emitSpeck(player, facing, false)
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
    if (this.reducedMotion) {
      return
    }
    this.emitAcc += dt
    while (this.emitAcc > 0.028) {
      this.emitAcc -= 0.028
      this.emitSpeck(player, facing, true)
    }
  }

  private emitSpeck(player: Phaser.Physics.Arcade.Sprite, facing: number, stream: boolean): void {
    const tex = textureForShape(this.def.particle.shape)
    const sprite = this.scene.add.image(
      player.x - facing * (stream ? 16 : 12),
      player.y + (Math.random() - 0.5) * (stream ? 12 : 18),
      tex,
    )
    sprite.setDepth(4)
    sprite.setAlpha(stream ? 0.9 : 0.85)
    const life = this.def.particle.life * (stream ? 0.65 : 0.7 + Math.random() * 0.4)
    this.specks.push({
      sprite,
      vx: -facing * (stream ? 36 + Math.random() * this.def.particle.spread : 50 + Math.random() * this.def.particle.spread * 4),
      vy: (Math.random() - 0.5) * (stream ? 28 : 70),
      life,
      maxLife: life,
    })
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
