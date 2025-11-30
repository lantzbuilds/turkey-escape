import Phaser from 'phaser';
import { LevelManager } from '../utils/LevelManager';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; level: number; levelManager: LevelManager }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const { score, level, levelManager } = data;

    // Save high score
    levelManager.saveHighScore(score);
    const highScore = levelManager.getHighScore();
    const isNewHighScore = score === highScore && score > 0;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '72px',
      fontFamily: 'monospace',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 8
    });
    gameOverText.setOrigin(0.5);

    // Shake animation
    this.tweens.add({
      targets: gameOverText,
      angle: -2,
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut'
    });

    // Level reached
    this.add.text(width / 2, height / 2 - 40, `Level Reached: ${level}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Final score
    this.add.text(width / 2, height / 2 + 10, `Final Score: ${score}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // High score
    const highScoreColor = isNewHighScore ? '#32CD32' : '#ffffff';
    const highScoreLabel = isNewHighScore ? 'NEW HIGH SCORE!' : `High Score: ${highScore}`;
    this.add.text(width / 2, height / 2 + 60, highScoreLabel, {
      fontSize: isNewHighScore ? '28px' : '24px',
      fontFamily: 'monospace',
      color: highScoreColor,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // New high score celebration
    if (isNewHighScore) {
      // Play celebration sound
      (this as any).audioManager?.playLevelComplete();

      // Add sparkle effect
      const particles = this.add.particles(width / 2, height / 2 + 60, 'particle', {
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: 1000,
        tint: [0xFFD700, 0xFFA500, 0xFF6347],
        frequency: 50,
        quantity: 2
      });

      this.time.delayedCall(3000, () => {
        particles.destroy();
      });
    }

    // Retry prompt
    const retryText = this.add.text(width / 2, height - 120, 'Press SPACE to Retry', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#32CD32',
      stroke: '#000000',
      strokeThickness: 3
    });
    retryText.setOrigin(0.5);

    // Menu prompt
    const menuText = this.add.text(width / 2, height - 80, 'Press ESC for Menu', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    menuText.setOrigin(0.5);

    // Blinking effect
    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Input handlers
    this.input.keyboard!.once('keydown-SPACE', () => {
      levelManager.resetScore();
      this.scene.start('GameScene', { levelManager });
    });

    this.input.keyboard!.once('keydown-ESC', () => {
      levelManager.resetScore();
      this.scene.start('MenuScene');
    });
  }
}
