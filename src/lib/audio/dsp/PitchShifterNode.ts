// Real-Time Web Audio Dual-Delay Granular Pitch Shifter & AutoPitch Engine
// Implements Doppler pitch transposition with crossfaded windowing

export class PitchShifterNode {
  public input: GainNode;
  public output: GainNode;
  private ctx: AudioContext;

  private delayA: DelayNode;
  private delayB: DelayNode;
  private gainA: GainNode;
  private gainB: GainNode;

  private bufferLen: number = 0.05; // 50ms grain window
  private semitones: number = 0;
  private isActive: boolean = true;
  private lfoTimer: number | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();

    this.delayA = ctx.createDelay(0.1);
    this.delayB = ctx.createDelay(0.1);

    this.gainA = ctx.createGain();
    this.gainB = ctx.createGain();

    // Wiring dual delay-line graph
    this.input.connect(this.delayA);
    this.input.connect(this.delayB);

    this.delayA.connect(this.gainA);
    this.delayB.connect(this.gainB);

    this.gainA.connect(this.output);
    this.gainB.connect(this.output);

    this.startModulation();
  }

  // Set pitch shift in semitones (-12 to +12)
  public setPitch(semitones: number) {
    this.semitones = Math.max(-12, Math.min(12, semitones));
  }

  public setEnabled(enabled: boolean) {
    this.isActive = enabled;
    if (!enabled) {
      this.gainA.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.gainB.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.delayA.delayTime.setValueAtTime(0, this.ctx.currentTime);
      this.delayB.delayTime.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  // Continuously modulates delay time to create real pitch shift
  private startModulation() {
    const grainTime = 0.05; // 50ms grains
    let phase = 0;
    const intervalMs = 15;

    const tick = () => {
      if (!this.isActive || this.semitones === 0) {
        return;
      }

      const now = this.ctx.currentTime;
      // Pitch ratio = 2^(semitones / 12)
      const ratio = Math.pow(2, this.semitones / 12);
      // Slope delta = 1 - ratio
      const slope = 1.0 - ratio;

      phase = (phase + (intervalMs / 1000) * Math.abs(slope) / grainTime) % 1.0;

      // Phase A & Phase B (180 degrees out of phase)
      const phaseA = phase;
      const phaseB = (phase + 0.5) % 1.0;

      // Delay times ramp from 0 to grainTime
      const delayTimeA = phaseA * grainTime;
      const delayTimeB = phaseB * grainTime;

      // Crossfading triangular window gains
      const gainValA = 1.0 - Math.abs(2.0 * phaseA - 1.0);
      const gainValB = 1.0 - Math.abs(2.0 * phaseB - 1.0);

      this.delayA.delayTime.setTargetAtTime(Math.max(0.001, delayTimeA), now, 0.01);
      this.delayB.delayTime.setTargetAtTime(Math.max(0.001, delayTimeB), now, 0.01);

      this.gainA.gain.setTargetAtTime(gainValA, now, 0.01);
      this.gainB.gain.setTargetAtTime(gainValB, now, 0.01);
    };

    if (typeof window !== "undefined") {
      this.lfoTimer = window.setInterval(tick, intervalMs);
    }
  }

  public destroy() {
    if (this.lfoTimer && typeof window !== "undefined") {
      window.clearInterval(this.lfoTimer);
    }
    this.input.disconnect();
    this.output.disconnect();
  }
}
