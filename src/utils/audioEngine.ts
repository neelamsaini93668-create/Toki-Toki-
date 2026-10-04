/**
 * Real-time Web Audio Synthesizer for TokiToki
 * Synthesizes rhythmic beats and music loops so sound always works cleanly without external audio dependencies.
 */

class TokiAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private currentPattern: string | null = null;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;
  private tempo: number = 120;
  private step: number = 0;

  constructor() {
    // Lazy initialized on first user interaction to satisfy browser autoplay policy
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : 0.4;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    if (!muted && this.currentPattern) {
      this.initCtx();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(clamped * 0.5, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playSound(patternType: string, bpm: number = 120) {
    this.initCtx();
    this.stopSound();

    this.currentPattern = patternType;
    this.tempo = bpm;
    this.step = 0;

    const intervalTime = (60 / this.tempo) * 1000 / 4; // 16th note steps

    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      this.triggerStep(patternType, this.step);
      this.step = (this.step + 1) % 16;
    }, intervalTime);
  }

  public stopSound() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private triggerStep(type: string, s: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Drum kick / Dhol bass
    if (type === 'dhol') {
      // Dhol beat pattern (Dum-dum-tak-dum-tak)
      if (s === 0 || s === 4 || s === 10) {
        this.playDholBass(now, s === 0 ? 110 : 90);
      }
      if (s === 6 || s === 14 || s === 8) {
        this.playDholTreble(now);
      }
      if (s % 2 === 0) {
        this.playMelodicChime(now, 440 + (s * 30), 0.08);
      }
    } else if (type === 'edm') {
      // 4-on-the-floor EDM beat
      if (s % 4 === 0) {
        this.playKick(now);
      }
      if (s % 4 === 2) {
        this.playSnare(now);
      }
      if (s % 2 === 1) {
        this.playHiHat(now);
      }
      // Synth bassline
      const notes = [220, 246.9, 261.6, 293.6];
      const note = notes[Math.floor(s / 4) % notes.length];
      this.playSynthBass(now, note);
    } else if (type === 'lofi') {
      // Chill lofi beat
      if (s === 0 || s === 7 || s === 10) {
        this.playKick(now, 0.2);
      }
      if (s === 4 || s === 12) {
        this.playSnare(now, 0.15);
      }
      if (s % 2 === 0) {
        this.playLofiChords(now, s);
      }
    } else if (type === 'hiphop') {
      // Desi Hip-hop beat
      if (s === 0 || s === 6 || s === 8) {
        this.play808Bass(now);
      }
      if (s === 4 || s === 12) {
        this.playSnare(now);
      }
      if (s % 2 === 1) {
        this.playHiHat(now, 0.1);
      }
    } else {
      // Acoustic pop
      if (s === 0 || s === 8) {
        this.playKick(now, 0.25);
      }
      if (s === 4 || s === 12) {
        this.playSnare(now, 0.2);
      }
      if (s % 2 === 0) {
        this.playAcousticPluck(now, [330, 392, 440, 523][(s / 2) % 4]);
      }
    }
  }

  private playKick(t: number, vol: number = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private playDholBass(t: number, freq: number = 100) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  private playDholTreble(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  private playSnare(t: number, vol: number = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 0.1);
  }

  private playHiHat(t: number, vol: number = 0.15) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 0.04);
  }

  private play808Bass(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.4);
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  private playSynthBass(t: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq / 2, t);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private playMelodicChime(t: number, freq: number, vol: number = 0.1) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private playLofiChords(t: number, stepIndex: number) {
    if (!this.ctx || !this.masterGain) return;
    const chordFrequencies = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66], // G major
    ];
    const chord = chordFrequencies[Math.floor(stepIndex / 4) % chordFrequencies.length];
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  private playAcousticPluck(t: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.28);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  // Play a quick celebration or like pop sound effect
  public playLikeSound() {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const audioEngine = new TokiAudioEngine();
