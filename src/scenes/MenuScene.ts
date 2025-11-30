import Phaser from 'phaser';
import { LevelManager } from '../utils/LevelManager';

export class MenuScene extends Phaser.Scene {
  private levelManager: LevelManager;

  constructor() {
    super({ key: 'MenuScene' });
    this.levelManager = new LevelManager();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Draw ground
    this.add.rectangle(0, height - 100, width, 100, 0x8B7355).setOrigin(0);

    // Title
    const titleText = this.add.text(width / 2, height / 3, 'TURKEY ESCAPE', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ff6347',
      stroke: '#000000',
      strokeThickness: 6
    });
    titleText.setOrigin(0.5);

    // Animated title effect
    this.tweens.add({
      targets: titleText,
      y: titleText.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, height / 2, 'Help the turkey escape the barnyard!', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Instructions
    const instructions = [
      'Arrow Keys or WASD to Move',
      'SPACEBAR to Jump',
      'Avoid the Farmers!',
      'Reach the Green Escape Zone!'
    ];

    instructions.forEach((text, index) => {
      this.add.text(width / 2, height / 2 + 60 + (index * 25), text, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
    });

    // High score display
    const highScore = this.levelManager.getHighScore();
    if (highScore > 0) {
      this.add.text(width / 2, height - 150, `High Score: ${highScore}`, {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Start prompt
    const startText = this.add.text(width / 2, height - 80, 'Press SPACE to Start', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#32CD32',
      stroke: '#000000',
      strokeThickness: 4
    });
    startText.setOrigin(0.5);

    // Blinking effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start game on space
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene', { levelManager: this.levelManager });
    });

    // Add some decorative turkeys
    this.addDecorativeTurkey(100, height - 120);
    this.addDecorativeTurkey(width - 100, height - 120);
  }

  private addDecorativeTurkey(x: number, y: number): void {
    const turkey = this.add.sprite(x, y, 'turkey');
    this.tweens.add({
      targets: turkey,
      y: y - 5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
