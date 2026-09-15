import type { Bindings } from "./save"
import { DEFAULT_BINDINGS } from "./save"

export type InputSnapshot = {
  moveX: number
  moveY: number
  dashPressed: boolean
  jumpPressed: boolean
  pausePressed: boolean
  confirmPressed: boolean
  cancelPressed: boolean
}

type Listener = () => void

export class InputBus {
  private keys = new Set<string>()
  private bindings: Bindings = { ...DEFAULT_BINDINGS }
  private edge = {
    dash: false,
    jump: false,
    pause: false,
    confirm: false,
    cancel: false,
  }
  private prevButtons = new Set<number>()

  private onKeyDown = (e: KeyboardEvent): void => {
    if (
      this.bindings.moveUp.includes(e.code) ||
      this.bindings.moveDown.includes(e.code) ||
      this.bindings.moveLeft.includes(e.code) ||
      this.bindings.moveRight.includes(e.code) ||
      this.bindings.dash.includes(e.code) ||
      this.bindings.jump.includes(e.code)
    ) {
      e.preventDefault()
    }
    const wasDown = this.keys.has(e.code)
    this.keys.add(e.code)
    if (!wasDown && !e.repeat) {
      if (this.bindings.dash.includes(e.code)) this.edge.dash = true
      if (this.bindings.jump.includes(e.code)) this.edge.jump = true
      if (this.bindings.pause.includes(e.code)) this.edge.pause = true
      if (this.bindings.confirm.includes(e.code)) this.edge.confirm = true
      if (this.bindings.cancel.includes(e.code)) this.edge.cancel = true
    }
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code)
  }

  private onBlur = (): void => {
    this.keys.clear()
  }

  start(): void {
    addEventListener("keydown", this.onKeyDown)
    addEventListener("keyup", this.onKeyUp)
    addEventListener("blur", this.onBlur)
  }

  stop(): void {
    removeEventListener("keydown", this.onKeyDown)
    removeEventListener("keyup", this.onKeyUp)
    removeEventListener("blur", this.onBlur)
    this.keys.clear()
  }

  setBindings(bindings: Bindings): void {
    this.bindings = bindings
  }

  private anyKey(codes: string[]): boolean {
    return codes.some((code) => this.keys.has(code))
  }

  pollGamepadEdges(): void {
    const pads = navigator.getGamepads?.() ?? []
    const pad = pads.find((p) => p)
    if (!pad) {
      this.prevButtons.clear()
      return
    }
    const pressed = new Set<number>()
    pad.buttons.forEach((button, index) => {
      if (button.pressed) {
        pressed.add(index)
      }
    })
    const rose = (index: number): boolean => pressed.has(index) && !this.prevButtons.has(index)
    if (rose(this.bindings.gamepadDash)) this.edge.dash = true
    if (rose(this.bindings.gamepadJump)) this.edge.jump = true
    if (rose(this.bindings.gamepadPause)) this.edge.pause = true
    if (rose(this.bindings.gamepadConfirm)) this.edge.confirm = true
    if (rose(this.bindings.gamepadCancel)) this.edge.cancel = true
    this.prevButtons = pressed
  }

  private gamepadAxis(): { x: number; y: number } {
    const pads = navigator.getGamepads?.() ?? []
    const pad = pads.find((p) => p)
    if (!pad) {
      return { x: 0, y: 0 }
    }
    let x = pad.axes[0] ?? 0
    let y = pad.axes[1] ?? 0
    if (pad.buttons[14]?.pressed) x = -1
    if (pad.buttons[15]?.pressed) x = 1
    if (pad.buttons[12]?.pressed) y = -1
    if (pad.buttons[13]?.pressed) y = 1
    if (Math.abs(x) < 0.25) x = 0
    if (Math.abs(y) < 0.25) y = 0
    return { x, y }
  }

  snapshot(): InputSnapshot {
    this.pollGamepadEdges()
    const axis = this.gamepadAxis()
    const moveX =
      Number(this.anyKey(this.bindings.moveRight)) - Number(this.anyKey(this.bindings.moveLeft)) ||
      axis.x
    const moveY =
      Number(this.anyKey(this.bindings.moveDown)) - Number(this.anyKey(this.bindings.moveUp)) ||
      axis.y
    const snap: InputSnapshot = {
      moveX: Math.max(-1, Math.min(1, moveX)),
      moveY: Math.max(-1, Math.min(1, moveY)),
      dashPressed: this.edge.dash,
      jumpPressed: this.edge.jump,
      pausePressed: this.edge.pause,
      confirmPressed: this.edge.confirm,
      cancelPressed: this.edge.cancel,
    }
    this.edge.dash = false
    this.edge.jump = false
    this.edge.pause = false
    this.edge.confirm = false
    this.edge.cancel = false
    return snap
  }

  clearKeys(): void {
    this.keys.clear()
  }
}

let bus: InputBus | null = null

export function getInput(): InputBus {
  if (!bus) {
    bus = new InputBus()
  }
  return bus
}

export type { Listener }
