import Phaser from "phaser"

const TITLE_HTML = `
<div class="title-shell">
  <div class="eyebrow">A little woodland adventure</div>
  <h1>Bunny Meadow<span>.</span></h1>
  <p class="tagline">Small paws. Big carrot dreams.</p>
  <button type="button" data-ui="play">Play Meadow</button>
  <p class="note">Story, Moon Tasks and Endless arrive in later builds.</p>
</div>
`

const TITLE_CSS = `
.title-root {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f1e6;
  color: #304c39;
  font-family: system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.title-shell {
  max-width: 640px;
  padding: 40px 24px;
  text-align: center;
}
.title-shell .eyebrow {
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 11px;
  font-weight: 800;
  color: #7b8765;
}
.title-shell h1 {
  font-family: Georgia, serif;
  font-size: clamp(36px, 7vw, 56px);
  margin: 12px 0 8px;
  font-weight: 400;
  color: #304c39;
}
.title-shell h1 span {
  color: #dc854e;
}
.title-shell .tagline {
  margin: 0 0 36px;
  color: #71816e;
  font-size: 16px;
}
.title-shell button {
  border: 0;
  background: #34583e;
  color: #fff;
  padding: 14px 36px;
  border-radius: 24px;
  font: 600 16px system-ui, sans-serif;
  cursor: pointer;
}
.title-shell button:hover {
  background: #3f6949;
}
.title-shell button:focus-visible {
  outline: 3px solid #dc9d4a;
  outline-offset: 3px;
}
.title-shell .note {
  margin: 28px 0 0;
  color: #71816e;
  font-size: 13px;
}
`

export class TitleScene extends Phaser.Scene {
  private root: HTMLDivElement | null = null
  private style: HTMLStyleElement | null = null

  constructor() {
    super("Title")
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this)

    const parent = this.game.canvas.parentElement
    if (parent) {
      parent.style.visibility = "hidden"
    }

    this.style = document.createElement("style")
    this.style.textContent = TITLE_CSS
    document.head.appendChild(this.style)

    this.root = document.createElement("div")
    this.root.className = "title-root"
    this.root.innerHTML = TITLE_HTML
    document.body.appendChild(this.root)

    const play = this.root.querySelector("[data-ui=play]")
    if (play instanceof HTMLButtonElement) {
      play.onclick = () => this.scene.start("Meadow")
    }
  }

  private teardown(): void {
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
