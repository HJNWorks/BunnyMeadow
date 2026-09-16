import Phaser from "phaser"
import { getDifficulty, listDifficultyIds } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getPlatform } from "../../core/platform"
import type { DifficultyId } from "../../core/save"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { mountDomShell, requireEl, type DomShellHandle } from "../../ui/DomShell"
import { ENDLESS_CHUNKS, type ChunkDef } from "../../systems/ChunkAssembler"
import {
  EndlessGenerator,
  METER_PER_PX,
  getEnvBand,
  getTuning,
  type EndlessTuning,
} from "./EndlessGenerator"
import { ensureStoryTextures } from "../story/shared/storyTextures"
import {
  createPlayerState,
  tickPlayerTimers,
  updatePlayerMovement,
  type PlayerState,
} from "../story/shared/playerController"
import { spawnEnemy, updateEnemies } from "../story/shared/enemyKit"
import {
  applyWaterPhysics,
  createMovers,
  createWaterHazards,
  updateMovers,
  type MoverState,
} from "../story/shared/moversHazards"

type Segment = {
  originX: number
  width: number
  env: string
  objects: Phaser.GameObjects.GameObject[]
  enemies: Phaser.Physics.Arcade.Sprite[]
  moverStates: MoverState[]
  carrots: Phaser.GameObjects.Image[]
}

const DIFF_LABEL: Record<DifficultyId, string> = {
  sprout: "Sprout",
  hopper: "Hopper",
  wildhare: "Wildhare",
  moonlit: "Moonlit",
  hardcore: "Hardcore",
}

const HUD_HTML = `
<div class="bm-shell bm-wide endless-shell">
  <div class="meadow-header endless-bar">
    <span>Distance <strong data-ui="dist">0 m</strong></span>
    <span>Best <strong data-ui="best">0 m</strong></span>
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span data-ui="env">Meadow</span>
    <button type="button" class="bm-btn" data-ui="pauseBtn">Pause</button>
  </div>
  <div class="endless-hint" data-ui="hint" hidden></div>
  <div class="meadow-overlay" data-ui="pausePanel" hidden>
    <div class="meadow-card">
      <h2>Paused</h2>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="resume">Resume</button>
        <button type="button" class="bm-btn ghost" data-ui="quit">Quit to Lobby</button>
      </div>
    </div>
  </div>
  <div class="meadow-overlay" data-ui="result" hidden>
    <div class="meadow-card">
      <h2 data-ui="resultTitle">Caught!</h2>
      <p data-ui="resultBody"></p>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="retry">Run again</button>
        <button type="button" class="bm-btn" data-ui="toLobby">Lobby</button>
        <button type="button" class="bm-btn ghost" data-ui="toModes">Modes</button>
      </div>
    </div>
  </div>
</div>
`

const CSS = `
.bm-root.bm-endless-hud {
  background: transparent;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}
.bm-endless-hud .bm-shell { max-width: none; padding: 12px 20px 0; pointer-events: none; }
.bm-endless-hud .endless-bar,
.bm-endless-hud .meadow-overlay,
.bm-endless-hud .meadow-overlay *,
.bm-endless-hud button { pointer-events: auto; }
.bm-endless-hud .endless-bar {
  display: flex; gap: 18px; align-items: center;
  background: linear-gradient(180deg, #f7f3e8f0, #ebe4d4e6);
  backdrop-filter: blur(6px);
  border-radius: 14px; padding: 8px 14px; border: 1px solid #d5dcc4;
  box-shadow: 0 8px 18px #2a3d2412; font: 15px system-ui, sans-serif; color: #304c39;
}
.bm-endless-hud .endless-bar button { margin-left: auto; }
.bm-endless-hud .endless-hint {
  margin: 10px auto 0; width: max-content; pointer-events: none;
  background: #2a3d24cc; color: #f4f7e8; padding: 6px 14px; border-radius: 12px;
  font: 14px system-ui, sans-serif;
}
.bm-endless-hud .meadow-overlay {
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  background: #2a3d2455; z-index: 60;
}
.bm-endless-hud .meadow-overlay[hidden] { display: none; }
.bm-endless-hud .meadow-card {
  background: #fffaf0; padding: 28px; border-radius: 24px; max-width: 440px; text-align: center;
}
.bm-endless-hud .meadow-pause-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.endless-lobby .endless-board { width: 100%; border-collapse: collapse; margin-top: 8px; }
.endless-lobby .endless-board th, .endless-lobby .endless-board td {
  text-align: left; padding: 6px 10px; border-bottom: 1px solid #e3e7d4; font-size: 14px;
}
.endless-lobby .meadow-diff-chip.selected { background: #34583e; color: #fffaf0; }
`

export class EndlessScene extends Phaser.Scene {
  private state: "lobby" | "playing" | "dead" = "lobby"
  private lobbyShell: DomShellHandle | null = null
  private hudShell: DomShellHandle | null = null
  private style: HTMLStyleElement | null = null
  private hud: {
    dist: HTMLElement
    best: HTMLElement
    hearts: HTMLElement
    env: HTMLElement
    hint: HTMLElement
    pausePanel: HTMLElement
    result: HTMLElement
    resultTitle: HTMLElement
    resultBody: HTMLElement
  } | null = null

  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private enemies!: Phaser.Physics.Arcade.Group
  private projectiles!: Phaser.Physics.Arcade.Group
  private player!: Phaser.Physics.Arcade.Sprite
  private playerState: PlayerState = createPlayerState()
  private movers: MoverState[] = []
  private segments: Segment[] = []
  private generator!: EndlessGenerator
  private tuning!: EndlessTuning

  private nextOriginX = 0
  private spawnX = 120
  private maxX = 0
  private distanceM = 0
  private chaseX = 0
  private chaseFog: Phaser.GameObjects.Rectangle | null = null
  private chaseFace: Phaser.GameObjects.Ellipse | null = null

  private health = 3
  private maxHearts = 3
  private invuln = 0
  private invincible = false
  private waterGrace = 0
  private carrotsCollected = 0
  private safeSpot = { x: 260, y: 900 }
  private safeSampleT = 0
  private currentEnv = "meadow"
  private paused = false
  private ended = false

  constructor() {
    super("Endless")
  }

  create(data?: { autoStart?: boolean }): void {
    this.style = document.createElement("style")
    this.style.textContent = CSS
    document.head.appendChild(this.style)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      getInput().stop()
      this.style?.remove()
      this.style = null
    })
    if (data?.autoStart) {
      this.startRun()
    } else {
      this.showLobby()
    }
  }

  private showLobby(): void {
    this.state = "lobby"
    const save = getSave()
    const chips = listDifficultyIds()
      .map((id) => {
        const selected = id === save.settings.difficulty ? " selected" : ""
        return `<button type="button" class="meadow-diff-chip${selected}" data-diff="${id}">${DIFF_LABEL[id]}</button>`
      })
      .join("")
    const board = this.leaderboardHtml(save.settings.difficulty)
    this.lobbyShell = mountDomShell(
      this,
      `
      <div class="bm-shell bm-wide endless-lobby">
        <div class="bm-eyebrow">Endless</div>
        <h1>Meadow Run</h1>
        <p class="bm-tagline">Run right. The mist chases. Environments shift from meadow to the peak.</p>
        <div class="bm-field">
          <label>Difficulty</label>
          <div class="meadow-diff-list" data-ui="diffList" role="listbox">${chips}</div>
        </div>
        <div class="endless-board-wrap" data-ui="board">${board}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn warm" data-ui="start">Start run</button>
          <button type="button" class="bm-btn ghost" data-ui="back">Modes</button>
        </div>
      </div>
      `,
    )
    const root = this.lobbyShell.root
    root.querySelectorAll<HTMLButtonElement>("[data-diff]").forEach((btn) => {
      btn.onclick = () => {
        void this.selectDifficulty(btn.dataset.diff as DifficultyId)
      }
    })
    requireEl<HTMLButtonElement>(root, "[data-ui=start]").onclick = () => this.startRun()
    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => this.scene.start("ModeSelect")
  }

  private leaderboardHtml(preset: DifficultyId): string {
    const save = getSave()
    const runs = save.progress.endlessRuns[preset] ?? []
    if (runs.length === 0) {
      return `<p class="bm-tagline">No runs yet on ${DIFF_LABEL[preset]}. Best overall: ${save.progress.endlessBest} m.</p>`
    }
    const rows = runs
      .map(
        (run, i) =>
          `<tr><td>${i + 1}</td><td>${run.name}</td><td>${run.distance} m</td><td>#${run.seed}</td></tr>`,
      )
      .join("")
    return `<table class="endless-board"><thead><tr><th>#</th><th>Name</th><th>Distance</th><th>Seed</th></tr></thead><tbody>${rows}</tbody></table>`
  }

  private async selectDifficulty(id: DifficultyId): Promise<void> {
    const save = getSave()
    save.settings.difficulty = id
    await persistSave()
    if (!this.lobbyShell) {
      return
    }
    const root = this.lobbyShell.root
    root.querySelectorAll<HTMLButtonElement>("[data-diff]").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.diff === id)
    })
    requireEl<HTMLElement>(root, "[data-ui=board]").innerHTML = this.leaderboardHtml(id)
  }

  private startRun(): void {
    this.lobbyShell?.teardown()
    this.lobbyShell = null
    this.state = "playing"
    this.ended = false
    this.paused = false

    const save = getSave()
    const diff = getDifficulty(save)
    this.maxHearts = diff.hearts
    this.health = diff.hearts
    this.invincible = save.settings.accessibility.invincible
    getInput().setBindings(save.settings.bindings)
    getInput().start()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    const preset = save.settings.difficulty
    this.tuning = getTuning(preset)
    const seed = Math.floor(Math.random() * 90000) + 1000
    this.generator = new EndlessGenerator(seed, preset)

    ensureStoryTextures(this)

    this.physics.world.gravity.y = 1400
    this.physics.world.setBounds(0, -600, 1_000_000, 5000, true, false, false, false)
    this.cameras.main.setBounds(0, 0, 1_000_000, 1080)
    this.cameras.main.setBackgroundColor(getEnvBand(0).sky)
    this.currentEnv = getEnvBand(0).env

    this.platforms = this.physics.add.staticGroup()
    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.segments = []
    this.movers = []
    this.nextOriginX = 0
    this.maxX = 0
    this.distanceM = 0
    this.carrotsCollected = 0
    this.waterGrace = 0
    this.invuln = 0

    this.player = this.physics.add.sprite(
      this.spawnX,
      840,
      this.textures.exists("story_player") ? "story_player" : "story_bunny",
    )
    this.player.setDisplaySize(48, 56)
    this.player.setCollideWorldBounds(true)
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setSize(26, 38)
    pb.setOffset(7, 8)
    this.physics.add.collider(this.player, this.platforms)
    this.playerState = createPlayerState({ wallBounce: true, baseGravity: 1400 })

    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      const sprite = enemy as Phaser.Physics.Arcade.Sprite
      if (sprite.getData("archetype") === "patrol" && this.playerState.dashTime > 0) {
        sprite.destroy()
        return
      }
      this.hurt()
    })
    this.physics.add.overlap(this.player, this.projectiles, (_p, shot) => {
      ;(shot as Phaser.Physics.Arcade.Image).destroy()
      this.hurt()
    })

    this.spawnSegment(this.startChunk(), 0)
    while (this.nextOriginX < this.spawnX + 3200) {
      this.spawnSegment(this.generator.next(this.distanceM), this.nextOriginX)
    }

    this.chaseX = this.spawnX - 700
    this.chaseFog = this.add
      .rectangle(0, 540, 4000, 1400, 0x241a2e, 0.55)
      .setOrigin(1, 0.5)
      .setDepth(20)
      .setScrollFactor(1)
    this.chaseFace = this.add.ellipse(0, 520, 60, 46, 0xd05a3a, 0.9).setDepth(21)

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setDeadzone(120, 80)
    this.cameras.main.setZoom(1.25)

    this.safeSpot = { x: this.spawnX, y: 900 }
    this.safeSampleT = 0
    this.physics.world.isPaused = false

    this.mountHud()
    this.updateHud()
  }

  private startChunk(): ChunkDef {
    const start = ENDLESS_CHUNKS.find((c) => c.id === "endless_start")
    return start ?? this.generator.next(0)
  }

  private mountHud(): void {
    this.hudShell = mountDomShell(this, HUD_HTML, {
      keepCanvas: true,
      rootClass: "bm-endless-hud",
    })
    const root = this.hudShell.root
    this.hud = {
      dist: requireEl(root, "[data-ui=dist]"),
      best: requireEl(root, "[data-ui=best]"),
      hearts: requireEl(root, "[data-ui=hearts]"),
      env: requireEl(root, "[data-ui=env]"),
      hint: requireEl(root, "[data-ui=hint]"),
      pausePanel: requireEl(root, "[data-ui=pausePanel]"),
      result: requireEl(root, "[data-ui=result]"),
      resultTitle: requireEl(root, "[data-ui=resultTitle]"),
      resultBody: requireEl(root, "[data-ui=resultBody]"),
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=pauseBtn]").onclick = () => this.setPaused(true)
    requireEl<HTMLButtonElement>(root, "[data-ui=resume]").onclick = () => this.setPaused(false)
    requireEl<HTMLButtonElement>(root, "[data-ui=quit]").onclick = () => this.scene.restart()
    requireEl<HTMLButtonElement>(root, "[data-ui=retry]").onclick = () =>
      this.scene.restart({ autoStart: true })
    requireEl<HTMLButtonElement>(root, "[data-ui=toLobby]").onclick = () => this.scene.restart()
    requireEl<HTMLButtonElement>(root, "[data-ui=toModes]").onclick = () =>
      this.scene.start("ModeSelect")
  }

  private spawnSegment(chunk: ChunkDef, originX: number): void {
    const seg: Segment = {
      originX,
      width: chunk.width,
      env: chunk.endless?.env ?? "meadow",
      objects: [],
      enemies: [],
      moverStates: [],
      carrots: [],
    }

    const band = this.add
      .rectangle(originX + chunk.width / 2, 540, chunk.width, 1080, this.colorToNum(chunk.color), 0.16)
      .setDepth(-2)
    seg.objects.push(band)

    for (const rect of chunk.platforms) {
      const block = this.add.tileSprite(
        originX + rect.x + rect.w / 2,
        rect.y + rect.h / 2,
        rect.w,
        rect.h,
        "story_ground",
      )
      block.setDepth(1)
      this.physics.add.existing(block, true)
      this.platforms.add(block)
      ;(block.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
      seg.objects.push(block)
      const grass = this.add
        .rectangle(originX + rect.x + rect.w / 2, rect.y + 6, rect.w, 12, 0x7d9450)
        .setDepth(1.5)
      seg.objects.push(grass)
    }

    for (const rect of chunk.walls ?? []) {
      const block = this.add.rectangle(
        originX + rect.x + rect.w / 2,
        rect.y + rect.h / 2,
        rect.w,
        rect.h,
        0x3f5a32,
        1,
      )
      this.physics.add.existing(block, true)
      this.platforms.add(block)
      ;(block.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
      seg.objects.push(block)
    }

    if (chunk.movers && chunk.movers.length > 0) {
      const assembled = chunk.movers.map((m) => ({
        ...m,
        worldX: originX + m.x,
        worldY: m.y,
      }))
      const states = createMovers(this, assembled, this.player)
      for (const st of states) {
        seg.objects.push(st.sprite)
        seg.moverStates.push(st)
        this.movers.push(st)
      }
    }

    if (chunk.hazards && chunk.hazards.length > 0) {
      const assembled = chunk.hazards.map((h) => ({
        ...h,
        worldX: originX + h.x,
        worldY: h.y,
      }))
      const rects = createWaterHazards(this, assembled, this.player, (water) => this.onWater(water))
      for (const r of rects) {
        seg.objects.push(r)
      }
    }

    for (const e of chunk.enemies ?? []) {
      const sprite = spawnEnemy(this, e.id, originX + e.x, e.y, this.platforms, this.enemies)
      seg.enemies.push(sprite)
    }

    for (const c of chunk.carrots ?? []) {
      if (originX > 0 && !this.generator.rollCarrot()) {
        continue
      }
      const carrot = this.add.image(originX + c.x, c.y, "story_carrot").setDepth(2)
      seg.carrots.push(carrot)
      seg.objects.push(carrot)
    }

    this.segments.push(seg)
    this.nextOriginX = originX + chunk.width
  }

  private destroySegment(seg: Segment): void {
    for (const obj of seg.objects) {
      obj.destroy()
    }
    for (const enemy of seg.enemies) {
      enemy.destroy()
    }
    this.movers = this.movers.filter((m) => !seg.moverStates.includes(m))
  }

  private colorToNum(hex: string): number {
    return Number.parseInt(hex.replace("#", ""), 16) || 0x5a6a4a
  }

  private onWater(water: Phaser.GameObjects.Rectangle): void {
    if (this.state !== "playing" || !water.active) {
      return
    }
    if (applyWaterPhysics(this.player, water)) {
      this.waterGrace += 0.016
      if (this.waterGrace > 0.35) {
        this.waterGrace = 0
        this.loseHeartAndRespawn("water")
      }
    }
  }

  private hurt(): void {
    if (this.state !== "playing" || this.invuln > 0 || this.invincible || this.playerState.dashTime > 0) {
      return
    }
    this.health -= 1
    this.invuln = 1.2
    this.updateHud()
    this.player.setTint(0xffcccc)
    this.time.delayedCall(200, () => this.player.clearTint())
    if (this.health <= 0) {
      this.endRun("The mist and beasts win this time.")
    }
  }

  private loseHeartAndRespawn(reason: "fall" | "water"): void {
    this.health -= 1
    this.updateHud()
    if (this.health <= 0) {
      this.endRun(reason === "water" ? "A cold splash ends the run." : "You tumble into the dark.")
      return
    }
    const x = Math.max(this.safeSpot.x, this.chaseX + 160)
    this.player.setPosition(x, this.safeSpot.y - 20)
    this.player.setVelocity(0, 0)
    this.invuln = 1.2
  }

  private setPaused(value: boolean): void {
    if (this.state !== "playing" && value) {
      return
    }
    this.paused = value
    this.physics.world.isPaused = value
    if (this.hud) {
      this.hud.pausePanel.hidden = !value
    }
  }

  private endRun(message: string): void {
    if (this.ended) {
      return
    }
    this.ended = true
    this.state = "dead"
    this.physics.world.isPaused = true
    this.player.setVelocity(0, 0)
    void this.recordRun(message)
  }

  private async recordRun(message: string): Promise<void> {
    const save = getSave()
    const preset = save.settings.difficulty
    const distance = this.distanceM
    if (this.carrotsCollected > 0) {
      addPantryCarrots(save, this.carrotsCollected)
    }
    const isBest = distance > save.progress.endlessBest
    if (isBest) {
      save.progress.endlessBest = distance
    }
    const runs = save.progress.endlessRuns[preset] ?? []
    runs.push({ name: save.player.name || "Mei", distance, seed: this.generator.seed, date: new Date().toISOString() })
    runs.sort((a, b) => b.distance - a.distance)
    save.progress.endlessRuns[preset] = runs.slice(0, 10)
    const rank = save.progress.endlessRuns[preset].findIndex((r) => r.seed === this.generator.seed && r.distance === distance) + 1
    if (distance >= 1000) {
      await getPlatform().achievements.unlock("ENDLESS_1K")
      if (!save.progress.achievements.includes("ENDLESS_1K")) {
        save.progress.achievements.push("ENDLESS_1K")
      }
    }
    await persistSave()
    if (this.hud) {
      this.hud.resultTitle.textContent = isBest ? "New best!" : "Caught!"
      const rankText = rank > 0 && rank <= 10 ? ` Leaderboard #${rank}.` : ""
      this.hud.resultBody.textContent = `${message} You reached ${distance} m on ${DIFF_LABEL[preset]}.${rankText} Carrots: ${this.carrotsCollected}.`
      this.hud.result.hidden = false
    }
  }

  private updateHud(): void {
    if (!this.hud) {
      return
    }
    const save = getSave()
    this.hud.dist.textContent = `${this.distanceM} m`
    this.hud.best.textContent = `${Math.max(save.progress.endlessBest, this.distanceM)} m`
    const empty = Math.max(0, this.maxHearts - this.health)
    this.hud.hearts.textContent = `${"♥ ".repeat(this.health)}${"♡ ".repeat(empty)}`.trim()
  }

  update(_time: number, delta: number): void {
    if (this.state !== "playing" || this.paused || !this.player?.body) {
      return
    }
    const dt = delta / 1000
    this.invuln = Math.max(0, this.invuln - dt)
    this.waterGrace = Math.max(0, this.waterGrace - dt * 0.5)
    tickPlayerTimers(this.playerState, dt)

    const input = getInput().snapshot()
    if (input.pausePressed) {
      this.setPaused(true)
      return
    }

    this.maxX = Math.max(this.maxX, this.player.x)
    this.distanceM = Math.floor(this.maxX / METER_PER_PX)

    const band = getEnvBand(this.distanceM)
    if (band.env !== this.currentEnv) {
      this.currentEnv = band.env
      this.cameras.main.setBackgroundColor(band.sky)
    }
    this.playerState.glide = band.env === "lantern"
    if (this.hud) {
      this.hud.env.textContent = band.name
      const showHint = band.env === "lantern"
      this.hud.hint.hidden = !showHint
      if (showHint) {
        this.hud.hint.textContent = "Hold jump to glide between lanterns."
      }
    }

    while (this.nextOriginX < this.player.x + 3200) {
      this.spawnSegment(this.generator.next(this.distanceM), this.nextOriginX)
    }
    while (this.segments.length > 0 && this.segments[0].originX + this.segments[0].width < this.chaseX - 400) {
      const seg = this.segments.shift()
      if (seg) {
        this.destroySegment(seg)
      }
    }

    updateMovers(this.movers, this.player, dt)
    updateEnemies(this, this.enemies, this.projectiles, this.platforms, this.player, dt)

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const onFloor = body.blocked.down || body.touching.down
    this.safeSampleT += dt
    if (onFloor && this.safeSampleT > 0.4) {
      this.safeSampleT = 0
      this.safeSpot = { x: this.player.x, y: this.player.y }
    }

    updatePlayerMovement(this.player, input, this.playerState)

    this.advanceChase(dt)
    this.collectCarrots()

    if (this.player.y > 1160) {
      this.loseHeartAndRespawn("fall")
    }

    this.updateHud()
  }

  private advanceChase(dt: number): void {
    const ramp = this.tuning.chaseRampPer100m * (this.distanceM / 100)
    const speed = this.tuning.chaseSpeed + ramp
    this.chaseX += speed * dt
    const minX = this.maxX - this.tuning.chaseMaxBehind
    if (this.chaseX < minX) {
      this.chaseX = minX
    }
    if (this.chaseFog) {
      this.chaseFog.setPosition(this.chaseX, 540)
    }
    if (this.chaseFace) {
      this.chaseFace.setPosition(this.chaseX - 30, this.player.y)
    }
    const playerLeft = (this.player.body as Phaser.Physics.Arcade.Body).left
    if (this.chaseX >= playerLeft) {
      this.endRun("The mist catches your paws.")
    }
  }

  private collectCarrots(): void {
    for (const seg of this.segments) {
      for (const carrot of seg.carrots) {
        if (!carrot.active) {
          continue
        }
        if (Math.abs(carrot.x - this.player.x) < 34 && Math.abs(carrot.y - this.player.y) < 40) {
          carrot.destroy()
          this.carrotsCollected += 1
        }
      }
    }
  }
}
