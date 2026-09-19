import type { DifficultyParams } from "../../core/difficulty"

export const PX_PER_METER = 72
export const JUMP_WIDTH = 1920
export const PAD_GAP = 168
export const BOUNCE_VY = -820
export const BOOST_VY = -1080
export const WORLD_GRAVITY = 1400
export const MOVE_VX = 280

export type JumpBandId = "meadow" | "orchard" | "bamboo" | "lantern" | "osmanthus" | "moon"

export type JumpPadKind = "solid" | "crumble" | "boost" | "slide" | "ice"

export type JumpPadAnchor = {
  x: number
  w: number
  kind: JumpPadKind
  slideAmp?: number
}

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

const AIR_SAFETY = 0.78

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

export function hopLandTime(gap: number, bounceVy: number): number {
  const a = WORLD_GRAVITY * 0.5
  const b = bounceVy
  const c = gap
  const disc = b * b - 4 * a * c
  if (disc <= 0) {
    return 0
  }
  const root = Math.sqrt(disc)
  const t1 = (-b - root) / (2 * a)
  const t2 = (-b + root) / (2 * a)
  return Math.max(t1, t2)
}

export function wrapDeltaX(from: number, to: number): number {
  let delta = to - from
  if (delta > JUMP_WIDTH * 0.5) {
    delta -= JUMP_WIDTH
  }
  if (delta < -JUMP_WIDTH * 0.5) {
    delta += JUMP_WIDTH
  }
  return delta
}

export function clampPadX(x: number, w: number): number {
  const min = w * 0.5 + 56
  const max = JUMP_WIDTH - w * 0.5 - 56
  let wrapped = ((x % JUMP_WIDTH) + JUMP_WIDTH) % JUMP_WIDTH
  if (wrapped < min) {
    wrapped = min
  }
  if (wrapped > max) {
    wrapped = max
  }
  return wrapped
}

export function hopAirDx(opts: {
  bounceVy: number
  ice: boolean
  slideReserve: number
}): number {
  const hang = hopLandTime(PAD_GAP, opts.bounceVy)
  let air = MOVE_VX * hang * AIR_SAFETY
  if (opts.ice) {
    air *= 0.7
  }
  air -= opts.slideReserve
  return Math.max(64, air)
}

export function maxCenterDelta(airDx: number, nextW: number): number {
  return airDx + nextW * 0.28
}

export function nextPadX(
  rng: () => number,
  prevX: number,
  nextW: number,
  airDx: number,
): number {
  const cap = maxCenterDelta(airDx, nextW)
  const mag = (0.12 + rng() * 0.88) * cap
  const dx = (rng() < 0.5 ? -1 : 1) * mag
  let x = clampPadX(prevX + dx, nextW)
  if (Math.abs(wrapDeltaX(prevX, x)) > cap) {
    x = clampPadX(prevX + Math.sign(dx || 1) * cap * 0.55, nextW)
  }
  return x
}

export function planPad(
  rng: () => number,
  y: number,
  originY: number,
  difficulty: DifficultyParams,
  prev: JumpPadAnchor,
): JumpPadPlan {
  const meters = metersFromY(originY, y)
  const env = bandAt(meters)
  const w = 140 + Math.floor(rng() * 80)
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
  const slideAmp = kind === "slide" ? 24 + rng() * 28 : undefined
  const slideSpeed = kind === "slide" ? 0.7 + rng() * 0.6 : undefined
  const bounceVy = prev.kind === "boost" ? BOOST_VY : BOUNCE_VY
  const climb = Math.min(1, meters / 80)
  const span = 0.48 + 0.38 * climb * Math.min(1.1, difficulty.timerMultiplier)
  const ice = prev.kind === "ice" || kind === "ice"
  const airDx =
    hopAirDx({
      bounceVy,
      ice,
      slideReserve: (prev.slideAmp ?? 0) + (slideAmp ?? 0),
    }) * span
  const x = nextPadX(rng, prev.x, w, airDx)
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
    slideAmp,
    slideSpeed,
  }
}

// TODO: vanish pads cycle visible / gone on a timer
