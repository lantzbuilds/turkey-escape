import Phaser from 'phaser';

export class Farmer extends Phaser.Physics.Arcade.Sprite {
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private speed = 80;
  private anticipationFactor = 0;
  private moveTimer = 0;
  private directionChangeInterval = 1000;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number, anticipation = 0) {
    super(scene, x, y, 'farmer');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.setSize(40, 45);
    this.setScale(1);
    this.speed = speed;
    this.anticipationFactor = anticipation;
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }

  update(time: number, delta: number): void {
    if (!this.target || !this.body) return;

    this.moveTimer += delta;

    // Calculate target position
    let targetX = this.target.x;
    let targetY = this.target.y;

    // Add anticipation for higher levels
    if (this.anticipationFactor > 0 && this.target.body) {
      const targetBody = this.target.body as Phaser.Physics.Arcade.Body;
      targetX += targetBody.velocity.x * this.anticipationFactor;
      targetY += targetBody.velocity.y * this.anticipationFactor;
    }

    // Calculate direction to target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    // Only update direction periodically for more natural movement
    if (this.moveTimer >= this.directionChangeInterval) {
      this.moveTimer = 0;

      // Add some randomness to movement
      const randomAngle = angle + Phaser.Math.FloatBetween(-0.3, 0.3);

      const velocityX = Math.cos(randomAngle) * this.speed;
      const velocityY = Math.sin(randomAngle) * this.speed;

      this.setVelocity(velocityX, velocityY);

      // Flip sprite based on direction
      if (velocityX < 0) {
        this.setFlipX(true);
      } else if (velocityX > 0) {
        this.setFlipX(false);
      }
    }

    // Add slight bobbing animation
    const bob = Math.sin(time / 200) * 2;
    this.y += bob * 0.01;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setAnticipation(factor: number): void {
    this.anticipationFactor = factor;
  }
}
