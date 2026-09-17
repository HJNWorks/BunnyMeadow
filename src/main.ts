import Phaser from "phaser"
import { initPlatform } from "./core/platform"
import { BootScene } from "./scenes/BootScene"
import { PreloadScene } from "./scenes/PreloadScene"
import { TitleScene } from "./scenes/TitleScene"
import { ModeSelectScene } from "./scenes/ModeSelectScene"
import { SettingsScene } from "./scenes/SettingsScene"
import { AssetWorkshopScene } from "./scenes/AssetWorkshopScene"
import { CustomizeScene } from "./scenes/CustomizeScene"
import { AchievementsScene } from "./scenes/AchievementsScene"
import { MeadowScene } from "./modes/meadow/MeadowScene"
import { TaskSelectScene } from "./modes/tasks/TaskSelectScene"
import { TaskRunScene } from "./modes/tasks/TaskRunScene"
import { WorldMapScene } from "./modes/story/WorldMapScene"
import { StoryScene } from "./modes/story/StoryScene"
import { DialogueOverlayScene } from "./scenes/DialogueOverlayScene"
import { EndlessScene } from "./modes/endless/EndlessScene"
import { ResultScene, PauseScene } from "./scenes/stubs"

initPlatform()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#1a2418",
  input: {
    gamepad: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1400 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    width: 1920,
    height: 1080,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    ModeSelectScene,
    SettingsScene,
    AssetWorkshopScene,
    CustomizeScene,
    AchievementsScene,
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
