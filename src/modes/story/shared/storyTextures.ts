import Phaser from "phaser"
import { drawBunny } from "../../../render/drawBunny"
import { listStoryStampIds, stampCanvas } from "../../../render/stamps"
import { getSave } from "../../../core/session"
import { listWorkshopTextures } from "../../../fx/workshop/overlayStore"
import { listEnemyKits } from "./enemyKit"
import { listItemLooks } from "./itemLooks"

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

  if (!scene.textures.exists("story_flag")) {
    const flag = scene.make.graphics({ x: 0, y: 0 })
    flag.fillStyle(0x6a4a32, 1)
    flag.fillRect(8, 2, 5, 78)
    flag.fillStyle(0x4a3224, 1)
    flag.fillCircle(10, 78, 6)
    flag.fillStyle(0xd45c4c, 1)
    flag.fillTriangle(13, 6, 46, 22, 13, 36)
    flag.fillStyle(0xf0dcc4, 1)
    flag.fillTriangle(13, 10, 36, 22, 13, 28)
    flag.generateTexture("story_flag", 48, 84)
    flag.destroy()
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

  if (!scene.textures.exists("story_bridge")) {
    const bridge = scene.make.graphics({ x: 0, y: 0 })
    bridge.fillStyle(0xb8c8d4, 1)
    bridge.fillRoundedRect(0, 6, 64, 14, 3)
    bridge.fillStyle(0xd8e4ee, 1)
    bridge.fillRect(4, 8, 12, 8)
    bridge.fillRect(24, 8, 12, 8)
    bridge.fillRect(44, 8, 12, 8)
    bridge.lineStyle(2, 0x8aa0b0, 0.9)
    bridge.lineBetween(4, 0, 8, 8)
    bridge.lineBetween(60, 0, 56, 8)
    bridge.generateTexture("story_bridge", 64, 22)
    bridge.destroy()
  }

  if (!scene.textures.exists("story_gale")) {
    const gale = scene.make.graphics({ x: 0, y: 0 })
    gale.fillStyle(0xc8dcec, 0.35)
    gale.fillRect(0, 0, 80, 240)
    gale.fillStyle(0xe8f4ff, 0.5)
    gale.fillEllipse(40, 40, 50, 28)
    gale.fillEllipse(28, 100, 44, 24)
    gale.fillEllipse(48, 160, 52, 26)
    gale.fillEllipse(32, 210, 40, 22)
    gale.generateTexture("story_gale", 80, 240)
    gale.destroy()
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

  if (!scene.textures.exists("story_han_0")) {
    const looks = [
      { body: 0xb8c8d8, head: 0xd8e4ee, horn: 0x8aa0b4, eye: 0x2a3d4c, core: 0xc8d8e4, a: 0.55, extra: false },
      { body: 0x9eb4c8, head: 0xc8d8e8, horn: 0x6a88a4, eye: 0x1a3048, core: 0xa8c8e0, a: 0.64, extra: false },
      { body: 0x7a98b8, head: 0xb0c8dc, horn: 0x4a6888, eye: 0x7ec8ff, core: 0x88b0d0, a: 0.74, extra: true },
      { body: 0x5a6a98, head: 0x8aa0c8, horn: 0x3a4068, eye: 0xa8e0ff, core: 0x6070b0, a: 0.84, extra: true },
      { body: 0x2a2848, head: 0x4a4870, horn: 0x1a1028, eye: 0xe8f4ff, core: 0x8890d8, a: 0.94, extra: true },
    ]
    looks.forEach((look, rage) => {
      const han = scene.make.graphics({ x: 0, y: 0 })
      const grow = rage * 3
      han.fillStyle(look.body, look.a)
      han.fillEllipse(40, 70, 52 + grow, 86 + grow)
      han.fillStyle(look.head, Math.min(1, look.a + 0.2))
      han.fillEllipse(40, 38, 36 + grow * 0.4, 40 + grow * 0.3)
      han.fillStyle(look.horn, 0.95)
      const horn = 16 + rage * 6
      han.fillTriangle(22, 22, 16 - rage, 6 - horn, 32, 20)
      han.fillTriangle(58, 22, 64 + rage, 6 - horn, 48, 20)
      if (look.extra) {
        han.fillTriangle(28, 18, 24, 4 - rage * 2, 34, 16)
        han.fillTriangle(52, 18, 56, 4 - rage * 2, 46, 16)
      }
      han.fillStyle(look.eye, 1)
      han.fillCircle(32, 38, 3 + Math.min(2, rage))
      han.fillCircle(48, 38, 3 + Math.min(2, rage))
      han.fillStyle(look.core, 0.4 + rage * 0.1)
      han.fillEllipse(40, 78, 18 + grow, 26 + grow)
      han.generateTexture(`story_han_${rage}`, 80, 120)
      if (rage === 0) {
        han.generateTexture("story_han", 80, 120)
      }
      han.destroy()
    })
  }

  if (!scene.textures.exists("story_frost")) {
    const frost = scene.make.graphics({ x: 0, y: 0 })
    frost.fillStyle(0xc8e8ff, 1)
    frost.fillTriangle(2, 8, 44, 4, 44, 12)
    frost.fillStyle(0xf4fbff, 1)
    frost.fillTriangle(10, 8, 40, 6, 40, 10)
    frost.generateTexture("story_frost", 48, 16)
    frost.destroy()
  }

  if (!scene.textures.exists("story_star")) {
    const star = scene.make.graphics({ x: 0, y: 0 })
    star.fillStyle(0xf2e6a4, 1)
    star.fillTriangle(8, 2, 2, 28, 14, 28)
    star.fillStyle(0xfff8d0, 1)
    star.fillTriangle(8, 6, 5, 22, 11, 22)
    star.generateTexture("story_star", 16, 32)
    star.destroy()
  }

  if (scene.textures.exists("chase_fox")) {
    scene.textures.remove("chase_fox")
  }
  const canvas = document.createElement("canvas")
  canvas.width = 160
  canvas.height = 96
  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.clearRect(0, 0, 160, 96)
    const flame = (x: number, y: number, rx: number, ry: number, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, -0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    flame(28, 52, 26, 16, "#c42810")
    flame(40, 48, 22, 14, "#ff5a12")
    flame(54, 44, 16, 11, "#ff9a1a")
    flame(66, 40, 11, 8, "#ffe066")
    ctx.fillStyle = "#c45a2a"
    ctx.beginPath()
    ctx.ellipse(96, 58, 28, 18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#e8883c"
    ctx.beginPath()
    ctx.ellipse(100, 54, 24, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#fff4dc"
    ctx.beginPath()
    ctx.ellipse(108, 64, 10, 7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#df8b4c"
    ctx.beginPath()
    ctx.arc(128, 42, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#c45a2a"
    ctx.beginPath()
    ctx.moveTo(118, 28)
    ctx.lineTo(114, 8)
    ctx.lineTo(130, 26)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(132, 26)
    ctx.lineTo(142, 6)
    ctx.lineTo(146, 28)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#f2a35a"
    ctx.beginPath()
    ctx.moveTo(120, 26)
    ctx.lineTo(118, 14)
    ctx.lineTo(128, 26)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(134, 25)
    ctx.lineTo(141, 12)
    ctx.lineTo(144, 26)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#f0c8a0"
    ctx.beginPath()
    ctx.ellipse(140, 46, 9, 6, 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#2a2010"
    ctx.beginPath()
    ctx.arc(134, 40, 2.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#3a2010"
    ctx.beginPath()
    ctx.moveTo(148, 46)
    ctx.lineTo(159, 48)
    ctx.lineTo(148, 51)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#a84820"
    ctx.fillRect(84, 70, 8, 16)
    ctx.fillRect(104, 70, 8, 16)
    ctx.fillRect(118, 68, 7, 16)
    scene.textures.addCanvas("chase_fox", canvas)
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

  const addStampTexture = (id: string): void => {
    const stamp = stampCanvas(id)
    if (!stamp) {
      return
    }
    if (scene.textures.exists(id)) {
      scene.textures.remove(id)
    }
    scene.textures.addCanvas(id, stamp)
  }

  for (const id of listStoryStampIds()) {
    addStampTexture(id)
  }

  const bakeCopy = (sourceKey: string, destKey: string): void => {
    if (!scene.textures.exists(sourceKey)) {
      return
    }
    const img = scene.textures.get(sourceKey).getSourceImage() as HTMLCanvasElement | HTMLImageElement
    const canvas = document.createElement("canvas")
    canvas.width = img.width || 40
    canvas.height = img.height || 48
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }
    ctx.drawImage(img, 0, 0)
    if (scene.textures.exists(destKey)) {
      scene.textures.remove(destKey)
    }
    scene.textures.addCanvas(destKey, canvas)
  }

  for (const row of listEnemyKits()) {
    bakeCopy(row.kit.source, row.kit.texture)
  }
  for (const look of listItemLooks()) {
    bakeCopy(look.source, look.texture)
  }

  const workshop = listWorkshopTextures()
  for (const [id, dataUrl] of Object.entries(workshop)) {
    if (!dataUrl.startsWith("data:image")) {
      continue
    }
    if (scene.textures.exists(id)) {
      scene.textures.remove(id)
    }
    scene.textures.addBase64(id, dataUrl)
  }
}
