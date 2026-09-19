import tasksData from "../../data/tasks.json"
import { getDifficulty } from "../../core/difficulty"
import { getSave } from "../../core/session"
import { isMapUnlocked } from "../../core/unlocks"
import type { DifficultyParams } from "../../core/difficulty"

export type TaskId = "carrot_rush" | "hide_and_seek" | "night_watch" | "lantern_run" | "daily_moon" | "bunny_jump"

export type TaskKind = "night_watch" | "hide_and_seek" | "bunny_jump"

export type TaskDefRaw = {
  id: TaskId
  name: string
  description: string
  mapId: string
  fallbackMapId?: string
  kind: TaskKind
  baseKitCount?: number
  baseSurviveSeconds?: number
  baseTimerSeconds: number
  enemyCountScale: number
  waveIntervalSeconds?: number
  pantryReward: number
}

export type ResolvedTask = {
  id: TaskId
  name: string
  description: string
  kind: TaskKind
  mapId: string
  kitCount: number
  timerSeconds: number
  enemyCount: number
  enemyIds: string[]
  waveIntervalSeconds: number
  pantryReward: number
  difficulty: DifficultyParams
}

const PLAYABLE: TaskId[] = ["night_watch", "hide_and_seek", "bunny_jump"]

const defs = new Map(
  (tasksData.tasks as TaskDefRaw[]).map((task) => [task.id, task]),
)

export class TaskRunner {
  list(): TaskId[] {
    return PLAYABLE.filter((id) => defs.has(id))
  }

  getDef(id: TaskId): TaskDefRaw | undefined {
    return defs.get(id)
  }

  start(id: TaskId): { ok: true; task: ResolvedTask } | { ok: false; reason: string } {
    const raw = defs.get(id)
    if (!raw || !PLAYABLE.includes(id)) {
      return { ok: false, reason: "Task is not available yet." }
    }
    const save = getSave()
    const difficulty = getDifficulty(save)
    let mapId = raw.mapId
    if (raw.fallbackMapId && !isMapUnlocked(save, mapId)) {
      mapId = raw.fallbackMapId
    }
    const kitCount = Math.max(
      3,
      Math.round((raw.baseKitCount ?? 5) * (0.8 + difficulty.enemyCountMultiplier * 0.2)),
    )
    const surviveBase = raw.baseSurviveSeconds ?? raw.baseTimerSeconds
    const timerSeconds =
      raw.kind === "night_watch"
        ? Math.max(25, Math.round(surviveBase * (2 - difficulty.timerMultiplier * 0.5)))
        : raw.baseTimerSeconds <= 0
          ? 0
          : Math.max(20, Math.round(raw.baseTimerSeconds * difficulty.timerMultiplier))
    const enemyCount = Math.max(
      1,
      Math.round(difficulty.enemyCount * raw.enemyCountScale * difficulty.enemyCountMultiplier),
    )
    const waveIntervalSeconds = Math.max(
      6,
      Math.round((raw.waveIntervalSeconds ?? 12) * difficulty.timerMultiplier),
    )
    return {
      ok: true,
      task: {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        kind: raw.kind,
        mapId,
        kitCount: raw.kind === "hide_and_seek" ? kitCount : 0,
        timerSeconds,
        enemyCount,
        enemyIds: [...difficulty.enemyIds],
        waveIntervalSeconds,
        pantryReward: raw.pantryReward,
        difficulty,
      },
    }
  }
}
