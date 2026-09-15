import Phaser from "phaser"
import { MeadowRuntime } from "./MeadowRuntime"

const SHELL_HTML = `
<div class="meadow-shell">
  <header>
    <div>
      <div class="eyebrow">A little woodland adventure</div>
      <h1>Bunny Meadow<span>.</span></h1>
      <p>Small paws. Big carrot dreams.</p>
    </div>
    <div class="badge">✿ Made for a little playtime</div>
  </header>
  <div class="bar">
    <span>Carrots <strong data-ui="score">0 / 12</strong></span>
    <span>Hearts <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span>Dash <strong data-ui="dash">Ready</strong></span>
    <button type="button" data-ui="pause">Pause</button>
    <button type="button" class="ghost" data-ui="back">Title</button>
  </div>
  <div class="field">
    <canvas data-ui="canvas" width="960" height="540" aria-label="Bunny Meadow: collect twelve carrots and return to the burrow, avoiding foxes"></canvas>
    <div class="overlay" data-ui="overlay">
      <div class="card">
        <div class="emoji">🐰</div>
        <h2 data-ui="title">Hello, little hopper.</h2>
        <p data-ui="message">Gather 12 carrots for your cozy burrow.</p>
        <button type="button" data-ui="play">Let's hop →</button>
      </div>
    </div>
  </div>
  <div class="touch"><button type="button" data-ui="touchDash">Dash</button></div>
  <footer>
    <span><kbd>W A S D</kbd> or <kbd>↑ ↓ ← →</kbd> move &nbsp; <kbd>Space</kbd> dash &nbsp; <kbd>P</kbd> pause</span>
    <span>On touch: hold a spot in the meadow to move there.</span>
  </footer>
</div>
`

const SHELL_CSS = `
.meadow-root {
  position: fixed;
  inset: 0;
  z-index: 20;
  overflow: auto;
  background: #f5f1e6;
  color: #304c39;
  font-family: system-ui, sans-serif;
}
.meadow-shell {
  max-width: 1080px;
  margin: auto;
  padding: 30px 24px;
}
.meadow-shell header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.meadow-shell .eyebrow {
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 11px;
  font-weight: 800;
  color: #7b8765;
}
.meadow-shell h1 {
  font-family: Georgia, serif;
  font-size: 42px;
  margin: 6px 0;
}
.meadow-shell h1 span { color: #dc854e; }
.meadow-shell header p {
  margin: 0;
  color: #71816e;
  font-size: 14px;
}
.meadow-shell .badge {
  border: 1px solid #cbd2ba;
  border-radius: 30px;
  padding: 10px 16px;
  font-size: 12px;
  white-space: nowrap;
}
.meadow-shell .bar {
  display: flex;
  gap: 24px;
  align-items: center;
  margin: 26px 0 12px;
  font-size: 14px;
  flex-wrap: wrap;
}
.meadow-shell .bar strong { font-size: 19px; }
.meadow-shell .bar button { margin-left: auto; }
.meadow-shell .bar button.ghost {
  margin-left: 0;
  background: transparent;
  color: #34583e;
  border: 1px solid #34583e;
}
.meadow-shell button {
  border: 0;
  background: #34583e;
  color: white;
  padding: 12px 20px;
  border-radius: 24px;
  font: 600 13px system-ui;
  cursor: pointer;
}
.meadow-shell button:focus-visible {
  outline: 3px solid #dc9d4a;
  outline-offset: 3px;
}
.meadow-shell .field {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 14px 40px #415c3620;
  background: #b7ce88;
}
.meadow-shell canvas {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  touch-action: none;
}
.meadow-shell .overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #34563835;
  backdrop-filter: blur(3px);
}
.meadow-shell .overlay[hidden] { display: none; }
.meadow-shell .card {
  max-width: 400px;
  margin: 16px;
  text-align: center;
  background: #fffaf0;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 12px 30px #26432425;
}
.meadow-shell .card .emoji {
  font-size: 36px;
  margin-bottom: 12px;
}
.meadow-shell .card h2 {
  font: 32px Georgia;
  margin: 0 0 12px;
}
.meadow-shell .card p {
  line-height: 1.6;
  color: #71816e;
}
.meadow-shell .card button {
  background: #dc854e;
  padding: 14px 30px;
}
.meadow-shell footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #71816e;
  font-size: 12px;
  margin-top: 20px;
}
.meadow-shell kbd {
  border: 1px solid #c9cfba;
  padding: 3px 6px;
  border-radius: 5px;
  background: #fffaf0;
}
.meadow-shell .touch {
  display: none;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
@media (pointer: coarse) {
  .meadow-shell .touch { display: flex; }
}
@media (max-width: 600px) {
  .meadow-shell { padding: 20px 12px; }
  .meadow-shell h1 { font-size: 32px; }
  .meadow-shell .badge { display: none; }
  .meadow-shell .bar { gap: 12px; font-size: 12px; }
  .meadow-shell .bar strong { font-size: 16px; }
  .meadow-shell footer { flex-direction: column; }
  .meadow-shell .card { padding: 20px; }
  .meadow-shell .card p { font-size: 13px; }
}
`

function requireEl<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector(selector)
  if (!el) {
    throw new Error(`Missing element: ${selector}`)
  }
  return el as T
}

export class MeadowScene extends Phaser.Scene {
  private root: HTMLDivElement | null = null
  private style: HTMLStyleElement | null = null
  private runtime: MeadowRuntime | null = null

  constructor() {
    super("Meadow")
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this)

    const parent = this.game.canvas.parentElement
    if (parent) {
      parent.style.visibility = "hidden"
    }

    this.style = document.createElement("style")
    this.style.textContent = SHELL_CSS
    document.head.appendChild(this.style)

    this.root = document.createElement("div")
    this.root.className = "meadow-root"
    this.root.innerHTML = SHELL_HTML
    document.body.appendChild(this.root)

    const canvas = requireEl<HTMLCanvasElement>(this.root, "[data-ui=canvas]")
    this.runtime = new MeadowRuntime(canvas, {
      score: requireEl(this.root, "[data-ui=score]"),
      hearts: requireEl(this.root, "[data-ui=hearts]"),
      dash: requireEl(this.root, "[data-ui=dash]"),
      pause: requireEl(this.root, "[data-ui=pause]"),
      overlay: requireEl(this.root, "[data-ui=overlay]"),
      title: requireEl(this.root, "[data-ui=title]"),
      message: requireEl(this.root, "[data-ui=message]"),
      play: requireEl(this.root, "[data-ui=play]"),
      touchDash: requireEl(this.root, "[data-ui=touchDash]"),
    })

    requireEl<HTMLButtonElement>(this.root, "[data-ui=back]").onclick = () => {
      this.scene.start("Title")
    }
  }

  private teardown(): void {
    this.runtime?.dispose()
    this.runtime = null
    this.root?.remove()
    this.root = null
    this.style?.remove()
    this.style = null
    const parent = this.game.canvas.parentElement
    if (parent) {
      parent.style.visibility = ""
    }
  }
}
