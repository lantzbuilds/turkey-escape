// Singleton AudioManager to prevent multiple music instances
let instance: AudioManager | null = null;

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
    // Return existing instance if already created (singleton pattern)
    if (instance) {
      return instance;
    }
    instance = this;

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

    // Melody notes (higher voice) - a fun, bouncy 8-bit tune in C major
    // Two bars of melody that create a chase/escape feeling
    const melodyNotes = [
      392, 440, 494, 523,  // G A B C (ascending run)
      494, 440, 392, 330,  // B A G E (descending)
      349, 392, 440, 392,  // F G A G (bounce)
      330, 294, 330, 392,  // E D E G (resolve up)
    ];

    // Bass notes (lower voice) - root notes, one octave higher for clarity
    // Each bass note plays for 2 melody notes
    const bassNotes = [
      262, 262,  // C3
      220, 220,  // A2
      233, 233,  // Bb2
      262, 294,  // C3, D3
    ];

    let melodyIndex = 0;
    let bassIndex = 0;
    let beatCount = 0;

    // Create master gain for background music
    this.backgroundMusicGain = ctx.createGain();
    this.backgroundMusicGain.gain.value = this.masterVolume * this.musicVolume;
    this.backgroundMusicGain.connect(ctx.destination);

    // Create a dummy oscillator to keep track of music state
    this.backgroundMusicNode = ctx.createOscillator();
    this.backgroundMusicNode.frequency.value = 0;
    this.backgroundMusicNode.start();

    const playMelody = () => {
      if (!this.isPlaying || !this.backgroundMusicGain) return;

      // Melody voice - square wave for that classic 8-bit sound
      const melodyOsc = ctx.createOscillator();
      const melodyGain = ctx.createGain();

      melodyOsc.type = 'square';
      melodyOsc.connect(melodyGain);
      melodyGain.connect(this.backgroundMusicGain);

      melodyOsc.frequency.value = melodyNotes[melodyIndex];
      melodyGain.gain.setValueAtTime(0.08, ctx.currentTime);
      melodyGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      melodyOsc.start(ctx.currentTime);
      melodyOsc.stop(ctx.currentTime + 0.15);

      melodyIndex = (melodyIndex + 1) % melodyNotes.length;
    };

    const playBass = () => {
      if (!this.isPlaying || !this.backgroundMusicGain) return;

      // Bass voice - sawtooth wave for a punchy, audible bass
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.connect(bassGain);
      bassGain.connect(this.backgroundMusicGain);

      bassOsc.frequency.value = bassNotes[bassIndex];
      // Louder attack, longer sustain for bass
      bassGain.gain.setValueAtTime(0.15, ctx.currentTime);
      bassGain.gain.setValueAtTime(0.12, ctx.currentTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);

      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 0.28);

      bassIndex = (bassIndex + 1) % bassNotes.length;
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

      // Play melody every beat
      playMelody();

      // Play bass every 2 beats
      if (beatCount % 2 === 0) {
        playBass();
      }

      beatCount++;
    }, 150); // Faster tempo for more energy
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
