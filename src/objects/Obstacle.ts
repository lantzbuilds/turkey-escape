import Phaser from 'phaser';

export type ObstacleType = 'haybale' | 'fence' | 'trough' | 'coop';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private obstacleType: ObstacleType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType) {
    super(scene, x, y, type);

    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Set different sizes based on obstacle type
    switch (type) {
      case 'haybale':
        this.setSize(40, 40);
        break;
      case 'fence':
        this.setSize(20, 60);
        break;
      case 'trough':
        this.setSize(50, 30);
        break;
      case 'coop':
        this.setSize(60, 60);
        break;
    }
  }

  getType(): ObstacleType {
    return this.obstacleType;
  }
}
