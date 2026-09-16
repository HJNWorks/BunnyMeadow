import Phaser from "phaser"
import palettesData from "../../../data/palettes.json"

export type PaletteHour = "afternoon" | "golden" | "dusk" | "night" | "deepNight" | "eternal"

export type WeatherPreset = "pollen" | "leaves" | "drizzle" | "fireflies" | "lanternAsh" | "blossom" | "snow"

export type Palette = {
  sky: string
  far: string
  mid: string
  ground: string
  accent: string
  fog: string
  hour: PaletteHour
  weather: WeatherPreset
}

export type WeatherHandle = {
  update: (dt: number, camX: number) => void
  destroy: () => void
}

type Speck = {
  sprite: Phaser.GameObjects.Image
  vx: number
  vy: number
  life: number
}

const PALETTES = palettesData as Record<string, Palette>

const NIGHT_STRENGTH: Record<PaletteHour, number> = {
  afternoon: 0,
  golden: 0,
  dusk: 0.25,
  night: 0.45,
  deepNight: 0.55,
  eternal: 0.5,
}

export function getPalette(env: string): Palette {
  return PALETTES[env] ?? PALETTES.meadow
}

export function nightStrength(hour: PaletteHour): number {
  return NIGHT_STRENGTH[hour] ?? 0
}

export function hexToNum(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16) || 0x5a6a4a
}

export function lerpHex(a: string, b: string, t: number): string {
  const u = Math.max(0, Math.min(1, t))
  const an = hexToNum(a)
  const bn = hexToNum(b)
  const ar = (an >> 16) & 0xff
  const ag = (an >> 8) & 0xff
  const ab = an & 0xff
  const br = (bn >> 16) & 0xff
  const bg = (bn >> 8) & 0xff
  const bb = bn & 0xff
  const r = Math.round(ar + (br - ar) * u)
  const g = Math.round(ag + (bg - ag) * u)
  const bl = Math.round(ab + (bb - ab) * u)
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`
}

export function applySky(scene: Phaser.Scene, palette: Palette): Phaser.GameObjects.Rectangle {
  scene.cameras.main.setBackgroundColor(palette.sky)
  return scene.add
    .rectangle(960, 200, 1920, 420, hexToNum(palette.far), 0.55)
    .setScrollFactor(0)
    .setDepth(-3)
}

function ensureSpeckTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists("theme_speck")) {
    return
  }
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.fillStyle(0xffffff, 1)
  g.fillCircle(4, 4, 4)
  g.generateTexture("theme_speck", 8, 8)
  g.destroy()
}

export function createWeather(
  scene: Phaser.Scene,
  preset: WeatherPreset,
  worldWidth: number,
  reducedMotion: boolean,
): WeatherHandle {
  ensureSpeckTexture(scene)
  const specks: Speck[] = []
  const count = reducedMotion ? 4 : 28
  const tint =
    preset === "drizzle"
      ? 0xa8c4d0
      : preset === "fireflies"
        ? 0xf0e080
        : preset === "blossom"
          ? 0xf2d4e8
          : preset === "lanternAsh"
            ? 0xe8a060
            : preset === "leaves"
              ? 0xc4a050
              : preset === "snow"
                ? 0xe8f4ff
                : 0xe8f0c8
  const rise = preset === "fireflies"
  const wind = preset === "snow"
  for (let i = 0; i < count; i += 1) {
    const sprite = scene.add.image(Math.random() * worldWidth, Math.random() * 1080, "theme_speck")
    sprite.setDepth(18)
    sprite.setTint(tint)
    sprite.setAlpha(preset === "fireflies" ? 0.7 : 0.45)
    sprite.setScale(preset === "drizzle" ? 0.4 : 0.7)
    specks.push({
      sprite,
      vx: reducedMotion ? 0 : wind ? -48 - Math.random() * 36 : (Math.random() - 0.5) * (rise ? 18 : 40),
      vy: reducedMotion ? 0 : rise ? -20 - Math.random() * 24 : (wind ? 16 : 40) + Math.random() * 50,
      life: 2 + Math.random() * 4,
    })
  }
  return {
    update: (dt: number, camX: number) => {
      if (reducedMotion) {
        return
      }
      for (const speck of specks) {
        speck.sprite.x += speck.vx * dt
        speck.sprite.y += speck.vy * dt
        speck.life -= dt
        if (speck.sprite.y > 1100 || speck.sprite.y < -40 || speck.life <= 0) {
          speck.sprite.x = camX - 200 + Math.random() * 1600
          speck.sprite.y = rise ? 1000 : -20
          speck.life = 2 + Math.random() * 4
        }
      }
    },
    destroy: () => {
      for (const speck of specks) {
        speck.sprite.destroy()
      }
    },
  }
}

export function createNightOverlay(
  scene: Phaser.Scene,
  strength: number,
): Phaser.GameObjects.Rectangle {
  const overlay = scene.add.rectangle(960, 540, 1920, 1080, 0x1a1428, Math.max(0, strength))
  overlay.setScrollFactor(0)
  overlay.setDepth(19)
  overlay.setBlendMode(Phaser.BlendModes.MULTIPLY)
  overlay.setVisible(strength > 0)
  return overlay
}

export function createLanternGlow(scene: Phaser.Scene): Phaser.GameObjects.Image {
  if (!scene.textures.exists("theme_glow")) {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 120)
      grad.addColorStop(0, "rgba(255, 210, 120, 0.7)")
      grad.addColorStop(1, "rgba(255, 210, 120, 0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 256, 256)
    }
    scene.textures.addCanvas("theme_glow", canvas)
  }
  const glow = scene.add.image(0, 0, "theme_glow")
  glow.setDepth(18.5)
  glow.setBlendMode(Phaser.BlendModes.ADD)
  glow.setVisible(false)
  glow.setScrollFactor(1)
  return glow
}

export function storyEnvForLevel(world: number, index: number, id: string): string {
  if (id.startsWith("moon")) {
    return "moon"
  }
  if (world === 4) {
    return "cloudsea"
  }
  if (world === 0) {
    return "meadow"
  }
  if (world === 1) {
    return index === 2 ? "orchard" : "meadow"
  }
  if (world === 2) {
    return index === 1 ? "bamboo" : "riverbank"
  }
  if (world === 3) {
    return index === 1 ? "lantern" : "osmanthus"
  }
  return "meadow"
}
