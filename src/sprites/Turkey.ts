import Phaser from 'phaser';

export interface TouchInput {
  x: number;  // -1 to 1
  y: number;  // -1 to 1
  isActive: boolean;
  dashPressed: boolean;
}

export class Turkey extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { [key: string]: Phaser.Input.Keyboard.Key };
  private spaceKey: Phaser.Input.Keyboard.Key;
  private moveSpeed = 200;
  private dashSpeed = 400;
  private isDashing = false;
  private dashCooldown = false;
  private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private featherEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  // External touch input
  private touchInput: TouchInput | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'turkey');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics - top-down, no gravity
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
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

  setTouchInput(input: TouchInput): void {
    this.touchInput = input;
  }

  update(): void {
    if (!this.body) return;

    // Don't allow movement while dashing
    if (this.isDashing) return;

    const speed = this.moveSpeed;
    let velocityX = 0;
    let velocityY = 0;

    // Check touch input first (from virtual joystick)
    if (this.touchInput?.isActive) {
      velocityX = this.touchInput.x * speed;
      velocityY = this.touchInput.y * speed;
      if (velocityX < 0) this.setFlipX(true);
      else if (velocityX > 0) this.setFlipX(false);
    } else {
      // Keyboard input
      // Horizontal movement
      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        velocityX = -speed;
        this.setFlipX(true);
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        velocityX = speed;
        this.setFlipX(false);
      }

      // Vertical movement
      if (this.cursors.up.isDown || this.wasd.up.isDown) {
        velocityY = -speed;
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        velocityY = speed;
      }

      // Normalize diagonal movement for keyboard
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }
    }

    this.setVelocity(velocityX, velocityY);

    // Dust particles when moving
    if (velocityX !== 0 || velocityY !== 0) {
      this.dustEmitter?.start();
      this.dustEmitter?.setPosition(this.x, this.y + 15);
    } else {
      this.dustEmitter?.stop();
    }

    // Dash with spacebar or touch button
    const keyboardDash = Phaser.Input.Keyboard.JustDown(this.spaceKey);
    const touchDash = this.touchInput?.dashPressed;
    if ((keyboardDash || touchDash) && !this.dashCooldown) {
      this.dash();
    }
  }

  dash(): void {
    if (this.dashCooldown) return;

    // Get current movement direction or default to facing direction
    let dashX = this.body!.velocity.x;
    let dashY = this.body!.velocity.y;

    // If not moving, dash in facing direction
    if (dashX === 0 && dashY === 0) {
      dashX = this.flipX ? -1 : 1;
      dashY = 0;
    }

    // Normalize and apply dash speed
    const magnitude = Math.sqrt(dashX * dashX + dashY * dashY);
    if (magnitude > 0) {
      dashX = (dashX / magnitude) * this.dashSpeed;
      dashY = (dashY / magnitude) * this.dashSpeed;
    }

    this.isDashing = true;
    this.dashCooldown = true;
    this.setVelocity(dashX, dashY);

    // Play dash sound
    (this.scene as any).audioManager?.playJump();

    // End dash after short duration
    this.scene.time.delayedCall(150, () => {
      this.isDashing = false;
    });

    // Cooldown before next dash
    this.scene.time.delayedCall(500, () => {
      this.dashCooldown = false;
    });
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
