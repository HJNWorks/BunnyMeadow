import { drawBunny, type BunnyCosmetics } from "../../render/drawBunny"
import { drawDashParticle, spawnDashParticles, tickCanvasDashParticles } from "./canvasFx"
import type { CanvasDashParticle, DashDef } from "./types"

function mixHex(hex: string, ink: string, amount: number): string {
  const parse = (value: string): [number, number, number] => {
    const n = Number.parseInt(value.replace("#", ""), 16)
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
  }
  const [ar, ag, ab] = parse(hex)
  const [br, bg, bb] = parse(ink)
  const u = Math.max(0, Math.min(1, amount))
  const r = Math.round(ar + (br - ar) * u)
  const g = Math.round(ag + (bg - ag) * u)
  const b = Math.round(ab + (bb - ab) * u)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
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
  ctx.fillStyle = "#c5d48a"
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = "#8fad5c"
  ctx.fillRect(0, height - 42, width, 42)
  ctx.fillStyle = "#6b5338"
  ctx.fillRect(0, height - 14, width, 14)

  const period = 1.35
  const phase = ((time % period) + period) % period
  const prev = (((time - dt) % period) + period) % period
  const dashing = phase < 0.34
  const justStarted = dashing && prev >= 0.34
  const x = 44 + ((width - 88) * phase) / period
  const y = height - 48

  if (justStarted) {
    const start = particles.length
    spawnDashParticles(particles, x, y, 1, spec, reducedMotion)
    for (let i = start; i < particles.length; i += 1) {
      const p = particles[i]
      p.size = Math.max(p.size, spec.particle.shape === "streak" ? 14 : 6)
      p.color = mixHex(p.color, "#24351f", 0.55)
    }
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
