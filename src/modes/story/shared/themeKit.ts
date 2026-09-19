import Phaser from "phaser"
import palettesData from "../../../data/palettes.json"

export type PaletteHour = "afternoon" | "golden" | "dusk" | "night" | "deepNight" | "eternal"

export type WeatherPreset =
  | "pollen"
  | "leaves"
  | "drizzle"
  | "fireflies"
  | "lanternAsh"
  | "blossom"
  | "snow"
  | "none"
  | "starDrift"
  | "dustMotes"

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

export function listPaletteIds(): string[] {
  return Object.keys(PALETTES)
}

export const WEATHER_PRESETS: WeatherPreset[] = [
  "pollen",
  "leaves",
  "drizzle",
  "fireflies",
  "lanternAsh",
  "blossom",
  "snow",
  "none",
  "starDrift",
  "dustMotes",
]

export function isLunarEnv(env: string): boolean {
  return env === "moon" || env.startsWith("ch2_")
}

export const PALETTE_HOURS: PaletteHour[] = [
  "afternoon",
  "golden",
  "dusk",
  "night",
  "deepNight",
  "eternal",
]

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

export function lookNightAlpha(
  hour: PaletteHour,
  look?: { night?: boolean; nightAmount?: number },
): number {
  if (look?.night === false) {
    return 0
  }
  const fromHour = nightStrength(hour)
  if (look?.night === true) {
    if (typeof look.nightAmount === "number" && Number.isFinite(look.nightAmount)) {
      return Math.max(0, Math.min(1, look.nightAmount / 100))
    }
    return Math.max(fromHour, 0.42)
  }
  return fromHour
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

export function applySky(
  scene: Phaser.Scene,
  palette: Palette,
  env?: string,
): Phaser.GameObjects.Rectangle {
  scene.cameras.main.setBackgroundColor(palette.sky)
  const fill = scene.add
    .rectangle(960, 200, 1920, 420, hexToNum(palette.far), 0.55)
    .setScrollFactor(0)
    .setDepth(-3)
  if (env && isLunarEnv(env)) {
    if (scene.textures.exists("story_sky_moon")) {
      scene.add
        .image(960, 180, "story_sky_moon")
        .setDisplaySize(1920, 420)
        .setScrollFactor(0)
        .setAlpha(0.88)
        .setDepth(-3.2)
    }
    if (scene.textures.exists("story_far_moon")) {
      scene.add
        .image(960, 280, "story_far_moon")
        .setDisplaySize(1920, 480)
        .setScrollFactor(0.1)
        .setAlpha(0.72)
        .setDepth(-2.6)
    }
  }
  return fill
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
  if (preset === "none") {
    return {
      update: () => undefined,
      destroy: () => undefined,
    }
  }
  ensureSpeckTexture(scene)
  const specks: Speck[] = []
  const twinkle = preset === "starDrift"
  const dust = preset === "dustMotes"
  const count = reducedMotion ? (twinkle ? 6 : 4) : twinkle ? 16 : dust ? 22 : 28
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
                : twinkle
                  ? 0xe8eef6
                  : dust
                    ? 0xc4b89a
                    : 0xe8f0c8
  const rise = preset === "fireflies"
  const wind = preset === "snow"
  for (let i = 0; i < count; i += 1) {
    const sprite = scene.add.image(Math.random() * worldWidth, Math.random() * 1080, "theme_speck")
    sprite.setDepth(18)
    sprite.setTint(tint)
    sprite.setAlpha(twinkle ? 0.55 + Math.random() * 0.3 : preset === "fireflies" ? 0.7 : 0.45)
    sprite.setScale(twinkle ? 0.28 + Math.random() * 0.18 : preset === "drizzle" ? 0.4 : dust ? 0.5 : 0.7)
    specks.push({
      sprite,
      vx: reducedMotion
        ? 0
        : dust
          ? 22 + Math.random() * 28
          : wind
            ? -48 - Math.random() * 36
            : (Math.random() - 0.5) * (twinkle ? 8 : rise ? 18 : 40),
      vy: reducedMotion
        ? 0
        : rise
          ? -20 - Math.random() * 24
          : twinkle
            ? 6 + Math.random() * 10
            : dust
              ? (Math.random() - 0.5) * 10
              : (wind ? 16 : 40) + Math.random() * 50,
      life: twinkle ? 3 + Math.random() * 5 : 2 + Math.random() * 4,
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
        if (twinkle) {
          speck.sprite.setAlpha(0.2 + 0.45 * (0.5 + 0.5 * Math.sin(speck.life * 3)))
        }
        const offY = speck.sprite.y > 1100 || speck.sprite.y < -40
        const offX = dust && speck.sprite.x > camX + 1700
        if (offY || offX || speck.life <= 0) {
          speck.sprite.x = dust ? camX - 80 : camX - 200 + Math.random() * 1600
          speck.sprite.y = rise ? 1000 : twinkle ? Math.random() * 720 : dust ? 180 + Math.random() * 720 : -20
          speck.life = twinkle ? 3 + Math.random() * 5 : 2 + Math.random() * 4
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
  if (id.startsWith("ch2_outer")) {
    return "ch2_outer"
  }
  if (id.startsWith("ch2_cassia")) {
    return "ch2_cassia"
  }
  if (id.startsWith("ch2_mortar")) {
    return "ch2_mortar"
  }
  if (id.startsWith("ch2_dust")) {
    return "ch2_dust"
  }
  if (id.startsWith("ch2_wells")) {
    return "ch2_wells"
  }
  if (id.startsWith("ch2_silver")) {
    return "ch2_silver"
  }
  if (id.startsWith("ch2_") || id.startsWith("moon")) {
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
