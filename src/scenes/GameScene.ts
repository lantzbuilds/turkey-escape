import Phaser from 'phaser';
import { Turkey } from '../sprites/Turkey';
import { Farmer } from '../sprites/Farmer';
import { Obstacle, ObstacleType } from '../objects/Obstacle';
import { LevelManager } from '../utils/LevelManager';
import { AudioManager } from '../utils/AudioManager';

export class GameScene extends Phaser.Scene {
  private turkey!: Turkey;
  private farmers: Farmer[] = [];
  private obstacles: Obstacle[] = [];
  private escapeZone!: Phaser.Physics.Arcade.Sprite;
  private levelManager!: LevelManager;
  public audioManager!: AudioManager;

  private lives = 3;
  private score = 0;
  private levelStartTime = 0;
  private isInvincible = false;

  private livesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelManager: LevelManager }): void {
    this.levelManager = data.levelManager || new LevelManager();
    this.audioManager = new AudioManager();
    this.lives = 3;
    this.score = this.levelManager.getScore();
    this.levelStartTime = 0;
    this.isInvincible = false;
    this.farmers = [];
    this.obstacles = [];
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Ground
    const ground = this.add.rectangle(0, height - 50, width, 50, 0x8B7355).setOrigin(0);
    this.physics.add.existing(ground, true);

    // Start background music
    this.audioManager.startBackgroundMusic();

    // Create level
    this.createLevel();

    // Create UI
    this.createUI();

    // Set up collisions
    this.setupCollisions();

    // Start level timer
    this.levelStartTime = this.time.now;

    // Play gobble sound at start
    this.time.delayedCall(300, () => {
      this.audioManager.playGobble();
    });
  }

  private createLevel(): void {
    const config = this.levelManager.getLevelConfig();
    const height = this.cameras.main.height;

    // Create turkey
    this.turkey = new Turkey(this, 100, height - 100);

    // Create escape zone
    this.escapeZone = this.physics.add.sprite(config.escapeZoneX, height / 2, 'escapeZone');
    this.escapeZone.setImmovable(true);
    (this.escapeZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Create obstacles
    this.createObstacles(config);

    // Create farmers
    this.createFarmers(config);
  }

  private createObstacles(config: any): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const obstacleTypes: ObstacleType[] = ['haybale', 'fence', 'trough', 'coop'];

    // Clear existing obstacles
    this.obstacles.forEach(obs => obs.destroy());
    this.obstacles = [];

    for (let i = 0; i < config.obstacleCount; i++) {
      const type = Phaser.Utils.Array.GetRandom(obstacleTypes);

      // Distribute obstacles across the level
      const x = 150 + (i * (width - 300) / config.obstacleCount) + Phaser.Math.Between(-30, 30);
      const y = height - 100;

      const obstacle = new Obstacle(this, x, y, type);
      this.obstacles.push(obstacle);
    }
  }

  private createFarmers(config: any): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clear existing farmers
    this.farmers.forEach(farmer => farmer.destroy());
    this.farmers = [];

    const anticipation = config.level >= 4 ? 0.5 : 0;

    for (let i = 0; i < config.farmerCount; i++) {
      const x = width - 100 - (i * 50);
      const y = height - 100 - Phaser.Math.Between(0, 50);

      const farmer = new Farmer(this, x, y, config.farmerSpeed, anticipation);
      farmer.setTarget(this.turkey);
      this.farmers.push(farmer);
    }
  }

  private createUI(): void {
    const padding = 20;

    // Lives
    this.livesText = this.add.text(padding, padding, `Lives: ${this.lives}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Level
    this.levelText = this.add.text(padding, padding + 35, `Level: ${this.levelManager.getCurrentLevel()}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Score
    this.scoreText = this.add.text(padding, padding + 70, `Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    });

    // High Score
    const highScore = this.levelManager.getHighScore();
    this.highScoreText = this.add.text(padding, padding + 105, `High: ${highScore}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Make UI stay on top
    this.livesText.setScrollFactor(0).setDepth(100);
    this.levelText.setScrollFactor(0).setDepth(100);
    this.scoreText.setScrollFactor(0).setDepth(100);
    this.highScoreText.setScrollFactor(0).setDepth(100);
  }

  private setupCollisions(): void {
    // Turkey vs Obstacles
    this.obstacles.forEach(obstacle => {
      this.physics.add.collider(this.turkey, obstacle);
    });

    // Turkey vs Farmers
    this.farmers.forEach(farmer => {
      this.physics.add.overlap(this.turkey, farmer, this.handleFarmerCatch, undefined, this);
    });

    // Turkey vs Escape Zone
    this.physics.add.overlap(this.turkey, this.escapeZone, this.handleLevelComplete, undefined, this);

    // Farmers vs Obstacles
    this.farmers.forEach(farmer => {
      this.obstacles.forEach(obstacle => {
        this.physics.add.collider(farmer, obstacle);
      });
    });
  }

  private handleFarmerCatch(): void {
    if (this.isInvincible) return;

    this.isInvincible = true;
    this.lives--;
    this.livesText.setText(`Lives: ${this.lives}`);

    // Hit effect
    this.turkey.playHitEffect();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Respawn turkey at start
      this.turkey.setPosition(100, this.cameras.main.height - 100);
      this.turkey.setVelocity(0, 0);

      // Invincibility period
      this.time.delayedCall(2000, () => {
        this.isInvincible = false;
      });

      // Flashing effect during invincibility
      this.tweens.add({
        targets: this.turkey,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 10,
        onComplete: () => {
          this.turkey.setAlpha(1);
        }
      });
    }
  }

  private handleLevelComplete(): void {
    // Prevent multiple triggers
    this.physics.world.removeAllListeners();

    // Calculate score
    const timeElapsed = this.time.now - this.levelStartTime;
    const levelScore = this.levelManager.calculateScore(timeElapsed);
    this.score += levelScore;
    this.levelManager.addScore(levelScore);

    // Play sound
    this.audioManager.playLevelComplete();

    // Show level complete message
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 2, 'LEVEL COMPLETE!', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#32CD32',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(200);

    this.add.text(width / 2, height / 2 + 60, `+${levelScore} points`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(200);

    // Pause game
    this.physics.pause();

    // Next level after delay
    this.time.delayedCall(2000, () => {
      this.levelManager.nextLevel();
      this.scene.restart({ levelManager: this.levelManager });
    });
  }

  private gameOver(): void {
    this.audioManager.stopBackgroundMusic();
    this.audioManager.playGameOver();

    this.physics.pause();

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        level: this.levelManager.getCurrentLevel(),
        levelManager: this.levelManager
      });
    });
  }

  update(time: number, delta: number): void {
    // Update turkey
    this.turkey.update();

    // Update farmers
    this.farmers.forEach(farmer => {
      farmer.update(time, delta);
    });

    // Update score text
    this.scoreText.setText(`Score: ${this.score}`);

    // Check if turkey fell off the world (shouldn't happen with collideWorldBounds, but just in case)
    if (this.turkey.y > this.cameras.main.height + 100) {
      this.handleFarmerCatch();
    }
  }
}
