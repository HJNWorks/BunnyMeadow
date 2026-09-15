import Phaser from "phaser"
import { ChunkAssembler } from "../../systems/ChunkAssembler"
import { getStoryLevel, type StoryLevelDef } from "./levels"
import { getDifficulty } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { getPlatform } from "../../core/platform"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { ControlCoach, CONTROL_COACH_CSS, type CoachAction } from "../../ui/ControlCoach"

type Hud = {
  hearts: HTMLElement
  objective: HTMLElement
  levelName: HTMLElement
  overlay: HTMLElement
  title: HTMLElement
  message: HTMLElement
  play: HTMLButtonElement
  pausePanel: HTMLElement
  resume: HTMLButtonElement
  quit: HTMLButtonElement
  controlsDock: HTMLElement
  controlsFloat: HTMLElement
}

const SHELL = `
<div class="bm-shell bm-wide story-shell">
  <header class="meadow-header">
    <div class="bm-eyebrow">Story · World 1</div>
    <h1 data-ui="levelName">Soft Paths</h1>
    <p class="bm-tagline" data-ui="objective">Reach the burrow.</p>
  </header>
  <div class="meadow-bar">
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <div class="story-controls-dock" data-ui="controlsDock" hidden aria-label="Controls"></div>
    <button type="button" class="bm-btn" data-ui="pauseBtn">Pause</button>
    <button type="button" class="bm-btn ghost" data-ui="back">World Map</button>
  </div>
  <div class="story-field" data-ui="field"></div>
  <div class="story-controls-float" data-ui="controlsFloat" hidden></div>
  <div class="meadow-overlay" data-ui="overlay" hidden>
    <div class="meadow-card">
      <h2 data-ui="title">Ready</h2>
      <p data-ui="message"></p>
      <button type="button" class="bm-btn warm" data-ui="play">Continue</button>
    </div>
  </div>
  <div class="meadow-overlay" data-ui="pausePanel" hidden>
    <div class="meadow-card">
      <h2>Paused</h2>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="resume">Resume</button>
        <button type="button" class="bm-btn ghost" data-ui="quit">Quit to World Map</button>
      </div>
    </div>
  </div>
</div>
`

const CSS = `
.bm-root.bm-story-hud {
  background: transparent;
  pointer-events: none;
  overflow: hidden;
}
.bm-story-hud .bm-shell {
  max-width: none;
  padding: 12px 20px 0;
  pointer-events: none;
}
.bm-story-hud .meadow-header,
.bm-story-hud .meadow-bar,
.bm-story-hud .meadow-overlay,
.bm-story-hud button {
  pointer-events: auto;
}
.bm-story-hud .meadow-header,
.bm-story-hud .meadow-bar {
  background: linear-gradient(180deg, #f7f3e8f0, #ebe4d4e6);
  backdrop-filter: blur(6px);
  border-radius: 14px;
  padding: 8px 14px;
  border: 1px solid #d5dcc4;
  box-shadow: 0 8px 18px #2a3d2412;
}
.bm-story-hud .meadow-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}
.bm-story-hud .meadow-header .bm-tagline {
  margin: 0;
  flex: 1 1 220px;
}
.bm-story-hud .meadow-bar { margin-top: 8px; }
.story-shell .story-field { display:none; }
.meadow-header h1 { font-size:28px; margin:0; font-family: Georgia, "Times New Roman", serif; }
.meadow-header .bm-eyebrow { margin: 0; }
.meadow-bar { display:flex; gap:14px; align-items:center; margin:0 0 8px; flex-wrap:wrap; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-bar .bm-btn.ghost { margin-left:0; }
.meadow-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:#34563855; z-index:30; pointer-events:auto; }
.meadow-overlay[hidden] { display:none; }
.meadow-card { background:#fffaf0; padding:28px; border-radius:24px; max-width:420px; text-align:center; }
.meadow-pause-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
${CONTROL_COACH_CSS}
`

export class StoryScene extends Phaser.Scene {
  private levelId = "w1_1_soft_paths"
  private level!: StoryLevelDef
  private hud!: Hud
  private style: HTMLStyleElement | null = null
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private player!: Phaser.Physics.Arcade.Sprite
  private enemies!: Phaser.Physics.Arcade.Group
  private projectiles!: Phaser.Physics.Arcade.Group
  private moonPool!: Phaser.GameObjects.Image
  private exitZone!: Phaser.GameObjects.Image
  private foxHu: Phaser.Physics.Arcade.Sprite | null = null
  private health = 3
  private maxHearts = 3
  private invuln = 0
  private dashCooldown = 0
  private dashTime = 0
  private wallBounce = false
  private facing = 1
  private checkpoint: { x: number; y: number } | null = null
  private poolTouched = false
  private won = false
  private lost = false
  private paused = false
  private invincible = false
  private coach: ControlCoach | null = null

  constructor() {
    super("Story")
  }

  init(data?: { levelId?: string }): void {
    this.levelId = data?.levelId ?? "w1_1_soft_paths"
  }

  create(): void {
    const def = getStoryLevel(this.levelId)
    if (!def) {
      this.scene.start("WorldMap")
      return
    }
    this.level = def
    this.wallBounce = !!def.wallBounce
    this.won = false
    this.lost = false
    this.paused = false
    this.checkpoint = null
    this.poolTouched = false
    this.foxHu = null
    this.physics.world.isPaused = false

    this.style = document.createElement("style")
    this.style.textContent = CSS
    document.head.appendChild(this.style)

    const shell = mountDomShell(this, SHELL, { keepCanvas: true, rootClass: "bm-story-hud" })
    this.hud = {
      hearts: requireEl(shell.root, "[data-ui=hearts]"),
      objective: requireEl(shell.root, "[data-ui=objective]"),
      levelName: requireEl(shell.root, "[data-ui=levelName]"),
      overlay: requireEl(shell.root, "[data-ui=overlay]"),
      title: requireEl(shell.root, "[data-ui=title]"),
      message: requireEl(shell.root, "[data-ui=message]"),
      play: requireEl(shell.root, "[data-ui=play]"),
      pausePanel: requireEl(shell.root, "[data-ui=pausePanel]"),
      resume: requireEl(shell.root, "[data-ui=resume]"),
      quit: requireEl(shell.root, "[data-ui=quit]"),
      controlsDock: requireEl(shell.root, "[data-ui=controlsDock]"),
      controlsFloat: requireEl(shell.root, "[data-ui=controlsFloat]"),
    }

    this.hud.levelName.textContent = def.name
    this.hud.objective.textContent = def.objective

    requireEl<HTMLButtonElement>(shell.root, "[data-ui=back]").onclick = () => {
      this.cleanupInput()
      this.scene.start("WorldMap")
    }
    requireEl<HTMLButtonElement>(shell.root, "[data-ui=pauseBtn]").onclick = () => this.setPaused(true)
    this.hud.resume.onclick = () => this.setPaused(false)
    this.hud.quit.onclick = () => {
      this.cleanupInput()
      this.scene.start("WorldMap")
    }
    this.hud.play.onclick = () => {
      if (this.won) {
        this.cleanupInput()
        this.scene.start("WorldMap")
        return
      }
      if (this.lost) {
        this.respawn()
        this.hud.overlay.hidden = true
        this.lost = false
      }
    }

    const save = getSave()
    const diff = getDifficulty(save)
    this.maxHearts = diff.hearts
    this.health = this.maxHearts
    this.invincible = save.settings.accessibility.invincible
    getInput().setBindings(save.settings.bindings)
    getInput().start()

    const learned = save.progress.story.controlHints.filter(
      (value): value is CoachAction => value === "move" || value === "jump" || value === "dash",
    )
    this.coach = new ControlCoach(
      this.hud.controlsFloat,
      this.hud.controlsDock,
      save.settings.bindings,
      learned,
      {
        reducedMotion: save.settings.accessibility.reducedMotion,
        onLearned: (action) => {
          const next = getSave()
          if (!next.progress.story.controlHints.includes(action)) {
            next.progress.story.controlHints.push(action)
            void persistSave()
          }
        },
      },
    )

    const assembler = new ChunkAssembler()
    const world = assembler.assemble(def.chunks)
    this.ensureStoryTextures()

    this.cameras.main.setBounds(0, 0, world.width, 1080)
    this.cameras.main.setBackgroundColor("#b9c98a")
    this.physics.world.setBounds(0, -200, world.width, 1400, true, true, true, false)

    for (const band of world.colors) {
      this.add
        .rectangle(
          band.x + band.width / 2,
          540,
          band.width,
          1080,
          Phaser.Display.Color.HexStringToColor(band.color).color,
        )
        .setDepth(-3)
      this.add
        .rectangle(band.x + band.width / 2, 200, band.width, 220, 0xeaf3c8, 0.28)
        .setDepth(-2)
      for (let i = 0; i < 3; i += 1) {
        const cx = band.x + 140 + i * 280
        this.add.ellipse(cx, 140 + (i % 2) * 30, 120, 36, 0xf4f7e8, 0.45).setDepth(-1)
      }
    }

    this.platforms = this.physics.add.staticGroup()
    for (const rect of world.platforms) {
      if (rect.kind === "wall") {
        const tiles = Math.max(1, Math.ceil(rect.h / 56))
        for (let i = 0; i < tiles; i += 1) {
          const y = rect.y + 28 + i * 56
          if (y > rect.y + rect.h) {
            break
          }
          this.add
            .image(rect.x + rect.w / 2, Math.min(y, rect.y + rect.h - 18), "story_hedge")
            .setDisplaySize(rect.w + 14, 58)
            .setDepth(2)
        }
        const block = this.add.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, 0x3f5a32, 1)
        block.setVisible(false)
        this.physics.add.existing(block, true)
        this.platforms.add(block)
        ;(block.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
      } else {
        const block = this.add.tileSprite(
          rect.x + rect.w / 2,
          rect.y + rect.h / 2,
          rect.w,
          rect.h,
          "story_ground",
        )
        block.setDepth(1)
        this.physics.add.existing(block, true)
        this.platforms.add(block)
        ;(block.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
        this.add
          .rectangle(rect.x + rect.w / 2, rect.y + 6, rect.w, 12, 0x7d9450)
          .setDepth(1.5)
      }
    }

    const spawnX = def.playerSpawn.x
    const spawnY = def.playerSpawn.y
    this.checkpoint = { x: spawnX, y: spawnY }

    this.player = this.physics.add.sprite(spawnX, spawnY, "story_bunny")
    this.player.setDisplaySize(48, 56)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0)
    this.player.setMaxVelocity(420, 900)
    this.player.setDepth(5)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setSize(26, 38)
    playerBody.setOffset(7, 8)

    this.physics.add.collider(this.player, this.platforms)

    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()

    for (const e of world.enemies) {
      this.spawnEnemy(e.id, e.worldX, e.worldY)
    }

    const pool = assembler.worldPoint(world, def.moonPool)
    this.moonPool = this.add.image(pool.x, pool.y, "story_pool").setDepth(1)
    this.physics.add.existing(this.moonPool, true)
    ;(this.moonPool.body as Phaser.Physics.Arcade.StaticBody).setSize(70, 28)

    const exit = assembler.worldPoint(world, def.exit)
    this.exitZone = this.add.image(exit.x, exit.y, "story_exit").setDepth(1)
    this.physics.add.existing(this.exitZone, true)
    ;(this.exitZone.body as Phaser.Physics.Arcade.StaticBody).setSize(70, 70)

    this.physics.add.overlap(this.player, this.moonPool, () => this.onMoonPool())
    this.physics.add.overlap(this.player, this.exitZone, () => void this.onExit())
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      this.hurt()
      const body = enemy as Phaser.Physics.Arcade.Sprite
      if (body.getData("archetype") === "foxhu") {
        this.hurt()
      }
    })
    this.physics.add.overlap(this.player, this.projectiles, (_p, shot) => {
      ;(shot as Phaser.Physics.Arcade.Image).destroy()
      this.hurt()
    })

    if (def.foxHu) {
      this.foxHu = this.physics.add.sprite(def.foxHu.startX, def.foxHu.y, "story_bunny")
      this.foxHu.setTint(0xdf8b4c)
      this.foxHu.setDisplaySize(56, 40)
      this.foxHu.setData("archetype", "foxhu")
      this.foxHu.setData("speed", def.foxHu.speed)
      this.foxHu.setImmovable(true)
      ;(this.foxHu.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      this.enemies.add(this.foxHu)
    }

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setDeadzone(90, 60)
    this.cameras.main.setZoom(1.25)
    this.syncHearts()
    ;(window as unknown as { __bmStory?: () => Record<string, number | boolean> }).__bmStory = () => ({
      x: this.player?.x ?? 0,
      y: this.player?.y ?? 0,
      paused: this.physics.world.isPaused,
      won: this.won,
      lost: this.lost,
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      delete (window as unknown as { __bmStory?: unknown }).__bmStory
      this.cleanupInput()
    })
  }

  private cleanupInput = (): void => {
    this.physics.world.isPaused = false
    getInput().stop()
    this.coach = null
    this.style?.remove()
    this.style = null
  }

  private ensureStoryTextures(): void {
    if (!this.textures.exists("story_bunny")) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0xfffaf0, 1)
      g.fillEllipse(20, 28, 36, 40)
      g.fillStyle(0xf0c3b4, 1)
      g.fillEllipse(8, 12, 12, 18)
      g.fillEllipse(32, 12, 12, 18)
      g.fillStyle(0xfffaf0, 1)
      g.fillEllipse(8, 14, 8, 12)
      g.fillEllipse(32, 14, 8, 12)
      g.fillStyle(0xe8b3a6, 1)
      g.fillEllipse(20, 34, 10, 8)
      g.fillStyle(0x304c39, 1)
      g.fillCircle(13, 24, 2.5)
      g.fillCircle(27, 24, 2.5)
      g.generateTexture("story_bunny", 40, 48)
      g.destroy()
    }

    if (!this.textures.exists("story_ground")) {
      const dirt = this.make.graphics({ x: 0, y: 0 })
      dirt.fillStyle(0x6a7540, 1)
      dirt.fillRect(0, 0, 64, 64)
      dirt.fillStyle(0x80924f, 1)
      dirt.fillRect(0, 0, 64, 14)
      dirt.fillStyle(0x556234, 1)
      dirt.fillCircle(18, 30, 5)
      dirt.fillCircle(44, 46, 4)
      dirt.fillCircle(30, 52, 3)
      dirt.generateTexture("story_ground", 64, 64)
      dirt.destroy()
    }

    if (!this.textures.exists("story_hedge")) {
      const hedge = this.make.graphics({ x: 0, y: 0 })
      hedge.fillStyle(0x35532c, 1)
      hedge.fillRect(8, 18, 24, 46)
      hedge.fillStyle(0x4d6f3d, 1)
      hedge.fillEllipse(20, 14, 36, 26)
      hedge.fillEllipse(8, 30, 22, 20)
      hedge.fillEllipse(32, 34, 24, 22)
      hedge.fillStyle(0x6f8f52, 1)
      hedge.fillEllipse(18, 10, 16, 12)
      hedge.generateTexture("story_hedge", 40, 64)
      hedge.destroy()
    }

    if (!this.textures.exists("story_exit")) {
      const hole = this.make.graphics({ x: 0, y: 0 })
      hole.fillStyle(0x5a4330, 1)
      hole.fillEllipse(40, 52, 74, 50)
      hole.fillStyle(0x241810, 1)
      hole.fillEllipse(40, 54, 50, 34)
      hole.fillStyle(0x7a6248, 1)
      hole.fillEllipse(40, 40, 60, 18)
      hole.generateTexture("story_exit", 80, 90)
      hole.destroy()
    }

    if (!this.textures.exists("story_pool")) {
      const poolGfx = this.make.graphics({ x: 0, y: 0 })
      poolGfx.fillStyle(0x5fb4d6, 1)
      poolGfx.fillEllipse(40, 20, 74, 30)
      poolGfx.fillStyle(0x9fdcf0, 0.8)
      poolGfx.fillEllipse(40, 16, 54, 16)
      poolGfx.fillStyle(0xe8f8ff, 0.7)
      poolGfx.fillEllipse(28, 14, 18, 8)
      poolGfx.generateTexture("story_pool", 80, 36)
      poolGfx.destroy()
    }

    if (!this.textures.exists("story_crow")) {
      const crow = this.make.graphics({ x: 0, y: 0 })
      crow.fillStyle(0x2a2a32, 1)
      crow.fillEllipse(18, 18, 28, 18)
      crow.fillTriangle(4, 16, 0, 12, 8, 14)
      crow.fillStyle(0xf2f2f2, 1)
      crow.fillCircle(22, 14, 2)
      crow.generateTexture("story_crow", 36, 28)
      crow.destroy()
    }
  }

  private spawnEnemy(id: string, x: number, y: number): void {
    const texture = id === "crow" ? "story_crow" : "story_bunny"
    const sprite = this.physics.add.sprite(x, y, texture)
    sprite.setDisplaySize(id === "crow" ? 36 : 36, id === "crow" ? 28 : 36)
    if (id === "fox") {
      sprite.setTint(0xdf8b4c)
      sprite.setData("archetype", "chaser")
      sprite.setData("speed", 90)
    } else if (id === "crow") {
      sprite.setData("archetype", "ranged_lob")
      sprite.setData("speed", 40)
      sprite.setData("cooldown", 0)
      ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    } else {
      sprite.setTint(0xa8845c)
      sprite.setData("archetype", "patrol")
      sprite.setData("speed", 45)
      sprite.setData("dir", 1)
    }
    sprite.setCollideWorldBounds(true)
    this.physics.add.collider(sprite, this.platforms)
    this.enemies.add(sprite)
  }

  private syncHearts(): void {
    const empty = Math.max(0, this.maxHearts - this.health)
    this.hud.hearts.textContent = `${"♥ ".repeat(this.health)}${"♡ ".repeat(empty)}`.trim()
  }

  private setPaused(value: boolean): void {
    this.paused = value
    this.physics.world.isPaused = value
    this.hud.pausePanel.hidden = !value
    if (value) {
      getInput().clearKeys()
    }
  }

  private hurt(): void {
    if (this.invuln > 0 || this.invincible || this.won || this.lost || this.dashTime > 0) {
      return
    }
    this.health -= 1
    this.invuln = 1.2
    this.syncHearts()
    this.player.setTint(0xffcccc)
    this.time.delayedCall(200, () => this.player.clearTint())
    if (this.health <= 0) {
      this.enterDeadState(
        this.checkpoint &&
          (this.checkpoint.x !== this.level.playerSpawn.x ||
            this.checkpoint.y !== this.level.playerSpawn.y)
          ? "Continue from the last Moon Pool."
          : "Continue from the start.",
      )
    }
  }

  private enterDeadState(message: string): void {
    if (this.lost || this.won) {
      return
    }
    this.lost = true
    this.player.setVelocity(0, 0)
    this.hud.title.textContent = "A soft tumble"
    this.hud.message.textContent = message
    this.hud.play.textContent = "Retry →"
    this.hud.overlay.hidden = false
  }

  private respawn(): void {
    const point = this.checkpoint ?? this.level.playerSpawn
    this.player.setPosition(point.x, point.y)
    this.player.setVelocity(0, 0)
    this.health = this.maxHearts
    this.invuln = 1.2
    this.syncHearts()
    this.player.clearTint()
  }

  private onMoonPool(): void {
    if (this.won || this.lost) {
      return
    }
    const next = { x: this.moonPool.x, y: this.moonPool.y - 40 }
    const same =
      this.checkpoint &&
      Math.abs(this.checkpoint.x - next.x) < 2 &&
      Math.abs(this.checkpoint.y - next.y) < 2
    this.checkpoint = next
    if (same || this.poolTouched) {
      return
    }
    this.poolTouched = true
    this.scene.launch("DialogueOverlay", {
      lines: [this.level.moonLine],
      onDone: () => {
        this.poolTouched = false
      },
    })
  }

  private async onExit(): Promise<void> {
    if (this.won || this.lost) {
      return
    }
    if (this.level.foxHu && this.foxHu && this.foxHu.x < this.exitZone.x - 40) {
      return
    }
    this.won = true
    this.physics.world.isPaused = true
    const save = getSave()
    if (!save.progress.story.cleared.includes(this.level.id)) {
      save.progress.story.cleared.push(this.level.id)
    }
    save.progress.story.level = Math.max(save.progress.story.level, this.level.index + 1)
    addPantryCarrots(save, 12)
    if (this.level.id === "w1_3_cart_chase") {
      await getPlatform().achievements.unlock("FOX_FOILED")
      await getPlatform().achievements.unlock("WORLD1_CLEAR")
      if (!save.progress.achievements.includes("FOX_FOILED")) {
        save.progress.achievements.push("FOX_FOILED")
      }
      if (!save.progress.achievements.includes("WORLD1_CLEAR")) {
        save.progress.achievements.push("WORLD1_CLEAR")
      }
    }
    await persistSave()
    this.hud.title.textContent = "Path clear"
    this.hud.message.textContent =
      this.level.id === "w1_3_cart_chase"
        ? "Fox Hu is foiled. World 1 rests."
        : `${this.level.name} is done.`
    this.hud.play.textContent = "World Map →"
    this.hud.overlay.hidden = false
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.won || this.lost || !this.player?.body) {
      return
    }
    const dt = delta / 1000
    this.invuln = Math.max(0, this.invuln - dt)
    this.dashCooldown = Math.max(0, this.dashCooldown - dt)
    this.dashTime = Math.max(0, this.dashTime - dt)

    const input = getInput().snapshot()
    if (input.pausePressed) {
      this.setPaused(true)
      return
    }

    this.coach?.noteInput(input.moveX, input.jumpPressed, input.dashPressed)
    this.coach?.followPlayer(this, this.player.x, this.player.y - 28)

    if (this.player.y > 1120) {
      this.enterDeadState(
        this.checkpoint &&
          (this.checkpoint.x !== this.level.playerSpawn.x ||
            this.checkpoint.y !== this.level.playerSpawn.y)
          ? "Fall gently. Continue from the last Moon Pool."
          : "Fall gently. Continue from the start.",
      )
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const onFloor = body.blocked.down || body.touching.down
    let vx = input.moveX * (this.dashTime > 0 ? 480 : 260)
    if (input.moveX) {
      this.facing = input.moveX > 0 ? 1 : -1
    }

    if (this.wallBounce && (body.blocked.left || body.blocked.right) && !onFloor && input.jumpPressed) {
      const push = body.blocked.left ? 1 : -1
      this.player.setVelocityY(-440)
      this.player.setVelocityX(push * 310)
      this.facing = push
    } else if (input.jumpPressed && onFloor) {
      this.player.setVelocityY(-520)
    }

    if (input.dashPressed && this.dashCooldown <= 0) {
      this.dashTime = 0.16
      this.dashCooldown = getDifficulty(getSave()).dashCooldown * 0.7
      this.player.setVelocityX(this.facing * 520)
    }

    if (this.dashTime <= 0) {
      this.player.setVelocityX(vx)
    }

    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Phaser.Physics.Arcade.Sprite
      if (!enemy.active || !enemy.body) {
        return
      }
      const arch = enemy.getData("archetype") as string
      const speed = Number(enemy.getData("speed") || 40)
      if (arch === "patrol") {
        let dir = Number(enemy.getData("dir") || 1)
        enemy.setVelocityX(dir * speed)
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          dir *= -1
          enemy.setData("dir", dir)
        }
      } else if (arch === "chaser" || arch === "foxhu") {
        const dx = this.player.x - enemy.x
        enemy.setVelocityX(Math.sign(dx) * speed)
        if (arch === "foxhu") {
          enemy.setVelocityX(speed)
        }
      } else if (arch === "ranged_lob") {
        let cd = Number(enemy.getData("cooldown") || 0) - dt
        if (cd <= 0 && Math.abs(this.player.x - enemy.x) < 420) {
          const shot = this.physics.add.image(enemy.x, enemy.y, "story_bunny")
          shot.setDisplaySize(14, 14)
          shot.setTint(0x4a3a2a)
          const dx = this.player.x - enemy.x
          const dy = this.player.y - enemy.y
          const n = Math.hypot(dx, dy) || 1
          shot.setVelocity((dx / n) * 220, (dy / n) * 180 - 80)
          this.projectiles.add(shot)
          this.time.delayedCall(2000, () => shot.destroy())
          cd = 1.8
        }
        enemy.setData("cooldown", cd)
        enemy.setVelocityX(0)
      }
    })
  }
}
