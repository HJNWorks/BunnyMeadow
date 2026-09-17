import Phaser from "phaser"
import { ChunkAssembler } from "../../systems/ChunkAssembler"
import { getStoryLevel, type StoryLevelDef } from "./levels"
import { applyOverlay,
  cloneStoryLevel,
  getOverlay,
  isEditorEnabled,
  mountBuildHud,
  type EditorMode,
} from "./editor"
import { spawnDecorItem } from "./editor/spawnDecor"
import { getDifficulty } from "../../core/difficulty"
import { getInput } from "../../core/input"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { getPlatform } from "../../core/platform"
import { t } from "../../core/i18n"
import { getAudio, musicIdForEnv } from "../../core/audio"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { attachPlayfieldFrame, measureChromeInsets } from "../../ui/playfieldFrame"
import { equippedDashDef, PhaserDashFx } from "../../fx/dash"
import { ControlCoach, CONTROL_COACH_CSS, type CoachAction } from "../../ui/ControlCoach"
import { ITEM_TRAY_CSS, bindItemTray, renderItemTray, type TrayBuff } from "../../ui/ItemTray"
import { ensureStoryTextures } from "./shared/storyTextures"
import {
  createPlayerState,
  tickPlayerTimers,
  updatePlayerMovement,
  type PlayerState,
} from "./shared/playerController"
import { spawnEnemy, updateEnemies, freezeEnemyForEditor } from "./shared/enemyKit"
import { HAN_WARMTH, HanFight } from "./shared/hanBoss"
import {
  applyWaterPhysics,
  createMovers,
  createWaterHazards,
  updateMovers,
  type MoverState,
} from "./shared/moversHazards"
import {
  applySky,
  createLanternGlow,
  createNightOverlay,
  createWeather,
  getPalette,
  hexToNum,
  nightStrength,
  storyEnvForLevel,
  type PaletteHour,
  type WeatherHandle,
  type WeatherPreset,
} from "./shared/themeKit"

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
  itemTray: HTMLElement
  hanHearts: HTMLElement
}


type RideState = {
  sprite: Phaser.Physics.Arcade.Image
  points: { x: number; y: number }[]
  speed: number
  carrying: boolean
  destIndex: number
}

function shellHtml(): string {
  return `
<div class="bm-shell bm-wide story-shell">
  <header class="meadow-header">
    <div class="bm-eyebrow" data-ui="worldLabel">${t("mode.story")}</div>
    <h1 data-ui="levelName"></h1>
    <p class="bm-tagline" data-ui="objective"></p>
  </header>
  <div class="meadow-bar">
    <span>${t("hud.hearts")} <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span data-ui="bossHits" hidden></span>
    <div class="story-controls-dock" data-ui="controlsDock" hidden aria-label="${t("common.controls")}"></div>
    <button type="button" class="bm-btn ghost" data-ui="muteBtn">${t("story.hud.mute")}</button>
    <button type="button" class="bm-btn" data-ui="pauseBtn">${t("story.hud.pause")}</button>
    <button type="button" class="bm-btn ghost" data-ui="back">${t("story.hud.back")}</button>
  </div>
  <div class="bm-item-tray" data-ui="itemTray" hidden></div>
  <div class="story-han-hearts" data-ui="hanHearts" hidden></div>
  <div class="story-field" data-ui="field"></div>
  <div class="story-controls-float" data-ui="controlsFloat" hidden></div>
  <div class="meadow-overlay" data-ui="overlay" hidden>
    <div class="meadow-card">
      <h2 data-ui="title">${t("common.ready")}</h2>
      <p data-ui="message"></p>
      <button type="button" class="bm-btn warm" data-ui="play">${t("common.continue")}</button>
    </div>
  </div>
  <div class="meadow-overlay" data-ui="epilogue" hidden>
    <div class="meadow-card" style="max-width:520px;text-align:left;font:18px Georgia,serif">
      <div class="bm-eyebrow">${t("story.epilogue.eyebrow")}</div>
      <div data-ui="epilogueBody"></div>
      <button type="button" class="bm-btn warm" data-ui="epilogueContinue" style="margin-top:14px">${t("common.continue")}</button>
    </div>
  </div>
  <div class="meadow-overlay" data-ui="pausePanel" hidden>
    <div class="meadow-card">
      <h2>${t("common.pause")}</h2>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="resume">${t("story.hud.resume")}</button>
        <button type="button" class="bm-btn ghost" data-ui="quit">${t("story.hud.quit")}</button>
      </div>
    </div>
  </div>
</div>
`
}

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
${ITEM_TRAY_CSS}
.bm-story-hud .bm-item-tray { top: 168px; }
.story-han-hearts {
  position: fixed;
  top: 168px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 56;
  pointer-events: none;
  font: 800 26px Georgia, "Times New Roman", serif;
  letter-spacing: 0.18em;
  color: #f7fbff;
  text-shadow: 0 1px 0 #0d1420, 0 6px 16px #152033aa;
}
.story-han-hearts[hidden] { display: none; }
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
  private moonPool: Phaser.GameObjects.Image | null = null
  private exitZone!: Phaser.GameObjects.Image
  private foxHu: Phaser.Physics.Arcade.Sprite | null = null
  private galeWall: Phaser.Physics.Arcade.Sprite | null = null
  private galeSpeed = 0
  private bossSprite: Phaser.Physics.Arcade.Sprite | null = null
  private diveLine: Phaser.GameObjects.Rectangle | null = null
  private bossHits = 0
  private bossNeeded = 0
  private bossCooldown = 0
  private heronFlyY = 700
  private worldWidth = 1920
  private cranePhase: "dive" | "bow" | "done" = "dive"
  private craneDives = 0
  private han: HanFight | null = null
  private epilogueStep = 0
  private epilogueLines: string[] = []
  private health = 3
  private maxHearts = 3
  private invuln = 0
  private playerState: PlayerState = createPlayerState()
  private weather: WeatherHandle | null = null
  private lanternGlow: Phaser.GameObjects.Image | null = null
  private lanternGlowAlways = false
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
  private ride: RideState | null = null
  private exitHintAt = 0
  private waterGrace = 0
  private editorMode: EditorMode | null = null
  private pickups!: Phaser.Physics.Arcade.StaticGroup
  private glowTimer = 0
  private dashFx: PhaserDashFx | null = null
  private decorSprites: Phaser.GameObjects.Image[] = []
  private waterRects: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super("Story")
  }

  init(data?: { levelId?: string; editor?: { mode: EditorMode } }): void {
    this.levelId = data?.levelId ?? "w1_1_soft_paths"
    this.editorMode = /* storyMapEditor hook */ data?.editor && isEditorEnabled() ? data.editor.mode : null
  }

  create(): void {
    const raw = getStoryLevel(this.levelId)
    if (!raw) {
      this.scene.start("WorldMap")
      return
    }
    const def = this.editorMode ? cloneStoryLevel(raw) : raw
    this.level = def
    this.playerState = createPlayerState({
      wallBounce: !!def.wallBounce,
      glide: !!def.glide,
    })
    this.won = false
    this.lost = false
    this.paused = false
    this.checkpoint = null
    this.poolClaimed = false
    this.inDialogue = false
    this.foxHu = null
    this.galeWall = null
    this.galeSpeed = 0
    this.moonPool = null
    this.bossSprite = null
    this.diveLine = null
    this.bossHits = 0
    this.bossNeeded = 0
    this.bossCooldown = 0
    this.heronFlyY = 700
    this.worldWidth = 1920
    this.cranePhase = "dive"
    this.craneDives = 0
    this.han = null
    this.epilogueStep = 0
    this.leaving = false
    this.movers = []
    this.ride = null
    this.exitHintAt = 0
    this.waterGrace = 0
    this.glowTimer = 0
    this.physics.world.isPaused = false

    this.style = document.createElement("style")
    this.style.textContent = CSS
    document.head.appendChild(this.style)

    const shell = mountDomShell(this, shellHtml(), { keepCanvas: true, rootClass: "bm-story-hud" })
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
      itemTray: bindItemTray(shell.root),
      hanHearts: requireEl(shell.root, "[data-ui=hanHearts]"),
    }

    this.hud.levelName.textContent = t(`story.level.${def.id}.name`)
    this.hud.objective.textContent = t(`story.level.${def.id}.objective`)
    this.hud.worldLabel.textContent =
      def.epilogue || def.id.startsWith("moon")
        ? t("story.hud.moon")
        : def.world === 0
          ? t("story.hud.world0")
          : t("story.hud.world", { n: def.world })
    if (this.editorMode) {
      requireEl<HTMLButtonElement>(shell.root, "[data-ui=back]").textContent = t("editor.back")
      this.hud.quit.textContent = t("editor.back")
    }

    requireEl<HTMLButtonElement>(shell.root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.leavePlay()
    }
    const muteBtn = requireEl<HTMLButtonElement>(shell.root, "[data-ui=muteBtn]")
    const syncMute = (): void => {
      const muted = getAudio().isMuted()
      muteBtn.textContent = muted ? t("story.hud.unmute") : t("story.hud.mute")
      muteBtn.setAttribute("aria-pressed", muted ? "true" : "false")
    }
    syncMute()
    muteBtn.onclick = () => {
      const save = getSave()
      const muted = !getAudio().isMuted()
      save.settings.audio.muted = muted
      getAudio().setMuted(muted)
      if (!muted) {
        getAudio().playSfx("confirm")
      }
      syncMute()
      void persistSave()
    }
    requireEl<HTMLButtonElement>(shell.root, "[data-ui=pauseBtn]").onclick = () => this.setPaused(true)
    this.hud.resume.onclick = () => {
      getAudio().playSfx("confirm")
      this.setPaused(false)
    }
    this.hud.quit.onclick = () => {
      getAudio().playSfx("cancel")
      this.leavePlay()
    }
    this.hud.epilogueContinue.onclick = () => {
      getAudio().playSfx("confirm")
      this.advanceEpilogue()
    }
    const goMap = (event: Event): void => {
      event.preventDefault()
      event.stopPropagation()
      getAudio().playSfx("confirm")
      if (this.won) {
        this.leavePlay()
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
    this.invincible = save.settings.accessibility.invincible || this.editorMode !== null
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
          if (this.editorMode) {
            return
          }
          const next = getSave()
          if (!next.progress.story.controlHints.includes(action)) {
            next.progress.story.controlHints.push(action)
            void persistSave()
          }
        },
      },
    )

    const assembler = new ChunkAssembler()
    let world = assembler.assemble(def.chunks)
    if (isEditorEnabled()) {
      world = /* storyMapEditor hook */ applyOverlay(def, world)
    }
    this.worldWidth = world.width
    ensureStoryTextures(this)

    const look = isEditorEnabled() ? getOverlay(def.id)?.look : undefined
    const env = look?.env ?? def.env ?? storyEnvForLevel(def.world, def.index, def.id)
    getAudio().playMusic(musicIdForEnv(env))
    const palette = { ...getPalette(env) }
    if (look?.sky ?? def.sky) {
      palette.sky = look?.sky ?? def.sky ?? palette.sky
    }
    if (look?.hour) {
      palette.hour = look.hour as PaletteHour
    }
    if (look?.weather) {
      palette.weather = look.weather as WeatherPreset
    }
    this.cameras.main.setBounds(0, 0, world.width, 1080)
    applySky(this, palette)
    this.physics.world.setBounds(0, -200, world.width, 1400, true, true, true, false)
    this.playerState.baseGravity = this.physics.world.gravity.y || 1200
    if (def.lowGravity) {
      this.physics.world.gravity.y = this.playerState.baseGravity * 0.42
      this.playerState.baseGravity = this.physics.world.gravity.y
    }

    const reducedMotion = save.settings.accessibility.reducedMotion
    this.weather = createWeather(this, palette.weather, world.width, reducedMotion)
    const night = look?.night === false ? 0 : nightStrength(palette.hour)
    createNightOverlay(this, night)
    this.lanternGlowAlways = look?.lanternGlow ?? env === "lantern"
    this.lanternGlow = createLanternGlow(this)
    this.lanternGlow.setVisible(this.lanternGlowAlways)
    this.lanternGlow.setAlpha(this.lanternGlowAlways ? 0.55 : 1)

    if (nightStrength(palette.hour) <= 0) {
      this.add.rectangle(world.width / 2, 200, world.width, 220, 0xeaf3c8, 0.18).setDepth(-2)
      for (let i = 0; i < Math.ceil(world.width / 280); i += 1) {
        const cx = 140 + i * 280
        this.add.ellipse(cx, 130 + (i % 2) * 28, 120, 36, 0xf4f7e8, 0.28).setDepth(-1)
      }
    }

    this.platforms = this.physics.add.staticGroup()
    for (let i = 0; i < world.platforms.length; i += 1) {
      const rect = world.platforms[i]
      if (!rect) {
        continue
      }
      if (rect.kind === "wall") {
        const hasDecor = (world.decor ?? []).length > 0
        if (this.editorMode !== "build" && !hasDecor) {
          const tiles = Math.max(1, Math.ceil(rect.h / 56))
          for (let n = 0; n < tiles; n += 1) {
            const y = rect.y + 28 + n * 56
            if (y > rect.y + rect.h) {
              break
            }
            this.add
              .image(rect.x + rect.w / 2, Math.min(y, rect.y + rect.h - 18), "story_hedge")
              .setDisplaySize(rect.w + 14, 58)
              .setDepth(2)
          }
        }
        const block = this.add.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, 0x3f5a32, 1)
        block.setVisible(this.editorMode === "build")
        if (this.editorMode === "build") {
          block.setAlpha(0.45)
        }
        this.physics.add.existing(block, true)
        this.platforms.add(block)
        ;(block.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
        block.setData("editKind", "platform")
        block.setData("editIndex", i)
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
        block.setData("editKind", "platform")
        block.setData("editIndex", i)
        if (this.editorMode !== "build") {
          this.add
            .rectangle(rect.x + rect.w / 2, rect.y + 6, rect.w, 12, hexToNum(palette.ground))
            .setDepth(1.5)
        }
      }
    }

    this.decorSprites = []
    for (let i = 0; i < (world.decor ?? []).length; i += 1) {
      const item = world.decor[i]
      if (!item) {
        continue
      }
      this.decorSprites.push(spawnDecorItem(this, item, i))
    }

    const spawnX = def.playerSpawn.x
    const spawnY = def.playerSpawn.y
    this.checkpoint = { x: spawnX, y: spawnY }

    const playerTexture = this.textures.exists("story_player") ? "story_player" : "story_bunny"
    this.player = this.physics.add.sprite(spawnX, spawnY, playerTexture)
    this.player.setDisplaySize(48, 56)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0)
    this.player.setMaxVelocity(560, 900)
    this.player.setDepth(5)
    this.player.setData("editKind", "spawn")
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setSize(26, 38)
    playerBody.setOffset(7, 8)
    this.dashFx?.destroy()
    this.dashFx = new PhaserDashFx(this, equippedDashDef(), reducedMotion)

    this.physics.add.collider(this.player, this.platforms)

    this.movers = createMovers(this, world.movers, this.player)
    this.movers.forEach((state, index) => {
      state.sprite.setData("editKind", "mover")
      state.sprite.setData("editIndex", index)
    })

    this.waterRects = createWaterHazards(this, world.hazards, this.player, (water) => {
      this.onWater(water)
    })
    this.waterRects.forEach((water, index) => {
      water.setData("editKind", "hazard")
      water.setData("editIndex", index)
    })

    if (def.ride && def.ride.waypoints.length > 0) {
      const points = def.ride.waypoints.map((point) => assembler.worldPoint(world, point))
      const start = points[0]
      const sprite = this.physics.add.image(start.x, start.y, "story_tiger")
      sprite.setDisplaySize(def.ride.w, def.ride.h)
      sprite.setDepth(4)
      sprite.setImmovable(true)
      const rideBody = sprite.body as Phaser.Physics.Arcade.Body
      rideBody.setAllowGravity(false)
      rideBody.setGravity(0, 0)
      rideBody.setSize(sprite.frame.width, sprite.frame.height)
      rideBody.updateFromGameObject()
      this.physics.add.collider(this.player, sprite)
      this.ride = {
        sprite,
        points,
        speed: def.ride.speed,
        carrying: false,
        destIndex: points.length - 1,
      }
    }

    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()

    for (let i = 0; i < world.enemies.length; i += 1) {
      const e = world.enemies[i]
      if (!e) {
        continue
      }
      const sprite = spawnEnemy(this, e.id, e.worldX, e.worldY, this.platforms, this.enemies)
      sprite.setData("editKind", "enemy")
      sprite.setData("editIndex", i)
      if (this.editorMode === "build") {
        freezeEnemyForEditor(sprite)
      }
    }

    this.pickups = this.physics.add.staticGroup()
    const overlay = isEditorEnabled() ? getOverlay(def.id) : undefined
    const pickupList =
      overlay?.pickups ??
      world.carrots.map((carrot) => ({
        id: "carrot",
        x: carrot.x,
        y: carrot.y,
        worldX: carrot.worldX,
        worldY: carrot.worldY,
      }))
    for (let i = 0; i < pickupList.length; i += 1) {
      const item = pickupList[i]
      if (!item) {
        continue
      }
      const sprite = this.add.image(item.worldX, item.worldY, "story_carrot").setDepth(2)
      if (item.id === "mooncake") {
        sprite.setTint(0xe8c45a)
      } else if (item.id === "osmanthus_blossom") {
        sprite.setTint(0xf2d4e8)
      } else if (item.id === "lantern") {
        sprite.setTint(0xf08a3a)
      }
      this.physics.add.existing(sprite, true)
      this.pickups.add(sprite)
      sprite.setData("editKind", "pickup")
      sprite.setData("editIndex", i)
      sprite.setData("itemId", item.id)
    }
    this.physics.add.overlap(this.player, this.pickups, (_p, obj) => {
      this.collectPickup(obj as Phaser.GameObjects.Image)
    })

    if (def.moonPool && !def.noCheckpoint) {
      const pool = assembler.worldPoint(world, def.moonPool)
      this.moonPool = this.add.image(pool.x, pool.y, "story_pool").setDepth(1)
      this.moonPool.setData("editKind", "pool")
      this.physics.add.existing(this.moonPool, true)
      ;(this.moonPool.body as Phaser.Physics.Arcade.StaticBody).setSize(70, 28)
      this.physics.add.overlap(this.player, this.moonPool, () => this.onMoonPool())
    }

    const exit = assembler.worldPoint(world, def.exit)
    this.exitZone = this.add.image(exit.x, exit.y, "story_exit").setDepth(1)
    this.exitZone.setData("editKind", "exit")
    this.physics.add.existing(this.exitZone, true)
    const exitBody = this.exitZone.body as Phaser.Physics.Arcade.StaticBody
    exitBody.setSize(120, 120)
    exitBody.setOffset(-20, -20)
    exitBody.updateFromGameObject()

    this.physics.add.overlap(this.player, this.exitZone, () => {
      if (this.editorMode === "build") {
        return
      }
      void this.onExit()
    })
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      if (this.editorMode === "build") {
        return
      }
      const body = enemy as Phaser.Physics.Arcade.Sprite
      const arch = body.getData("archetype") as string
      if (arch === "heron_boss") {
        this.tryHitHeron()
        return
      }
      if (arch === "han_boss") {
        this.tryHitHan()
        return
      }
      if (arch === "crane_boss" || arch === "heron_done") {
        return
      }
      if (arch === "foxhu") {
        if (this.playerState.dashTime > 0) {
          this.tipFoxCart(body)
          return
        }
        this.hurt()
        return
      }
      if (arch === "gale") {
        this.enterDeadState(t("story.dead.gale"))
        return
      }
      if (arch === "swarm") {
        if (this.playerState.dashTime > 0) {
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
    this.physics.add.overlap(this.projectiles, this.platforms, (shot) => {
      ;(shot as Phaser.Physics.Arcade.Image).destroy()
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

    if (def.leftChase?.kind === "gale") {
      this.galeSpeed = def.leftChase.speed
      this.galeWall = this.physics.add.sprite(def.leftChase.startX, def.leftChase.y, "story_gale")
      this.galeWall.setDisplaySize(160, 1080)
      this.galeWall.setData("archetype", "gale")
      this.galeWall.setImmovable(true)
      this.galeWall.setDepth(8)
      this.galeWall.setAlpha(0.72)
      this.galeWall.setCollideWorldBounds(false)
      const galeBody = this.galeWall.body as Phaser.Physics.Arcade.Body
      galeBody.setAllowGravity(false)
      galeBody.setSize(this.galeWall.frame.width, this.galeWall.frame.height)
      galeBody.updateFromGameObject()
      this.enemies.add(this.galeWall)
    }

    if (def.boss?.kind === "heron") {
      this.bossNeeded = def.boss.hitsNeeded ?? 3
      const hx = def.boss.x ?? 700
      const hy = def.boss.y ?? 700
      this.heronFlyY = hy
      this.bossSprite = this.physics.add.sprite(hx, hy, "story_heron")
      this.bossSprite.setDisplaySize(64, 72)
      this.bossSprite.setData("archetype", "heron_boss")
      this.bossSprite.setImmovable(true)
      this.bossSprite.setDepth(6)
      const heronBody = this.bossSprite.body as Phaser.Physics.Arcade.Body
      heronBody.setAllowGravity(false)
      heronBody.setGravity(0, 0)
      heronBody.setSize(this.bossSprite.frame.width, this.bossSprite.frame.height)
      heronBody.updateFromGameObject()
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

    if (def.boss?.kind === "han") {
      this.bossNeeded = def.boss.hitsNeeded ?? 5
      this.han = new HanFight(
        this,
        def.boss.x ?? 1620,
        def.boss.y ?? 380,
        this.player,
        this.projectiles,
        this.worldWidth,
      )
      this.enemies.add(this.han.sprite)
      this.hud.bossHits.hidden = true
      this.hud.hanHearts.hidden = false
      this.syncBossHits()
      getAudio().playMusic("boss")
    }

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setDeadzone(90, 60)
    this.cameras.main.setZoom(1)
    if (this.editorMode) {
      if (this.editorMode === "build") {
        this.cameras.main.stopFollow()
        this.cameras.main.setZoom(1)
        this.cameras.main.centerOn(spawnX, spawnY)
        const body = this.player.body as Phaser.Physics.Arcade.Body
        body.setAllowGravity(false)
        this.player.setImmovable(true)
        this.player.setVelocity(0, 0)
      }
      mountBuildHud({
        scene: this,
        level: this.level,
        world,
        player: this.player,
        moonPool: this.moonPool,
        exitZone: this.exitZone,
        platforms: this.platforms,
        movers: this.movers,
        enemies: this.enemies,
        pickups: this.pickups,
        decor: this.decorSprites,
        waters: this.waterRects,
        env,
        mode: this.editorMode,
      })
    }
    attachPlayfieldFrame(this, () =>
      measureChromeInsets({
        topSelectors: [".bm-story-hud .meadow-header", ".bm-story-hud .meadow-bar"],
        bottomSelectors: [".bm-editor-dock"],
        padTop: 10,
        padBottom: 12,
        side: 20,
      }),
    )
    this.syncHearts()
    ;(window as unknown as { __bmStory?: () => Record<string, number | boolean | string> }).__bmStory = () => ({
      x: this.player?.x ?? 0,
      y: this.player?.y ?? 0,
      paused: !!this.physics.world?.isPaused,
      won: this.won,
      lost: this.lost,
      health: this.health,
      hanHearts: this.han?.hearts ?? -1,
      hanX: this.han?.sprite.x ?? -1,
      hanY: this.han?.sprite.y ?? -1,
      hanTex: this.han?.sprite.texture.key ?? "",
      warmth: this.han?.warmth ?? 0,
      cakeX: this.han?.cakePos()?.x ?? -1,
      cakeY: this.han?.cakePos()?.y ?? -1,
      settled: this.han?.settled ? 1 : 0,
      inDialogue: this.inDialogue ? 1 : 0,
      objective: this.hud.objective.textContent ?? "",
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      getAudio().stopMusic()
      delete (window as unknown as { __bmStory?: unknown }).__bmStory
      this.cleanupInput()
      this.dashFx?.destroy()
      this.dashFx = null
      this.style?.remove()
      this.style = null
    })
  }

  private collectPickup(sprite: Phaser.GameObjects.Image): void {
    if (this.editorMode === "build" || !sprite.active) {
      return
    }
    const id = String(sprite.getData("itemId") || "carrot")
    sprite.destroy()
    getAudio().playSfx("pickup")
    if (id === "mooncake") {
      this.health = Math.min(this.maxHearts, this.health + 1)
      this.syncHearts()
      return
    }
    if (id === "osmanthus_blossom") {
      this.playerState.glideCharges += 1
      return
    }
    if (id === "lantern") {
      this.glowTimer = 1.6
      this.lanternGlow?.setVisible(true)
      return
    }
    if (this.editorMode) {
      return
    }
    const save = getSave()
    addPantryCarrots(save, 1)
    void persistSave()
  }

  private leavePlay(): void {
    if (this.editorMode) {
      this.leaveToSettings()
      return
    }
    this.leaveToWorldMap()
  }

  private leaveToSettings(): void {
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
    this.scene.start("Settings")
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

  private nearestRidePathPoint(x: number, y: number): { x: number; y: number } {
    if (!this.ride || this.ride.points.length === 0) {
      return { x, y }
    }
    if (this.ride.points.length === 1) {
      return { ...this.ride.points[0] }
    }
    let best = { x: this.ride.points[0].x, y: this.ride.points[0].y }
    let bestDist = Number.POSITIVE_INFINITY
    for (let i = 0; i < this.ride.points.length - 1; i += 1) {
      const a = this.ride.points[i]
      const b = this.ride.points[i + 1]
      const abx = b.x - a.x
      const aby = b.y - a.y
      const len2 = abx * abx + aby * aby || 1
      const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (y - a.y) * aby) / len2))
      const px = a.x + abx * t
      const py = a.y + aby * t
      const dist = Math.hypot(px - x, py - y)
      if (dist < bestDist) {
        bestDist = dist
        best = { x: px, y: py }
      }
    }
    return best
  }

  private playerOnTiger(): boolean {
    if (!this.ride) {
      return false
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (!(body.blocked.down || body.touching.down)) {
      return false
    }
    return (
      Math.abs(this.player.x - this.ride.sprite.x) < this.ride.sprite.displayWidth * 0.58 &&
      Math.abs(this.player.y - (this.ride.sprite.y - this.ride.sprite.displayHeight * 0.45)) < 52
    )
  }

  private updateTigerRide(dt: number): void {
    if (!this.ride) {
      return
    }
    const onRide = this.playerOnTiger()
    if (onRide && !this.ride.carrying) {
      this.ride.carrying = true
      const first = this.ride.points[0]
      const last = this.ride.points[this.ride.points.length - 1]
      const midX = (first.x + last.x) / 2
      this.ride.destIndex = this.player.x < midX ? this.ride.points.length - 1 : 0
    }
    if (!onRide) {
      this.ride.carrying = false
    }

    const target = this.ride.carrying
      ? this.ride.points[this.ride.destIndex]
      : this.nearestRidePathPoint(this.player.x, this.player.y - 40)
    const dx = target.x - this.ride.sprite.x
    const dy = target.y - this.ride.sprite.y
    const dist = Math.hypot(dx, dy) || 1
    const speed = this.ride.carrying ? this.ride.speed : this.ride.speed * 1.25
    const step = Math.min(speed * dt, dist)
    const mx = (dx / dist) * step
    const my = (dy / dist) * step
    if (dist > 3) {
      this.ride.sprite.x += mx
      this.ride.sprite.y += my
      this.ride.sprite.setFlipX(mx < 0)
    }
    ;(this.ride.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
    if (onRide && dist > 3) {
      this.player.x += mx
      this.player.y += my
    }
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

  private hurt(opts?: { ignoreDash?: boolean }): void {
    if (this.invuln > 0 || this.invincible || this.won || this.lost) {
      return
    }
    if (!opts?.ignoreDash && this.playerState.dashTime > 0) {
      return
    }
    this.health -= 1
    this.invuln = 1.2
    this.syncHearts()
    this.player.setTint(0xffcccc)
    this.time.delayedCall(200, () => this.player.clearTint())
    getAudio().playSfx("hurt")
    getAudio().playSfx("heart")
    if (this.health <= 0) {
      this.enterDeadState(this.restartCopy("hearts"))
    }
  }

  private restartCopy(kind: "hearts" | "fall" | "water"): string {
    if (this.level.noCheckpoint) {
      return t("story.dead.cloud")
    }
    const fromPool =
      !!this.checkpoint &&
      (this.checkpoint.x !== this.level.playerSpawn.x ||
        this.checkpoint.y !== this.level.playerSpawn.y)
    if (kind === "fall") {
      return fromPool ? t("story.dead.fallPool") : t("story.dead.fallStart")
    }
    if (kind === "water") {
      return fromPool ? t("story.dead.waterPool") : t("story.dead.waterStart")
    }
    return fromPool ? t("story.dead.pool") : t("story.dead.start")
  }

  private enterDeadState(message: string): void {
    if (this.editorMode === "build") {
      return
    }
    if (this.editorMode === "play") {
      this.respawn()
      return
    }
    if (this.lost || this.won) {
      return
    }
    this.lost = true
    this.player.setVelocity(0, 0)
    this.hud.title.textContent = t("story.dead.title")
    this.hud.message.textContent = message
    this.hud.play.textContent = t("story.dead.retry")
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
    if (this.editorMode) {
      return
    }
    if (!this.moonPool || this.level.noCheckpoint) {
      return
    }
    if (this.won || this.lost || this.poolClaimed || this.inDialogue) {
      return
    }
    this.poolClaimed = true
    this.inDialogue = true
    this.checkpoint = { x: this.moonPool.x, y: this.moonPool.y - 40 }
    this.player.setVelocity(0, 0)
    this.physics.world.isPaused = true
    this.scene.launch("DialogueOverlay", {
      lines: [t(`story.level.${this.level.id}.moon`)],
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
    const belowSurface = applyWaterPhysics(this.player, water)
    if (belowSurface) {
      this.waterGrace += 0.016
      if (this.waterGrace > 0.35) {
        this.waterGrace = 0
        this.enterDeadState(this.restartCopy("water"))
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
      this.hud.hanHearts.hidden = true
      return
    }
    if (this.level.boss.kind === "han" && this.han) {
      this.hud.bossHits.hidden = true
      this.hud.hanHearts.hidden = false
      const full = this.han.hearts
      const empty = Math.max(0, this.han.needed - this.han.hearts)
      this.hud.hanHearts.textContent = `${"♥".repeat(full)}${"♡".repeat(empty)}`
      this.hud.hanHearts.setAttribute("aria-label", t("story.boss.han", {
        hearts: this.han.hearts,
        need: this.han.needed,
      }))
      return
    }
    if (this.level.boss.kind === "gale") {
      this.hud.bossHits.hidden = true
      this.hud.hanHearts.hidden = true
      return
    }
    this.hud.hanHearts.hidden = true
    this.hud.bossHits.hidden = false
    if (this.level.boss.kind === "heron") {
      this.hud.bossHits.textContent = t("story.boss.heron", {
        hits: this.bossHits,
        need: this.bossNeeded,
      })
      return
    }
    if (this.level.boss.kind === "crane") {
      this.hud.bossHits.textContent =
        this.cranePhase === "bow" || this.cranePhase === "done"
          ? t("story.boss.craneBow")
          : t("story.boss.dives", { hits: this.craneDives, need: this.bossNeeded })
      return
    }
  }

  private tryHitHeron(): void {
    if (!this.bossSprite || this.won) {
      return
    }
    if (this.bossSprite.getData("archetype") === "heron_done") {
      return
    }
    if (this.playerState.dashTime <= 0) {
      if (this.bossCooldown <= 0) {
        this.bossCooldown = 0.85
        this.hurt()
      }
      return
    }
    if (this.bossCooldown > 0) {
      return
    }
    this.bossHits += 1
    this.bossCooldown = 0.55
    this.bossSprite.setTint(0xffffff)
    this.time.delayedCall(120, () => this.bossSprite?.clearTint())
    this.syncBossHits()
    if (this.bossHits >= this.bossNeeded) {
      this.bossSprite.setAlpha(0.45)
      this.bossSprite.setData("archetype", "heron_done")
      this.bossSprite.setVelocity(0, 0)
      this.hud.objective.textContent = t("story.exit.open")
    }
  }

  private tryHitHan(): void {
    if (!this.han || this.won) {
      return
    }
    const result = this.han.tryDashHit(this.playerState.dashTime)
    if (result === "hurt") {
      this.hurt({ ignoreDash: true })
      return
    }
    if (result === "hit") {
      this.syncBossHits()
      if (this.han.settled) {
        this.hud.objective.textContent = t("story.exit.open")
        getAudio().playMusic("moon")
      }
    }
  }

  private syncItemTray(): void {
    const buffs: TrayBuff[] = []
    if (this.han && this.han.warmth > 0) {
      buffs.push({ id: "mooncake", remaining: this.han.warmth, duration: HAN_WARMTH })
    }
    renderItemTray(this.hud.itemTray, buffs)
  }

  private updateBoss(dt: number): void {
    this.bossCooldown = Math.max(0, this.bossCooldown - dt)
    if (this.han && this.level.boss?.kind === "han") {
      this.han.update(dt)
      if (
        this.playerState.dashTime > 0 &&
        Math.abs(this.player.x - this.han.sprite.x) < 110 &&
        Math.abs(this.player.y - this.han.sprite.y) < 150
      ) {
        this.tryHitHan()
      }
      return
    }
    if (!this.bossSprite || !this.level.boss) {
      return
    }
    if (this.level.boss.kind === "heron") {
      const body = this.bossSprite.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      body.setGravity(0, 0)
      if (this.bossSprite.getData("archetype") === "heron_done") {
        this.bossSprite.setVelocity(0, 0)
        return
      }
      const bob = Math.sin(this.time.now / 380) * 36
      const targetY = this.heronFlyY + bob
      const dx = this.player.x - this.bossSprite.x
      const dy = targetY - this.bossSprite.y
      const chaseX = Math.abs(dx) > 20 ? Math.sign(dx) * 140 : 0
      const chaseY = Math.abs(dy) > 8 ? Math.sign(dy) * 55 : 0
      this.bossSprite.setVelocity(chaseX, chaseY)
      this.bossSprite.x = Phaser.Math.Clamp(this.bossSprite.x, 80, this.worldWidth - 80)
      this.bossSprite.y = Phaser.Math.Clamp(this.bossSprite.y, 520, 920)
      body.updateFromGameObject()
      if (
        this.playerState.dashTime > 0 &&
        this.bossCooldown <= 0 &&
        Math.abs(this.player.x - this.bossSprite.x) < 90 &&
        Math.abs(this.player.y - this.bossSprite.y) < 100
      ) {
        this.tryHitHeron()
      }
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
        if (Math.abs(this.bossSprite.x - this.player.x) < 55 && this.playerState.dashTime <= 0) {
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
            lines: [t("story.crane.line0"), t("story.crane.line1")],
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
      t("story.epilogue.0"),
      t("story.epilogue.1"),
      t("story.epilogue.2"),
      t("story.epilogue.3"),
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

  private exitBlockedReason(): string | null {
    if (this.level.foxHu && this.foxHu && this.foxHu.x < this.exitZone.x - 40) {
      return t("story.exit.fox")
    }
    if (this.level.boss?.kind === "heron" && this.bossHits < this.bossNeeded) {
      return t("story.exit.heron", { hits: this.bossHits, need: this.bossNeeded })
    }
    if (this.level.boss?.kind === "crane" && this.cranePhase === "dive") {
      return t("story.exit.crane")
    }
    if (this.level.boss?.kind === "han" && this.han && !this.han.settled) {
      return t("story.exit.han")
    }
    return null
  }

  private async onExit(): Promise<void> {
    if (this.won || this.lost || this.leaving) {
      return
    }
    const blocked = this.exitBlockedReason()
    if (blocked) {
      const now = this.time.now
      if (now - this.exitHintAt > 1600) {
        this.exitHintAt = now
        this.hud.objective.textContent = blocked
      }
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

    if (/* storyMapEditor hook */ this.editorMode) {
      this.hud.title.textContent = t("editor.done.title")
      this.hud.message.textContent = t("editor.done.body")
      this.hud.play.textContent = t("editor.back")
      this.hud.overlay.hidden = false
      this.hud.overlay.style.display = "flex"
      this.hud.play.focus()
      return
    }

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
      if (this.level.id === "w4_3_closing_gale") {
        await unlock("WORLD4_CLEAR")
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

    this.hud.title.textContent = t("story.win.title")
    this.hud.message.textContent =
      this.level.id === "w0_controls"
        ? t("story.win.w0")
        : this.level.id === "w1_3_cart_chase"
          ? t("story.win.w1")
          : this.level.id === "w2_3_raft_gauntlet"
            ? t("story.win.w2")
            : this.level.id === "w3_3_crane_summit"
              ? t("story.win.w3")
              : this.level.id === "w4_3_closing_gale"
                ? t("story.win.w4")
                : t("story.win.generic", { name: t(`story.level.${this.level.id}.name`) })
    this.hud.play.textContent = t("story.win.map")
    this.hud.overlay.hidden = false
    this.hud.overlay.style.display = "flex"
    this.hud.play.focus()
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.won || this.lost || this.inDialogue || !this.player?.body) {
      return
    }
    const dt = delta / 1000
    if (this.editorMode === "build") {
      this.player.setVelocity(0, 0)
      this.weather?.update(dt, this.cameras.main.scrollX)
      return
    }
    this.invuln = Math.max(0, this.invuln - dt)
    tickPlayerTimers(this.playerState, dt)
    this.waterGrace = Math.max(0, this.waterGrace - dt * 0.5)
    this.updateBoss(dt)
    this.syncItemTray()
    this.han?.tryEatCake()

    updateMovers(this.movers, this.player, dt)

    if (this.galeWall) {
      this.galeWall.setVelocityX(this.galeSpeed)
      if (this.player.x <= this.galeWall.x + this.galeWall.displayWidth * 0.42) {
        this.enterDeadState(t("story.dead.gale"))
        return
      }
    }

    if (this.ride) {
      this.updateTigerRide(dt)
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
      Math.abs(this.player.x - this.exitZone.x) < 120 &&
      Math.abs(this.player.y - this.exitZone.y) < 140
    ) {
      void this.onExit()
      if (this.won) {
        return
      }
    }

    if (this.player.y > 1120) {
      this.enterDeadState(this.restartCopy("fall"))
      return
    }

    updatePlayerMovement(this.player, input, this.playerState)
    this.dashFx?.tick(this.player, this.playerState.dashTime, this.playerState.facing, dt)

    updateEnemies(this, this.enemies, this.projectiles, this.platforms, this.player, dt)

    this.weather?.update(dt, this.cameras.main.scrollX)
    if (this.glowTimer > 0) {
      this.glowTimer = Math.max(0, this.glowTimer - dt)
      if (this.glowTimer <= 0 && this.lanternGlow && !this.lanternGlowAlways) {
        this.lanternGlow.setVisible(false)
      }
    }
    if (this.lanternGlow && (this.lanternGlowAlways || this.lanternGlow.visible || this.glowTimer > 0)) {
      this.lanternGlow.setPosition(this.player.x, this.player.y)
    }
  }
}
