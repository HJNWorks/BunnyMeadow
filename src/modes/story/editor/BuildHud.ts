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
import {
  crittersForEnv,
  itemsForEnv,
  optionGroupHtml,
  CRITTER_LABELS,
  ITEM_LABELS,
} from "./roster"
import { defaultDecor, DECOR_LABELS, PLATFORM_ASSETS } from "./placeables"
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
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.bm-editor-hud .bm-editor-inspect label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 2px;
}
.bm-editor-hud .bm-editor-inspect input,
.bm-editor-hud .bm-editor-inspect select {
  width: 88px;
}
.bm-editor-hud .bm-editor-inspect input.wide,
.bm-editor-hud .bm-editor-inspect select.wide {
  width: 140px;
}
.bm-editor-hud .bm-btn[aria-pressed="true"] {
  outline: 2px solid #34583e;
}
`

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
  const { root } = mountDomShell(
    session.scene,
    `
    <div class="bm-editor-dock">
      <div class="bm-editor-inspect" data-ui="inspect" ${session.mode === "build" ? "" : "hidden"}>
        <span data-ui="hint">${t("editor.selected.none")}</span>
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
        <label class="bm-check"><input type="checkbox" data-ui="lookNight" /> ${t("editor.look.night")}</label>
        <label class="bm-check"><input type="checkbox" data-ui="lookGlow" /> ${t("editor.look.glow")}</label>
        <label>${t("editor.mapWidth")} <input data-ui="mapWidth" type="number" step="10" min="480" /></label>
        <button type="button" class="bm-btn ghost" data-ui="undo">${t("editor.undo")}</button>
        <button type="button" class="bm-btn ghost" data-ui="delete">${t("editor.delete")}</button>
      </div>
      <div class="bm-editor-bar">
        <button type="button" class="bm-btn" data-ui="play" aria-pressed="${session.mode === "play"}">${t("editor.play")}</button>
        <button type="button" class="bm-btn" data-ui="build" aria-pressed="${session.mode === "build"}">${t("editor.build")}</button>
        <button type="button" class="bm-btn" data-ui="addPlatform">${t("editor.addPlatform")}</button>
        <button type="button" class="bm-btn" data-ui="addWall">${t("editor.addWall")}</button>
        <button type="button" class="bm-btn" data-ui="addBridge">${t("editor.addBridge")}</button>
        <button type="button" class="bm-btn" data-ui="addEnemy">${t("editor.addEnemy")}</button>
        <button type="button" class="bm-btn" data-ui="addItem">${t("editor.addItem")}</button>
        <button type="button" class="bm-btn" data-ui="addHedge">${t("editor.addHedge")}</button>
        <button type="button" class="bm-btn" data-ui="addWater">${t("editor.addWater")}</button>
        <button type="button" class="bm-btn" data-ui="addGrass">${t("editor.addGrass")}</button>
        <button type="button" class="bm-btn" data-ui="addLantern">${t("editor.addLantern")}</button>
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
  const addBtns = [
    "addPlatform",
    "addWall",
    "addBridge",
    "addEnemy",
    "addItem",
    "addHedge",
    "addWater",
    "addGrass",
    "addLantern",
  ] as const
  for (const ui of addBtns) {
    requireEl<HTMLButtonElement>(root, `[data-ui=${ui}]`).hidden = session.mode !== "build"
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=delete]").hidden = session.mode !== "build"
  const undoBtn = requireEl<HTMLButtonElement>(root, "[data-ui=undo]")
  undoBtn.hidden = session.mode !== "build"

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
      return
    }
    undoBtn.disabled = JSON.stringify(captureItem(selected)) === JSON.stringify(baseline.snap)
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
      const lists = crittersForEnv(session.env)
      idInput.innerHTML = optionGroupHtml(
        lists.native,
        lists.other,
        CRITTER_LABELS,
        t("editor.native"),
        t("editor.other"),
      )
      return
    }
    const lists = itemsForEnv(session.env)
    idInput.innerHTML = optionGroupHtml(
      lists.native,
      lists.other,
      ITEM_LABELS,
      t("editor.native"),
      t("editor.other"),
    )
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
    for (let i = overlay.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = overlay.enemies[i]
      if (
        enemy &&
        Phaser.Math.Distance.Between(wx, wy, enemy.worldX, enemy.worldY) < 30
      ) {
        return { kind: "enemy", index: i }
      }
    }
    for (let i = overlay.pickups.length - 1; i >= 0; i -= 1) {
      const pickup = overlay.pickups[i]
      if (
        pickup &&
        Phaser.Math.Distance.Between(wx, wy, pickup.worldX, pickup.worldY) < 28
      ) {
        return { kind: "pickup", index: i }
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
  requireEl<HTMLButtonElement>(root, "[data-ui=addPlatform]").onclick = () => {
    const at = cameraCenter()
    overlay.platforms.push({ kind: "platform", x: at.x - 60, y: at.y, w: 120, h: 24 })
    restart("build")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=addWall]").onclick = () => {
    const at = cameraCenter()
    overlay.platforms.push({ kind: "wall", x: at.x, y: at.y - 60, w: 28, h: 120 })
    restart("build")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=addBridge]").onclick = () => {
    const at = cameraCenter()
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
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=addEnemy]").onclick = () => {
    const at = cameraCenter()
    const local = worldToAnchor(session.world, at.x, at.y)
    const id = crittersForEnv(session.env).native[0] ?? "fox"
    overlay.enemies.push({
      id,
      x: local.x,
      y: at.y,
      worldX: at.x,
      worldY: at.y,
    })
    restart("build")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=addItem]").onclick = () => {
    const at = cameraCenter()
    const local = worldToAnchor(session.world, at.x, at.y)
    const id = itemsForEnv(session.env).native[0] ?? "carrot"
    overlay.pickups.push({
      id,
      x: local.x,
      y: at.y,
      worldX: at.x,
      worldY: at.y,
    })
    restart("build")
  }
  const addDecor = (kind: AssembledDecor["kind"]): void => {
    const at = cameraCenter()
    overlay.decor = overlay.decor ?? []
    overlay.decor.push(defaultDecor(kind, at.x, at.y))
    restart("build")
  }
  requireEl<HTMLButtonElement>(root, "[data-ui=addHedge]").onclick = () => addDecor("hedge")
  requireEl<HTMLButtonElement>(root, "[data-ui=addGrass]").onclick = () => addDecor("grass")
  requireEl<HTMLButtonElement>(root, "[data-ui=addLantern]").onclick = () => addDecor("lantern")
  requireEl<HTMLButtonElement>(root, "[data-ui=addWater]").onclick = () => {
    const at = cameraCenter()
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
  }
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
    session.scene.input.off("pointerdown", onDown)
    session.scene.input.off("pointermove", onMove)
    session.scene.input.off("pointerup", onUp)
    marks.destroy()
  })
}
