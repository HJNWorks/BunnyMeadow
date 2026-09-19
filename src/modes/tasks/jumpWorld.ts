import type { DifficultyParams } from "../../core/difficulty"

export const PX_PER_METER = 72
export const JUMP_WIDTH = 1920
export const PAD_GAP = 168
export const BOUNCE_VY = -820
export const BOOST_VY = -1080

export type JumpBandId = "meadow" | "orchard" | "bamboo" | "lantern" | "osmanthus" | "moon"

export type JumpPadKind = "solid" | "crumble" | "boost" | "slide" | "ice"

export type JumpPadPlan = {
  x: number
  y: number
  w: number
  h: number
  kind: JumpPadKind
  env: JumpBandId
  stamp: string
  surface: "bounce" | "boost" | "slick"
  perch?: "fox" | "hedgehog"
  slideAmp?: number
  slideSpeed?: number
}

const BANDS: { env: JumpBandId; fromM: number; toM: number }[] = [
  { env: "meadow", fromM: 0, toM: 18 },
  { env: "orchard", fromM: 18, toM: 36 },
  { env: "bamboo", fromM: 36, toM: 55 },
  { env: "lantern", fromM: 55, toM: 72 },
  { env: "osmanthus", fromM: 72, toM: 88 },
  { env: "moon", fromM: 88, toM: 9999 },
]

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function metersFromY(originY: number, y: number): number {
  return Math.max(0, (originY - y) / PX_PER_METER)
}

export function bandAt(meters: number): JumpBandId {
  for (const band of BANDS) {
    if (meters < band.toM) {
      return band.env
    }
  }
  return "moon"
}

export function moonDiscMeters(difficulty: DifficultyParams): number {
  const scale = difficulty.timerMultiplier
  if (difficulty.hearts <= 1) {
    return 130
  }
  return Math.round(70 + scale * 28)
}

export function stampFor(kind: JumpPadKind, env: JumpBandId): string {
  if (kind === "boost") {
    return "story_lantern"
  }
  if (kind === "slide") {
    return "story_bridge"
  }
  if (kind === "crumble") {
    return "story_log"
  }
  if (env === "moon") {
    return "story_ground_moon"
  }
  return "story_ground"
}

export function planPad(rng: () => number, y: number, originY: number, difficulty: DifficultyParams): JumpPadPlan {
  const meters = metersFromY(originY, y)
  const env = bandAt(meters)
  const w = 140 + Math.floor(rng() * 80)
  const x = 80 + rng() * (JUMP_WIDTH - 160 - w) + w / 2
  let kind: JumpPadKind = "solid"
  let perch: JumpPadPlan["perch"]
  const roll = rng()
  const dense = difficulty.enemyCountMultiplier
  if (env === "orchard" && roll < 0.28) {
    kind = "crumble"
  } else if (env === "bamboo" && roll < 0.22) {
    kind = "slide"
  } else if (env === "lantern" && roll < 0.18) {
    kind = "boost"
  } else if (env === "osmanthus" && roll < 0.24) {
    kind = "ice"
  } else if (env === "moon" && roll < 0.2) {
    kind = "ice"
  } else if (env === "moon" && roll < 0.32) {
    kind = "crumble"
  }
  if ((env === "meadow" || env === "orchard") && rng() < 0.12 * dense && kind === "solid") {
    perch = rng() < 0.5 ? "fox" : "hedgehog"
  }
  const surface: JumpPadPlan["surface"] = kind === "boost" ? "boost" : kind === "ice" ? "slick" : "bounce"
  return {
    x,
    y,
    w,
    h: kind === "boost" ? 28 : 22,
    kind,
    env,
    stamp: stampFor(kind, env),
    surface,
    perch,
    slideAmp: kind === "slide" ? 40 + rng() * 50 : undefined,
    slideSpeed: kind === "slide" ? 0.7 + rng() * 0.6 : undefined,
  }
}

// TODO: vanish pads cycle visible / gone on a timer
