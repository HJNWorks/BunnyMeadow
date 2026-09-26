import Phaser from "phaser"
import { getDifficulty } from "../../../core/difficulty"
import { getAudio } from "../../../core/audio"
import type { InputSnapshot } from "../../../core/input"
import { getSave } from "../../../core/session"

export type PlayerState = {
  facing: number
  dashTime: number
  dashCooldown: number
  airJumps: number
  maxAirJumps: number
  glide: boolean
  glideCharges: number
  usedGlideCharge: boolean
  wallBounce: boolean
  baseGravity: number
  jumpBoost: number
  slowFall: number
  dewSlow: number
  dashBase?: number
}

export function createPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    facing: 1,
    dashTime: 0,
    dashCooldown: 0,
    airJumps: 1,
    maxAirJumps: 1,
    glide: false,
    glideCharges: 0,
    usedGlideCharge: false,
    wallBounce: false,
    baseGravity: 1200,
    jumpBoost: 0,
    slowFall: 0,
    dewSlow: 0,
    ...overrides,
  }
}

export function tickPlayerTimers(state: PlayerState, dt: number): void {
  state.dashCooldown = Math.max(0, state.dashCooldown - dt)
  state.dashTime = Math.max(0, state.dashTime - dt)
  state.jumpBoost = Math.max(0, state.jumpBoost - dt)
  state.slowFall = Math.max(0, state.slowFall - dt)
}

function padBody(
  obj: Phaser.GameObjects.GameObject,
): Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | null {
  return (obj as Phaser.GameObjects.GameObject & {
    body?: Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | null
  }).body ?? null
}

export function feetOnSlick(
  player: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  extras: Phaser.GameObjects.GameObject[] = [],
): boolean {
  return feetOnSurface(player, platforms, "slick", extras) !== null
}

/** The pad under Mei's feet whose `surface` data matches, or null. */
export function feetOnSurface(
  player: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  surface: string,
  extras: Phaser.GameObjects.GameObject[] = [],
): Phaser.GameObjects.GameObject | null {
  const body = player.body as Phaser.Physics.Arcade.Body | null
  if (!body) {
    return null
  }
  if (!body.blocked.down && !body.touching.down) {
    return null
  }
  const hits = [...platforms.getChildren(), ...extras]
  for (const obj of hits) {
    const go = obj as Phaser.GameObjects.GameObject
    if (go.getData("surface") !== surface || go.getData("broken") === true) {
      continue
    }
    const pb = padBody(go)
    if (!pb) {
      continue
    }
    const overlapX = body.right > pb.left + 2 && body.left < pb.right - 2
    const onTop = Math.abs(body.bottom - pb.top) <= 10
    if (overlapX && onTop) {
      return go
    }
  }
  return null
}

export function updatePlayerMovement(
  player: Phaser.Physics.Arcade.Sprite,
  input: InputSnapshot,
  state: PlayerState,
): void {
  const body = player.body as Phaser.Physics.Arcade.Body
  const onFloor = body.blocked.down || body.touching.down
  if (onFloor) {
    state.airJumps = state.maxAirJumps
    if (state.usedGlideCharge) {
      state.glideCharges = Math.max(0, state.glideCharges - 1)
      state.usedGlideCharge = false
    }
  }
  const vx = input.moveX * (state.dashTime > 0 ? 480 : 260)
  if (input.moveX) {
    state.facing = input.moveX > 0 ? 1 : -1
  }

  const canGlide = state.glide || state.glideCharges > 0
  const boosted = state.jumpBoost > 0
  if (canGlide && !onFloor && input.jumpHeld && body.velocity.y > 0) {
    if (!state.glide && state.glideCharges > 0) {
      state.usedGlideCharge = true
    }
    body.setGravityY(state.baseGravity * 0.22)
    body.velocity.y = Math.min(body.velocity.y, 90)
  } else if (state.slowFall > 0 && !onFloor && body.velocity.y > 0) {
    body.setGravityY(state.baseGravity * 0.28)
    body.velocity.y = Math.min(body.velocity.y, 220)
  } else {
    body.setGravityY(state.baseGravity)
  }

  if (state.wallBounce && (body.blocked.left || body.blocked.right) && !onFloor && input.jumpPressed) {
    const push = body.blocked.left ? 1 : -1
    player.setVelocityY(boosted ? -640 : -520)
    player.setVelocityX(push * 340)
    state.facing = push
    state.airJumps = state.maxAirJumps
    getAudio().playSfx("jump")
  } else if (input.jumpPressed && onFloor) {
    player.setVelocityY(boosted ? -880 : -720)
    state.airJumps = state.maxAirJumps
    getAudio().playSfx("jump")
  } else if (input.jumpPressed && !onFloor && state.airJumps > 0) {
    state.airJumps -= 1
    player.setVelocityY(boosted ? -780 : -640)
    getAudio().playSfx("jump")
  }

  if (input.dashPressed && state.dashCooldown <= 0) {
    state.dashTime = 0.16
    const dashBase = state.dashBase ?? getDifficulty(getSave()).dashCooldown
    state.dashCooldown = dashBase * 0.7
    getAudio().playSfx("dash")
  }

  if (state.dashTime > 0) {
    player.setVelocityX(state.facing * 520)
  } else if (onFloor && player.getData("slick") === true) {
    const steer = input.moveX * 180
    body.velocity.x = body.velocity.x * 0.988 + steer * 0.015
  } else {
    player.setVelocityX(vx)
  }
}
