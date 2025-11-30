import Phaser from 'phaser';

export class Turkey extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { [key: string]: Phaser.Input.Keyboard.Key };
  private spaceKey: Phaser.Input.Keyboard.Key;
  private isJumping = false;
  private moveSpeed = 160;
  private jumpPower = 350;
  private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private featherEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'turkey');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    this.setCollideWorldBounds(true);
    this.setGravityY(800);
    this.setSize(30, 30);
    this.setScale(1);

    // Set up input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create particle emitters
    this.createParticles();
  }

  private createParticles(): void {
    // Dust particles when running
    this.dustEmitter = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 40 },
      angle: { min: 60, max: 120 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      tint: 0x8B7355,
      gravityY: 100,
      frequency: 100,
      quantity: 1
    });
    this.dustEmitter.stop();

    // Feather particles when hit
    this.featherEmitter = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 600,
      tint: 0xFFFFFF,
      gravityY: 200,
      frequency: -1,
      quantity: 8
    });
  }

  update(): void {
    if (!this.body) return;

    const onGround = (this.body as Phaser.Physics.Arcade.Body).touching.down;

    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
      if (onGround) {
        this.dustEmitter?.start();
        this.dustEmitter?.setPosition(this.x, this.y + 15);
      }
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
      if (onGround) {
        this.dustEmitter?.start();
        this.dustEmitter?.setPosition(this.x, this.y + 15);
      }
    } else {
      this.setVelocityX(0);
      this.dustEmitter?.stop();
    }

    // Jumping
    if (onGround) {
      this.isJumping = false;
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.jump();
      }
    } else {
      this.dustEmitter?.stop();
    }

    // Update particle positions
    if (this.body.velocity.x !== 0 && onGround) {
      this.dustEmitter?.setPosition(this.x, this.y + 15);
    }
  }

  jump(): void {
    if (!this.isJumping) {
      this.setVelocityY(-this.jumpPower);
      this.isJumping = true;
      // Play jump sound via scene
      (this.scene as any).audioManager?.playJump();
    }
  }

  playHitEffect(): void {
    this.featherEmitter?.explode(8, this.x, this.y);

    // Screen shake
    this.scene.cameras.main.shake(200, 0.01);

    // Flash red
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // Play hit sound
    (this.scene as any).audioManager?.playHit();
  }

  destroy(fromScene?: boolean): void {
    this.dustEmitter?.destroy();
    this.featherEmitter?.destroy();
    super.destroy(fromScene);
  }
}
