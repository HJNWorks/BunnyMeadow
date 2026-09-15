import { createStubScene } from "./StubFactory"

export const WorldMapScene = createStubScene("WorldMap")
export const StoryScene = createStubScene("Story", "WorldMap")
export const TaskSelectScene = createStubScene("TaskSelect")
export const TaskRunScene = createStubScene("TaskRun", "TaskSelect")
export const EndlessScene = createStubScene("Endless")
export const ResultScene = createStubScene("Result")
export const PauseScene = createStubScene("Pause")
export const DialogueOverlayScene = createStubScene("DialogueOverlay")
