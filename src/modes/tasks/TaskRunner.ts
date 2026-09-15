import tasksData from "../../data/tasks.json"
import { getDifficulty } from "../../core/difficulty"
import { getSave } from "../../core/session"
import { isMapUnlocked } from "../../core/unlocks"
import type { DifficultyParams } from "../../core/difficulty"

export type TaskId = "carrot_rush" | "hide_and_seek" | "night_watch" | "lantern_run" | "daily_moon"

export type TaskKind = "carrot_rush" | "hide_and_seek"

export type TaskDefRaw = {
  id: TaskId
  name: string
  description: string
  mapId: string
  fallbackMapId?: string
  kind: TaskKind
  baseCarrotGoal?: number
  baseKitCount?: number
  baseTimerSeconds: number
  enemyCountScale: number
  pantryReward: number
}

export type ResolvedTask = {
  id: TaskId
  name: string
  description: string
  kind: TaskKind
  mapId: string
  carrotGoal: number
  kitCount: number
  timerSeconds: number
  enemyCount: number
  enemyIds: string[]
  pantryReward: number
  difficulty: DifficultyParams
}

const PLAYABLE: TaskId[] = ["carrot_rush", "hide_and_seek"]

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
    const carrotGoal = Math.max(
      4,
      Math.round((raw.baseCarrotGoal ?? 10) * (0.75 + difficulty.enemyCountMultiplier * 0.25)),
    )
    const kitCount = Math.max(
      3,
      Math.round((raw.baseKitCount ?? 5) * (0.8 + difficulty.enemyCountMultiplier * 0.2)),
    )
    const timerSeconds =
      raw.baseTimerSeconds <= 0
        ? 0
        : Math.max(20, Math.round(raw.baseTimerSeconds * difficulty.timerMultiplier))
    const enemyCount = Math.max(
      0,
      Math.round(difficulty.enemyCount * raw.enemyCountScale * difficulty.enemyCountMultiplier),
    )
    return {
      ok: true,
      task: {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        kind: raw.kind,
        mapId,
        carrotGoal: raw.kind === "carrot_rush" ? carrotGoal : 0,
        kitCount: raw.kind === "hide_and_seek" ? kitCount : 0,
        timerSeconds,
        enemyCount,
        enemyIds: [...difficulty.enemyIds],
        pantryReward: raw.pantryReward,
        difficulty,
      },
    }
  }
}
