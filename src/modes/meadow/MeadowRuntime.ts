import { getPlatform } from "../../core/platform"
import { getDifficulty, listDifficultyIds, type DifficultyParams } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots, isMapUnlocked, syncMeadowMapUnlocks } from "../../core/unlocks"
import { getMeadowMap, listMeadowMaps, type MeadowMapDef } from "../../core/maps"
import { Spawner, type SpawnedEnemy } from "../../systems/Spawner"
import { drawBunny, type BunnyCosmetics } from "../../render/drawBunny"
import type { AccessoryOption, DifficultyId, EarsOption, FurOption } from "../../core/save"

type GameState = "lobby" | "intro" | "playing" | "paused" | "lost" | "won"

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

interface Pickup extends Vec {
  kind: "leaf" | "dew"
  taken: boolean
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

export interface MeadowUi {
  score: HTMLElement
  hearts: HTMLElement
  dash: HTMLElement
  timer: HTMLElement
  mapName: HTMLElement
  pause: HTMLButtonElement
  overlay: HTMLElement
  title: HTMLElement
  message: HTMLElement
  play: HTMLButtonElement
  touchDash: HTMLButtonElement
  lobby: HTMLElement
  mapList: HTMLElement
  difficultyList: HTMLElement
  preview: HTMLCanvasElement
  startRun: HTMLButtonElement
  toLobby: HTMLButtonElement
  pausePanel: HTMLElement
  resume: HTMLButtonElement
  openSettings: HTMLButtonElement
  quitModes: HTMLButtonElement
}

export type MeadowCallbacks = {
  onOpenSettings: () => void
  onQuitToModes: () => void
}

const W = 960
const H = 540

export class MeadowRuntime {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private ui: MeadowUi
  private callbacks: MeadowCallbacks
  private state: GameState = "lobby"
  private bunny: Bunny = { x: 110, y: 300, dx: 1, dy: 0 }
  private carrots: Carrot[] = []
  private enemies: SpawnedEnemy[] = []
  private pickups: Pickup[] = []
  private particles: Particle[] = []
  private decorations: Decoration[] = []
  private map: MeadowMapDef = getMeadowMap("meadow_home")
  private selectedMapId = "meadow_home"
  private cosmetics: BunnyCosmetics = { fur: "cream", ears: "upright", accessory: "none" }
  private playerName = "Mei"
  private diff!: DifficultyParams
  private spawner = new Spawner()
  private score = 0
  private carrotGoal = 12
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

  constructor(canvas: HTMLCanvasElement, ui: MeadowUi, callbacks: MeadowCallbacks) {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Canvas 2D unavailable")
    }
    this.canvas = canvas
    this.ctx = ctx
    this.ui = ui
    this.callbacks = callbacks

    this.applySaveTuning()
    getInput().start()

    this.ui.play.onclick = () => this.onPrimaryAction()
    this.ui.toLobby.onclick = () => this.showLobby()
    this.ui.startRun.onclick = () => this.beginIntro()
    this.ui.pause.onclick = () => this.pause()
    this.ui.resume.onclick = () => {
      if (this.state === "paused") {
        this.pause()
      }
    }
    this.ui.openSettings.onclick = () => this.callbacks.onOpenSettings()
    this.ui.quitModes.onclick = () => this.callbacks.onQuitToModes()
    this.ui.touchDash.onclick = () => this.dash()

    addEventListener("blur", this.onBlur)
    canvas.addEventListener("pointerdown", this.onPointerDown)
    canvas.addEventListener("pointermove", this.onPointerMove)
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
      canvas.addEventListener(type, this.clearTarget)
    }

    this.showLobby()
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

  private applySaveTuning(): void {
    const save = getSave()
    syncMeadowMapUnlocks(save)
    this.diff = getDifficulty(save)
    this.maxHearts = this.diff.hearts
    this.carrotGoal = this.diff.carrotGoal
    this.dashCooldownMax = this.diff.dashCooldown
    this.invulnMax = this.diff.invulnerabilityWindow
    this.speedMult = this.diff.enemySpeedMultiplier
    this.detectionRadius = this.diff.detectionRadius
    this.timed = this.diff.timerSeconds > 0
    this.timerLeft = this.diff.timerSeconds
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
    if (!isMapUnlocked(save, this.selectedMapId)) {
      this.selectedMapId = "meadow_home"
    }
    this.map = getMeadowMap(this.selectedMapId)
  }

  private showLobby(): void {
    this.applySaveTuning()
    this.state = "lobby"
    this.ui.overlay.hidden = true
    this.ui.pausePanel.hidden = true
    this.ui.toLobby.hidden = true
    this.ui.lobby.hidden = false
    this.fillDifficultyChips()
    this.renderMapCards()
    this.drawPreview()
    this.sync()
  }

  private difficultyLabel(id: DifficultyId): string {
    const labels: Record<DifficultyId, string> = {
      sprout: "Sprout",
      hopper: "Hopper",
      wildhare: "Wildhare",
      moonlit: "Moonlit",
      hardcore: "Hardcore",
    }
    return labels[id] ?? id
  }

  private fillDifficultyChips(): void {
    const current = getSave().settings.difficulty
    this.ui.difficultyList.innerHTML = ""
    for (const id of listDifficultyIds()) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = `meadow-diff-chip${id === current ? " selected" : ""}`
      btn.dataset.id = id
      btn.setAttribute("role", "option")
      btn.setAttribute("aria-selected", id === current ? "true" : "false")
      btn.textContent = this.difficultyLabel(id)
      btn.onclick = () => {
        void this.onDifficultyChange(id)
      }
      this.ui.difficultyList.appendChild(btn)
    }
  }

  private async onDifficultyChange(id: DifficultyId): Promise<void> {
    const save = getSave()
    save.settings.difficulty = id
    await persistSave()
    this.applySaveTuning()
    this.fillDifficultyChips()
    this.sync()
  }

  private renderMapCards(): void {
    const save = getSave()
    this.ui.mapList.innerHTML = ""
    for (const map of listMeadowMaps()) {
      const unlocked = isMapUnlocked(save, map.id)
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = `meadow-map-card${this.selectedMapId === map.id ? " selected" : ""}${unlocked ? "" : " locked"}`
      btn.disabled = !unlocked
      btn.innerHTML = `<strong>${map.name}</strong><span>${unlocked ? map.env : "locked"}</span>`
      btn.onclick = () => {
        this.selectedMapId = map.id
        this.map = getMeadowMap(map.id)
        this.renderMapCards()
        this.drawPreview()
        this.sync()
      }
      this.ui.mapList.appendChild(btn)
    }
  }

  private drawPreview(): void {
    const preview = this.ui.preview
    const ctx = preview.getContext("2d")
    if (!ctx) {
      return
    }
    const cssSize = 168
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const pixel = Math.round(cssSize * dpr)
    if (preview.width !== pixel || preview.height !== pixel) {
      preview.width = pixel
      preview.height = pixel
    }
    preview.style.width = `${cssSize}px`
    preview.style.height = `${cssSize}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.clearRect(0, 0, cssSize, cssSize)
    ctx.fillStyle = this.map.palette.grass
    ctx.fillRect(0, 0, cssSize, cssSize)
    ctx.save()
    ctx.translate(cssSize / 2, cssSize / 2 + 10)
    ctx.scale(2.15, 2.15)
    drawBunny(ctx, 0, 0, this.cosmetics)
    ctx.restore()
  }

  private beginIntro(): void {
    this.applySaveTuning()
    this.map = getMeadowMap(this.selectedMapId)
    this.ui.lobby.hidden = true
    this.state = "intro"
    const timerNote = this.timed ? ` Timer: ${this.diff.timerSeconds}s.` : ""
    this.modal(
      `Hello, ${this.playerName}.`,
      `Gather ${this.carrotGoal} carrots in ${this.map.name}.${timerNote} Watch for foxes, hedgehogs, and crows.`,
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
    this.applySaveTuning()
    this.map = getMeadowMap(this.selectedMapId)
    const spawn = this.map.playerSpawn
    this.bunny = { x: spawn.x, y: spawn.y, dx: 1, dy: 0 }
    this.score = 0
    this.health = this.maxHearts
    this.cooldown = 0
    this.burst = 0
    this.invulnerable = 0
    this.time = 0
    this.timerLeft = this.diff.timerSeconds
    this.particles = []
    this.carrots = this.map.carrotSpawns.slice(0, this.carrotGoal).map((p) => ({
      x: p.x,
      y: p.y,
      taken: false,
    }))
    while (this.carrots.length < this.carrotGoal) {
      const i = this.carrots.length
      this.carrots.push({
        x: 245 + (i % 4) * 174,
        y: 100 + Math.floor(i / 4) * 165,
        taken: false,
      })
    }
    const count = Math.max(
      1,
      Math.round(this.diff.enemyCount * this.diff.enemyCountMultiplier),
    )
    this.enemies = this.spawner.spawnRoster(
      this.diff.enemyIds,
      count,
      this.map.enemySpawns,
    )
    this.pickups = []
    for (const spot of this.map.itemSpawns) {
      if (Math.random() < this.diff.itemChance) {
        this.pickups.push({
          x: spot.x,
          y: spot.y,
          kind: Math.random() < 0.5 ? "leaf" : "dew",
          taken: false,
        })
      }
    }
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
    this.ui.lobby.hidden = true
    this.ui.pause.textContent = "Pause"
    this.sync()
  }

  private sync(): void {
    this.ui.score.textContent = `${this.score} / ${this.carrotGoal}`
    const empty = Math.max(0, this.maxHearts - this.health)
    this.ui.hearts.textContent = `${"♥ ".repeat(this.health)}${"♡ ".repeat(empty)}`.trim()
    this.ui.dash.textContent = this.cooldown > 0 ? `${this.cooldown.toFixed(1)}s` : "Ready"
    this.ui.mapName.textContent = this.map.name
    const timerWrap = this.ui.timer.parentElement
    if (this.timed) {
      this.ui.timer.hidden = false
      if (timerWrap) {
        timerWrap.hidden = false
      }
      this.ui.timer.textContent = `${Math.max(0, Math.ceil(this.timerLeft))}s`
    } else {
      this.ui.timer.hidden = true
      if (timerWrap) {
        timerWrap.hidden = true
      }
      this.ui.timer.textContent = ""
    }
  }

  private modal(
    title: string,
    message: string,
    label: string,
    showLobbyReturn = false,
  ): void {
    this.ui.title.textContent = title
    this.ui.message.textContent = message
    this.ui.play.textContent = label
    this.ui.toLobby.hidden = !showLobbyReturn
    this.ui.overlay.hidden = false
    this.ui.pausePanel.hidden = true
    this.ui.lobby.hidden = true
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

  private async unlock(id: string): Promise<void> {
    await getPlatform().achievements.unlock(id)
    const save = getSave()
    if (!save.progress.achievements.includes(id)) {
      save.progress.achievements.push(id)
    }
  }

  private async onWin(): Promise<void> {
    await this.unlock("FIRST_HOP")
    await this.unlock("HOME_SAFE")
    const save = getSave()
    addPantryCarrots(save, this.carrotGoal)
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
        "Dash past threats with R, and recover near your burrow.",
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
      if (distance > sense || this.nearBurrow(this.bunny.x, this.bunny.y)) {
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
        !this.nearBurrow(this.bunny.x, this.bunny.y)
      ) {
        const n = Math.hypot(dx, dy) || 1
        enemy.projectile = {
          x: enemy.x,
          y: enemy.y,
          vx: (dx / n) * 160,
          vy: (dy / n) * 160 - 40,
          life: 2.2,
        }
        enemy.attackTimer = Math.max(0.8, enemy.attackCooldown || this.diff.attackCooldown)
      }
    } else {
      fx = this.bunny.x - enemy.x
      fy = this.bunny.y - enemy.y
      const distance = Math.hypot(fx, fy)
      if (distance > sense || this.nearBurrow(this.bunny.x, this.bunny.y)) {
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
      if (this.state === "lobby") {
        this.beginIntro()
        return
      }
      if (this.state === "paused") {
        this.pause()
        return
      }
      if (this.state === "intro" || this.state === "lost" || this.state === "won") {
        this.reset()
        return
      }
    }
    if (input.cancelPressed && (this.state === "won" || this.state === "lost")) {
      this.showLobby()
      return
    }
    if (input.cancelPressed && this.state === "paused") {
      this.callbacks.onQuitToModes()
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
        this.state = "lost"
        this.modal(
          "Time's up.",
          "The meadow grows quiet. Try a quicker hop next time.",
          "Try again →",
          true,
        )
        return
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

    for (const c of this.carrots) {
      if (!c.taken && Math.hypot(c.x - this.bunny.x, c.y - this.bunny.y) < 26) {
        c.taken = true
        this.score += 1
        this.puff(c.x, c.y, "#ffce74")
        if (this.score === this.carrotGoal) {
          void this.unlock("BASKET_FULL")
        }
      }
    }

    for (const item of this.pickups) {
      if (!item.taken && Math.hypot(item.x - this.bunny.x, item.y - this.bunny.y) < 24) {
        item.taken = true
        if (item.kind === "leaf") {
          this.health = Math.min(this.maxHearts, this.health + 1)
          this.puff(item.x, item.y, "#8fbf6a")
        } else {
          this.cooldown = 0
          this.puff(item.x, item.y, "#7ec8e3")
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
      this.score >= this.carrotGoal &&
      Math.hypot(this.bunny.x - this.map.burrow.x, this.bunny.y - this.map.burrow.y) < 62
    ) {
      this.state = "won"
      void this.onWin()
      this.modal(
        "Home, sweet burrow!",
        `${this.carrotGoal} crunchy carrots for ${this.playerName}. The meadow is a little sweeter with you in it.`,
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
      ctx.fillStyle = "#f0c35a"
      ctx.beginPath()
      ctx.moveTo(0, 2)
      ctx.lineTo(8, 6)
      ctx.lineTo(0, 8)
      ctx.closePath()
      ctx.fill()
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
      this.ellipse(0, 7, 3, 2, "#3d4934")
    }
    ctx.restore()

    if (enemy.projectile) {
      this.ellipse(enemy.projectile.x, enemy.projectile.y, 6, 6, "#4a3a2a")
      this.ellipse(enemy.projectile.x - 1, enemy.projectile.y - 1, 2, 2, "#7a5a3a")
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

    const burrow = this.map.burrow
    this.ellipse(burrow.x, burrow.y + 20, 48, 18, "#5c6b3a55")
    this.ellipse(burrow.x, burrow.y, 42, 28, "#6a5538")
    this.ellipse(burrow.x, burrow.y - 4, 28, 18, "#2a2218")
    ctx.fillStyle = "#fffaf0"
    ctx.font = "14px Georgia"
    ctx.textAlign = "center"
    ctx.fillText(`${this.playerName}'s burrow`, burrow.x, burrow.y + 48)

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

    for (const item of this.pickups) {
      if (item.taken) {
        continue
      }
      if (item.kind === "leaf") {
        this.ellipse(item.x, item.y, 10, 6, "#8fbf6a")
        this.ellipse(item.x - 2, item.y - 1, 3, 2, "#b5d98a")
      } else {
        this.ellipse(item.x, item.y, 7, 9, "#7ec8e3")
        this.ellipse(item.x - 2, item.y - 2, 2, 3, "#c5eaf5")
      }
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
