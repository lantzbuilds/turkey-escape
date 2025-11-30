import Phaser from 'phaser';

export class TouchButton {
  private scene: Phaser.Scene;
  private button: Phaser.GameObjects.Container;
  private circle: Phaser.GameObjects.Arc;
  private label: Phaser.GameObjects.Text;
  private isPressed = false;
  private justPressedFlag = false;
  private onPressCallback: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    radius: number,
    text: string,
    color: number = 0x4444aa
  ) {
    this.scene = scene;

    // Create button circle
    this.circle = scene.add.circle(0, 0, radius, color, 0.6);
    this.circle.setStrokeStyle(3, 0xffffff, 0.8);

    // Create label
    this.label = scene.add.text(0, 0, text, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Create container
    this.button = scene.add.container(x, y, [this.circle, this.label]);
    this.button.setDepth(1000);
    this.button.setScrollFactor(0);

    // Make interactive
    this.circle.setInteractive();

    this.circle.on('pointerdown', () => {
      this.isPressed = true;
      this.justPressedFlag = true;
      this.circle.setFillStyle(color, 0.9);
      this.circle.setScale(0.9);
      if (this.onPressCallback) {
        this.onPressCallback();
      }
    });

    this.circle.on('pointerup', () => {
      this.isPressed = false;
      this.circle.setFillStyle(color, 0.6);
      this.circle.setScale(1);
    });

    this.circle.on('pointerout', () => {
      this.isPressed = false;
      this.circle.setFillStyle(color, 0.6);
      this.circle.setScale(1);
    });
  }

  onPress(callback: () => void): void {
    this.onPressCallback = callback;
  }

  isDown(): boolean {
    return this.isPressed;
  }

  justPressed(): boolean {
    if (this.justPressedFlag) {
      this.justPressedFlag = false;
      return true;
    }
    return false;
  }

  setVisible(visible: boolean): void {
    this.button.setVisible(visible);
  }

  setPosition(x: number, y: number): void {
    this.button.setPosition(x, y);
  }

  destroy(): void {
    this.button.destroy();
  }
}
