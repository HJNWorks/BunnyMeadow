import Phaser from "phaser"
import type { AssembledHazard } from "../../../systems/ChunkAssembler"
import type { PlayerState } from "./playerController"

/**
 * Dust Sea hazards.
 * - `tide`: a band of drifting dust. `current` pushes Mei sideways (px/s). `lift` pushes
 *   her up (px/s). With `period` > 0 the tide breathes: on for 45% of the beat, off
 *   for the rest (crater vents). Never costs a heart.
 * - `dust`: a sinking pool. Mei wades slowly and can hop out while shallow. Once her
 *   head goes under she drifts back to the last Moon Pool.
 */
export type DustState = {
  kind: "tide" | "dust"
  x: number
  y: number
  w: number
  h: number
  current: number
  lift: number
  period: number
  phase: number
  clock: number
  motes: { dot: Phaser.GameObjects.Ellipse; u: number; v: number; speed: number }[]
  column?: Phaser.GameObjects.Rectangle
  puffed: boolean
}

const VENT_ON = 0.45
const WADE_DEPTH = 40

export function isDustHazard(hazard: AssembledHazard): boolean {
  return hazard.kind === "tide" || hazard.kind === "dust"
}

export function createDustHazards(
  scene: Phaser.Scene,
  hazards: AssembledHazard[],
  reducedMotion: boolean,
): DustState[] {
  const states: DustState[] = []
  for (const hazard of hazards) {
    if (hazard.kind !== "tide" && hazard.kind !== "dust") {
      continue
    }
    const x = hazard.worldX
    const y = hazard.worldY
    const state: DustState = {
      kind: hazard.kind,
      x,
      y,
      w: hazard.w,
      h: hazard.h,
      current: hazard.current ?? 0,
      lift: hazard.lift ?? 0,
      period: hazard.period ?? 0,
      phase: hazard.phase ?? 0,
      clock: 0,
      motes: [],
      puffed: false,
    }
    if (hazard.kind === "dust") {
      drawPool(scene, x, y, hazard.w, hazard.h)
    } else {
      state.column = scene.add
        .rectangle(x + hazard.w / 2, y + hazard.h / 2, hazard.w, hazard.h, 0xd8d0c0, 0.05)
        .setDepth(0.7)
    }
    const area = (hazard.w * hazard.h) / 9000
    const count = Math.max(3, Math.min(reducedMotion ? 6 : 26, Math.round(area)))
    for (let i = 0; i < count; i += 1) {
      const vertical = state.lift > 0 && Math.abs(state.current) < state.lift
      const dot = scene.add
        .ellipse(0, 0, vertical ? 3 : hazard.kind === "dust" ? 4 : 18, vertical ? 14 : 2.4, 0xe8e0d0, 0.5)
        .setDepth(hazard.kind === "dust" ? 6.2 : 0.75)
      state.motes.push({
        dot,
        u: Math.random(),
        v: hazard.kind === "dust" ? 0.02 + Math.random() * 0.1 : Math.random(),
        speed: 0.6 + Math.random() * 0.8,
      })
    }
    states.push(state)
  }
  return states
}

/** Soft ash: a rippled pale crust over a body that darkens with depth. Drawn over Mei. */
function drawPool(scene: Phaser.Scene, x: number, y: number, w: number, h: number): void {
  const g = scene.add.graphics().setDepth(6)
  const bands = 5
  for (let i = 0; i < bands; i += 1) {
    const top = y + 6 + (i * (h - 6)) / bands
    g.fillStyle(i === 0 ? 0xa39a88 : 0x8a8272, 0.92 - i * 0.04)
    g.fillRect(x, top, w, (h - 6) / bands + 1)
  }
  const crest = (dx: number): number => y + 3 + Math.sin(dx / 23) * 2.5 + Math.sin(dx / 9 + 1.3) * 1.2
  g.fillStyle(0xd4ccb8, 1)
  g.beginPath()
  g.moveTo(x, y + 10)
  for (let dx = 0; dx <= w; dx += 6) {
    g.lineTo(x + dx, crest(dx))
  }
  g.lineTo(x + w, y + 10)
  g.closePath()
  g.fillPath()
  g.fillStyle(0xeee6d4, 0.9)
  for (let dx = 14; dx < w; dx += 38) {
    g.fillEllipse(x + dx, crest(dx) + 1, 10, 2.4)
  }
}

function ventActive(state: DustState): boolean {
  if (state.period <= 0) {
    return true
  }
  const u = (((state.clock / state.period + state.phase) % 1) + 1) % 1
  return u < VENT_ON
}

function ventSoon(state: DustState): boolean {
  if (state.period <= 0) {
    return false
  }
  const u = (((state.clock / state.period + state.phase) % 1) + 1) % 1
  return u > 1 - 0.12
}

function drawMotes(state: DustState, dt: number, reducedMotion: boolean): void {
  const on = ventActive(state)
  const slow = reducedMotion ? 0.4 : 1
  for (const mote of state.motes) {
    if (state.kind === "dust") {
      mote.u = (mote.u + dt * 0.02 * mote.speed * slow) % 1
      mote.dot.setPosition(state.x + mote.u * state.w, state.y + mote.v * state.h)
      continue
    }
    const vx = state.w > 0 ? (state.current / state.w) * mote.speed : 0
    const vy = state.h > 0 ? (-state.lift / state.h) * mote.speed : 0
    const rate = on ? 1 : 0.12
    mote.u = (((mote.u + vx * dt * rate * slow) % 1) + 1) % 1
    mote.v = (((mote.v + vy * dt * rate * slow) % 1) + 1) % 1
    mote.dot.setPosition(state.x + mote.u * state.w, state.y + mote.v * state.h)
    mote.dot.setAlpha(on ? 0.6 : 0.12)
  }
  if (state.column && state.period > 0) {
    state.column.setFillStyle(0xd8d0c0, on ? 0.1 : 0.02)
  }
}

function puff(scene: Phaser.Scene, state: DustState): void {
  for (let i = 0; i < 4; i += 1) {
    const dot = scene.add
      .circle(state.x + state.w * (0.25 + i * 0.17), state.y + state.h - 6, 6, 0xe8e0d0, 0.7)
      .setDepth(2.6)
    scene.tweens.add({
      targets: dot,
      y: dot.y - 40 - i * 6,
      alpha: 0,
      scale: 1.8,
      duration: 420,
      ease: "Cubic.easeOut",
      onComplete: () => dot.destroy(),
    })
  }
}

/** Returns true when Mei has sunk under a dust pool. */
export function tickDust(
  states: DustState[],
  player: Phaser.Physics.Arcade.Sprite,
  playerState: PlayerState,
  dt: number,
  reducedMotion: boolean,
): boolean {
  const body = player.body as Phaser.Physics.Arcade.Body
  let sunk = false
  for (const state of states) {
    state.clock += dt
    drawMotes(state, dt, reducedMotion)
    if (state.kind === "tide" && state.period > 0) {
      const soon = ventSoon(state)
      if (soon && !state.puffed && !reducedMotion) {
        puff(player.scene, state)
      }
      state.puffed = soon
    }
    const inside =
      body.right > state.x && body.left < state.x + state.w && body.bottom > state.y && body.top < state.y + state.h
    if (!inside) {
      continue
    }
    if (state.kind === "tide") {
      if (!ventActive(state)) {
        continue
      }
      player.x += state.current * dt
      if (state.lift > 0) {
        body.velocity.y = Math.min(body.velocity.y, -state.lift)
      }
      continue
    }
    const depth = body.bottom - state.y
    body.velocity.x *= 0.45
    if (body.velocity.y > 50) {
      body.velocity.y = 50
    }
    // Shallow: the next jump is a wade hop out. Deep: no hop left.
    playerState.airJumps = depth < WADE_DEPTH ? playerState.maxAirJumps : 0
    if (body.top > state.y + 4) {
      sunk = true
    }
  }
  return sunk
}
