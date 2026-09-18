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
  story_carrot: { w: 24, h: 32 },
  story_mooncake: { w: 28, h: 28 },
  story_blossom: { w: 28, h: 28 },
  story_lantern: { w: 24, h: 36 },
  story_han: { w: 80, h: 120 },
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
  ellipse(ctx, cx + 2, cy, 24, 15, "#d8ecff")
  ellipse(ctx, cx - 2, cy - 2, 11, 8, "#f4fbff")
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
  ellipse(ctx, cx, cy + 14, 26, 42, "#b8c8d8")
  ellipse(ctx, cx, cy + 18, 14, 22, "#6a8098")
  ellipse(ctx, cx, cy + 18, 8, 14, "#d8e8f4")
  ctx.fillStyle = "#8a9aac"
  ctx.fillRect(cx - 18, cy - 2, 36, 10)
  ctx.fillRect(cx - 16, cy + 12, 32, 8)
  ellipse(ctx, cx, cy - 18, 18, 16, "#c8d4e0")
  ctx.fillStyle = "#6a7888"
  ctx.beginPath()
  ctx.ellipse(cx, cy - 22, 20, 12, 0, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(cx - 20, cy - 24, 40, 8)
  circle(ctx, cx - 7, cy - 16, 3, "#1a3048")
  circle(ctx, cx + 7, cy - 16, 3, "#1a3048")
  circle(ctx, cx - 7, cy - 16, 1.2, "#c8e8ff")
  circle(ctx, cx + 7, cy - 16, 1.2, "#c8e8ff")
  circle(ctx, cx + 2, cy - 38, 10, "#f4f8ff")
  circle(ctx, cx - 2, cy - 38, 8, "#151b2e")
  ellipse(ctx, cx - 10, cy + 44, 6, 10, "#a8b8c8")
  ellipse(ctx, cx + 10, cy + 44, 6, 10, "#a8b8c8")
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
  story_carrot: drawCarrot,
  story_mooncake: drawMooncake,
  story_blossom: drawBlossom,
  story_lantern: drawLantern,
  story_han: drawHan,
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
