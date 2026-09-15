import Phaser from "phaser"
import { MeadowRuntime } from "./MeadowRuntime"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { t } from "../../core/i18n"

const SHELL_HTML = `
<div class="bm-shell bm-wide meadow-shell">
  <header class="meadow-header">
    <div>
      <div class="bm-eyebrow">${t("title.eyebrow")}</div>
      <h1>Bunny Meadow<span>.</span></h1>
      <p class="bm-tagline">${t("title.tagline")}</p>
    </div>
  </header>
  <div class="meadow-bar">
    <span>Map <strong data-ui="mapName">Meadow Home</strong></span>
    <span>Carrots <strong data-ui="score">0 / 12</strong></span>
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span>Dash <strong data-ui="dash">Ready</strong></span>
    <span data-ui="timerWrap">Timer <strong data-ui="timer"></strong></span>
    <button type="button" class="bm-btn" data-ui="pause">Pause</button>
    <button type="button" class="bm-btn ghost" data-ui="back">Modes</button>
  </div>
  <div class="meadow-field">
    <canvas data-ui="canvas" width="960" height="540" aria-label="Bunny Meadow"></canvas>
    <div class="meadow-lobby" data-ui="lobby">
      <div class="meadow-lobby-card">
        <h2>Pre-run lobby</h2>
        <p>Pick a map. Difficulty comes from Settings.</p>
        <div class="meadow-lobby-row">
          <canvas data-ui="preview" width="140" height="140" aria-label="Bunny preview"></canvas>
          <div class="meadow-lobby-meta">
            <div class="meadow-chip">Difficulty <strong data-ui="difficultyChip">hopper</strong></div>
            <div class="meadow-map-list" data-ui="mapList"></div>
          </div>
        </div>
        <button type="button" class="bm-btn warm" data-ui="startRun">Start run →</button>
      </div>
    </div>
    <div class="meadow-overlay" data-ui="overlay" hidden>
      <div class="meadow-card">
        <div class="emoji">🐰</div>
        <h2 data-ui="title">Hello, little hopper.</h2>
        <p data-ui="message">Gather carrots for your cozy burrow.</p>
        <button type="button" class="bm-btn warm" data-ui="play">Let's hop →</button>
      </div>
    </div>
    <div class="meadow-overlay meadow-pause" data-ui="pausePanel" hidden>
      <div class="meadow-card">
        <h2>Paused</h2>
        <p>Your carrots can wait.</p>
        <div class="meadow-pause-actions">
          <button type="button" class="bm-btn warm" data-ui="resume">Resume</button>
          <button type="button" class="bm-btn" data-ui="openSettings">Settings</button>
          <button type="button" class="bm-btn ghost" data-ui="quitModes">Quit to Modes</button>
        </div>
      </div>
    </div>
  </div>
  <div class="meadow-touch"><button type="button" class="bm-btn" data-ui="touchDash">Dash</button></div>
  <footer class="meadow-footer">
    <span><kbd>W A S D</kbd> move &nbsp; <kbd>Space</kbd> dash &nbsp; <kbd>P</kbd> pause</span>
    <span>Touch: hold a spot to move.</span>
  </footer>
</div>
`

const MEADOW_CSS = `
.meadow-header { display:flex; justify-content:space-between; align-items:center; gap:20px; }
.meadow-header h1 { font-size:42px; margin:6px 0; }
.meadow-bar { display:flex; gap:20px; align-items:center; margin:26px 0 12px; font-size:14px; flex-wrap:wrap; }
.meadow-bar strong { font-size:18px; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-bar .bm-btn.ghost { margin-left:0; }
.meadow-field { position:relative; overflow:hidden; border-radius:24px; box-shadow:0 14px 40px #415c3620; background:#b7ce88; }
.meadow-field canvas { display:block; width:100%; aspect-ratio:16/9; touch-action:none; }
.meadow-overlay, .meadow-lobby { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#34563835; backdrop-filter:blur(3px); }
.meadow-overlay[hidden], .meadow-lobby[hidden] { display:none; }
.meadow-card, .meadow-lobby-card { max-width:520px; margin:16px; text-align:center; background:#fffaf0; padding:28px; border-radius:24px; box-shadow:0 12px 30px #26432425; }
.meadow-lobby-card { width:min(520px, 92%); }
.meadow-card .emoji { font-size:36px; margin-bottom:12px; }
.meadow-card h2, .meadow-lobby-card h2 { font:32px Georgia; margin:0 0 12px; }
.meadow-card p, .meadow-lobby-card p { line-height:1.6; color:#71816e; }
.meadow-lobby-row { display:flex; gap:18px; align-items:flex-start; text-align:left; margin:18px 0; }
.meadow-lobby-row canvas { flex:0 0 auto; border-radius:16px; background:#bed593; }
.meadow-lobby-meta { flex:1; min-width:0; }
.meadow-chip { display:inline-block; margin-bottom:10px; padding:6px 10px; border-radius:999px; background:#e8efd8; font-size:13px; }
.meadow-map-list { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.meadow-map-card { border:1px solid #c9cfba; background:#fff; border-radius:12px; padding:10px; text-align:left; cursor:pointer; }
.meadow-map-card strong { display:block; font-size:14px; }
.meadow-map-card span { font-size:12px; color:#71816e; }
.meadow-map-card.selected { border-color:#6a8f4e; background:#eef6e2; }
.meadow-map-card.locked { opacity:0.45; cursor:not-allowed; }
.meadow-pause-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
.meadow-footer { display:flex; justify-content:space-between; gap:16px; color:#71816e; font-size:12px; margin-top:20px; }
.meadow-footer kbd { border:1px solid #c9cfba; padding:3px 6px; border-radius:5px; background:#fffaf0; }
.meadow-touch { display:none; justify-content:center; gap:12px; margin-top:16px; }
@media (pointer:coarse) { .meadow-touch { display:flex; } }
@media (max-width:600px) {
  .meadow-header h1 { font-size:32px; }
  .meadow-bar { gap:12px; font-size:12px; }
  .meadow-bar strong { font-size:15px; }
  .meadow-footer { flex-direction:column; }
  .meadow-lobby-row { flex-direction:column; align-items:center; }
  .meadow-map-list { grid-template-columns:1fr; }
}
`

export class MeadowScene extends Phaser.Scene {
  private runtime: MeadowRuntime | null = null
  private style: HTMLStyleElement | null = null

  constructor() {
    super("Meadow")
  }

  create(): void {
    this.style = document.createElement("style")
    this.style.textContent = MEADOW_CSS
    document.head.appendChild(this.style)

    const shell = mountDomShell(this, SHELL_HTML)
    const canvas = requireEl<HTMLCanvasElement>(shell.root, "[data-ui=canvas]")
    const timerEl = requireEl<HTMLElement>(shell.root, "[data-ui=timer]")

    this.runtime = new MeadowRuntime(
      canvas,
      {
        score: requireEl(shell.root, "[data-ui=score]"),
        hearts: requireEl(shell.root, "[data-ui=hearts]"),
        dash: requireEl(shell.root, "[data-ui=dash]"),
        timer: timerEl,
        mapName: requireEl(shell.root, "[data-ui=mapName]"),
        pause: requireEl(shell.root, "[data-ui=pause]"),
        overlay: requireEl(shell.root, "[data-ui=overlay]"),
        title: requireEl(shell.root, "[data-ui=title]"),
        message: requireEl(shell.root, "[data-ui=message]"),
        play: requireEl(shell.root, "[data-ui=play]"),
        touchDash: requireEl(shell.root, "[data-ui=touchDash]"),
        lobby: requireEl(shell.root, "[data-ui=lobby]"),
        mapList: requireEl(shell.root, "[data-ui=mapList]"),
        difficultyChip: requireEl(shell.root, "[data-ui=difficultyChip]"),
        preview: requireEl(shell.root, "[data-ui=preview]"),
        startRun: requireEl(shell.root, "[data-ui=startRun]"),
        pausePanel: requireEl(shell.root, "[data-ui=pausePanel]"),
        resume: requireEl(shell.root, "[data-ui=resume]"),
        openSettings: requireEl(shell.root, "[data-ui=openSettings]"),
        quitModes: requireEl(shell.root, "[data-ui=quitModes]"),
      },
      {
        onOpenSettings: () => this.scene.start("Settings", { returnTo: "Meadow" }),
        onQuitToModes: () => this.scene.start("ModeSelect"),
      },
    )

    requireEl<HTMLButtonElement>(shell.root, "[data-ui=back]").onclick = () => {
      this.scene.start("ModeSelect")
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.disposeRuntime, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.disposeRuntime, this)
  }

  private disposeRuntime(): void {
    this.runtime?.dispose()
    this.runtime = null
    this.style?.remove()
    this.style = null
  }
}
