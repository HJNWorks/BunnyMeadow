import Phaser from "phaser"
import { getDifficulty } from "../../../core/difficulty"
import type { InputSnapshot } from "../../../core/input"
import { getSave } from "../../../core/session"

export type PlayerState = {
  facing: number
  dashTime: number
  dashCooldown: number
  airJumps: number
  maxAirJumps: number
  glide: boolean
  wallBounce: boolean
  baseGravity: number
}

export function createPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    facing: 1,
    dashTime: 0,
    dashCooldown: 0,
    airJumps: 1,
    maxAirJumps: 1,
    glide: false,
    wallBounce: false,
    baseGravity: 1200,
    ...overrides,
  }
}

export function tickPlayerTimers(state: PlayerState, dt: number): void {
  state.dashCooldown = Math.max(0, state.dashCooldown - dt)
  state.dashTime = Math.max(0, state.dashTime - dt)
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
  }
  const vx = input.moveX * (state.dashTime > 0 ? 480 : 260)
  if (input.moveX) {
    state.facing = input.moveX > 0 ? 1 : -1
  }

  if (state.glide && !onFloor && input.jumpHeld && body.velocity.y > 0) {
    body.setGravityY(state.baseGravity * 0.22)
    body.velocity.y = Math.min(body.velocity.y, 90)
  } else {
    body.setGravityY(state.baseGravity)
  }

  if (state.wallBounce && (body.blocked.left || body.blocked.right) && !onFloor && input.jumpPressed) {
    const push = body.blocked.left ? 1 : -1
    player.setVelocityY(-520)
    player.setVelocityX(push * 340)
    state.facing = push
    state.airJumps = state.maxAirJumps
  } else if (input.jumpPressed && onFloor) {
    player.setVelocityY(-720)
    state.airJumps = state.maxAirJumps
  } else if (input.jumpPressed && !onFloor && state.airJumps > 0) {
    state.airJumps -= 1
    player.setVelocityY(-640)
  }

  if (input.dashPressed && state.dashCooldown <= 0) {
    state.dashTime = 0.16
    state.dashCooldown = getDifficulty(getSave()).dashCooldown * 0.7
  }

  if (state.dashTime > 0) {
    player.setVelocityX(state.facing * 520)
  } else {
    player.setVelocityX(vx)
  }
}
