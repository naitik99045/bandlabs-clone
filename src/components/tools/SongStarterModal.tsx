"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  Music, 
  Sliders,
  Check,
  Disc3
} from "lucide-react";
import { useStudioStore, DRUM_SOUNDS, DrumStep } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";

interface SongIdea {
  id: string;
  genre: string;
  vibe: string;
  title: string;
  bpm: number;
  key: string;
  progression: string; // e.g. "i - VI - III - VII"
  chordNames: string[]; // e.g. ["Fm", "Db", "Ab", "Eb"]
  chordFrequencies: number[][]; // Hz for each chord voicing
  drumPattern: boolean[][]; // [soundIndex][step 0..15]
}

const GENRES = ["Trap", "Hip Hop", "Pop", "R&B", "Lo-Fi", "UK Drill"] as const;
const VIBES = ["Melodic & Emotional", "Dark & Aggressive", "Chill & Smooth", "Energetic & Bouncy"] as const;

// Curated algorithmic generator templates for authentic BandLab feel
const SONG_TEMPLATES: Record<string, Record<string, Omit<SongIdea, "id">>> = {
  Trap: {
    "Melodic & Emotional": {
      genre: "Trap",
      vibe: "Melodic & Emotional",
      title: "Midnight Tokyo Rain",
      bpm: 140,
      key: "F Minor",
      progression: "i - VI - III - VII",
      chordNames: ["Fm", "Db", "Ab", "Eb"],
      chordFrequencies: [
        [174.61, 207.65, 261.63], // Fm
        [138.59, 174.61, 207.65], // Db
        [207.65, 261.63, 311.13], // Ab
        [155.56, 196.0, 233.08],  // Eb
      ],
      drumPattern: [
        [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false], // kick
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // clap
        [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // hat closed
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false], // hat open
        [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false], // 808
        [false, false, true, false, false, false, true, false, false, false, false, false, false, true, false, false], // perc
        [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // crash
      ],
    },
    "Dark & Aggressive": {
      genre: "Trap",
      vibe: "Dark & Aggressive",
      title: "Nightcrawler 808",
      bpm: 144,
      key: "C Minor",
      progression: "i - iv - V - i",
      chordNames: ["Cm", "Fm", "G", "Cm"],
      chordFrequencies: [
        [130.81, 155.56, 196.0],  // Cm
        [174.61, 207.65, 261.63], // Fm
        [196.0, 246.94, 293.66],  // G
        [130.81, 155.56, 196.0],  // Cm
      ],
      drumPattern: [
        [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false], // kick
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // clap
        [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, true], // hat closed
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // hat open
        [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false], // 808
        [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false], // perc
        [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // crash
      ],
    },
  },
  Pop: {
    "Energetic & Bouncy": {
      genre: "Pop",
      vibe: "Energetic & Bouncy",
      title: "Neon Starlight",
      bpm: 124,
      key: "C Major",
      progression: "I - V - vi - IV",
      chordNames: ["C", "G", "Am", "F"],
      chordFrequencies: [
        [130.81, 164.81, 196.0],  // C
        [196.0, 246.94, 293.66],  // G
        [220.0, 261.63, 329.63],  // Am
        [174.61, 220.0, 261.63],  // F
      ],
      drumPattern: [
        [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // kick four-on-floor
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // clap
        [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // hat offbeat
        [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // hat open
        [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // 808
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // perc
        [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // crash
      ],
    },
  },
  "Lo-Fi": {
    "Chill & Smooth": {
      genre: "Lo-Fi",
      vibe: "Chill & Smooth",
      title: "Coffee & Vinyl Dust",
      bpm: 82,
      key: "Eb Major",
      progression: "ii7 - V7 - Imaj7 - VI7",
      chordNames: ["Fm7", "Bb7", "Ebmaj7", "C7"],
      chordFrequencies: [
        [174.61, 207.65, 261.63, 311.13], // Fm7
        [116.54, 146.83, 174.61, 207.65], // Bb7
        [155.56, 196.0, 233.08, 293.66],  // Ebmaj7
        [130.81, 164.81, 196.0, 233.08],  // C7
      ],
      drumPattern: [
        [true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false], // kick
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // clap
        [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // hat swing
        [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false], // hat open
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // 808
        [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false], // rim
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // crash
      ],
    },
  },
  "UK Drill": {
    "Dark & Aggressive": {
      genre: "UK Drill",
      vibe: "Dark & Aggressive",
      title: "London Sliding 808s",
      bpm: 142,
      key: "D# Minor",
      progression: "i - v - VI - v",
      chordNames: ["D#m", "A#m", "B", "A#m"],
      chordFrequencies: [
        [155.56, 185.0, 233.08],  // D#m
        [233.08, 277.18, 349.23], // A#m
        [246.94, 311.13, 369.99], // B
        [233.08, 277.18, 349.23], // A#m
      ],
      drumPattern: [
        [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false], // kick
        [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // snare on 3rd beat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // clap
        [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false], // hat drill syncopation
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // hat open
        [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false], // 808 slide
        [false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false], // perc
        [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // crash
      ],
    },
  },
};

export function SongStarterModal() {
  const { 
    activeModal, 
    setActiveModal, 
    createNewProject, 
    setBpm, 
    setKey, 
    setCurrentView,
    toggleDrumStep,
    clearDrumMatrix,
    setProjectName
  } = useStudioStore();

  const [selectedGenre, setSelectedGenre] = useState<typeof GENRES[number]>("Trap");
  const [selectedVibe, setSelectedVibe] = useState<typeof VIBES[number]>("Melodic & Emotional");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);

  const previewOscsRef = useRef<OscillatorNode[]>([]);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Fallback template builder
  const currentIdea: SongIdea = (() => {
    const genreMap = SONG_TEMPLATES[selectedGenre] || SONG_TEMPLATES["Trap"];
    const idea = genreMap[selectedVibe] || Object.values(genreMap)[0] || SONG_TEMPLATES["Trap"]["Melodic & Emotional"];
    return {
      ...idea,
      id: `idea-${selectedGenre}-${selectedVibe}`,
    };
  })();

  if (activeModal !== "songstarter") return null;

  const stopPreview = () => {
    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    previewOscsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    previewOscsRef.current = [];
    setIsPlayingPreview(false);
    setCurrentChordIndex(0);
  };

  const playChord = (freqs: number[], ctx: AudioContext) => {
    // Disconnect old
    previewOscsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    previewOscsRef.current = [];

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Soft warm triangle/sine synth for Rhodes piano feel
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.25);
      previewOscsRef.current.push(osc);
    });
  };

  const startPreview = () => {
    stopPreview();
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = audioCtxRef.current || new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    audioCtxRef.current = ctx;

    setIsPlayingPreview(true);
    let chordIdx = 0;

    // Play first chord immediately
    playChord(currentIdea.chordFrequencies[0], ctx);
    setCurrentChordIndex(0);

    const stepMs = (60 / currentIdea.bpm) * 1000 * 2; // 2 beats per chord

    previewTimerRef.current = setInterval(() => {
      chordIdx = (chordIdx + 1) % currentIdea.chordFrequencies.length;
      setCurrentChordIndex(chordIdx);
      playChord(currentIdea.chordFrequencies[chordIdx], ctx);
    }, stepMs);
  };

  const handleLaunchInStudio = () => {
    stopPreview();
    // 1. Create new project with studio mode
    createNewProject("studio");
    setProjectName(`${currentIdea.genre} - ${currentIdea.title}`);
    setBpm(currentIdea.bpm);
    setKey(currentIdea.key);

    // 2. Clear drum matrix and apply the generated pattern
    clearDrumMatrix();
    currentIdea.drumPattern.forEach((row, soundIdx) => {
      row.forEach((active, stepIdx) => {
        if (active) {
          toggleDrumStep(soundIdx, stepIdx);
        }
      });
    });

    // 3. Switch to Studio view and close modal
    setActiveModal(null);
    setCurrentView("studio");
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopPreview();
          setActiveModal(null);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/85 p-3 sm:p-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] select-none animate-in fade-in duration-150"
    >
      <div className="bg-surface-1 border border-surface-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-brand shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
                BANDLAB CREATOR TOOLS
              </span>
              <h2 className="text-sm font-bold text-chalk">
                AI SongStarter
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopPreview();
              setActiveModal(null);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            title="Close SongStarter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-surface-0">
          {/* Genre Selection */}
          <div>
            <span className="text-[10px] font-mono text-steel uppercase tracking-wider block mb-2 font-bold">
              Select Genre
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    if (isPlayingPreview) stopPreview();
                  }}
                  className={`py-1.5 px-2 text-xs font-mono border text-center transition truncate ${
                    selectedGenre === genre
                      ? "bg-brand text-surface-0 border-brand font-bold"
                      : "bg-surface-1 border-surface-border text-slateMuted hover:text-chalk hover:bg-surface-2"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe / Mood Selection */}
          <div>
            <span className="text-[10px] font-mono text-steel uppercase tracking-wider block mb-2 font-bold">
              Select Vibe / Mood
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {VIBES.map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => {
                    setSelectedVibe(vibe);
                    if (isPlayingPreview) stopPreview();
                  }}
                  className={`py-1.5 px-3 text-[11px] font-mono border text-left transition truncate ${
                    selectedVibe === vibe
                      ? "bg-brand/15 text-brand border-brand font-bold"
                      : "bg-surface-1 border-surface-border text-slateMuted hover:text-chalk hover:bg-surface-2"
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Song Idea Card */}
          <div className="p-4 bg-surface-1 border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
                  GENERATED IDEA
                </span>
                <h3 className="text-base font-bold text-chalk">
                  {currentIdea.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-surface-2 border border-surface-border text-chalk">
                  {currentIdea.bpm} BPM
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-surface-2 border border-surface-border text-audio-cyan">
                  {currentIdea.key}
                </span>
              </div>
            </div>

            {/* Chord Progression Boxes */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-steel">
                <span>Chord Progression ({currentIdea.progression})</span>
                <span>Roman Analysis</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {currentIdea.chordNames.map((chord, idx) => {
                  const isActive = isPlayingPreview && currentChordIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`p-3 border text-center transition ${
                        isActive
                          ? "bg-brand border-brand text-surface-0 font-bold"
                          : "bg-surface-0 border-surface-border text-chalk"
                      }`}
                    >
                      <span className="text-base font-bold font-mono block">
                        {chord}
                      </span>
                      <span className="text-[9px] font-mono text-steel mt-0.5 block">
                        Step {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drum Groove Preview Matrix Mini */}
            <div>
              <span className="text-[10px] font-mono text-steel uppercase tracking-wider block mb-1.5">
                Coordinated Drum Groove (808 + Hats + Snare)
              </span>
              <div className="grid grid-cols-16 gap-0.5 bg-surface-0 p-1.5 border border-surface-border">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const hasKick = currentIdea.drumPattern[0][stepIdx];
                  const hasSnare = currentIdea.drumPattern[1][stepIdx];
                  const hasHat = currentIdea.drumPattern[3][stepIdx];
                  return (
                    <div
                      key={stepIdx}
                      className={`h-4 rounded-none ${
                        hasKick
                          ? "bg-audio-rec"
                          : hasSnare
                          ? "bg-audio-amber"
                          : hasHat
                          ? "bg-audio-cyan"
                          : "bg-surface-2"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Play Preview Audio Button */}
            <button
              onClick={() => {
                if (isPlayingPreview) stopPreview();
                else startPreview();
              }}
              className={`w-full py-2 text-xs font-mono font-bold transition flex items-center justify-center gap-2 border ${
                isPlayingPreview
                  ? "bg-surface-2 border-surface-border text-chalk hover:bg-surface-strong"
                  : "bg-surface-2 border-brand text-brand hover:bg-brand/10"
              }`}
            >
              {isPlayingPreview ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Audition</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-brand" />
                  <span>Audition Chords & Harmony</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              stopPreview();
              setActiveModal(null);
            }}
            className="px-4 py-2 bg-surface-2 hover:bg-surface-strong border border-surface-border text-chalk text-xs font-mono transition"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunchInStudio}
            className="flex-1 py-2 bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition flex items-center justify-center gap-2 border border-brand active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open in Studio (Seed DAW)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
