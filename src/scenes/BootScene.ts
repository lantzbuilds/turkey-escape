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
    // Create Turkey sprite
    const turkeyGraphics = this.make.graphics({});
    turkeyGraphics.fillStyle(0x8B4513, 1); // Brown body
    turkeyGraphics.fillRect(0, 10, 30, 20);
    turkeyGraphics.fillStyle(0xFF6347, 1); // Red head
    turkeyGraphics.fillCircle(25, 15, 8);
    turkeyGraphics.fillStyle(0xFFD700, 1); // Yellow beak
    turkeyGraphics.fillTriangle(30, 15, 35, 12, 35, 18);
    turkeyGraphics.generateTexture('turkey', 40, 40);
    turkeyGraphics.destroy();

    // Create Farmer sprite
    const farmerGraphics = this.make.graphics({});
    farmerGraphics.fillStyle(0xFFDDB3, 1); // Skin tone head
    farmerGraphics.fillCircle(20, 12, 10);
    farmerGraphics.fillStyle(0x4169E1, 1); // Blue shirt
    farmerGraphics.fillRect(10, 20, 20, 18);
    farmerGraphics.fillStyle(0x2F4F4F, 1); // Dark pants
    farmerGraphics.fillRect(12, 38, 7, 10);
    farmerGraphics.fillRect(21, 38, 7, 10);
    farmerGraphics.fillStyle(0x8B0000, 1); // Red hat
    farmerGraphics.fillRect(12, 5, 16, 8);
    farmerGraphics.generateTexture('farmer', 40, 50);
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
