import difficultyData from "../data/difficulty.json"
import type { DifficultyId, SaveV1 } from "./save"

export type DifficultyParams = {
  hearts: number
  enemyCountMultiplier: number
  enemySpeedMultiplier: number
  detectionRadius: number
  attackCooldown: number
  dashCooldown: number
  invulnerabilityWindow: number
  checkpointDensity: number
  timerMultiplier: number
  bossPhaseCount: number
}

const presets = difficultyData.presets as Record<DifficultyId, DifficultyParams>

export function getDifficulty(save: SaveV1): DifficultyParams {
  const base = presets[save.settings.difficulty] ?? presets.hopper
  const overrides = save.settings.difficultyOverrides
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => typeof value === "number"),
    ),
  } as DifficultyParams
}

export function listDifficultyIds(): DifficultyId[] {
  return Object.keys(presets) as DifficultyId[]
}
