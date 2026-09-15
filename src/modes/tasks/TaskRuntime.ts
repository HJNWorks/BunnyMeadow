import { getDifficulty } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { getMeadowMap, type MeadowMapDef } from "../../core/maps"
import { Spawner, type SpawnedEnemy } from "../../systems/Spawner"
import { drawBunny, type BunnyCosmetics } from "../../render/drawBunny"
import type { AccessoryOption, EarsOption, FurOption } from "../../core/save"
import type { ResolvedTask, TaskId } from "./TaskRunner"

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

interface Kit extends Vec {
  found: boolean
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

export interface TaskUi {
  score: HTMLElement
  hearts: HTMLElement
  dash: HTMLElement
  timer: HTMLElement
  mapName: HTMLElement
  taskName: HTMLElement
  pause: HTMLButtonElement
  overlay: HTMLElement
  title: HTMLElement
  message: HTMLElement
  play: HTMLButtonElement
  toSelect: HTMLButtonElement
  touchDash: HTMLButtonElement
  pausePanel: HTMLElement
  resume: HTMLButtonElement
  openSettings: HTMLButtonElement
  quitSelect: HTMLButtonElement
}

export type TaskCallbacks = {
  onOpenSettings: () => void
  onQuitToSelect: () => void
}

const W = 960
const H = 540

export class TaskRuntime {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private ui: TaskUi
  private callbacks: TaskCallbacks
  private task: ResolvedTask
  private state: GameState = "intro"
  private bunny: Bunny = { x: 110, y: 300, dx: 1, dy: 0 }
  private carrots: Carrot[] = []
  private kits: Kit[] = []
  private enemies: SpawnedEnemy[] = []
  private particles: Particle[] = []
  private decorations: Decoration[] = []
  private map: MeadowMapDef
  private cosmetics: BunnyCosmetics = { fur: "cream", ears: "upright", accessory: "none" }
  private playerName = "Mei"
  private spawner = new Spawner()
  private score = 0
  private goal = 0
  private health = 3
  private maxHearts = 3
  private cooldown = 0
  private dashCooldownMax = 2.2
  private invulnMax = 1.8
  private speedMult = 1
  private detectionRadius = 240
  private burst = 0
  private invulnerable = 0
  private time = 0
  private timerLeft = 0
  private timed = false
  private last = 0
  private target: Vec | null = null
  private raf = 0
  private disposed = false
  private invincible = false
  private slowTime = false
  private autoDash = false
  private wonSaved = false
  private waveTimer = 0
  private waveIndex = 0

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

  private onBlur = (): void => {
    getInput().clearKeys()
    if (this.state === "playing") {
      this.pause()
    }
  }

  constructor(
    canvas: HTMLCanvasElement,
    ui: TaskUi,
    callbacks: TaskCallbacks,
    task: ResolvedTask,
  ) {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Canvas 2D unavailable")
    }
    this.canvas = canvas
    this.ctx = ctx
    this.ui = ui
    this.callbacks = callbacks
    this.task = task
    this.map = getMeadowMap(task.mapId)

    this.applyTuning()
    getInput().start()

    this.ui.play.onclick = () => this.onPrimaryAction()
    this.ui.toSelect.onclick = () => this.callbacks.onQuitToSelect()
    this.ui.pause.onclick = () => this.pause()
    this.ui.resume.onclick = () => {
      if (this.state === "paused") {
        this.pause()
      }
    }
    this.ui.openSettings.onclick = () => this.callbacks.onOpenSettings()
    this.ui.quitSelect.onclick = () => this.callbacks.onQuitToSelect()
    this.ui.touchDash.onclick = () => this.dash()

    addEventListener("blur", this.onBlur)
    canvas.addEventListener("pointerdown", this.onPointerDown)
    canvas.addEventListener("pointermove", this.onPointerMove)
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
      canvas.addEventListener(type, this.clearTarget)
    }

    this.showIntro()
    this.raf = requestAnimationFrame((now) => this.frame(now))
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    getInput().stop()
    removeEventListener("blur", this.onBlur)
    this.canvas.removeEventListener("pointerdown", this.onPointerDown)
    this.canvas.removeEventListener("pointermove", this.onPointerMove)
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
      this.canvas.removeEventListener(type, this.clearTarget)
    }
  }

  getTaskId(): TaskId {
    return this.task.id
  }

  private applyTuning(): void {
    const save = getSave()
    const diff = this.task.difficulty
    this.maxHearts = diff.hearts
    this.dashCooldownMax = diff.dashCooldown
    this.invulnMax = diff.invulnerabilityWindow
    this.speedMult = diff.enemySpeedMultiplier
    this.detectionRadius = diff.detectionRadius
    this.timed = this.task.timerSeconds > 0
    this.timerLeft = this.task.timerSeconds
    this.invincible = save.settings.accessibility.invincible
    this.slowTime = save.settings.accessibility.slowTime
    this.autoDash = save.settings.accessibility.autoDash
    this.cosmetics = {
      fur: save.player.fur as FurOption,
      ears: save.player.ears as EarsOption,
      accessory: save.player.accessory as AccessoryOption,
    }
    this.playerName = save.player.name || "Mei"
    getInput().setBindings(save.settings.bindings)
    this.goal = this.task.kind === "hide_and_seek" ? this.task.kitCount : this.task.timerSeconds
  }

  private showIntro(): void {
    this.state = "intro"
    this.ui.pausePanel.hidden = true
    this.modal(
      this.task.name,
      this.task.description,
      "Let's hop →",
      false,
    )
    this.sync()
  }

  private onPrimaryAction(): void {
    if (this.state === "paused") {
      this.pause()
      return
    }
    if (this.state === "intro" || this.state === "lost" || this.state === "won") {
      this.reset()
    }
  }

  private reset(): void {
    this.applyTuning()
    this.map = getMeadowMap(this.task.mapId)
    const spawn = this.map.playerSpawn
    this.bunny = { x: spawn.x, y: spawn.y, dx: 1, dy: 0 }
    this.score = 0
    this.health = this.maxHearts
    this.cooldown = 0
    this.burst = 0
    this.invulnerable = 0
    this.time = 0
    this.timerLeft = this.task.timerSeconds
    this.wonSaved = false
    this.waveTimer = 0
    this.waveIndex = 0
    this.particles = []
    this.carrots = []
    this.kits = []

    if (this.task.kind === "hide_and_seek") {
      const spots = [...this.map.itemSpawns, ...this.map.carrotSpawns]
      for (let i = 0; i < this.task.kitCount; i += 1) {
        const spot = spots[i % spots.length]
        const jitter = i * 17
        this.kits.push({
          x: Math.max(40, Math.min(W - 40, spot.x + ((jitter * 13) % 40) - 20)),
          y: Math.max(40, Math.min(H - 40, spot.y + ((jitter * 7) % 36) - 18)),
          found: false,
        })
      }
    }

    this.enemies = this.spawner.spawnRoster(
      this.task.enemyIds,
      this.task.enemyCount,
      this.map.enemySpawns,
    )
    const seed = this.map.decorations.seed
    this.decorations = Array.from({ length: this.map.decorations.count }, (_, i) => ({
      x: (i * 137.5 + 39 + seed * 17) % W,
      y: (i * 83.7 + 25 + seed * 11) % H,
      s: i % 4,
    }))
    this.target = null
    getInput().clearKeys()
    this.state = "playing"
    this.ui.overlay.hidden = true
    this.ui.pausePanel.hidden = true
    this.ui.pause.textContent = "Pause"
    this.sync()
  }

  private sync(): void {
    if (this.task.kind === "night_watch") {
      const held = Math.min(
        this.task.timerSeconds,
        Math.max(0, this.task.timerSeconds - this.timerLeft),
      )
      this.ui.score.textContent = `${Math.floor(held)} / ${this.task.timerSeconds}s`
    } else {
      this.ui.score.textContent = `${this.score} / ${this.goal}`
    }
    const empty = Math.max(0, this.maxHearts - this.health)
    this.ui.hearts.textContent = `${"♥ ".repeat(this.health)}${"♡ ".repeat(empty)}`.trim()
    this.ui.dash.textContent = this.cooldown > 0 ? `${this.cooldown.toFixed(1)}s` : "Ready"
    this.ui.mapName.textContent = this.map.name
    this.ui.taskName.textContent = this.task.name
    const timerWrap = this.ui.timer.parentElement
    if (this.timed) {
      this.ui.timer.hidden = false
      if (timerWrap) {
        timerWrap.hidden = false
      }
      const label =
        this.task.kind === "night_watch"
          ? `Dawn ${Math.max(0, Math.ceil(this.timerLeft))}s`
          : `${Math.max(0, Math.ceil(this.timerLeft))}s`
      this.ui.timer.textContent = label
    } else {
      this.ui.timer.hidden = true
      if (timerWrap) {
        timerWrap.hidden = true
      }
      this.ui.timer.textContent = ""
    }
  }

  private modal(title: string, message: string, label: string, showSelect: boolean): void {
    this.ui.title.textContent = title
    this.ui.message.textContent = message
    this.ui.play.textContent = label
    this.ui.toSelect.hidden = !showSelect
    this.ui.overlay.hidden = false
    this.ui.pausePanel.hidden = true
  }

  private pause(): void {
    if (this.state === "playing") {
      this.state = "paused"
      getInput().clearKeys()
      this.target = null
      this.ui.overlay.hidden = true
      this.ui.pausePanel.hidden = false
      this.ui.pause.textContent = "Resume"
    } else if (this.state === "paused") {
      this.state = "playing"
      this.ui.pausePanel.hidden = true
      this.ui.pause.textContent = "Pause"
    }
  }

  private dash(): void {
    if (this.state === "playing" && this.cooldown <= 0) {
      this.burst = 0.19
      this.cooldown = this.dashCooldownMax
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

  private async onWin(): Promise<void> {
    if (this.wonSaved) {
      return
    }
    this.wonSaved = true
    const save = getSave()
    if (!save.progress.tasksCompleted.includes(this.task.id)) {
      save.progress.tasksCompleted.push(this.task.id)
    }
    addPantryCarrots(save, this.task.pantryReward)
    await persistSave()
  }

  private resolveObstacle(x: number, y: number, r: number): Vec {
    let nx = x
    let ny = y
    for (const o of this.map.obstacles) {
      const cx = Math.max(o.x, Math.min(nx, o.x + o.w))
      const cy = Math.max(o.y, Math.min(ny, o.y + o.h))
      const dx = nx - cx
      const dy = ny - cy
      const d = Math.hypot(dx, dy)
      if (d < r && d > 0) {
        const push = (r - d) / d
        nx += dx * push
        ny += dy * push
      } else if (d === 0) {
        nx = o.x - r
      }
    }
    return { x: nx, y: ny }
  }

  private nearBurrow(x: number, y: number): boolean {
    return Math.hypot(x - this.map.burrow.x, y - this.map.burrow.y) < this.map.safeRadius
  }

  private chaseIgnoresBurrow(): boolean {
    return this.task.kind === "night_watch"
  }

  private hurt(): void {
    if (this.invulnerable > 0 || this.burst > 0 || this.invincible) {
      return
    }
    this.health -= 1
    this.invulnerable = this.invulnMax
    this.puff(this.bunny.x, this.bunny.y, "#fffaf0")
    if (this.health <= 0) {
      this.state = "lost"
      this.modal(
        "A little rest, then retry.",
        "Try again when you are ready.",
        "Try again →",
        true,
      )
    }
  }

  private updateEnemy(enemy: SpawnedEnemy, dt: number): void {
    const speed = enemy.speed * this.speedMult
    const sense = enemy.senseRange || this.detectionRadius
    let fx = 0
    let fy = 0

    if (enemy.archetype === "patrol") {
      fx = enemy.patrolDir
      fy = Math.sin(this.time * 0.8 + enemy.phase) * 0.35
      if (enemy.x < 200 || enemy.x > W - 40) {
        enemy.patrolDir *= -1
      }
    } else if (enemy.archetype === "ranged_lob") {
      const dx = this.bunny.x - enemy.x
      const dy = this.bunny.y - enemy.y
      const distance = Math.hypot(dx, dy)
      if (distance > sense || (!this.chaseIgnoresBurrow() && this.nearBurrow(this.bunny.x, this.bunny.y))) {
        fx = Math.cos(this.time * 0.5 + enemy.phase)
        fy = Math.sin(this.time * 0.7 + enemy.phase)
      } else if (distance > enemy.attackRange * 0.55) {
        fx = dx
        fy = dy
      }
      enemy.attackTimer = Math.max(0, enemy.attackTimer - dt)
      if (
        distance < enemy.attackRange &&
        enemy.attackTimer <= 0 &&
        (this.chaseIgnoresBurrow() || !this.nearBurrow(this.bunny.x, this.bunny.y))
      ) {
        const n = Math.hypot(dx, dy) || 1
        enemy.projectile = {
          x: enemy.x,
          y: enemy.y,
          vx: (dx / n) * 160,
          vy: (dy / n) * 160 - 40,
          life: 2.2,
        }
        enemy.attackTimer = Math.max(0.8, enemy.attackCooldown || getDifficulty(getSave()).attackCooldown)
      }
    } else {
      fx = this.bunny.x - enemy.x
      fy = this.bunny.y - enemy.y
      const distance = Math.hypot(fx, fy)
      if (distance > sense || (!this.chaseIgnoresBurrow() && this.nearBurrow(this.bunny.x, this.bunny.y))) {
        fx = Math.cos(this.time * 0.65 + enemy.phase)
        fy = Math.sin(this.time * 0.9 + enemy.phase)
      }
    }

    const norm = Math.hypot(fx, fy) || 1
    let nx = enemy.x + (fx / norm) * speed * dt
    let ny = enemy.y + (fy / norm) * speed * dt
    nx = Math.max(40, Math.min(W - 25, nx))
    ny = Math.max(40, Math.min(H - 30, ny))
    const resolved = this.resolveObstacle(nx, ny, 16)
    enemy.x = resolved.x
    enemy.y = resolved.y

    const distance = Math.hypot(this.bunny.x - enemy.x, this.bunny.y - enemy.y)
    if (this.autoDash && distance < 40 && this.cooldown <= 0) {
      this.dash()
    }
    if (distance < 30) {
      this.hurt()
    }

    if (enemy.projectile) {
      const p = enemy.projectile
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 90 * dt
      if (Math.hypot(p.x - this.bunny.x, p.y - this.bunny.y) < 22) {
        this.hurt()
        enemy.projectile = null
      } else if (p.life <= 0 || p.x < 0 || p.x > W || p.y > H) {
        enemy.projectile = null
      }
    }
  }

  private update(dt: number): void {
    const input = getInput().snapshot()
    if (input.pausePressed && (this.state === "playing" || this.state === "paused")) {
      this.pause()
      return
    }
    if (input.confirmPressed) {
      if (this.state === "paused") {
        this.pause()
        return
      }
      if (this.state === "intro" || this.state === "lost" || this.state === "won") {
        this.reset()
        return
      }
    }
    if (input.cancelPressed && (this.state === "won" || this.state === "lost" || this.state === "paused")) {
      this.callbacks.onQuitToSelect()
      return
    }
    if (input.dashPressed) {
      this.dash()
    }
    if (this.state !== "playing") {
      return
    }

    this.time += dt
    this.cooldown = Math.max(0, this.cooldown - dt)
    this.burst = Math.max(0, this.burst - dt)
    this.invulnerable = Math.max(0, this.invulnerable - dt)
    if (this.timed) {
      this.timerLeft -= dt
      if (this.timerLeft <= 0) {
        if (this.task.kind === "night_watch") {
          this.state = "won"
          void this.onWin()
          this.modal(
            "Dawn breaks.",
            `${this.playerName} held the burrow through the night.`,
            "Play again →",
            true,
          )
          this.sync()
          return
        }
        this.state = "lost"
        this.modal("Time's up.", "The moon task slips away. Try a quicker hop.", "Try again →", true)
        return
      }
    }

    if (this.task.kind === "night_watch") {
      this.waveTimer += dt
      if (this.waveTimer >= this.task.waveIntervalSeconds) {
        this.waveTimer = 0
        this.waveIndex += 1
        const spot = this.map.enemySpawns[this.waveIndex % this.map.enemySpawns.length]
        const id = this.task.enemyIds[this.waveIndex % this.task.enemyIds.length]
        const spawned = this.spawner.spawn(id, spot.x, spot.y, this.waveIndex * 1.3)
        if (spawned) {
          this.enemies.push(spawned)
        }
      }
    }

    let dx = input.moveX
    let dy = input.moveY
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
      let nx = Math.max(24, Math.min(W - 24, this.bunny.x + this.bunny.dx * speed * dt))
      let ny = Math.max(35, Math.min(H - 24, this.bunny.y + this.bunny.dy * speed * dt))
      const resolved = this.resolveObstacle(nx, ny, 18)
      this.bunny.x = resolved.x
      this.bunny.y = resolved.y
    }

    if (this.nearBurrow(this.bunny.x, this.bunny.y) && this.health < this.maxHearts) {
      this.health = this.maxHearts
    }

    if (this.task.kind === "hide_and_seek") {
      for (const kit of this.kits) {
        if (!kit.found && Math.hypot(kit.x - this.bunny.x, kit.y - this.bunny.y) < 28) {
          kit.found = true
          this.score += 1
          this.puff(kit.x, kit.y, "#f2a0b8")
        }
      }
    }

    for (const enemy of this.enemies) {
      this.updateEnemy(enemy, dt)
      if (this.state !== "playing") {
        break
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
      this.task.kind === "hide_and_seek" &&
      this.score >= this.goal
    ) {
      this.state = "won"
      void this.onWin()
      this.modal(
        "Task complete!",
        `${this.playerName} finished ${this.task.name}. Pantry carrots tucked away.`,
        "Play again →",
        true,
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

  private drawEnemy(enemy: SpawnedEnemy): void {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(enemy.x, enemy.y)
    this.ellipse(0, 15, 18, 6, "#425b3825")
    if (enemy.archetype === "patrol") {
      this.ellipse(0, 4, 16, 12, "#8a6b4a")
      this.ellipse(0, 2, 14, 10, "#a8845c")
      for (let i = -3; i <= 3; i += 1) {
        ctx.strokeStyle = "#5c4030"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(i * 3, -6)
        ctx.lineTo(i * 3, -14)
        ctx.stroke()
      }
      this.ellipse(-5, 0, 1.5, 1.5, "#2d2418")
      this.ellipse(5, 0, 1.5, 1.5, "#2d2418")
    } else if (enemy.archetype === "ranged_lob") {
      this.ellipse(0, 0, 14, 10, "#2a2a32")
      this.ellipse(-10, -4, 8, 4, "#1e1e26")
      this.ellipse(10, -4, 8, 4, "#1e1e26")
      this.ellipse(-4, -2, 1.5, 1.5, "#f0f0f0")
      this.ellipse(4, -2, 1.5, 1.5, "#f0f0f0")
    } else {
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
    }
    ctx.restore()
    if (enemy.projectile) {
      this.ellipse(enemy.projectile.x, enemy.projectile.y, 6, 6, "#4a3a2a")
    }
  }

  private draw(): void {
    const ctx = this.ctx
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = this.map.palette.grass
    ctx.fillRect(0, 0, W, H)
    this.ellipse(540, 280, 440, 225, this.map.palette.glow)
    ctx.strokeStyle = this.map.palette.path
    ctx.lineWidth = 66
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(this.map.burrow.x, this.map.burrow.y + 15)
    ctx.bezierCurveTo(370, 470, 480, 140, 850, 240)
    ctx.stroke()

    for (const o of this.map.obstacles) {
      ctx.fillStyle = "#6b7a4a88"
      ctx.fillRect(o.x, o.y, o.w, o.h)
    }

    for (const d of this.decorations) {
      if (d.s === 0) {
        this.ellipse(d.x, d.y, 3, 3, "#fff8d8")
        this.ellipse(d.x + 4, d.y + 2, 3, 3, "#fff8d8")
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

    const burrow = this.map.burrow
    this.ellipse(burrow.x, burrow.y + 20, 48, 18, "#5c6b3a55")
    this.ellipse(burrow.x, burrow.y, 42, 28, "#6a5538")
    this.ellipse(burrow.x, burrow.y - 4, 28, 18, "#2a2218")

    for (const c of this.carrots) {
      if (c.taken) {
        continue
      }
      this.ellipse(c.x, c.y + 8, 7, 4, "#425b3820")
      ctx.fillStyle = "#f0a04a"
      ctx.beginPath()
      ctx.ellipse(c.x, c.y, 8, 12, 0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#6a9a4a"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(c.x, c.y - 10)
      ctx.lineTo(c.x - 4, c.y - 18)
      ctx.moveTo(c.x, c.y - 10)
      ctx.lineTo(c.x + 5, c.y - 17)
      ctx.stroke()
    }

    for (const kit of this.kits) {
      if (kit.found) {
        continue
      }
      const pulse = 0.55 + Math.sin(this.time * 2.4 + kit.x * 0.02) * 0.2
      ctx.save()
      ctx.globalAlpha = pulse
      ctx.translate(kit.x, kit.y)
      ctx.scale(0.55, 0.55)
      drawBunny(ctx, 0, 0, {
        fur: "moon-white",
        ears: "lop",
        accessory: "blossom",
      })
      ctx.restore()
    }

    for (const enemy of this.enemies) {
      this.drawEnemy(enemy)
    }

    if (this.invulnerable <= 0 || Math.floor(this.time * 12) % 2 === 0) {
      drawBunny(this.ctx, this.bunny.x, this.bunny.y, this.cosmetics)
    }

    for (const p of this.particles) {
      this.ellipse(p.x, p.y, 3, 3, p.color)
    }
  }

  private frame(now: number): void {
    if (this.disposed) {
      return
    }
    const raw = this.last ? (now - this.last) / 1000 : 0.016
    this.last = now
    let dt = Math.min(0.033, raw)
    if (this.slowTime && this.state === "playing") {
      dt *= 0.7
    }
    this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame((t) => this.frame(t))
  }
}
