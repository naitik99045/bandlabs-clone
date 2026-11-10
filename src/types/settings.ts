export interface VocalPreferences {
  autoPitchEnabled: boolean;
  correctionSpeed: number; // 0 (robotic) to 100 (natural)
  scale: "Chromatic" | "Major" | "Minor" | "Pentatonic";
  key: string; // "C", "C#", "D", etc.
  reverbWet: number; // 0 to 1
  delayWet: number; // 0 to 1
  delayTime: string; // "8n", "4n", etc.
  compressionRatio: number; // 1 to 20
  eqHighBoost: number; // dB
  eqLowCut: number; // Hz
  pitchShiftSemitones?: number; // -12 to +12
  saturationDrive?: number; // 0 to 100
  chorusWet?: number; // 0 to 1
  activePresetId?: string;
}

export interface BeatPreferences {
  defaultKit: "Trap-808" | "Lo-Fi" | "Boom-Bap";
  swing: number; // 0 to 1
  masterBeatVolume: number; // 0 to 1
}

export interface ExportPreferences {
  format: "mp3" | "wav";
  bitrate: 128 | 192 | 256 | 320;
  normalize: boolean;
  sampleRate: 44100 | 48000;
}

export interface CustomVocalPreset {
  id: string;
  name: string;
  description?: string;
  settings: VocalPreferences;
}

export interface UserSettings {
  id: string; // Firebase Auth UID
  email: string | null;
  display_name: string;
  avatar_url?: string;
  default_bpm: number;
  default_key: string;
  default_vocal_preset: string;
  vocal_preferences: VocalPreferences;
  beat_preferences: BeatPreferences;
  export_preferences: ExportPreferences;
  saved_presets: CustomVocalPreset[];
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, "id" | "email"> = {
  display_name: "Producer",
  default_bpm: 120,
  default_key: "C Major",
  default_vocal_preset: "Studio Rap",
  vocal_preferences: {
    autoPitchEnabled: true,
    correctionSpeed: 80,
    scale: "Major",
    key: "C",
    reverbWet: 0.25,
    delayWet: 0.15,
    delayTime: "8n",
    compressionRatio: 4,
    eqHighBoost: 2,
    eqLowCut: 100,
  },
  beat_preferences: {
    defaultKit: "Trap-808",
    swing: 0,
    masterBeatVolume: 0.85,
  },
  export_preferences: {
    format: "mp3",
    bitrate: 320,
    normalize: true,
    sampleRate: 44100,
  },
  saved_presets: [],
};
