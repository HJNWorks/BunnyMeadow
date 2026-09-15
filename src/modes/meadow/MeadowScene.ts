import Phaser from "phaser"
import { MeadowRuntime } from "./MeadowRuntime"
import { mountDomShell, requireEl } from "../../ui/DomShell"

const SHELL_HTML = `
<div class="bm-shell bm-wide meadow-shell">
  <header class="meadow-header">
    <div>
      <div class="bm-eyebrow">Arcade</div>
      <h1>Bunny Meadow<span>.</span></h1>
      <p class="bm-tagline">Collect carrots. Dash past foxes. Come home soft.</p>
    </div>
  </header>
  <div class="meadow-bar">
    <span>Carrots <strong data-ui="score">0</strong></span>
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span>Dash <strong data-ui="dash">Ready</strong></span>
    <span>Map <strong data-ui="mapName">Meadow Home</strong></span>
    <span data-ui="timer"></span>
    <button type="button" class="bm-btn" data-ui="pause">Pause</button>
  </div>
  <div class="meadow-field">
    <canvas data-ui="canvas" width="960" height="540" aria-label="Bunny Meadow"></canvas>
  </div>
  <div class="meadow-lobby" data-ui="lobby">
    <div class="meadow-lobby-card">
      <div class="meadow-lobby-preview">
        <canvas class="meadow-preview" data-ui="preview" width="336" height="336" aria-label="Bunny preview"></canvas>
      </div>
      <div class="meadow-lobby-side">
        <h2>Choose map</h2>
        <div class="meadow-map-list" data-ui="mapList"></div>
        <h2>Difficulty</h2>
        <div class="meadow-diff-list" data-ui="difficultyList"></div>
        <button type="button" class="bm-btn warm" data-ui="startRun">Start run</button>
      </div>
    </div>
  </div>
  <div class="meadow-overlay" data-ui="overlay" hidden>
    <div class="meadow-card">
      <h2 data-ui="title">Ready</h2>
      <p data-ui="message"></p>
      <button type="button" class="bm-btn warm" data-ui="play">Play again</button>
      <button type="button" class="bm-btn ghost" data-ui="toLobby">Lobby</button>
    </div>
  </div>
  <div class="meadow-overlay meadow-pause" data-ui="pausePanel" hidden>
    <div class="meadow-card">
      <h2>Paused</h2>
      <div class="meadow-pause-actions">
        <button type="button" class="bm-btn warm" data-ui="resume">Resume</button>
        <button type="button" class="bm-btn ghost" data-ui="openSettings">Settings</button>
        <button type="button" class="bm-btn ghost" data-ui="quitModes">Quit to Moon Tasks</button>
      </div>
    </div>
  </div>
  <button type="button" class="bm-btn meadow-touch" data-ui="touchDash">Dash</button>
</div>
`

const MEADOW_CSS = `
.meadow-shell { max-width:1080px; }
.meadow-header h1 { font-size:40px; margin:8px 0; }
.meadow-bar { display:flex; gap:18px; align-items:center; margin:16px 0 12px; flex-wrap:wrap; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-field > canvas[data-ui="canvas"] { display:block; width:100%; aspect-ratio:16/9; touch-action:none; background:#d7e3b8; border-radius:20px; border:1px solid #cbd2ba; }
.meadow-overlay, .meadow-lobby { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#34563835; backdrop-filter:blur(3px); }
.meadow-overlay[hidden], .meadow-lobby[hidden] { display:none; }
.meadow-card, .meadow-lobby-card { background:#fffaf0; padding:28px; border-radius:24px; max-width:720px; width:min(920px, 92vw); }
.meadow-card { text-align:center; max-width:420px; }
.meadow-lobby-card { display:grid; grid-template-columns:336px 1fr; gap:24px; align-items:start; }
.meadow-lobby-side h2 { margin:0 0 10px; font-size:18px; }
.meadow-map-list, .meadow-diff-list { display:grid; gap:8px; margin-bottom:16px; }
.meadow-map-list button, .meadow-diff-list button { text-align:left; }
.meadow-preview { width:336px; height:336px; border-radius:18px; background:#e8efd4; display:block; }
.meadow-pause-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
.meadow-touch { position:fixed; right:24px; bottom:24px; display:none; z-index:40; }
@media (max-width: 820px) {
  .meadow-lobby-card { grid-template-columns:1fr; }
  .meadow-preview { width:100%; height:auto; aspect-ratio:1; }
  .meadow-touch { display:inline-flex; }
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

    this.runtime = new MeadowRuntime(
      canvas,
      {
        score: requireEl(shell.root, "[data-ui=score]"),
        hearts: requireEl(shell.root, "[data-ui=hearts]"),
        dash: requireEl(shell.root, "[data-ui=dash]"),
        timer: requireEl(shell.root, "[data-ui=timer]"),
        mapName: requireEl(shell.root, "[data-ui=mapName]"),
        pause: requireEl(shell.root, "[data-ui=pause]"),
        overlay: requireEl(shell.root, "[data-ui=overlay]"),
        title: requireEl(shell.root, "[data-ui=title]"),
        message: requireEl(shell.root, "[data-ui=message]"),
        play: requireEl(shell.root, "[data-ui=play]"),
        touchDash: requireEl(shell.root, "[data-ui=touchDash]"),
        lobby: requireEl(shell.root, "[data-ui=lobby]"),
        mapList: requireEl(shell.root, "[data-ui=mapList]"),
        difficultyList: requireEl(shell.root, "[data-ui=difficultyList]"),
        preview: requireEl(shell.root, "[data-ui=preview]"),
        startRun: requireEl(shell.root, "[data-ui=startRun]"),
        toLobby: requireEl(shell.root, "[data-ui=toLobby]"),
        pausePanel: requireEl(shell.root, "[data-ui=pausePanel]"),
        resume: requireEl(shell.root, "[data-ui=resume]"),
        openSettings: requireEl(shell.root, "[data-ui=openSettings]"),
        quitModes: requireEl(shell.root, "[data-ui=quitModes]"),
      },
      {
        onOpenSettings: () => this.scene.start("Settings", { returnTo: "Meadow" }),
        onQuitToModes: () => this.scene.start("TaskSelect"),
      },
    )

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
