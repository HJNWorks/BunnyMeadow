import { getPlatform } from "./platform"

export type FurOption = "cream" | "brown" | "gray" | "moon-white"
export type EarsOption = "upright" | "lop" | "tufted"
export type AccessoryOption = "none" | "scarf" | "lantern" | "blossom" | "osmanthus" | "moon-helmet"
export type DifficultyId = "sprout" | "hopper" | "wildhare" | "moonlit" | "hardcore"
export type LanguageId = "en" | "de" | "zh"

export type Bindings = {
  moveUp: string[]
  moveDown: string[]
  moveLeft: string[]
  moveRight: string[]
  dash: string[]
  jump: string[]
  pause: string[]
  confirm: string[]
  cancel: string[]
  gamepadDash: number
  gamepadJump: number
  gamepadPause: number
  gamepadConfirm: number
  gamepadCancel: number
}

export type AccessibilitySettings = {
  invincible: boolean
  slowTime: boolean
  autoDash: boolean
  highContrast: boolean
  reducedMotion: boolean
  largerText: boolean
  oneButtonTouch: boolean
}

export type EndlessRun = {
  name: string
  distance: number
  seed: number
  date: string
}

export type SaveV1 = {
  version: 1
  slot: number
  updatedAt: string
  player: {
    name: string
    fur: FurOption
    ears: EarsOption
    accessory: AccessoryOption
    equippedDash: string
  }
  settings: {
    difficulty: DifficultyId
    difficultyOverrides: Record<string, number>
    accessibility: AccessibilitySettings
    audio: { master: number; music: number; sfx: number; muted: boolean }
    language: LanguageId
    theme: "light" | "dark"
    bindings: Bindings
  }
  progress: {
    pantryLevel: number
    pantryCarrots: number
    meadowMapsUnlocked: string[]
    story: {
      world: number
      level: number
      cleared: string[]
      checkpoints: Record<string, string>
      controlHints: string[]
      keepsakes: string[]
      devUnlockAll: boolean
      times: {
        best: Record<string, number>
        attempts: Record<string, number[]>
      }
    }
    tasksCompleted: string[]
    bunnyJumpBest: number
    endlessBest: number
    endlessRuns: Record<DifficultyId, EndlessRun[]>
    achievements: string[]
  }
}

export type MetaSettings = {
  activeSlot: number
}

export const SAVE_KEY_PREFIX = "bunnymeadow.save."
export const META_KEY = "bunnymeadow.settings"

export const DEFAULT_BINDINGS: Bindings = {
  moveUp: ["KeyW", "ArrowUp"],
  moveDown: ["KeyS", "ArrowDown"],
  moveLeft: ["KeyA", "ArrowLeft"],
  moveRight: ["KeyD", "ArrowRight"],
  dash: ["KeyR"],
  jump: ["Space"],
  pause: ["KeyP"],
  confirm: ["Enter"],
  cancel: ["Escape"],
  gamepadDash: 0,
  gamepadJump: 2,
  gamepadPause: 9,
  gamepadConfirm: 0,
  gamepadCancel: 1,
}

export function createDefaultSave(slot = 0): SaveV1 {
  return {
    version: 1,
    slot,
    updatedAt: new Date().toISOString(),
    player: {
      name: "Mei",
      fur: "cream",
      ears: "upright",
      accessory: "none",
      equippedDash: "meadow",
    },
    settings: {
      difficulty: "hopper",
      difficultyOverrides: {},
      accessibility: {
        invincible: false,
        slowTime: false,
        autoDash: false,
        highContrast: false,
        reducedMotion: false,
        largerText: false,
        oneButtonTouch: false,
      },
      audio: { master: 1, music: 0.8, sfx: 1, muted: false },
      language: "en",
      theme: "light",
      bindings: { ...DEFAULT_BINDINGS, moveUp: [...DEFAULT_BINDINGS.moveUp], moveDown: [...DEFAULT_BINDINGS.moveDown], moveLeft: [...DEFAULT_BINDINGS.moveLeft], moveRight: [...DEFAULT_BINDINGS.moveRight], dash: [...DEFAULT_BINDINGS.dash], jump: [...DEFAULT_BINDINGS.jump], pause: [...DEFAULT_BINDINGS.pause], confirm: [...DEFAULT_BINDINGS.confirm], cancel: [...DEFAULT_BINDINGS.cancel] },
    },
    progress: {
      pantryLevel: 1,
      pantryCarrots: 0,
      meadowMapsUnlocked: ["meadow_home"],
      story: {
        world: 1,
        level: 1,
        cleared: [],
        checkpoints: {},
        controlHints: [],
        keepsakes: [],
        devUnlockAll: false,
        times: { best: {}, attempts: {} },
      },
      tasksCompleted: [],
      bunnyJumpBest: 0,
      endlessBest: 0,
      endlessRuns: {
        sprout: [],
        hopper: [],
        wildhare: [],
        moonlit: [],
        hardcore: [],
      },
      achievements: [],
    },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function migrateStoryTimes(raw: unknown): SaveV1["progress"]["story"]["times"] {
  const best: Record<string, number> = {}
  const attempts: Record<string, number[]> = {}
  if (!isObject(raw)) {
    return { best, attempts }
  }
  if (isObject(raw.best)) {
    for (const [id, value] of Object.entries(raw.best)) {
      if (typeof value === "number" && value >= 0) {
        best[id] = value
      }
    }
  }
  if (isObject(raw.attempts)) {
    for (const [id, value] of Object.entries(raw.attempts)) {
      if (!Array.isArray(value)) {
        continue
      }
      const row = value.filter((item) => typeof item === "number" && item >= 0)
      if (row.length) {
        attempts[id] = row
      }
    }
  }
  return { best, attempts }
}

export function migrateSave(raw: unknown, slot = 0): SaveV1 {
  const fallback = createDefaultSave(slot)
  if (!isObject(raw)) {
    return fallback
  }
  if (raw.version !== 1) {
    return fallback
  }
  const base = createDefaultSave(typeof raw.slot === "number" ? raw.slot : slot)
  try {
    const merged = {
      ...base,
      ...raw,
      version: 1 as const,
      slot: typeof raw.slot === "number" ? raw.slot : slot,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
      player: { ...base.player, ...(isObject(raw.player) ? raw.player : {}) },
      settings: {
        ...base.settings,
        ...(isObject(raw.settings) ? raw.settings : {}),
        accessibility: {
          ...base.settings.accessibility,
          ...(isObject(raw.settings) && isObject(raw.settings.accessibility)
            ? raw.settings.accessibility
            : {}),
        },
        audio: {
          ...base.settings.audio,
          ...(isObject(raw.settings) && isObject(raw.settings.audio) ? raw.settings.audio : {}),
        },
        bindings: {
          ...base.settings.bindings,
          ...(isObject(raw.settings) && isObject(raw.settings.bindings) ? raw.settings.bindings : {}),
        },
        theme:
          isObject(raw.settings) && raw.settings.theme === "dark" ? "dark" : "light",
        difficultyOverrides:
          isObject(raw.settings) && isObject(raw.settings.difficultyOverrides)
            ? (raw.settings.difficultyOverrides as Record<string, number>)
            : {},
      },
      progress: {
        ...base.progress,
        ...(isObject(raw.progress) ? raw.progress : {}),
        story: {
          ...base.progress.story,
          ...(isObject(raw.progress) && isObject(raw.progress.story) ? raw.progress.story : {}),
          checkpoints: {},
          controlHints:
            isObject(raw.progress) &&
            isObject(raw.progress.story) &&
            Array.isArray(raw.progress.story.controlHints)
              ? (raw.progress.story.controlHints as string[]).filter((value) => typeof value === "string")
              : [],
          devUnlockAll:
            isObject(raw.progress) &&
            isObject(raw.progress.story) &&
            raw.progress.story.devUnlockAll === true,
          times: migrateStoryTimes(
            isObject(raw.progress) && isObject(raw.progress.story) ? raw.progress.story.times : undefined,
          ),
        },
      },
    } as SaveV1
    const dash = merged.settings.bindings.dash ?? []
    const jump = merged.settings.bindings.jump ?? []
    const stockOldDash = dash.length === 1 && dash[0] === "Space"
    const stockOldJump = jump.length === 1 && jump[0] === "KeyK"
    if (stockOldDash && stockOldJump) {
      merged.settings.bindings.dash = [...DEFAULT_BINDINGS.dash]
      merged.settings.bindings.jump = [...DEFAULT_BINDINGS.jump]
    }
    if (!Array.isArray(merged.progress.story.cleared)) {
      merged.progress.story.cleared = []
    }
    if (!Array.isArray(merged.progress.story.keepsakes)) {
      merged.progress.story.keepsakes = []
    } else {
      merged.progress.story.keepsakes = merged.progress.story.keepsakes.filter(
        (value) => typeof value === "string",
      )
    }
    const presets: DifficultyId[] = ["sprout", "hopper", "wildhare", "moonlit", "hardcore"]
    const rawRuns = isObject(merged.progress.endlessRuns)
      ? (merged.progress.endlessRuns as Record<string, unknown>)
      : {}
    const runs = {} as Record<DifficultyId, EndlessRun[]>
    for (const preset of presets) {
      const list = Array.isArray(rawRuns[preset]) ? (rawRuns[preset] as unknown[]) : []
      runs[preset] = list
        .filter(
          (entry): entry is EndlessRun =>
            isObject(entry) &&
            typeof entry.name === "string" &&
            typeof entry.distance === "number" &&
            typeof entry.seed === "number" &&
            typeof entry.date === "string",
        )
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 10)
    }
    merged.progress.endlessRuns = runs
    if (typeof merged.progress.endlessBest !== "number") {
      merged.progress.endlessBest = 0
    }
    if (typeof merged.progress.bunnyJumpBest !== "number" || merged.progress.bunnyJumpBest < 0) {
      merged.progress.bunnyJumpBest = 0
    }
    merged.settings.audio.muted = merged.settings.audio.muted === true
    if (typeof merged.player.equippedDash !== "string" || !merged.player.equippedDash) {
      merged.player.equippedDash = "meadow"
    }
    const accessories: AccessoryOption[] = ["none", "scarf", "lantern", "blossom", "osmanthus", "moon-helmet"]
    if (!accessories.includes(merged.player.accessory)) {
      merged.player.accessory = "none"
    }
    const cleared = merged.progress.story.cleared
    const hasW1Progress = cleared.some((id) => typeof id === "string" && id.startsWith("w1_"))
    if (hasW1Progress) {
      for (const id of ["w0_setting", "w0_lore_moon", "w0_controls"]) {
        if (!cleared.includes(id)) {
          cleared.push(id)
        }
      }
    }
    return merged
  } catch {
    return fallback
  }
}

export async function loadMeta(): Promise<MetaSettings> {
  const raw = await getPlatform().save.read(META_KEY)
  if (!raw) {
    return { activeSlot: 0 }
  }
  try {
    const parsed = JSON.parse(raw) as MetaSettings
    return { activeSlot: typeof parsed.activeSlot === "number" ? parsed.activeSlot : 0 }
  } catch {
    return { activeSlot: 0 }
  }
}

export async function writeMeta(meta: MetaSettings): Promise<void> {
  await getPlatform().save.write(META_KEY, JSON.stringify(meta))
}

export async function loadSlot(slot: number): Promise<SaveV1> {
  const raw = await getPlatform().save.read(`${SAVE_KEY_PREFIX}${slot}`)
  if (!raw) {
    return createDefaultSave(slot)
  }
  try {
    return migrateSave(JSON.parse(raw) as unknown, slot)
  } catch {
    return createDefaultSave(slot)
  }
}

export async function writeSlot(save: SaveV1): Promise<void> {
  save.updatedAt = new Date().toISOString()
  await getPlatform().save.write(`${SAVE_KEY_PREFIX}${save.slot}`, JSON.stringify(save))
}

export async function loadActiveSave(): Promise<SaveV1> {
  const meta = await loadMeta()
  const save = await loadSlot(meta.activeSlot)
  const unlocked = await getPlatform().achievements.listUnlocked()
  const set = new Set([...save.progress.achievements, ...unlocked])
  save.progress.achievements = [...set]
  return save
}
