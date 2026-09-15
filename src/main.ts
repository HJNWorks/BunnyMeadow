import Phaser from "phaser"
import { initPlatform } from "./core/platform"
import { BootScene } from "./scenes/BootScene"
import { PreloadScene } from "./scenes/PreloadScene"
import { TitleScene } from "./scenes/TitleScene"
import { MeadowScene } from "./modes/meadow/MeadowScene"

initPlatform()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#1a2418",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  scene: [BootScene, PreloadScene, TitleScene, MeadowScene],
}

new Phaser.Game(config)
