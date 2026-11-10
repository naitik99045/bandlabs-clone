// BandLab 8-Profile AI Mastering DSP Processor (MasteringActivity Replica)
import { createSaturationNode } from "./ModulationNode";

export type MasteringProfileId =
  | "universal"
  | "clarity"
  | "fire"
  | "tape"
  | "natural"
  | "spatial"
  | "punch"
  | "cinematic";

export interface MasteringProfileDef {
  id: MasteringProfileId;
  name: string;
  tag: string;
  description: string;
  color: string;
  lowBoostDb: number;
  lowCutoffHz: number;
  midFreqHz: number;
  midGainDb: number;
  midQ: number;
  highBoostDb: number;
  highFreqHz: number;
  compressorThreshold: number;
  compressorRatio: number;
  compressorAttack: number;
  compressorRelease: number;
  saturationDrive: number;
  stereoWidth: number;
}

export const BANDLAB_MASTERING_PROFILES: MasteringProfileDef[] = [
  {
    id: "universal",
    name: "Universal",
    tag: "Streaming Balance",
    description: "Multi-band dynamic balance and transparent loudness optimized for streaming platforms.",
    color: "oklch(78% 0.16 168)", // Signal Mint
    lowBoostDb: 1.5,
    lowCutoffHz: 80,
    midFreqHz: 2500,
    midGainDb: 1.0,
    midQ: 0.8,
    highBoostDb: 2.0,
    highFreqHz: 10000,
    compressorThreshold: -14,
    compressorRatio: 4,
    compressorAttack: 0.015,
    compressorRelease: 0.15,
    saturationDrive: 8,
    stereoWidth: 1.15,
  },
  {
    id: "clarity",
    name: "Clarity",
    tag: "Air & Presence",
    description: "High-frequency air lift and midrange de-mudding for clean modern pop and vocal clarity.",
    color: "oklch(76% 0.11 205)", // Teal Slate
    lowBoostDb: 0.5,
    lowCutoffHz: 60,
    midFreqHz: 3500,
    midGainDb: 2.5,
    midQ: 1.2,
    highBoostDb: 4.5,
    highFreqHz: 9500,
    compressorThreshold: -16,
    compressorRatio: 3.5,
    compressorAttack: 0.01,
    compressorRelease: 0.12,
    saturationDrive: 5,
    stereoWidth: 1.25,
  },
  {
    id: "fire",
    name: "Fire",
    tag: "Aggressive Loudness",
    description: "Heavy RMS maximization, warm analog preamp saturation, and deep 808 sub-bass slam.",
    color: "oklch(64% 0.18 28)", // Nordic Carmine
    lowBoostDb: 4.0,
    lowCutoffHz: 50,
    midFreqHz: 2000,
    midGainDb: 1.8,
    midQ: 1.0,
    highBoostDb: 3.0,
    highFreqHz: 8500,
    compressorThreshold: -10,
    compressorRatio: 8,
    compressorAttack: 0.005,
    compressorRelease: 0.18,
    saturationDrive: 35,
    stereoWidth: 1.2,
  },
  {
    id: "tape",
    name: "Tape",
    tag: "Analog Warmth",
    description: "Warm magnetic tape head emulation, vintage low-mid resonance, and silky transient roll-off.",
    color: "oklch(74% 0.14 85)", // Warm Ochre
    lowBoostDb: 2.5,
    lowCutoffHz: 120,
    midFreqHz: 800,
    midGainDb: 1.5,
    midQ: 0.7,
    highBoostDb: -1.0,
    highFreqHz: 14000,
    compressorThreshold: -15,
    compressorRatio: 3.0,
    compressorAttack: 0.02,
    compressorRelease: 0.2,
    saturationDrive: 28,
    stereoWidth: 1.05,
  },
  {
    id: "natural",
    name: "Natural",
    tag: "Dynamic Range",
    description: "Preserves organic dynamics and acoustic nuances with ultra-transparent mastering compression.",
    color: "oklch(77% 0.11 160)", // Sage Slate
    lowBoostDb: 0.5,
    lowCutoffHz: 70,
    midFreqHz: 2000,
    midGainDb: 0.5,
    midQ: 0.6,
    highBoostDb: 1.0,
    highFreqHz: 10000,
    compressorThreshold: -20,
    compressorRatio: 2.0,
    compressorAttack: 0.03,
    compressorRelease: 0.25,
    saturationDrive: 2,
    stereoWidth: 1.0,
  },
  {
    id: "spatial",
    name: "Spatial",
    tag: "3D Binaural Width",
    description: "Expands the stereo image into an immersive 3D space with subtle ambient reflections.",
    color: "oklch(73% 0.16 290)", // Deep Lavender
    lowBoostDb: 1.2,
    lowCutoffHz: 75,
    midFreqHz: 4000,
    midGainDb: 1.5,
    midQ: 0.9,
    highBoostDb: 3.5,
    highFreqHz: 11000,
    compressorThreshold: -15,
    compressorRatio: 3.8,
    compressorAttack: 0.015,
    compressorRelease: 0.16,
    saturationDrive: 6,
    stereoWidth: 1.5,
  },
  {
    id: "punch",
    name: "Punch",
    tag: "Transient Impact",
    description: "Accentuated kick attacks and snappy snare transients engineered for club and trap beats.",
    color: "oklch(70% 0.13 145)", // Moss Phosphor
    lowBoostDb: 3.2,
    lowCutoffHz: 90,
    midFreqHz: 2800,
    midGainDb: 2.0,
    midQ: 1.4,
    highBoostDb: 2.8,
    highFreqHz: 9000,
    compressorThreshold: -12,
    compressorRatio: 5.5,
    compressorAttack: 0.025,
    compressorRelease: 0.1,
    saturationDrive: 18,
    stereoWidth: 1.15,
  },
  {
    id: "cinematic",
    name: "Cinematic",
    tag: "Epic Sub & Highs",
    description: "Monumental low-end extension, deep cinematic rumble, and breathtaking orchestral air.",
    color: "oklch(68% 0.10 240)", // Indigo Slate
    lowBoostDb: 3.8,
    lowCutoffHz: 45,
    midFreqHz: 1500,
    midGainDb: -0.8,
    midQ: 0.7,
    highBoostDb: 4.2,
    highFreqHz: 12000,
    compressorThreshold: -17,
    compressorRatio: 4.2,
    compressorAttack: 0.02,
    compressorRelease: 0.22,
    saturationDrive: 10,
    stereoWidth: 1.4,
  },
];

export interface MasteringNodes {
  input: GainNode;
  output: GainNode;
  lowShelf: BiquadFilterNode;
  midPeaking: BiquadFilterNode;
  highShelf: BiquadFilterNode;
  saturation: WaveShaperNode;
  compressor: DynamicsCompressorNode;
  limiter: DynamicsCompressorNode;
  dry: GainNode;
  wet: GainNode;
}

export function createMasteringRack(
  ctx: BaseAudioContext,
  profile: MasteringProfileDef,
  intensity: number = 75,
  bassTrim: number = 0,
  trebleTrim: number = 0
): MasteringNodes {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();

  const intensityScale = Math.max(0.1, intensity / 100);

  // 1. Bass Low-Shelf EQ
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = "lowshelf";
  lowShelf.frequency.setValueAtTime(profile.lowCutoffHz, 0);
  lowShelf.gain.setValueAtTime(profile.lowBoostDb * intensityScale + bassTrim, 0);

  // 2. Mid Presence EQ
  const midPeaking = ctx.createBiquadFilter();
  midPeaking.type = "peaking";
  midPeaking.frequency.setValueAtTime(profile.midFreqHz, 0);
  midPeaking.Q.setValueAtTime(profile.midQ, 0);
  midPeaking.gain.setValueAtTime(profile.midGainDb * intensityScale, 0);

  // 3. Treble High-Shelf EQ
  const highShelf = ctx.createBiquadFilter();
  highShelf.type = "highshelf";
  highShelf.frequency.setValueAtTime(profile.highFreqHz, 0);
  highShelf.gain.setValueAtTime(profile.highBoostDb * intensityScale + trebleTrim, 0);

  // 4. Analog Saturation / Harmonic Warmth
  const driveAmount = profile.saturationDrive * intensityScale;
  const saturation = createSaturationNode(ctx as AudioContext, Math.max(1, driveAmount));

  // 5. Mastering Multiband Compressor
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(profile.compressorThreshold * intensityScale, 0);
  compressor.knee.setValueAtTime(8, 0);
  compressor.ratio.setValueAtTime(profile.compressorRatio, 0);
  compressor.attack.setValueAtTime(profile.compressorAttack, 0);
  compressor.release.setValueAtTime(profile.compressorRelease, 0);

  // 6. Brickwall Peak Limiter (-0.3 dB True Peak ceiling)
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.setValueAtTime(-0.3, 0);
  limiter.knee.setValueAtTime(0, 0);
  limiter.ratio.setValueAtTime(20, 0);
  limiter.attack.setValueAtTime(0.001, 0);
  limiter.release.setValueAtTime(0.08, 0);

  // Wiring Graph
  input.connect(dry);

  input.connect(lowShelf);
  lowShelf.connect(midPeaking);
  midPeaking.connect(highShelf);
  highShelf.connect(saturation);
  saturation.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(wet);

  dry.connect(output);
  wet.connect(output);

  // Default: 100% Wet
  dry.gain.setValueAtTime(0, 0);
  wet.gain.setValueAtTime(1, 0);

  return {
    input,
    output,
    lowShelf,
    midPeaking,
    highShelf,
    saturation,
    compressor,
    limiter,
    dry,
    wet,
  };
}

// Render an entire AudioBuffer with mastering applied via OfflineAudioContext
export async function renderMasteredBuffer(
  sourceBuffer: AudioBuffer,
  profile: MasteringProfileDef,
  intensity: number = 75,
  bassTrim: number = 0,
  trebleTrim: number = 0
): Promise<AudioBuffer> {
  const offlineCtx = new OfflineAudioContext(
    sourceBuffer.numberOfChannels,
    sourceBuffer.length,
    sourceBuffer.sampleRate
  );

  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;

  const rack = createMasteringRack(offlineCtx, profile, intensity, bassTrim, trebleTrim);

  sourceNode.connect(rack.input);
  rack.output.connect(offlineCtx.destination);

  sourceNode.start(0);
  return await offlineCtx.startRendering();
}
