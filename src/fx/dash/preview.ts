import { drawBunny, type BunnyCosmetics } from "../../render/drawBunny"
import { drawDashParticle, spawnDashParticles, spawnDashStream, tickCanvasDashParticles } from "./canvasFx"
import type { CanvasDashParticle, DashDef } from "./types"

export function paintMeiMeadow(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#c5d48a"
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = "#8fad5c"
  ctx.fillRect(0, height - 42, width, 42)
  ctx.fillStyle = "#6b5338"
  ctx.fillRect(0, height - 14, width, 14)
}

export function paintMeiIdle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cosmetics: BunnyCosmetics,
): void {
  paintMeiMeadow(ctx, width, height)
  ctx.save()
  ctx.translate(width * 0.5, height - 48)
  drawBunny(ctx, 0, 0, cosmetics)
  ctx.restore()
}

export function paintDashPreview(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cosmetics: BunnyCosmetics,
  spec: DashDef,
  time: number,
  reducedMotion: boolean,
  particles: CanvasDashParticle[],
  dt = 1 / 60,
): void {
  paintMeiMeadow(ctx, width, height)

  const period = 1.35
  const phase = ((time % period) + period) % period
  const prev = (((time - dt) % period) + period) % period
  const dashing = phase < 0.34
  const justStarted = dashing && prev >= 0.34
  const x = 44 + ((width - 88) * phase) / period
  const y = height - 48

  if (justStarted) {
    spawnDashParticles(particles, x, y, 1, spec, reducedMotion)
  }
  if (dashing && Math.floor(time / 0.028) !== Math.floor(prev / 0.028)) {
    spawnDashStream(particles, x, y, 1, spec, reducedMotion)
  }
  tickCanvasDashParticles(particles, dt)
  for (const p of particles) {
    if (p.life > 0) {
      drawDashParticle(ctx, p)
    }
  }

  const ghosts = reducedMotion || !dashing ? 0 : spec.afterimages
  for (let i = ghosts; i >= 1; i -= 1) {
    ctx.save()
    ctx.globalAlpha = 0.22 / i
    ctx.translate(x - i * 22, y)
    ctx.scale(spec.stretchX, 1)
    drawBunny(ctx, 0, 0, cosmetics)
    ctx.restore()
  }

  ctx.save()
  ctx.translate(x, y)
  if (dashing) {
    ctx.scale(reducedMotion ? 1.08 : spec.stretchX, 0.92)
  }
  drawBunny(ctx, 0, 0, cosmetics)
  ctx.restore()
}
