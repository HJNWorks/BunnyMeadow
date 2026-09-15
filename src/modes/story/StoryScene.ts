import Phaser from "phaser"
import { ChunkAssembler } from "../../systems/ChunkAssembler"
import { getStoryLevel, type StoryLevelDef } from "./levels"
import { getDifficulty } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { getPlatform } from "../../core/platform"
import { mountDomShell, requireEl } from "../../ui/DomShell"

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
}

const SHELL = `
<div class="bm-shell bm-wide story-shell">
  <header class="meadow-header">
    <div>
      <div class="bm-eyebrow">Story · World 1</div>
      <h1 data-ui="levelName">Soft Paths</h1>
      <p class="bm-tagline" data-ui="objective">Reach the burrow.</p>
    </div>
  </header>
  <div class="meadow-bar">
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <button type="button" class="bm-btn" data-ui="pauseBtn">Pause</button>
    <button type="button" class="bm-btn ghost" data-ui="back">World Map</button>
  </div>
  <div class="story-field" data-ui="field"></div>
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
  padding: 20px 28px 0;
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
  background: #f5f1e6cc;
  backdrop-filter: blur(4px);
  border-radius: 16px;
  padding: 12px 16px;
}
.bm-story-hud .meadow-bar { margin-top: 10px; }
.story-shell .story-field { display:none; }
.meadow-header h1 { font-size:36px; margin:6px 0; }
.meadow-bar { display:flex; gap:20px; align-items:center; margin:16px 0 8px; flex-wrap:wrap; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:#34563855; z-index:30; pointer-events:auto; }
.meadow-overlay[hidden] { display:none; }
.meadow-card { background:#fffaf0; padding:28px; border-radius:24px; max-width:420px; text-align:center; }
.meadow-pause-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
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
  private moonPool!: Phaser.GameObjects.Rectangle
  private exitZone!: Phaser.GameObjects.Rectangle
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

    const assembler = new ChunkAssembler()
    const world = assembler.assemble(def.chunks)

    this.cameras.main.setBounds(0, 0, world.width, 1080)
    this.physics.world.setBounds(0, 0, world.width, 1080)

    for (const band of world.colors) {
      this.add.rectangle(band.x + band.width / 2, 540, band.width, 1080, Phaser.Display.Color.HexStringToColor(band.color).color).setDepth(-2)
    }

    this.platforms = this.physics.add.staticGroup()
    for (const rect of world.platforms) {
      const block = this.add.rectangle(
        rect.x + rect.w / 2,
        rect.y + rect.h / 2,
        rect.w,
        rect.h,
        rect.kind === "wall" ? 0x6a7a4a : 0x5c6b3a,
      )
      this.physics.add.existing(block, true)
      this.platforms.add(block)
      const body = block.body as Phaser.Physics.Arcade.StaticBody
      body.updateFromGameObject()
    }

    const spawnKey = `w1:${def.id}`
    const saved = save.progress.story.checkpoints[spawnKey]
    let spawnX = def.playerSpawn.x
    let spawnY = def.playerSpawn.y
    if (saved) {
      const [sx, sy] = saved.split(",").map(Number)
      if (!Number.isNaN(sx) && !Number.isNaN(sy)) {
        spawnX = sx
        spawnY = sy
        this.checkpoint = { x: sx, y: sy }
      }
    }

    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xfffaf0, 1)
    g.fillEllipse(20, 28, 36, 40)
    g.fillStyle(0xe8b3a6, 1)
    g.fillEllipse(20, 34, 10, 8)
    g.generateTexture("story_bunny", 40, 48)
    g.destroy()

    this.player = this.physics.add.sprite(spawnX, spawnY, "story_bunny")
    this.player.setDisplaySize(40, 48)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0)
    this.player.setMaxVelocity(420, 900)
    this.player.setDepth(5)

    this.physics.add.collider(this.player, this.platforms)

    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()

    for (const e of world.enemies) {
      this.spawnEnemy(e.id, e.worldX, e.worldY)
    }

    const pool = assembler.worldPoint(world, def.moonPool)
    this.moonPool = this.add.rectangle(pool.x, pool.y, 70, 28, 0x7ec8e3, 0.85).setDepth(1)
    this.physics.add.existing(this.moonPool, true)

    const exit = assembler.worldPoint(world, def.exit)
    this.exitZone = this.add.rectangle(exit.x, exit.y, 80, 90, 0x6a5538, 0.9).setDepth(1)
    this.physics.add.existing(this.exitZone, true)

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

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setDeadzone(120, 80)
    this.syncHearts()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupInput, this)
  }

  private cleanupInput = (): void => {
    getInput().stop()
    this.style?.remove()
    this.style = null
  }

  private spawnEnemy(id: string, x: number, y: number): void {
    const sprite = this.physics.add.sprite(x, y, "story_bunny")
    sprite.setDisplaySize(36, 36)
    if (id === "fox") {
      sprite.setTint(0xdf8b4c)
      sprite.setData("archetype", "chaser")
      sprite.setData("speed", 90)
    } else if (id === "crow") {
      sprite.setTint(0x2a2a32)
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
      this.lost = true
      this.hud.title.textContent = "A soft tumble"
      this.hud.message.textContent = "Try again from the Moon Pool."
      this.hud.play.textContent = "Retry →"
      this.hud.overlay.hidden = false
    }
  }

  private respawn(): void {
    const point = this.checkpoint ?? this.level.playerSpawn
    this.player.setPosition(point.x, point.y)
    this.player.setVelocity(0, 0)
    this.health = this.maxHearts
    this.invuln = 1
    this.syncHearts()
  }

  private onMoonPool(): void {
    if (this.poolTouched || this.won || this.lost) {
      return
    }
    this.poolTouched = true
    this.checkpoint = { x: this.moonPool.x, y: this.moonPool.y - 40 }
    const save = getSave()
    save.progress.story.checkpoints[`w1:${this.level.id}`] =
      `${this.checkpoint.x},${this.checkpoint.y}`
    void persistSave()
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

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const onFloor = body.blocked.down || body.touching.down
    let vx = input.moveX * (this.dashTime > 0 ? 480 : 260)
    if (input.moveX) {
      this.facing = input.moveX > 0 ? 1 : -1
    }

    if (this.wallBounce && (body.blocked.left || body.blocked.right) && !onFloor && input.jumpPressed) {
      this.player.setVelocityY(-420)
      this.player.setVelocityX(this.facing * -280)
      this.facing *= -1
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
