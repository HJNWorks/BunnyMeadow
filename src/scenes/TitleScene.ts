import Phaser from "phaser"

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title")
  }

  create(): void {
    const { width, height } = this.scale

    this.add.rectangle(width / 2, height / 2, width, height, 0xf5f1e6)

    this.add
      .text(width / 2, height * 0.28, "A LITTLE WOODLAND ADVENTURE", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#7b8765",
        fontStyle: "bold",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height * 0.4, "Bunny Meadow.", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#304c39",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height * 0.52, "Small paws. Big carrot dreams.", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#71816e",
      })
      .setOrigin(0.5)

    const button = this.add
      .rectangle(width / 2, height * 0.7, 220, 52, 0x34583e)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(width / 2, height * 0.7, "Play Meadow", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)

    button.on("pointerover", () => button.setFillStyle(0x3f6949))
    button.on("pointerout", () => button.setFillStyle(0x34583e))
    button.on("pointerup", () => this.scene.start("Meadow"))

    this.add
      .text(width / 2, height * 0.88, "Story, Moon Tasks and Endless arrive in later builds.", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#71816e",
      })
      .setOrigin(0.5)
  }
}
