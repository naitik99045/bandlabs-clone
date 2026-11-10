"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Play, 
  Square, 
  Volume2, 
  Music, 
  RotateCcw,
  Check,
  Plus,
  Minus
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { audioEngine, METRONOME_PRESETS, MetronomeSound } from "@/lib/audio/AudioEngine";

interface TimeSignature {
  beats: number;
  noteValue: number;
  label: string;
}

const TIME_SIGNATURES: TimeSignature[] = [
  { beats: 2, noteValue: 4, label: "2/4" },
  { beats: 3, noteValue: 4, label: "3/4" },
  { beats: 4, noteValue: 4, label: "4/4" },
  { beats: 5, noteValue: 4, label: "5/4" },
  { beats: 6, noteValue: 8, label: "6/8" },
  { beats: 7, noteValue: 8, label: "7/8" },
];

export function MetronomeModal() {
  const { 
    activeModal, 
    setActiveModal, 
    bpm, 
    setBpm, 
    metronomeSound, 
    setMetronomeSound,
    isMetronomeOn,
    toggleMetronome
  } = useStudioStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSig, setTimeSig] = useState<TimeSignature>(TIME_SIGNATURES[2]); // 4/4 default
  const [subdivision, setSubdivision] = useState<1 | 2 | 3 | 4>(1); // 1 = quarter, 2 = 8th, 4 = 16th

  // Tap Tempo state
  const tapTimesRef = useRef<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (activeModal !== "metronome") return null;

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    // Discard taps older than 2.5s
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      taps.length = 0;
    }
    taps.push(now);

    if (taps.length > 4) {
      taps.shift();
    }

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  const startMetronome = () => {
    stopMetronome();
    audioEngine.init();
    setIsPlaying(true);

    const intervalMs = (60 / bpm / subdivision) * 1000;
    let tickCount = 0;

    intervalRef.current = setInterval(() => {
      const beatInBar = Math.floor(tickCount / subdivision) % timeSig.beats;
      const isSubTick = tickCount % subdivision !== 0;
      const isDownbeat = tickCount % (timeSig.beats * subdivision) === 0;

      // Play audio sample
      if (!isSubTick) {
        audioEngine.playMetronomeClick(isDownbeat);
        setCurrentBeat(beatInBar);
      } else {
        audioEngine.playMetronomeClick(false);
      }

      tickCount++;
    }, intervalMs);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  // Restart if running and BPM or subdivision changes
  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bpm, timeSig, subdivision, metronomeSound]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/85 p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="bg-surface-1 border border-surface-border w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-brand shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
                BANDLAB CREATOR TOOLS
              </span>
              <h2 className="text-sm font-bold text-chalk">
                Pro Metronome
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopMetronome();
              setActiveModal(null);
            }}
            className="p-1.5 hover:bg-surface-2 text-slateMuted hover:text-chalk transition border border-transparent hover:border-surface-border"
            title="Close Metronome"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-surface-0">
          {/* Visual Pendulum / Beat Boxes */}
          <div className="p-6 bg-surface-1 border border-surface-border flex flex-col items-center justify-center">
            {/* Visual Beat Indicator Dots/Bars */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: timeSig.beats }).map((_, idx) => {
                const isActive = isPlaying && currentBeat === idx;
                const isDown = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`h-12 w-9 border flex flex-col items-center justify-center transition-colors duration-75 ${
                      isActive
                        ? isDown
                          ? "bg-brand border-brand text-surface-0 font-bold"
                          : "bg-steel border-steel text-surface-0 font-bold"
                        : "bg-surface-0 border-surface-border text-slateMuted"
                    }`}
                  >
                    <span className="text-sm font-mono font-bold">{idx + 1}</span>
                    <span className="text-[8px] font-mono mt-0.5">
                      {isDown ? "DOWN" : "TICK"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Huge Tempo Readout */}
            <div className="text-center space-y-1">
              <span className="text-6xl font-bold font-mono tracking-tight text-chalk">
                {bpm}
              </span>
              <span className="text-xs font-mono text-steel uppercase block tracking-wider font-bold">
                BPM (Beats Per Minute)
              </span>
            </div>

            {/* Tactical Step Adjuster Buttons */}
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setBpm(Math.max(40, bpm - 5))}
                className="px-2.5 py-1.5 bg-surface-2 border border-surface-border hover:bg-surface-strong text-chalk text-xs font-mono transition"
              >
                -5
              </button>
              <button
                onClick={() => setBpm(Math.max(40, bpm - 1))}
                className="p-1.5 bg-surface-2 border border-surface-border hover:bg-surface-strong text-chalk transition"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={handleTapTempo}
                className="px-4 py-1.5 bg-brand/15 border border-brand text-brand hover:bg-brand/25 text-xs font-mono font-bold transition active:scale-95"
              >
                TAP TEMPO
              </button>

              <button
                onClick={() => setBpm(Math.min(240, bpm + 1))}
                className="p-1.5 bg-surface-2 border border-surface-border hover:bg-surface-strong text-chalk transition"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setBpm(Math.min(240, bpm + 5))}
                className="px-2.5 py-1.5 bg-surface-2 border border-surface-border hover:bg-surface-strong text-chalk text-xs font-mono transition"
              >
                +5
              </button>
            </div>

            {/* Slider */}
            <div className="w-full mt-5">
              <input
                type="range"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
            </div>
          </div>

          {/* Time Signatures & Subdivisions */}
          <div className="grid grid-cols-2 gap-3">
            {/* Time Signature */}
            <div>
              <span className="text-[10px] font-mono text-steel uppercase tracking-wider block mb-1.5">
                Time Signature
              </span>
              <div className="grid grid-cols-3 gap-1">
                {TIME_SIGNATURES.map((sig) => (
                  <button
                    key={sig.label}
                    onClick={() => setTimeSig(sig)}
                    className={`py-1 text-xs font-mono border text-center transition ${
                      timeSig.label === sig.label
                        ? "bg-brand text-surface-0 border-brand font-bold"
                        : "bg-surface-1 border-surface-border text-slateMuted hover:text-chalk"
                    }`}
                  >
                    {sig.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subdivisions */}
            <div>
              <span className="text-[10px] font-mono text-steel uppercase tracking-wider block mb-1.5">
                Subdivision
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { sub: 1, label: "1/4" },
                  { sub: 2, label: "1/8" },
                  { sub: 3, label: "1/8T" },
                  { sub: 4, label: "1/16" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setSubdivision(item.sub as 1 | 2 | 3 | 4)}
                    className={`py-1 text-xs font-mono border text-center transition ${
                      subdivision === item.sub
                        ? "bg-brand text-surface-0 border-brand font-bold"
                        : "bg-surface-1 border-surface-border text-slateMuted hover:text-chalk"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Authentic BandLab Metronome Sound Profile */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-steel uppercase tracking-wider">
                Sound Asset (Reverse-Engineered BandLab APK)
              </span>
              <span className="text-[10px] font-mono text-brand font-bold">
                4 Samples
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {METRONOME_PRESETS.map((preset) => {
                const isSelected = metronomeSound === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setMetronomeSound(preset.id);
                      audioEngine.playMetronomeClick(true, 0, preset.id);
                    }}
                    className={`p-2.5 border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-brand/15 border-brand text-brand"
                        : "bg-surface-1 border-surface-border hover:border-surface-strong text-chalk"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold uppercase">{preset.id}</span>
                      {isSelected && <Check className="w-3 h-3 text-brand" />}
                    </div>
                    <span className="text-[10px] text-slateMuted truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Big Start / Stop Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (isPlaying) stopMetronome();
              else startMetronome();
            }}
            className={`flex-1 py-2.5 text-xs font-mono font-bold transition flex items-center justify-center gap-2 border active:scale-95 ${
              isPlaying
                ? "bg-audio-rec border-audio-rec text-surface-0 hover:bg-audio-rec/90"
                : "bg-brand border-brand text-surface-0 hover:bg-brand-hover"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-surface-0" />
                <span>Stop Metronome</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-surface-0" />
                <span>Start Metronome</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              stopMetronome();
              setActiveModal(null);
            }}
            className="px-4 py-2.5 bg-surface-2 hover:bg-surface-strong border border-surface-border text-chalk text-xs font-mono transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
