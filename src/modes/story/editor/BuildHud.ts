import Phaser from "phaser"
import type { AssembledDecor, AssembledHazard, AssembledLevel, AssembledRect } from "../../../systems/ChunkAssembler"
import { t } from "../../../core/i18n"
import { getAudio } from "../../../core/audio"
import { mountDomShell, requireEl } from "../../../ui/DomShell"
import { writeRepoFile } from "../../../core/devWrite"
import { downloadEditorJson, buildExportBundle } from "./exportJson"
import type { StoryLevelDef } from "../levels"
import type { MoverState } from "../shared/moversHazards"
import {
  ensureOverlay,
  setOverlay,
  snap10,
  worldToAnchor,
  type EditorPickup,
} from "./overlayStore"
import { defaultDecor, DECOR_LABELS, PLATFORM_ASSETS } from "./placeables"
import {
  allCritterIds,
  allItemIds,
  critterLabel,
  editorWorldIdForLevel,
  envTokenLabel,
  itemLabel,
  listEditorWorldIndex,
  setLastEditorStation,
  sharedEnvTokens,
  stationsForWorld,
  type EditorWorldId,
} from "./worldIndex"
import {
  listPaletteIds,
  PALETTE_HOURS,
  WEATHER_PRESETS,
  type PaletteHour,
  type WeatherPreset,
} from "../shared/themeKit"

export type EditorMode = "play" | "build"

export type EditorSession = {
  scene: Phaser.Scene
  level: StoryLevelDef
  world: AssembledLevel
  player: Phaser.Physics.Arcade.Sprite
  moonPool: Phaser.GameObjects.Image | null
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

const CSS = `
.bm-root.bm-editor-hud {
  background: transparent;
  pointer-events: none;
  overflow: hidden;
  z-index: 70;
}
.bm-editor-hud .bm-editor-dock {
  pointer-events: auto;
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 1100px;
  margin: 0 auto;
}
.bm-editor-hud .bm-editor-bar,
.bm-editor-hud .bm-editor-inspect {
  background: linear-gradient(180deg, #f7f3e8f0, #ebe4d4e6);
  border: 1px solid #d5dcc4;
  border-radius: 14px;
  box-shadow: 0 8px 18px #2a3d2412;
}
.bm-editor-hud .bm-editor-bar {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.bm-editor-hud .bm-editor-inspect {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(42vh, 380px);
  overflow: auto;
}
.bm-editor-hud .bm-editor-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bm-editor-hud .bm-editor-section + .bm-editor-section {
  border-top: 1px solid #d5dcc4;
  padding-top: 8px;
}
.bm-editor-hud .bm-editor-section h3 {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #71816e;
  margin: 0;
}
.bm-editor-hud .bm-editor-section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.bm-editor-hud .bm-editor-hint {
  flex: 1 1 180px;
  font-size: 13px;
  color: #304c39;
}
.bm-editor-hud .bm-editor-edit-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.bm-editor-hud .bm-editor-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: flex-end;
}
.bm-editor-hud .bm-editor-inspect label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 2px;
}
.bm-editor-hud .bm-editor-inspect label[hidden] {
  display: none;
}
.bm-editor-hud .bm-editor-inspect input,
.bm-editor-hud .bm-editor-inspect select {
  width: 88px;
}
.bm-editor-hud .bm-editor-inspect input.wide,
.bm-editor-hud .bm-editor-inspect select.wide {
  width: 160px;
}
.bm-editor-hud .bm-editor-inspect select.bm-editor-add {
  width: 200px;
}
.bm-editor-hud .bm-editor-flag {
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-height: 34px;
}
.bm-editor-hud .bm-editor-fields .bm-btn {
  padding: 8px 16px;
}
.bm-editor-hud .bm-btn[aria-pressed="true"] {
  outline: 2px solid #34583e;
}
.bm-editor-hud .bm-editor-station {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
}
.bm-editor-hud .bm-editor-add-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}
.bm-editor-hud .bm-editor-menu {
  position: relative;
}
.bm-editor-hud .bm-editor-menu-panel {
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  z-index: 80;
  min-width: 240px;
  max-height: 280px;
  overflow: auto;
  background: #f7f3e8;
  border: 1px solid #d5dcc4;
  border-radius: 12px;
  box-shadow: 0 8px 18px #2a3d2420;
  padding: 8px;
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

function additionMenusHtml(): { env: string; creatures: string } {
  const worlds = listEditorWorldIndex()
  const item = (token: string, label: string): string =>
    `<button type="button" class="bm-editor-add-item" data-add="${token}">${label}</button>`
  const envAll = [
    ...sharedEnvTokens().map((token) => item(token, envTokenLabel(token))),
    ...allItemIds().map((id) => item(`item:${id}`, itemLabel(id))),
  ].join("")
  const envWorlds = worlds
    .map((world) => {
      const seen = new Set<string>()
      const buttons: string[] = []
      for (const token of [...sharedEnvTokens(), ...world.placeables]) {
        if (seen.has(token)) {
          continue
        }
        seen.add(token)
        buttons.push(item(token, envTokenLabel(token)))
      }
      for (const id of world.items) {
        buttons.push(item(`item:${id}`, itemLabel(id)))
      }
      return `<details><summary>${t(world.titleKey)}</summary>${buttons.join("")}</details>`
    })
    .join("")
  const creatureAll = allCritterIds()
    .map((id) => item(`critter:${id}`, critterLabel(id)))
    .join("")
  const creatureWorlds = worlds
    .map((world) => {
      const buttons = world.critters.map((id) => item(`critter:${id}`, critterLabel(id)))
      return `<details><summary>${t(world.titleKey)}</summary>${buttons.join("")}</details>`
    })
    .join("")
  return {
    env: `<details open><summary>${t("editor.addAll")}</summary>${envAll}</details>${envWorlds}`,
    creatures: `<details open><summary>${t("editor.addAll")}</summary>${creatureAll}</details>${creatureWorlds}`,
  }
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
  const addMenus = additionMenusHtml()
  const { root } = mountDomShell(
    session.scene,
    `
    <div class="bm-editor-dock">
      <div class="bm-editor-inspect bm-editor-station" data-ui="stationStrip">
        <label>${t("editor.world")}
          <select data-ui="worldId" class="wide"></select>
        </label>
        <label>${t("editor.station")}
          <select data-ui="stationId" class="wide"></select>
        </label>
      </div>
      <div class="bm-editor-inspect" data-ui="inspect" ${session.mode === "build" ? "" : "hidden"}>
        <section class="bm-editor-section">
          <div class="bm-editor-section-head">
            <h3>${t("editor.section.edit")}</h3>
            <span class="bm-editor-hint" data-ui="hint">${t("editor.selected.none")}</span>
            <div class="bm-editor-edit-actions">
              <button type="button" class="bm-btn ghost" data-ui="undo">${t("editor.undo")}</button>
              <button type="button" class="bm-btn ghost" data-ui="delete">${t("editor.delete")}</button>
            </div>
          </div>
          <div class="bm-editor-fields">
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
          </div>
        </section>
        <section class="bm-editor-section">
          <h3>${t("editor.section.add")}</h3>
          <div class="bm-editor-add-cats">
            <div class="bm-editor-menu">
              <button type="button" class="bm-btn" data-ui="envMenuBtn" aria-expanded="false">${t("editor.addEnv")}</button>
              <div class="bm-editor-menu-panel" data-ui="envMenu" hidden>${addMenus.env}</div>
            </div>
            <div class="bm-editor-menu">
              <button type="button" class="bm-btn" data-ui="critterMenuBtn" aria-expanded="false">${t("editor.addCreatures")}</button>
              <div class="bm-editor-menu-panel" data-ui="critterMenu" hidden>${addMenus.creatures}</div>
            </div>
          </div>
        </section>
        <section class="bm-editor-section">
          <h3>${t("editor.section.look")}</h3>
          <div class="bm-editor-fields">
            <label>${t("editor.look.env")}
              <select data-ui="lookEnv" class="wide"></select>
            </label>
            <label>${t("editor.look.sky")} <input data-ui="lookSky" type="text" class="wide" /></label>
            <label>${t("editor.look.hour")}
              <select data-ui="lookHour" class="wide"></select>
            </label>
            <label>${t("editor.look.weather")}
              <select data-ui="lookWeather" class="wide"></select>
            </label>
            <label class="bm-editor-flag"><input type="checkbox" data-ui="lookNight" /> ${t("editor.look.night")}</label>
            <label class="bm-editor-flag"><input type="checkbox" data-ui="lookGlow" /> ${t("editor.look.glow")}</label>
            <label>${t("editor.mapWidth")} <input data-ui="mapWidth" type="number" step="10" min="480" /></label>
          </div>
        </section>
      </div>
      <div class="bm-editor-bar">
        <button type="button" class="bm-btn" data-ui="play" aria-pressed="${session.mode === "play"}">${t("editor.play")}</button>
        <button type="button" class="bm-btn" data-ui="build" aria-pressed="${session.mode === "build"}">${t("editor.build")}</button>
        <button type="button" class="bm-btn warm" data-ui="setActive">${t("editor.setActive")}</button>
        <button type="button" class="bm-btn ghost" data-ui="copyJson">${t("editor.copyJson")}</button>
        <button type="button" class="bm-btn ghost" data-ui="back">${t("editor.back")}</button>
        <span data-ui="status"></span>
      </div>
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
  const lookEnv = requireEl<HTMLSelectElement>(root, "[data-ui=lookEnv]")
  const lookSky = requireEl<HTMLInputElement>(root, "[data-ui=lookSky]")
  const lookHour = requireEl<HTMLSelectElement>(root, "[data-ui=lookHour]")
  const lookWeather = requireEl<HTMLSelectElement>(root, "[data-ui=lookWeather]")
  const lookNight = requireEl<HTMLInputElement>(root, "[data-ui=lookNight]")
  const lookGlow = requireEl<HTMLInputElement>(root, "[data-ui=lookGlow]")
  const mapWidthInput = requireEl<HTMLInputElement>(root, "[data-ui=mapWidth]")
  const statusEl = requireEl<HTMLElement>(root, "[data-ui=status]")
  const worldIdEl = requireEl<HTMLSelectElement>(root, "[data-ui=worldId]")
  const stationIdEl = requireEl<HTMLSelectElement>(root, "[data-ui=stationId]")
  const envMenuBtn = requireEl<HTMLButtonElement>(root, "[data-ui=envMenuBtn]")
  const critterMenuBtn = requireEl<HTMLButtonElement>(root, "[data-ui=critterMenuBtn]")
  const envMenu = requireEl<HTMLElement>(root, "[data-ui=envMenu]")
  const critterMenu = requireEl<HTMLElement>(root, "[data-ui=critterMenu]")
  const undoBtn = requireEl<HTMLButtonElement>(root, "[data-ui=undo]")
  const deleteBtn = requireEl<HTMLButtonElement>(root, "[data-ui=delete]")

  const marks = session.scene.add.graphics().setDepth(30)
  let selected: Selection | null = null
  let baseline: { sel: Selection; snap: unknown } | null = null
  let dragging: Selection | null = null
  let grabX = 0
  let grabY = 0
  let panning = false
  let panX = 0
  let panY = 0
  let panScrollX = 0
  let panScrollY = 0

  overlay.decor = overlay.decor ?? []
  overlay.hazards = overlay.hazards ?? []
  overlay.look = overlay.look ?? { env: session.env }

  lookEnv.innerHTML = listPaletteIds()
    .map((id) => `<option value="${id}">${id}</option>`)
    .join("")
  lookHour.innerHTML = PALETTE_HOURS.map((id) => `<option value="${id}">${id}</option>`).join("")
  lookWeather.innerHTML = WEATHER_PRESETS.map((id) => `<option value="${id}">${id}</option>`).join("")
  assetInput.innerHTML = PLATFORM_ASSETS.map((id) => `<option value="${id}">${id}</option>`).join("")

  const persist = (): void => {
    setOverlay(session.level.id, overlay)
  }

  const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

  const sameSel = (a: Selection | null, b: Selection | null): boolean =>
    Boolean(a && b && a.kind === b.kind && a.index === b.index)

  const captureItem = (sel: Selection): unknown | null => {
    if (sel.kind === "spawn") {
      return cloneJson(overlay.playerSpawn)
    }
    if (sel.kind === "pool") {
      return overlay.moonPool ? cloneJson(overlay.moonPool) : null
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
      overlay.moonPool = cloneJson(snap as { chunk: number; x: number; y: number })
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

  const adoptSelection = (hit: Selection): void => {
    if (!sameSel(baseline?.sel ?? null, hit)) {
      const snap = captureItem(hit)
      baseline = snap === null ? null : { sel: { kind: hit.kind, index: hit.index }, snap }
    }
    selected = hit
  }

  const syncUndo = (): void => {
    if (!selected || !baseline || !sameSel(baseline.sel, selected)) {
      undoBtn.disabled = true
    } else {
      undoBtn.disabled = JSON.stringify(captureItem(selected)) === JSON.stringify(baseline.snap)
    }
    const canDelete = Boolean(
      selected &&
        selected.kind !== "spawn" &&
        selected.kind !== "pool" &&
        selected.kind !== "exit",
    )
    deleteBtn.disabled = !canDelete
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

  const syncSelection = (): void => {
    if (!selected) {
      return
    }
    if (selected.kind === "spawn") {
      session.player.setPosition(overlay.playerSpawn.x, overlay.playerSpawn.y)
      refreshBody(session.player)
    } else if (selected.kind === "pool" && overlay.moonPool && session.moonPool) {
      const origin = session.world.chunkOrigins[overlay.moonPool.chunk] ?? 0
      session.moonPool.setPosition(origin + overlay.moonPool.x, overlay.moonPool.y)
      refreshBody(session.moonPool)
    } else if (selected.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      session.exitZone.setPosition(origin + overlay.exit.x, overlay.exit.y)
      refreshBody(session.exitZone)
    } else if (selected.kind === "platform") {
      syncPlatform(selected.index)
    } else if (selected.kind === "mover") {
      syncMover(selected.index)
    } else if (selected.kind === "enemy") {
      syncEnemy(selected.index)
    } else if (selected.kind === "pickup") {
      const index = selected.index
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
    } else if (selected.kind === "decor") {
      const data = overlay.decor?.[selected.index]
      const sprite = session.decor[selected.index]
      if (data && sprite) {
        sprite.setPosition(data.x + data.w / 2, data.y + data.h / 2)
        sprite.setDisplaySize(data.w, data.h)
        sprite.setAngle(data.rotation ?? 0)
      }
    } else if (selected.kind === "hazard") {
      const data = overlay.hazards?.[selected.index]
      const water = session.waters[selected.index]
      if (data && water) {
        water.setPosition(data.worldX + data.w / 2, data.worldY + data.h / 2)
        water.setSize(data.w, data.h)
        water.setDisplaySize(data.w, data.h)
        water.setData("current", data.current ?? 0)
        refreshBody(water)
      }
    }
  }

  const drawMarks = (): void => {
    marks.clear()
    if (!selected) {
      return
    }
    marks.lineStyle(2, 0xdc854e, 1)
    if (selected.kind === "spawn") {
      marks.strokeCircle(overlay.playerSpawn.x, overlay.playerSpawn.y, 28)
    } else if (selected.kind === "pool" && overlay.moonPool) {
      const origin = session.world.chunkOrigins[overlay.moonPool.chunk] ?? 0
      marks.strokeCircle(origin + overlay.moonPool.x, overlay.moonPool.y, 36)
    } else if (selected.kind === "exit") {
      const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
      marks.strokeCircle(origin + overlay.exit.x, overlay.exit.y, 48)
    } else if (selected.kind === "platform") {
      const rect = overlay.platforms[selected.index]
      if (rect) {
        marks.strokeRect(rect.x, rect.y, rect.w, rect.h)
      }
    } else if (selected.kind === "mover") {
      const mover = overlay.movers[selected.index]
      if (mover) {
        marks.strokeRect(mover.worldX, mover.worldY, mover.w, mover.h)
      }
    } else if (selected.kind === "enemy") {
      const enemy = overlay.enemies[selected.index]
      if (enemy) {
        marks.strokeCircle(enemy.worldX, enemy.worldY, 26)
      }
    } else if (selected.kind === "pickup") {
      const pickup = overlay.pickups[selected.index]
      if (pickup) {
        marks.strokeCircle(pickup.worldX, pickup.worldY, 22)
      }
    } else if (selected.kind === "decor") {
      const item = overlay.decor?.[selected.index]
      if (item) {
        marks.strokeRect(item.x, item.y, item.w, item.h)
      }
    } else if (selected.kind === "hazard") {
      const item = overlay.hazards?.[selected.index]
      if (item) {
        marks.strokeRect(item.worldX, item.worldY, item.w, item.h)
      }
    }
  }

  const fillIdSelect = (kind: "enemy" | "pickup"): void => {
    if (kind === "enemy") {
      const worlds = listEditorWorldIndex()
      idInput.innerHTML = [
        `<optgroup label="${t("editor.addAll")}">${allCritterIds()
          .map((id) => `<option value="${id}">${critterLabel(id)}</option>`)
          .join("")}</optgroup>`,
        ...worlds.map(
          (world) =>
            `<optgroup label="${t(world.titleKey)}">${world.critters
              .map((id) => `<option value="${id}">${critterLabel(id)}</option>`)
              .join("")}</optgroup>`,
        ),
      ].join("")
      return
    }
    const worlds = listEditorWorldIndex()
    idInput.innerHTML = [
      `<optgroup label="${t("editor.addAll")}">${allItemIds()
        .map((id) => `<option value="${id}">${itemLabel(id)}</option>`)
        .join("")}</optgroup>`,
      ...worlds.map(
        (world) =>
          `<optgroup label="${t(world.titleKey)}">${world.items
            .map((id) => `<option value="${id}">${itemLabel(id)}</option>`)
            .join("")}</optgroup>`,
      ),
    ].join("")
  }

  const fillLook = (): void => {
    lookEnv.value = overlay.look?.env ?? session.env
    lookSky.value = overlay.look?.sky ?? ""
    lookHour.value = overlay.look?.hour ?? ""
    lookWeather.value = overlay.look?.weather ?? ""
    lookNight.checked = overlay.look?.night !== false
    lookGlow.checked = overlay.look?.lanternGlow === true
  }

  const fillInspect = (): void => {
    mapWidthInput.value = String(overlay.worldWidth)
    fillLook()
    const idLabel = idInput.closest("label")
    const assetLabel = assetInput.closest("label")
    const rotLabel = rotInput.closest("label")
    const currentLabel = currentInput.closest("label")
    if (!selected) {
      hint.textContent = t("editor.selected.none")
      xInput.disabled = true
      yInput.disabled = true
      wInput.disabled = true
      hInput.disabled = true
      rotInput.disabled = true
      assetInput.disabled = true
      idInput.disabled = true
      currentInput.disabled = true
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
    } else if (selected.kind === "pool" && overlay.moonPool) {
      const origin = session.world.chunkOrigins[overlay.moonPool.chunk] ?? 0
      hint.textContent = t("editor.kind.pool")
      xInput.value = String(origin + overlay.moonPool.x)
      yInput.value = String(overlay.moonPool.y)
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
      hint.textContent = rect.kind === "wall" ? t("editor.kind.wall") : t("editor.kind.platform")
      xInput.value = String(rect.x)
      yInput.value = String(rect.y)
      wInput.value = String(rect.w)
      hInput.value = String(rect.h)
      rotInput.value = String(rect.rotation ?? 0)
      assetInput.value = rect.asset ?? (rect.kind === "wall" ? "hedge" : "ground")
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
    if (overlay.moonPool && session.moonPool) {
      const origin = session.world.chunkOrigins[overlay.moonPool.chunk] ?? 0
      if (
        Phaser.Math.Distance.Between(wx, wy, origin + overlay.moonPool.x, overlay.moonPool.y) < 40
      ) {
        return { kind: "pool", index: 0 }
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

  const moveSelection = (sel: Selection, wx: number, wy: number): void => {
    const x = snap10(wx - grabX)
    const y = snap10(wy - grabY)
    if (sel.kind === "spawn") {
      overlay.playerSpawn = { x, y }
    } else if (sel.kind === "pool") {
      overlay.moonPool = worldToAnchor(session.world, x, y)
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
    grabX = 0
    grabY = 0
    if (selected.kind === "platform") {
      const rect = overlay.platforms[selected.index]
      if (rect) {
        rect.x = x
        rect.y = y
        rect.w = w
        rect.h = h
        rect.rotation = Number(rotInput.value) || 0
        rect.asset = assetInput.value as AssembledRect["asset"]
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

  const fillStations = (worldId: EditorWorldId, selectedId: string): void => {
    const stations = stationsForWorld(worldId)
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

  const worlds = listEditorWorldIndex()
  const currentWorld = editorWorldIdForLevel(session.level)
  worldIdEl.innerHTML = worlds
    .map(
      (world) =>
        `<option value="${world.id}" ${world.id === currentWorld ? "selected" : ""}>${t(world.titleKey)}</option>`,
    )
    .join("")
  fillStations(currentWorld, session.level.id)
  setLastEditorStation(session.level.id)

  worldIdEl.onchange = () => {
    const worldId = worldIdEl.value as EditorWorldId
    fillStations(worldId, stationIdEl.value)
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

  const closeAddMenus = (): void => {
    envMenu.hidden = true
    critterMenu.hidden = true
    envMenuBtn.setAttribute("aria-expanded", "false")
    critterMenuBtn.setAttribute("aria-expanded", "false")
  }

  const toggleMenu = (
    panel: HTMLElement,
    btn: HTMLButtonElement,
    other: HTMLElement,
    otherBtn: HTMLButtonElement,
  ): void => {
    const open = panel.hidden
    other.hidden = true
    otherBtn.setAttribute("aria-expanded", "false")
    panel.hidden = !open
    btn.setAttribute("aria-expanded", String(open))
  }

  envMenuBtn.onclick = (event) => {
    event.stopPropagation()
    toggleMenu(envMenu, envMenuBtn, critterMenu, critterMenuBtn)
  }
  critterMenuBtn.onclick = (event) => {
    event.stopPropagation()
    toggleMenu(critterMenu, critterMenuBtn, envMenu, envMenuBtn)
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
    if (kind === "platform") {
      overlay.platforms.push({ kind: "platform", x: at.x - 60, y: at.y, w: 120, h: 24 })
      restart("build")
      return
    }
    if (kind === "wall") {
      overlay.platforms.push({ kind: "wall", x: at.x, y: at.y - 60, w: 28, h: 120 })
      restart("build")
      return
    }
    if (kind === "bridge") {
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
      })
      restart("build")
      return
    }
    if (kind === "water") {
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
      })
      restart("build")
      return
    }
    overlay.decor = overlay.decor ?? []
    overlay.decor.push(defaultDecor(kind as AssembledDecor["kind"], at.x, at.y))
    restart("build")
  }

  const onAddClick = (event: Event): void => {
    const target = (event.target as HTMLElement).closest("[data-add]")
    if (!(target instanceof HTMLElement)) {
      return
    }
    const token = target.getAttribute("data-add")
    if (token) {
      addToken(token)
    }
  }
  envMenu.addEventListener("click", onAddClick)
  critterMenu.addEventListener("click", onAddClick)
  const onDocPointer = (event: PointerEvent): void => {
    const node = event.target as Node | null
    if (
      node &&
      (envMenu.contains(node) ||
        critterMenu.contains(node) ||
        envMenuBtn.contains(node) ||
        critterMenuBtn.contains(node))
    ) {
      return
    }
    closeAddMenus()
  }
  document.addEventListener("pointerdown", onDocPointer)

  requireEl<HTMLButtonElement>(root, "[data-ui=undo]").onclick = () => {
    if (!selected || !baseline || !sameSel(baseline.sel, selected)) {
      return
    }
    restoreItem(selected, baseline.snap)
    getAudio().playSfx("cancel")
    syncSelection()
    persist()
    fillInspect()
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=delete]").onclick = () => {
    if (!selected) {
      return
    }
    if (selected.kind === "platform") {
      overlay.platforms.splice(selected.index, 1)
    } else if (selected.kind === "mover") {
      overlay.movers.splice(selected.index, 1)
    } else if (selected.kind === "enemy") {
      overlay.enemies.splice(selected.index, 1)
    } else if (selected.kind === "pickup") {
      overlay.pickups.splice(selected.index, 1)
    } else if (selected.kind === "decor") {
      overlay.decor?.splice(selected.index, 1)
    } else if (selected.kind === "hazard") {
      overlay.hazards?.splice(selected.index, 1)
    } else {
      return
    }
    restart("build")
  }

  xInput.onchange = applyInspect
  yInput.onchange = applyInspect
  wInput.onchange = applyInspect
  hInput.onchange = applyInspect
  rotInput.onchange = applyInspect
  assetInput.onchange = applyInspect
  currentInput.onchange = applyInspect
  const applyLook = (): void => {
    overlay.look = {
      env: lookEnv.value,
      sky: lookSky.value || undefined,
      hour: (lookHour.value || undefined) as PaletteHour | undefined,
      weather: (lookWeather.value || undefined) as WeatherPreset | undefined,
      night: lookNight.checked,
      lanternGlow: lookGlow.checked,
    }
    persist()
    restart("build")
  }
  lookEnv.onchange = applyLook
  lookSky.onchange = applyLook
  lookHour.onchange = applyLook
  lookWeather.onchange = applyLook
  lookNight.onchange = applyLook
  lookGlow.onchange = applyLook
  mapWidthInput.onchange = () => {
    const width = Math.max(480, snap10(Number(mapWidthInput.value) || overlay.worldWidth))
    overlay.worldWidth = width
    restart("build")
  }
  idInput.onchange = () => {
    if (selected?.kind === "enemy") {
      const enemy = overlay.enemies[selected.index]
      if (!enemy) {
        return
      }
      enemy.id = idInput.value
      restart("build")
      return
    }
    if (selected?.kind === "pickup") {
      const pickup = overlay.pickups[selected.index]
      if (!pickup) {
        return
      }
      pickup.id = idInput.value
      restart("build")
    }
  }

  const onDown = (pointer: Phaser.Input.Pointer): void => {
    if (session.mode !== "build") {
      return
    }
    const worldPoint = session.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const hit = pickAt(worldPoint.x, worldPoint.y)
    if (hit) {
      adoptSelection(hit)
      dragging = hit
      if (hit.kind === "spawn") {
        grabX = worldPoint.x - overlay.playerSpawn.x
        grabY = worldPoint.y - overlay.playerSpawn.y
      } else if (hit.kind === "pool" && overlay.moonPool) {
        const origin = session.world.chunkOrigins[overlay.moonPool.chunk] ?? 0
        grabX = worldPoint.x - (origin + overlay.moonPool.x)
        grabY = worldPoint.y - overlay.moonPool.y
      } else if (hit.kind === "exit") {
        const origin = session.world.chunkOrigins[overlay.exit.chunk] ?? 0
        grabX = worldPoint.x - (origin + overlay.exit.x)
        grabY = worldPoint.y - overlay.exit.y
      } else if (hit.kind === "platform") {
        const rect = overlay.platforms[hit.index]
        grabX = worldPoint.x - (rect?.x ?? 0)
        grabY = worldPoint.y - (rect?.y ?? 0)
      } else if (hit.kind === "mover") {
        const mover = overlay.movers[hit.index]
        grabX = worldPoint.x - (mover?.worldX ?? 0)
        grabY = worldPoint.y - (mover?.worldY ?? 0)
      } else if (hit.kind === "enemy") {
        const enemy = overlay.enemies[hit.index]
        grabX = worldPoint.x - (enemy?.worldX ?? 0)
        grabY = worldPoint.y - (enemy?.worldY ?? 0)
      } else if (hit.kind === "pickup") {
        const pickup = overlay.pickups[hit.index]
        grabX = worldPoint.x - (pickup?.worldX ?? 0)
        grabY = worldPoint.y - (pickup?.worldY ?? 0)
      } else if (hit.kind === "decor") {
        const item = overlay.decor?.[hit.index]
        grabX = worldPoint.x - (item?.x ?? 0)
        grabY = worldPoint.y - (item?.y ?? 0)
      } else if (hit.kind === "hazard") {
        const item = overlay.hazards?.[hit.index]
        grabX = worldPoint.x - (item?.worldX ?? 0)
        grabY = worldPoint.y - (item?.worldY ?? 0)
      }
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

  const onUp = (): void => {
    if (dragging) {
      persist()
    }
    dragging = null
    panning = false
  }

  session.scene.input.on("pointerdown", onDown)
  session.scene.input.on("pointermove", onMove)
  session.scene.input.on("pointerup", onUp)
  session.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    document.removeEventListener("pointerdown", onDocPointer)
    session.scene.input.off("pointerdown", onDown)
    session.scene.input.off("pointermove", onMove)
    session.scene.input.off("pointerup", onUp)
    marks.destroy()
  })
}
