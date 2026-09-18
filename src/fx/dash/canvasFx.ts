import type { CanvasDashParticle, DashDef, DashParticleShape } from "./types"
import { drawStamp } from "../../render/stamps"

function shapeKey(shape: DashParticleShape): string {
  if (shape === "carrot") {
    return "dash_carrot"
  }
  if (shape === "streak") {
    return "dash_streak"
  }
  if (shape === "crescent") {
    return "dash_crescent"
  }
  return "dash_speck"
}

function pushParticle(
  into: CanvasDashParticle[],
  x: number,
  y: number,
  facing: number,
  spec: DashDef,
  stream: boolean,
): void {
  const spread = spec.particle.spread
  into.push({
    x: x - facing * (stream ? 14 : 10),
    y: y + (Math.random() - 0.5) * (stream ? spread * 0.45 : spread),
    vx: -facing * (stream ? 30 + Math.random() * spread : 40 + Math.random() * spread * 4),
    vy: (Math.random() - 0.5) * (stream ? 28 : 50),
    life: spec.particle.life * (stream ? 0.65 : 1),
    maxLife: spec.particle.life * (stream ? 0.65 : 1),
    color: spec.particle.color,
    shape: spec.particle.shape,
    size: spec.particle.shape === "streak" ? 12 : 8,
  })
}

export function spawnDashParticles(
  into: CanvasDashParticle[],
  x: number,
  y: number,
  facing: number,
  spec: DashDef,
  reducedMotion: boolean,
): void {
  if (reducedMotion) {
    return
  }
  const count = spec.particle.count
  for (let i = 0; i < count; i += 1) {
    pushParticle(into, x, y, facing, spec, false)
  }
}

export function spawnDashStream(
  into: CanvasDashParticle[],
  x: number,
  y: number,
  facing: number,
  spec: DashDef,
  reducedMotion: boolean,
): void {
  if (reducedMotion) {
    return
  }
  pushParticle(into, x, y, facing, spec, true)
}

export function tickCanvasDashParticles(particles: CanvasDashParticle[], dt: number): void {
  for (const p of particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt
    p.vx *= 0.92
    p.vy *= 0.92
  }
}

export function drawDashParticle(ctx: CanvasRenderingContext2D, p: CanvasDashParticle): void {
  const a = Math.max(0, p.life / p.maxLife)
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(p.x, p.y)
  const scale = Math.max(0.6, p.size / 8)
  ctx.scale(scale, scale)
  drawStamp(ctx, shapeKey(p.shape), 0, 0)
  ctx.restore()
}

export function drawDashShape(ctx: CanvasRenderingContext2D, shape: DashParticleShape, size: number): void {
  const scale = Math.max(0.6, size / 8)
  ctx.save()
  ctx.scale(scale, scale)
  drawStamp(ctx, shapeKey(shape), 0, 0)
  ctx.restore()
}

export function filterLiveDashParticles(particles: CanvasDashParticle[]): CanvasDashParticle[] {
  return particles.filter((p) => p.life > 0)
}
