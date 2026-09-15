import type Phaser from "phaser"
import type { Bindings } from "../core/save"

export type CoachAction = "move" | "jump" | "dash"

type CoachChip = {
  action: CoachAction
  el: HTMLElement
  learned: boolean
  flying: boolean
}

function formatCode(code: string): string {
  if (code === "Space") {
    return "Space"
  }
  if (code.startsWith("Key")) {
    return code.slice(3)
  }
  if (code === "ArrowLeft") {
    return "←"
  }
  if (code === "ArrowRight") {
    return "→"
  }
  if (code === "ArrowUp") {
    return "↑"
  }
  if (code === "ArrowDown") {
    return "↓"
  }
  return code
}

function primaryCodes(codes: string[], limit = 2): string[] {
  const preferred = codes.filter((code) => code.startsWith("Key") || code === "Space")
  const pick = preferred.length > 0 ? preferred : codes
  return pick.slice(0, limit)
}

export class ControlCoach {
  private floatRoot: HTMLElement
  private dock: HTMLElement
  private chips: CoachChip[] = []
  private reducedMotion = false
  private onLearned: ((action: CoachAction) => void) | null = null

  constructor(
    floatRoot: HTMLElement,
    dock: HTMLElement,
    bindings: Bindings,
    learned: CoachAction[],
    options: { reducedMotion?: boolean; onLearned?: (action: CoachAction) => void } = {},
  ) {
    this.floatRoot = floatRoot
    this.dock = dock
    this.reducedMotion = !!options.reducedMotion
    this.onLearned = options.onLearned ?? null

    const learnedSet = new Set(learned)
    const defs: { action: CoachAction; keys: string[]; label: string }[] = [
      {
        action: "move",
        keys: [
          ...primaryCodes(bindings.moveLeft, 1),
          ...primaryCodes(bindings.moveRight, 1),
        ],
        label: "Move",
      },
      {
        action: "jump",
        keys: primaryCodes(bindings.jump, 1),
        label: "Jump",
      },
      {
        action: "dash",
        keys: primaryCodes(bindings.dash, 1),
        label: "Dash",
      },
    ]

    this.floatRoot.replaceChildren()
    this.dock.replaceChildren()

    for (const def of defs) {
      const el = document.createElement("div")
      el.className = "story-coach-chip"
      el.dataset.coach = def.action
      el.innerHTML = `
        <div class="story-coach-keys">${def.keys.map((code) => `<kbd>${formatCode(code)}</kbd>`).join("")}</div>
        <span class="story-coach-label">${def.label}</span>
      `
      const chip: CoachChip = {
        action: def.action,
        el,
        learned: learnedSet.has(def.action),
        flying: false,
      }
      this.chips.push(chip)
      if (chip.learned) {
        el.classList.add("is-docked")
        this.dock.appendChild(el)
      } else {
        el.classList.add("is-float")
        if (!this.reducedMotion) {
          el.classList.add("is-flash")
        }
        this.floatRoot.appendChild(el)
      }
    }

    const pending = this.chips.some((chip) => !chip.learned)
    this.floatRoot.hidden = !pending
    this.dock.hidden = this.chips.every((chip) => !chip.learned)
  }

  noteInput(moveX: number, jumpPressed: boolean, dashPressed: boolean): void {
    if (moveX !== 0) {
      this.learn("move")
    }
    if (jumpPressed) {
      this.learn("jump")
    }
    if (dashPressed) {
      this.learn("dash")
    }
  }

  followPlayer(scene: Phaser.Scene, worldX: number, worldY: number): void {
    if (this.floatRoot.hidden) {
      return
    }
    const cam = scene.cameras.main
    const canvas = scene.game.canvas
    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / scene.scale.width
    const scaleY = rect.height / scene.scale.height
    const sx = rect.left + (worldX - cam.scrollX) * cam.zoom * scaleX
    const sy = rect.top + (worldY - cam.scrollY) * cam.zoom * scaleY
    this.floatRoot.style.left = `${sx}px`
    this.floatRoot.style.top = `${sy - 72}px`
  }

  private learn(action: CoachAction): void {
    const chip = this.chips.find((entry) => entry.action === action)
    if (!chip || chip.learned || chip.flying) {
      return
    }
    chip.learned = true
    chip.flying = true
    chip.el.classList.remove("is-flash")
    this.onLearned?.(action)

    if (this.reducedMotion) {
      this.dockChip(chip)
      return
    }

    const from = chip.el.getBoundingClientRect()
    const ghost = chip.el.cloneNode(true) as HTMLElement
    ghost.classList.remove("is-float", "is-flash")
    ghost.classList.add("story-coach-fly")
    ghost.style.left = `${from.left}px`
    ghost.style.top = `${from.top}px`
    ghost.style.width = `${from.width}px`
    document.body.appendChild(ghost)
    chip.el.style.visibility = "hidden"

    this.dock.hidden = false
    const placeholder = document.createElement("div")
    placeholder.className = "story-coach-chip is-docked is-slot"
    placeholder.style.width = `${from.width}px`
    placeholder.style.height = `${from.height}px`
    this.dock.appendChild(placeholder)

    requestAnimationFrame(() => {
      const to = placeholder.getBoundingClientRect()
      ghost.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.92)`
      ghost.style.opacity = "0.95"
    })

    window.setTimeout(() => {
      ghost.remove()
      placeholder.remove()
      chip.el.style.visibility = ""
      this.dockChip(chip)
    }, 420)
  }

  private dockChip(chip: CoachChip): void {
    chip.flying = false
    chip.el.classList.remove("is-float", "is-flash")
    chip.el.classList.add("is-docked")
    this.dock.appendChild(chip.el)
    this.dock.hidden = false
    const pending = this.chips.some((entry) => !entry.learned)
    this.floatRoot.hidden = !pending
  }
}

export const CONTROL_COACH_CSS = `
.story-controls-dock {
  display:flex;
  gap:8px;
  align-items:center;
  min-height:36px;
}
.story-controls-dock[hidden] { display:none; }
.story-controls-float {
  position:fixed;
  left:0;
  top:0;
  transform:translate(-50%, -100%);
  display:flex;
  gap:10px;
  align-items:flex-end;
  z-index:45;
  pointer-events:none;
}
.story-controls-float[hidden] { display:none; }
.story-coach-chip {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:4px;
  padding:8px 10px;
  border-radius:14px;
  background:#fffaf0ee;
  border:1px solid #cbd2ba;
  box-shadow:0 8px 18px #26432422;
  color:#304c39;
  font:12px system-ui, sans-serif;
}
.story-coach-chip.is-docked {
  padding:4px 8px;
  box-shadow:none;
  background:#fffaf0;
}
.story-coach-chip.is-slot {
  opacity:0;
  padding:0;
  border:none;
  background:transparent;
  box-shadow:none;
}
.story-coach-chip.is-flash {
  animation: story-coach-pulse 1.1s ease-in-out infinite;
}
.story-coach-keys {
  display:flex;
  gap:4px;
}
.story-coach-keys kbd {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:28px;
  height:28px;
  padding:0 8px;
  border-radius:8px;
  border:1px solid #a7b38f;
  background:linear-gradient(#fffdf7, #eef2e0);
  font:700 12px system-ui, sans-serif;
  color:#34583e;
  box-shadow:0 2px 0 #a7b38f;
}
.story-coach-chip.is-docked .story-coach-keys kbd {
  min-width:22px;
  height:22px;
  font-size:11px;
  box-shadow:0 1px 0 #a7b38f;
}
.story-coach-label {
  letter-spacing:0.04em;
  text-transform:uppercase;
  font-weight:700;
  font-size:10px;
  color:#71816e;
}
.story-coach-chip.is-docked .story-coach-label {
  font-size:9px;
}
.story-coach-fly {
  position:fixed;
  z-index:40;
  pointer-events:none;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease;
}
@keyframes story-coach-pulse {
  0%, 100% { opacity:0.55; transform:translateY(0); }
  50% { opacity:1; transform:translateY(-4px); }
}
html.a11y-reduced-motion .story-coach-chip.is-flash {
  animation:none;
  opacity:1;
}
`
