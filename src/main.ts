import Phaser from "phaser"
import { initPlatform } from "./core/platform"
import { BootScene } from "./scenes/BootScene"
import { PreloadScene } from "./scenes/PreloadScene"
import { TitleScene } from "./scenes/TitleScene"
import { ModeSelectScene } from "./scenes/ModeSelectScene"
import { SettingsScene } from "./scenes/SettingsScene"
import { CustomizeScene } from "./scenes/CustomizeScene"
import { CreditsScene } from "./scenes/CreditsScene"
import { MeadowScene } from "./modes/meadow/MeadowScene"
import { TaskSelectScene } from "./modes/tasks/TaskSelectScene"
import { TaskRunScene } from "./modes/tasks/TaskRunScene"
import {
  WorldMapScene,
  StoryScene,
  EndlessScene,
  ResultScene,
  PauseScene,
  DialogueOverlayScene,
} from "./scenes/stubs"

initPlatform()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#1a2418",
  input: {
    gamepad: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    ModeSelectScene,
    SettingsScene,
    CustomizeScene,
    CreditsScene,
    MeadowScene,
    WorldMapScene,
    StoryScene,
    TaskSelectScene,
    TaskRunScene,
    EndlessScene,
    ResultScene,
    PauseScene,
    DialogueOverlayScene,
  ],
}

new Phaser.Game(config)
