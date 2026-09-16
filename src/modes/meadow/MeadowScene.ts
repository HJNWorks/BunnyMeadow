import Phaser from "phaser"
import { MeadowRuntime } from "./MeadowRuntime"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"

function shellHtml(): string {
  return `
<div class="bm-shell bm-wide meadow-shell">
  <header class="meadow-header">
    <div>
      <div class="bm-eyebrow">${t("meadow.arcade")}</div>
      <h1>Bunny Meadow<span>.</span></h1>
      <p class="bm-tagline">${t("meadow.tagline")}</p>
    </div>
  </header>
  <div class="meadow-bar">
    <span>${t("hud.carrots")} <strong data-ui="score">0</strong></span>
    <span>${t("hud.hearts")} <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span>${t("hud.dash")} <strong data-ui="dash">${t("common.ready")}</strong></span>
    <span>${t("hud.map")} <strong data-ui="mapName">${t("map.meadow_home")}</strong></span>
    <span data-ui="timer"></span>
    <button type="button" class="bm-btn" data-ui="pause">${t("common.pause")}</button>
  </div>
  <div class="meadow-field">
    <canvas data-ui="canvas" width="960" height="540" aria-label="Bunny Meadow"></canvas>
    <div class="meadow-lobby" data-ui="lobby">
      <div class="meadow-lobby-card">
        <h2>${t("meadow.lobby.title")}</h2>
        <p>${t("meadow.lobby.body")}</p>
        <div class="meadow-lobby-row">
          <canvas class="meadow-preview" data-ui="preview" width="336" height="336" aria-label="${t("common.preview")}"></canvas>
          <div class="meadow-lobby-meta">
            <div class="meadow-section-label">${t("meadow.lobby.map")}</div>
            <div class="meadow-map-list" data-ui="mapList"></div>
          </div>
        </div>
        <div class="meadow-section-label meadow-diff-heading">${t("settings.difficulty")}</div>
        <div class="meadow-diff-list" data-ui="difficultyList" role="listbox" aria-label="${t("settings.difficulty")}"></div>
        <div class="meadow-lobby-actions">
          <button type="button" class="bm-btn ghost" data-ui="abortLobby">${t("meadow.lobby.abort")}</button>
          <button type="button" class="bm-btn warm" data-ui="startRun">${t("meadow.lobby.start")}</button>
        </div>
      </div>
    </div>
    <div class="meadow-overlay" data-ui="overlay" hidden>
      <div class="meadow-card">
        <h2 data-ui="title">${t("common.ready")}</h2>
        <p data-ui="message"></p>
        <div class="meadow-end-actions">
          <button type="button" class="bm-btn warm" data-ui="play">${t("meadow.win.play")}</button>
          <button type="button" class="bm-btn ghost" data-ui="toLobby">${t("meadow.lobby.toLobby")}</button>
        </div>
      </div>
    </div>
    <div class="meadow-overlay meadow-pause" data-ui="pausePanel" hidden>
      <div class="meadow-card">
        <h2>${t("common.pause")}</h2>
        <div class="meadow-pause-actions">
          <button type="button" class="bm-btn warm" data-ui="resume">${t("common.resume")}</button>
          <button type="button" class="bm-btn ghost" data-ui="openSettings">${t("common.settings")}</button>
          <button type="button" class="bm-btn ghost" data-ui="quitModes">${t("meadow.quit")}</button>
        </div>
      </div>
    </div>
  </div>
  <button type="button" class="bm-btn meadow-touch" data-ui="touchDash">${t("hud.dash")}</button>
</div>
`
}

const MEADOW_CSS = `
.meadow-shell { max-width:1080px; }
.meadow-header h1 { font-size:40px; margin:8px 0; }
.meadow-bar { display:flex; gap:18px; align-items:center; margin:16px 0 12px; flex-wrap:wrap; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-field { position:relative; overflow:hidden; border-radius:24px; box-shadow:0 14px 40px #415c3620; background:#b7ce88; }
.meadow-field > canvas[data-ui="canvas"] { display:block; width:100%; aspect-ratio:16/9; touch-action:none; }
.meadow-overlay, .meadow-lobby { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#34563835; backdrop-filter:blur(3px); }
.meadow-overlay[hidden], .meadow-lobby[hidden] { display:none; }
.meadow-card, .meadow-lobby-card { max-width:560px; margin:16px; text-align:center; background:#fffaf0; padding:28px; border-radius:24px; box-shadow:0 12px 30px #26432425; }
.meadow-lobby-card { width:min(560px, 94%); }
.meadow-card h2, .meadow-lobby-card h2 { font:32px Georgia, serif; margin:0 0 12px; font-weight:400; }
.meadow-card p, .meadow-lobby-card p { line-height:1.6; color:#71816e; margin:0; }
.meadow-lobby-row { display:flex; gap:18px; align-items:stretch; text-align:left; margin:18px 0 12px; }
.meadow-preview {
  flex:0 0 auto;
  width:168px;
  height:168px;
  border-radius:16px;
  background:#bed593;
  display:block;
}
.meadow-lobby-meta { flex:1; min-width:0; display:flex; flex-direction:column; }
.meadow-section-label { font:12px Georgia, serif; letter-spacing:0.04em; color:#6a7a64; margin:0 0 8px; }
.meadow-diff-heading { margin-top:4px; text-align:center; }
.meadow-diff-list {
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:8px;
  margin:0 0 18px;
}
.meadow-diff-chip {
  flex:0 0 auto;
  border:1px solid #c9cfba;
  background:#fff;
  border-radius:999px;
  padding:8px 14px;
  font:13px Georgia, serif;
  color:#3d4934;
  cursor:pointer;
}
.meadow-diff-chip:hover { border-color:#8aaa6a; background:#f4f8ec; }
.meadow-diff-chip.selected { border-color:#6a8f4e; background:#eef6e2; color:#2f4a28; }
.meadow-diff-chip[data-id="hardcore"].selected { border-color:#a85a3a; background:#f7ebe4; color:#6a3220; }
.meadow-map-list { display:grid; grid-template-columns:1fr 1fr; gap:8px; flex:1; }
.meadow-map-card { border:1px solid #c9cfba; background:#fff; border-radius:12px; padding:10px; text-align:left; cursor:pointer; }
.meadow-map-card strong { display:block; font-size:14px; }
.meadow-map-card span { display:block; font-size:12px; color:#71816e; }
.meadow-map-card.selected { border-color:#6a8f4e; background:#eef6e2; }
.meadow-map-card.locked { opacity:0.45; cursor:not-allowed; }
.meadow-lobby-actions { display:flex; flex-direction:column; gap:10px; }
.meadow-end-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
.meadow-pause-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
.meadow-touch { position:fixed; right:24px; bottom:24px; display:none; z-index:40; }
@media (pointer:coarse) { .meadow-touch { display:inline-flex; } }
@media (max-width:600px) {
  .meadow-header h1 { font-size:32px; }
  .meadow-bar { gap:12px; font-size:12px; }
  .meadow-lobby-row { flex-direction:column; align-items:center; }
  .meadow-preview { width:148px; height:148px; }
  .meadow-map-list { grid-template-columns:1fr; width:100%; }
}
`

export class MeadowScene extends Phaser.Scene {
  private runtime: MeadowRuntime | null = null
  private style: HTMLStyleElement | null = null

  constructor() {
    super("Meadow")
  }

  create(): void {
    getAudio().playMusic("meadow")
    this.style = document.createElement("style")
    this.style.textContent = MEADOW_CSS
    document.head.appendChild(this.style)

    const shell = mountDomShell(this, shellHtml())
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
        onOpenSettings: () => {
          getAudio().playSfx("confirm")
          this.scene.start("Settings", { returnTo: "Meadow" })
        },
        onQuitToModes: () => {
          getAudio().playSfx("cancel")
          this.scene.start("TaskSelect")
        },
      },
    )

    requireEl<HTMLButtonElement>(shell.root, "[data-ui=abortLobby]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("TaskSelect")
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      getAudio().stopMusic()
      this.disposeRuntime()
    })
    this.events.once(Phaser.Scenes.Events.DESTROY, this.disposeRuntime, this)
  }

  private disposeRuntime(): void {
    this.runtime?.dispose()
    this.runtime = null
    this.style?.remove()
    this.style = null
  }
}
