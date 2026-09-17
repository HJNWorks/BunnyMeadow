import { drawBunny, type BunnyCosmetics } from "../../render/drawBunny"
import { drawDashParticle, spawnDashParticles, tickCanvasDashParticles } from "./canvasFx"
import type { CanvasDashParticle, DashDef } from "./types"

export function paintDashPreview(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cosmetics: BunnyCosmetics,
  spec: DashDef,
  time: number,
  reducedMotion: boolean,
  particles: CanvasDashParticle[],
): void {
  ctx.fillStyle = "#bed593"
  ctx.fillRect(0, 0, width, height)
  const cx = width * 0.45 + Math.sin(time * 6) * 18
  const cy = height * 0.58
  const cycle = time % 1.2
  const dashing = cycle < 0.22
  if (dashing && particles.length < spec.particle.count) {
    spawnDashParticles(particles, cx, cy, 1, spec, reducedMotion)
  }
  tickCanvasDashParticles(particles, 1 / 60)
  for (const p of particles) {
    if (p.life > 0) {
      drawDashParticle(ctx, p)
    }
  }
  ctx.save()
  ctx.translate(cx, cy)
  if (dashing) {
    ctx.scale(reducedMotion ? 1.05 : spec.stretchX, 1)
  }
  drawBunny(ctx, 0, 0, cosmetics)
  ctx.restore()
}
