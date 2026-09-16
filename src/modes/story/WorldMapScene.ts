import Phaser from "phaser"
import { getSave, persistSave } from "../../core/session"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { buildInkBrushSvg, inkProgressForWorlds } from "../../ui/inkBrushPath"
import {
  defaultExpandedWorld,
  getStation,
  isStationCleared,
  isStationUnlocked,
  isWorldUnlocked,
  listStations,
  listWorlds,
  worldClearCount,
  type StoryStation,
  type StoryWorldId,
} from "./path"

const PATH_CSS = `
.story-path-shell { max-width: 980px; }
.story-path-frame {
  position: relative;
  margin-top: 18px;
  border-radius: 28px;
  border: 1px solid #cbd2ba;
  overflow: hidden;
  background:
    radial-gradient(circle at 92% 10%, #fff8d6 0%, transparent 22%),
    linear-gradient(160deg, #e7f0c8 0%, #d5e3a8 42%, #c5d48a 100%);
  min-height: 420px;
}
.story-path-svg, .story-ink-svg { width: 100%; height: 420px; display: block; }
.story-ink-drawn .story-ink-stroke {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: story-ink-draw 1.6s ease forwards;
}
.story-ink-drawn .story-ink-ribbon {
  opacity: 0;
  animation: story-ink-fade 1.2s ease 0.2s forwards;
}
.story-ink-ghost { pointer-events: none; }
@keyframes story-ink-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes story-ink-fade {
  to { opacity: 0.18; }
}
@media (prefers-reduced-motion: reduce) {
  .story-ink-drawn .story-ink-stroke,
  .story-ink-drawn .story-ink-ribbon { animation: none; stroke-dashoffset: 0; opacity: 0.18; }
}
.story-path-node {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 128px;
  max-width: 160px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid #a7b38f;
  background: #fffaf0ee;
  color: #304c39;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 18px #2a3d2418;
  z-index: 2;
}
.story-path-node strong { display:block; font-size: 14px; margin-bottom: 2px; }
.story-path-node span { display:block; font-size: 11px; color: #71816e; line-height: 1.3; }
.story-path-node .story-path-badge {
  display:inline-block; margin-top:6px; font-size:10px; font-weight:700;
  letter-spacing:0.04em; text-transform:uppercase; color:#34583e;
}
.story-path-node.is-soon { opacity: 0.62; cursor: default; }
.story-path-node.is-locked { opacity: 0.72; }
.story-path-node.is-open { border-color: #34583e; box-shadow: 0 0 0 2px #34583e33; }
.story-path-rail {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}
.story-path-rail[hidden] { display: none; }
.story-path-station {
  display:flex; gap:14px; align-items:center; text-align:left;
  width:100%; padding:14px 16px; border-radius:18px;
  border:1px solid #cbd2ba; background:#fffaf0; color:inherit; font:inherit; cursor:pointer;
}
.story-path-station:disabled { opacity:0.55; cursor:not-allowed; }
.story-path-station .idx {
  flex:0 0 auto; width:34px; height:34px; border-radius:12px;
  display:inline-flex; align-items:center; justify-content:center;
  background:#eef2e0; color:#34583e; font-weight:800; font-size:12px;
}
.story-path-station .copy { display:flex; flex-direction:column; gap:2px; min-width:0; }
.story-path-station strong { font-size:15px; }
.story-path-station span { font-size:12px; color:#71816e; }
.story-beat {
  position: fixed; inset: 0; z-index: 50;
  display:flex; align-items:center; justify-content:center;
  background: #34563855; pointer-events: auto;
}
.story-beat[hidden] { display:none !important; }
.story-beat-card {
  width: min(560px, 92vw); background:#fffaf0; border-radius:24px;
  padding:26px; border:1px solid #d5dcc4; box-shadow:0 16px 40px #26432433;
  font: 18px Georgia, serif; color:#3d4934;
}
.story-beat-card .bm-eyebrow { margin-bottom: 8px; }
.story-beat-card h2 { margin: 0 0 10px; font-size: 28px; font-weight: 400; }
.story-beat-card p { margin: 0 0 10px; line-height: 1.45; }
.story-beat-card .bm-btn { margin-top: 12px; }
.story-path-dev { margin-left: auto; opacity: 0.72; font-size: 12px; }
`

export class WorldMapScene extends Phaser.Scene {
  private expanded: StoryWorldId = "w0"
  private beatRoot: HTMLElement | null = null

  constructor() {
    super("WorldMap")
  }

  create(): void {
    const save = getSave()
    this.expanded = defaultExpandedWorld(save)

    const worlds = listWorlds()
    const inkPoints = worlds.map((world) => ({
      x: (world.x / 100) * 1000,
      y: (world.y / 100) * 420,
    }))
    const progress = inkProgressForWorlds(worlds, (id) => isWorldUnlocked(save, id as StoryWorldId))
    const inkSvg = buildInkBrushSvg(inkPoints, {
      progress,
      feathers: 5,
      seed: 11,
      ink: "#2c3a28",
      ghostInk: "#6f804844",
    })

    const nodes = worlds
      .map((world) => {
        const unlocked = isWorldUnlocked(save, world.id)
        const counts = worldClearCount(save, world.id)
        const soon = world.status === "soon"
        const open = this.expanded === world.id
        const badge = soon
          ? "Soon"
          : unlocked
            ? `${counts.done}/${counts.total}`
            : "Locked"
        return `
          <button type="button"
            class="story-path-node${soon ? " is-soon" : ""}${!unlocked && !soon ? " is-locked" : ""}${open ? " is-open" : ""}"
            style="left:${world.x}%; top:${world.y}%"
            data-world="${world.id}"
            ${soon ? "disabled" : ""}>
            <strong>${world.title}</strong>
            <span>${world.tagline}</span>
            <em class="story-path-badge">${badge}</em>
          </button>
        `
      })
      .join("")

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell bm-wide story-path-shell">
        <div class="bm-eyebrow">Story Path</div>
        <h1>Burrow to Moon</h1>
        <p class="bm-tagline" data-ui="pathTagline">Follow the blossoms. Expand a world to open its stations.</p>
        <div class="story-path-frame">
          ${inkSvg}
          ${nodes}
        </div>
        <div class="story-path-rail" data-ui="rail"></div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">Modes</button>
          <button type="button" class="bm-btn ghost story-path-dev" data-ui="devReset">Dev: clear story DONEs</button>
        </div>
      </div>
      <div class="story-beat" data-ui="beat" hidden>
        <div class="story-beat-card">
          <div class="bm-eyebrow" data-ui="beatEyebrow">World 0</div>
          <h2 data-ui="beatTitle">Beat</h2>
          <div data-ui="beatBody"></div>
          <button type="button" class="bm-btn warm" data-ui="beatContinue">Continue</button>
        </div>
      </div>
      <style>${PATH_CSS}</style>
      `,
    )

    this.beatRoot = requireEl<HTMLElement>(root, "[data-ui=beat]")
    const rail = requireEl<HTMLElement>(root, "[data-ui=rail]")
    const tagline = requireEl<HTMLElement>(root, "[data-ui=pathTagline]")

    const renderRail = (): void => {
      const stations = listStations(this.expanded)
      const world = listWorlds().find((entry) => entry.id === this.expanded)
      if (!world || world.status === "soon" || !isWorldUnlocked(getSave(), world.id)) {
        rail.hidden = true
        rail.innerHTML = ""
        tagline.textContent = "Follow the blossoms. Expand a world to open its stations."
        return
      }
      rail.hidden = false
      tagline.textContent =
        world.id === "w0"
          ? "Two short story beats, then Soft Paws teaches hop in play."
          : "Follow the blossoms. Expand a world to open its stations."
      rail.innerHTML = stations
        .map((station, index) => this.stationButton(station, index))
        .join("")
      for (const station of stations) {
        const btn = rail.querySelector(`[data-station="${station.id}"]`) as HTMLButtonElement | null
        if (!btn || btn.disabled) {
          continue
        }
        btn.onclick = () => this.openStation(station.id)
      }
    }

    const syncNodes = (): void => {
      for (const world of worlds) {
        const btn = root.querySelector(`[data-world="${world.id}"]`) as HTMLButtonElement | null
        if (!btn) {
          continue
        }
        btn.classList.toggle("is-open", this.expanded === world.id)
      }
      renderRail()
    }

    for (const world of worlds) {
      const btn = root.querySelector(`[data-world="${world.id}"]`) as HTMLButtonElement | null
      if (!btn || world.status === "soon") {
        continue
      }
      btn.onclick = () => {
        if (!isWorldUnlocked(getSave(), world.id)) {
          return
        }
        this.expanded = world.id
        syncNodes()
      }
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      this.scene.start("ModeSelect")
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=devReset]").onclick = () => {
      void this.clearStoryProgress()
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=beatContinue]").onclick = () => {
      void this.finishBeat()
    }

    syncNodes()
  }

  private async clearStoryProgress(): Promise<void> {
    const save = getSave()
    save.progress.story.cleared = []
    save.progress.story.checkpoints = {}
    save.progress.story.controlHints = []
    save.progress.story.world = 1
    save.progress.story.level = 1
    await persistSave()
    this.expanded = "w0"
    this.scene.restart()
  }

  private stationButton(station: StoryStation, index: number): string {
    const save = getSave()
    const unlocked = isStationUnlocked(save, station.id)
    const done = isStationCleared(save, station.id)
    const kindLabel =
      station.kind === "lore" ? "Story" : station.kind === "controls" ? "Controls" : "Level"
    const label = station.soon
      ? "Soon"
      : done
        ? "Done"
        : unlocked
          ? station.kind === "level"
            ? "Open"
            : "Read"
          : "Locked"
    return `
      <button type="button" class="story-path-station" data-station="${station.id}" ${unlocked ? "" : "disabled"}>
        <span class="idx">${index + 1}</span>
        <span class="copy">
          <strong>${station.title}${done ? " ✓" : ""}${station.soon ? " · Soon" : ""}</strong>
          <span>${station.soon ? "Coming soon" : `${kindLabel} · ${station.blurb}`}</span>
        </span>
        <span class="bm-eyebrow">${label}</span>
      </button>
    `
  }

  private openStation(stationId: string): void {
    const station = getStation(stationId)
    if (!station || !isStationUnlocked(getSave(), station.id)) {
      return
    }
    if (station.kind === "level" && station.levelId && !station.soon) {
      this.scene.start("Story", { levelId: station.levelId })
      return
    }
    this.showBeat(station)
  }

  private showBeat(station: StoryStation): void {
    if (!this.beatRoot) {
      return
    }
    this.beatRoot.dataset.stationId = station.id
    requireEl(this.beatRoot, "[data-ui=beatEyebrow]").textContent =
      station.kind === "controls" ? "Controls" : "World 0"
    requireEl(this.beatRoot, "[data-ui=beatTitle]").textContent = station.title
    requireEl(this.beatRoot, "[data-ui=beatBody]").innerHTML = station.lines
      .map((line) => `<p>${line}</p>`)
      .join("")
    this.beatRoot.hidden = false
  }

  private async finishBeat(): Promise<void> {
    if (!this.beatRoot) {
      return
    }
    const stationId = this.beatRoot.dataset.stationId
    this.beatRoot.hidden = true
    if (!stationId) {
      return
    }
    const save = getSave()
    if (!save.progress.story.cleared.includes(stationId)) {
      save.progress.story.cleared.push(stationId)
      await persistSave()
    }
    this.scene.restart()
  }
}
