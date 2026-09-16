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
  worldLabel: HTMLElement
  bossHits: HTMLElement
  overlay: HTMLElement
  title: HTMLElement
  message: HTMLElement
  play: HTMLButtonElement
  pausePanel: HTMLElement
  resume: HTMLButtonElement
  quit: HTMLButtonElement
  controlsDock: HTMLElement
  controlsFloat: HTMLElement
  epilogue: HTMLElement
  epilogueBody: HTMLElement
  epilogueContinue: HTMLButtonElement
}

type MoverState = {
  sprite: Phaser.Physics.Arcade.Image
  baseX: number
  baseY: number
  axis: "x" | "y"
  amplitude: number
  speed: number
  phase: number
}

type RideState = {
  sprite: Phaser.Physics.Arcade.Image
  points: { x: number; y: number }[]
  index: number
  speed: number
}

const SHELL = `
<div class="bm-shell bm-wide story-shell">
  <header class="meadow-header">
    <div class="bm-eyebrow" data-ui="worldLabel">Story</div>
    <h1 data-ui="levelName">Soft Paths</h1>
    <p class="bm-tagline" data-ui="objective">Reach the burrow.</p>
  </header>
  <div class="meadow-bar">
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span data-ui="bossHits" hidden></span>
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
  <div class="meadow-overlay" data-ui="epilogue" hidden>
    <div class="meadow-card" style="max-width:520px;text-align:left;font:18px Georgia,serif">
      <div class="bm-eyebrow">Epilogue</div>
      <div data-ui="epilogueBody"></div>
      <button type="button" class="bm-btn warm" data-ui="epilogueContinue" style="margin-top:14px">Continue</button>
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
  z-index: 50;
}
.bm-story-hud .bm-shell {
  max-width: none;
  padding: 12px 20px 0;
  pointer-events: none;
}
.bm-story-hud .meadow-header,
.bm-story-hud .meadow-bar,
.bm-story-hud .meadow-overlay,
.bm-story-hud .meadow-overlay *,
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
.meadow-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:#34563866; z-index:60; pointer-events:auto; }
.meadow-overlay[hidden] { display:none !important; }
.meadow-card { background:#fffaf0; padding:28px; border-radius:24px; max-width:420px; text-align:center; position:relative; z-index:61; }
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
  private bossSprite: Phaser.Physics.Arcade.Sprite | null = null
  private diveLine: Phaser.GameObjects.Rectangle | null = null
  private bossHits = 0
  private bossNeeded = 0
  private bossCooldown = 0
  private cranePhase: "dive" | "bow" | "done" = "dive"
  private craneDives = 0
  private epilogueStep = 0
  private epilogueLines: string[] = []
  private health = 3
  private maxHearts = 3
  private invuln = 0
  private dashCooldown = 0
  private dashTime = 0
  private wallBounce = false
  private glide = false
  private facing = 1
  private airJumps = 1
  private maxAirJumps = 1
  private checkpoint: { x: number; y: number } | null = null
  private poolClaimed = false
  private won = false
  private lost = false
  private paused = false
  private invincible = false
  private inDialogue = false
  private coach: ControlCoach | null = null
  private leaving = false
  private movers: MoverState[] = []
  private hazards: Phaser.GameObjects.Rectangle[] = []
  private ride: RideState | null = null
  private waterGrace = 0
  private baseGravity = 1200

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
    this.glide = !!def.glide
    this.airJumps = this.maxAirJumps
    this.won = false
    this.lost = false
    this.paused = false
    this.checkpoint = null
    this.poolClaimed = false
    this.inDialogue = false
    this.foxHu = null
    this.bossSprite = null
    this.diveLine = null
    this.bossHits = 0
    this.bossNeeded = 0
    this.bossCooldown = 0
    this.cranePhase = "dive"
    this.craneDives = 0
    this.epilogueStep = 0
    this.leaving = false
    this.movers = []
    this.hazards = []
    this.ride = null
    this.waterGrace = 0
    this.physics.world.isPaused = false

    this.style = document.createElement("style")
    this.style.textContent = CSS
    document.head.appendChild(this.style)

    const shell = mountDomShell(this, SHELL, { keepCanvas: true, rootClass: "bm-story-hud" })
    this.hud = {
      hearts: requireEl(shell.root, "[data-ui=hearts]"),
      objective: requireEl(shell.root, "[data-ui=objective]"),
      levelName: requireEl(shell.root, "[data-ui=levelName]"),
      worldLabel: requireEl(shell.root, "[data-ui=worldLabel]"),
      bossHits: requireEl(shell.root, "[data-ui=bossHits]"),
      overlay: requireEl(shell.root, "[data-ui=overlay]"),
      title: requireEl(shell.root, "[data-ui=title]"),
      message: requireEl(shell.root, "[data-ui=message]"),
      play: requireEl(shell.root, "[data-ui=play]"),
      pausePanel: requireEl(shell.root, "[data-ui=pausePanel]"),
      resume: requireEl(shell.root, "[data-ui=resume]"),
      quit: requireEl(shell.root, "[data-ui=quit]"),
      controlsDock: requireEl(shell.root, "[data-ui=controlsDock]"),
      controlsFloat: requireEl(shell.root, "[data-ui=controlsFloat]"),
      epilogue: requireEl(shell.root, "[data-ui=epilogue]"),
      epilogueBody: requireEl(shell.root, "[data-ui=epilogueBody]"),
      epilogueContinue: requireEl(shell.root, "[data-ui=epilogueContinue]"),
    }

    this.hud.levelName.textContent = def.name
    this.hud.objective.textContent = def.objective
    this.hud.worldLabel.textContent =
      def.world === 0 ? "Story · Soft Paws" : `Story · World ${def.world}`

    requireEl<HTMLButtonElement>(shell.root, "[data-ui=back]").onclick = () => this.leaveToWorldMap()
    requireEl<HTMLButtonElement>(shell.root, "[data-ui=pauseBtn]").onclick = () => this.setPaused(true)
    this.hud.resume.onclick = () => this.setPaused(false)
    this.hud.quit.onclick = () => this.leaveToWorldMap()
    this.hud.epilogueContinue.onclick = () => this.advanceEpilogue()
    const goMap = (event: Event): void => {
      event.preventDefault()
      event.stopPropagation()
      if (this.won) {
        this.leaveToWorldMap()
        return
      }
      if (this.lost) {
        this.respawn()
        this.hud.overlay.hidden = true
        this.lost = false
      }
    }
    this.hud.play.addEventListener("click", goMap)
    this.hud.play.addEventListener("pointerup", goMap)

    const save = getSave()
    const diff = getDifficulty(save)
    this.maxHearts = diff.hearts
    this.health = this.maxHearts
    this.invincible = save.settings.accessibility.invincible
    getInput().setBindings(save.settings.bindings)
    getInput().start()

    const learned = def.tutorial
      ? []
      : save.progress.story.controlHints.filter(
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

    const skyHex = def.sky ?? world.colors[0]?.color ?? "#c5d48a"
    const skyNum = Number.parseInt(skyHex.replace("#", ""), 16)
    this.cameras.main.setBounds(0, 0, world.width, 1080)
    this.cameras.main.setBackgroundColor(skyHex)
    this.physics.world.setBounds(0, -200, world.width, 1400, true, true, true, false)
    this.baseGravity = this.physics.world.gravity.y || 1200
    if (def.lowGravity) {
      this.physics.world.gravity.y = this.baseGravity * 0.42
      this.baseGravity = this.physics.world.gravity.y
    }

    this.add.rectangle(world.width / 2, 540, world.width, 1080, skyNum).setDepth(-3)
    this.add.rectangle(world.width / 2, 200, world.width, 220, 0xeaf3c8, 0.18).setDepth(-2)
    for (let i = 0; i < Math.ceil(world.width / 280); i += 1) {
      const cx = 140 + i * 280
      this.add.ellipse(cx, 130 + (i % 2) * 28, 120, 36, 0xf4f7e8, 0.28).setDepth(-1)
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

    for (const mover of world.movers) {
      const sprite = this.physics.add.image(
        mover.worldX + mover.w / 2,
        mover.worldY + mover.h / 2,
        "story_log",
      )
      sprite.setDisplaySize(mover.w, mover.h)
      sprite.setTint(mover.tint ?? 0x8b5a2b)
      sprite.setDepth(3)
      sprite.setImmovable(true)
      ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      ;(sprite.body as Phaser.Physics.Arcade.Body).setSize(mover.w, mover.h)
      this.physics.add.collider(this.player, sprite)
      this.movers.push({
        sprite,
        baseX: mover.worldX + mover.w / 2,
        baseY: mover.worldY + mover.h / 2,
        axis: mover.axis,
        amplitude: mover.amplitude,
        speed: mover.speed,
        phase: Math.random() * Math.PI * 2,
      })
    }

    for (const hazard of world.hazards) {
      const water = this.add.rectangle(
        hazard.worldX + hazard.w / 2,
        hazard.worldY + hazard.h / 2,
        hazard.w,
        hazard.h,
        0x4a90b8,
        0.45,
      )
      water.setDepth(0.5)
      water.setData("current", hazard.current ?? 0)
      water.setData("kind", hazard.kind)
      this.physics.add.existing(water, true)
      this.hazards.push(water)
      this.physics.add.overlap(this.player, water, () => {
        this.onWater(water)
      })
    }

    if (def.ride && def.ride.waypoints.length > 0) {
      const points = def.ride.waypoints.map((point) => assembler.worldPoint(world, point))
      const start = points[0]
      const sprite = this.physics.add.image(start.x, start.y, "story_tiger")
      sprite.setDisplaySize(def.ride.w, def.ride.h)
      sprite.setDepth(4)
      sprite.setImmovable(true)
      ;(sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      ;(sprite.body as Phaser.Physics.Arcade.Body).setSize(def.ride.w, def.ride.h)
      this.physics.add.collider(this.player, sprite)
      this.ride = {
        sprite,
        points,
        index: 0,
        speed: def.ride.speed,
      }
    }

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
    const exitBody = this.exitZone.body as Phaser.Physics.Arcade.StaticBody
    exitBody.setSize(100, 100)
    exitBody.setOffset(-10, -10)
    exitBody.updateFromGameObject()

    this.physics.add.overlap(this.player, this.moonPool, () => this.onMoonPool())
    this.physics.add.overlap(this.player, this.exitZone, () => void this.onExit())
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      const body = enemy as Phaser.Physics.Arcade.Sprite
      const arch = body.getData("archetype") as string
      if (arch === "heron_boss") {
        this.tryHitHeron()
        return
      }
      if (arch === "crane_boss" || arch === "heron_done") {
        return
      }
      if (arch === "foxhu") {
        if (this.dashTime > 0) {
          this.tipFoxCart(body)
          return
        }
        this.hurt()
        return
      }
      this.hurt()
    })
    this.physics.add.overlap(this.player, this.projectiles, (_p, shot) => {
      ;(shot as Phaser.Physics.Arcade.Image).destroy()
      this.hurt()
    })

    if (def.foxHu) {
      this.foxHu = this.physics.add.sprite(def.foxHu.startX, def.foxHu.y, "story_cart")
      this.foxHu.setDisplaySize(88, 48)
      this.foxHu.setData("archetype", "foxhu")
      this.foxHu.setData("speed", def.foxHu.speed)
      this.foxHu.setImmovable(true)
      ;(this.foxHu.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      ;(this.foxHu.body as Phaser.Physics.Arcade.Body).setSize(80, 40)
      this.enemies.add(this.foxHu)
    }

    if (def.boss?.kind === "heron") {
      this.bossNeeded = def.boss.hitsNeeded ?? 3
      this.bossSprite = this.physics.add.sprite(def.boss.x ?? 1500, def.boss.y ?? 820, "story_heron")
      this.bossSprite.setDisplaySize(64, 72)
      this.bossSprite.setData("archetype", "heron_boss")
      this.bossSprite.setImmovable(true)
      ;(this.bossSprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      this.enemies.add(this.bossSprite)
      this.hud.bossHits.hidden = false
      this.syncBossHits()
    }

    if (def.boss?.kind === "crane") {
      this.bossNeeded = def.boss.divesNeeded ?? 3
      this.bossSprite = this.physics.add.sprite(def.boss.x ?? 1400, def.boss.y ?? 400, "story_crane")
      this.bossSprite.setDisplaySize(72, 56)
      this.bossSprite.setData("archetype", "crane_boss")
      this.bossSprite.setImmovable(true)
      ;(this.bossSprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      this.enemies.add(this.bossSprite)
      this.diveLine = this.add.rectangle(0, 0, 8, 220, 0xffe08a, 0.55).setDepth(6).setVisible(false)
      this.hud.bossHits.hidden = false
      this.syncBossHits()
      this.bossCooldown = 1.2
    }

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setDeadzone(90, 60)
    this.cameras.main.setZoom(1.25)
    this.syncHearts()
    ;(window as unknown as { __bmStory?: () => Record<string, number | boolean> }).__bmStory = () => ({
      x: this.player?.x ?? 0,
      y: this.player?.y ?? 0,
      paused: !!this.physics.world?.isPaused,
      won: this.won,
      lost: this.lost,
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      delete (window as unknown as { __bmStory?: unknown }).__bmStory
      this.cleanupInput()
    })
  }

  private leaveToWorldMap(): void {
    if (this.leaving) {
      return
    }
    this.leaving = true
    if (this.scene.isActive("DialogueOverlay")) {
      this.scene.stop("DialogueOverlay")
    }
    this.inDialogue = false
    this.paused = false
    if (this.physics.world) {
      this.physics.world.isPaused = false
    }
    getInput().stop()
    this.coach = null
    this.style?.remove()
    this.style = null
    this.scene.start("WorldMap")
  }

  private cleanupInput = (): void => {
    if (this.physics?.world) {
      this.physics.world.isPaused = false
    }
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

    if (!this.textures.exists("story_log")) {
      const log = this.make.graphics({ x: 0, y: 0 })
      log.fillStyle(0x8b5a2b, 1)
      log.fillRoundedRect(0, 4, 64, 24, 10)
      log.fillStyle(0xa8733a, 1)
      log.fillRoundedRect(4, 8, 56, 10, 6)
      log.generateTexture("story_log", 64, 32)
      log.destroy()
    }

    if (!this.textures.exists("story_tiger")) {
      const tiger = this.make.graphics({ x: 0, y: 0 })
      tiger.fillStyle(0xe0a040, 1)
      tiger.fillRoundedRect(4, 8, 88, 28, 10)
      tiger.fillStyle(0x3a2a18, 1)
      tiger.fillRect(18, 10, 6, 24)
      tiger.fillRect(40, 10, 6, 24)
      tiger.fillRect(62, 10, 6, 24)
      tiger.fillStyle(0xf0c060, 1)
      tiger.fillCircle(12, 16, 10)
      tiger.fillStyle(0x2a2010, 1)
      tiger.fillCircle(8, 14, 2)
      tiger.generateTexture("story_tiger", 100, 40)
      tiger.destroy()
    }

    if (!this.textures.exists("story_cart")) {
      const cart = this.make.graphics({ x: 0, y: 0 })
      cart.fillStyle(0x8b5a2b, 1)
      cart.fillRoundedRect(4, 16, 90, 28, 6)
      cart.fillStyle(0xdf8b4c, 1)
      cart.fillEllipse(70, 14, 28, 22)
      cart.fillStyle(0xf2a35a, 1)
      cart.fillCircle(18, 48, 10)
      cart.fillCircle(78, 48, 10)
      cart.fillStyle(0xe07030, 1)
      cart.fillCircle(62, 10, 4)
      cart.generateTexture("story_cart", 100, 60)
      cart.destroy()
    }

    if (!this.textures.exists("story_heron")) {
      const heron = this.make.graphics({ x: 0, y: 0 })
      heron.fillStyle(0xd8e0e8, 1)
      heron.fillEllipse(24, 36, 28, 40)
      heron.fillStyle(0xb0bcc8, 1)
      heron.fillTriangle(24, 8, 18, 28, 30, 28)
      heron.fillStyle(0xe8a040, 1)
      heron.fillTriangle(24, 6, 40, 10, 24, 14)
      heron.fillStyle(0x304050, 1)
      heron.fillCircle(28, 22, 2)
      heron.generateTexture("story_heron", 48, 64)
      heron.destroy()
    }

    if (!this.textures.exists("story_crane")) {
      const crane = this.make.graphics({ x: 0, y: 0 })
      crane.fillStyle(0xf4f6f8, 1)
      crane.fillEllipse(36, 28, 48, 26)
      crane.fillStyle(0xe8ecf0, 1)
      crane.fillTriangle(10, 28, 0, 18, 16, 22)
      crane.fillTriangle(62, 28, 72, 18, 56, 22)
      crane.fillStyle(0xc04040, 1)
      crane.fillCircle(48, 24, 3)
      crane.fillStyle(0x304050, 1)
      crane.fillCircle(42, 22, 2)
      crane.generateTexture("story_crane", 72, 48)
      crane.destroy()
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
    if (this.physics.world) {
      this.physics.world.isPaused = value
    }
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
    if (this.won || this.lost || this.poolClaimed || this.inDialogue) {
      return
    }
    this.poolClaimed = true
    this.inDialogue = true
    this.checkpoint = { x: this.moonPool.x, y: this.moonPool.y - 40 }
    this.player.setVelocity(0, 0)
    this.physics.world.isPaused = true
    this.scene.launch("DialogueOverlay", {
      lines: [this.level.moonLine],
      onDone: () => {
        this.inDialogue = false
        if (!this.paused && !this.won && !this.lost) {
          this.physics.world.isPaused = false
        }
      },
    })
  }

  private onWater(water: Phaser.GameObjects.Rectangle): void {
    if (this.won || this.lost) {
      return
    }
    const current = Number(water.getData("current") || 0)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (current !== 0) {
      body.velocity.x += current * 0.04
    }
    body.velocity.y = Math.min(body.velocity.y, 120)
    const bounds = water.getBounds()
    if (this.player.y > bounds.centerY + 10) {
      this.waterGrace += 0.016
      if (this.waterGrace > 0.35) {
        this.waterGrace = 0
        this.enterDeadState(
          this.checkpoint &&
            (this.checkpoint.x !== this.level.playerSpawn.x ||
              this.checkpoint.y !== this.level.playerSpawn.y)
            ? "The river is soft. Continue from the last Moon Pool."
            : "The river is soft. Continue from the start.",
        )
      }
    }
  }

  private tipFoxCart(cart: Phaser.Physics.Arcade.Sprite): void {
    if (this.bossCooldown > 0) {
      return
    }
    this.bossCooldown = 0.45
    const slowed = Math.max(40, Number(cart.getData("speed") || 150) * 0.35)
    cart.setData("speed", slowed)
    cart.setVelocityX(slowed * 0.2)
    cart.setTint(0xffd0a0)
    this.time.delayedCall(500, () => {
      cart.clearTint()
      cart.setData("speed", this.level.foxHu?.speed ?? 150)
    })
  }

  private syncBossHits(): void {
    if (!this.level.boss) {
      this.hud.bossHits.hidden = true
      return
    }
    this.hud.bossHits.hidden = false
    if (this.level.boss.kind === "heron") {
      this.hud.bossHits.textContent = `Heron ${this.bossHits}/${this.bossNeeded}`
      return
    }
    if (this.level.boss.kind === "crane") {
      this.hud.bossHits.textContent =
        this.cranePhase === "bow" || this.cranePhase === "done"
          ? "Crane bows · exit open"
          : `Dives ${this.craneDives}/${this.bossNeeded}`
    }
  }

  private tryHitHeron(): void {
    if (!this.bossSprite || this.bossCooldown > 0 || this.won) {
      return
    }
    if (this.dashTime <= 0) {
      this.hurt()
      return
    }
    this.bossHits += 1
    this.bossCooldown = 0.7
    this.bossSprite.setTint(0xffffff)
    this.time.delayedCall(120, () => this.bossSprite?.clearTint())
    this.syncBossHits()
    if (this.bossHits >= this.bossNeeded) {
      this.bossSprite.setAlpha(0.45)
      this.bossSprite.setData("archetype", "heron_done")
    }
  }

  private updateBoss(dt: number): void {
    this.bossCooldown = Math.max(0, this.bossCooldown - dt)
    if (!this.bossSprite || !this.level.boss) {
      return
    }
    if (this.level.boss.kind === "heron") {
      const dx = this.player.x - this.bossSprite.x
      this.bossSprite.setVelocityX(Math.sign(dx) * 55)
      return
    }
    if (this.level.boss.kind !== "crane") {
      return
    }
    if (this.cranePhase === "bow" || this.cranePhase === "done") {
      this.bossSprite.setVelocity(0, 0)
      this.diveLine?.setVisible(false)
      return
    }
    if (this.bossCooldown > 0.5 && this.diveLine) {
      this.diveLine.setVisible(true)
      this.diveLine.setPosition(this.player.x, this.player.y - 40)
      this.bossSprite.setPosition(this.player.x, Math.min(this.bossSprite.y, this.player.y - 150))
      this.bossSprite.setVelocity(0, 0)
    } else if (this.bossCooldown > 0 && this.diveLine?.visible) {
      this.bossSprite.setVelocityY(480)
      if (this.bossSprite.y >= this.player.y - 20) {
        if (Math.abs(this.bossSprite.x - this.player.x) < 55 && this.dashTime <= 0) {
          this.hurt()
        }
        this.diveLine.setVisible(false)
        this.craneDives += 1
        this.syncBossHits()
        this.bossSprite.setVelocity(0, 0)
        this.bossSprite.y = this.player.y - 140
        this.bossCooldown = 0
        if (this.craneDives >= this.bossNeeded) {
          this.cranePhase = "bow"
          this.bossSprite.setTint(0xfff0d0)
          this.syncBossHits()
          this.inDialogue = true
          this.physics.world.isPaused = true
          this.scene.launch("DialogueOverlay", {
            lines: ["The Crane Envoy bows. It knows the mistake.", "Ride when you are ready."],
            onDone: () => {
              this.inDialogue = false
              if (!this.paused && !this.won && !this.lost) {
                this.physics.world.isPaused = false
              }
            },
          })
        } else {
          this.bossCooldown = 1.7
        }
      }
    } else if (this.bossCooldown <= 0) {
      this.bossCooldown = 1.9
      this.bossSprite.setPosition(this.player.x, this.player.y - 180)
      this.bossSprite.setVelocity(0, 0)
    }
  }

  private showEpilogue(): void {
    this.epilogueLines = [
      "Yue plays under Wu Gang's tree with the Jade Rabbit.",
      "Chang'e asks Mei to stay. The palace is quiet and lonely.",
      "Mei offers a mooncake and a promise: every full moon the burrow will wave.",
      "The Crane Envoy carries them home. Kits watch the moon together.",
    ]
    this.epilogueStep = 0
    this.hud.overlay.hidden = true
    this.hud.epilogue.hidden = false
    this.hud.epilogueBody.innerHTML = `<p>${this.epilogueLines[0]}</p>`
  }

  private advanceEpilogue(): void {
    this.epilogueStep += 1
    if (this.epilogueStep >= this.epilogueLines.length) {
      this.hud.epilogue.hidden = true
      this.leaveToWorldMap()
      return
    }
    this.hud.epilogueBody.innerHTML = `<p>${this.epilogueLines[this.epilogueStep]}</p>`
  }

  private async onExit(): Promise<void> {
    if (this.won || this.lost || this.leaving) {
      return
    }
    if (this.level.foxHu && this.foxHu && this.foxHu.x < this.exitZone.x - 40) {
      return
    }
    if (this.level.boss?.kind === "heron" && this.bossHits < this.bossNeeded) {
      return
    }
    if (this.level.boss?.kind === "crane" && this.cranePhase === "dive") {
      return
    }
    this.won = true
    this.inDialogue = false
    if (this.scene.isActive("DialogueOverlay")) {
      this.scene.stop("DialogueOverlay")
    }
    this.player.setVelocity(0, 0)
    this.physics.world.isPaused = true
    this.hud.controlsFloat.hidden = true
    this.hud.pausePanel.hidden = true

    try {
      const save = getSave()
      if (!save.progress.story.cleared.includes(this.level.id)) {
        save.progress.story.cleared.push(this.level.id)
      }
      save.progress.story.level = Math.max(save.progress.story.level, this.level.index + 1)
      addPantryCarrots(save, 12)
      const unlock = async (id: string): Promise<void> => {
        await getPlatform().achievements.unlock(id)
        if (!save.progress.achievements.includes(id)) {
          save.progress.achievements.push(id)
        }
      }
      if (this.level.id === "w1_3_cart_chase") {
        await unlock("FOX_FOILED")
        await unlock("WORLD1_CLEAR")
      }
      if (this.level.id === "w2_3_raft_gauntlet") {
        await unlock("WORLD2_CLEAR")
      }
      if (this.level.id === "w3_3_crane_summit") {
        await unlock("CRANE_FRIEND")
        await unlock("WORLD3_CLEAR")
      }
      if (this.level.id === "moon_guanghan") {
        await unlock("MOON_RETURN")
      }
      await persistSave()
    } catch {
      // Keep the win overlay available even if save fails.
    }

    if (this.level.epilogue) {
      this.showEpilogue()
      return
    }

    this.hud.title.textContent = "Path clear"
    this.hud.message.textContent =
      this.level.id === "w0_controls"
        ? "Paws ready. Soft Paths opens on the map."
        : this.level.id === "w1_3_cart_chase"
          ? "Fox Hu is foiled. World 1 rests."
          : this.level.id === "w2_3_raft_gauntlet"
            ? "Heron Fisher yields the river."
            : this.level.id === "w3_3_crane_summit"
              ? "The Crane Envoy offers a ride to the moon."
              : `${this.level.name} is done.`
    this.hud.play.textContent = "World Map →"
    this.hud.overlay.hidden = false
    this.hud.overlay.style.display = "flex"
    this.hud.play.focus()
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.won || this.lost || this.inDialogue || !this.player?.body) {
      return
    }
    const dt = delta / 1000
    this.invuln = Math.max(0, this.invuln - dt)
    this.dashCooldown = Math.max(0, this.dashCooldown - dt)
    this.dashTime = Math.max(0, this.dashTime - dt)
    this.waterGrace = Math.max(0, this.waterGrace - dt * 0.5)
    this.updateBoss(dt)

    for (const mover of this.movers) {
      mover.phase += dt * mover.speed
      const offset = Math.sin(mover.phase) * mover.amplitude
      const nextX = mover.axis === "x" ? mover.baseX + offset : mover.baseX
      const nextY = mover.axis === "y" ? mover.baseY + offset : mover.baseY
      const dx = nextX - mover.sprite.x
      const dy = nextY - mover.sprite.y
      mover.sprite.setPosition(nextX, nextY)
      ;(mover.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
      const body = this.player.body as Phaser.Physics.Arcade.Body
      if (body.blocked.down || body.touching.down) {
        const onMover =
          Math.abs(this.player.x - mover.sprite.x) < mover.sprite.displayWidth * 0.55 &&
          Math.abs(this.player.y - (mover.sprite.y - mover.sprite.displayHeight * 0.5)) < 40
        if (onMover) {
          this.player.x += dx
          this.player.y += dy
        }
      }
    }

    if (this.ride) {
      const target = this.ride.points[this.ride.index]
      const dx = target.x - this.ride.sprite.x
      const dy = target.y - this.ride.sprite.y
      const dist = Math.hypot(dx, dy) || 1
      const step = Math.min(this.ride.speed * dt, dist)
      const mx = (dx / dist) * step
      const my = (dy / dist) * step
      this.ride.sprite.x += mx
      this.ride.sprite.y += my
      ;(this.ride.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
      const body = this.player.body as Phaser.Physics.Arcade.Body
      if (body.blocked.down || body.touching.down) {
        const onRide =
          Math.abs(this.player.x - this.ride.sprite.x) < this.ride.sprite.displayWidth * 0.55 &&
          Math.abs(this.player.y - (this.ride.sprite.y - this.ride.sprite.displayHeight * 0.5)) < 48
        if (onRide) {
          this.player.x += mx
          this.player.y += my
        }
      }
      if (dist < 8) {
        this.ride.index = Math.min(this.ride.index + 1, this.ride.points.length - 1)
      }
    }

    const input = getInput().snapshot()
    if (input.pausePressed) {
      this.setPaused(true)
      return
    }

    this.coach?.noteInput(input.moveX, input.jumpPressed, input.dashPressed)
    this.coach?.followPlayer(this, this.player.x, this.player.y - 28)

    if (
      !this.won &&
      Math.abs(this.player.x - this.exitZone.x) < 55 &&
      Math.abs(this.player.y - this.exitZone.y) < 70
    ) {
      void this.onExit()
      return
    }

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
    if (onFloor) {
      this.airJumps = this.maxAirJumps
    }
    let vx = input.moveX * (this.dashTime > 0 ? 480 : 260)
    if (input.moveX) {
      this.facing = input.moveX > 0 ? 1 : -1
    }

    if (this.glide && !onFloor && input.jumpHeld && body.velocity.y > 0) {
      body.setGravityY(this.baseGravity * 0.22)
      body.velocity.y = Math.min(body.velocity.y, 90)
    } else {
      body.setGravityY(this.baseGravity)
    }

    if (this.wallBounce && (body.blocked.left || body.blocked.right) && !onFloor && input.jumpPressed) {
      const push = body.blocked.left ? 1 : -1
      this.player.setVelocityY(-520)
      this.player.setVelocityX(push * 340)
      this.facing = push
      this.airJumps = this.maxAirJumps
    } else if (input.jumpPressed && onFloor) {
      this.player.setVelocityY(-720)
      this.airJumps = this.maxAirJumps
    } else if (input.jumpPressed && !onFloor && this.airJumps > 0) {
      this.airJumps -= 1
      this.player.setVelocityY(-640)
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
