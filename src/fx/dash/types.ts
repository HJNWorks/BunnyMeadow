export type DashParticleShape = "speck" | "carrot" | "streak" | "crescent"

export type DashParticleSpec = {
  shape: DashParticleShape
  count: number
  life: number
  spread: number
  color: string
}

export type DashDef = {
  id: string
  unlockAchievement: string | null
  tint: string
  stretchX: number
  afterimages: number
  particle: DashParticleSpec
}

export type CanvasDashParticle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  shape: DashParticleShape
  size: number
}

export const DASH_IDS = ["meadow", "carrot", "gale", "moon"] as const

export type DashId = (typeof DASH_IDS)[number]
