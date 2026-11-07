// Acoustic & Timbral Sound Modulations: LFO Chorus, Vibrato & Tube Saturation

export class ChorusModulationNode {
  public input: GainNode;
  public output: GainNode;
  private delayNode: DelayNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(ctx: AudioContext, rateHz: number = 1.5, depthSec: number = 0.003) {
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();

    this.delayNode = ctx.createDelay(0.05);
    this.delayNode.delayTime.setValueAtTime(0.015, ctx.currentTime);

    // LFO Oscillator
    this.lfo = ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.setValueAtTime(rateHz, ctx.currentTime);

    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.setValueAtTime(depthSec, ctx.currentTime);

    // Wire LFO to delay time for pitch vibrato / chorus shimmer
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delayNode.delayTime);

    // Audio path
    this.input.connect(this.dryGain);
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.wetGain);

    this.dryGain.connect(this.output);
    this.wetGain.connect(this.output);

    this.setWet(0.3);
    this.lfo.start();
  }

  public setRate(rateHz: number, ctx: AudioContext) {
    this.lfo.frequency.setTargetAtTime(rateHz, ctx.currentTime, 0.05);
  }

  public setDepth(depthSec: number, ctx: AudioContext) {
    this.lfoGain.gain.setTargetAtTime(depthSec, ctx.currentTime, 0.05);
  }

  public setWet(wet: number) {
    this.wetGain.gain.setValueAtTime(wet, 0);
    this.dryGain.gain.setValueAtTime(1 - wet * 0.5, 0);
  }

  public destroy() {
    try {
      this.lfo.stop();
    } catch {}
    this.input.disconnect();
    this.output.disconnect();
  }
}

// Analog Tube / Tape Saturation WaveShaper Curve
export function createSaturationNode(ctx: AudioContext, drive: number = 20): WaveShaperNode {
  const waveShaper = ctx.createWaveShaper();
  // Bypass DOM lib typed array ArrayBuffer vs ArrayBufferLike mismatch
  (waveShaper as unknown as { curve: unknown }).curve = makeDistortionCurve(drive, ctx.sampleRate);
  waveShaper.oversample = "4x";
  return waveShaper;
}

function makeDistortionCurve(amount: number, sampleRate: number): Float32Array {
  const k = typeof amount === "number" ? amount : 20;
  const n_samples = sampleRate;
  const buffer = new ArrayBuffer(n_samples * 4);
  const curve = new Float32Array(buffer);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    // Classic soft-clipping analog warmth equation
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
