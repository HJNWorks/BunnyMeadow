import { getPlatform } from "../../core/platform"

type GameState = "intro" | "playing" | "paused" | "lost" | "won"

interface Vec {
  x: number
  y: number
}

interface Bunny extends Vec {
  dx: number
  dy: number
}

interface Carrot extends Vec {
  taken: boolean
}

interface Fox extends Vec {
  phase: number
}

interface Particle extends Vec {
  vx: number
  vy: number
  life: number
  color: string
}

interface Decoration extends Vec {
  s: number
}

interface MeadowUi {
  score: HTMLElement
  hearts: HTMLElement
  dash: HTMLElement
  pause: HTMLButtonElement
  overlay: HTMLElement
  title: HTMLElement
  message: HTMLElement
  play: HTMLButtonElement
  touchDash: HTMLButtonElement
}

const W = 960
const H = 540
const HOME = { x: 110, y: 275 }

export class MeadowRuntime {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private ui: MeadowUi
  private keys = new Set<string>()
  private state: GameState = "intro"
  private bunny: Bunny = { x: 110, y: 300, dx: 1, dy: 0 }
  private carrots: Carrot[] = []
  private foxes: Fox[] = []
  private particles: Particle[] = []
  private decorations: Decoration[] = Array.from({ length: 135 }, (_, i) => ({
    x: (i * 137.5 + 39) % W,
    y: (i * 83.7 + 25) % H,
    s: i % 4,
  }))
  private score = 0
  private health = 3
  private cooldown = 0
  private burst = 0
  private invulnerable = 0
  private time = 0
  private last = 0
  private target: Vec | null = null
  private raf = 0
  private disposed = false

  private onKeyDown = (e: KeyboardEvent): void => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault()
    }
    this.keys.add(e.code)
    if (!e.repeat && e.code === "Space") {
      this.dash()
    }
    if (!e.repeat && e.code === "KeyP") {
      this.pause()
    }
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code)
  }

  private onBlur = (): void => {
    this.keys.clear()
    if (this.state === "playing") {
      this.pause()
    }
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (this.state === "playing") {
      this.canvas.setPointerCapture(e.pointerId)
      this.point(e)
    }
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (this.canvas.hasPointerCapture(e.pointerId)) {
      this.point(e)
    }
  }

  private clearTarget = (): void => {
    this.target = null
  }

  constructor(canvas: HTMLCanvasElement, ui: MeadowUi) {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Canvas 2D unavailable")
    }
    this.canvas = canvas
    this.ctx = ctx
    this.ui = ui

    this.ui.play.onclick = () => {
      if (this.state === "paused") {
        this.pause()
      } else {
        this.reset()
      }
    }
    this.ui.pause.onclick = () => this.pause()
    this.ui.touchDash.onclick = () => this.dash()

    addEventListener("keydown", this.onKeyDown)
    addEventListener("keyup", this.onKeyUp)
    addEventListener("blur", this.onBlur)
    canvas.addEventListener("pointerdown", this.onPointerDown)
    canvas.addEventListener("pointermove", this.onPointerMove)
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
      canvas.addEventListener(type, this.clearTarget)
    }

    this.reset()
    this.state = "intro"
    this.modal(
      "Hello, little hopper.",
      "Gather 12 carrots for your cozy burrow. Watch out for the foxes, and use a quick dash when they get close!",
      "Let's hop →",
    )
    this.raf = requestAnimationFrame((now) => this.frame(now))
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    removeEventListener("keydown", this.onKeyDown)
    removeEventListener("keyup", this.onKeyUp)
    removeEventListener("blur", this.onBlur)
    this.canvas.removeEventListener("pointerdown", this.onPointerDown)
    this.canvas.removeEventListener("pointermove", this.onPointerMove)
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
      this.canvas.removeEventListener(type, this.clearTarget)
    }
  }

  private reset(): void {
    this.bunny = { x: 110, y: 300, dx: 1, dy: 0 }
    this.score = 0
    this.health = 3
    this.cooldown = 0
    this.burst = 0
    this.invulnerable = 0
    this.time = 0
    this.particles = []
    this.carrots = Array.from({ length: 12 }, (_, i) => ({
      x: 245 + (i % 4) * 174 + Math.sin(i * 8) * 32,
      y: 100 + Math.floor(i / 4) * 165 + Math.cos(i * 5) * 22,
      taken: false,
    }))
    this.foxes = [
      { x: 850, y: 130, phase: 0 },
      { x: 760, y: 420, phase: 3 },
      { x: 520, y: 270, phase: 5 },
    ]
    this.target = null
    this.keys.clear()
    this.state = "playing"
    this.ui.overlay.hidden = true
    this.ui.pause.textContent = "Pause"
    this.sync()
  }

  private sync(): void {
    this.ui.score.textContent = `${this.score} / 12`
    this.ui.hearts.textContent = `${"♥ ".repeat(this.health)}${"♡ ".repeat(3 - this.health)}`
    this.ui.dash.textContent = this.cooldown > 0 ? `${this.cooldown.toFixed(1)}s` : "Ready"
  }

  private modal(title: string, message: string, label: string): void {
    this.ui.title.textContent = title
    this.ui.message.textContent = message
    this.ui.play.textContent = label
    this.ui.overlay.hidden = false
  }

  private pause(): void {
    if (this.state === "playing") {
      this.state = "paused"
      this.keys.clear()
      this.target = null
      this.modal(
        "A moment in the meadow.",
        "Your carrots can wait. Take a breath, little bunny.",
        "Keep hopping →",
      )
      this.ui.pause.textContent = "Resume"
    } else if (this.state === "paused") {
      this.state = "playing"
      this.ui.overlay.hidden = true
      this.ui.pause.textContent = "Pause"
    }
  }

  private dash(): void {
    if (this.state === "playing" && this.cooldown <= 0) {
      this.burst = 0.19
      this.cooldown = 2.2
    }
  }

  private point(e: PointerEvent): void {
    const r = this.canvas.getBoundingClientRect()
    this.target = {
      x: ((e.clientX - r.left) * W) / r.width,
      y: ((e.clientY - r.top) * H) / r.height,
    }
  }

  private puff(x: number, y: number, color: string): void {
    for (let i = 0; i < 10; i += 1) {
      this.particles.push({
        x,
        y,
        vx: Math.cos(i) * 65,
        vy: Math.sin(i) * 65,
        life: 0.55,
        color,
      })
    }
  }

  private async unlock(id: string): Promise<void> {
    await getPlatform().achievements.unlock(id)
  }

  private update(dt: number): void {
    this.time += dt
    this.cooldown = Math.max(0, this.cooldown - dt)
    this.burst = Math.max(0, this.burst - dt)
    this.invulnerable = Math.max(0, this.invulnerable - dt)

    let dx =
      Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) -
      Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft"))
    let dy =
      Number(this.keys.has("KeyS") || this.keys.has("ArrowDown")) -
      Number(this.keys.has("KeyW") || this.keys.has("ArrowUp"))

    if (!dx && !dy && this.target) {
      dx = this.target.x - this.bunny.x
      dy = this.target.y - this.bunny.y
      if (Math.hypot(dx, dy) < 7) {
        dx = 0
        dy = 0
      }
    }

    const length = Math.hypot(dx, dy)
    if (length) {
      this.bunny.dx = dx / length
      this.bunny.dy = dy / length
    }
    if (length || this.burst > 0) {
      const speed = this.burst > 0 ? 610 : 190
      this.bunny.x = Math.max(24, Math.min(W - 24, this.bunny.x + this.bunny.dx * speed * dt))
      this.bunny.y = Math.max(35, Math.min(H - 24, this.bunny.y + this.bunny.dy * speed * dt))
    }

    for (const c of this.carrots) {
      if (!c.taken && Math.hypot(c.x - this.bunny.x, c.y - this.bunny.y) < 26) {
        c.taken = true
        this.score += 1
        this.puff(c.x, c.y, "#ffce74")
        if (this.score === 12) {
          void this.unlock("BASKET_FULL")
        }
      }
    }

    for (const f of this.foxes) {
      let fx = this.bunny.x - f.x
      let fy = this.bunny.y - f.y
      const distance = Math.hypot(fx, fy)
      if (distance > 240 || Math.hypot(this.bunny.x - HOME.x, this.bunny.y - HOME.y) < 85) {
        fx = Math.cos(this.time * 0.65 + f.phase)
        fy = Math.sin(this.time * 0.9 + f.phase)
      }
      const norm = Math.hypot(fx, fy) || 1
      f.x = Math.max(205, Math.min(W - 25, f.x + (fx / norm) * 78 * dt))
      f.y = Math.max(40, Math.min(H - 30, f.y + (fy / norm) * 78 * dt))
      if (distance < 30 && this.invulnerable <= 0 && this.burst <= 0) {
        this.health -= 1
        this.invulnerable = 1.8
        this.puff(this.bunny.x, this.bunny.y, "#fffaf0")
        if (this.health === 0) {
          this.state = "lost"
          this.modal(
            "A little rest, then retry.",
            "Those foxes are quick! Dash past them with Space, and recover near your burrow.",
            "Try again →",
          )
          break
        }
      }
    }

    this.particles = this.particles.filter((p) => {
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      return p.life > 0
    })

    if (
      this.state === "playing" &&
      this.score === 12 &&
      Math.hypot(this.bunny.x - HOME.x, this.bunny.y - HOME.y) < 62
    ) {
      this.state = "won"
      void this.unlock("FIRST_HOP")
      void this.unlock("HOME_SAFE")
      this.modal(
        "Home, sweet burrow!",
        "Twelve crunchy carrots and one happy bunny. The meadow is a little sweeter with you in it.",
        "Play again →",
      )
    }

    this.sync()
  }

  private ellipse(x: number, y: number, rx: number, ry: number, color: string): void {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private animal(x: number, y: number, fox = false): void {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(x, y)
    this.ellipse(0, 15, 20, 7, "#425b3825")
    if (fox) {
      ctx.fillStyle = "#c9733c"
      ctx.beginPath()
      ctx.moveTo(-17, -9)
      ctx.lineTo(-15, -29)
      ctx.lineTo(-3, -17)
      ctx.lineTo(12, -28)
      ctx.lineTo(18, -6)
      ctx.closePath()
      ctx.fill()
      this.ellipse(0, 0, 19, 19, "#df8b4c")
      this.ellipse(0, 8, 12, 10, "#ffe9c6")
      this.ellipse(-7, -1, 2, 2, "#3d4934")
      this.ellipse(7, -1, 2, 2, "#3d4934")
      this.ellipse(0, 7, 3, 2, "#3d4934")
    } else {
      this.ellipse(-8, -23, 6, 20, "#fffaf0")
      this.ellipse(8, -25, 6, 21, "#fffaf0")
      this.ellipse(-8, -25, 2.5, 13, "#e8b3a6")
      this.ellipse(8, -27, 2.5, 14, "#e8b3a6")
      this.ellipse(0, 3, 18, 19, "#fffaf0")
      this.ellipse(-11, 17, 7, 4, "#fffaf0")
      this.ellipse(11, 17, 7, 4, "#fffaf0")
      this.ellipse(-6, -1, 2, 2.5, "#3d4934")
      this.ellipse(6, -1, 2, 2.5, "#3d4934")
      this.ellipse(0, 5, 2.5, 2, "#db9f98")
      this.ellipse(-11, 5, 3, 2, "#efc9b9")
      this.ellipse(11, 5, 3, 2, "#efc9b9")
    }
    ctx.restore()
  }

  private draw(): void {
    const ctx = this.ctx
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#bed593"
    ctx.fillRect(0, 0, W, H)
    this.ellipse(540, 280, 440, 225, "#c7db9f")
    ctx.strokeStyle = "#d7dfab"
    ctx.lineWidth = 66
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(110, 290)
    ctx.bezierCurveTo(370, 470, 480, 140, 850, 240)
    ctx.stroke()

    for (const d of this.decorations) {
      if (d.s === 0) {
        this.ellipse(d.x, d.y, 3, 3, "#fff8d8")
        this.ellipse(d.x + 4, d.y + 2, 3, 3, "#fff8d8")
        this.ellipse(d.x + 2, d.y + 1, 1.5, 1.5, "#e3b95e")
      } else {
        ctx.strokeStyle = "#94b67570"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(d.x - 3, d.y - 5)
        ctx.lineTo(d.x, d.y)
        ctx.lineTo(d.x + 4, d.y - 6)
        ctx.stroke()
      }
    }

    this.ellipse(105, 286, 78, 63, "#a5bf78")
    this.ellipse(105, 280, 50, 42, "#728d52")
    this.ellipse(105, 291, 32, 29, "#526943")
    this.ellipse(105, 310, 39, 9, "#dec59a")
    ctx.fillStyle = "#fff9e7"
    ctx.font = "bold 12px system-ui"
    ctx.textAlign = "center"
    ctx.fillText(this.score === 12 ? "COME HOME!" : "COZY BURROW", 105, 222)

    for (const c of this.carrots) {
      if (c.taken) {
        continue
      }
      ctx.save()
      ctx.translate(c.x, c.y + Math.sin(this.time * 3 + c.x) * 3)
      ctx.rotate(0.3)
      ctx.fillStyle = "#e99146"
      ctx.beginPath()
      ctx.moveTo(-7, -7)
      ctx.quadraticCurveTo(-9, 1, 0, 16)
      ctx.quadraticCurveTo(10, 0, 7, -7)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = "#648344"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(-5, -16)
      ctx.moveTo(0, -6)
      ctx.lineTo(4, -18)
      ctx.stroke()
      ctx.restore()
    }

    for (const f of this.foxes) {
      this.animal(f.x, f.y, true)
    }

    ctx.globalAlpha = this.invulnerable > 0 && Math.sin(this.time * 30) > 0 ? 0.4 : 1
    this.animal(this.bunny.x, this.bunny.y)
    ctx.globalAlpha = 1

    for (const p of this.particles) {
      this.ellipse(p.x, p.y, 3, 3, p.color)
    }

    if (this.state === "playing") {
      ctx.fillStyle = "#395736"
      ctx.font = "13px system-ui"
      ctx.fillText(
        this.score === 12
          ? "Your basket is full. Head back to the burrow!"
          : "Collect carrots • Dodge foxes • Find your way home",
        W / 2,
        H - 17,
      )
    }
  }

  private frame(now: number): void {
    if (this.disposed) {
      return
    }
    const dt = Math.min((now - this.last) / 1000, 0.033)
    this.last = now
    if (this.state === "playing") {
      this.update(dt)
    }
    this.draw()
    this.raf = requestAnimationFrame((t) => this.frame(t))
  }
}
