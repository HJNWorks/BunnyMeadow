import Phaser from "phaser"
import { getDifficulty } from "../../core/difficulty"
import { getAudio, musicIdForEnv } from "../../core/audio"
import { getInput } from "../../core/input"
import { t } from "../../core/i18n"
import { getSave, persistSave } from "../../core/session"
import { addPantryCarrots } from "../../core/unlocks"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { attachPlayfieldFrame, measureChromeInsets } from "../../ui/playfieldFrame"
import { ensureStoryTextures } from "../story/shared/storyTextures"
import { createPlayerState, tickPlayerTimers, type PlayerState } from "../story/shared/playerController"
import { BreakField } from "../story/shared/breakables"
import {
  applySky,
  createNightOverlay,
  createWeather,
  getPalette,
  hexToNum,
  nightStrength,
  type Palette,
  type WeatherHandle,
} from "../story/shared/themeKit"
import { spawnJumpPerch, stompOrSide, updateJumpMobs, type JumpMob } from "./jumpKit"
import {
  bandAt,
  BOOST_VY,
  BOUNCE_VY,
  JUMP_WIDTH,
  metersFromY,
  moonDiscMeters,
  mulberry32,
  PAD_GAP,
  planPad,
  PX_PER_METER,
  type JumpBandId,
  type JumpPadAnchor,
  type JumpPadPlan,
} from "./jumpWorld"
import { TaskRunner } from "./TaskRunner"

type PadSprite = Phaser.GameObjects.Image

const HUD_CSS = `
.bm-root.bm-jump-hud {
  background: transparent;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}
.bm-jump-hud .jump-hud {
  max-width: none;
  padding: 12px 20px 0;
  pointer-events: none;
  font: 16px Georgia, serif;
  color: #304c39;
}
.bm-jump-hud .jump-bar {
  pointer-events: auto;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  background: linear-gradient(180deg, #f7f3e8f0, #ebe4d4e6);
  backdrop-filter: blur(6px);
  border-radius: 14px;
  padding: 8px 14px;
  border: 1px solid #d5dcc4;
  box-shadow: 0 8px 18px #2a3d2412;
}
.bm-jump-hud .jump-bar strong { font-size: 18px; }
.bm-jump-hud .jump-bar .bm-btn { pointer-events: auto; margin-left: 0; }
.bm-jump-hud .jump-bar .bm-btn.ghost { margin-left: auto; }
.bm-jump-hud .jump-overlay {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #34563855;
  z-index: 60;
}
.bm-jump-hud .jump-overlay[hidden] { display: none; }
.bm-jump-hud .jump-card {
  max-width: 420px;
  margin: 16px;
  text-align: center;
  background: #fffaf0;
  color: #3d4934;
  padding: 28px;
  border-radius: 24px;
}
.bm-jump-hud .jump-card h2 { font: 32px Georgia; margin: 0 0 12px; }
.bm-jump-hud .jump-card p { line-height: 1.55; color: #71816e; }
.bm-jump-hud .jump-card .jump-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.bm-jump-hud .jump-note {
  margin: 10px auto 0;
  width: max-content;
  background: #fffaf0ee;
  color: #34583e;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 14px;
  pointer-events: none;
}
.bm-jump-hud .jump-note[hidden] { display: none; }
`

export class BunnyJumpScene extends Phaser.Scene {
  private pads!: Phaser.Physics.Arcade.StaticGroup
  private player!: Phaser.Physics.Arcade.Sprite
  private state!: PlayerState
  private rng!: () => number
  private originY = 920
  private nextPadY = 760
  private camY = 0
  private hearts = 3
  private invuln = 0
  private ended = false
  private pausedPlay = false
  private discClaimed = false
  private peak = 0
  private discMeters = 80
  private pantryReward = 10
  private band: JumpBandId = "meadow"
  private skyFill: Phaser.GameObjects.Rectangle | null = null
  private night: Phaser.GameObjects.Rectangle | null = null
  private weather: WeatherHandle | null = null
  private breaks: BreakField | null = null
  private mobs: JumpMob[] = []
  private slides: { sprite: PadSprite; baseX: number; amp: number; speed: number; t: number }[] = []
  private disc: Phaser.GameObjects.Arc | null = null
  private lastPad: JumpPadAnchor = { x: JUMP_WIDTH * 0.5, w: 520, kind: "solid" }
  private hudEls!: {
    hearts: HTMLElement
    height: HTMLElement
    best: HTMLElement
    dash: HTMLElement
    overlay: HTMLElement
    title: HTMLElement
    message: HTMLElement
    note: HTMLElement
    pausePanel: HTMLElement
  }

  constructor() {
    super("BunnyJump")
  }

  create(): void {
    const save = getSave()
    const difficulty = getDifficulty(save)
    const started = new TaskRunner().start("bunny_jump")
    this.pantryReward = started.ok ? started.task.pantryReward : 10
    this.hearts = difficulty.hearts
    this.discMeters = moonDiscMeters(difficulty)
    this.rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)
    this.ended = false
    this.pausedPlay = false
    this.discClaimed = false
    this.peak = 0
    this.mobs = []
    this.slides = []
    this.band = "meadow"
    this.lastPad = { x: JUMP_WIDTH * 0.5, w: 520, kind: "solid" }

    getInput().start()
    getAudio().playMusic("meadow")
    ensureStoryTextures(this)
    const reduced = save.settings.accessibility.reducedMotion
    this.breaks = new BreakField(this, reduced)

    const palette = getPalette("meadow")
    this.skyFill = applySky(this, palette, "meadow")
    this.night = createNightOverlay(this, nightStrength(palette.hour))
    this.weather = createWeather(this, palette.weather, JUMP_WIDTH, reduced)

    this.pads = this.physics.add.staticGroup()
    this.originY = 920
    this.nextPadY = 760
    this.camY = this.originY - 640
    this.cameras.main.setScroll(0, this.camY)
    this.cameras.main.setBackgroundColor(palette.sky)

    this.player = this.physics.add.sprite(JUMP_WIDTH * 0.5, this.originY - 70, "story_player")
    this.player.setDisplaySize(56, 64)
    this.player.setDepth(8)
    this.player.setCollideWorldBounds(false)
    const pbody = this.player.body as Phaser.Physics.Arcade.Body
    pbody.setSize(36, 48)
    pbody.setOffset(14, 16)
    pbody.setGravityY(0)
    this.state = createPlayerState({ airJumps: 0, maxAirJumps: 0, baseGravity: 1400 })

    this.spawnFloor()
    this.fillAhead()
    this.placeDisc()

    this.physics.add.collider(
      this.player,
      this.pads,
      (_player, pad) => this.onLand(pad as PadSprite),
      (_player, pad) => this.canLand(pad as PadSprite),
    )

    this.mountHud()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown())
  }

  update(_time: number, delta: number): void {
    if (this.ended) {
      return
    }
    const dt = Math.min(0.05, delta / 1000)
    const input = getInput().snapshot()
    if (input.pausePressed || input.cancelPressed) {
      if (this.pausedPlay) {
        this.setPaused(false)
      } else {
        this.setPaused(true)
      }
      return
    }
    if (this.pausedPlay) {
      return
    }

    tickPlayerTimers(this.state, dt)
    this.invuln = Math.max(0, this.invuln - dt)
    this.moveMei(input, dt)
    this.tickSlides(dt)
    updateJumpMobs(this.mobs, dt)
    this.tickMobs()
    this.wrapX()
    this.followCam()
    this.fillAhead()
    this.cullBelow()
    this.tickDisc()
    this.tickFall()
    this.paintHud()
    this.weather?.update(dt, 0)
    this.breaks?.follow()
  }

  private moveMei(input: { moveX: number; dashPressed: boolean }, dt: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (input.moveX) {
      this.state.facing = input.moveX > 0 ? 1 : -1
    }
    const slick = this.player.getData("slick") === true
    const speed = this.state.dashTime > 0 ? 560 : 280
    const want = input.moveX * speed
    const grip = slick ? 0.12 : 0.45
    body.velocity.x += (want - body.velocity.x) * Math.min(1, grip + dt * 4)
    if (input.dashPressed && this.state.dashCooldown <= 0) {
      this.state.dashTime = 0.14
      this.state.dashCooldown = getDifficulty(getSave()).dashCooldown * 0.7
      body.velocity.x = this.state.facing * 560
      getAudio().playSfx("dash")
    }
    if (this.state.dashTime > 0) {
      body.velocity.x = this.state.facing * 560
    }
    this.player.setFlipX(this.state.facing < 0)
  }

  private canLand(pad: PadSprite): boolean {
    if (!pad.active || pad.getData("broken") === true) {
      return false
    }
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    const bb = pad.body as Phaser.Physics.Arcade.StaticBody
    if (!pb || !bb) {
      return false
    }
    if (pb.velocity.y <= 60) {
      return false
    }
    return pb.bottom <= bb.top + 20
  }

  private onLand(pad: PadSprite): void {
    const surface = pad.getData("surface") as string
    const boost = surface === "boost"
    this.player.setVelocityY(boost ? BOOST_VY : BOUNCE_VY)
    this.player.setData("slick", surface === "slick")
    getAudio().playSfx("jump")
    const kind = pad.getData("kind") as string
    if ((kind === "crumble" || kind === "ice") && this.breaks) {
      this.breaks.hurt(pad, 1, "land")
    }
  }

  private wrapX(): void {
    if (this.player.x < -24) {
      this.player.x += JUMP_WIDTH
    } else if (this.player.x > JUMP_WIDTH + 24) {
      this.player.x -= JUMP_WIDTH
    }
  }

  private followCam(): void {
    const want = this.player.y - 560
    if (want < this.camY) {
      this.camY = want
      this.cameras.main.setScroll(0, this.camY)
    }
  }

  private tickFall(): void {
    if (this.player.y > this.camY + 1080 + 48) {
      this.fail()
    }
  }

  private fillAhead(): void {
    while (this.nextPadY > this.camY - 980) {
      const plan = planPad(this.rng, this.nextPadY, this.originY, getDifficulty(getSave()), this.lastPad)
      this.spawnPad(plan)
      this.lastPad = {
        x: plan.x,
        w: plan.w,
        kind: plan.kind,
        slideAmp: plan.slideAmp,
      }
      this.nextPadY -= PAD_GAP
    }
    this.syncBand()
  }

  private spawnFloor(): void {
    const plan: JumpPadPlan = {
      x: JUMP_WIDTH * 0.5,
      y: this.originY,
      w: 520,
      h: 28,
      kind: "solid",
      env: "meadow",
      stamp: "story_ground",
      surface: "bounce",
    }
    this.spawnPad(plan)
    this.lastPad = { x: plan.x, w: plan.w, kind: plan.kind }
  }

  private spawnPad(plan: JumpPadPlan): void {
    const sprite = this.add.image(plan.x, plan.y, plan.stamp) as PadSprite
    sprite.setDisplaySize(plan.w, plan.h)
    sprite.setDepth(3)
    this.physics.add.existing(sprite, true)
    this.pads.add(sprite)
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody
    body.updateFromGameObject()
    body.checkCollision.down = false
    body.checkCollision.left = false
    body.checkCollision.right = false
    sprite.setData("kind", plan.kind)
    sprite.setData("surface", plan.surface)
    sprite.setData("env", plan.env)
    if (plan.kind === "ice") {
      sprite.setTint(0xb8d8e8)
    }
    if (plan.kind === "boost") {
      sprite.setTint(0xe07040)
    }
    if (plan.kind === "crumble" || plan.kind === "ice") {
      this.breaks?.register(sprite, {
        profile: plan.kind === "ice" ? "ice" : "wood",
        hp: 1,
        sources: ["land"],
      })
    }
    if (plan.kind === "slide" && plan.slideAmp && plan.slideSpeed) {
      this.slides.push({
        sprite,
        baseX: plan.x,
        amp: plan.slideAmp,
        speed: plan.slideSpeed,
        t: this.rng() * Math.PI * 2,
      })
    }
    if (plan.perch) {
      this.mobs.push(spawnJumpPerch(this, sprite, plan.perch))
    }
  }

  private tickSlides(dt: number): void {
    for (const slide of this.slides) {
      if (!slide.sprite.active) {
        continue
      }
      slide.t += dt * slide.speed
      const prev = slide.sprite.x
      slide.sprite.x = slide.baseX + Math.sin(slide.t) * slide.amp
      const body = slide.sprite.body as Phaser.Physics.Arcade.StaticBody
      body.updateFromGameObject()
      const pb = this.player.body as Phaser.Physics.Arcade.Body
      if (pb.touching.down && Math.abs(this.player.y - slide.sprite.y) < 48) {
        this.player.x += slide.sprite.x - prev
      }
    }
  }

  private tickMobs(): void {
    const save = getSave()
    const invincible = save.settings.accessibility.invincible
    const keep: JumpMob[] = []
    for (const mob of this.mobs) {
      if (!mob.sprite.active || !mob.pad.active || mob.pad.getData("broken") === true) {
        mob.sprite.destroy()
        continue
      }
      if (mob.pad.y > this.camY + 1200) {
        mob.sprite.destroy()
        continue
      }
      const hit = stompOrSide(this.player, mob)
      if (hit === "stomp") {
        mob.sprite.destroy()
        this.player.setVelocityY(BOUNCE_VY)
        getAudio().playSfx("jump")
        continue
      }
      if (hit === "side" && this.invuln <= 0 && !invincible) {
        this.hurt()
      }
      keep.push(mob)
    }
    this.mobs = keep
  }

  private hurt(): void {
    this.hearts -= 1
    this.invuln = getDifficulty(getSave()).invulnerabilityWindow
    getAudio().playSfx("hurt")
    this.player.setTint(0xf0a0a0)
    this.time.delayedCall(180, () => this.player.clearTint())
    if (this.hearts <= 0) {
      this.fail()
    }
  }

  private placeDisc(): void {
    const y = this.originY - this.discMeters * PX_PER_METER
    this.disc = this.add.circle(JUMP_WIDTH * 0.5, y, 54, 0xf4e8b0, 0.95)
    this.disc.setStrokeStyle(6, 0xd8c070)
    this.disc.setDepth(4)
  }

  private tickDisc(): void {
    if (!this.disc || this.discClaimed) {
      return
    }
    const dx = this.player.x - this.disc.x
    const dy = this.player.y - this.disc.y
    if (dx * dx + dy * dy < 70 * 70) {
      this.discClaimed = true
      this.disc.setFillStyle(0xfff8d0, 1)
      getAudio().playSfx("pickup")
      void this.recordClear()
      this.hudEls.note.hidden = false
      this.hudEls.note.textContent = t("task.bunny_jump.disc")
      this.time.delayedCall(2400, () => {
        this.hudEls.note.hidden = true
      })
    }
  }

  private cullBelow(): void {
    for (const child of this.pads.getChildren()) {
      const pad = child as PadSprite
      if (pad.y > this.camY + 1300) {
        pad.destroy()
      }
    }
  }

  private syncBand(): void {
    const meters = metersFromY(this.originY, this.player.y)
    this.peak = Math.max(this.peak, meters)
    const env = bandAt(meters)
    if (env === this.band) {
      return
    }
    this.band = env
    const palette = getPalette(env)
    this.applyPalette(palette, env)
    getAudio().playMusic(musicIdForEnv(env))
  }

  private applyPalette(palette: Palette, env: string): void {
    this.cameras.main.setBackgroundColor(palette.sky)
    this.skyFill?.setFillStyle(hexToNum(palette.far), 0.55)
    this.night?.setFillStyle(0x1a1428, nightStrength(palette.hour))
    this.night?.setVisible(nightStrength(palette.hour) > 0)
    this.weather?.destroy()
    this.weather = createWeather(
      this,
      palette.weather,
      JUMP_WIDTH,
      getSave().settings.accessibility.reducedMotion,
    )
    void env
  }

  private async recordClear(): Promise<void> {
    const save = getSave()
    if (!save.progress.tasksCompleted.includes("bunny_jump")) {
      save.progress.tasksCompleted.push("bunny_jump")
      addPantryCarrots(save, this.pantryReward)
    }
    await this.persistBest()
  }

  private async persistBest(): Promise<void> {
    const save = getSave()
    const rounded = Math.floor(this.peak)
    if (rounded > save.progress.bunnyJumpBest) {
      save.progress.bunnyJumpBest = rounded
    }
    await persistSave()
  }

  private fail(): void {
    if (this.ended) {
      return
    }
    this.ended = true
    this.physics.pause()
    void this.persistBest()
    this.hudEls.overlay.hidden = false
    this.hudEls.title.textContent = t("task.bunny_jump.lost.title")
    this.hudEls.message.textContent = t("task.bunny_jump.lost.body", {
      name: getSave().player.name,
      n: String(Math.floor(this.peak)),
    })
    requireEl<HTMLButtonElement>(this.hudEls.overlay, "[data-ui=play]").textContent = t("meadow.lost.retry")
  }

  private setPaused(on: boolean): void {
    this.pausedPlay = on
    if (on) {
      this.physics.pause()
      this.hudEls.pausePanel.hidden = false
    } else {
      this.physics.resume()
      this.hudEls.pausePanel.hidden = true
    }
  }

  private paintHud(): void {
    const save = getSave()
    this.hudEls.hearts.textContent = "♥ ".repeat(Math.max(0, this.hearts)).trim() || "—"
    this.hudEls.height.textContent = `${Math.floor(this.peak)} m`
    this.hudEls.best.textContent = `${Math.floor(Math.max(this.peak, save.progress.bunnyJumpBest))} m`
    this.hudEls.dash.textContent =
      this.state.dashCooldown <= 0 ? t("common.ready") : t("common.wait")
  }

  private mountHud(): void {
    const save = getSave()
    const { root } = mountDomShell(
      this,
      `
      <div class="jump-hud">
        <div class="jump-bar">
          <span>${t("hud.hearts")} <strong data-ui="hearts"></strong></span>
          <span>${t("hud.distance")} <strong data-ui="height">0 m</strong></span>
          <span>${t("hud.best")} <strong data-ui="best">${save.progress.bunnyJumpBest} m</strong></span>
          <span>${t("hud.dash")} <strong data-ui="dash">${t("common.ready")}</strong></span>
          <button type="button" class="bm-btn" data-ui="pause">${t("common.pause")}</button>
          <button type="button" class="bm-btn ghost" data-ui="back">${t("task.run.back")}</button>
        </div>
        <div class="jump-note" data-ui="note" hidden></div>
        <div class="jump-overlay" data-ui="overlay" hidden>
          <div class="jump-card">
            <h2 data-ui="title"></h2>
            <p data-ui="message"></p>
            <div class="jump-actions">
              <button type="button" class="bm-btn warm" data-ui="play">${t("meadow.lost.retry")}</button>
              <button type="button" class="bm-btn ghost" data-ui="toSelect">${t("task.run.toSelect")}</button>
            </div>
          </div>
        </div>
        <div class="jump-overlay" data-ui="pausePanel" hidden>
          <div class="jump-card">
            <h2>${t("common.pause")}</h2>
            <p>${t("task.run.pauseBody")}</p>
            <div class="jump-actions">
              <button type="button" class="bm-btn warm" data-ui="resume">${t("common.resume")}</button>
              <button type="button" class="bm-btn" data-ui="openSettings">${t("common.settings")}</button>
              <button type="button" class="bm-btn ghost" data-ui="quitSelect">${t("task.run.quit")}</button>
            </div>
          </div>
        </div>
      </div>
      <style>${HUD_CSS}</style>
      `,
      { keepCanvas: true, rootClass: "bm-jump-hud" },
    )
    attachPlayfieldFrame(this, () =>
      measureChromeInsets({
        topSelectors: [".bm-jump-hud .jump-bar"],
        bottomSelectors: [],
        padTop: 10,
        padBottom: 16,
        side: 20,
      }),
    )
    this.hudEls = {
      hearts: requireEl(root, "[data-ui=hearts]"),
      height: requireEl(root, "[data-ui=height]"),
      best: requireEl(root, "[data-ui=best]"),
      dash: requireEl(root, "[data-ui=dash]"),
      overlay: requireEl(root, "[data-ui=overlay]"),
      title: requireEl(root, "[data-ui=title]"),
      message: requireEl(root, "[data-ui=message]"),
      note: requireEl(root, "[data-ui=note]"),
      pausePanel: requireEl(root, "[data-ui=pausePanel]"),
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=pause]").onclick = () => this.setPaused(true)
    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("TaskSelect")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=play]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.restart()
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=toSelect]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("TaskSelect")
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=resume]").onclick = () => this.setPaused(false)
    requireEl<HTMLButtonElement>(root, "[data-ui=openSettings]").onclick = () => {
      getAudio().playSfx("confirm")
      this.scene.start("Settings", { returnTo: "BunnyJump" })
    }
    requireEl<HTMLButtonElement>(root, "[data-ui=quitSelect]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("TaskSelect")
    }
    this.paintHud()
  }

  private teardown(): void {
    this.weather?.destroy()
    this.breaks?.destroy()
    getAudio().stopMusic()
  }
}
