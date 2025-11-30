export interface LevelConfig {
  level: number;
  farmerCount: number;
  farmerSpeed: number;
  obstacleCount: number;
  escapeZoneX: number;
  layoutType: 'simple' | 'medium' | 'complex';
}

export class LevelManager {
  private currentLevel = 1;
  private baseScore = 0;

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  setLevel(level: number): void {
    this.currentLevel = level;
  }

  nextLevel(): void {
    this.currentLevel++;
  }

  getLevelConfig(): LevelConfig {
    const level = this.currentLevel;

    // Level 1: Tutorial
    if (level === 1) {
      return {
        level: 1,
        farmerCount: 1,
        farmerSpeed: 80,
        obstacleCount: 3,
        escapeZoneX: 700,
        layoutType: 'simple'
      };
    }

    // Level 2-3: Intermediate
    if (level <= 3) {
      return {
        level,
        farmerCount: 2,
        farmerSpeed: 80 + (level - 1) * 15,
        obstacleCount: 4 + level,
        escapeZoneX: 700,
        layoutType: 'medium'
      };
    }

    // Level 4-5: Advanced
    if (level <= 5) {
      return {
        level,
        farmerCount: 3,
        farmerSpeed: 100 + (level - 3) * 10,
        obstacleCount: 6 + level,
        escapeZoneX: 700,
        layoutType: 'complex'
      };
    }

    // Level 6+: Expert
    return {
      level,
      farmerCount: Math.min(4, 3 + Math.floor((level - 5) / 2)),
      farmerSpeed: Math.min(150, 110 + (level - 5) * 5),
      obstacleCount: 8 + level,
      escapeZoneX: 700,
      layoutType: 'complex'
    };
  }

  calculateScore(timeElapsed: number): number {
    const levelBonus = this.currentLevel * 1000;
    const timeBonus = Math.max(0, 5000 - Math.floor(timeElapsed / 100));
    return levelBonus + timeBonus;
  }

  addScore(points: number): void {
    this.baseScore += points;
  }

  getScore(): number {
    return this.baseScore;
  }

  resetScore(): void {
    this.baseScore = 0;
    this.currentLevel = 1;
  }

  saveHighScore(score: number): void {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem('turkeyEscapeHighScore', score.toString());
    }
  }

  getHighScore(): number {
    const stored = localStorage.getItem('turkeyEscapeHighScore');
    return stored ? parseInt(stored, 10) : 0;
  }
}
