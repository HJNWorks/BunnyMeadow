import Phaser from "phaser"
import type { AssembledDecor, AssembledHazard, AssembledLevel, AssembledRect } from "../../../systems/ChunkAssembler"
import { t } from "../../../core/i18n"
import { getAudio } from "../../../core/audio"
import { mountDomShell, requireEl } from "../../../ui/DomShell"
import { placeBelowStoryChrome, watchStoryChrome } from "../../../ui/playfieldFrame"
import { writeRepoFile } from "../../../core/devWrite"
import { downloadEditorJson, buildExportBundle } from "./exportJson"
import type { MoonPoolDef, StoryLevelDef } from "../levels"
import { cloneMoonPool } from "../levels"
import type { MoverState } from "../shared/moversHazards"
import {
  ensureOverlay,
  overlayPools,
  setOverlay,
  snap10,
  worldToAnchor,
  type EditorPickup,
} from "./overlayStore"
import { defaultDecor, DECOR_LABELS, PLATFORM_ASSETS } from "./placeables"
import { listBreakProfiles } from "../shared/breakables"
import type { BreakSpec } from "../../../systems/ChunkAssembler"
import {
  editorChapterForLevel,
  editorWorldIdForLevel,
  listEditorWorldIndex,
  setLastEditorStation,
  additionSelectHtml,
  inspectEnemySelectHtml,
  inspectItemSelectHtml,
  parseKitToken,
  stationsForWorld,
  type EditorWorldId,
} from "./worldIndex"
import { listChapters, type StoryChapterId } from "../path"
import {
  getPalette,
  listPaletteIds,
  PALETTE_HOURS,
  WEATHER_PRESETS,
  type PaletteHour,
  type WeatherPreset,
} from "../shared/themeKit"
import { applyContactBody, EXIT_CONTACT, POOL_CONTACT } from "../shared/contactBodies"

export type EditorMode = "play" | "build"

export type EditorSession = {
  scene: Phaser.Scene
  level: StoryLevelDef
  world: AssembledLevel
  player: Phaser.Physics.Arcade.Sprite
  moonPools: Phaser.GameObjects.Image[]
  exitZone: Phaser.GameObjects.Image
  platforms: Phaser.Physics.Arcade.StaticGroup
  movers: MoverState[]
  enemies: Phaser.Physics.Arcade.Group
  pickups: Phaser.Physics.Arcade.StaticGroup
  decor: Phaser.GameObjects.Image[]
  waters: Phaser.GameObjects.Rectangle[]
  env: string
  mode: EditorMode
}

type SelKind = "spawn" | "pool" | "exit" | "platform" | "mover" | "enemy" | "pickup" | "decor" | "hazard"

type Selection = { kind: SelKind; index: number }

type ClipRow = { kind: SelKind; snap: unknown; x: number; y: number }

const COPY_SHIFT = 40

let editorClip: ClipRow[] = []

const CSS = `
.bm-root.bm-editor-hud {
  background: transparent;
  pointer-events: none;
  overflow: visible;
  z-index: 70;
}
.bm-editor-hud .bm-editor-top,
.bm-editor-hud .bm-editor-bar {
  pointer-events: auto;
  background: linear-gradient(180deg, #f7f3e8f0, #ebe4d4e6);
  border: 1px solid #d5dcc4;
  border-radius: 14px;
  box-shadow: 0 8px 18px #2a3d2412;
}
.bm-editor-hud .bm-editor-top {
  position: fixed;
  left: 12px;
  right: 12px;
  top: 8px;
  z-index: 72;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6px 10px;
  overflow: visible;
}
.bm-editor-hud .bm-editor-top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
}
.bm-editor-hud .bm-editor-top label {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  gap: 2px;
  color: #71816e;
}
.bm-editor-hud .bm-editor-top select {
  width: 148px;
  font-size: 13px;
  background: #fff;
  border: 1px solid #d5dcc4;
  border-radius: 8px;
  padding: 4px 8px;
  color: #304c39;
  min-height: 28px;
}
.bm-editor-hud .bm-editor-top select.wide {
  width: 168px;
}
.bm-editor-hud .bm-editor-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 6px;
  flex: 1 1 280px;
}
.bm-editor-hud .bm-editor-hint {
  flex: 1 1 120px;
  font-size: 12px;
  color: #304c39;
  min-height: 28px;
  display: flex;
  align-items: center;
}
.bm-editor-hud .bm-editor-top .bm-btn {
  padding: 5px 12px;
  font-size: 13px;
  border-radius: 999px;
}
.bm-editor-hud .bm-editor-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 72;
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.bm-editor-hud .bm-editor-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: flex-end;
}
.bm-editor-hud .bm-editor-menu-panel label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 2px;
}
.bm-editor-hud .bm-editor-menu-panel label[hidden] {
  display: none;
}
.bm-editor-hud .bm-editor-menu-panel input,
.bm-editor-hud .bm-editor-menu-panel select,
.bm-editor-hud .bm-editor-menu-panel textarea {
  width: 88px;
}
.bm-editor-hud .bm-editor-menu-panel input.wide,
.bm-editor-hud .bm-editor-menu-panel select.wide,
.bm-editor-hud .bm-editor-menu-panel textarea.wide {
  width: 160px;
}
.bm-editor-hud .bm-editor-menu-panel textarea.wide {
  min-height: 52px;
  resize: vertical;
  font: 13px Georgia, "Times New Roman", serif;
}
.bm-editor-hud .bm-editor-menu-panel input.range {
  width: 120px;
}
.bm-editor-hud .bm-editor-flag {
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}
.bm-editor-hud .bm-btn[aria-pressed="true"],
.bm-editor-hud .bm-btn[aria-expanded="true"] {
  outline: 2px solid #34583e;
}
.bm-editor-hud .bm-editor-menu {
  position: relative;
}
.bm-editor-hud .bm-editor-menu-panel {
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  bottom: auto;
  z-index: 80;
  min-width: 260px;
  max-width: min(92vw, 520px);
  max-height: min(48vh, 420px);
  overflow: auto;
  background: #f7f3e8;
  border: 1px solid #d5dcc4;
  border-radius: 12px;
  box-shadow: 0 8px 18px #2a3d2420;
  padding: 8px;
}
.bm-editor-hud .bm-editor-menu-panel.look {
  min-width: 420px;
}
.bm-editor-hud .bm-editor-menu-panel details {
  margin-bottom: 6px;
}
.bm-editor-hud .bm-editor-menu-panel summary {
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #34583e;
}
.bm-editor-hud .bm-editor-add-item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: #304c39;
  font: 13px system-ui, sans-serif;
  padding: 4px 6px;
  border-radius: 8px;
  cursor: pointer;
}
.bm-editor-hud .bm-editor-add-item:hover {
  background: #e8eed8;
}
`

function hitSprite(wx: number, wy: number, go: Phaser.GameObjects.GameObject, pad = 14): boolean {
  const image = go as Phaser.GameObjects.Image
  const rw = Math.max(22, image.displayWidth * 0.55 + pad)
  const rh = Math.max(22, image.displayHeight * 0.55 + pad)
  return Math.abs(wx - image.x) <= rw && Math.abs(wy - image.y) <= rh
}

function hitRect(x: number, y: number, rect: AssembledRect): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
}

function refreshBody(go: Phaser.GameObjects.GameObject): void {
  const body = (go as Phaser.Physics.Arcade.Sprite).body as
    | Phaser.Physics.Arcade.Body
    | Phaser.Physics.Arcade.StaticBody
    | null
  if (body && "updateFromGameObject" in body) {
    body.updateFromGameObject()
  }
}

function platformObject(
  group: Phaser.Physics.Arcade.StaticGroup,
  index: number,
): Phaser.GameObjects.GameObject | undefined {
  return group.getChildren().find((child) => child.getData("editIndex") === index)
}

export function mountBuildHud(session: EditorSession): void {
  const overlay = ensureOverlay(session.level, session.world)
  const addMenus = additionSelectHtml()
  const { root } = mountDomShell(
    session.scene,
    `
    <div class="bm-editor-top" data-ui="topBar">
      <div class="bm-editor-top-row">
        <label>${t("editor.chapter")}
          <select data-ui="chapterId"></select>
        </label>
        <label>${t("editor.world")}
          <select data-ui="worldId"></select>
        </label>
        <label>${t("editor.station")}
          <select data-ui="stationId"></select>
        </label>
        <div class="bm-editor-tools" data-ui="inspect" ${session.mode === "build" ? "" : "hidden"}>
          <label>${t("editor.addEnv")}
            <select data-ui="envAdd" class="wide">${addMenus.env}</select>
          </label>
          <label>${t("editor.addCreatures")}
            <select data-ui="critterAdd" class="wide">${addMenus.creatures}</select>
          </label>
          <div class="bm-editor-menu">
            <button type="button" class="bm-btn ghost" data-ui="selPanelBtn" aria-expanded="false">${t("editor.section.edit")}</button>
            <div class="bm-editor-menu-panel" data-ui="selPanel" hidden>
              <div class="bm-editor-fields">
                <label>${t("editor.sel.mode")}
                  <select data-ui="selMode" class="wide">
                    <option value="pick">${t("editor.sel.object")}</option>
                    <option value="region">${t("editor.sel.region")}</option>
                  </select>
                </label>
                <label>${t("editor.field.x")} <input data-ui="x" type="number" step="10" /></label>
                <label>${t("editor.field.y")} <input data-ui="y" type="number" step="10" /></label>
                <label>${t("editor.field.w")} <input data-ui="w" type="number" step="10" /></label>
                <label>${t("editor.field.h")} <input data-ui="h" type="number" step="10" /></label>
                <label>${t("editor.field.rot")} <input data-ui="rot" type="number" step="5" /></label>
                <label>${t("editor.field.asset")}
                  <select data-ui="asset" class="wide"></select>
                </label>
                <label>${t("editor.field.id")}
                  <select data-ui="id" class="wide"></select>
                </label>
                <label>${t("editor.field.current")} <input data-ui="current" type="number" step="10" /></label>
                <label class="bm-editor-flag" data-ui="breakLabel">
                  <input type="checkbox" data-ui="breakOn" /> ${t("editor.field.break")}
                </label>
                <label data-ui="breakProfileLabel">${t("editor.field.breakProfile")}
                  <select data-ui="breakProfile" class="wide"></select>
                </label>
                <label data-ui="poolLineLabel">${t("editor.poolLine")}
                  <textarea data-ui="poolLine" class="wide" rows="2"></textarea>
                </label>
              </div>
            </div>
          </div>
          <div class="bm-editor-menu">
            <button type="button" class="bm-btn ghost" data-ui="lookPanelBtn" aria-expanded="false">${t("editor.section.look")}</button>
            <div class="bm-editor-menu-panel look" data-ui="lookPanel" hidden>
              <div class="bm-editor-fields">
                <label>${t("editor.look.env")}
                  <select data-ui="lookEnv" class="wide"></select>
                </label>
                <label>${t("editor.look.sky")} <input data-ui="lookSky" type="text" class="wide" /></label>
                <label>${t("editor.look.far")} <input data-ui="lookFar" type="text" class="wide" /></label>
                <label>${t("editor.look.fog")} <input data-ui="lookFog" type="text" class="wide" /></label>
                <label>${t("editor.look.hour")}
                  <select data-ui="lookHour" class="wide"></select>
                </label>
                <label>${t("editor.look.weather")}
                  <select data-ui="lookWeather" class="wide"></select>
                </label>
                <label class="bm-editor-flag"><input type="checkbox" data-ui="lookNight" /> ${t("editor.look.night")}</label>
                <label>${t("editor.look.nightAmt")} <input data-ui="lookNightAmt" class="range" type="range" min="8" max="80" step="4" /></label>
                <label class="bm-editor-flag"><input type="checkbox" data-ui="lookHaze" /> ${t("editor.look.haze")}</label>
                <label class="bm-editor-flag"><input type="checkbox" data-ui="lookGlow" /> ${t("editor.look.glow")}</label>
                <label class="bm-editor-flag"><input type="checkbox" data-ui="lookLowG" /> ${t("editor.look.lowG")}</label>
                <label>${t("editor.mapWidth")} <input data-ui="mapWidth" type="number" step="10" min="480" /></label>
              </div>
            </div>
          </div>
          <span class="bm-editor-hint" data-ui="hint">${t("editor.selected.none")}</span>
          <button type="button" class="bm-btn ghost" data-ui="undo">${t("editor.undo")}</button>
          <button type="button" class="bm-btn ghost" data-ui="copy">${t("editor.copy")}</button>
          <button type="button" class="bm-btn ghost" data-ui="delete">${t("editor.delete")}</button>
        </div>
      </div>
    </div>
    <div class="bm-editor-bar">
      <button type="button" class="bm-btn" data-ui="play" aria-pressed="${session.mode === "play"}">${t("editor.play")}</button>
      <button type="button" class="bm-btn" data-ui="build" aria-pressed="${session.mode === "build"}">${t("editor.build")}</button>
      <button type="button" class="bm-btn warm" data-ui="setActive">${t("editor.setActive")}</button>
      <button type="button" class="bm-btn ghost" data-ui="copyJson">${t("editor.copyJson")}</button>
      <button type="button" class="bm-btn ghost" data-ui="back">${t("editor.back")}</button>
      <span data-ui="status"></span>
    </div>
    `,
    { keepCanvas: true, rootClass: "bm-editor-hud" },
  )

  const style = document.createElement("style")
  style.textContent = CSS
  document.head.appendChild(style)
  session.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => style.remove())
  session.scene.events.once(Phaser.Scenes.Events.DESTROY, () => style.remove())

  const inspect = requireEl<HTMLElement>(root, "[data-ui=inspect]")
  const hint = requireEl<HTMLElement>(root, "[data-ui=hint]")
  const xInput = requireEl<HTMLInputElement>(root, "[data-ui=x]")
  const yInput = requireEl<HTMLInputElement>(root, "[data-ui=y]")
  const wInput = requireEl<HTMLInputElement>(root, "[data-ui=w]")
  const hInput = requireEl<HTMLInputElement>(root, "[data-ui=h]")
  const rotInput = requireEl<HTMLInputElement>(root, "[data-ui=rot]")
  const assetInput = requireEl<HTMLSelectElement>(root, "[data-ui=asset]")
  const idInput = requireEl<HTMLSelectElement>(root, "[data-ui=id]")
  const currentInput = requireEl<HTMLInputElement>(root, "[data-ui=current]")
  const breakOn = requireEl<HTMLInputElement>(root, "[data-ui=breakOn]")
  const breakProfile = requireEl<HTMLSelectElement>(root, "[data-ui=breakProfile]")
  const breakLabel = requireEl<HTMLElement>(root, "[data-ui=breakLabel]")
  const breakProfileLabel = requireEl<HTMLElement>(root, "[data-ui=breakProfileLabel]")
  const poolLineEl = requireEl<HTMLTextAreaElement>(root, "[data-ui=poolLine]")
  const poolLineLabel = requireEl<HTMLElement>(root, "[data-ui=poolLineLabel]")
  const lookEnv = requireEl<HTMLSelectElement>(root, "[data-ui=lookEnv]")
  const lookSky = requireEl<HTMLInputElement>(root, "[data-ui=lookSky]")
  const lookHour = requireEl<HTMLSelectElement>(root, "[data-ui=lookHour]")
  const lookWeather = requireEl<HTMLSelectElement>(root, "[data-ui=lookWeather]")
  const lookNight = requireEl<HTMLInputElement>(root, "[data-ui=lookNight]")
  const lookNightAmt = requireEl<HTMLInputElement>(root, "[data-ui=lookNightAmt]")
  const lookHaze = requireEl<HTMLInputElement>(root, "[data-ui=lookHaze]")
  const lookGlow = requireEl<HTMLInputElement>(root, "[data-ui=lookGlow]")
  const lookLowG = requireEl<HTMLInputElement>(root, "[data-ui=lookLowG]")
  const lookFar = requireEl<HTMLInputElement>(root, "[data-ui=lookFar]")
  const lookFog = requireEl<HTMLInputElement>(root, "[data-ui=lookFog]")
  const mapWidthInput = requireEl<HTMLInputElement>(root, "[data-ui=mapWidth]")
  const statusEl = requireEl<HTMLElement>(root, "[data-ui=status]")
  const chapterIdEl = requireEl<HTMLSelectElement>(root, "[data-ui=chapterId]")
  const worldIdEl = requireEl<HTMLSelectElement>(root, "[data-ui=worldId]")
  const stationIdEl = requireEl<HTMLSelectElement>(root, "[data-ui=stationId]")
  const envAdd = requireEl<HTMLSelectElement>(root, "[data-ui=envAdd]")
  const critterAdd = requireEl<HTMLSelectElement>(root, "[data-ui=critterAdd]")
  const selModeEl = requireEl<HTMLSelectElement>(root, "[data-ui=selMode]")
  const selPanelBtn = requireEl<HTMLButtonElement>(root, "[data-ui=selPanelBtn]")
  const lookPanelBtn = requireEl<HTMLButtonElement>(root, "[data-ui=lookPanelBtn]")
  const selPanel = requireEl<HTMLElement>(root, "[data-ui=selPanel]")
  const lookPanel = requireEl<HTMLElement>(root, "[data-ui=lookPanel]")
  const topBar = requireEl<HTMLElement>(root, "[data-ui=topBar]")
  const undoBtn = requireEl<HTMLButtonElement>(root, "[data-ui=undo]")
  const copyBtn = requireEl<HTMLButtonElement>(root, "[data-ui=copy]")
  const deleteBtn = requireEl<HTMLButtonElement>(root, "[data-ui=delete]")

  const marks = session.scene.add.graphics().setDepth(30)
  let selected: Selection | null = null
  let group: Selection[] = []
  let groupBaseline: { sel: Selection; snap: unknown }[] = []
  let groupStarts: { sel: Selection; x: number; y: number }[] = []
  let baseline: { sel: Selection; snap: unknown } | null = null
  let dragging: Selection | null = null
  let draggingGroup = false
  let grabX = 0
  let grabY = 0
  let dragOriginX = 0
  let dragOriginY = 0
  let panning = false
  let panX = 0
  let panY = 0
  let panScrollX = 0
  let panScrollY = 0
  let marquee: { x0: number; y0: number; x1: number; y1: number } | null = null

  overlay.decor = overlay.decor ?? []
  overlay.hazards = overlay.hazards ?? []
  overlay.look = overlay.look ?? { env: session.env }
  overlay.moonPools = overlayPools(overlay)

  lookEnv.innerHTML = listPaletteIds()
    .map((id) => `<option value="${id}">${id}</option>`)
    .join("")
  lookHour.innerHTML = PALETTE_HOURS.map((id) => `<option value="${id}">${id}</option>`).join("")
  lookWeather.innerHTML = WEATHER_PRESETS.map((id) => `<option value="${id}">${id}</option>`).join("")
  assetInput.innerHTML = PLATFORM_ASSETS.map((id) => `<option value="${id}">${id}</option>`).join("")
  breakProfile.innerHTML = listBreakProfiles()
    .map((id) => `<option value="${id}">${id}</option>`)
    .join("")

  const persist = (): void => {
    setOverlay(session.level.id, overlay)
  }

  const breakHost = (sel: Selection): { break?: BreakSpec } | null => {
    if (sel.kind === "platform") {
      return overlay.platforms[sel.index] ?? null
    }
    if (sel.kind === "mover") {
      return overlay.movers[sel.index] ?? null
    }
    if (sel.kind === "decor") {
      return overlay.decor?.[sel.index] ?? null
    }
    return null
  }

  const fillBreak = (host: { break?: BreakSpec } | null, can: boolean): void => {
    breakOn.disabled = !can
    breakProfile.disabled = !can || !breakOn.checked
    breakLabel.hidden = !can
    breakProfileLabel.hidden = !can
    if (!can) {
      breakOn.checked = false
      return
    }
    breakOn.checked = Boolean(host?.break)
    breakProfile.value = host?.break?.profile ?? "stone"
    breakProfile.disabled = !breakOn.checked
  }

  const writeBreak = (host: { break?: BreakSpec }): void => {
    if (!breakOn.checked) {
      delete host.break
      return
    }
    host.break = { profile: breakProfile.value || "stone" }
  }

  const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

  const poolAt = (index: number): MoonPoolDef | undefined => overlay.moonPools?.[index]

  const poolWorld = (pool: MoonPoolDef): { x: number; y: number } => {
    const origin = session.world.chunkOrigins[pool.chunk] ?? 0
    return { x: origin + pool.x, y: pool.y }
  }

  const sameSel = (a: Selection | null, b: Selection | null): boolean =>
    Boolean(a && b && a.kind === b.kind && a.index === b.index)

  const inGroup = (hit: Selection): boolean => group.some((item) => sameSel(item, hit))

  const selOrigin = (sel: Selection): { x: number; y: number } => {
    if (sel.kind === "spawn") {
      return { x: overlay.playerSpawn.x, y: overlay.playerSpawn.y }
    }
    if (sel.kind === "pool") {
      const pool = poolAt(sel.index)
      if (pool) {
        return poolWorld(pool)
      }
      return { x: 0, y: 0 }
    }
    if (sel.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      return { x: origin + overlay.exit.x, y: overlay.exit.y }
    }
    if (sel.kind === "platform") {
      const rect = overlay.platforms[sel.index]
      return { x: rect?.x ?? 0, y: rect?.y ?? 0 }
    }
    if (sel.kind === "mover") {
      const mover = overlay.movers[sel.index]
      return { x: mover?.worldX ?? 0, y: mover?.worldY ?? 0 }
    }
    if (sel.kind === "enemy") {
      const enemy = overlay.enemies[sel.index]
      return { x: enemy?.worldX ?? 0, y: enemy?.worldY ?? 0 }
    }
    if (sel.kind === "pickup") {
      const pickup = overlay.pickups[sel.index]
      return { x: pickup?.worldX ?? 0, y: pickup?.worldY ?? 0 }
    }
    if (sel.kind === "decor") {
      const item = overlay.decor?.[sel.index]
      return { x: item?.x ?? 0, y: item?.y ?? 0 }
    }
    const item = overlay.hazards?.[sel.index]
    return { x: item?.worldX ?? 0, y: item?.worldY ?? 0 }
  }

  const aabbOf = (sel: Selection): { x: number; y: number; w: number; h: number } | null => {
    if (sel.kind === "spawn") {
      return { x: overlay.playerSpawn.x - 28, y: overlay.playerSpawn.y - 28, w: 56, h: 56 }
    }
    if (sel.kind === "pool") {
      const pool = poolAt(sel.index)
      if (pool) {
        const at = poolWorld(pool)
        return { x: at.x - 36, y: at.y - 36, w: 72, h: 72 }
      }
      return null
    }
    if (sel.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      return { x: origin + overlay.exit.x - 48, y: overlay.exit.y - 48, w: 96, h: 96 }
    }
    if (sel.kind === "platform") {
      const rect = overlay.platforms[sel.index]
      return rect ? { x: rect.x, y: rect.y, w: rect.w, h: rect.h } : null
    }
    if (sel.kind === "mover") {
      const mover = overlay.movers[sel.index]
      return mover ? { x: mover.worldX, y: mover.worldY, w: mover.w, h: mover.h } : null
    }
    if (sel.kind === "enemy") {
      const enemy = overlay.enemies[sel.index]
      return enemy ? { x: enemy.worldX - 26, y: enemy.worldY - 26, w: 52, h: 52 } : null
    }
    if (sel.kind === "pickup") {
      const pickup = overlay.pickups[sel.index]
      return pickup ? { x: pickup.worldX - 22, y: pickup.worldY - 22, w: 44, h: 44 } : null
    }
    if (sel.kind === "decor") {
      const item = overlay.decor?.[sel.index]
      return item ? { x: item.x, y: item.y, w: item.w, h: item.h } : null
    }
    const item = overlay.hazards?.[sel.index]
    return item ? { x: item.worldX, y: item.worldY, w: item.w, h: item.h } : null
  }

  const aabbOverlap = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ): boolean =>
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

  const listAllSels = (): Selection[] => {
    const out: Selection[] = [
      { kind: "spawn", index: 0 },
      { kind: "exit", index: 0 },
    ]
    ;(overlay.moonPools ?? []).forEach((_, index) => out.push({ kind: "pool", index }))
    overlay.platforms.forEach((_, index) => out.push({ kind: "platform", index }))
    overlay.movers.forEach((_, index) => out.push({ kind: "mover", index }))
    overlay.enemies.forEach((_, index) => out.push({ kind: "enemy", index }))
    overlay.pickups.forEach((_, index) => out.push({ kind: "pickup", index }))
    ;(overlay.decor ?? []).forEach((_, index) => out.push({ kind: "decor", index }))
    ;(overlay.hazards ?? []).forEach((_, index) => out.push({ kind: "hazard", index }))
    return out
  }

  const pickInRect = (box: { x: number; y: number; w: number; h: number }): Selection[] =>
    listAllSels().filter((sel) => {
      const aabb = aabbOf(sel)
      return aabb ? aabbOverlap(aabb, box) : false
    })

  const captureItem = (sel: Selection): unknown | null => {
    if (sel.kind === "spawn") {
      return cloneJson(overlay.playerSpawn)
    }
    if (sel.kind === "pool") {
      const pool = poolAt(sel.index)
      return pool ? cloneMoonPool(pool) : null
    }
    if (sel.kind === "exit") {
      return cloneJson(overlay.exit)
    }
    if (sel.kind === "platform") {
      const rect = overlay.platforms[sel.index]
      return rect ? cloneJson(rect) : null
    }
    if (sel.kind === "mover") {
      const mover = overlay.movers[sel.index]
      return mover ? cloneJson(mover) : null
    }
    if (sel.kind === "pickup") {
      const pickup = overlay.pickups[sel.index]
      return pickup ? cloneJson(pickup) : null
    }
    if (sel.kind === "decor") {
      const item = overlay.decor?.[sel.index]
      return item ? cloneJson(item) : null
    }
    if (sel.kind === "hazard") {
      const item = overlay.hazards?.[sel.index]
      return item ? cloneJson(item) : null
    }
    const enemy = overlay.enemies[sel.index]
    return enemy ? cloneJson(enemy) : null
  }

  const restoreItem = (sel: Selection, snap: unknown): void => {
    if (sel.kind === "spawn") {
      overlay.playerSpawn = cloneJson(snap as { x: number; y: number })
      return
    }
    if (sel.kind === "pool") {
      overlay.moonPools = overlay.moonPools ?? []
      overlay.moonPools[sel.index] = cloneMoonPool(snap as MoonPoolDef)
      return
    }
    if (sel.kind === "exit") {
      overlay.exit = cloneJson(snap as { chunk: number; x: number; y: number })
      return
    }
    if (sel.kind === "platform") {
      overlay.platforms[sel.index] = cloneJson(snap as (typeof overlay.platforms)[number])
      return
    }
    if (sel.kind === "mover") {
      overlay.movers[sel.index] = cloneJson(snap as (typeof overlay.movers)[number])
      return
    }
    if (sel.kind === "pickup") {
      overlay.pickups[sel.index] = cloneJson(snap as EditorPickup)
      return
    }
    if (sel.kind === "decor" && overlay.decor) {
      overlay.decor[sel.index] = cloneJson(snap as AssembledDecor)
      return
    }
    if (sel.kind === "hazard" && overlay.hazards) {
      overlay.hazards[sel.index] = cloneJson(snap as AssembledHazard)
      return
    }
    overlay.enemies[sel.index] = cloneJson(snap as (typeof overlay.enemies)[number])
  }

  const appendCopy = (kind: SelKind, snap: unknown): Selection | null => {
    if (kind === "spawn" || kind === "exit") {
      return null
    }
    if (kind === "pool") {
      overlay.moonPools = overlay.moonPools ?? []
      overlay.moonPools.push(cloneMoonPool(snap as MoonPoolDef))
      return { kind, index: overlay.moonPools.length - 1 }
    }
    if (kind === "platform") {
      overlay.platforms.push(cloneJson(snap as (typeof overlay.platforms)[number]))
      return { kind, index: overlay.platforms.length - 1 }
    }
    if (kind === "mover") {
      overlay.movers.push(cloneJson(snap as (typeof overlay.movers)[number]))
      return { kind, index: overlay.movers.length - 1 }
    }
    if (kind === "pickup") {
      overlay.pickups.push(cloneJson(snap as EditorPickup))
      return { kind, index: overlay.pickups.length - 1 }
    }
    if (kind === "decor") {
      overlay.decor = overlay.decor ?? []
      overlay.decor.push(cloneJson(snap as AssembledDecor))
      return { kind, index: overlay.decor.length - 1 }
    }
    if (kind === "hazard") {
      overlay.hazards = overlay.hazards ?? []
      overlay.hazards.push(cloneJson(snap as AssembledHazard))
      return { kind, index: overlay.hazards.length - 1 }
    }
    overlay.enemies.push(cloneJson(snap as (typeof overlay.enemies)[number]))
    return { kind: "enemy", index: overlay.enemies.length - 1 }
  }

  const adoptSelection = (hit: Selection): void => {
    group = [{ kind: hit.kind, index: hit.index }]
    const snap = captureItem(hit)
    baseline = snap === null ? null : { sel: { kind: hit.kind, index: hit.index }, snap }
    groupBaseline = baseline ? [baseline] : []
    selected = hit
  }

  const adoptGroup = (hits: Selection[]): void => {
    group = hits.map((hit) => ({ kind: hit.kind, index: hit.index }))
    selected = group[0] ?? null
    groupBaseline = []
    for (const hit of group) {
      const snap = captureItem(hit)
      if (snap !== null) {
        groupBaseline.push({ sel: { kind: hit.kind, index: hit.index }, snap })
      }
    }
    baseline = groupBaseline[0] ?? null
  }

  const syncUndo = (): void => {
    if (group.length > 1) {
      const same =
        groupBaseline.length === group.length &&
        group.every((item, index) => {
          const row = groupBaseline[index]
          return row && sameSel(row.sel, item) && JSON.stringify(captureItem(item)) !== undefined
        })
      undoBtn.disabled = !same || groupBaseline.every((row, index) => {
        const item = group[index]
        return !item || JSON.stringify(captureItem(item)) === JSON.stringify(row.snap)
      })
    } else if (!selected || !baseline || !sameSel(baseline.sel, selected)) {
      undoBtn.disabled = true
    } else {
      undoBtn.disabled = JSON.stringify(captureItem(selected)) === JSON.stringify(baseline.snap)
    }
    const canEdit = group.some(
      (item) => item.kind !== "spawn" && item.kind !== "exit",
    )
    copyBtn.disabled = !canEdit
    deleteBtn.disabled = !canEdit
  }

  const restart = (mode: EditorMode): void => {
    persist()
    session.scene.scene.restart({
      levelId: session.level.id,
      editor: { mode },
    })
  }

  const cameraCenter = (): { x: number; y: number } => {
    const cam = session.scene.cameras.main
    return {
      x: snap10(cam.midPoint.x),
      y: snap10(cam.midPoint.y),
    }
  }

  const syncPlatform = (index: number): void => {
    const rect = overlay.platforms[index]
    const go = platformObject(session.platforms, index)
    if (!rect || !go) {
      return
    }
    const image = go as Phaser.GameObjects.Image
    image.setPosition(rect.x + rect.w / 2, rect.y + rect.h / 2)
    image.setDisplaySize(rect.w, rect.h)
    refreshBody(go)
  }

  const syncMover = (index: number): void => {
    const data = overlay.movers[index]
    const state = session.movers[index]
    if (!data || !state) {
      return
    }
    const cx = data.worldX + data.w / 2
    const cy = data.worldY + data.h / 2
    state.baseX = cx
    state.baseY = cy
    state.amplitude = data.amplitude
    state.speed = data.speed
    state.sprite.setPosition(cx, cy)
    state.sprite.setDisplaySize(data.w, data.h)
    refreshBody(state.sprite)
  }

  const syncEnemy = (index: number): void => {
    const data = overlay.enemies[index]
    const sprite = session.enemies.getChildren().find((child) => child.getData("editIndex") === index) as
      | Phaser.Physics.Arcade.Sprite
      | undefined
    if (!data || !sprite) {
      return
    }
    sprite.setPosition(data.worldX, data.worldY)
    sprite.setData("id", data.id)
    sprite.setData("homeX", data.worldX)
    sprite.setData("homeY", data.worldY)
    refreshBody(sprite)
  }

  const syncOne = (focus: Selection): void => {
    if (focus.kind === "spawn") {
      session.player.setPosition(overlay.playerSpawn.x, overlay.playerSpawn.y)
      refreshBody(session.player)
    } else if (focus.kind === "pool") {
      const pool = poolAt(focus.index)
      const sprite = session.moonPools[focus.index]
      if (pool && sprite) {
        const at = poolWorld(pool)
        sprite.setPosition(at.x, at.y)
        sprite.setData("poolLine", pool.line ?? "")
        applyContactBody(sprite, POOL_CONTACT)
      }
    } else if (focus.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      session.exitZone.setPosition(origin + overlay.exit.x, overlay.exit.y)
      applyContactBody(session.exitZone, EXIT_CONTACT)
    } else if (focus.kind === "platform") {
      syncPlatform(focus.index)
    } else if (focus.kind === "mover") {
      syncMover(focus.index)
    } else if (focus.kind === "enemy") {
      syncEnemy(focus.index)
    } else if (focus.kind === "pickup") {
      const index = focus.index
      const data = overlay.pickups[index]
      const sprite = session.pickups
        .getChildren()
        .find((child) => child.getData("editIndex") === index) as
        | Phaser.GameObjects.Image
        | undefined
      if (data && sprite) {
        sprite.setPosition(data.worldX, data.worldY)
        sprite.setData("itemId", data.id)
        refreshBody(sprite)
      }
    } else if (focus.kind === "decor") {
      const data = overlay.decor?.[focus.index]
      const sprite = session.decor[focus.index]
      if (data && sprite) {
        sprite.setPosition(data.x + data.w / 2, data.y + data.h / 2)
        sprite.setDisplaySize(data.w, data.h)
        sprite.setAngle(data.rotation ?? 0)
      }
    } else if (focus.kind === "hazard") {
      const data = overlay.hazards?.[focus.index]
      const water = session.waters[focus.index]
      if (data && water) {
        water.setPosition(data.worldX + data.w / 2, data.worldY + data.h / 2)
        water.setSize(data.w, data.h)
        water.setDisplaySize(data.w, data.h)
        water.setData("current", data.current ?? 0)
        refreshBody(water)
      }
    }
  }

  const syncSelection = (): void => {
    const items = group.length ? group : selected ? [selected] : []
    for (const item of items) {
      syncOne(item)
    }
  }

  const drawSelMark = (focus: Selection): void => {
    if (focus.kind === "spawn") {
      marks.strokeCircle(overlay.playerSpawn.x, overlay.playerSpawn.y, 28)
    } else if (focus.kind === "pool") {
      const pool = poolAt(focus.index)
      if (pool) {
        const at = poolWorld(pool)
        marks.strokeCircle(at.x, at.y, 36)
      }
    } else if (focus.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      marks.strokeCircle(origin + overlay.exit.x, overlay.exit.y, 48)
    } else if (focus.kind === "platform") {
      const rect = overlay.platforms[focus.index]
      if (rect) {
        marks.strokeRect(rect.x, rect.y, rect.w, rect.h)
      }
    } else if (focus.kind === "mover") {
      const mover = overlay.movers[focus.index]
      if (mover) {
        marks.strokeRect(mover.worldX, mover.worldY, mover.w, mover.h)
      }
    } else if (focus.kind === "enemy") {
      const enemy = overlay.enemies[focus.index]
      if (enemy) {
        marks.strokeCircle(enemy.worldX, enemy.worldY, 26)
      }
    } else if (focus.kind === "pickup") {
      const pickup = overlay.pickups[focus.index]
      if (pickup) {
        marks.strokeCircle(pickup.worldX, pickup.worldY, 22)
      }
    } else if (focus.kind === "decor") {
      const item = overlay.decor?.[focus.index]
      if (item) {
        marks.strokeRect(item.x, item.y, item.w, item.h)
      }
    } else if (focus.kind === "hazard") {
      const item = overlay.hazards?.[focus.index]
      if (item) {
        marks.strokeRect(item.worldX, item.worldY, item.w, item.h)
      }
    }
  }

  const drawMarks = (): void => {
    marks.clear()
    if (marquee) {
      const x = Math.min(marquee.x0, marquee.x1)
      const y = Math.min(marquee.y0, marquee.y1)
      const w = Math.abs(marquee.x1 - marquee.x0)
      const h = Math.abs(marquee.y1 - marquee.y0)
      marks.fillStyle(0xdc854e, 0.16)
      marks.fillRect(x, y, w, h)
      marks.lineStyle(2, 0xdc854e, 1)
      marks.strokeRect(x, y, w, h)
    }
    const items = group.length ? group : selected ? [selected] : []
    if (!items.length && !marquee) {
      return
    }
    marks.lineStyle(2, 0xdc854e, 1)
    for (const item of items) {
      drawSelMark(item)
    }
  }

  const fillIdSelect = (kind: "enemy" | "pickup"): void => {
    if (kind === "enemy") {
      idInput.innerHTML = inspectEnemySelectHtml()
      return
    }
    idInput.innerHTML = inspectItemSelectHtml()
  }

  const fillLook = (): void => {
    lookEnv.value = overlay.look?.env ?? session.env
    const pal = getPalette(lookEnv.value)
    lookSky.value = overlay.look?.sky ?? ""
    lookSky.placeholder = pal.sky
    lookFar.value = overlay.look?.far ?? ""
    lookFar.placeholder = pal.far
    lookFog.value = overlay.look?.fog ?? ""
    lookFog.placeholder = pal.fog
    lookHour.value = overlay.look?.hour ?? ""
    lookWeather.value = overlay.look?.weather ?? ""
    lookNight.checked = overlay.look?.night === true
    lookNightAmt.value = String(overlay.look?.nightAmount ?? 42)
    lookNightAmt.disabled = !lookNight.checked
    lookHaze.checked = overlay.look?.haze === true || (!lookNight.checked && overlay.look?.haze !== false)
    lookGlow.checked = overlay.look?.lanternGlow === true
    lookLowG.checked = overlay.look?.lowGravity === true
  }

  const fillInspect = (): void => {
    mapWidthInput.value = String(overlay.worldWidth)
    fillLook()
    const idLabel = idInput.closest("label")
    const assetLabel = assetInput.closest("label")
    const rotLabel = rotInput.closest("label")
    const currentLabel = currentInput.closest("label")
    if (!selected) {
      hint.textContent =
        selModeEl.value === "region" ? t("editor.selected.region") : t("editor.selected.none")
      xInput.disabled = true
      yInput.disabled = true
      wInput.disabled = true
      hInput.disabled = true
      rotInput.disabled = true
      assetInput.disabled = true
      idInput.disabled = true
      currentInput.disabled = true
      poolLineEl.disabled = true
      poolLineLabel.hidden = true
      if (idLabel) {
        idLabel.hidden = true
      }
      if (assetLabel) {
        assetLabel.hidden = true
      }
      if (rotLabel) {
        rotLabel.hidden = true
      }
      if (currentLabel) {
        currentLabel.hidden = true
      }
      fillBreak(null, false)
      syncUndo()
      return
    }
    xInput.disabled = false
    yInput.disabled = false
    const sizeKind =
      selected.kind === "platform" ||
      selected.kind === "mover" ||
      selected.kind === "decor" ||
      selected.kind === "hazard"
    wInput.disabled = !sizeKind
    hInput.disabled = !sizeKind
    rotInput.disabled = selected.kind !== "decor" && selected.kind !== "platform"
    assetInput.disabled = selected.kind !== "decor" && selected.kind !== "platform"
    currentInput.disabled = selected.kind !== "hazard"
    const canBreak =
      selected.kind === "platform" || selected.kind === "mover" || selected.kind === "decor"
    fillBreak(canBreak ? breakHost(selected) : null, canBreak)
    const poolKind = selected.kind === "pool"
    poolLineEl.disabled = !poolKind
    poolLineLabel.hidden = !poolKind
    const idKind = selected.kind === "enemy" || selected.kind === "pickup"
    idInput.disabled = !idKind
    if (idLabel) {
      idLabel.hidden = !idKind
    }
    if (assetLabel) {
      assetLabel.hidden = assetInput.disabled
    }
    if (rotLabel) {
      rotLabel.hidden = rotInput.disabled
    }
    if (currentLabel) {
      currentLabel.hidden = currentInput.disabled
    }
    if (selected.kind === "enemy" || selected.kind === "pickup") {
      fillIdSelect(selected.kind)
    }
    if (selected.kind === "spawn") {
      hint.textContent = t("editor.kind.spawn")
      xInput.value = String(overlay.playerSpawn.x)
      yInput.value = String(overlay.playerSpawn.y)
    } else if (selected.kind === "pool") {
      const pool = poolAt(selected.index)
      if (!pool) {
        syncUndo()
        return
      }
      const at = poolWorld(pool)
      hint.textContent = t("editor.kind.pool")
      xInput.value = String(at.x)
      yInput.value = String(at.y)
      poolLineEl.value = pool.line ?? t(`story.level.${session.level.id}.moon`)
    } else if (selected.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      hint.textContent = t("editor.kind.exit")
      xInput.value = String(origin + overlay.exit.x)
      yInput.value = String(overlay.exit.y)
    } else if (selected.kind === "platform") {
      const rect = overlay.platforms[selected.index]
      if (!rect) {
        syncUndo()
        return
      }
      hint.textContent =
        rect.kind === "wall"
          ? t("editor.kind.wall")
          : rect.kind === "ceiling"
            ? t("editor.kind.ceiling")
            : t("editor.kind.platform")
      xInput.value = String(rect.x)
      yInput.value = String(rect.y)
      wInput.value = String(rect.w)
      hInput.value = String(rect.h)
      rotInput.value = String(rect.rotation ?? 0)
      assetInput.value =
        rect.asset ?? (rect.kind === "wall" ? "hedge" : rect.kind === "ceiling" ? "cave" : "ground")
    } else if (selected.kind === "mover") {
      const mover = overlay.movers[selected.index]
      if (!mover) {
        syncUndo()
        return
      }
      hint.textContent = t("editor.kind.mover")
      xInput.value = String(mover.worldX)
      yInput.value = String(mover.worldY)
      wInput.value = String(mover.w)
      hInput.value = String(mover.h)
    } else if (selected.kind === "enemy") {
      const enemy = overlay.enemies[selected.index]
      if (!enemy) {
        syncUndo()
        return
      }
      hint.textContent = t("editor.kind.enemy")
      xInput.value = String(enemy.worldX)
      yInput.value = String(enemy.worldY)
      idInput.value = enemy.id
    } else if (selected.kind === "pickup") {
      const pickup = overlay.pickups[selected.index]
      if (!pickup) {
        syncUndo()
        return
      }
      hint.textContent = t("editor.kind.pickup")
      xInput.value = String(pickup.worldX)
      yInput.value = String(pickup.worldY)
      idInput.value = pickup.id
    } else if (selected.kind === "decor") {
      const item = overlay.decor?.[selected.index]
      if (!item) {
        syncUndo()
        return
      }
      hint.textContent = DECOR_LABELS[item.kind] ?? t("editor.kind.decor")
      xInput.value = String(item.x)
      yInput.value = String(item.y)
      wInput.value = String(item.w)
      hInput.value = String(item.h)
      rotInput.value = String(item.rotation ?? 0)
      assetInput.value = item.asset ?? "hedge"
    } else if (selected.kind === "hazard") {
      const item = overlay.hazards?.[selected.index]
      if (!item) {
        syncUndo()
        return
      }
      hint.textContent = t("editor.kind.water")
      xInput.value = String(item.worldX)
      yInput.value = String(item.worldY)
      wInput.value = String(item.w)
      hInput.value = String(item.h)
      currentInput.value = String(item.current ?? 0)
    }
    if (group.length > 1) {
      hint.textContent = t("editor.selected.group", { n: group.length })
    }
    drawMarks()
    syncUndo()
  }

  const pickAt = (wx: number, wy: number): Selection | null => {
    for (const child of session.enemies.getChildren()) {
      const index = Number(child.getData("editIndex"))
      if (Number.isFinite(index) && hitSprite(wx, wy, child)) {
        return { kind: "enemy", index }
      }
    }
    for (const child of session.pickups.getChildren()) {
      const index = Number(child.getData("editIndex"))
      if (Number.isFinite(index) && hitSprite(wx, wy, child)) {
        return { kind: "pickup", index }
      }
    }
    if (Phaser.Math.Distance.Between(wx, wy, overlay.playerSpawn.x, overlay.playerSpawn.y) < 32) {
      return { kind: "spawn", index: 0 }
    }
    for (let i = (overlay.moonPools ?? []).length - 1; i >= 0; i -= 1) {
      const pool = overlay.moonPools?.[i]
      if (!pool) {
        continue
      }
      const at = poolWorld(pool)
      if (Phaser.Math.Distance.Between(wx, wy, at.x, at.y) < 40) {
        return { kind: "pool", index: i }
      }
    }
    {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      if (Phaser.Math.Distance.Between(wx, wy, origin + overlay.exit.x, overlay.exit.y) < 52) {
        return { kind: "exit", index: 0 }
      }
    }
    for (let i = overlay.movers.length - 1; i >= 0; i -= 1) {
      const mover = overlay.movers[i]
      if (
        mover &&
        wx >= mover.worldX &&
        wx <= mover.worldX + mover.w &&
        wy >= mover.worldY &&
        wy <= mover.worldY + mover.h
      ) {
        return { kind: "mover", index: i }
      }
    }
    for (let i = (overlay.decor ?? []).length - 1; i >= 0; i -= 1) {
      const item = overlay.decor?.[i]
      if (
        item &&
        wx >= item.x &&
        wx <= item.x + item.w &&
        wy >= item.y &&
        wy <= item.y + item.h
      ) {
        return { kind: "decor", index: i }
      }
    }
    for (let i = (overlay.hazards ?? []).length - 1; i >= 0; i -= 1) {
      const item = overlay.hazards?.[i]
      if (
        item &&
        wx >= item.worldX &&
        wx <= item.worldX + item.w &&
        wy >= item.worldY &&
        wy <= item.worldY + item.h
      ) {
        return { kind: "hazard", index: i }
      }
    }
    for (let i = overlay.platforms.length - 1; i >= 0; i -= 1) {
      const rect = overlay.platforms[i]
      if (rect && hitRect(wx, wy, rect)) {
        return { kind: "platform", index: i }
      }
    }
    return null
  }

  const placeSel = (sel: Selection, x: number, y: number): void => {
    if (sel.kind === "spawn") {
      overlay.playerSpawn = { x, y }
    } else if (sel.kind === "pool") {
      const pool = poolAt(sel.index)
      if (pool) {
        const next = worldToAnchor(session.world, x, y)
        pool.chunk = next.chunk
        pool.x = next.x
        pool.y = next.y
      }
    } else if (sel.kind === "exit") {
      overlay.exit = worldToAnchor(session.world, x, y)
    } else if (sel.kind === "platform") {
      const rect = overlay.platforms[sel.index]
      if (rect) {
        rect.x = x
        rect.y = y
      }
    } else if (sel.kind === "mover") {
      const mover = overlay.movers[sel.index]
      if (mover) {
        const local = worldToAnchor(session.world, x, y)
        mover.worldX = x
        mover.worldY = y
        mover.x = local.x
        mover.y = y
      }
    } else if (sel.kind === "enemy") {
      const enemy = overlay.enemies[sel.index]
      if (enemy) {
        const local = worldToAnchor(session.world, x, y)
        enemy.worldX = x
        enemy.worldY = y
        enemy.x = local.x
        enemy.y = y
      }
    } else if (sel.kind === "pickup") {
      const pickup = overlay.pickups[sel.index]
      if (pickup) {
        const local = worldToAnchor(session.world, x, y)
        pickup.worldX = x
        pickup.worldY = y
        pickup.x = local.x
        pickup.y = y
      }
    } else if (sel.kind === "decor") {
      const item = overlay.decor?.[sel.index]
      if (item) {
        item.x = x
        item.y = y
      }
    } else if (sel.kind === "hazard") {
      const item = overlay.hazards?.[sel.index]
      if (item) {
        const local = worldToAnchor(session.world, x, y)
        item.worldX = x
        item.worldY = y
        item.x = local.x
        item.y = y
      }
    }
  }

  const moveSelection = (sel: Selection, wx: number, wy: number): void => {
    placeSel(sel, snap10(wx - grabX), snap10(wy - grabY))
    selected = sel
    syncSelection()
    fillInspect()
  }

  const applyInspect = (): void => {
    if (!selected) {
      return
    }
    const x = snap10(Number(xInput.value))
    const y = snap10(Number(yInput.value))
    const w = Math.max(10, snap10(Number(wInput.value) || 10))
    const h = Math.max(10, snap10(Number(hInput.value) || 10))
    if (group.length > 1) {
      const origin = selOrigin(selected)
      const dx = x - origin.x
      const dy = y - origin.y
      const sameKind = group.every((item) => item.kind === selected?.kind)
      for (const item of group) {
        const at = selOrigin(item)
        placeSel(item, snap10(at.x + dx), snap10(at.y + dy))
        if (sameKind && selected.kind === "platform") {
          const rect = overlay.platforms[item.index]
          if (rect) {
            rect.w = w
            rect.h = h
            rect.rotation = Number(rotInput.value) || 0
            rect.asset = assetInput.value as AssembledRect["asset"]
            writeBreak(rect)
          }
        } else if (sameKind && selected.kind === "mover") {
          const mover = overlay.movers[item.index]
          if (mover) {
            mover.w = w
            mover.h = h
            writeBreak(mover)
          }
        } else if (sameKind && selected.kind === "decor") {
          const decor = overlay.decor?.[item.index]
          if (decor) {
            decor.w = w
            decor.h = h
            decor.rotation = Number(rotInput.value) || 0
            decor.asset = assetInput.value
            writeBreak(decor)
          }
        } else if (sameKind && selected.kind === "hazard") {
          const hazard = overlay.hazards?.[item.index]
          if (hazard) {
            hazard.w = w
            hazard.h = h
            hazard.current = Number(currentInput.value) || 0
          }
        } else if (sameKind && selected.kind === "enemy") {
          const enemy = overlay.enemies[item.index]
          if (enemy) {
            enemy.id = idInput.value
          }
        } else if (sameKind && selected.kind === "pickup") {
          const pickup = overlay.pickups[item.index]
          if (pickup) {
            pickup.id = idInput.value
          }
        } else if (sameKind && selected.kind === "pool") {
          const pool = overlay.moonPools?.[item.index]
          if (pool) {
            const line = poolLineEl.value.trim()
            if (line) {
              pool.line = line
            } else {
              delete pool.line
            }
          }
        }
      }
      syncSelection()
      persist()
      fillInspect()
      return
    }
    if (selected.kind === "platform") {
      const rect = overlay.platforms[selected.index]
      if (rect) {
        rect.x = x
        rect.y = y
        rect.w = w
        rect.h = h
        rect.rotation = Number(rotInput.value) || 0
        rect.asset = assetInput.value as AssembledRect["asset"]
        writeBreak(rect)
      }
    } else if (selected.kind === "mover") {
      const mover = overlay.movers[selected.index]
      if (mover) {
        const local = worldToAnchor(session.world, x, y)
        mover.worldX = x
        mover.worldY = y
        mover.x = local.x
        mover.y = y
        mover.w = w
        mover.h = h
        writeBreak(mover)
      }
    } else if (selected.kind === "enemy") {
      const enemy = overlay.enemies[selected.index]
      if (enemy) {
        const local = worldToAnchor(session.world, x, y)
        enemy.worldX = x
        enemy.worldY = y
        enemy.x = local.x
        enemy.y = y
        enemy.id = idInput.value
      }
    } else if (selected.kind === "pickup") {
      const pickup = overlay.pickups[selected.index]
      if (pickup) {
        const local = worldToAnchor(session.world, x, y)
        pickup.worldX = x
        pickup.worldY = y
        pickup.x = local.x
        pickup.y = y
        pickup.id = idInput.value
      }
    } else if (selected.kind === "decor") {
      const item = overlay.decor?.[selected.index]
      if (item) {
        item.x = x
        item.y = y
        item.w = w
        item.h = h
        item.rotation = Number(rotInput.value) || 0
        item.asset = assetInput.value
        writeBreak(item)
      }
    } else if (selected.kind === "hazard") {
      const item = overlay.hazards?.[selected.index]
      if (item) {
        const local = worldToAnchor(session.world, x, y)
        item.worldX = x
        item.worldY = y
        item.x = local.x
        item.y = y
        item.w = w
        item.h = h
        item.current = Number(currentInput.value) || 0
      }
    } else if (selected.kind === "pool") {
      const pool = poolAt(selected.index)
      if (pool) {
        const next = worldToAnchor(session.world, x, y)
        pool.chunk = next.chunk
        pool.x = next.x
        pool.y = next.y
        const line = poolLineEl.value.trim()
        if (line) {
          pool.line = line
        } else {
          delete pool.line
        }
      }
    } else {
      moveSelection(selected, x, y)
      persist()
      return
    }
    syncSelection()
    persist()
    fillInspect()
  }

  inspect.hidden = session.mode !== "build"
  fillInspect()

  requireEl<HTMLButtonElement>(root, "[data-ui=play]").onclick = () => {
    getAudio().playSfx("confirm")
    restart("play")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=build]").onclick = () => {
    getAudio().playSfx("confirm")
    restart("build")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=setActive]").onclick = () => {
    getAudio().playSfx("confirm")
    persist()
    const bundle = buildExportBundle(session.level, overlay, session.world)
    void writeRepoFile(
      `src/data/editor-out/${session.level.id}.editor.json`,
      `${JSON.stringify(bundle, null, 2)}\n`,
    ).then((ok) => {
      statusEl.textContent = ok ? t("editor.activeDev") : t("editor.activeDone")
    })
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=copyJson]").onclick = () => {
    getAudio().playSfx("confirm")
    persist()
    downloadEditorJson(session.level, overlay, session.world)
    statusEl.textContent = t("editor.copyDone")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
    getAudio().playSfx("cancel")
    persist()
    session.scene.scene.start("Settings")
  }

  const fillStations = (worldId: EditorWorldId, selectedId: string, chapter: StoryChapterId): void => {
    const stations = stationsForWorld(worldId, chapter)
    const fallback = stations[0]?.id ?? selectedId
    const current = stations.some((level) => level.id === selectedId) ? selectedId : fallback
    stationIdEl.innerHTML = stations
      .map(
        (level) =>
          `<option value="${level.id}" ${level.id === current ? "selected" : ""}>${t(`story.level.${level.id}.name`)}</option>`,
      )
      .join("")
    stationIdEl.value = current
  }

  const fillWorlds = (chapter: StoryChapterId, selectedWorld: EditorWorldId, selectedStation: string): void => {
    const worlds = listEditorWorldIndex(chapter)
    const currentWorld = worlds.some((world) => world.id === selectedWorld)
      ? selectedWorld
      : (worlds[0]?.id ?? selectedWorld)
    worldIdEl.innerHTML = worlds
      .map(
        (world) =>
          `<option value="${world.id}" ${world.id === currentWorld ? "selected" : ""}>${t(world.titleKey)}</option>`,
      )
      .join("")
    worldIdEl.value = currentWorld
    fillStations(currentWorld, selectedStation, chapter)
  }

  const currentChapter = editorChapterForLevel(session.level)
  chapterIdEl.innerHTML = listChapters()
    .map((chapter) => {
      const label = t(`story.chapter.${chapter.id}.title`)
      const hasStations = listEditorWorldIndex(chapter.id).some((world) => world.stations.length > 0)
      const disabled = hasStations ? "" : "disabled"
      const selected = chapter.id === currentChapter ? "selected" : ""
      return `<option value="${chapter.id}" ${selected} ${disabled}>${label}</option>`
    })
    .join("")
  chapterIdEl.value = currentChapter
  fillWorlds(currentChapter, editorWorldIdForLevel(session.level), session.level.id)
  setLastEditorStation(session.level.id)

  chapterIdEl.onchange = () => {
    const chapter = chapterIdEl.value as StoryChapterId
    const worlds = listEditorWorldIndex(chapter)
    const next = worlds[0]?.stations[0]?.id
    if (!next || next === session.level.id) {
      fillWorlds(chapter, worlds[0]?.id ?? editorWorldIdForLevel(session.level), session.level.id)
      return
    }
    persist()
    setLastEditorStation(next)
    session.scene.scene.restart({
      levelId: next,
      editor: { mode: session.mode },
    })
  }

  worldIdEl.onchange = () => {
    const worldId = worldIdEl.value as EditorWorldId
    fillStations(worldId, stationIdEl.value, chapterIdEl.value as StoryChapterId)
    const next = stationIdEl.value
    if (next && next !== session.level.id) {
      persist()
      setLastEditorStation(next)
      session.scene.scene.restart({
        levelId: next,
        editor: { mode: session.mode },
      })
    }
  }
  stationIdEl.onchange = () => {
    const next = stationIdEl.value
    if (!next || next === session.level.id) {
      return
    }
    persist()
    setLastEditorStation(next)
    session.scene.scene.restart({
      levelId: next,
      editor: { mode: session.mode },
    })
  }

  const menuPairs = [
    { panel: selPanel, btn: selPanelBtn },
    { panel: lookPanel, btn: lookPanelBtn },
  ]

  const closeAddMenus = (): void => {
    for (const pair of menuPairs) {
      pair.panel.hidden = true
      pair.btn.setAttribute("aria-expanded", "false")
    }
  }

  const toggleMenu = (panel: HTMLElement, btn: HTMLButtonElement): void => {
    const open = panel.hidden
    closeAddMenus()
    if (open) {
      panel.hidden = false
      btn.setAttribute("aria-expanded", "true")
    }
  }

  selPanelBtn.onclick = (event) => {
    event.stopPropagation()
    toggleMenu(selPanel, selPanelBtn)
  }
  lookPanelBtn.onclick = (event) => {
    event.stopPropagation()
    toggleMenu(lookPanel, lookPanelBtn)
  }

  envAdd.onchange = () => {
    const token = envAdd.value
    if (token) {
      addToken(token)
    }
  }
  critterAdd.onchange = () => {
    const token = critterAdd.value
    if (token) {
      addToken(token)
    }
  }
  selModeEl.onchange = () => {
    if (!selected) {
      fillInspect()
    }
  }

  const addToken = (kind: string): void => {
    getAudio().playSfx("confirm")
    closeAddMenus()
    const at = cameraCenter()
    if (kind.startsWith("critter:")) {
      const id = kind.slice("critter:".length)
      const local = worldToAnchor(session.world, at.x, at.y)
      overlay.enemies.push({
        id,
        x: local.x,
        y: at.y,
        worldX: at.x,
        worldY: at.y,
      })
      restart("build")
      return
    }
    if (kind.startsWith("item:")) {
      const id = kind.slice("item:".length)
      const local = worldToAnchor(session.world, at.x, at.y)
      overlay.pickups.push({
        id,
        x: local.x,
        y: at.y,
        worldX: at.x,
        worldY: at.y,
      })
      restart("build")
      return
    }
    const parsed = parseKitToken(kind)
    const stamp = parsed.kit ?? session.env
    const token = parsed.kind
    if (token === "platform") {
      overlay.platforms.push({ kind: "platform", x: at.x - 60, y: at.y, w: 120, h: 24, env: stamp })
      restart("build")
      return
    }
    if (token === "wall") {
      overlay.platforms.push({ kind: "wall", x: at.x, y: at.y - 60, w: 28, h: 120, env: stamp })
      restart("build")
      return
    }
    if (token === "ceiling") {
      overlay.platforms.push({ kind: "ceiling", x: at.x - 100, y: at.y, w: 220, h: 40, asset: "cave", env: stamp })
      restart("build")
      return
    }
    if (token === "bridge") {
      const local = worldToAnchor(session.world, at.x - 80, at.y)
      overlay.movers.push({
        x: local.x,
        y: at.y,
        w: 160,
        h: 16,
        axis: "x",
        amplitude: 28,
        speed: 1.1,
        tint: 13158624,
        kind: "bridge",
        worldX: at.x - 80,
        worldY: at.y,
        env: stamp,
      })
      restart("build")
      return
    }
    if (token === "water") {
      const local = worldToAnchor(session.world, at.x - 80, at.y)
      overlay.hazards = overlay.hazards ?? []
      overlay.hazards.push({
        kind: "water",
        x: local.x,
        y: at.y,
        w: 160,
        h: 40,
        current: 40,
        worldX: at.x - 80,
        worldY: at.y,
        env: stamp,
      })
      restart("build")
      return
    }
    if (token === "pool") {
      overlay.moonPools = overlay.moonPools ?? []
      const local = worldToAnchor(session.world, at.x, at.y)
      overlay.moonPools.push({
        chunk: local.chunk,
        x: local.x,
        y: local.y,
        line: t(`story.level.${session.level.id}.moon`),
      })
      restart("build")
      return
    }
    overlay.decor = overlay.decor ?? []
    overlay.decor.push(defaultDecor(token as AssembledDecor["kind"], at.x, at.y, stamp))
    restart("build")
  }

  const onDocPointer = (event: PointerEvent): void => {
    const node = event.target as Node | null
    if (
      node &&
      menuPairs.some((pair) => pair.panel.contains(node) || pair.btn.contains(node))
    ) {
      return
    }
    closeAddMenus()
  }
  document.addEventListener("pointerdown", onDocPointer)

  requireEl<HTMLButtonElement>(root, "[data-ui=undo]").onclick = () => {
    if (group.length > 1) {
      for (const row of groupBaseline) {
        restoreItem(row.sel, row.snap)
      }
      getAudio().playSfx("cancel")
      syncSelection()
      persist()
      fillInspect()
      return
    }
    if (!selected || !baseline || !sameSel(baseline.sel, selected)) {
      return
    }
    restoreItem(selected, baseline.snap)
    getAudio().playSfx("cancel")
    syncSelection()
    persist()
    fillInspect()
  }

  const copySources = (): Selection[] =>
    (group.length ? group : selected ? [selected] : []).filter(
      (item) => item.kind !== "spawn" && item.kind !== "exit",
    )

  const storeClipboard = (): boolean => {
    const sources = copySources()
    if (!sources.length) {
      return false
    }
    const rows: ClipRow[] = []
    for (const item of sources) {
      const snap = captureItem(item)
      if (snap === null) {
        continue
      }
      const at = selOrigin(item)
      rows.push({ kind: item.kind, snap, x: at.x, y: at.y })
    }
    if (!rows.length) {
      return false
    }
    editorClip = rows
    return true
  }

  const duplicateSelected = (): void => {
    const sources = copySources()
    if (!sources.length) {
      return
    }
    let made = 0
    for (const item of sources) {
      const snap = captureItem(item)
      if (snap === null) {
        continue
      }
      const next = appendCopy(item.kind, snap)
      if (!next) {
        continue
      }
      const at = selOrigin(item)
      placeSel(next, snap10(at.x + COPY_SHIFT), snap10(at.y + COPY_SHIFT))
      made += 1
    }
    if (!made) {
      return
    }
    getAudio().playSfx("confirm")
    restart("build")
  }

  const pasteClipboard = (): void => {
    if (!editorClip.length) {
      return
    }
    const originX = Math.min(...editorClip.map((row) => row.x))
    const originY = Math.min(...editorClip.map((row) => row.y))
    const at = cameraCenter()
    let made = 0
    for (const row of editorClip) {
      const next = appendCopy(row.kind, row.snap)
      if (!next) {
        continue
      }
      placeSel(next, snap10(at.x + (row.x - originX)), snap10(at.y + (row.y - originY)))
      made += 1
    }
    if (!made) {
      return
    }
    getAudio().playSfx("confirm")
    restart("build")
  }

  copyBtn.onclick = () => {
    if (storeClipboard()) {
      getAudio().playSfx("confirm")
    }
  }
  const deleteSelected = (): void => {
    const doomed = (group.length ? group : selected ? [selected] : []).filter(
      (item) => item.kind !== "spawn" && item.kind !== "exit",
    )
    if (!doomed.length) {
      return
    }
    const byKind: Record<string, number[]> = {}
    for (const item of doomed) {
      byKind[item.kind] = byKind[item.kind] ?? []
      byKind[item.kind]?.push(item.index)
    }
    for (const kind of Object.keys(byKind)) {
      const indices = (byKind[kind] ?? []).sort((a, b) => b - a)
      for (const index of indices) {
        if (kind === "platform") {
          overlay.platforms.splice(index, 1)
        } else if (kind === "mover") {
          overlay.movers.splice(index, 1)
        } else if (kind === "enemy") {
          overlay.enemies.splice(index, 1)
        } else if (kind === "pickup") {
          overlay.pickups.splice(index, 1)
        } else if (kind === "decor") {
          overlay.decor?.splice(index, 1)
        } else if (kind === "hazard") {
          overlay.hazards?.splice(index, 1)
        } else if (kind === "pool") {
          overlay.moonPools?.splice(index, 1)
        }
      }
    }
    restart("build")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=delete]").onclick = () => {
    deleteSelected()
  }

  xInput.onchange = applyInspect
  yInput.onchange = applyInspect
  wInput.onchange = applyInspect
  hInput.onchange = applyInspect
  rotInput.onchange = applyInspect
  assetInput.onchange = applyInspect
  currentInput.onchange = applyInspect
  breakOn.onchange = applyInspect
  breakProfile.onchange = applyInspect
  poolLineEl.onchange = applyInspect
  const applyLook = (): void => {
    overlay.look = {
      env: lookEnv.value,
      sky: lookSky.value || undefined,
      far: lookFar.value || undefined,
      fog: lookFog.value || undefined,
      hour: (lookHour.value || undefined) as PaletteHour | undefined,
      weather: (lookWeather.value || undefined) as WeatherPreset | undefined,
      night: lookNight.checked,
      nightAmount: lookNight.checked ? Number(lookNightAmt.value) || 42 : undefined,
      haze: lookHaze.checked,
      lanternGlow: lookGlow.checked,
      lowGravity: lookLowG.checked,
    }
    persist()
    restart("build")
  }
  lookEnv.onchange = applyLook
  lookSky.onchange = applyLook
  lookFar.onchange = applyLook
  lookFog.onchange = applyLook
  lookHour.onchange = applyLook
  lookWeather.onchange = applyLook
  lookNight.onchange = applyLook
  lookNightAmt.onchange = applyLook
  lookHaze.onchange = applyLook
  lookGlow.onchange = applyLook
  lookLowG.onchange = applyLook
  mapWidthInput.onchange = () => {
    const width = Math.max(480, snap10(Number(mapWidthInput.value) || overlay.worldWidth))
    overlay.worldWidth = width
    restart("build")
  }
  idInput.onchange = () => {
    const targets = (group.length ? group : selected ? [selected] : []).filter(
      (item) => item.kind === "enemy" || item.kind === "pickup",
    )
    if (!targets.length) {
      return
    }
    let changed = false
    for (const item of targets) {
      if (item.kind === "enemy") {
        const enemy = overlay.enemies[item.index]
        if (enemy) {
          enemy.id = idInput.value
          changed = true
        }
      } else {
        const pickup = overlay.pickups[item.index]
        if (pickup) {
          pickup.id = idInput.value
          changed = true
        }
      }
    }
    if (changed) {
      restart("build")
    }
  }

  const beginDrag = (hit: Selection, worldPoint: { x: number; y: number }): void => {
    const items = inGroup(hit) && group.length > 1 ? group : [hit]
    if (items.length > 1) {
      draggingGroup = true
      dragging = hit
      dragOriginX = worldPoint.x
      dragOriginY = worldPoint.y
      groupStarts = items.map((item) => {
        const at = selOrigin(item)
        return { sel: item, x: at.x, y: at.y }
      })
      return
    }
    draggingGroup = false
    dragging = hit
    const at = selOrigin(hit)
    grabX = worldPoint.x - at.x
    grabY = worldPoint.y - at.y
  }

  const onDown = (pointer: Phaser.Input.Pointer): void => {
    if (session.mode !== "build") {
      return
    }
    const worldPoint = session.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    if (pointer.rightButtonDown()) {
      panning = true
      panX = pointer.x
      panY = pointer.y
      panScrollX = session.scene.cameras.main.scrollX
      panScrollY = session.scene.cameras.main.scrollY
      return
    }
    const hit = pickAt(worldPoint.x, worldPoint.y)
    if (selModeEl.value === "region") {
      if (hit && inGroup(hit)) {
        adoptGroup(group)
        beginDrag(hit, worldPoint)
        fillInspect()
        return
      }
      marquee = { x0: worldPoint.x, y0: worldPoint.y, x1: worldPoint.x, y1: worldPoint.y }
      drawMarks()
      return
    }
    if (hit) {
      adoptSelection(hit)
      beginDrag(hit, worldPoint)
      fillInspect()
      return
    }
    panning = true
    panX = pointer.x
    panY = pointer.y
    panScrollX = session.scene.cameras.main.scrollX
    panScrollY = session.scene.cameras.main.scrollY
  }

  const onMove = (pointer: Phaser.Input.Pointer): void => {
    if (session.mode !== "build") {
      return
    }
    if (marquee) {
      const worldPoint = session.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
      marquee.x1 = worldPoint.x
      marquee.y1 = worldPoint.y
      drawMarks()
      return
    }
    if (draggingGroup && dragging) {
      const worldPoint = session.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const dx = snap10(worldPoint.x - dragOriginX)
      const dy = snap10(worldPoint.y - dragOriginY)
      for (const row of groupStarts) {
        placeSel(row.sel, row.x + dx, row.y + dy)
      }
      syncSelection()
      fillInspect()
      return
    }
    if (dragging) {
      const worldPoint = session.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
      moveSelection(dragging, worldPoint.x, worldPoint.y)
      return
    }
    if (panning) {
      session.scene.cameras.main.scrollX = panScrollX - (pointer.x - panX)
      session.scene.cameras.main.scrollY = panScrollY - (pointer.y - panY)
    }
  }

  const onUp = (pointer: Phaser.Input.Pointer): void => {
    if (marquee) {
      const x = Math.min(marquee.x0, marquee.x1)
      const y = Math.min(marquee.y0, marquee.y1)
      const w = Math.abs(marquee.x1 - marquee.x0)
      const h = Math.abs(marquee.y1 - marquee.y0)
      marquee = null
      if (w < 12 && h < 12) {
        const worldPoint = session.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
        const hit = pickAt(worldPoint.x, worldPoint.y)
        if (hit) {
          adoptSelection(hit)
        } else {
          selected = null
          group = []
        }
      } else {
        const hits = pickInRect({ x, y, w, h })
        if (hits.length) {
          adoptGroup(hits)
        } else {
          selected = null
          group = []
        }
      }
      fillInspect()
      return
    }
    if (dragging || draggingGroup) {
      persist()
    }
    dragging = null
    draggingGroup = false
    panning = false
  }

  const placeTopBar = (): void => {
    placeBelowStoryChrome(topBar)
  }
  placeTopBar()
  const stopChromeWatch = watchStoryChrome(placeTopBar)

  session.scene.input.on("pointerdown", onDown)
  session.scene.input.on("pointermove", onMove)
  session.scene.input.on("pointerup", onUp)
  const blockMenu = (event: Event): void => {
    event.preventDefault()
  }
  session.scene.game.canvas.addEventListener("contextmenu", blockMenu)
  const onKey = (event: KeyboardEvent): void => {
    if (session.mode !== "build") {
      return
    }
    const typing =
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    if (typing) {
      return
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      deleteSelected()
      return
    }
    if (!(event.ctrlKey || event.metaKey)) {
      return
    }
    const key = event.key.toLowerCase()
    if (key === "c") {
      event.preventDefault()
      if (storeClipboard()) {
        getAudio().playSfx("confirm")
      }
      return
    }
    if (key === "v") {
      event.preventDefault()
      pasteClipboard()
      return
    }
    if (key === "d") {
      event.preventDefault()
      duplicateSelected()
    }
  }
  window.addEventListener("keydown", onKey)
  session.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    document.removeEventListener("pointerdown", onDocPointer)
    window.removeEventListener("keydown", onKey)
    stopChromeWatch()
    session.scene.game.canvas.removeEventListener("contextmenu", blockMenu)
    session.scene.input.off("pointerdown", onDown)
    session.scene.input.off("pointermove", onMove)
    session.scene.input.off("pointerup", onUp)
    marks.destroy()
  })
}
