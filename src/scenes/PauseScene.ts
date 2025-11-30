import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Title
    this.add.text(width / 2, height / 3 - 40, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Menu options
    const buttonStyle = {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    };

    // Resume button
    const resumeBtn = this.add.text(width / 2, height / 2, 'Resume', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerover', () => resumeBtn.setStyle({ backgroundColor: '#666666' }));
    resumeBtn.on('pointerout', () => resumeBtn.setStyle({ backgroundColor: '#444444' }));
    resumeBtn.on('pointerdown', () => this.resumeGame());

    // Restart button
    const restartBtn = this.add.text(width / 2, height / 2 + 60, 'Restart Level', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restartBtn.on('pointerover', () => restartBtn.setStyle({ backgroundColor: '#666666' }));
    restartBtn.on('pointerout', () => restartBtn.setStyle({ backgroundColor: '#444444' }));
    restartBtn.on('pointerdown', () => this.restartGame());

    // Quit to Menu button
    const quitBtn = this.add.text(width / 2, height / 2 + 120, 'Quit to Menu', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    quitBtn.on('pointerover', () => quitBtn.setStyle({ backgroundColor: '#666666' }));
    quitBtn.on('pointerout', () => quitBtn.setStyle({ backgroundColor: '#444444' }));
    quitBtn.on('pointerdown', () => this.quitToMenu());

    // Keyboard controls
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard?.on('keydown-P', () => this.resumeGame());

    // Instructions
    this.add.text(width / 2, height - 50, 'Press ESC or P to resume', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  private resumeGame(): void {
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  private restartGame(): void {
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('GameScene');
  }

  private quitToMenu(): void {
    // Stop game scene and its audio
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene?.audioManager) {
      gameScene.audioManager.stopBackgroundMusic();
    }
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}
