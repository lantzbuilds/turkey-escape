import Phaser from 'phaser';
import { LevelManager } from '../utils/LevelManager';
import { isMobile } from '../utils/MobileDetect';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; level: number; levelManager: LevelManager }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const isMobileDevice = isMobile();

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

    // Retry prompt/button
    const retryText = this.add.text(
      width / 2,
      height - 120,
      isMobileDevice ? 'TAP TO RETRY' : 'Press SPACE to Retry',
      {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#32CD32',
        stroke: '#000000',
        strokeThickness: 3,
        backgroundColor: isMobileDevice ? '#226622' : undefined,
        padding: isMobileDevice ? { x: 20, y: 10 } : undefined
      }
    );
    retryText.setOrigin(0.5);

    // Make retry interactive for touch/click
    retryText.setInteractive({ useHandCursor: true });
    retryText.on('pointerdown', () => {
      levelManager.resetScore();
      this.scene.start('GameScene', { levelManager });
    });
    retryText.on('pointerover', () => {
      retryText.setStyle({ color: '#50FF50' });
    });
    retryText.on('pointerout', () => {
      retryText.setStyle({ color: '#32CD32' });
    });

    // Menu prompt/button
    const menuText = this.add.text(
      width / 2,
      height - 60,
      isMobileDevice ? 'TAP FOR MENU' : 'Press ESC for Menu',
      {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: isMobileDevice ? '#444444' : undefined,
        padding: isMobileDevice ? { x: 15, y: 8 } : undefined
      }
    );
    menuText.setOrigin(0.5);

    // Make menu interactive for touch/click
    menuText.setInteractive({ useHandCursor: true });
    menuText.on('pointerdown', () => {
      levelManager.resetScore();
      this.scene.start('MenuScene');
    });
    menuText.on('pointerover', () => {
      menuText.setStyle({ color: '#cccccc' });
    });
    menuText.on('pointerout', () => {
      menuText.setStyle({ color: '#ffffff' });
    });

    // Blinking effect
    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Keyboard input handlers (still work on desktop)
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
