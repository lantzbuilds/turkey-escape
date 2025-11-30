import Phaser from "phaser";
import { LevelManager } from "../utils/LevelManager";
import { isMobile } from "../utils/MobileDetect";

export class MenuScene extends Phaser.Scene {
  private levelManager: LevelManager;

  constructor() {
    super({ key: "MenuScene" });
    this.levelManager = new LevelManager();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87ceeb).setOrigin(0);

    // Draw ground
    this.add.rectangle(0, height - 100, width, 100, 0x8b7355).setOrigin(0);

    // Title
    const titleText = this.add.text(width / 2, height / 3, "TURKEY ESCAPE", {
      fontSize: "64px",
      fontFamily: "monospace",
      color: "#ff6347",
      stroke: "#000000",
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5);

    // Animated title effect
    this.tweens.add({
      targets: titleText,
      y: titleText.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Subtitle
    this.add
      .text(width / 2, height / 2, "Help the turkey escape the barnyard!", {
        fontSize: "20px",
        fontFamily: "monospace",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Instructions - adapt for mobile vs desktop
    const isMobileDevice = isMobile();
    const instructions = isMobileDevice
      ? [
          "Use Joystick to Move",
          "Tap DASH Button to Dash",
          "Avoid the Farmers!",
          "Reach the Green Escape Zone!",
        ]
      : [
          "Arrow Keys or WASD to Move",
          "SPACEBAR to Dash",
          "Avoid the Farmers!",
          "Reach the Green Escape Zone!",
        ];

    instructions.forEach((text, index) => {
      this.add
        .text(width / 2, height / 2 + 60 + index * 25, text, {
          fontSize: "16px",
          fontFamily: "monospace",
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);
    });

    // High score display
    const highScore = this.levelManager.getHighScore();
    if (highScore > 0) {
      this.add
        .text(width / 2, height - 150, `High Score: ${highScore}`, {
          fontSize: "24px",
          fontFamily: "monospace",
          color: "#FFD700",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);
    }

    // Start prompt/button
    const startText = this.add.text(
      width / 2,
      height - 80,
      isMobileDevice ? "TAP TO START" : "Press SPACE to Start",
      {
        fontSize: "28px",
        fontFamily: "monospace",
        color: "#32CD32",
        stroke: "#000000",
        strokeThickness: 4,
        backgroundColor: isMobileDevice ? "#226622" : undefined,
        padding: isMobileDevice ? { x: 20, y: 10 } : undefined,
      }
    );
    startText.setOrigin(0.5);

    // Make it interactive for touch/click
    startText.setInteractive({ useHandCursor: true });
    startText.on("pointerdown", () => {
      this.startGame();
    });

    // Hover effect
    startText.on("pointerover", () => {
      startText.setStyle({ color: "#50FF50" });
    });
    startText.on("pointerout", () => {
      startText.setStyle({ color: "#32CD32" });
    });

    // Blinking effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Start game on space (keyboard)
    this.input.keyboard!.once("keydown-SPACE", () => {
      this.startGame();
    });

    // Add some decorative turkeys
    this.addDecorativeTurkey(100, height - 120);
    this.addDecorativeTurkey(width - 100, height - 120);
  }

  private startGame(): void {
    this.scene.start("GameScene", { levelManager: this.levelManager });
  }

  private addDecorativeTurkey(x: number, y: number): void {
    const turkey = this.add.sprite(x, y, "turkey");
    this.tweens.add({
      targets: turkey,
      y: y - 5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
