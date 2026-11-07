import { create } from "zustand";
import { VocalPreferences } from "@/types/settings";

export interface AudioClip {
  id: string;
  name: string;
  startTime: number; // in seconds on timeline
  duration: number; // in seconds
  audioBuffer: AudioBuffer | null;
  audioBlob?: Blob;
  peaks?: number[]; // for waveform drawing
}

export interface StudioTrack {
  id: string;
  name: string;
  type: "vocal" | "beat" | "drum";
  color: string;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  isMuted: boolean;
  isSoloed: boolean;
  isArmed: boolean; // ready for mic recording
  clips: AudioClip[];
}

export interface DrumStep {
  active: boolean;
  velocity: number;
}

export type DrumMatrix = DrumStep[][]; // [soundIndex][stepIndex (0..15)]

export const DRUM_SOUNDS = [
  { id: "kick", name: "Kick 808", color: "#ff3b30" },
  { id: "snare", name: "Trap Snare", color: "#f59e0b" },
  { id: "clap", name: "Bright Clap", color: "#eab308" },
  { id: "hihat_closed", name: "Closed Hat", color: "#10b981" },
  { id: "hihat_open", name: "Open Hat", color: "#06b6d4" },
  { id: "bass808", name: "Sub 808", color: "#8b5cf6" },
  { id: "perc", name: "Rim / Perc", color: "#ec4899" },
  { id: "crash", name: "Crash", color: "#3b82f6" },
];

const INITIAL_DRUM_GRID: DrumMatrix = Array(8)
  .fill(null)
  .map(() =>
    Array(16)
      .fill(null)
      .map(() => ({ active: false, velocity: 0.8 }))
  );

// Default Trap Bounce preset
INITIAL_DRUM_GRID[0][0] = { active: true, velocity: 1.0 }; // Kick
INITIAL_DRUM_GRID[0][10] = { active: true, velocity: 0.9 };
INITIAL_DRUM_GRID[1][4] = { active: true, velocity: 1.0 }; // Snare
INITIAL_DRUM_GRID[1][12] = { active: true, velocity: 1.0 };
for (let i = 0; i < 16; i += 2) {
  INITIAL_DRUM_GRID[3][i] = { active: true, velocity: 0.7 }; // Closed Hat 8th notes
}

interface StudioState {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  totalDuration: number;
  bpm: number;
  key: string;
  isMetronomeOn: boolean;
  masterVolume: number;
  tracks: StudioTrack[];
  drumMatrix: DrumMatrix;
  vocalSettings: VocalPreferences;
  selectedTrackId: string | null;
  activeModal: "vocal" | "beatmaker" | "export" | "settings" | null;

  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentTime: (time: number) => void;
  setBpm: (bpm: number) => void;
  setKey: (key: string) => void;
  toggleMetronome: () => void;
  setMasterVolume: (volume: number) => void;
  setSelectedTrackId: (id: string | null) => void;
  setActiveModal: (modal: "vocal" | "beatmaker" | "export" | "settings" | null) => void;
  
  // Track Actions
  addTrack: (type: "vocal" | "beat" | "drum", name?: string) => string;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<StudioTrack>) => void;
  addClipToTrack: (trackId: string, clip: AudioClip) => void;
  removeClip: (trackId: string, clipId: string) => void;

  // Drum Sequencer Actions
  toggleDrumStep: (soundIndex: number, stepIndex: number) => void;
  clearDrumMatrix: () => void;

  // Vocal FX Settings Actions
  updateVocalSettings: (updates: Partial<VocalPreferences>) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  isPlaying: false,
  isRecording: false,
  currentTime: 0,
  totalDuration: 180, // 3 minutes default timeline
  bpm: 120,
  key: "C Major",
  isMetronomeOn: true,
  masterVolume: 0.85,
  drumMatrix: INITIAL_DRUM_GRID,
  selectedTrackId: "track-vocal-1",
  activeModal: null,

  vocalSettings: {
    autoPitchEnabled: true,
    correctionSpeed: 85,
    scale: "Major",
    key: "C",
    reverbWet: 0.28,
    delayWet: 0.18,
    delayTime: "8n",
    compressionRatio: 4.5,
    eqHighBoost: 2.5,
    eqLowCut: 100,
  },

  tracks: [
    {
      id: "track-beat-1",
      name: "Instrumental Beat",
      type: "beat",
      color: "#00d2ff",
      volume: 0.8,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      isArmed: false,
      clips: [],
    },
    {
      id: "track-vocal-1",
      name: "Lead Vocal (AutoPitch)",
      type: "vocal",
      color: "#ff3b30",
      volume: 0.9,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      isArmed: true,
      clips: [],
    },
    {
      id: "track-drum-1",
      name: "808 Drum Machine",
      type: "drum",
      color: "#8b5cf6",
      volume: 0.85,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      isArmed: false,
      clips: [],
    },
  ],

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setCurrentTime: (currentTime) => set({ currentTime: Math.max(0, currentTime) }),
  setBpm: (bpm) => set({ bpm: Math.min(240, Math.max(40, bpm)) }),
  setKey: (key) => set({ key }),
  toggleMetronome: () => set((state) => ({ isMetronomeOn: !state.isMetronomeOn })),
  setMasterVolume: (masterVolume) => set({ masterVolume: Math.min(1, Math.max(0, masterVolume)) }),
  setSelectedTrackId: (selectedTrackId) => set({ selectedTrackId }),
  setActiveModal: (activeModal) => set({ activeModal }),

  addTrack: (type, name) => {
    const id = `track-${Date.now()}`;
    const defaultName =
      name ||
      (type === "vocal" ? `Vocal ${get().tracks.filter((t) => t.type === "vocal").length + 1}` :
       type === "beat" ? "Backing Beat" : "Drum Track");
    const colors = {
      vocal: "#ff3b30",
      beat: "#00d2ff",
      drum: "#8b5cf6",
    };

    set((state) => ({
      tracks: [
        ...state.tracks,
        {
          id,
          name: defaultName,
          type,
          color: colors[type],
          volume: 0.8,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: type === "vocal",
          clips: [],
        },
      ],
      selectedTrackId: id,
    }));
    return id;
  },

  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
      selectedTrackId: state.selectedTrackId === id ? null : state.selectedTrackId,
    })),

  updateTrack: (id, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  addClipToTrack: (trackId, clip) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
      ),
    })),

  removeClip: (trackId, clipId) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
          : t
      ),
    })),

  toggleDrumStep: (soundIndex, stepIndex) =>
    set((state) => {
      const newMatrix = state.drumMatrix.map((row, rIdx) =>
        rIdx === soundIndex
          ? row.map((step, sIdx) =>
              sIdx === stepIndex ? { ...step, active: !step.active } : step
            )
          : row
      );
      return { drumMatrix: newMatrix };
    }),

  clearDrumMatrix: () =>
    set({
      drumMatrix: Array(8)
        .fill(null)
        .map(() =>
          Array(16)
            .fill(null)
            .map(() => ({ active: false, velocity: 0.8 }))
        ),
    }),

  updateVocalSettings: (updates) =>
    set((state) => ({
      vocalSettings: { ...state.vocalSettings, ...updates },
    })),
}));
