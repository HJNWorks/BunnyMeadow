import { t } from "../../../core/i18n"
import { listStoryLevels, getStoryLevel, type StoryLevelDef } from "../levels"
import { listAllWorlds, listWorlds, getStation, type StoryChapterId, type StoryWorldId, worldIdForLevelId } from "../path"
import { storyEnvForLevel } from "../shared/themeKit"
import {
  ALL_CRITTERS,
  ALL_ITEMS,
  CRITTER_CHAPTERS,
  CRITTER_LABELS,
  ITEM_LABELS,
  crittersForEnv,
  itemsForEnv,
} from "./roster"
import { DECOR_LABELS, EDITOR_ENV_KITS, placeablesForEnv, type EditorEnvToken } from "./placeables"
import type { AssembledDecor } from "../../../systems/ChunkAssembler"

export type EditorWorldId = StoryWorldId
export type { EditorEnvToken }

export type EditorWorldEntry = {
  id: EditorWorldId
  titleKey: string
  stations: StoryLevelDef[]
  envs: string[]
  critters: string[]
  items: string[]
  placeables: AssembledDecor["kind"][]
}

const LAST_STATION_KEY = "bunnymeadow.editor.lastStation.v1"

const SHARED_ENV: EditorEnvToken[] = [
  "platform",
  "wall",
  "ceiling",
  "bridge",
  "water",
  "hedge",
  "vine",
  "grass",
  "log",
  "burrow",
  "lantern",
  "pool",
  "falseMouth",
]

export function editorChapterForLevel(level: StoryLevelDef): StoryChapterId {
  if (level.id.startsWith("ch3_")) {
    return "ch3"
  }
  return level.id.startsWith("ch2_") ? "ch2" : "ch1"
}

export function editorWorldIdForLevel(level: StoryLevelDef): EditorWorldId {
  return worldIdForLevelId(level.id)
}

export function envForEditorLevel(level: StoryLevelDef): string {
  return level.env ?? storyEnvForLevel(level.world, level.index, level.id)
}

export function listEditorWorldIndex(chapter?: StoryChapterId): EditorWorldEntry[] {
  const playable = new Map(listStoryLevels().map((level) => [level.id, level]))
  const worlds = chapter ? listWorlds("ink", chapter) : listAllWorlds()
  return worlds.map((world) => {
    const stations = world.stationIds
      .map((id) => getStation(id))
      .map((station) => (station?.levelId ? playable.get(station.levelId) : undefined))
      .filter((level): level is StoryLevelDef => Boolean(level))
    const envs = [...new Set(stations.map((level) => envForEditorLevel(level)))]
    const critters = [...new Set(envs.flatMap((env) => crittersForEnv(env).native))]
    const items = [...new Set(envs.flatMap((env) => itemsForEnv(env).native))]
    const placeables = [...new Set(envs.flatMap((env) => placeablesForEnv(env)))]
    return {
      id: world.id,
      titleKey: `story.world.${world.id}.title`,
      stations,
      envs,
      critters,
      items,
      placeables,
    }
  })
}

export function stationsForWorld(worldId: EditorWorldId, chapter?: StoryChapterId): StoryLevelDef[] {
  return listEditorWorldIndex(chapter).find((entry) => entry.id === worldId)?.stations ?? []
}

export function getLastEditorStation(): string {
  try {
    const raw = localStorage.getItem(LAST_STATION_KEY)
    if (raw && getStoryLevel(raw)) {
      return raw
    }
  } catch {
    return "w0_controls"
  }
  return "w0_controls"
}

export function setLastEditorStation(id: string): void {
  localStorage.setItem(LAST_STATION_KEY, id)
}

export function sharedEnvTokens(): EditorEnvToken[] {
  return [...SHARED_ENV]
}

export function parseKitToken(token: string): { kind: string; kit: string | null } {
  const at = token.indexOf("@")
  if (at < 0) {
    return { kind: token, kit: null }
  }
  return { kind: token.slice(0, at), kit: token.slice(at + 1) }
}

function optionHtml(value: string, label: string): string {
  return `<option value="${value}">${label}</option>`
}

function groupHtml(label: string, inner: string): string {
  return `<optgroup label="${label}">${inner}</optgroup>`
}

function addItemHtml(token: string, label: string): string {
  return `<button type="button" class="bm-editor-add-item" data-add="${token}">${label}</button>`
}

function detailsHtml(label: string, inner: string): string {
  return `<details><summary>${label}</summary>${inner}</details>`
}

const ENV_CHAPTERS: { id: "ch1" | "ch2" | "ch3"; labelKey: string }[] = [
  { id: "ch1", labelKey: "story.chapter.ch1.title" },
  { id: "ch2", labelKey: "story.chapter.ch2.title" },
  { id: "ch3", labelKey: "story.chapter.ch3.title" },
]

export function additionSelectHtml(): { env: string; creatures: string } {
  const envChapters = ENV_CHAPTERS.map((chapter) => {
    const kits = EDITOR_ENV_KITS.filter((kit) => kit.chapter === chapter.id)
    const inner =
      kits.length === 0
        ? `<p class="bm-editor-tree-empty">${t("mode.soon")}</p>`
        : kits
            .map((kit) =>
              detailsHtml(
                t(kit.labelKey),
                kit.kinds.map((kind) => addItemHtml(`${kind}@${kit.id}`, envTokenLabel(kind))).join(""),
              ),
            )
            .join("")
    return detailsHtml(t(chapter.labelKey), inner)
  }).join("")
  const items = detailsHtml(
    t("editor.envKit.items"),
    ALL_ITEMS.map((id) => addItemHtml(`item:${id}`, itemLabel(id))).join(""),
  )
  const creatures = CRITTER_CHAPTERS.map((chapter) => {
    const inner =
      chapter.groups.length === 0
        ? `<p class="bm-editor-tree-empty">${t("mode.soon")}</p>`
        : chapter.groups
            .map((group) =>
              detailsHtml(
                t(group.labelKey),
                group.ids.map((id) => addItemHtml(`critter:${id}`, critterLabel(id))).join(""),
              ),
            )
            .join("")
    return detailsHtml(t(chapter.labelKey), inner)
  }).join("")
  return {
    env: `${envChapters}${items}`,
    creatures,
  }
}

export function inspectEnemySelectHtml(): string {
  return CRITTER_CHAPTERS.map((chapter) => {
    const ids = chapter.groups.flatMap((group) => group.ids)
    if (!ids.length) {
      return ""
    }
    return groupHtml(
      t(chapter.labelKey),
      ids.map((id) => optionHtml(id, critterLabel(id))).join(""),
    )
  }).join("")
}

export function inspectItemSelectHtml(): string {
  return groupHtml(
    t("editor.envKit.items"),
    ALL_ITEMS.map((id) => optionHtml(id, itemLabel(id))).join(""),
  )
}

export function envTokenLabel(token: string): string {
  if (token === "platform") {
    return "Platform"
  }
  if (token === "wall") {
    return "Wall"
  }
  if (token === "ceiling") {
    return "Ceiling"
  }
  if (token === "falseMouth") {
    return "False mouth"
  }
  if (token === "bridge") {
    return "Bridge"
  }
  if (token === "water") {
    return "Water"
  }
  if (token === "pool") {
    return "Moon Pool"
  }
  if (token in DECOR_LABELS) {
    return DECOR_LABELS[token as keyof typeof DECOR_LABELS]
  }
  return token
}

export function critterLabel(id: string): string {
  return CRITTER_LABELS[id] ?? id
}

export function itemLabel(id: string): string {
  return ITEM_LABELS[id] ?? id
}

export function allCritterIds(): string[] {
  return [...ALL_CRITTERS]
}

export function allItemIds(): string[] {
  return [...ALL_ITEMS]
}
