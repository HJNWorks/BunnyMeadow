import type { CanvasDashParticle, DashDef, DashParticleShape } from "./types"

function hexToRgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.replace("#", ""), 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  return `rgba(${r},${g},${b},${alpha})`
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
    const angle = Math.PI + (Math.random() - 0.5) * 0.9
    const speed = 40 + Math.random() * spec.particle.spread * 4
    into.push({
      x: x - facing * 10,
      y: y + (Math.random() - 0.5) * spec.particle.spread,
      vx: Math.cos(angle) * speed * facing,
      vy: (Math.random() - 0.5) * 50,
      life: spec.particle.life,
      maxLife: spec.particle.life,
      color: spec.particle.color,
      shape: spec.particle.shape,
      size: spec.particle.shape === "streak" ? 10 : 4,
    })
  }
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
  ctx.fillStyle = hexToRgba(p.color, a)
  ctx.save()
  ctx.translate(p.x, p.y)
  drawDashShape(ctx, p.shape, p.size)
  ctx.restore()
}

export function drawDashShape(ctx: CanvasRenderingContext2D, shape: DashParticleShape, size: number): void {
  if (shape === "streak") {
    ctx.fillRect(-size, -1.2, size * 2, 2.4)
    return
  }
  if (shape === "carrot") {
    ctx.beginPath()
    ctx.ellipse(0, 0, size * 0.45, size, 0.3, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (shape === "crescent") {
    ctx.beginPath()
    ctx.arc(0, 0, size, 0.4, Math.PI * 1.4)
    ctx.arc(-size * 0.35, 0, size * 0.7, Math.PI * 1.3, 0.5, true)
    ctx.closePath()
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2)
  ctx.fill()
}

export function filterLiveDashParticles(particles: CanvasDashParticle[]): CanvasDashParticle[] {
  return particles.filter((p) => p.life > 0)
}
