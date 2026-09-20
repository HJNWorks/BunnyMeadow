import Phaser from "phaser"
import { getSave, persistSave } from "../../core/session"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"
import {
  chapterOfWorld,
  defaultExpandedWorld,
  getStation,
  isChapterUnlocked,
  isStationCleared,
  isStationUnlocked,
  isWorldUnlocked,
  listChapters,
  listStations,
  listWorlds,
  worldClearCount,
  type StoryChapterId,
  type StoryStation,
  type StoryWorldId,
} from "./path"
import { mountStoryMapArt } from "./mapArt"

const PATH_CSS = `
.story-path-shell { max-width: 1100px; }
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
.story-path-frame.is-art {
  aspect-ratio: 1672 / 941;
  min-height: 0;
  border-color: #3d456088;
  background: var(--bm-bg);
}
.story-path-frame.is-art .story-path-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  z-index: 0;
}
.story-path-frame.is-art:not(.is-art-ready) .story-path-art,
.story-path-frame.is-art:not(.is-art-ready) .story-path-node {
  visibility: hidden;
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
.story-path-frame.is-art .story-path-node {
  min-width: 96px;
  max-width: 124px;
  padding: 7px 9px;
  border-radius: 14px;
  background: #fffaf0f5;
  box-shadow: 0 6px 16px #14203355;
}
.story-path-frame.is-art .story-path-node strong { font-size: 12px; }
.story-path-frame.is-art .story-path-node span { font-size: 10px; }
.story-path-frame.is-art .story-path-node .story-path-badge { font-size: 9px; margin-top: 4px; }
.story-path-node strong { display:block; font-size: 14px; margin-bottom: 2px; }
.story-path-node span { display:block; font-size: 11px; color: #71816e; line-height: 1.3; }
.story-path-node .story-path-badge {
  display:inline-block; margin-top:6px; font-size:10px; font-weight:700;
  letter-spacing:0.04em; text-transform:uppercase; color:#34583e;
}
.story-path-node.is-soon { opacity: 0.72; cursor: default; }
.story-path-node.is-locked { opacity: 0.72; }
.story-path-node.is-open { border-color: #34583e; box-shadow: 0 0 0 2px #34583e33; }
.story-path-frame.is-art .story-path-node.is-open {
  border-color: #f0c35a;
  box-shadow: 0 0 0 2px #f0c35a66;
}
.story-path-chapters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 8px 0 0;
}
.story-path-chapter {
  border-radius: 14px;
  border: 1px solid #a7b38f;
  background: #fffaf0ee;
  color: #304c39;
  font: inherit;
  padding: 8px 12px;
  cursor: pointer;
}
.story-path-chapter.is-on { border-color: #34583e; box-shadow: 0 0 0 2px #34583e33; }
.story-path-chapter.is-locked,
.story-path-chapter.is-soon { opacity: 0.55; cursor: default; }
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
  private chapter: StoryChapterId = "ch1"
  private beatRoot: HTMLElement | null = null

  constructor() {
    super("WorldMap")
  }

  create(data?: { chapter?: StoryChapterId }): void {
    getAudio().playMusic("menu")
    const save = getSave()
    const suggested = defaultExpandedWorld(save)
    this.chapter = data?.chapter ?? chapterOfWorld(suggested)
    if (!isChapterUnlocked(save, this.chapter)) {
      this.chapter = "ch1"
    }
    const worlds = listWorlds(this.chapter)
    const inChapter = worlds.find((world) => world.id === suggested)
    this.expanded = inChapter ? suggested : (worlds[0]?.id ?? "w0")

    const nodes = worlds
      .map((world) => {
        const unlocked = isWorldUnlocked(save, world.id)
        const counts = worldClearCount(save, world.id)
        const soon = world.status === "soon"
        const open = this.expanded === world.id
        const badge = soon
          ? t("common.soon")
          : unlocked
            ? counts.total > 0
              ? `${counts.done}/${counts.total}`
              : t("common.open")
            : t("common.locked")
        return `
          <button type="button"
            class="story-path-node${soon ? " is-soon" : ""}${!unlocked && !soon ? " is-locked" : ""}${open ? " is-open" : ""}"
            style="left:${world.x}%; top:${world.y}%"
            data-world="${world.id}"
            ${soon ? "disabled" : ""}>
            <strong>${t(`story.world.${world.id}.title`)}</strong>
            <span>${t(`story.world.${world.id}.tagline`)}</span>
            <em class="story-path-badge">${badge}</em>
          </button>
        `
      })
      .join("")

    const chapterChips = listChapters()
      .map((chapter) => {
        const unlocked = isChapterUnlocked(save, chapter.id)
        const soon = chapter.status === "soon"
        const on = this.chapter === chapter.id
        const locked = !soon && !unlocked
        return `
          <button type="button"
            class="story-path-chapter${on ? " is-on" : ""}${locked ? " is-locked" : ""}${soon ? " is-soon" : ""}"
            data-chapter="${chapter.id}"
            ${soon || locked ? "disabled" : ""}>
            ${t(`story.chapter.${chapter.id}.title`)}
          </button>
        `
      })
      .join("")

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell bm-wide story-path-shell">
        <div class="bm-eyebrow">${t("story.path.eyebrow")}</div>
        <h1>${t(`story.path.title.${this.chapter}`)}</h1>
        <p class="bm-tagline" data-ui="pathTagline">${t(`story.path.tagline.${this.chapter}`)}</p>
        <div class="story-path-chapters">${chapterChips}</div>
        <div class="story-path-frame is-art" data-ui="frame">
          ${nodes}
        </div>
        <div class="story-path-rail" data-ui="rail"></div>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.modes")}</button>
          <button type="button" class="bm-btn ghost story-path-dev" data-ui="devReset">${t("story.path.devReset")}</button>
        </div>
      </div>
      <div class="story-beat" data-ui="beat" hidden>
        <div class="story-beat-card">
          <div class="bm-eyebrow" data-ui="beatEyebrow">${t("story.path.kind.lore")}</div>
          <h2 data-ui="beatTitle"></h2>
          <div data-ui="beatBody"></div>
          <button type="button" class="bm-btn warm" data-ui="beatContinue">${t("common.continue")}</button>
        </div>
      </div>
      <style>${PATH_CSS}</style>
      `,
    )

    this.beatRoot = requireEl<HTMLElement>(root, "[data-ui=beat]")
    const frame = requireEl<HTMLElement>(root, "[data-ui=frame]")
    mountStoryMapArt(frame, this.chapter)
    const rail = requireEl<HTMLElement>(root, "[data-ui=rail]")
    const tagline = requireEl<HTMLElement>(root, "[data-ui=pathTagline]")

    const renderRail = (): void => {
      const stations = listStations(this.expanded)
      const world = worlds.find((entry) => entry.id === this.expanded)
      if (!world || world.status === "soon" || !isWorldUnlocked(getSave(), world.id)) {
        rail.hidden = true
        rail.innerHTML = ""
        tagline.textContent = t(`story.path.tagline.${this.chapter}`)
        return
      }
      rail.hidden = false
      tagline.textContent =
        world.id === "w0" ? t("story.path.taglineW0") : t(`story.path.tagline.${this.chapter}`)
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
        getAudio().playSfx("confirm")
        this.expanded = world.id
        syncNodes()
      }
    }

    for (const chapter of listChapters()) {
      const btn = root.querySelector(`[data-chapter="${chapter.id}"]`) as HTMLButtonElement | null
      if (!btn || btn.disabled) {
        continue
      }
      btn.onclick = () => {
        if (chapter.id === this.chapter) {
          return
        }
        getAudio().playSfx("confirm")
        this.scene.start("WorldMap", { chapter: chapter.id })
      }
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("ModeSelect")
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=devReset]").onclick = () => {
      getAudio().playSfx("confirm")
      void this.clearStoryProgress()
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=beatContinue]").onclick = () => {
      getAudio().playSfx("confirm")
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
    this.scene.start("WorldMap", { chapter: "ch1" })
  }

  private stationButton(station: StoryStation, index: number): string {
    const save = getSave()
    const unlocked = isStationUnlocked(save, station.id)
    const done = isStationCleared(save, station.id)
    const kindLabel =
      station.kind === "lore"
        ? t("story.path.kind.lore")
        : station.kind === "controls"
          ? t("story.path.kind.controls")
          : t("story.path.kind.level")
    const label = station.soon
      ? t("common.soon")
      : done
        ? t("common.done")
        : unlocked
          ? station.kind === "level"
            ? t("common.open")
            : t("common.read")
          : t("common.locked")
    const blurb = t(`story.station.${station.id}.blurb`)
    const titleKey = station.levelId ? `story.level.${station.levelId}.name` : `story.station.${station.id}.title`
    const shownTitle = t(titleKey)
    return `
      <button type="button" class="story-path-station" data-station="${station.id}" ${unlocked ? "" : "disabled"}>
        <span class="idx">${index + 1}</span>
        <span class="copy">
          <strong>${shownTitle}${done ? " ✓" : ""}${station.soon ? ` · ${t("common.soon")}` : ""}</strong>
          <span>${station.soon ? t("mode.soon") : `${kindLabel} · ${station.levelId ? t(`story.level.${station.levelId}.objective`) : blurb}`}</span>
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
    getAudio().playSfx("confirm")
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
      station.kind === "controls" ? t("story.path.kind.controls") : t("story.world.w0.title")
    requireEl(this.beatRoot, "[data-ui=beatTitle]").textContent = t(`story.station.${station.id}.title`)
    requireEl(this.beatRoot, "[data-ui=beatBody]").innerHTML = [0, 1]
      .map((index) => t(`story.station.${station.id}.line${index}`))
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
