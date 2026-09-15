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
    <span>Carrots <strong data-ui="score">0 / 12</strong></span>
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span>Dash <strong data-ui="dash">Ready</strong></span>
    <button type="button" class="bm-btn" data-ui="pause">Pause</button>
    <button type="button" class="bm-btn ghost" data-ui="back">Modes</button>
  </div>
  <div class="meadow-field">
    <canvas data-ui="canvas" width="960" height="540" aria-label="Bunny Meadow"></canvas>
    <div class="meadow-overlay" data-ui="overlay">
      <div class="meadow-card">
        <div class="emoji">🐰</div>
        <h2 data-ui="title">Hello, little hopper.</h2>
        <p data-ui="message">Gather 12 carrots for your cozy burrow.</p>
        <button type="button" class="bm-btn warm" data-ui="play">Let's hop →</button>
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
.meadow-bar { display:flex; gap:24px; align-items:center; margin:26px 0 12px; font-size:14px; flex-wrap:wrap; }
.meadow-bar strong { font-size:19px; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-bar .bm-btn.ghost { margin-left:0; }
.meadow-field { position:relative; overflow:hidden; border-radius:24px; box-shadow:0 14px 40px #415c3620; background:#b7ce88; }
.meadow-field canvas { display:block; width:100%; aspect-ratio:16/9; touch-action:none; }
.meadow-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#34563835; backdrop-filter:blur(3px); }
.meadow-overlay[hidden] { display:none; }
.meadow-card { max-width:400px; margin:16px; text-align:center; background:#fffaf0; padding:30px; border-radius:24px; box-shadow:0 12px 30px #26432425; }
.meadow-card .emoji { font-size:36px; margin-bottom:12px; }
.meadow-card h2 { font:32px Georgia; margin:0 0 12px; }
.meadow-card p { line-height:1.6; color:#71816e; }
.meadow-footer { display:flex; justify-content:space-between; gap:16px; color:#71816e; font-size:12px; margin-top:20px; }
.meadow-footer kbd { border:1px solid #c9cfba; padding:3px 6px; border-radius:5px; background:#fffaf0; }
.meadow-touch { display:none; justify-content:center; gap:12px; margin-top:16px; }
@media (pointer:coarse) { .meadow-touch { display:flex; } }
@media (max-width:600px) {
  .meadow-header h1 { font-size:32px; }
  .meadow-bar { gap:12px; font-size:12px; }
  .meadow-bar strong { font-size:16px; }
  .meadow-footer { flex-direction:column; }
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
    this.runtime = new MeadowRuntime(canvas, {
      score: requireEl(shell.root, "[data-ui=score]"),
      hearts: requireEl(shell.root, "[data-ui=hearts]"),
      dash: requireEl(shell.root, "[data-ui=dash]"),
      pause: requireEl(shell.root, "[data-ui=pause]"),
      overlay: requireEl(shell.root, "[data-ui=overlay]"),
      title: requireEl(shell.root, "[data-ui=title]"),
      message: requireEl(shell.root, "[data-ui=message]"),
      play: requireEl(shell.root, "[data-ui=play]"),
      touchDash: requireEl(shell.root, "[data-ui=touchDash]"),
    })

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
