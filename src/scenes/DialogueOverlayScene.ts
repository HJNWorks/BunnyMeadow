import Phaser from "phaser"
import { mountDomShell, requireEl } from "../ui/DomShell"

export type DialoguePayload = {
  lines: string[]
  onDone?: () => void
}

export class DialogueOverlayScene extends Phaser.Scene {
  private style: HTMLStyleElement | null = null
  private onDone: (() => void) | null = null

  constructor() {
    super("DialogueOverlay")
  }

  create(data?: DialoguePayload): void {
    const lines = (data?.lines ?? []).slice(0, 2)
    this.onDone = data?.onDone ?? null

    this.style = document.createElement("style")
    this.style.textContent = `
      .bm-root.bm-dialogue-root { background: transparent; pointer-events: none; overflow: hidden; }
      .bm-dialogue {
        position: fixed; inset: auto 0 8% 0; display:flex; justify-content:center; pointer-events:none; z-index:40;
      }
      .bm-dialogue-card {
        pointer-events:auto; min-width:min(640px, 88vw); max-width:720px;
        background:#fffaf0ee; border-radius:20px; padding:22px 26px;
        box-shadow:0 12px 30px #26432440; font:18px Georgia; color:#3d4934;
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

    requireEl<HTMLButtonElement>(mounted.root, "[data-ui=continue]").onclick = () => {
      const done = this.onDone
      this.scene.stop()
      done?.()
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.style?.remove()
      this.style = null
    })
  }
}
