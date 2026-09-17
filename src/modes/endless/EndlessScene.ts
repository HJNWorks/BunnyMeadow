import Phaser from "phaser"
import { getDifficulty, listDifficultyIds } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getPlatform } from "../../core/platform"
import type { DifficultyId } from "../../core/save"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { mountDomShell, requireEl, type DomShellHandle } from "../../ui/DomShell"
import { attachPlayfieldFrame, measureChromeInsets } from "../../ui/playfieldFrame"
import { ITEM_TRAY_CSS, bindItemTray, renderItemTray } from "../../ui/ItemTray"
import { ENDLESS_CHUNKS } from "../../systems/ChunkAssembler"
import { t } from "../../core/i18n"
import { getAudio, musicIdForEnv } from "../../core/audio"
import {
  EndlessGenerator,
  METER_PER_PX,
  MIST_PUSH_METERS,
  getTuning,
  type EndlessTuning,
  type FilledChunk,
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
import {
  applySky,
  createLanternGlow,
  createNightOverlay,
  createWeather,
  getPalette,
  hexToNum,
  lerpHex,
  nightStrength,
  type Palette,
  type WeatherHandle,
} from "../story/shared/themeKit"

type Ember = {
  sprite: Phaser.GameObjects.Image
  vx: number
  vy: number
  life: number
  maxLife: number
}

type Segment = {
  originX: number
  width: number
  env: string
  bridgeTo?: string
  objects: Phaser.GameObjects.GameObject[]
  enemies: Phaser.Physics.Arcade.Sprite[]
  moverStates: MoverState[]
  pickups: { sprite: Phaser.GameObjects.Image; id: string }[]
}

function diffLabel(id: DifficultyId): string {
  return t(`diff.${id}`)
}

function hudHtml(): string {
  return `
<div class="bm-shell bm-wide endless-shell">
  <div class="meadow-header endless-bar">
    <span>${t("hud.distance")} <strong data-ui="dist">0 m</strong></span>
    <span>${t("hud.best")} <strong data-ui="best">0 m</strong></span>
    <span>${t("hud.hearts")} <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span data-ui="env">${t("env.meadow")}</span>
    <button type="button" class="bm-btn" data-ui="pauseBtn">${t("common.pause")}</button>
  </div>
  <div class="bm-item-tray" data-ui="itemTray" hidden></div>
  <div class="endless-hint" data-ui="hint" hidden></div>
  <div class="meadow-overlay" data-ui="pausePanel" hidden>
    <div class="meadow-card">
      <h2>${t("common.pause")}</h2>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="resume">${t("common.resume")}</button>
        <button type="button" class="bm-btn ghost" data-ui="quit">${t("endless.pause.quit")}</button>
      </div>
    </div>
  </div>
  <div class="meadow-overlay" data-ui="result" hidden>
    <div class="meadow-card">
      <h2 data-ui="resultTitle">${t("endless.result.caught")}</h2>
      <p data-ui="resultBody"></p>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="retry">${t("endless.result.retry")}</button>
        <button type="button" class="bm-btn" data-ui="toLobby">${t("endless.result.lobby")}</button>
        <button type="button" class="bm-btn ghost" data-ui="toModes">${t("common.modes")}</button>
      </div>
    </div>
  </div>
</div>
`
}

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
` + ITEM_TRAY_CSS

const LANTERN_GLOW_S = 1.6

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
    itemTray: HTMLElement
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
  private mistBands: Phaser.GameObjects.Rectangle[] = []
  private chaseFox: Phaser.GameObjects.Image | null = null
  private embers: Ember[] = []
  private skyFar: Phaser.GameObjects.Rectangle | null = null
  private weather: WeatherHandle | null = null
  private weatherEnv = ""
  private nightOverlay: Phaser.GameObjects.Rectangle | null = null
  private lanternGlow: Phaser.GameObjects.Image | null = null
  private glowTimer = 0
  private reducedMotion = false
  private emberTimer = 0

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
  private hintFlash = 0

  constructor() {
    super("Endless")
  }

  create(data?: { autoStart?: boolean }): void {
    this.style = document.createElement("style")
    this.style.textContent = CSS
    document.head.appendChild(this.style)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      getAudio().stopMusic()
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
    getAudio().playMusic("menu")
    const save = getSave()
    const chips = listDifficultyIds()
      .map((id) => {
        const selected = id === save.settings.difficulty ? " selected" : ""
        return `<button type="button" class="meadow-diff-chip${selected}" data-diff="${id}">${diffLabel(id)}</button>`
      })
      .join("")
    const board = this.leaderboardHtml(save.settings.difficulty)
    this.lobbyShell = mountDomShell(
      this,
      `
      <div class="bm-shell bm-wide endless-lobby">
        <div class="bm-eyebrow">${t("endless.lobby.eyebrow")}</div>
        <h1>${t("endless.lobby.title")}</h1>
        <p class="bm-tagline">${t("endless.lobby.tagline")}</p>
        <p class="bm-tagline">${t("endless.lobby.scores")}</p>
        <div class="bm-field">
          <label>${t("settings.difficulty")}</label>
          <div class="meadow-diff-list" data-ui="diffList" role="listbox">${chips}</div>
        </div>
        <div class="endless-board-wrap" data-ui="board">${board}</div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn warm" data-ui="start">${t("endless.lobby.start")}</button>
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.modes")}</button>
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
    requireEl<HTMLButtonElement>(root, "[data-ui=start]").onclick = () => {
      getAudio().playSfx("confirm")
      this.startRun()
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("ModeSelect")
    }
  }

  private leaderboardHtml(preset: DifficultyId): string {
    const save = getSave()
    const runs = save.progress.endlessRuns[preset] ?? []
    if (runs.length === 0) {
      return `<p class="bm-tagline">${t("endless.lobby.empty", { diff: diffLabel(preset), best: save.progress.endlessBest })}</p>`
    }
    const rows = runs
      .map(
        (run, i) =>
          `<tr><td>${i + 1}</td><td>${run.name}</td><td>${run.distance} m</td><td>#${run.seed}</td></tr>`,
      )
      .join("")
    return `<table class="endless-board"><thead><tr><th>#</th><th>${t("endless.lobby.col.name")}</th><th>${t("endless.lobby.col.distance")}</th><th>${t("endless.lobby.col.seed")}</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="bm-tagline">${t("endless.lobby.top", { diff: diffLabel(preset) })}</p>`
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
    this.currentEnv = this.generator.env
    this.reducedMotion = save.settings.accessibility.reducedMotion
    this.glowTimer = 0
    this.weatherEnv = ""
    this.skyFar = null
    this.nightOverlay = null
    this.weather = null
    this.mistBands = []
    this.applyTheme(this.currentEnv, getPalette(this.currentEnv), true)
    getAudio().playMusic(musicIdForEnv(this.currentEnv))

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

    this.spawnSegment(this.startFilled(), 0)
    while (this.nextOriginX < this.spawnX + 3200) {
      this.spawnSegment(this.generator.next(this.nextOriginX / METER_PER_PX), this.nextOriginX)
    }

    this.chaseX = this.spawnX - 700
    this.embers = []
    this.emberTimer = 0
    this.buildMist(getPalette(this.currentEnv))
    this.chaseFox = this.add.image(0, 520, "chase_fox").setDepth(24)
    this.chaseFox.setDisplaySize(150, 90)
    this.lanternGlow = createLanternGlow(this)

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setDeadzone(120, 80)
    this.cameras.main.setZoom(1)

    this.safeSpot = { x: this.spawnX, y: 900 }
    this.safeSampleT = 0
    this.physics.world.isPaused = false

    this.mountHud()
    attachPlayfieldFrame(this, () =>
      measureChromeInsets({
        topSelectors: [".bm-endless-hud .endless-bar"],
        bottomSelectors: [],
        padTop: 10,
        padBottom: 16,
        side: 20,
      }),
    )
    this.updateHud()
  }

  private startFilled(): FilledChunk {
    const start = ENDLESS_CHUNKS.find((c) => c.id === "endless_start")
    if (start) {
      return this.generator.fill(start, "meadow", 1)
    }
    return this.generator.next(0)
  }

  private mountHud(): void {
    this.hudShell = mountDomShell(this, hudHtml(), {
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
      itemTray: bindItemTray(root),
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=pauseBtn]").onclick = () => this.setPaused(true)
    requireEl<HTMLButtonElement>(root, "[data-ui=resume]").onclick = () => this.setPaused(false)
    requireEl<HTMLButtonElement>(root, "[data-ui=quit]").onclick = () => {
      getAudio().playSfx("cancel")
      this.returnToLobby()
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=retry]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Endless", { autoStart: true })
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=toLobby]").onclick = () => {
      getAudio().playSfx("cancel")
      this.returnToLobby()
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=toModes]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("ModeSelect")
    }
  }

  private spawnSegment(filled: FilledChunk, originX: number): void {
    const chunk = filled.chunk
    const env = chunk.endless?.env ?? "meadow"
    const palette = getPalette(env)
    const seg: Segment = {
      originX,
      width: chunk.width,
      env,
      bridgeTo: chunk.endless?.bridgeTo,
      objects: [],
      enemies: [],
      moverStates: [],
      pickups: [],
    }

    const band = this.add
      .rectangle(originX + chunk.width / 2, 540, chunk.width, 1080, hexToNum(palette.mid), 0.16)
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
        .rectangle(originX + rect.x + rect.w / 2, rect.y + 6, rect.w, 12, hexToNum(palette.ground))
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

    for (const e of filled.enemies) {
      const sprite = spawnEnemy(this, e.id, originX + e.x, e.y, this.platforms, this.enemies)
      seg.enemies.push(sprite)
    }

    for (const item of filled.items) {
      const sprite = this.add.image(originX + item.x, item.y, "story_carrot").setDepth(2)
      if (item.id === "mooncake") {
        sprite.setTint(0xe8c45a)
      } else if (item.id === "osmanthus_blossom") {
        sprite.setTint(0xf2d4e8)
      } else if (item.id === "lantern") {
        sprite.setTint(0xf08a3a)
      }
      seg.pickups.push({ sprite, id: item.id })
      seg.objects.push(sprite)
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
    getAudio().playSfx("hurt")
    getAudio().playSfx("heart")
    if (this.health <= 0) {
      this.endRun(t("endless.end.beasts"))
    }
  }

  private loseHeartAndRespawn(reason: "fall" | "water"): void {
    this.health -= 1
    this.updateHud()
    getAudio().playSfx("hurt")
    getAudio().playSfx("heart")
    if (this.health <= 0) {
      this.endRun(reason === "water" ? t("endless.end.water") : t("endless.end.fall"))
      return
    }
    const x = Math.max(this.safeSpot.x, this.chaseX + 160)
    this.player.setPosition(x, this.safeSpot.y - 20)
    this.player.setVelocity(0, 0)
    this.invuln = 1.2
  }

  private returnToLobby(): void {
    this.paused = false
    this.ended = false
    this.state = "lobby"
    if (this.physics?.world) {
      this.physics.world.isPaused = false
    }
    getInput().stop()
    this.scene.start("Endless")
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
    getAudio().playSfx("mist")
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
      this.hud.resultTitle.textContent = isBest ? t("endless.result.best") : t("endless.result.caught")
      const rankText = rank > 0 && rank <= 10 ? t("endless.result.rank", { n: rank }) : ""
      this.hud.resultBody.textContent = t("endless.result.body", {
        message,
        distance,
        diff: diffLabel(preset),
        rank: rankText,
        carrots: this.carrotsCollected,
      })
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
    renderItemTray(this.hud.itemTray, this.trayBuffs())
  }

  private trayBuffs(): { id: string; remaining: number; duration: number }[] {
    const buffs: { id: string; remaining: number; duration: number }[] = []
    if (this.glowTimer > 0) {
      buffs.push({ id: "lantern", remaining: this.glowTimer, duration: LANTERN_GLOW_S })
    }
    return buffs
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

    const here = this.segments.find(
      (s) => this.player.x >= s.originX && this.player.x < s.originX + s.width,
    )
    this.syncTheme(here)
    const lookEnv = this.lookEnv(here)
    getAudio().playMusic(musicIdForEnv(lookEnv))
    this.playerState.glide =
      lookEnv === "lantern" || here?.env === "lantern" || here?.bridgeTo === "lantern"
    this.hintFlash = Math.max(0, this.hintFlash - dt)
    if (this.hud) {
      this.hud.env.textContent = t(`env.${lookEnv}`)
      if (this.hintFlash > 0) {
        this.hud.hint.hidden = false
      } else {
        const showHint = lookEnv === "lantern"
        this.hud.hint.hidden = !showHint
        if (showHint) {
          this.hud.hint.textContent = t("endless.hint.glide")
        }
      }
    }

    while (this.nextOriginX < this.player.x + 3200) {
      this.spawnSegment(this.generator.next(this.nextOriginX / METER_PER_PX), this.nextOriginX)
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

    this.weather?.update(dt, this.cameras.main.scrollX)
    this.tickLanternGlow(dt)

    this.advanceChase(dt)
    this.collectPickups()

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
    for (let i = 0; i < this.mistBands.length; i += 1) {
      this.mistBands[i].setPosition(this.chaseX - i * 36, 540)
    }
    const foxY = this.player.y + 6
    if (this.chaseFox) {
      this.chaseFox.setPosition(this.chaseX + 42, foxY)
    }
    this.spawnEmbers(dt, foxY)
    const playerLeft = (this.player.body as Phaser.Physics.Arcade.Body).left
    if (this.chaseX >= playerLeft) {
      this.endRun(t("endless.end.mist"))
    }
  }

  private spawnEmbers(dt: number, foxY: number): void {
    this.emberTimer += dt
    while (this.emberTimer > 0.028) {
      this.emberTimer -= 0.028
      const ember = this.add.image(this.chaseX + 8 - Math.random() * 18, foxY + (Math.random() - 0.35) * 30, "chase_ember")
      ember.setDepth(23)
      ember.setScale(0.7 + Math.random() * 0.8)
      this.embers.push({
        sprite: ember,
        vx: -80 - Math.random() * 140,
        vy: (Math.random() - 0.6) * 50,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
      })
    }
    for (let i = this.embers.length - 1; i >= 0; i -= 1) {
      const ember = this.embers[i]
      ember.life -= dt
      ember.sprite.x += ember.vx * dt
      ember.sprite.y += ember.vy * dt
      ember.sprite.setAlpha(Math.max(0, ember.life / ember.maxLife))
      ember.sprite.setScale(Math.max(0.2, ember.sprite.scale * (1 - dt * 1.4)))
      if (ember.life <= 0) {
        ember.sprite.destroy()
        this.embers.splice(i, 1)
      }
    }
  }

  private collectPickups(): void {
    for (const seg of this.segments) {
      for (const pickup of seg.pickups) {
        if (!pickup.sprite.active) {
          continue
        }
        if (Math.abs(pickup.sprite.x - this.player.x) < 34 && Math.abs(pickup.sprite.y - this.player.y) < 40) {
          pickup.sprite.destroy()
          getAudio().playSfx("pickup")
          this.applyItem(pickup.id)
        }
      }
    }
  }

  private applyItem(id: string): void {
    if (id === "carrot") {
      this.carrotsCollected += 1
      return
    }
    if (id === "mooncake") {
      this.health = Math.min(this.maxHearts, this.health + 1)
      this.updateHud()
      this.flashHint("endless.hint.mooncake")
      return
    }
    if (id === "osmanthus_blossom") {
      this.playerState.glideCharges += 1
      this.flashHint("endless.hint.blossom")
      return
    }
    if (id === "lantern") {
      const floor = this.spawnX - 700
      this.chaseX = Math.max(floor, this.chaseX - MIST_PUSH_METERS * METER_PER_PX)
      this.glowTimer = LANTERN_GLOW_S
      this.flashHint("endless.hint.mist")
    }
  }

  private flashHint(key: string): void {
    this.hintFlash = 1.6
    if (this.hud) {
      this.hud.hint.hidden = false
      this.hud.hint.textContent = t(key)
    }
  }

  private lookEnv(here: Segment | undefined): string {
    if (!here) {
      return this.generator.env
    }
    if (here.bridgeTo) {
      const t = (this.player.x - here.originX) / Math.max(1, here.width)
      return t >= 0.5 ? here.bridgeTo : here.env
    }
    return here.env
  }

  private syncTheme(here: Segment | undefined): void {
    if (here?.bridgeTo) {
      const t = Math.max(0, Math.min(1, (this.player.x - here.originX) / Math.max(1, here.width)))
      const from = getPalette(here.env)
      const to = getPalette(here.bridgeTo)
      this.applyLerpedTheme(from, to, t)
      this.tintMist(lerpHex(from.fog, to.fog, t))
      this.currentEnv = this.lookEnv(here)
      return
    }
    const env = here?.env ?? this.generator.env
    const palette = getPalette(env)
    this.applyTheme(env, palette, env !== this.weatherEnv)
    this.tintMist(palette.fog)
    this.currentEnv = env
  }

  private applyTheme(env: string, palette: Palette, rebuildWeather: boolean): void {
    this.cameras.main.setBackgroundColor(palette.sky)
    if (!this.skyFar) {
      this.skyFar = applySky(this, palette)
    } else {
      this.skyFar.setFillStyle(hexToNum(palette.far), 0.55)
    }
    const strength = nightStrength(palette.hour)
    if (!this.nightOverlay) {
      this.nightOverlay = createNightOverlay(this, strength)
    } else {
      this.nightOverlay.setAlpha(strength)
      this.nightOverlay.setVisible(strength > 0)
    }
    if (rebuildWeather) {
      this.weather?.destroy()
      this.weather = createWeather(this, palette.weather, 1920, this.reducedMotion)
      this.weatherEnv = env
    }
  }

  private applyLerpedTheme(from: Palette, to: Palette, t: number): void {
    this.cameras.main.setBackgroundColor(lerpHex(from.sky, to.sky, t))
    if (!this.skyFar) {
      this.skyFar = applySky(this, from)
    }
    this.skyFar.setFillStyle(hexToNum(lerpHex(from.far, to.far, t)), 0.55)
    const strength = nightStrength(from.hour) * (1 - t) + nightStrength(to.hour) * t
    if (!this.nightOverlay) {
      this.nightOverlay = createNightOverlay(this, strength)
    } else {
      this.nightOverlay.setAlpha(strength)
      this.nightOverlay.setVisible(strength > 0)
    }
  }

  private buildMist(palette: Palette): void {
    for (const band of this.mistBands) {
      band.destroy()
    }
    this.mistBands = []
    const widths = this.reducedMotion ? [3200] : [3600, 2800, 2000]
    const alphas = this.reducedMotion ? [0.4] : [0.18, 0.28, 0.4]
    for (let i = 0; i < widths.length; i += 1) {
      const band = this.add
        .rectangle(0, 540, widths[i], 1400, hexToNum(palette.fog), alphas[i])
        .setOrigin(1, 0.5)
        .setDepth(20 + i * 0.1)
        .setScrollFactor(1)
      this.mistBands.push(band)
    }
  }

  private tintMist(fogHex: string): void {
    const color = hexToNum(fogHex)
    for (const band of this.mistBands) {
      band.setFillStyle(color, band.alpha)
    }
  }

  private tickLanternGlow(dt: number): void {
    if (!this.lanternGlow) {
      return
    }
    this.glowTimer = Math.max(0, this.glowTimer - dt)
    if (this.glowTimer > 0) {
      this.lanternGlow.setVisible(true)
      this.lanternGlow.setPosition(this.player.x, this.player.y)
      this.lanternGlow.setAlpha(Math.min(1, this.glowTimer / 0.35))
    } else {
      this.lanternGlow.setVisible(false)
    }
  }
}
