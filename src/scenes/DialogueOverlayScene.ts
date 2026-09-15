import Phaser from "phaser"
import { mountDomShell, requireEl } from "../ui/DomShell"
import { getInput } from "../core/input"

export type DialoguePayload = {
  lines: string[]
  onDone?: () => void
}

export class DialogueOverlayScene extends Phaser.Scene {
  private style: HTMLStyleElement | null = null
  private onDone: (() => void) | null = null
  private closed = false

  constructor() {
    super("DialogueOverlay")
  }

  create(data?: DialoguePayload): void {
    const lines = (data?.lines ?? []).slice(0, 2)
    this.onDone = data?.onDone ?? null
    this.closed = false

    this.style = document.createElement("style")
    this.style.textContent = `
      .bm-root.bm-dialogue-root {
        background: transparent !important;
        pointer-events: none;
        overflow: hidden;
        z-index: 45;
      }
      .bm-dialogue {
        position: fixed; inset: auto 0 8% 0; display:flex; justify-content:center; pointer-events:none;
      }
      .bm-dialogue-card {
        pointer-events:auto; min-width:min(640px, 88vw); max-width:720px;
        background:#fffaf0f2; border-radius:20px; padding:22px 26px;
        box-shadow:0 12px 30px #26432440; font:18px Georgia; color:#3d4934;
        border:1px solid #d5dcc4;
      }
      .bm-dialogue-card p { margin:0 0 10px; line-height:1.5; }
      .bm-dialogue-card button { margin-top:8px; }
    `
    document.head.appendChild(this.style)

    const body = lines.map((line) => `<p>${line}</p>`).join("")
    const mounted = mountDomShell(
      this,
      `
      <div class="bm-dialogue">
        <div class="bm-dialogue-card">
          ${body || "<p>...</p>"}
          <button type="button" class="bm-btn warm" data-ui="continue">Continue</button>
        </div>
      </div>
      `,
      { keepCanvas: true, rootClass: "bm-dialogue-root" },
    )

    const close = (): void => {
      if (this.closed) {
        return
      }
      this.closed = true
      const done = this.onDone
      this.onDone = null
      this.scene.stop()
      done?.()
    }

    requireEl<HTMLButtonElement>(mounted.root, "[data-ui=continue]").onclick = () => close()

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.style?.remove()
      this.style = null
      if (!this.closed) {
        this.closed = true
        const done = this.onDone
        this.onDone = null
        done?.()
      }
    })
  }

  update(): void {
    if (this.closed) {
      return
    }
    const snap = getInput().snapshot()
    if (snap.confirmPressed || snap.jumpPressed) {
      if (!this.closed) {
        this.closed = true
        const done = this.onDone
        this.onDone = null
        this.scene.stop()
        done?.()
      }
    }
  }
}
