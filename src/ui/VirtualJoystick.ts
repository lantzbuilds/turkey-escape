import Phaser from 'phaser';

export interface JoystickOutput {
  x: number;  // -1 to 1
  y: number;  // -1 to 1
  isActive: boolean;
}

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Arc | null = null;
  private stick: Phaser.GameObjects.Arc | null = null;
  private baseRadius = 60;
  private stickRadius = 25;
  private maxDistance = 50;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private pointerId: number | null = null;

  public output: JoystickOutput = { x: 0, y: 0, isActive: false };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    // Listen for touch/pointer events on the left half of the screen
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Only activate on left half of screen
    if (pointer.x > this.scene.cameras.main.width / 2) return;

    // Don't activate if we're already tracking a pointer
    if (this.isDragging) return;

    this.isDragging = true;
    this.pointerId = pointer.id;
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.currentX = pointer.x;
    this.currentY = pointer.y;

    // Create joystick visuals at touch position
    this.base = this.scene.add.circle(this.startX, this.startY, this.baseRadius, 0x000000, 0.3);
    this.base.setDepth(1000);
    this.base.setScrollFactor(0);

    this.stick = this.scene.add.circle(this.startX, this.startY, this.stickRadius, 0x333333, 0.6);
    this.stick.setDepth(1001);
    this.stick.setScrollFactor(0);

    this.output.isActive = true;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || pointer.id !== this.pointerId) return;

    this.currentX = pointer.x;
    this.currentY = pointer.y;

    // Calculate distance from start
    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Clamp to max distance
    let stickX = this.startX + dx;
    let stickY = this.startY + dy;

    if (distance > this.maxDistance) {
      const angle = Math.atan2(dy, dx);
      stickX = this.startX + Math.cos(angle) * this.maxDistance;
      stickY = this.startY + Math.sin(angle) * this.maxDistance;
    }

    // Update stick position
    if (this.stick) {
      this.stick.setPosition(stickX, stickY);
    }

    // Calculate normalized output (-1 to 1)
    const clampedDistance = Math.min(distance, this.maxDistance);
    if (clampedDistance > 5) { // Dead zone
      const angle = Math.atan2(dy, dx);
      const normalizedDist = clampedDistance / this.maxDistance;
      this.output.x = Math.cos(angle) * normalizedDist;
      this.output.y = Math.sin(angle) * normalizedDist;
    } else {
      this.output.x = 0;
      this.output.y = 0;
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) return;

    this.isDragging = false;
    this.pointerId = null;
    this.output = { x: 0, y: 0, isActive: false };

    // Remove joystick visuals
    if (this.base) {
      this.base.destroy();
      this.base = null;
    }
    if (this.stick) {
      this.stick.destroy();
      this.stick = null;
    }
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);

    if (this.base) this.base.destroy();
    if (this.stick) this.stick.destroy();
  }
}
