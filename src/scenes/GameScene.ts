import Phaser from 'phaser';
import { Turkey, TouchInput } from '../sprites/Turkey';
import { Farmer } from '../sprites/Farmer';
import { Obstacle, ObstacleType } from '../objects/Obstacle';
import { LevelManager } from '../utils/LevelManager';
import { AudioManager } from '../utils/AudioManager';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { TouchButton } from '../ui/TouchButton';
import { isMobile } from '../utils/MobileDetect';

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

  // Mobile controls
  private virtualJoystick: VirtualJoystick | null = null;
  private dashButton: TouchButton | null = null;
  private pauseButton!: TouchButton;
  private isMobileDevice = false;
  private escKey!: Phaser.Input.Keyboard.Key;

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
    this.isMobileDevice = isMobile();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background - green grass for top-down barnyard
    this.add.rectangle(0, 0, width, height, 0x4a7c23).setOrigin(0);

    // Add some visual variety to the ground
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      this.add.circle(x, y, Phaser.Math.Between(2, 5), 0x3d6b1c);
    }

    // Stop any existing music and start fresh
    this.audioManager.stopBackgroundMusic();
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

    // Set up mobile controls if on mobile
    this.setupMobileControls();

    // Set up pause button (always visible)
    this.setupPauseButton();

    // Set up ESC key for pause
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private setupMobileControls(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (this.isMobileDevice) {
      // Virtual joystick (appears on touch in left half of screen)
      this.virtualJoystick = new VirtualJoystick(this);

      // Dash button (bottom right)
      this.dashButton = new TouchButton(
        this,
        width - 80,
        height - 80,
        45,
        'DASH',
        0x44aa44
      );
    }
  }

  private setupPauseButton(): void {
    const width = this.cameras.main.width;

    // Pause button (top right, always visible)
    this.pauseButton = new TouchButton(
      this,
      width - 40,
      40,
      25,
      '⏸',
      0x666666
    );

    this.pauseButton.onPress(() => {
      this.pauseGame();
    });
  }

  private pauseGame(): void {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  private createLevel(): void {
    const config = this.levelManager.getLevelConfig();
    const height = this.cameras.main.height;

    // Create turkey - start on the left side, middle height
    this.turkey = new Turkey(this, 100, height / 2);

    // Create escape zone on the right side
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

      // Distribute obstacles across the playing field (top-down view)
      const x = 200 + Phaser.Math.Between(0, width - 400);
      const y = 80 + Phaser.Math.Between(0, height - 160);

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
      // Spawn farmers on the right side of the screen, spread vertically
      const x = width - 100 - Phaser.Math.Between(0, 50);
      const y = (height / (config.farmerCount + 1)) * (i + 1);

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
      // Respawn turkey at start (left side, center)
      this.turkey.setPosition(100, this.cameras.main.height / 2);
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
    // Check for pause (ESC key)
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.pauseGame();
      return;
    }

    // Build touch input from mobile controls
    if (this.isMobileDevice && this.virtualJoystick) {
      const joystickOutput = this.virtualJoystick.output;
      const touchInput: TouchInput = {
        x: joystickOutput.x,
        y: joystickOutput.y,
        isActive: joystickOutput.isActive,
        dashPressed: this.dashButton?.justPressed() || false
      };
      this.turkey.setTouchInput(touchInput);
    }

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

  shutdown(): void {
    // Clean up mobile controls
    this.virtualJoystick?.destroy();
    this.dashButton?.destroy();
    this.pauseButton?.destroy();
  }
}
