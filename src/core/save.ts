import { getPlatform } from "./platform"

export type FurOption = "cream" | "brown" | "gray" | "moon-white"
export type EarsOption = "upright" | "lop" | "tufted"
export type AccessoryOption = "none" | "scarf" | "lantern" | "blossom"
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

export type SaveV1 = {
  version: 1
  slot: number
  updatedAt: string
  player: {
    name: string
    fur: FurOption
    ears: EarsOption
    accessory: AccessoryOption
  }
  settings: {
    difficulty: DifficultyId
    difficultyOverrides: Record<string, number>
    accessibility: AccessibilitySettings
    audio: { master: number; music: number; sfx: number }
    language: LanguageId
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
    }
    tasksCompleted: string[]
    endlessBest: number
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
      audio: { master: 1, music: 0.8, sfx: 1 },
      language: "en",
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
      },
      tasksCompleted: [],
      endlessBest: 0,
      achievements: [],
    },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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
