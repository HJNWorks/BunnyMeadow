export type StampSize = { w: number; h: number }

export const STAMP_SIZE: Record<string, StampSize> = {
  story_crow: { w: 36, h: 28 },
  story_heron: { w: 48, h: 64 },
  story_magpie: { w: 48, h: 28 },
  story_wisp: { w: 52, h: 36 },
  story_ice: { w: 32, h: 32 },
  story_fox: { w: 48, h: 36 },
  story_hedgehog: { w: 40, h: 32 },
  story_squirrel: { w: 36, h: 36 },
  story_frog: { w: 36, h: 28 },
  story_cat: { w: 40, h: 32 },
  story_owl: { w: 36, h: 36 },
  story_goat: { w: 48, h: 40 },
  story_boar: { w: 52, h: 32 },
  story_tortoise: { w: 44, h: 28 },
  story_bees: { w: 44, h: 32 },
  story_carp: { w: 48, h: 24 },
  story_frost_hare: { w: 40, h: 32 },
  story_moth: { w: 36, h: 24 },
  story_carrot: { w: 24, h: 32 },
  story_mooncake: { w: 28, h: 28 },
  story_dew: { w: 18, h: 24 },
  story_blossom: { w: 28, h: 28 },
  story_seed: { w: 20, h: 24 },
  story_lantern: { w: 24, h: 36 },
  story_sparkler: { w: 16, h: 28 },
  story_han: { w: 96, h: 140 },
  story_ground_moon: { w: 64, h: 64 },
  story_hedge_moon: { w: 40, h: 64 },
  story_rim: { w: 64, h: 24 },
  story_bowl: { w: 64, h: 28 },
  story_wound: { w: 64, h: 24 },
  story_cave: { w: 64, h: 64 },
  story_sky_moon: { w: 256, h: 128 },
  story_far_moon: { w: 256, h: 96 },
  story_far_guanghan: { w: 256, h: 96 },
  story_dust: { w: 52, h: 36 },
  story_starwisp: { w: 52, h: 36 },
  story_pestle: { w: 32, h: 36 },
  story_grit: { w: 24, h: 24 },
  story_elixir: { w: 24, h: 24 },
  story_silver: { w: 24, h: 28 },
  dash_speck: { w: 12, h: 12 },
  dash_carrot: { w: 12, h: 18 },
  dash_streak: { w: 22, h: 12 },
  dash_crescent: { w: 18, h: 18 },
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ellipse(ctx, x, y, r, r, color)
}

function tri(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(ax, ay)
  ctx.lineTo(bx, by)
  ctx.lineTo(cx, cy)
  ctx.closePath()
  ctx.fill()
}

function drawCrow(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 14, 9, "#2a2a32")
  tri(ctx, cx - 14, cy, cx - 22, cy - 6, cx - 10, cy - 2, "#2a2a32")
  circle(ctx, cx + 4, cy - 2, 2, "#f2f2f2")
}

function drawHeron(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 8, 14, 20, "#d8e0e8")
  tri(ctx, cx, cy - 20, cx - 6, cy, cx + 6, cy, "#b0bcc8")
  tri(ctx, cx, cy - 22, cx + 16, cy - 18, cx, cy - 14, "#e8a040")
  circle(ctx, cx + 4, cy - 6, 2, "#304050")
}

function drawMagpie(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy, 14, 8, "#1a1a22")
  tri(ctx, cx - 14, cy, cx - 22, cy - 6, cx - 10, cy - 2, "#1a1a22")
  ellipse(ctx, cx + 4, cy + 2, 7, 5, "#f4f4f8")
  tri(ctx, cx + 12, cy, cx + 24, cy - 4, cx + 14, cy + 4, "#2a2a32")
  circle(ctx, cx + 6, cy - 4, 2, "#f2f2f2")
}

function drawWisp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 10, cy + 4, 10, 6, "#4a7a98")
  ellipse(ctx, cx + 12, cy + 2, 8, 5, "#5a88a8")
  tri(ctx, cx, cy - 14, cx - 7, cy + 8, cx + 7, cy + 8, "#8fd4ff")
  tri(ctx, cx - 10, cy - 6, cx - 16, cy + 10, cx - 4, cy + 8, "#b8e8ff")
  tri(ctx, cx + 11, cy - 4, cx + 5, cy + 10, cx + 16, cy + 8, "#c8f0ff")
  ellipse(ctx, cx, cy + 2, 7, 5, "#f4fbff")
  circle(ctx, cx + 2, cy - 2, 1.6, "#ffffff")
}

function drawIce(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  tri(ctx, cx, cy - 14, cx - 12, cy + 14, cx + 12, cy + 14, "#a8d4f0")
  tri(ctx, cx, cy - 8, cx - 6, cy + 10, cx + 6, cy + 10, "#e8f6ff")
}

function drawFox(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 2, cy + 4, 16, 10, "#df8b4c")
  ellipse(ctx, cx + 14, cy + 6, 10, 6, "#c45a2a")
  circle(ctx, cx + 10, cy - 6, 9, "#e8883c")
  tri(ctx, cx + 4, cy - 14, cx + 2, cy - 24, cx + 10, cy - 12, "#c45a2a")
  tri(ctx, cx + 14, cy - 14, cx + 22, cy - 24, cx + 18, cy - 12, "#c45a2a")
  tri(ctx, cx + 4, cy - 14, cx + 4, cy - 20, cx + 10, cy - 12, "#f2a35a")
  tri(ctx, cx + 16, cy - 14, cx + 20, cy - 20, cx + 18, cy - 12, "#f2a35a")
  ellipse(ctx, cx + 18, cy - 2, 6, 4, "#f0c8a0")
  circle(ctx, cx + 12, cy - 8, 2, "#2a2010")
  tri(ctx, cx + 22, cy - 2, cx + 30, cy, cx + 22, cy + 2, "#3a2010")
  ellipse(ctx, cx - 6, cy + 8, 6, 4, "#fff4dc")
}

function drawHedgehog(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 16, 11, "#a8845c")
  for (let i = 0; i < 7; i += 1) {
    const a = -2.4 + i * 0.55
    tri(
      ctx,
      cx + Math.cos(a) * 6,
      cy + Math.sin(a) * 2,
      cx + Math.cos(a - 0.2) * 18,
      cy + Math.sin(a - 0.2) * 14 - 8,
      cx + Math.cos(a + 0.2) * 18,
      cy + Math.sin(a + 0.2) * 14 - 8,
      "#6a4a32",
    )
  }
  ellipse(ctx, cx + 12, cy + 4, 7, 5, "#c4a07a")
  circle(ctx, cx + 16, cy + 2, 1.6, "#2a2010")
}

function drawSquirrel(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 8, cy + 2, 8, 14, "#c47a3a")
  ellipse(ctx, cx + 4, cy + 6, 10, 8, "#c47a3a")
  circle(ctx, cx + 12, cy - 2, 7, "#d4884a")
  tri(ctx, cx + 8, cy - 8, cx + 6, cy - 16, cx + 12, cy - 8, "#c47a3a")
  tri(ctx, cx + 14, cy - 8, cx + 18, cy - 16, cx + 16, cy - 8, "#c47a3a")
  circle(ctx, cx + 14, cy - 4, 1.6, "#2a2010")
}

function drawFrog(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 4, 16, 9, "#5f8f45")
  circle(ctx, cx - 8, cy - 6, 6, "#6fa055")
  circle(ctx, cx + 8, cy - 6, 6, "#6fa055")
  circle(ctx, cx - 8, cy - 6, 3, "#f4f8e8")
  circle(ctx, cx + 8, cy - 6, 3, "#f4f8e8")
  circle(ctx, cx - 8, cy - 6, 1.5, "#2a2010")
  circle(ctx, cx + 8, cy - 6, 1.5, "#2a2010")
  ellipse(ctx, cx, cy + 8, 6, 3, "#4d7a38")
}

function drawCat(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 4, 14, 9, "#6b5a4a")
  circle(ctx, cx + 10, cy - 4, 8, "#7a6858")
  tri(ctx, cx + 4, cy - 10, cx + 2, cy - 18, cx + 10, cy - 10, "#6b5a4a")
  tri(ctx, cx + 12, cy - 10, cx + 20, cy - 18, cx + 16, cy - 10, "#6b5a4a")
  ellipse(ctx, cx - 14, cy + 2, 8, 3, "#6b5a4a")
  circle(ctx, cx + 12, cy - 6, 1.6, "#2a2010")
}

function drawOwl(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 4, 14, 14, "#8a6b3a")
  circle(ctx, cx - 6, cy - 2, 6, "#f4e8c8")
  circle(ctx, cx + 6, cy - 2, 6, "#f4e8c8")
  circle(ctx, cx - 6, cy - 2, 2.4, "#2a2010")
  circle(ctx, cx + 6, cy - 2, 2.4, "#2a2010")
  tri(ctx, cx, cy + 2, cx - 4, cy + 8, cx + 4, cy + 8, "#c47a3a")
  tri(ctx, cx - 10, cy - 14, cx - 4, cy - 8, cx - 12, cy - 6, "#6a4a28")
  tri(ctx, cx + 10, cy - 14, cx + 4, cy - 8, cx + 12, cy - 6, "#6a4a28")
}

function drawGoat(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 2, cy + 6, 16, 12, "#d6c4a8")
  circle(ctx, cx + 14, cy - 4, 9, "#e0d0b4")
  tri(ctx, cx + 8, cy - 12, cx + 4, cy - 24, cx + 12, cy - 10, "#c8b090")
  tri(ctx, cx + 16, cy - 12, cx + 24, cy - 24, cx + 18, cy - 10, "#c8b090")
  ellipse(ctx, cx + 16, cy + 6, 3, 6, "#c8b090")
  circle(ctx, cx + 16, cy - 6, 1.6, "#2a2010")
}

function drawBoar(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 18, 11, "#6a4530")
  circle(ctx, cx + 14, cy, 8, "#7a5540")
  tri(ctx, cx + 18, cy + 2, cx + 26, cy - 2, cx + 18, cy + 6, "#f4e8d0")
  tri(ctx, cx + 18, cy + 4, cx + 26, cy + 8, cx + 16, cy + 8, "#f4e8d0")
  circle(ctx, cx + 16, cy - 4, 1.6, "#2a2010")
  ellipse(ctx, cx - 10, cy - 6, 4, 6, "#5a3828")
}

function drawTortoise(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy, 16, 11, "#6d8a55")
  ellipse(ctx, cx, cy, 12, 8, "#8aa86a")
  ctx.strokeStyle = "#556844"
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(cx - 8, cy)
  ctx.lineTo(cx + 8, cy)
  ctx.moveTo(cx, cy - 6)
  ctx.lineTo(cx, cy + 6)
  ctx.stroke()
  ellipse(ctx, cx + 16, cy + 2, 6, 4, "#7a9858")
  circle(ctx, cx + 18, cy, 1.4, "#2a2010")
  ellipse(ctx, cx - 14, cy + 4, 4, 3, "#6d8a55")
}

function drawCarp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 18, 8, "#3a4a58")
  ellipse(ctx, cx + 2, cy, 16, 6, "#7a8a6a")
  ellipse(ctx, cx + 4, cy + 4, 12, 4, "#d8c4a0")
  tri(ctx, cx - 18, cy, cx - 28, cy - 8, cx - 24, cy + 6, "#4a5a48")
  circle(ctx, cx + 12, cy - 1, 1.6, "#1a2018")
}

function drawDew(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 4, 6, 8, "#9fd4e8")
  ellipse(ctx, cx, cy + 2, 4, 6, "#d8f4ff")
  circle(ctx, cx - 2, cy - 2, 1.6, "#ffffff")
}

function drawFrostHare(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 6, 14, 9, "#e8eef4")
  circle(ctx, cx + 10, cy - 2, 7, "#f4f8fc")
  ellipse(ctx, cx + 4, cy - 10, 3, 8, "#d8e0e8")
  ellipse(ctx, cx + 12, cy - 10, 3, 8, "#d8e0e8")
  ellipse(ctx, cx - 12, cy + 4, 7, 3, "#e8eef4")
  circle(ctx, cx + 12, cy - 4, 1.5, "#2a2010")
}

function drawMoth(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 9, cy, 11, 7, "#f0a048")
  ellipse(ctx, cx + 9, cy, 11, 7, "#f0a048")
  ellipse(ctx, cx - 8, cy - 1, 7, 4, "#ffe08a")
  ellipse(ctx, cx + 8, cy - 1, 7, 4, "#ffe08a")
  ellipse(ctx, cx, cy + 2, 5, 4, "#6a3a24")
  circle(ctx, cx + 2, cy, 1.4, "#2a2010")
}

function drawSparkler(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#6a4a32"
  ctx.fillRect(cx - 1.5, cy + 2, 3, 12)
  circle(ctx, cx, cy - 4, 5, "#f0c060")
  circle(ctx, cx - 3, cy - 8, 2, "#ffe08a")
  circle(ctx, cx + 4, cy - 6, 1.6, "#ffd070")
  circle(ctx, cx, cy - 10, 1.4, "#fff4c8")
}

function drawBees(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 8, cy, 7, 5, "#f0d060")
  ellipse(ctx, cx + 8, cy - 4, 6, 4, "#f0d060")
  ctx.fillStyle = "#2a2010"
  ctx.fillRect(cx - 12, cy - 2, 8, 2)
  ctx.fillRect(cx + 4, cy - 6, 8, 2)
  ellipse(ctx, cx - 8, cy - 8, 6, 4, "#f4f8ff")
  ellipse(ctx, cx + 10, cy - 12, 5, 3, "#f4f8ff")
}

function drawCarrot(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  tri(ctx, cx, cy - 10, cx - 8, cy + 14, cx + 8, cy + 14, "#e8822c")
  tri(ctx, cx, cy - 4, cx - 4, cy + 12, cx + 4, cy + 12, "#f0a050")
  ellipse(ctx, cx - 4, cy - 12, 4, 5, "#4d8f3d")
  ellipse(ctx, cx + 4, cy - 12, 4, 5, "#4d8f3d")
}

function drawMooncake(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  circle(ctx, cx, cy, 12, "#d4a017")
  circle(ctx, cx, cy, 8, "#f0d078")
  circle(ctx, cx, cy, 3, "#b8860b")
}

function drawBlossom(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    ellipse(ctx, cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 5, 4, "#f2d4e8")
  }
  circle(ctx, cx, cy, 3, "#e2b84a")
}

function drawSeed(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 6, 9, "#6b4a1e")
  ellipse(ctx, cx - 1, cy, 4, 6, "#8a6230")
  circle(ctx, cx + 2, cy - 2, 1.5, "#e2b84a")
}

function drawLantern(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#6a4a32"
  ctx.fillRect(cx - 2, cy - 16, 4, 6)
  ellipse(ctx, cx, cy + 2, 9, 12, "#f08a3a")
  ellipse(ctx, cx, cy, 6, 8, "#ffe08a")
  ctx.fillStyle = "#6a4a32"
  ctx.fillRect(cx - 8, cy - 10, 16, 3)
  ctx.fillRect(cx - 7, cy + 12, 14, 3)
}

function drawHan(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 22, 30, 48, "#9eb0c4")
  ellipse(ctx, cx, cy + 26, 12, 20, "#4a6078")
  ellipse(ctx, cx, cy + 26, 6, 12, "#d8f0ff")
  ctx.fillStyle = "#6e7c90"
  ctx.fillRect(cx - 24, cy - 6, 48, 12)
  ctx.fillRect(cx - 20, cy + 10, 40, 10)
  ctx.fillStyle = "#c8d0d8"
  ctx.fillRect(cx - 22, cy - 8, 8, 28)
  ctx.fillRect(cx + 14, cy - 8, 8, 28)
  ellipse(ctx, cx, cy - 16, 20, 18, "#d0d8e0")
  ctx.fillStyle = "#5a6878"
  ctx.fillRect(cx - 22, cy - 28, 44, 16)
  ctx.fillRect(cx - 16, cy - 36, 32, 10)
  circle(ctx, cx - 7, cy - 14, 3.5, "#0e2438")
  circle(ctx, cx + 7, cy - 14, 3.5, "#0e2438")
  circle(ctx, cx - 7, cy - 14, 1.4, "#b8ecff")
  circle(ctx, cx + 7, cy - 14, 1.4, "#b8ecff")
  ctx.fillStyle = "#8a98a8"
  ctx.fillRect(cx - 3, cy - 48, 6, 14)
  circle(ctx, cx + 4, cy - 58, 14, "#f4f8ff")
  circle(ctx, cx - 6, cy - 58, 11, "#151b2e")
  ellipse(ctx, cx - 12, cy + 58, 8, 12, "#8aa0b4")
  ellipse(ctx, cx + 12, cy + 58, 8, 12, "#8aa0b4")
}

function drawGroundMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#6a7076"
  ctx.fillRect(cx - 32, cy - 32, 64, 64)
  ctx.fillStyle = "#7a8086"
  ctx.fillRect(cx - 32, cy - 32, 64, 12)
  ellipse(ctx, cx - 10, cy + 4, 6, 4, "#5c6268")
  ellipse(ctx, cx + 14, cy + 12, 8, 5, "#5a6066")
  ellipse(ctx, cx - 18, cy + 18, 4, 3, "#4e545a")
  ctx.fillStyle = "#8a9096"
  ctx.fillRect(cx - 32, cy - 32, 64, 3)
}

function drawHedgeMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#4a5056"
  ctx.fillRect(cx - 12, cy - 28, 24, 56)
  ctx.fillStyle = "#5a6068"
  ctx.fillRect(cx - 10, cy - 24, 20, 48)
  ellipse(ctx, cx, cy - 26, 14, 10, "#6a7078")
  ellipse(ctx, cx - 4, cy + 4, 3, 4, "#3a4046")
  ellipse(ctx, cx + 5, cy + 14, 4, 3, "#3e444a")
}

function drawRim(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#6a6e72"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 4, 30, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#8a8e92"
  ctx.beginPath()
  ctx.ellipse(cx, cy - 2, 28, 5, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#4a4e52"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 2, 18, 4, 0, 0, Math.PI)
  ctx.fill()
}

function drawBowl(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#3a3e44"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 4, 28, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#4a4e54"
  ctx.beginPath()
  ctx.ellipse(cx, cy, 26, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#2a2e34"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 2, 16, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#c4b8a8"
  ctx.beginPath()
  ctx.ellipse(cx - 8, cy - 4, 4, 2, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawWound(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#5a5248"
  ctx.fillRect(cx - 32, cy - 8, 64, 16)
  ctx.fillStyle = "#6a6258"
  ctx.fillRect(cx - 32, cy - 8, 64, 5)
  ctx.fillStyle = "#d4b05a"
  ctx.beginPath()
  ctx.moveTo(cx - 18, cy - 2)
  ctx.quadraticCurveTo(cx, cy + 6, cx + 20, cy - 4)
  ctx.quadraticCurveTo(cx, cy + 2, cx - 18, cy - 2)
  ctx.fill()
}

function drawCave(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#2a3038"
  ctx.fillRect(cx - 32, cy - 32, 64, 64)
  ctx.fillStyle = "#3a4248"
  ellipse(ctx, cx - 8, cy, 18, 22, "#3a4248")
  ellipse(ctx, cx + 12, cy + 8, 14, 16, "#323840")
  ctx.fillStyle = "#12161c"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 6, 16, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#4a5258"
  ctx.fillRect(cx - 32, cy - 32, 64, 8)
}

function drawSkyMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 128
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  const grad = ctx.createLinearGradient(0, y0, 0, y0 + h)
  grad.addColorStop(0, "#0c1016")
  grad.addColorStop(1, "#1c222c")
  ctx.fillStyle = grad
  ctx.fillRect(x0, y0, w, h)
  const stars: [number, number, number][] = [
    [18, 16, 1.2],
    [46, 40, 0.8],
    [80, 22, 1.4],
    [112, 54, 0.7],
    [148, 18, 1.1],
    [176, 44, 0.9],
    [208, 28, 1.3],
    [232, 60, 0.8],
    [64, 72, 0.6],
    [196, 80, 0.7],
  ]
  for (const [sx, sy, r] of stars) {
    circle(ctx, x0 + sx, y0 + sy, r, "#e8eef6")
  }
}

function drawFarMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#1c222c"
  ctx.fillRect(x0, y0, w, h)
  ellipse(ctx, x0 + 40, y0 + 70, 50, 18, "#2a323c")
  ellipse(ctx, x0 + 130, y0 + 64, 70, 22, "#262e38")
  ellipse(ctx, x0 + 210, y0 + 72, 48, 16, "#2a323c")
  ctx.fillStyle = "#3a424c"
  ctx.beginPath()
  ctx.arc(x0 + 188, y0 + 28, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#2a323c"
  ctx.beginPath()
  ctx.arc(x0 + 182, y0 + 24, 8, 0, Math.PI * 2)
  ctx.fill()
}

function drawFarGuanghan(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#10141c"
  ctx.fillRect(x0, y0, w, h)
  ctx.fillStyle = "#2a3240"
  ctx.beginPath()
  ctx.arc(x0 + 210, y0 + 22, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#1a2028"
  ctx.fillRect(x0 + 18, y0 + 58, 70, 28)
  ctx.fillStyle = "#242c38"
  ctx.beginPath()
  ctx.moveTo(x0 + 10, y0 + 58)
  ctx.lineTo(x0 + 53, y0 + 38)
  ctx.lineTo(x0 + 96, y0 + 58)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#1c2430"
  ctx.fillRect(x0 + 96, y0 + 52, 86, 34)
  ctx.fillStyle = "#2a3442"
  ctx.beginPath()
  ctx.moveTo(x0 + 88, y0 + 52)
  ctx.lineTo(x0 + 139, y0 + 28)
  ctx.lineTo(x0 + 190, y0 + 52)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#181e28"
  ctx.fillRect(x0 + 178, y0 + 62, 64, 24)
  ctx.fillStyle = "#263040"
  ctx.beginPath()
  ctx.moveTo(x0 + 170, y0 + 62)
  ctx.lineTo(x0 + 210, y0 + 44)
  ctx.lineTo(x0 + 250, y0 + 62)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#3a4450"
  ctx.fillRect(x0 + 46, y0 + 68, 8, 18)
  ctx.fillRect(x0 + 128, y0 + 62, 8, 24)
}

function drawDust(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx + 2, cy, 24, 14, "#c4b89a")
  ellipse(ctx, cx - 4, cy - 2, 12, 8, "#e0d6c4")
  ellipse(ctx, cx + 10, cy + 4, 8, 6, "#d8d0c0")
}

function drawStarWisp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy, 16, 11, "#6a5a38")
  tri(ctx, cx, cy - 16, cx - 5, cy - 1, cx + 5, cy - 1, "#ffe08a")
  tri(ctx, cx, cy + 16, cx - 5, cy + 1, cx + 5, cy + 1, "#ffe08a")
  tri(ctx, cx - 16, cy, cx - 1, cy - 5, cx - 1, cy + 5, "#f4d070")
  tri(ctx, cx + 16, cy, cx + 1, cy - 5, cx + 1, cy + 5, "#f4d070")
  ellipse(ctx, cx, cy, 5, 5, "#fff6d0")
  circle(ctx, cx + 10, cy - 10, 2, "#fff8e0")
  circle(ctx, cx - 11, cy + 8, 1.6, "#ffe8a8")
  circle(ctx, cx + 12, cy + 6, 1.4, "#fff0c0")
}

function drawPestle(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#5a5e64"
  ctx.beginPath()
  ctx.moveTo(cx, cy - 16)
  ctx.lineTo(cx - 10, cy + 14)
  ctx.lineTo(cx + 10, cy + 14)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#8a8e94"
  ctx.beginPath()
  ctx.moveTo(cx, cy - 10)
  ctx.lineTo(cx - 5, cy + 10)
  ctx.lineTo(cx + 5, cy + 10)
  ctx.closePath()
  ctx.fill()
  ellipse(ctx, cx, cy + 14, 11, 4, "#4a4e54")
}

function drawGrit(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  circle(ctx, cx, cy, 6, "#c8d4e0")
  circle(ctx, cx - 4, cy + 3, 3, "#a8b4c0")
  circle(ctx, cx + 5, cy - 2, 2.4, "#e8eef4")
}

function drawElixir(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 7, 8, "#d4b05a")
  ellipse(ctx, cx, cy - 2, 5, 4, "#f0d080")
  circle(ctx, cx - 2, cy - 4, 1.6, "#fff4d0")
}

function drawWellSilver(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx, cy + 2, 6, 9, "#c8d8e8")
  ellipse(ctx, cx, cy - 2, 4, 5, "#e8eef4")
  circle(ctx, cx - 1, cy - 6, 1.8, "#f4f8ff")
}

function drawDashSpeck(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.strokeStyle = "#6f8f52"
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.ellipse(cx, cy, 4, 3, 0.4, 0, Math.PI * 2)
  ctx.stroke()
  ellipse(ctx, cx, cy, 2.4, 1.6, "#c5d48a")
}

function drawDashCarrot(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  tri(ctx, cx, cy - 6, cx - 4, cy + 7, cx + 4, cy + 7, "#e8822c")
  ellipse(ctx, cx - 2, cy - 7, 2, 3, "#4d8f3d")
  ellipse(ctx, cx + 2, cy - 7, 2, 3, "#4d8f3d")
}

function drawDashStreak(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.strokeStyle = "#c8dcec"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 10, cy + 2)
  ctx.quadraticCurveTo(cx - 2, cy - 6, cx + 10, cy)
  ctx.stroke()
  ctx.strokeStyle = "#e8f4ff"
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(cx - 8, cy + 5)
  ctx.quadraticCurveTo(cx, cy - 1, cx + 8, cy + 3)
  ctx.stroke()
}

function drawDashMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  circle(ctx, cx, cy, 8, "#f7fbff")
  circle(ctx, cx + 2, cy - 1, 6.5, "#d4e4f2")
  circle(ctx, cx - 2, cy + 2, 2, "#c8d8e8")
  circle(ctx, cx + 3, cy + 3, 1.4, "#c8d8e8")
}

const DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, cx: number, cy: number) => void> = {
  story_crow: drawCrow,
  story_heron: drawHeron,
  story_magpie: drawMagpie,
  story_wisp: drawWisp,
  story_ice: drawIce,
  story_fox: drawFox,
  story_hedgehog: drawHedgehog,
  story_squirrel: drawSquirrel,
  story_frog: drawFrog,
  story_cat: drawCat,
  story_owl: drawOwl,
  story_goat: drawGoat,
  story_boar: drawBoar,
  story_tortoise: drawTortoise,
  story_bees: drawBees,
  story_carp: drawCarp,
  story_frost_hare: drawFrostHare,
  story_moth: drawMoth,
  story_carrot: drawCarrot,
  story_mooncake: drawMooncake,
  story_dew: drawDew,
  story_blossom: drawBlossom,
  story_seed: drawSeed,
  story_lantern: drawLantern,
  story_sparkler: drawSparkler,
  story_han: drawHan,
  story_ground_moon: drawGroundMoon,
  story_hedge_moon: drawHedgeMoon,
  story_rim: drawRim,
  story_bowl: drawBowl,
  story_wound: drawWound,
  story_cave: drawCave,
  story_sky_moon: drawSkyMoon,
  story_far_moon: drawFarMoon,
  story_far_guanghan: drawFarGuanghan,
  story_dust: drawDust,
  story_starwisp: drawStarWisp,
  story_pestle: drawPestle,
  story_grit: drawGrit,
  story_elixir: drawElixir,
  story_silver: drawWellSilver,
  dash_speck: drawDashSpeck,
  dash_carrot: drawDashCarrot,
  dash_streak: drawDashStreak,
  dash_crescent: drawDashMoon,
}

export function hasStamp(id: string): boolean {
  return Boolean(DRAWERS[id] && STAMP_SIZE[id])
}

export function drawStamp(ctx: CanvasRenderingContext2D, id: string, cx: number, cy: number): void {
  DRAWERS[id]?.(ctx, cx, cy)
}

export function stampCanvas(id: string): HTMLCanvasElement | null {
  const size = STAMP_SIZE[id]
  const draw = DRAWERS[id]
  if (!size || !draw) {
    return null
  }
  const canvas = document.createElement("canvas")
  canvas.width = size.w
  canvas.height = size.h
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return null
  }
  draw(ctx, size.w * 0.5, size.h * 0.5)
  return canvas
}

export function paintStampCentered(
  ctx: CanvasRenderingContext2D,
  id: string,
  width: number,
  height: number,
  scale = 2,
): void {
  if (!DRAWERS[id]) {
    return
  }
  ctx.save()
  ctx.translate(width * 0.5, height * 0.58)
  ctx.scale(scale, scale)
  DRAWERS[id](ctx, 0, 0)
  ctx.restore()
}

export function listStoryStampIds(): string[] {
  return Object.keys(STAMP_SIZE).filter((id) => id.startsWith("story_"))
}

export function listDashStampIds(): string[] {
  return Object.keys(STAMP_SIZE).filter((id) => id.startsWith("dash_"))
}
