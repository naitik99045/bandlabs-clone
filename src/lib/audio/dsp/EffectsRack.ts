// BandLab Vocal Effects Rack & DSP Processor with True Pitch & Chorus Modulations
import { VocalPreferences } from "@/types/settings";
import { PitchShifterNode } from "./PitchShifterNode";
import { ChorusModulationNode, createSaturationNode } from "./ModulationNode";

export interface VocalNodes {
  input: GainNode;
  output: GainNode;
  pitchShifter: PitchShifterNode;
  chorus: ChorusModulationNode;
  saturation: WaveShaperNode;
  highpass: BiquadFilterNode;
  eqPeak: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
  delay: DelayNode;
  delayFeedback: GainNode;
  delayWet: GainNode;
  reverb: ConvolverNode;
  reverbWet: GainNode;
  dry: GainNode;
}

export function createVocalEffectsChain(ctx: AudioContext, prefs: VocalPreferences): VocalNodes {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();

  // 1. Highpass Filter (Cut low rumble)
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(prefs.eqLowCut || 100, ctx.currentTime);

  // 2. Real-Time Pitch Shifter & AutoPitch Modulation
  const pitchShifter = new PitchShifterNode(ctx);
  // Calculate semitone shift based on root key or preset speed
  const semitones = calculatePitchOffset(prefs.key || "C", prefs.correctionSpeed || 80);
  pitchShifter.setPitch(prefs.autoPitchEnabled ? semitones : 0);
  pitchShifter.setEnabled(prefs.autoPitchEnabled ?? true);

  // 3. Analog Tube / Tape Saturation
  const saturation = createSaturationNode(ctx, 15);

  // 4. LFO Chorus Modulation
  const chorus = new ChorusModulationNode(ctx, 1.2, 0.002);
  chorus.setWet(0.2);

  // 5. Presence Peak EQ
  const eqPeak = ctx.createBiquadFilter();
  eqPeak.type = "peaking";
  eqPeak.frequency.setValueAtTime(3200, ctx.currentTime);
  eqPeak.Q.setValueAtTime(1.2, ctx.currentTime);
  eqPeak.gain.setValueAtTime(prefs.eqHighBoost || 2, ctx.currentTime);

  // 6. High Shelf Air
  const eqHigh = ctx.createBiquadFilter();
  eqHigh.type = "highshelf";
  eqHigh.frequency.setValueAtTime(9000, ctx.currentTime);
  eqHigh.gain.setValueAtTime(prefs.eqHighBoost ? prefs.eqHighBoost * 0.8 : 1.5, ctx.currentTime);

  // 7. Studio Vocal Compressor
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, ctx.currentTime);
  compressor.knee.setValueAtTime(10, ctx.currentTime);
  compressor.ratio.setValueAtTime(prefs.compressionRatio || 4, ctx.currentTime);
  compressor.attack.setValueAtTime(0.015, ctx.currentTime);
  compressor.release.setValueAtTime(0.18, ctx.currentTime);

  // 8. Tempo Delay
  const delay = ctx.createDelay(2.0);
  delay.delayTime.setValueAtTime(0.25, ctx.currentTime);
  const delayFeedback = ctx.createGain();
  delayFeedback.gain.setValueAtTime(0.35, ctx.currentTime);
  const delayWet = ctx.createGain();
  delayWet.gain.setValueAtTime(prefs.delayWet || 0.15, ctx.currentTime);

  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delay.connect(delayWet);

  // 9. Lush Space Reverb
  const reverb = ctx.createConvolver();
  reverb.buffer = generateImpulseResponse(ctx, 2.2, 2.0);
  const reverbWet = ctx.createGain();
  reverbWet.gain.setValueAtTime(prefs.reverbWet || 0.25, ctx.currentTime);

  // Wiring Graph:
  // input -> highpass -> pitchShifter -> saturation -> chorus -> eqPeak -> eqHigh -> compressor
  input.connect(dry);
  input.connect(highpass);
  highpass.connect(pitchShifter.input);
  pitchShifter.output.connect(saturation);
  saturation.connect(chorus.input);
  chorus.output.connect(eqPeak);
  eqPeak.connect(eqHigh);
  eqHigh.connect(compressor);

  // Compressor feeds delay & reverb
  compressor.connect(delay);
  compressor.connect(reverb);
  reverb.connect(reverbWet);

  // Output mix
  dry.connect(output);
  compressor.connect(output);
  delayWet.connect(output);
  reverbWet.connect(output);

  return {
    input,
    output,
    pitchShifter,
    chorus,
    saturation,
    highpass,
    eqPeak,
    eqHigh,
    compressor,
    delay,
    delayFeedback,
    delayWet,
    reverb,
    reverbWet,
    dry,
  };
}

// Convert musical scale and correction speed to semitone modulation
function calculatePitchOffset(key: string, speed: number): number {
  const keyOffsets: Record<string, number> = {
    "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
    "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11
  };
  const baseOffset = keyOffsets[key] || 0;
  // If robotic hard-tune (speed < 30%), snap to prominent fifth or root
  if (speed < 30) {
    return (baseOffset % 12);
  }
  return 0; // Natural tracking
}

function generateImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const factor = Math.pow(1 - i / length, decay);
    left[i] = (Math.random() * 2 - 1) * factor;
    right[i] = (Math.random() * 2 - 1) * factor;
  }
  return impulse;
}

export function updateVocalChainParams(nodes: VocalNodes, prefs: VocalPreferences, ctx: AudioContext) {
  const now = ctx.currentTime;
  nodes.highpass.frequency.setTargetAtTime(prefs.eqLowCut || 100, now, 0.05);
  nodes.eqPeak.gain.setTargetAtTime(prefs.eqHighBoost || 2, now, 0.05);
  nodes.compressor.ratio.setTargetAtTime(prefs.compressionRatio || 4, now, 0.05);
  nodes.delayWet.gain.setTargetAtTime(prefs.delayWet, now, 0.05);
  nodes.reverbWet.gain.setTargetAtTime(prefs.reverbWet, now, 0.05);

  const semitones = calculatePitchOffset(prefs.key || "C", prefs.correctionSpeed || 80);
  nodes.pitchShifter.setPitch(prefs.autoPitchEnabled ? semitones : 0);
  nodes.pitchShifter.setEnabled(prefs.autoPitchEnabled);
}
