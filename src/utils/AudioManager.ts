export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private backgroundMusicNode: OscillatorNode | null = null;
  private backgroundMusicGain: GainNode | null = null;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.initAudioContext(), { once: true });
      window.addEventListener('keydown', () => this.initAudioContext(), { once: true });
    }
  }

  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    return this.audioContext!;
  }

  playJump(): void {
    const ctx = this.ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  playGobble(): void {
    const ctx = this.ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  playHit(): void {
    const ctx = this.ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  playLevelComplete(): void {
    const ctx = this.ensureAudioContext();
    const notes = [262, 330, 392, 523]; // C, E, G, C (major chord arpeggio)

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
      gainNode.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.3, ctx.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.2);

      oscillator.start(ctx.currentTime + index * 0.1);
      oscillator.stop(ctx.currentTime + index * 0.1 + 0.2);
    });
  }

  playGameOver(): void {
    const ctx = this.ensureAudioContext();
    const notes = [392, 370, 349, 330, 294]; // Descending notes

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
      gainNode.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.3, ctx.currentTime + index * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.15 + 0.3);

      oscillator.start(ctx.currentTime + index * 0.15);
      oscillator.stop(ctx.currentTime + index * 0.15 + 0.3);
    });
  }

  startBackgroundMusic(): void {
    // Stop any existing music first
    this.stopBackgroundMusic();

    // Prevent multiple starts
    if (this.isPlaying) return;
    this.isPlaying = true;

    const ctx = this.ensureAudioContext();

    // Create a simple melodic loop
    const melodyNotes = [262, 294, 330, 349, 392, 349, 330, 294]; // C D E F G F E D
    let noteIndex = 0;

    // Create master gain for background music
    this.backgroundMusicGain = ctx.createGain();
    this.backgroundMusicGain.gain.value = this.masterVolume * this.musicVolume;
    this.backgroundMusicGain.connect(ctx.destination);

    // Create a dummy oscillator to keep track of music state
    this.backgroundMusicNode = ctx.createOscillator();
    this.backgroundMusicNode.frequency.value = 0;
    this.backgroundMusicNode.start();

    const playNote = () => {
      if (!this.isPlaying || !this.backgroundMusicGain) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.backgroundMusicGain);

      oscillator.frequency.value = melodyNotes[noteIndex];
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);

      noteIndex = (noteIndex + 1) % melodyNotes.length;
    };

    // Play notes at intervals
    this.musicInterval = setInterval(() => {
      if (!this.isPlaying) {
        if (this.musicInterval) {
          clearInterval(this.musicInterval);
          this.musicInterval = null;
        }
        return;
      }
      playNote();
    }, 300);
  }

  stopBackgroundMusic(): void {
    this.isPlaying = false;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    if (this.backgroundMusicNode) {
      try {
        this.backgroundMusicNode.stop();
      } catch (e) {
        // Already stopped
      }
      this.backgroundMusicNode = null;
    }

    if (this.backgroundMusicGain) {
      this.backgroundMusicGain.disconnect();
      this.backgroundMusicGain = null;
    }
  }
}
