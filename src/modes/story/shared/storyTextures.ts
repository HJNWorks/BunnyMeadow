import Phaser from "phaser"
import { drawBunny } from "../../../render/drawBunny"
import { getSave } from "../../../core/session"

export function buildPlayerTexture(scene: Phaser.Scene): string {
  const save = getSave()
  const playerKey = "story_player"
  if (scene.textures.exists(playerKey)) {
    scene.textures.remove(playerKey)
  }
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 72
  const ctx = canvas.getContext("2d")
  if (ctx) {
    drawBunny(ctx, 32, 40, {
      fur: save.player.fur,
      ears: save.player.ears,
      accessory: save.player.accessory,
    })
    scene.textures.addCanvas(playerKey, canvas)
    return playerKey
  }
  return "story_bunny"
}

export function ensureStoryTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("story_bunny")) {
    const g = scene.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xfffaf0, 1)
    g.fillEllipse(20, 28, 36, 40)
    g.fillStyle(0xf0c3b4, 1)
    g.fillEllipse(8, 12, 12, 18)
    g.fillEllipse(32, 12, 12, 18)
    g.fillStyle(0xfffaf0, 1)
    g.fillEllipse(8, 14, 8, 12)
    g.fillEllipse(32, 14, 8, 12)
    g.fillStyle(0xe8b3a6, 1)
    g.fillEllipse(20, 34, 10, 8)
    g.fillStyle(0x304c39, 1)
    g.fillCircle(13, 24, 2.5)
    g.fillCircle(27, 24, 2.5)
    g.generateTexture("story_bunny", 40, 48)
    g.destroy()
  }

  buildPlayerTexture(scene)

  if (!scene.textures.exists("story_ground")) {
    const dirt = scene.make.graphics({ x: 0, y: 0 })
    dirt.fillStyle(0x6a7540, 1)
    dirt.fillRect(0, 0, 64, 64)
    dirt.fillStyle(0x80924f, 1)
    dirt.fillRect(0, 0, 64, 14)
    dirt.fillStyle(0x556234, 1)
    dirt.fillCircle(18, 30, 5)
    dirt.fillCircle(44, 46, 4)
    dirt.fillCircle(30, 52, 3)
    dirt.generateTexture("story_ground", 64, 64)
    dirt.destroy()
  }

  if (!scene.textures.exists("story_hedge")) {
    const hedge = scene.make.graphics({ x: 0, y: 0 })
    hedge.fillStyle(0x35532c, 1)
    hedge.fillRect(8, 18, 24, 46)
    hedge.fillStyle(0x4d6f3d, 1)
    hedge.fillEllipse(20, 14, 36, 26)
    hedge.fillEllipse(8, 30, 22, 20)
    hedge.fillEllipse(32, 34, 24, 22)
    hedge.fillStyle(0x6f8f52, 1)
    hedge.fillEllipse(18, 10, 16, 12)
    hedge.generateTexture("story_hedge", 40, 64)
    hedge.destroy()
  }

  if (!scene.textures.exists("story_exit")) {
    const hole = scene.make.graphics({ x: 0, y: 0 })
    hole.fillStyle(0x5a4330, 1)
    hole.fillEllipse(40, 52, 74, 50)
    hole.fillStyle(0x241810, 1)
    hole.fillEllipse(40, 54, 50, 34)
    hole.fillStyle(0x7a6248, 1)
    hole.fillEllipse(40, 40, 60, 18)
    hole.generateTexture("story_exit", 80, 90)
    hole.destroy()
  }

  if (!scene.textures.exists("story_pool")) {
    const poolGfx = scene.make.graphics({ x: 0, y: 0 })
    poolGfx.fillStyle(0x5fb4d6, 1)
    poolGfx.fillEllipse(40, 20, 74, 30)
    poolGfx.fillStyle(0x9fdcf0, 0.8)
    poolGfx.fillEllipse(40, 16, 54, 16)
    poolGfx.fillStyle(0xe8f8ff, 0.7)
    poolGfx.fillEllipse(28, 14, 18, 8)
    poolGfx.generateTexture("story_pool", 80, 36)
    poolGfx.destroy()
  }

  if (!scene.textures.exists("story_crow")) {
    const crow = scene.make.graphics({ x: 0, y: 0 })
    crow.fillStyle(0x2a2a32, 1)
    crow.fillEllipse(18, 18, 28, 18)
    crow.fillTriangle(4, 16, 0, 12, 8, 14)
    crow.fillStyle(0xf2f2f2, 1)
    crow.fillCircle(22, 14, 2)
    crow.generateTexture("story_crow", 36, 28)
    crow.destroy()
  }

  if (!scene.textures.exists("story_log")) {
    const log = scene.make.graphics({ x: 0, y: 0 })
    log.fillStyle(0x8b5a2b, 1)
    log.fillRoundedRect(0, 4, 64, 24, 10)
    log.fillStyle(0xa8733a, 1)
    log.fillRoundedRect(4, 8, 56, 10, 6)
    log.generateTexture("story_log", 64, 32)
    log.destroy()
  }

  if (!scene.textures.exists("story_tiger")) {
    const tiger = scene.make.graphics({ x: 0, y: 0 })
    tiger.fillStyle(0xe2953a, 1)
    tiger.fillRoundedRect(18, 14, 70, 26, 10)
    tiger.fillStyle(0x2a2010, 1)
    tiger.fillRect(34, 16, 5, 22)
    tiger.fillRect(50, 16, 5, 22)
    tiger.fillRect(66, 16, 5, 22)
    tiger.fillStyle(0xe8a84a, 1)
    tiger.fillCircle(22, 18, 14)
    tiger.fillStyle(0xd48430, 1)
    tiger.fillEllipse(14, 6, 7, 10)
    tiger.fillEllipse(28, 6, 7, 10)
    tiger.fillStyle(0xf0b868, 1)
    tiger.fillEllipse(14, 7, 3, 5)
    tiger.fillEllipse(28, 7, 3, 5)
    tiger.fillStyle(0x2a2010, 1)
    tiger.fillCircle(16, 16, 2)
    tiger.fillStyle(0xc45a2a, 1)
    tiger.fillTriangle(6, 20, 0, 22, 8, 24)
    tiger.fillStyle(0xd48430, 1)
    tiger.fillRect(28, 38, 8, 8)
    tiger.fillRect(58, 38, 8, 8)
    tiger.fillRect(74, 38, 8, 8)
    tiger.generateTexture("story_tiger", 100, 48)
    tiger.destroy()
  }

  if (!scene.textures.exists("story_cart")) {
    const cart = scene.make.graphics({ x: 0, y: 0 })
    cart.fillStyle(0x8b5a2b, 1)
    cart.fillRoundedRect(4, 16, 90, 28, 6)
    cart.fillStyle(0xdf8b4c, 1)
    cart.fillEllipse(70, 14, 28, 22)
    cart.fillStyle(0xf2a35a, 1)
    cart.fillCircle(18, 48, 10)
    cart.fillCircle(78, 48, 10)
    cart.fillStyle(0xe07030, 1)
    cart.fillCircle(62, 10, 4)
    cart.generateTexture("story_cart", 100, 60)
    cart.destroy()
  }

  if (!scene.textures.exists("story_heron")) {
    const heron = scene.make.graphics({ x: 0, y: 0 })
    heron.fillStyle(0xd8e0e8, 1)
    heron.fillEllipse(24, 36, 28, 40)
    heron.fillStyle(0xb0bcc8, 1)
    heron.fillTriangle(24, 8, 18, 28, 30, 28)
    heron.fillStyle(0xe8a040, 1)
    heron.fillTriangle(24, 6, 40, 10, 24, 14)
    heron.fillStyle(0x304050, 1)
    heron.fillCircle(28, 22, 2)
    heron.generateTexture("story_heron", 48, 64)
    heron.destroy()
  }

  if (!scene.textures.exists("story_crane")) {
    const crane = scene.make.graphics({ x: 0, y: 0 })
    crane.fillStyle(0xf4f6f8, 1)
    crane.fillEllipse(36, 28, 48, 26)
    crane.fillStyle(0xe8ecf0, 1)
    crane.fillTriangle(10, 28, 0, 18, 16, 22)
    crane.fillTriangle(62, 28, 72, 18, 56, 22)
    crane.fillStyle(0xc04040, 1)
    crane.fillCircle(48, 24, 3)
    crane.fillStyle(0x304050, 1)
    crane.fillCircle(42, 22, 2)
    crane.generateTexture("story_crane", 72, 48)
    crane.destroy()
  }

  if (!scene.textures.exists("story_carrot")) {
    const carrot = scene.make.graphics({ x: 0, y: 0 })
    carrot.fillStyle(0xe8822c, 1)
    carrot.fillTriangle(12, 6, 4, 30, 20, 30)
    carrot.fillStyle(0xf0a050, 1)
    carrot.fillTriangle(12, 12, 8, 28, 16, 28)
    carrot.fillStyle(0x4d8f3d, 1)
    carrot.fillEllipse(9, 5, 6, 8)
    carrot.fillEllipse(15, 5, 6, 8)
    carrot.generateTexture("story_carrot", 24, 32)
    carrot.destroy()
  }

  if (!scene.textures.exists("chase_fox")) {
    const fox = scene.make.graphics({ x: 0, y: 0 })
    fox.fillStyle(0xff6a18, 0.55)
    fox.fillEllipse(22, 34, 36, 22)
    fox.fillStyle(0xff9a1a, 0.85)
    fox.fillEllipse(34, 32, 28, 16)
    fox.fillStyle(0xffe066, 0.9)
    fox.fillEllipse(44, 30, 16, 10)
    fox.fillStyle(0xe07030, 1)
    fox.fillEllipse(78, 42, 44, 26)
    fox.fillStyle(0xf2a35a, 1)
    fox.fillEllipse(78, 38, 36, 18)
    fox.fillStyle(0xfff4dc, 1)
    fox.fillEllipse(86, 46, 16, 10)
    fox.fillStyle(0xdf8b4c, 1)
    fox.fillCircle(108, 30, 16)
    fox.fillStyle(0xc45a2a, 1)
    fox.fillTriangle(100, 18, 96, 4, 108, 16)
    fox.fillTriangle(112, 16, 118, 2, 122, 18)
    fox.fillStyle(0xf2a35a, 1)
    fox.fillTriangle(102, 16, 100, 8, 108, 16)
    fox.fillTriangle(114, 15, 118, 6, 120, 16)
    fox.fillStyle(0xe8c090, 1)
    fox.fillEllipse(118, 34, 12, 8)
    fox.fillStyle(0x2a2010, 1)
    fox.fillCircle(114, 28, 2.4)
    fox.fillStyle(0x3a2010, 1)
    fox.fillTriangle(124, 34, 136, 36, 124, 38)
    fox.fillStyle(0xc45a2a, 1)
    fox.fillRect(64, 52, 8, 14)
    fox.fillRect(86, 52, 8, 14)
    fox.fillRect(98, 50, 7, 14)
    fox.generateTexture("chase_fox", 140, 72)
    fox.destroy()
  }

  if (!scene.textures.exists("chase_ember")) {
    const ember = scene.make.graphics({ x: 0, y: 0 })
    ember.fillStyle(0xfff2a0, 1)
    ember.fillCircle(10, 10, 5)
    ember.fillStyle(0xff7a1a, 0.9)
    ember.fillCircle(10, 10, 8)
    ember.fillStyle(0xd04010, 0.55)
    ember.fillCircle(10, 10, 10)
    ember.generateTexture("chase_ember", 20, 20)
    ember.destroy()
  }
}
