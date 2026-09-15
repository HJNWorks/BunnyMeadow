import contentFlags from "../data/contentFlags.json"
import { getAudio } from "./audio"
import { getDifficulty, type DifficultyParams } from "./difficulty"
import { getInput, type InputBus } from "./input"
import { t } from "./i18n"
import type { SaveV1 } from "./save"
import { getSave } from "./session"
import { Spawner } from "../systems/Spawner"

export type ContentFlags = typeof contentFlags

export type ModeContext = {
  save: SaveV1
  difficulty: DifficultyParams
  input: InputBus
  audio: ReturnType<typeof getAudio>
  t: typeof t
  spawner: Spawner
  flags: ContentFlags
}

export function getModeContext(): ModeContext {
  const save = getSave()
  return {
    save,
    difficulty: getDifficulty(save),
    input: getInput(),
    audio: getAudio(),
    t,
    spawner: new Spawner(),
    flags: contentFlags,
  }
}

export function getContentFlags(): ContentFlags {
  return contentFlags
}
