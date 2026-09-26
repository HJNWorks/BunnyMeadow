export type StampSize = { w: number; h: number }

export const STAMP_SIZE: Record<string, StampSize> = {
  story_crow: { w: 36, h: 28 },
  story_heron: { w: 64, h: 48 },
  story_heron_up: { w: 64, h: 48 },
  story_heron_lock: { w: 88, h: 40 },
  story_heron_sweep: { w: 72, h: 36 },
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
  story_boar_step: { w: 52, h: 32 },
  story_boar_rage: { w: 56, h: 32 },
  story_boar_run: { w: 64, h: 30 },
  story_tortoise: { w: 44, h: 28 },
  story_bees: { w: 44, h: 32 },
  story_carp: { w: 48, h: 24 },
  story_frost_hare: { w: 40, h: 32 },
  story_moth: { w: 36, h: 24 },
  story_carrot: { w: 24, h: 32 },
  story_mooncake: { w: 28, h: 28 },
  story_heartcake: { w: 28, h: 28 },
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
  story_still: { w: 96, h: 72 },
  story_still_q: { w: 64, h: 48 },
  story_still_e: { w: 40, h: 30 },
  story_still_aspect: { w: 28, h: 28 },
  story_still_portal: { w: 96, h: 72 },
  story_cave: { w: 64, h: 64 },
  story_sky_moon: { w: 256, h: 128 },
  story_far_moon: { w: 256, h: 96 },
  story_far_guanghan: { w: 256, h: 96 },
  story_dust: { w: 52, h: 36 },
  story_starwisp: { w: 52, h: 36 },
  story_pestle: { w: 32, h: 36 },
  story_pestle_big: { w: 40, h: 160 },
  story_roller: { w: 64, h: 64 },
  story_trough: { w: 64, h: 24 },
  story_mortar: { w: 64, h: 64 },
  story_screen: { w: 48, h: 160 },
  story_chime: { w: 64, h: 28 },
  story_chimeframe: { w: 96, h: 96 },
  story_moondoor: { w: 128, h: 128 },
  story_far_outer: { w: 256, h: 96 },
  story_crab: { w: 44, h: 30 },
  story_raft: { w: 96, h: 24 },
  story_crater: { w: 128, h: 48 },
  story_mast: { w: 64, h: 160 },
  story_far_dust: { w: 256, h: 96 },
  story_penghou: { w: 80, h: 56 },
  story_cut: { w: 20, h: 56 },
  story_barkchip: { w: 18, h: 10 },
  story_bark: { w: 64, h: 24 },
  story_heartwood: { w: 128, h: 128 },
  story_far_cassia: { w: 256, h: 96 },
  story_reflection: { w: 64, h: 24 },
  story_bat: { w: 48, h: 28 },
  story_stalactite: { w: 32, h: 64 },
  story_wellhead: { w: 96, h: 48 },
  story_toad: { w: 64, h: 44 },
  story_far_wells: { w: 256, h: 96 },
  story_skin: { w: 64, h: 16 },
  story_silvercarp: { w: 52, h: 26 },
  story_dewplate: { w: 48, h: 120 },
  story_far_silver: { w: 256, h: 96 },
  story_rack: { w: 64, h: 96 },
  story_far_mortar: { w: 256, h: 96 },
  story_grub: { w: 40, h: 24 },
  story_grit: { w: 24, h: 24 },
  story_elixir: { w: 24, h: 24 },
  story_silver: { w: 24, h: 28 },
  story_glide: { w: 28, h: 28 },
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

function drawHeronPose(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pose: "up" | "down" | "lock" | "sweep",
): void {
  const wing = pose === "up" ? -16 : pose === "down" ? 14 : pose === "lock" ? 0 : 8
  const reach = pose === "lock" ? 28 : pose === "sweep" ? 10 : 18
  const back = pose === "sweep" ? -14 : 0
  ellipse(ctx, cx - 6 + back, cy + wing, reach, pose === "lock" ? 5 : 7, "#d5dee6")
  ellipse(ctx, cx + 8 + back * 0.2, cy + wing * 0.35, reach * 0.7, pose === "sweep" ? 4 : 5, "#f4f7f8")
  ellipse(ctx, cx, cy + 2, 12, 5, "#e7eef3")
  ellipse(ctx, cx + 8, cy - 1, 3, pose === "sweep" ? 5 : 7, "#f7fafc")
  ellipse(ctx, cx + 14, cy - (pose === "sweep" ? 2 : 6), 4, 3, "#f7fafc")
  tri(ctx, cx + 17, cy - (pose === "sweep" ? 2 : 6), cx + 30, cy - (pose === "sweep" ? 1 : 5), cx + 17, cy - (pose === "sweep" ? 0 : 4), "#e8a040")
  const eyeY = cy - (pose === "sweep" ? 3 : 7)
  const aggro = pose === "lock" || pose === "sweep"
  if (aggro) {
    circle(ctx, cx + 14, eyeY, 2.6, "#ff4a4a")
    circle(ctx, cx + 14.6, eyeY - 0.6, 0.8, "#fff4f4")
  } else {
    circle(ctx, cx + 14, eyeY, 1.2, "#243040")
  }
}

function drawHeron(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawHeronPose(ctx, cx, cy, "down")
}

function drawHeronFlapUp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawHeronPose(ctx, cx, cy, "up")
}

function drawHeronLock(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawHeronPose(ctx, cx, cy, "lock")
}

function drawHeronSweep(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawHeronPose(ctx, cx, cy, "sweep")
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

function drawBoarPose(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pose: "idle" | "step" | "rage" | "run",
): void {
  const rage = pose === "rage"
  const run = pose === "run"
  const body = rage ? "#5c3018" : "#6b4030"
  const head = rage ? "#7a3824" : "#8a5840"
  const lean = rage ? 6 : run ? 3 : 0
  ellipse(ctx, cx - lean, cy + (rage ? 4 : 2), run ? 20 : 17, rage ? 8 : 10, body)
  if (rage || run) {
    tri(ctx, cx - 8, cy - 4, cx - 2, cy - 16, cx + 2, cy - 2, "#3e2416")
    tri(ctx, cx + 2, cy - 4, cx + 8, cy - 18, cx + 12, cy - 2, "#3e2416")
  }
  const hx = cx + (rage ? 16 : 13) - lean
  const hy = cy + (rage ? 5 : 0)
  circle(ctx, hx, hy, rage ? 9 : 8, head)
  ellipse(ctx, hx - 3, hy - 8, 3, 4, "#5a3828")
  ellipse(ctx, hx + 7, hy + 2, 5, 3, "#c4a080")
  tri(ctx, hx + 3, hy + 3, hx + 12, hy + 10, hx + 1, hy + 7, "#f4e8d0")
  tri(ctx, hx + 5, hy + 2, hx + 14, hy + 7, hx + 4, hy + 6, "#f4e8d0")
  circle(ctx, hx - 1, hy - 3, 1.7, rage ? "#c45c4a" : "#2a2010")
  const lift = pose === "step" ? 3 : 0
  ellipse(ctx, cx - 10, cy + 11 - lift, 3, 4, "#4a3020")
  ellipse(ctx, cx - 2, cy + 11, 3, 4, "#4a3020")
  ellipse(ctx, cx + 8, cy + 11 - (run ? 2 : 0), 3, 4, "#4a3020")
  ellipse(ctx, cx + 14, cy + 11 + lift, 3, 4, "#4a3020")
}

function drawBoar(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawBoarPose(ctx, cx, cy, "idle")
}

function drawBoarStep(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawBoarPose(ctx, cx, cy, "step")
}

function drawBoarRage(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawBoarPose(ctx, cx, cy, "rage")
}

function drawBoarRun(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  drawBoarPose(ctx, cx, cy, "run")
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

function drawHeartCake(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  circle(ctx, cx, cy, 12, "#c45c5c")
  circle(ctx, cx, cy, 8, "#f0a8a8")
  ctx.fillStyle = "#fff0f0"
  ctx.beginPath()
  ctx.moveTo(cx, cy + 4)
  ctx.bezierCurveTo(cx - 8, cy - 2, cx - 5, cy - 8, cx, cy - 4)
  ctx.bezierCurveTo(cx + 5, cy - 8, cx + 8, cy - 2, cx, cy + 4)
  ctx.fill()
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

function drawStill(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#3a4a58"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 10, 40, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#6a8aa0"
  ctx.beginPath()
  ctx.ellipse(cx, cy, 34, 22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#8ab0c4"
  ctx.beginPath()
  ctx.ellipse(cx - 10, cy - 14, 18, 10, -0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#b8d0e0"
  ctx.beginPath()
  ctx.ellipse(cx - 6, cy - 8, 14, 8, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#d8ecf4"
  ctx.beginPath()
  ctx.ellipse(cx + 10, cy + 4, 8, 5, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#e8f2f8"
  ctx.beginPath()
  ctx.ellipse(cx + 4, cy - 2, 5, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#9ec0d4"
  ctx.beginPath()
  ctx.ellipse(cx - 18, cy + 12, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 16, cy + 14, 3, 5, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawStillQuarter(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#3a4a58"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 8, 28, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#6a8aa0"
  ctx.beginPath()
  ctx.ellipse(cx, cy, 24, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#b8d0e0"
  ctx.beginPath()
  ctx.ellipse(cx - 4, cy - 6, 10, 6, -0.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#e8f2f8"
  ctx.beginPath()
  ctx.ellipse(cx + 3, cy - 1, 4, 4, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawStillEighth(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#4a6070"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 4, 16, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#7aa0b4"
  ctx.beginPath()
  ctx.ellipse(cx, cy, 14, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#e0f0f8"
  ctx.beginPath()
  ctx.ellipse(cx + 2, cy - 2, 3, 3, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawStillAspect(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#c8e0f0"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 2, 10, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#f0f8fc"
  ctx.beginPath()
  ctx.ellipse(cx - 2, cy - 2, 4, 5, -0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawStillPortal(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#2a3848"
  ctx.beginPath()
  ctx.ellipse(cx, cy + 8, 42, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#6a98b8"
  ctx.beginPath()
  ctx.ellipse(cx, cy, 34, 22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#d0ecf8"
  ctx.beginPath()
  ctx.ellipse(cx, cy - 4, 18, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "#f0f8fc"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, 28, 18, 0, 0, Math.PI * 2)
  ctx.stroke()
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

function drawPestleBig(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const top = cy - 80
  const bottom = cy + 80
  ellipse(ctx, cx, top + 9, 11, 9, "#8fb3a0")
  ellipse(ctx, cx - 3, top + 6, 5, 4, "#c8e0d2")
  ctx.fillStyle = "#7a9e8c"
  ctx.fillRect(cx - 6, top + 14, 12, 100)
  ctx.fillStyle = "#a8c8b6"
  ctx.fillRect(cx - 4, top + 14, 3, 100)
  ctx.fillStyle = "#5f7f70"
  ctx.fillRect(cx + 3, top + 14, 3, 100)
  ctx.fillStyle = "#7a9e8c"
  ctx.beginPath()
  ctx.moveTo(cx - 6, top + 110)
  ctx.quadraticCurveTo(cx - 19, bottom - 30, cx - 18, bottom - 10)
  ctx.lineTo(cx + 18, bottom - 10)
  ctx.quadraticCurveTo(cx + 19, bottom - 30, cx + 6, top + 110)
  ctx.closePath()
  ctx.fill()
  ellipse(ctx, cx, bottom - 10, 18, 9, "#6a8e7c")
  ellipse(ctx, cx - 8, bottom - 26, 4, 9, "#b8d6c6")
  ctx.fillStyle = "#c4b8a8"
  ctx.fillRect(cx - 17, bottom - 6, 34, 3)
  ellipse(ctx, cx - 6, bottom - 3, 3, 1.4, "#e0d8c8")
  ellipse(ctx, cx + 7, bottom - 3, 2.4, 1.2, "#d8e4dc")
}

function drawRoller(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  circle(ctx, cx, cy, 31, "#5a5e64")
  circle(ctx, cx, cy, 28, "#8a8e94")
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    circle(ctx, cx + Math.cos(a) * 25, cy + Math.sin(a) * 25, 4.2, "#9ea2a8")
  }
  circle(ctx, cx, cy, 20, "#c4b8a8")
  circle(ctx, cx, cy, 17, "#d8ccb8")
  ctx.strokeStyle = "#a8987e"
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15)
    ctx.lineTo(cx - Math.cos(a) * 15, cy - Math.sin(a) * 15)
    ctx.stroke()
  }
  circle(ctx, cx, cy, 6, "#4a4e54")
  circle(ctx, cx, cy, 3, "#2a2e34")
  ellipse(ctx, cx - 12, cy - 16, 5, 3, "#eee4d2")
}

function drawTrough(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#3a3e44"
  ctx.beginPath()
  ctx.moveTo(cx - 32, cy - 10)
  ctx.lineTo(cx + 32, cy - 10)
  ctx.lineTo(cx + 32, cy + 2)
  ctx.quadraticCurveTo(cx + 26, cy + 12, cx, cy + 12)
  ctx.quadraticCurveTo(cx - 26, cy + 12, cx - 32, cy + 2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#6a6e74"
  ctx.fillRect(cx - 32, cy - 12, 64, 5)
  ctx.fillStyle = "#22262c"
  ctx.beginPath()
  ctx.moveTo(cx - 28, cy - 7)
  ctx.lineTo(cx + 28, cy - 7)
  ctx.quadraticCurveTo(cx + 20, cy + 6, cx, cy + 6)
  ctx.quadraticCurveTo(cx - 20, cy + 6, cx - 28, cy - 7)
  ctx.closePath()
  ctx.fill()
  ellipse(ctx, cx - 10, cy + 2, 8, 2, "#c4b8a8")
  ellipse(ctx, cx + 12, cy + 1, 5, 1.6, "#d4b05a")
}

function drawMortar(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const top = cy - 32
  const bottom = cy + 32
  ctx.fillStyle = "#43474d"
  ctx.beginPath()
  ctx.moveTo(cx - 30, top + 7)
  ctx.lineTo(cx + 30, top + 7)
  ctx.lineTo(cx + 22, bottom)
  ctx.lineTo(cx - 22, bottom)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#53575e"
  ctx.beginPath()
  ctx.moveTo(cx - 30, top + 7)
  ctx.lineTo(cx - 18, top + 7)
  ctx.lineTo(cx - 13, bottom)
  ctx.lineTo(cx - 22, bottom)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#34383e"
  ctx.beginPath()
  ctx.moveTo(cx + 18, top + 7)
  ctx.lineTo(cx + 30, top + 7)
  ctx.lineTo(cx + 22, bottom)
  ctx.lineTo(cx + 13, bottom)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#3a3e44"
  ctx.fillRect(cx - 28, top + 20, 56, 3)
  ctx.fillRect(cx - 25, top + 42, 50, 2)
  ellipse(ctx, cx, top + 7, 32, 7, "#6a6e74")
  ellipse(ctx, cx, top + 6, 29, 5, "#7c8086")
  ellipse(ctx, cx, top + 7, 24, 3.6, "#24282e")
  ellipse(ctx, cx + 2, top + 8, 13, 1.8, "#c4b8a8")
  ellipse(ctx, cx - 16, top + 4, 5, 1.2, "#9a9ea4")
}

function drawScreen(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 24
  const y0 = cy - 80
  ctx.fillStyle = "#4e5866"
  ctx.fillRect(x0, y0, 48, 160)
  ctx.fillStyle = "#6c7888"
  ctx.fillRect(x0, y0, 48, 7)
  ctx.fillRect(x0, y0 + 153, 48, 7)
  ctx.fillRect(x0, y0, 5, 160)
  ctx.fillRect(x0 + 43, y0, 5, 160)
  ctx.fillStyle = "#1c222c"
  ctx.fillRect(x0 + 5, y0 + 7, 38, 146)
  ctx.strokeStyle = "#8a98aa"
  ctx.lineWidth = 2
  for (let y = y0 + 22; y < y0 + 150; y += 16) {
    ctx.beginPath()
    ctx.moveTo(x0 + 5, y)
    ctx.lineTo(x0 + 43, y)
    ctx.stroke()
  }
  for (const x of [x0 + 17, x0 + 31]) {
    ctx.beginPath()
    ctx.moveTo(x, y0 + 7)
    ctx.lineTo(x, y0 + 153)
    ctx.stroke()
  }
  circle(ctx, cx, y0 + 52, 14, "#6c7888")
  circle(ctx, cx, y0 + 52, 11, "#10141c")
  circle(ctx, cx + 3, y0 + 49, 4.5, "#c8d8e8")
  ctx.fillStyle = "#e0eef8"
  ctx.fillRect(x0 + 5, y0 + 146, 38, 3)
  ellipse(ctx, x0 + 12, y0 + 150, 5, 2, "#f0f8ff")
  ellipse(ctx, x0 + 34, y0 + 150, 6, 2, "#f0f8ff")
}

function drawChime(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 32
  const y0 = cy - 14
  ctx.fillStyle = "#6a7a84"
  ctx.beginPath()
  ctx.moveTo(x0 + 1, y0 + 8)
  ctx.lineTo(x0 + 26, y0 + 2)
  ctx.lineTo(x0 + 63, y0 + 7)
  ctx.lineTo(x0 + 61, y0 + 25)
  ctx.lineTo(x0 + 26, y0 + 20)
  ctx.lineTo(x0 + 3, y0 + 26)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#9eb2bc"
  ctx.beginPath()
  ctx.moveTo(x0 + 2, y0 + 8)
  ctx.lineTo(x0 + 26, y0 + 2)
  ctx.lineTo(x0 + 62, y0 + 7)
  ctx.lineTo(x0 + 62, y0 + 12)
  ctx.lineTo(x0 + 26, y0 + 8)
  ctx.lineTo(x0 + 2, y0 + 13)
  ctx.closePath()
  ctx.fill()
  circle(ctx, x0 + 26, y0 + 6, 2.4, "#2a323a")
  ellipse(ctx, x0 + 14, y0 + 17, 6, 1.6, "#58666e")
  ellipse(ctx, x0 + 44, y0 + 17, 7, 1.6, "#58666e")
  ellipse(ctx, x0 + 40, y0 + 9, 5, 1.2, "#d8ecf4")
}

function drawChimeFrame(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 48
  const y0 = cy - 48
  ctx.fillStyle = "#3a3430"
  ctx.fillRect(x0 + 4, y0 + 4, 88, 7)
  ctx.fillStyle = "#5a4c40"
  ctx.fillRect(x0 + 4, y0 + 4, 88, 3)
  ctx.fillStyle = "#3a3430"
  ctx.beginPath()
  ctx.arc(x0 + 6, y0 + 3, 5, Math.PI * 0.5, Math.PI * 1.6)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x0 + 90, y0 + 3, 5, -Math.PI * 0.6, Math.PI * 0.5)
  ctx.fill()
  ctx.strokeStyle = "#a89070"
  ctx.lineWidth = 1.6
  for (const x of [x0 + 34, x0 + 62]) {
    ctx.beginPath()
    ctx.moveTo(x, y0 + 11)
    ctx.lineTo(x0 + 48, y0 + 96)
    ctx.stroke()
  }
  circle(ctx, x0 + 48, y0 + 30, 2.6, "#c44a3a")
  ctx.fillStyle = "#c44a3a"
  ctx.fillRect(x0 + 47, y0 + 32, 2, 8)
}

function drawMoonDoor(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 64
  const y0 = cy - 64
  ctx.fillStyle = "#3a414c"
  ctx.fillRect(x0, y0 + 16, 128, 112)
  ctx.fillStyle = "#454d58"
  ctx.fillRect(x0, y0 + 16, 128, 6)
  ctx.fillStyle = "#262c36"
  ctx.beginPath()
  ctx.moveTo(x0 - 4, y0 + 18)
  ctx.lineTo(x0 + 10, y0 + 4)
  ctx.lineTo(x0 + 118, y0 + 4)
  ctx.lineTo(x0 + 132, y0 + 18)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#323a46"
  for (let x = x0 + 6; x < x0 + 124; x += 9) {
    ctx.fillRect(x, y0 + 8, 4, 10)
  }
  circle(ctx, cx, cy + 18, 44, "#5a6472")
  ctx.save()
  ctx.globalCompositeOperation = "destination-out"
  ctx.beginPath()
  ctx.arc(cx, cy + 18, 39, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ellipse(ctx, cx - 22, cy - 18, 10, 2, "#dce8f2")
}

function drawFarOuter(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#12161e"
  ctx.fillRect(x0, y0, w, h)
  const roof = (rx: number, ry: number, rw: number, body: string, top: string): void => {
    ctx.fillStyle = body
    ctx.fillRect(rx, ry, rw, h - (ry - y0))
    ctx.fillStyle = top
    ctx.beginPath()
    ctx.moveTo(rx - 8, ry)
    ctx.quadraticCurveTo(rx + rw * 0.5, ry - 14, rx + rw + 8, ry)
    ctx.lineTo(rx + rw + 12, ry - 3)
    ctx.lineTo(rx + rw * 0.5, ry - 20)
    ctx.lineTo(rx - 12, ry - 3)
    ctx.closePath()
    ctx.fill()
  }
  roof(x0 + 6, y0 + 50, 44, "#1a2029", "#222a36")
  roof(x0 + 40, y0 + 62, 36, "#181e26", "#20283330")
  roof(x0 + 70, y0 + 70, 26, "#171c24", "#1e2530")
  ctx.fillStyle = "#1c222c"
  ctx.fillRect(x0 + 90, y0 + 74, 110, 12)
  ctx.fillStyle = "#232a36"
  ctx.fillRect(x0 + 88, y0 + 71, 114, 4)
  for (const dx of [112, 150, 186]) {
    ctx.fillStyle = "#12161e"
    ctx.beginPath()
    ctx.arc(x0 + dx, y0 + 80, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ellipse(ctx, x0 + 200, y0 + 90, 70, 8, "#1e242e")
  ctx.fillStyle = "#1e2530"
  ctx.fillRect(x0 + 229, y0 + 58, 3, 24)
  ellipse(ctx, x0 + 230, y0 + 52, 14, 10, "#222a34")
  ellipse(ctx, x0 + 224, y0 + 56, 8, 6, "#2a2a24")
  circle(ctx, x0 + 236, y0 + 48, 1.4, "#8a7a4a")
  circle(ctx, x0 + 220, y0 + 22, 1, "#c8d0d8")
  circle(ctx, x0 + 130, y0 + 14, 1.1, "#c8d0d8")
  circle(ctx, x0 + 60, y0 + 20, 0.9, "#c8d0d8")
}

function drawCrab(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.strokeStyle = "#6a665e"
  ctx.lineWidth = 2
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath()
      ctx.moveTo(cx + side * 8, cy + 3 + i * 2)
      ctx.lineTo(cx + side * (15 + i * 2), cy + 5 + i * 2)
      ctx.lineTo(cx + side * (18 + i * 2), cy + 13)
      ctx.stroke()
    }
  }
  ellipse(ctx, cx - 17, cy - 3, 5, 4, "#8a857a")
  ellipse(ctx, cx + 17, cy - 3, 5, 4, "#8a857a")
  ellipse(ctx, cx - 19, cy - 5, 2, 1.4, "#b8b2a4")
  ellipse(ctx, cx + 19, cy - 5, 2, 1.4, "#b8b2a4")
  ellipse(ctx, cx, cy + 2, 14, 9, "#8a857a")
  ellipse(ctx, cx, cy, 13, 7, "#a8a294")
  ellipse(ctx, cx, cy - 1, 8, 4, "#c8c2b2")
  ellipse(ctx, cx, cy - 0.5, 5.5, 2.4, "#7a7568")
  ctx.fillStyle = "#6a665e"
  ctx.fillRect(cx - 5, cy - 11, 1.6, 6)
  ctx.fillRect(cx + 3.4, cy - 11, 1.6, 6)
  circle(ctx, cx - 4.2, cy - 11, 2, "#1e1c18")
  circle(ctx, cx + 4.2, cy - 11, 2, "#1e1c18")
  circle(ctx, cx - 3.6, cy - 11.6, 0.7, "#f0ece0")
  circle(ctx, cx + 4.8, cy - 11.6, 0.7, "#f0ece0")
}

function drawRaft(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 48
  const y0 = cy - 12
  ctx.fillStyle = "#4a3e32"
  ctx.fillRect(x0, y0 + 6, 96, 18)
  const planks = ["#7a6a56", "#6e604e", "#84735c"]
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = planks[i]!
    ctx.fillRect(x0 + 1, y0 + 2 + i * 6, 94, 5)
  }
  ctx.fillStyle = "#9a8a70"
  ctx.fillRect(x0 + 1, y0 + 2, 94, 1.5)
  ctx.fillStyle = "#c8b890"
  for (const bx of [14, 46, 78]) {
    ctx.fillRect(x0 + bx, y0 + 1, 4, 20)
    ctx.fillStyle = "#8a7a58"
    ctx.fillRect(x0 + bx + 1, y0 + 1, 1, 20)
    ctx.fillStyle = "#c8b890"
  }
  for (const sx of [30, 62]) {
    circle(ctx, x0 + sx, y0 + 5, 1.8, "#f0e4a8")
  }
  ctx.fillStyle = "#3a3028"
  ctx.fillRect(x0 + 22, y0 + 14, 10, 1)
  ctx.fillRect(x0 + 58, y0 + 9, 12, 1)
}

function drawCrater(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 64
  const y0 = cy - 24
  ctx.fillStyle = "#3a3c42"
  ctx.beginPath()
  ctx.moveTo(x0, y0 + 48)
  ctx.lineTo(x0, y0 + 14)
  ctx.quadraticCurveTo(x0 + 8, y0 + 2, x0 + 18, y0 + 8)
  ctx.quadraticCurveTo(x0 + 64, y0 + 52, x0 + 110, y0 + 8)
  ctx.quadraticCurveTo(x0 + 120, y0 + 2, x0 + 128, y0 + 14)
  ctx.lineTo(x0 + 128, y0 + 48)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = "#6a6c72"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x0 + 2, y0 + 12)
  ctx.quadraticCurveTo(x0 + 9, y0 + 3, x0 + 18, y0 + 8)
  ctx.moveTo(x0 + 110, y0 + 8)
  ctx.quadraticCurveTo(x0 + 119, y0 + 3, x0 + 126, y0 + 12)
  ctx.stroke()
  ctx.fillStyle = "#26282e"
  ctx.beginPath()
  ctx.moveTo(x0 + 22, y0 + 12)
  ctx.quadraticCurveTo(x0 + 64, y0 + 50, x0 + 106, y0 + 12)
  ctx.quadraticCurveTo(x0 + 64, y0 + 38, x0 + 22, y0 + 12)
  ctx.fill()
  ellipse(ctx, cx, y0 + 34, 26, 4, "#8a857a")
  ellipse(ctx, cx - 30, y0 + 40, 3, 1.4, "#55575c")
  ellipse(ctx, cx + 34, y0 + 42, 4, 1.6, "#55575c")
}

function drawMast(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 32
  const y0 = cy - 80
  ctx.save()
  ctx.translate(x0 + 44, y0 + 160)
  ctx.rotate(-0.12)
  ctx.fillStyle = "#5e5042"
  ctx.fillRect(-3, -150, 6, 150)
  ctx.fillStyle = "#7a6a56"
  ctx.fillRect(-3, -150, 2, 150)
  ctx.fillStyle = "#5e5042"
  ctx.fillRect(-24, -128, 50, 4)
  ctx.fillStyle = "#cfc8b4"
  ctx.beginPath()
  ctx.moveTo(-22, -124)
  ctx.lineTo(24, -124)
  ctx.lineTo(20, -96)
  ctx.lineTo(12, -100)
  ctx.lineTo(6, -84)
  ctx.lineTo(-4, -92)
  ctx.lineTo(-12, -80)
  ctx.lineTo(-20, -96)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#a8a08c"
  ctx.fillRect(-18, -118, 36, 1.4)
  ctx.fillRect(-14, -108, 28, 1.4)
  circle(ctx, 6, -114, 3, "#16181c")
  ctx.strokeStyle = "#8a7a58"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(24, -126)
  ctx.lineTo(26, -110)
  ctx.stroke()
  ctx.fillStyle = "#e8d890"
  ctx.beginPath()
  const lx = 26
  const ly = -104
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? 6 : 2.6
    const px = lx + Math.cos(a) * r
    const py = ly + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  circle(ctx, lx, ly, 1.6, "#fff8d8")
  ctx.restore()
}

function drawFarDust(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#15171c"
  ctx.fillRect(x0, y0, w, h)
  // The Silver River (天河) across the sky, the raft's old road.
  ctx.save()
  ctx.translate(x0, y0)
  ctx.rotate(-0.18)
  ctx.fillStyle = "rgba(200, 208, 224, 0.07)"
  ctx.fillRect(-20, 30, 300, 22)
  ctx.fillStyle = "rgba(210, 218, 232, 0.1)"
  ctx.fillRect(-20, 36, 300, 9)
  let seed = 7
  for (let i = 0; i < 70; i += 1) {
    seed = (seed * 9301 + 49297) % 233280
    const px = (seed / 233280) * 280 - 10
    seed = (seed * 9301 + 49297) % 233280
    const py = 30 + (seed / 233280) * 22
    circle(ctx, px, py, i % 7 === 0 ? 1 : 0.5, "#d8e0ec")
  }
  ctx.restore()
  const rim = (rx: number, rw: number, top: number, color: string): void => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(rx, y0 + h)
    ctx.lineTo(rx, top + 6)
    ctx.quadraticCurveTo(rx + 6, top - 2, rx + 12, top + 3)
    ctx.quadraticCurveTo(rx + rw / 2, top + 14, rx + rw - 12, top + 3)
    ctx.quadraticCurveTo(rx + rw - 6, top - 2, rx + rw, top + 6)
    ctx.lineTo(rx + rw, y0 + h)
    ctx.closePath()
    ctx.fill()
  }
  rim(x0 - 10, 110, y0 + 66, "#1c1f25")
  rim(x0 + 88, 90, y0 + 72, "#1a1d22")
  rim(x0 + 170, 96, y0 + 64, "#1d2026")
  ctx.fillStyle = "#2a2622"
  ctx.fillRect(x0 + 196, y0 + 62, 22, 3)
  ctx.save()
  ctx.translate(x0 + 206, y0 + 62)
  ctx.rotate(-0.2)
  ctx.fillRect(-1, -16, 2, 16)
  ctx.restore()
  circle(ctx, x0 + 210, y0 + 48, 1.3, "#d8c880")
}

function drawPenghou(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Tailless dog of dark bark with a pale carved face (Soushen ji: 人面狗身, 無尾).
  ctx.fillStyle = "#2e2620"
  for (const lx of [-20, -10, 10, 20]) {
    ctx.fillRect(cx + lx - 3, cy + 8, 6, 16)
  }
  ellipse(ctx, cx - 4, cy + 4, 26, 13, "#3a3028")
  ellipse(ctx, cx - 8, cy, 20, 9, "#4a3c30")
  ctx.strokeStyle = "#2a221c"
  ctx.lineWidth = 1.4
  for (const bx of [-22, -12, -2]) {
    ctx.beginPath()
    ctx.moveTo(cx + bx, cy - 6)
    ctx.quadraticCurveTo(cx + bx + 3, cy + 4, cx + bx, cy + 14)
    ctx.stroke()
  }
  ctx.strokeStyle = "#d4b05a"
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(cx - 16, cy - 4)
  ctx.quadraticCurveTo(cx - 10, cy + 2, cx - 14, cy + 8)
  ctx.stroke()
  circle(ctx, cx - 18, cy - 10, 2.2, "#f0d27a")
  circle(ctx, cx - 8, cy - 11, 1.8, "#f6e0a0")
  circle(ctx, cx - 26, cy - 6, 1.6, "#f0d27a")
  ellipse(ctx, cx + 20, cy - 8, 13, 12, "#3a3028")
  ctx.fillStyle = "#3a3028"
  ctx.beginPath()
  ctx.moveTo(cx + 12, cy - 16)
  ctx.lineTo(cx + 14, cy - 26)
  ctx.lineTo(cx + 19, cy - 17)
  ctx.moveTo(cx + 24, cy - 17)
  ctx.lineTo(cx + 29, cy - 26)
  ctx.lineTo(cx + 30, cy - 14)
  ctx.fill()
  ellipse(ctx, cx + 22, cy - 6, 9, 9, "#e8dcc4")
  ellipse(ctx, cx + 22, cy - 4, 7, 6, "#f4ecd8")
  ellipse(ctx, cx + 19, cy - 8, 1.9, 1.5, "#d49a2a")
  ellipse(ctx, cx + 25, cy - 8, 1.9, 1.5, "#d49a2a")
  circle(ctx, cx + 19, cy - 8.2, 0.7, "#fff4c8")
  circle(ctx, cx + 25, cy - 8.2, 0.7, "#fff4c8")
  ctx.strokeStyle = "#8a7a60"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx + 20, cy - 1)
  ctx.quadraticCurveTo(cx + 22, cy + 1, cx + 24, cy - 1)
  ctx.stroke()
}

function drawCut(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#6a4a1a"
  ctx.beginPath()
  ctx.moveTo(cx, cy - 27)
  ctx.quadraticCurveTo(cx + 9, cy, cx, cy + 27)
  ctx.quadraticCurveTo(cx - 9, cy, cx, cy - 27)
  ctx.fill()
  ctx.fillStyle = "#f0c860"
  ctx.beginPath()
  ctx.moveTo(cx, cy - 22)
  ctx.quadraticCurveTo(cx + 5, cy, cx, cy + 22)
  ctx.quadraticCurveTo(cx - 5, cy, cx, cy - 22)
  ctx.fill()
  ctx.fillStyle = "#fff4c8"
  ctx.fillRect(cx - 0.8, cy - 14, 1.6, 26)
  circle(ctx, cx + 2, cy + 20, 2, "#f0c860")
}

function drawBarkChip(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#5a4a3a"
  ctx.beginPath()
  ctx.moveTo(cx - 8, cy - 2)
  ctx.lineTo(cx + 7, cy - 4)
  ctx.lineTo(cx + 8, cy + 3)
  ctx.lineTo(cx - 6, cy + 4)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#d4b05a"
  ctx.fillRect(cx - 6, cy - 1, 12, 1.4)
}

function drawBark(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 32
  const y0 = cy - 12
  ctx.fillStyle = "#4a4038"
  ctx.fillRect(x0, y0, 64, 24)
  ctx.fillStyle = "#5e5246"
  ctx.fillRect(x0, y0, 64, 6)
  ctx.strokeStyle = "#3a322a"
  ctx.lineWidth = 1.2
  for (const y of [10, 16, 20]) {
    ctx.beginPath()
    ctx.moveTo(x0 + 2, y0 + y)
    ctx.quadraticCurveTo(x0 + 30, y0 + y - 2, x0 + 54, y0 + y)
    ctx.stroke()
  }
  ctx.fillStyle = "#d4b05a"
  ctx.fillRect(x0 + 58, y0 + 1, 6, 22)
  ctx.fillStyle = "#f6e0a0"
  ctx.fillRect(x0 + 61, y0 + 3, 2, 18)
}

function drawHeartwood(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x0 = cx - 64
  const y0 = cy - 64
  ctx.fillStyle = "#3a2c1c"
  ctx.fillRect(x0, y0, 128, 128)
  const rings = ["#4a3822", "#56422a", "#4a3822", "#624c30", "#5a4428", "#6e5634", "#7a6038"]
  for (let i = 0; i < rings.length; i += 1) {
    const r = 70 - i * 10
    ellipse(ctx, cx, cy + 8, r, r * 0.92, rings[i]!)
  }
  ellipse(ctx, cx, cy + 8, 6, 6, "#c89a48")
  ctx.strokeStyle = "rgba(240, 200, 96, 0.35)"
  ctx.lineWidth = 1
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy + 8)
    ctx.lineTo(cx + Math.cos(a) * 66, cy + 8 + Math.sin(a) * 60)
    ctx.stroke()
  }
}

function drawFarCassia(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#121418"
  ctx.fillRect(x0, y0, w, h)
  ctx.fillStyle = "#1e1c1a"
  ctx.beginPath()
  ctx.moveTo(x0 + 96, y0 + h)
  ctx.quadraticCurveTo(x0 + 110, y0 + 50, x0 + 104, y0 + 20)
  ctx.lineTo(x0 + 150, y0 + 20)
  ctx.quadraticCurveTo(x0 + 144, y0 + 50, x0 + 164, y0 + h)
  ctx.closePath()
  ctx.fill()
  ellipse(ctx, x0 + 128, y0 + 18, 70, 22, "#1c1e1c")
  ellipse(ctx, x0 + 92, y0 + 26, 34, 14, "#1a1c1a")
  ellipse(ctx, x0 + 170, y0 + 24, 36, 14, "#1a1c1a")
  for (let i = 0; i < 14; i += 1) {
    circle(ctx, x0 + 70 + ((i * 37) % 120), y0 + 10 + ((i * 17) % 26), 1, "#8a7a48")
  }
  ctx.strokeStyle = "#d4b05a"
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(x0 + 150, y0 + 70)
  ctx.lineTo(x0 + 156, y0 + 78)
  ctx.stroke()
  // Wu Gang, far and small, axe raised. Never closer than this.
  ctx.fillStyle = "#2a2a2c"
  ellipse(ctx, x0 + 176, y0 + 74, 3, 3, "#2a2a2c")
  ctx.fillRect(x0 + 174, y0 + 77, 4, 10)
  ctx.fillRect(x0 + 173, y0 + 87, 2, 6)
  ctx.fillRect(x0 + 177, y0 + 87, 2, 6)
  ctx.save()
  ctx.translate(x0 + 175, y0 + 78)
  ctx.rotate(-0.9)
  ctx.fillRect(-1, -12, 2, 12)
  ctx.fillRect(-4, -14, 6, 3)
  ctx.restore()
}

function drawReflection(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Mimics a lunar pad top. The only tell is a faint silver line along the lower edge.
  const x0 = cx - 32
  const y0 = cy - 12
  ctx.fillStyle = "#6a7076"
  ctx.fillRect(x0, y0, 64, 24)
  ctx.fillStyle = "#3a4248"
  ctx.fillRect(x0, y0, 64, 12)
  ellipse(ctx, x0 + 20, y0 + 17, 5, 3, "#5c6268")
  ellipse(ctx, x0 + 46, y0 + 19, 6, 3, "#5a6066")
  ctx.fillStyle = "rgba(200, 220, 240, 0.35)"
  ctx.fillRect(x0 + 4, y0 + 22, 56, 1)
}

function drawBat(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Silver cave bat. Bats are 福 (fortune) in Chinese symbolism.
  const wing = (side: number): void => {
    ctx.fillStyle = "#5a6474"
    ctx.beginPath()
    ctx.moveTo(cx + side * 4, cy - 2)
    ctx.quadraticCurveTo(cx + side * 14, cy - 12, cx + side * 23, cy - 6)
    ctx.lineTo(cx + side * 19, cy + 1)
    ctx.lineTo(cx + side * 15, cy - 1)
    ctx.lineTo(cx + side * 11, cy + 4)
    ctx.lineTo(cx + side * 7, cy + 2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "#c8d6e4"
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(cx + side * 5, cy - 3)
    ctx.quadraticCurveTo(cx + side * 14, cy - 11, cx + side * 22, cy - 6)
    ctx.stroke()
  }
  wing(-1)
  wing(1)
  ellipse(ctx, cx, cy, 6, 7, "#6a7484")
  ellipse(ctx, cx, cy - 1, 4, 4, "#8a96a6")
  ctx.fillStyle = "#6a7484"
  ctx.beginPath()
  ctx.moveTo(cx - 4, cy - 5)
  ctx.lineTo(cx - 3, cy - 11)
  ctx.lineTo(cx - 1, cy - 5)
  ctx.moveTo(cx + 1, cy - 5)
  ctx.lineTo(cx + 3, cy - 11)
  ctx.lineTo(cx + 4, cy - 5)
  ctx.fill()
  circle(ctx, cx - 1.8, cy - 2, 1.1, "#e8f2fc")
  circle(ctx, cx + 1.8, cy - 2, 1.1, "#e8f2fc")
}

function drawStalactite(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const top = cy - 32
  ctx.fillStyle = "#2a3038"
  ctx.beginPath()
  ctx.moveTo(cx - 16, top)
  ctx.lineTo(cx + 16, top)
  ctx.lineTo(cx + 4, top + 44)
  ctx.lineTo(cx, top + 64)
  ctx.lineTo(cx - 5, top + 40)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#3a424a"
  ctx.beginPath()
  ctx.moveTo(cx - 14, top)
  ctx.lineTo(cx - 4, top)
  ctx.lineTo(cx - 3, top + 38)
  ctx.closePath()
  ctx.fill()
  circle(ctx, cx, top + 62, 1.8, "#c8d8e8")
}

function drawWellhead(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Octagonal stone well curb (井欄) seen from the side, still silver water inside.
  const x0 = cx - 48
  const y0 = cy - 24
  ctx.fillStyle = "#3e464e"
  ctx.fillRect(x0 + 4, y0 + 14, 88, 34)
  ctx.fillStyle = "#4e5760"
  for (const bx of [8, 30, 52, 74]) {
    ctx.fillRect(x0 + bx, y0 + 16, 16, 30)
  }
  ctx.fillStyle = "#58626c"
  ctx.fillRect(x0, y0 + 8, 96, 8)
  ellipse(ctx, cx, y0 + 10, 44, 6, "#626c76")
  ellipse(ctx, cx, y0 + 10, 36, 4, "#141a22")
  ellipse(ctx, cx + 4, y0 + 10, 16, 1.6, "#c8d8e8")
  ctx.strokeStyle = "#2e343a"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x0 + 12, y0 + 30)
  ctx.lineTo(x0 + 84, y0 + 30)
  ctx.stroke()
}

function drawToad(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Three-legged moon toad (蟾蜍). Background only.
  ellipse(ctx, cx, cy + 6, 22, 14, "#6a7a5a")
  ellipse(ctx, cx - 2, cy + 2, 18, 11, "#7e8e6a")
  ellipse(ctx, cx - 8, cy - 1, 3, 2, "#9aa884")
  ellipse(ctx, cx + 6, cy + 4, 3, 2, "#9aa884")
  ellipse(ctx, cx + 3, cy - 8, 3, 2.4, "#9aa884")
  ellipse(ctx, cx + 14, cy - 8, 9, 7, "#7e8e6a")
  circle(ctx, cx + 11, cy - 13, 3.2, "#d4b05a")
  circle(ctx, cx + 18, cy - 12, 3.2, "#d4b05a")
  circle(ctx, cx + 11, cy - 13, 1.4, "#1e1e14")
  circle(ctx, cx + 18, cy - 12, 1.4, "#1e1e14")
  ctx.strokeStyle = "#3e4a32"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx + 9, cy - 5)
  ctx.quadraticCurveTo(cx + 15, cy - 3, cx + 21, cy - 6)
  ctx.stroke()
  // two front legs and one hind leg
  ellipse(ctx, cx + 12, cy + 17, 5, 3, "#5e6e4e")
  ellipse(ctx, cx + 2, cy + 18, 5, 3, "#5e6e4e")
  ellipse(ctx, cx - 16, cy + 17, 7, 3.4, "#5e6e4e")
  circle(ctx, cx - 6, cy - 16, 1.2, "#e8eef4")
}

function drawFarWells(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#0a0e12"
  ctx.fillRect(x0, y0, w, h)
  ctx.fillStyle = "#121820"
  ctx.fillRect(x0, y0, w, 26)
  for (let i = 0; i < 12; i += 1) {
    const sx = x0 + 10 + i * 21
    ctx.fillStyle = "#121820"
    ctx.beginPath()
    ctx.moveTo(sx - 6, y0 + 26)
    ctx.lineTo(sx + 6, y0 + 26)
    ctx.lineTo(sx, y0 + 34 + (i % 3) * 6)
    ctx.closePath()
    ctx.fill()
  }
  // skylights to the dust above
  ellipse(ctx, x0 + 60, y0 + 12, 12, 5, "#1e2632")
  circle(ctx, x0 + 58, y0 + 11, 0.8, "#c8d0d8")
  ellipse(ctx, x0 + 190, y0 + 10, 9, 4, "#1e2632")
  ellipse(ctx, x0 + 40, y0 + 84, 30, 6, "#1a222c")
  ellipse(ctx, x0 + 40, y0 + 84, 22, 3, "#3a4a5a")
  ellipse(ctx, x0 + 150, y0 + 88, 40, 6, "#1a222c")
  ellipse(ctx, x0 + 150, y0 + 88, 30, 3, "#3a4a5a")
  ellipse(ctx, x0 + 232, y0 + 82, 20, 5, "#1a222c")
  ellipse(ctx, x0 + 150, y0 + 88, 5, 1.2, "#c8d8e8")
}

function drawSkin(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Still silver water with a skin that holds a paw that keeps moving.
  const x0 = cx - 32
  const y0 = cy - 8
  ctx.fillStyle = "#8ea4ba"
  ctx.fillRect(x0, y0 + 4, 64, 12)
  ctx.fillStyle = "#6e849c"
  ctx.fillRect(x0, y0 + 12, 64, 4)
  ctx.fillStyle = "#d4e4f2"
  ctx.fillRect(x0, y0 + 2, 64, 3)
  ctx.fillStyle = "#f4faff"
  ctx.fillRect(x0, y0 + 2, 64, 1)
  ctx.strokeStyle = "rgba(240, 248, 255, 0.6)"
  ctx.lineWidth = 1
  for (const [x, w] of [[8, 14], [30, 10], [48, 12]] as const) {
    ctx.beginPath()
    ctx.ellipse(x0 + x, y0 + 9, w / 2, 1.6, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawSilverCarp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = "#9ab0c4"
  ctx.beginPath()
  ctx.moveTo(cx - 24, cy - 7)
  ctx.lineTo(cx - 16, cy)
  ctx.lineTo(cx - 24, cy + 7)
  ctx.closePath()
  ctx.fill()
  ellipse(ctx, cx + 2, cy, 18, 8, "#b8ccdc")
  ellipse(ctx, cx + 4, cy - 2, 14, 4, "#dce8f2")
  ctx.fillStyle = "#8aa0b4"
  ctx.beginPath()
  ctx.moveTo(cx - 2, cy - 7)
  ctx.lineTo(cx + 6, cy - 12)
  ctx.lineTo(cx + 8, cy - 6)
  ctx.closePath()
  ctx.fill()
  for (let i = 0; i < 4; i += 1) {
    ctx.strokeStyle = "rgba(120, 150, 176, 0.6)"
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(cx - 6 + i * 6, cy + 1, 3, Math.PI * 0.2, Math.PI * 0.8)
    ctx.stroke()
  }
  circle(ctx, cx + 14, cy - 2, 1.8, "#1e2632")
  ctx.strokeStyle = "#8aa0b4"
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(cx + 18, cy + 2)
  ctx.quadraticCurveTo(cx + 22, cy + 6, cx + 20, cy + 9)
  ctx.stroke()
}

function drawDewPlate(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  // Han bronze immortal holding a plate up for moon dew (承露仙人). Plate is the top.
  const top = cy - 60
  ellipse(ctx, cx, top + 5, 22, 4, "#8a6a3a")
  ellipse(ctx, cx, top + 4, 20, 2.6, "#c8a060")
  ellipse(ctx, cx + 4, top + 4, 6, 1.2, "#e8f2fc")
  ctx.fillStyle = "#6a5234"
  ctx.fillRect(cx - 9, top + 8, 4, 22)
  ctx.fillRect(cx + 5, top + 8, 4, 22)
  ellipse(ctx, cx, top + 34, 6, 6, "#7a603c")
  ctx.fillStyle = "#6a5234"
  ctx.beginPath()
  ctx.moveTo(cx - 10, top + 40)
  ctx.lineTo(cx + 10, top + 40)
  ctx.lineTo(cx + 14, top + 104)
  ctx.lineTo(cx - 14, top + 104)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#7e6444"
  ctx.fillRect(cx - 12, top + 58, 24, 3)
  ctx.fillStyle = "#4a3a26"
  ctx.fillRect(cx - 18, top + 104, 36, 16)
  ctx.fillStyle = "#5e4a30"
  ctx.fillRect(cx - 18, top + 104, 36, 3)
  ctx.strokeStyle = "rgba(160, 200, 180, 0.5)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - 6, top + 70)
  ctx.lineTo(cx - 4, top + 92)
  ctx.stroke()
  circle(ctx, cx - 2, top + 33, 0.9, "#e8f2fc")
}

function drawFarSilver(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#10141a"
  ctx.fillRect(x0, y0, w, h)
  ctx.fillStyle = "#1a2230"
  ctx.fillRect(x0, y0 + 62, w, 34)
  ctx.fillStyle = "rgba(200, 216, 232, 0.18)"
  ctx.fillRect(x0, y0 + 62, w, 1.5)
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = "rgba(200, 216, 232, 0.08)"
    ctx.fillRect(x0 + 10 + i * 27, y0 + 70 + (i % 3) * 7, 14, 1)
  }
  // The One Pool, far and quiet: a faint ring on the horizon. Never labeled.
  ctx.strokeStyle = "rgba(220, 234, 246, 0.35)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(x0 + 196, y0 + 66, 22, 4, 0, 0, Math.PI * 2)
  ctx.stroke()
  ellipse(ctx, x0 + 196, y0 + 66, 12, 2, "rgba(220, 234, 246, 0.25)")
  ellipse(ctx, x0 + 40, y0 + 64, 34, 5, "#161c24")
  ellipse(ctx, x0 + 120, y0 + 63, 20, 3, "#161c24")
  circle(ctx, x0 + 70, y0 + 16, 0.8, "#c8d0d8")
  circle(ctx, x0 + 160, y0 + 24, 0.6, "#c8d0d8")
}

function drawRack(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const top = cy - 48
  ctx.fillStyle = "#4a4038"
  ctx.fillRect(cx - 28, top + 8, 5, 88)
  ctx.fillRect(cx + 23, top + 8, 5, 88)
  ctx.fillStyle = "#5e5246"
  ctx.fillRect(cx - 31, top + 6, 62, 6)
  ctx.fillRect(cx - 29, top + 40, 58, 4)
  const bundles: [number, number, string, string][] = [
    [-16, 12, "#8a6a3a", "#d4b05a"],
    [-4, 12, "#7a8a74", "#a8b89a"],
    [9, 12, "#8a6a3a", "#d4b05a"],
    [-12, 44, "#7a8a74", "#a8b89a"],
    [3, 44, "#8a6a3a", "#c49a4a"],
    [15, 44, "#7a8a74", "#98a88c"],
  ]
  for (const [ox, oy, body, tip] of bundles) {
    ctx.fillStyle = "#3a3430"
    ctx.fillRect(cx + ox - 0.5, top + oy, 1, 5)
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.moveTo(cx + ox - 4, top + oy + 5)
    ctx.lineTo(cx + ox + 4, top + oy + 5)
    ctx.lineTo(cx + ox + 2, top + oy + 22)
    ctx.lineTo(cx + ox - 2, top + oy + 22)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#c8b890"
    ctx.fillRect(cx + ox - 4, top + oy + 8, 8, 2)
    circle(ctx, cx + ox, top + oy + 23, 2.2, tip)
  }
}

function drawFarMortar(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 256
  const h = 96
  const x0 = cx - w * 0.5
  const y0 = cy - h * 0.5
  ctx.fillStyle = "#16181c"
  ctx.fillRect(x0, y0, w, h)
  ellipse(ctx, x0 + 60, y0 + 84, 90, 16, "#1e2126")
  ellipse(ctx, x0 + 190, y0 + 86, 100, 14, "#1c1f24")
  const mortar = (mx: number, my: number, mw: number, mh: number, color: string): void => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(mx - mw * 0.5, my)
    ctx.lineTo(mx + mw * 0.5, my)
    ctx.lineTo(mx + mw * 0.34, my + mh)
    ctx.lineTo(mx - mw * 0.34, my + mh)
    ctx.closePath()
    ctx.fill()
    ellipse(ctx, mx, my, mw * 0.5, mh * 0.14, "#2c3036")
  }
  mortar(x0 + 34, y0 + 66, 30, 20, "#23262c")
  mortar(x0 + 96, y0 + 60, 40, 28, "#262a30")
  mortar(x0 + 208, y0 + 50, 58, 38, "#2a2e34")
  ctx.fillStyle = "#2e3438"
  ctx.save()
  ctx.translate(x0 + 118, y0 + 60)
  ctx.rotate(-0.35)
  ctx.fillRect(-2.5, -46, 5, 46)
  ellipse(ctx, 0, -2, 5, 3, "#2e3438")
  ctx.restore()
  ctx.fillStyle = "#24282c"
  ctx.fillRect(x0 + 146, y0 + 44, 3, 40)
  ctx.fillRect(x0 + 172, y0 + 44, 3, 40)
  ctx.fillRect(x0 + 143, y0 + 43, 35, 3)
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(x0 + 150 + i * 6, y0 + 46, 3, 10 + (i % 2) * 4)
  }
  const rx = x0 + 208
  const ry = y0 + 50
  ellipse(ctx, rx + 2, ry - 12, 8, 10, "#3a4046")
  ellipse(ctx, rx - 3, ry - 25, 3, 8, "#3a4046")
  ellipse(ctx, rx + 3, ry - 26, 3, 8, "#3a4046")
  ellipse(ctx, rx + 3, ry - 18, 5, 5, "#3a4046")
  ctx.fillStyle = "#3a4046"
  ctx.save()
  ctx.translate(rx + 12, ry - 14)
  ctx.rotate(0.25)
  ctx.fillRect(-2, -18, 4, 30)
  ctx.restore()
  circle(ctx, x0 + 60, y0 + 18, 1.1, "#c8d0d8")
  circle(ctx, x0 + 150, y0 + 12, 0.9, "#c8d0d8")
  circle(ctx, x0 + 236, y0 + 20, 1, "#c8d0d8")
}

function drawGrub(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const segs: [number, number, number][] = [
    [-13, 3, 5],
    [-6, 1, 6.5],
    [2, 0, 7],
    [10, 1, 6.5],
  ]
  for (const [ox, oy, r] of segs) {
    ellipse(ctx, cx + ox, cy + oy, r, r * 0.85, "#e8dcc0")
  }
  for (const [ox, oy, r] of segs) {
    ellipse(ctx, cx + ox - 1, cy + oy - r * 0.35, r * 0.5, r * 0.3, "#f6eed8")
    ctx.fillStyle = "#c8b48a"
    ctx.fillRect(cx + ox + r * 0.6, cy + oy - r * 0.6, 1.2, r * 1.2)
  }
  ellipse(ctx, cx - 4, cy - 3, 2.4, 1.2, "#d4b05a")
  ellipse(ctx, cx + 7, cy - 4, 2, 1, "#d4b05a")
  ellipse(ctx, cx + 16, cy + 1, 4.5, 4, "#8a5a2a")
  circle(ctx, cx + 17, cy, 1.2, "#1e1a16")
  ellipse(ctx, cx - 17, cy + 6, 2.4, 1.4, "#c8b48a")
  ellipse(ctx, cx - 5, cy + 7, 2.2, 1.3, "#c8b48a")
  ellipse(ctx, cx + 7, cy + 7, 2.2, 1.3, "#c8b48a")
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

function drawGlide(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ellipse(ctx, cx - 8, cy + 2, 9, 4, "#d8e8f8")
  ellipse(ctx, cx + 8, cy + 2, 9, 4, "#d8e8f8")
  ellipse(ctx, cx, cy - 2, 3, 6, "#f4f8ff")
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
  story_heron_up: drawHeronFlapUp,
  story_heron_lock: drawHeronLock,
  story_heron_sweep: drawHeronSweep,
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
  story_boar_step: drawBoarStep,
  story_boar_rage: drawBoarRage,
  story_boar_run: drawBoarRun,
  story_tortoise: drawTortoise,
  story_bees: drawBees,
  story_carp: drawCarp,
  story_frost_hare: drawFrostHare,
  story_moth: drawMoth,
  story_carrot: drawCarrot,
  story_mooncake: drawMooncake,
  story_heartcake: drawHeartCake,
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
  story_still: drawStill,
  story_still_q: drawStillQuarter,
  story_still_e: drawStillEighth,
  story_still_aspect: drawStillAspect,
  story_still_portal: drawStillPortal,
  story_cave: drawCave,
  story_sky_moon: drawSkyMoon,
  story_far_moon: drawFarMoon,
  story_far_guanghan: drawFarGuanghan,
  story_dust: drawDust,
  story_starwisp: drawStarWisp,
  story_pestle: drawPestle,
  story_pestle_big: drawPestleBig,
  story_roller: drawRoller,
  story_trough: drawTrough,
  story_mortar: drawMortar,
  story_screen: drawScreen,
  story_chime: drawChime,
  story_chimeframe: drawChimeFrame,
  story_moondoor: drawMoonDoor,
  story_far_outer: drawFarOuter,
  story_crab: drawCrab,
  story_raft: drawRaft,
  story_crater: drawCrater,
  story_mast: drawMast,
  story_far_dust: drawFarDust,
  story_penghou: drawPenghou,
  story_cut: drawCut,
  story_barkchip: drawBarkChip,
  story_bark: drawBark,
  story_heartwood: drawHeartwood,
  story_far_cassia: drawFarCassia,
  story_reflection: drawReflection,
  story_bat: drawBat,
  story_stalactite: drawStalactite,
  story_wellhead: drawWellhead,
  story_toad: drawToad,
  story_far_wells: drawFarWells,
  story_skin: drawSkin,
  story_silvercarp: drawSilverCarp,
  story_dewplate: drawDewPlate,
  story_far_silver: drawFarSilver,
  story_rack: drawRack,
  story_far_mortar: drawFarMortar,
  story_grub: drawGrub,
  story_grit: drawGrit,
  story_elixir: drawElixir,
  story_silver: drawWellSilver,
  story_glide: drawGlide,
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
