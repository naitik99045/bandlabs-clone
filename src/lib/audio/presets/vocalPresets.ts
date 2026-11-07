import { VocalPreferences } from "@/types/settings";

export interface VocalPresetDef {
  id: string;
  name: string;
  tag: string;
  description: string;
  color: string;
  settings: Partial<VocalPreferences>;
}

export const BANDLAB_VOCAL_PRESETS: VocalPresetDef[] = [
  {
    id: "studio-rap",
    name: "Studio Rap",
    tag: "Modern Trap / Rap",
    description: "Crisp highs, punchy optical compression, medium AutoPitch and subtle spatial delay.",
    color: "#ff3b30",
    settings: {
      autoPitchEnabled: true,
      correctionSpeed: 85,
      reverbWet: 0.22,
      delayWet: 0.16,
      compressionRatio: 5,
      eqHighBoost: 3,
      eqLowCut: 110,
    },
  },
  {
    id: "hyperpop",
    name: "Hyperpop 0ms",
    tag: "Hard-Tune / Robotic",
    description: "Extreme instantaneous pitch quantization (0ms speed), heavy brightness, and ping-pong delay.",
    color: "#ec4899",
    settings: {
      autoPitchEnabled: true,
      correctionSpeed: 10, // Max robotic hard-tune
      reverbWet: 0.35,
      delayWet: 0.3,
      compressionRatio: 8,
      eqHighBoost: 5,
      eqLowCut: 130,
    },
  },
  {
    id: "warm-vintage",
    name: "Warm Vintage",
    tag: "R&B / Soul / Lo-Fi",
    description: "Warm analog midrange presence, natural soft pitch correction, and cozy chamber reverb.",
    color: "#f59e0b",
    settings: {
      autoPitchEnabled: true,
      correctionSpeed: 60,
      reverbWet: 0.3,
      delayWet: 0.08,
      compressionRatio: 3.5,
      eqHighBoost: 1,
      eqLowCut: 90,
    },
  },
  {
    id: "spaced-out",
    name: "Spaced Out",
    tag: "Ambient / Shoegaze",
    description: "Huge lush hall reverb, echoing stereo feedback delays, and ethereal vocal atmosphere.",
    color: "#8b5cf6",
    settings: {
      autoPitchEnabled: true,
      correctionSpeed: 75,
      reverbWet: 0.65,
      delayWet: 0.45,
      compressionRatio: 4,
      eqHighBoost: 2,
      eqLowCut: 120,
    },
  },
  {
    id: "clean-vocal",
    name: "Clean Studio Vocal",
    tag: "Acoustic / Pop",
    description: "Subtle pitch assistance, transparent transparent leveling compression, and studio room shimmer.",
    color: "#10b981",
    settings: {
      autoPitchEnabled: true,
      correctionSpeed: 95,
      reverbWet: 0.18,
      delayWet: 0.05,
      compressionRatio: 3,
      eqHighBoost: 1.5,
      eqLowCut: 80,
    },
  },
];
