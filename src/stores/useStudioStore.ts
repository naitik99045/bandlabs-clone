import { create } from "zustand";
import { VocalPreferences } from "@/types/settings";
import { audioEngine, MetronomeSound } from "@/lib/audio/AudioEngine";

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

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  trackCount: number;
  bpm: number;
  key: string;
}

export const DRUM_SOUNDS = [
  { id: "kick", name: "Kick 808", color: "oklch(64% 0.16 30)" },
  { id: "snare", name: "Trap Snare", color: "oklch(74% 0.14 85)" },
  { id: "clap", name: "Bright Clap", color: "oklch(72% 0.12 95)" },
  { id: "hihat_closed", name: "Closed Hat", color: "oklch(78% 0.16 168)" },
  { id: "hihat_open", name: "Open Hat", color: "oklch(75% 0.13 185)" },
  { id: "bass808", name: "Sub 808", color: "oklch(68% 0.10 240)" },
  { id: "perc", name: "Rim / Perc", color: "oklch(72% 0.13 130)" },
  { id: "crash", name: "Crash", color: "oklch(76% 0.12 210)" },
];

const createEmptyDrumGrid = (): DrumMatrix =>
  Array(8)
    .fill(null)
    .map(() =>
      Array(16)
        .fill(null)
        .map(() => ({ active: false, velocity: 0.8 }))
    );

const createDefaultTrapGrid = (): DrumMatrix => {
  const grid = createEmptyDrumGrid();
  grid[0][0] = { active: true, velocity: 1.0 }; // Kick
  grid[0][10] = { active: true, velocity: 0.9 };
  grid[1][4] = { active: true, velocity: 1.0 }; // Snare
  grid[1][12] = { active: true, velocity: 1.0 };
  for (let i = 0; i < 16; i += 2) {
    grid[3][i] = { active: true, velocity: 0.7 }; // Closed Hat 8th notes
  }
  return grid;
};

const DEFAULT_PROJECTS: ProjectSummary[] = [
  {
    id: "proj-trap-starter",
    name: "Midnight Trap Session",
    updatedAt: "Just now",
    trackCount: 3,
    bpm: 140,
    key: "A Minor",
  },
  {
    id: "proj-vocal-pop",
    name: "Pop Vocal Melody (AutoPitch)",
    updatedAt: "2 hours ago",
    trackCount: 2,
    bpm: 120,
    key: "C Major",
  },
];

interface StudioState {
  // Navigation Screens
  currentView: "landing" | "dashboard" | "studio";
  setCurrentView: (view: "landing" | "dashboard" | "studio") => void;

  // Mobile Workspace Responsive Tab
  mobileActiveTab: "tracks" | "timeline";
  setMobileActiveTab: (tab: "tracks" | "timeline") => void;

  // Project Management
  currentProjectId: string;
  projectName: string;
  savedProjects: ProjectSummary[];
  setProjectName: (name: string) => void;
  createNewProject: (toolType?: "vocal" | "beatmaker" | "import" | "studio") => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Quick Create Bottom Sheet
  isCreateSheetOpen: boolean;
  setIsCreateSheetOpen: (open: boolean) => void;

  // Auth Modal Visibility
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // DAW State
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  totalDuration: number;
  bpm: number;
  key: string;
  isMetronomeOn: boolean;
  metronomeSound: MetronomeSound;
  masterVolume: number;
  tracks: StudioTrack[];
  drumMatrix: DrumMatrix;
  vocalSettings: VocalPreferences;
  selectedTrackId: string | null;
  activeModal: "vocal" | "beatmaker" | "export" | "settings" | null;

  // Transport & Engine Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentTime: (time: number) => void;
  setBpm: (bpm: number) => void;
  setKey: (key: string) => void;
  toggleMetronome: () => void;
  setMetronomeSound: (sound: MetronomeSound) => void;
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
  // Defaults to Landing so users experience the full BandLab discovery & onboarding flow
  currentView: "landing",
  setCurrentView: (currentView) => set({ currentView }),

  mobileActiveTab: "tracks",
  setMobileActiveTab: (mobileActiveTab) => set({ mobileActiveTab }),

  currentProjectId: "proj-session-1",
  projectName: "Untitled Session 1",
  savedProjects: DEFAULT_PROJECTS,
  setProjectName: (projectName) => set({ projectName }),

  isCreateSheetOpen: false,
  setIsCreateSheetOpen: (isCreateSheetOpen) => set({ isCreateSheetOpen }),

  isAuthModalOpen: false,
  setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),

  createNewProject: (toolType = "studio") => {
    const id = `proj-${Date.now()}`;
    let newTracks: StudioTrack[] = [];
    let initialBpm = 120;
    let initialKey = "C Major";
    let modalToOpen: "vocal" | "beatmaker" | "export" | "settings" | null = null;
    let name = "New Session";

    if (toolType === "vocal") {
      name = "Vocal Take Session";
      modalToOpen = "vocal";
      newTracks = [
        {
          id: `track-${Date.now()}-1`,
          name: "Lead Vocal (AutoPitch)",
          type: "vocal",
          color: "oklch(78% 0.16 168)",
          volume: 0.9,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: true,
          clips: [],
        },
        {
          id: `track-${Date.now()}-2`,
          name: "Backing Track",
          type: "beat",
          color: "oklch(74% 0.14 85)",
          volume: 0.8,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: false,
          clips: [],
        },
      ];
    } else if (toolType === "beatmaker") {
      name = "808 Beat Project";
      initialBpm = 140;
      initialKey = "A Minor";
      modalToOpen = "beatmaker";
      newTracks = [
        {
          id: `track-${Date.now()}-1`,
          name: "808 Drum Machine",
          type: "drum",
          color: "oklch(68% 0.10 240)",
          volume: 0.85,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: false,
          clips: [],
        },
        {
          id: `track-${Date.now()}-2`,
          name: "Instrumental Stem",
          type: "beat",
          color: "oklch(74% 0.14 85)",
          volume: 0.8,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: false,
          clips: [],
        },
      ];
    } else {
      name = "Full Studio Project";
      newTracks = [
        {
          id: `track-${Date.now()}-1`,
          name: "Lead Vocal (AutoPitch)",
          type: "vocal",
          color: "oklch(78% 0.16 168)",
          volume: 0.9,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: true,
          clips: [],
        },
        {
          id: `track-${Date.now()}-2`,
          name: "Instrumental Beat",
          type: "beat",
          color: "oklch(74% 0.14 85)",
          volume: 0.8,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: false,
          clips: [],
        },
        {
          id: `track-${Date.now()}-3`,
          name: "808 Drum Machine",
          type: "drum",
          color: "oklch(68% 0.10 240)",
          volume: 0.85,
          pan: 0,
          isMuted: false,
          isSoloed: false,
          isArmed: false,
          clips: [],
        },
      ];
    }

    const newProjectSummary: ProjectSummary = {
      id,
      name,
      updatedAt: "Just now",
      trackCount: newTracks.length,
      bpm: initialBpm,
      key: initialKey,
    };

    set((state) => ({
      currentProjectId: id,
      projectName: name,
      tracks: newTracks,
      bpm: initialBpm,
      key: initialKey,
      drumMatrix: toolType === "beatmaker" ? createDefaultTrapGrid() : createEmptyDrumGrid(),
      selectedTrackId: newTracks[0]?.id || null,
      activeModal: modalToOpen,
      currentView: "studio",
      isCreateSheetOpen: false,
      savedProjects: [newProjectSummary, ...state.savedProjects],
    }));
  },

  loadProject: (id: string) => {
    const proj = get().savedProjects.find((p) => p.id === id);
    if (proj) {
      set({
        currentProjectId: proj.id,
        projectName: proj.name,
        bpm: proj.bpm,
        key: proj.key,
        currentView: "studio",
      });
    }
  },

  deleteProject: (id: string) => {
    set((state) => ({
      savedProjects: state.savedProjects.filter((p) => p.id !== id),
    }));
  },

  isPlaying: false,
  isRecording: false,
  currentTime: 0,
  totalDuration: 180,
  bpm: 120,
  key: "C Major",
  isMetronomeOn: true,
  metronomeSound: "clave" as MetronomeSound,
  masterVolume: 0.85,
  drumMatrix: createDefaultTrapGrid(),
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
  toggleMetronome: () => {
    const next = !get().isMetronomeOn;
    if (next) {
      audioEngine.preloadMetronomeSamples().catch(() => {});
    }
    set({ isMetronomeOn: next });
  },
  setMetronomeSound: (metronomeSound) => {
    audioEngine.setMetronomeSound(metronomeSound);
    set({ metronomeSound });
  },
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
      vocal: "oklch(78% 0.16 168)",
      beat: "oklch(74% 0.14 85)",
      drum: "oklch(68% 0.10 240)",
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
      drumMatrix: createEmptyDrumGrid(),
    }),

  updateVocalSettings: (updates) =>
    set((state) => ({
      vocalSettings: { ...state.vocalSettings, ...updates },
    })),
}));
