import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Generate sprite placeholders using graphics
    this.generateSprites();
  }

  private generateSprites(): void {
    // Create Turkey sprite with tail feathers and wattle
    const turkeyGraphics = this.make.graphics({});

    // Tail feathers (fan shape) - multiple colors
    turkeyGraphics.fillStyle(0x8B4513, 1); // Brown feather
    turkeyGraphics.fillTriangle(5, 25, 0, 5, 12, 20);
    turkeyGraphics.fillStyle(0xD2691E, 1); // Chocolate feather
    turkeyGraphics.fillTriangle(8, 25, 5, 2, 15, 18);
    turkeyGraphics.fillStyle(0xCD853F, 1); // Peru feather
    turkeyGraphics.fillTriangle(11, 25, 10, 0, 18, 17);
    turkeyGraphics.fillStyle(0xD2691E, 1); // Chocolate feather
    turkeyGraphics.fillTriangle(14, 25, 15, 2, 21, 18);
    turkeyGraphics.fillStyle(0x8B4513, 1); // Brown feather
    turkeyGraphics.fillTriangle(17, 25, 20, 5, 24, 20);

    // Body (round)
    turkeyGraphics.fillStyle(0x8B4513, 1); // Brown body
    turkeyGraphics.fillCircle(25, 28, 12);

    // Head
    turkeyGraphics.fillStyle(0x8B4513, 1); // Brown head
    turkeyGraphics.fillCircle(36, 20, 7);

    // Eye
    turkeyGraphics.fillStyle(0x000000, 1);
    turkeyGraphics.fillCircle(38, 18, 2);
    turkeyGraphics.fillStyle(0xFFFFFF, 1);
    turkeyGraphics.fillCircle(38, 17, 1);

    // Beak
    turkeyGraphics.fillStyle(0xFFA500, 1); // Orange beak
    turkeyGraphics.fillTriangle(42, 20, 48, 18, 42, 23);

    // Wattle (red dangly bit under beak)
    turkeyGraphics.fillStyle(0xFF0000, 1); // Bright red
    turkeyGraphics.fillCircle(42, 26, 4);
    turkeyGraphics.fillCircle(40, 29, 3);

    // Snood (red bit on top of beak)
    turkeyGraphics.fillStyle(0xFF0000, 1);
    turkeyGraphics.fillCircle(43, 16, 2);

    // Legs
    turkeyGraphics.fillStyle(0xFFA500, 1); // Orange legs
    turkeyGraphics.fillRect(22, 38, 3, 8);
    turkeyGraphics.fillRect(28, 38, 3, 8);

    turkeyGraphics.generateTexture('turkey', 50, 48);
    turkeyGraphics.destroy();

    // Create Farmer sprite with axe
    const farmerGraphics = this.make.graphics({});

    // Axe handle (behind farmer)
    farmerGraphics.fillStyle(0x8B4513, 1); // Brown handle
    farmerGraphics.fillRect(38, 15, 4, 35);

    // Axe head
    farmerGraphics.fillStyle(0x708090, 1); // Steel gray
    farmerGraphics.fillRect(35, 8, 12, 5); // Top of axe
    farmerGraphics.fillStyle(0xA9A9A9, 1); // Lighter steel
    farmerGraphics.fillTriangle(35, 8, 30, 18, 35, 18); // Blade edge
    farmerGraphics.fillStyle(0x708090, 1);
    farmerGraphics.fillRect(35, 8, 8, 12); // Axe body
    // Axe shine
    farmerGraphics.fillStyle(0xC0C0C0, 1);
    farmerGraphics.fillRect(36, 10, 2, 8);

    // Head
    farmerGraphics.fillStyle(0xFFDDB3, 1); // Skin tone
    farmerGraphics.fillCircle(20, 12, 10);

    // Eyes
    farmerGraphics.fillStyle(0x000000, 1);
    farmerGraphics.fillCircle(17, 10, 2);
    farmerGraphics.fillCircle(23, 10, 2);

    // Angry eyebrows
    farmerGraphics.lineStyle(2, 0x000000, 1);
    farmerGraphics.lineBetween(14, 7, 19, 9);
    farmerGraphics.lineBetween(26, 7, 21, 9);

    // Mouth (frown)
    farmerGraphics.lineStyle(2, 0x8B0000, 1);
    farmerGraphics.lineBetween(17, 16, 23, 16);

    // Straw hat
    farmerGraphics.fillStyle(0xF4A460, 1); // Sandy brown
    farmerGraphics.fillRect(8, 2, 24, 6);
    farmerGraphics.fillStyle(0xDEB887, 1); // Lighter band
    farmerGraphics.fillRect(12, 0, 16, 5);
    farmerGraphics.fillStyle(0x8B0000, 1); // Red band
    farmerGraphics.fillRect(12, 4, 16, 2);

    // Body/overalls
    farmerGraphics.fillStyle(0x4169E1, 1); // Blue overalls
    farmerGraphics.fillRect(10, 20, 20, 20);
    // Overall straps
    farmerGraphics.fillStyle(0x4169E1, 1);
    farmerGraphics.fillRect(12, 18, 4, 4);
    farmerGraphics.fillRect(24, 18, 4, 4);
    // Overall pocket
    farmerGraphics.fillStyle(0x3158D0, 1);
    farmerGraphics.fillRect(15, 28, 10, 8);

    // Arms
    farmerGraphics.fillStyle(0xFFDDB3, 1); // Skin
    farmerGraphics.fillRect(5, 22, 6, 12);  // Left arm
    farmerGraphics.fillRect(29, 22, 6, 12); // Right arm (holding axe)

    // Legs
    farmerGraphics.fillStyle(0x4169E1, 1); // Blue pants
    farmerGraphics.fillRect(12, 40, 7, 12);
    farmerGraphics.fillRect(21, 40, 7, 12);

    // Boots
    farmerGraphics.fillStyle(0x3D2314, 1); // Dark brown boots
    farmerGraphics.fillRect(11, 50, 9, 5);
    farmerGraphics.fillRect(20, 50, 9, 5);

    farmerGraphics.generateTexture('farmer', 55, 55);
    farmerGraphics.destroy();

    // Create Hay Bale sprite
    const haybaleGraphics = this.make.graphics({});
    haybaleGraphics.fillStyle(0xDAA520, 1);
    haybaleGraphics.fillRect(0, 0, 40, 40);
    haybaleGraphics.fillStyle(0xB8860B, 1);
    haybaleGraphics.fillRect(5, 5, 30, 5);
    haybaleGraphics.fillRect(5, 15, 30, 5);
    haybaleGraphics.fillRect(5, 25, 30, 5);
    haybaleGraphics.generateTexture('haybale', 40, 40);
    haybaleGraphics.destroy();

    // Create Fence sprite
    const fenceGraphics = this.make.graphics({});
    fenceGraphics.fillStyle(0x8B4513, 1);
    fenceGraphics.fillRect(0, 0, 8, 60);
    fenceGraphics.fillRect(12, 0, 8, 60);
    fenceGraphics.fillRect(0, 15, 20, 6);
    fenceGraphics.fillRect(0, 35, 20, 6);
    fenceGraphics.generateTexture('fence', 20, 60);
    fenceGraphics.destroy();

    // Create Water Trough sprite
    const troughGraphics = this.make.graphics({});
    troughGraphics.fillStyle(0x708090, 1);
    troughGraphics.fillRect(0, 5, 50, 25);
    troughGraphics.fillStyle(0x4682B4, 0.7);
    troughGraphics.fillRect(3, 8, 44, 18);
    troughGraphics.generateTexture('trough', 50, 30);
    troughGraphics.destroy();

    // Create Chicken Coop sprite
    const coopGraphics = this.make.graphics({});
    coopGraphics.fillStyle(0xA0522D, 1);
    coopGraphics.fillRect(0, 20, 60, 40);
    coopGraphics.fillStyle(0x8B4513, 1);
    coopGraphics.fillTriangle(5, 20, 55, 20, 30, 0);
    coopGraphics.fillStyle(0x000000, 1);
    coopGraphics.fillRect(20, 30, 15, 20);
    coopGraphics.generateTexture('coop', 60, 60);
    coopGraphics.destroy();

    // Create Escape Zone sprite
    const escapeGraphics = this.make.graphics({});
    escapeGraphics.fillStyle(0x32CD32, 0.3);
    escapeGraphics.fillRect(0, 0, 60, 600);
    escapeGraphics.fillStyle(0x228B22, 1);
    escapeGraphics.fillRect(0, 0, 5, 600);
    escapeGraphics.generateTexture('escapeZone', 60, 600);
    escapeGraphics.destroy();

    // Create particle texture
    const particleGraphics = this.make.graphics({});
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
