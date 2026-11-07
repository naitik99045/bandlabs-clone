"use client";

import React, { useEffect, useState } from "react";
import { X, Play, Pause, Trash2, Volume2, Sparkles, Grid } from "lucide-react";
import { useStudioStore, DRUM_SOUNDS } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";

export function BeatMakerModal() {
  const {
    activeModal,
    setActiveModal,
    drumMatrix,
    toggleDrumStep,
    clearDrumMatrix,
    bpm,
  } = useStudioStore();

  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Play preview loop inside Beat Maker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingBeat) {
      audioEngine.init();
      const intervalMs = ((60 / bpm) / 4) * 1000;
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % 16;
          // Trigger active sounds for this step
          for (let sIdx = 0; sIdx < 8; sIdx++) {
            if (drumMatrix[sIdx][next]?.active) {
              audioEngine.triggerDrum(DRUM_SOUNDS[sIdx].id, 0, drumMatrix[sIdx][next].velocity);
            }
          }
          return next;
        });
      }, intervalMs);
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(timer);
  }, [isPlayingBeat, bpm, drumMatrix]);

  if (activeModal !== "beatmaker") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-studio-900 border border-studio-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-studio-800 flex items-center justify-between bg-studio-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-studio-purple/20 text-studio-purple">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                16-Step Beat Maker & Drum Machine
              </h2>
              <p className="text-xs text-zinc-400">
                Craft custom 808s, kicks, snares, and hi-hat rhythms for your track
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingBeat(!isPlayingBeat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isPlayingBeat
                  ? "bg-studio-green text-zinc-950"
                  : "bg-studio-800 text-zinc-200 hover:bg-studio-700"
              }`}
            >
              {isPlayingBeat ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingBeat ? "Pause Loop" : "Preview Loop"}</span>
            </button>

            <button
              onClick={clearDrumMatrix}
              className="p-1.5 rounded-lg hover:bg-studio-800 text-zinc-400 hover:text-red-400 transition"
              title="Clear Grid"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlayingBeat(false);
                setActiveModal(null);
              }}
              className="p-1.5 rounded-lg hover:bg-studio-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 16-Step Sequencer Grid */}
        <div className="p-6 overflow-x-auto">
          {/* Step numbers indicator */}
          <div className="flex items-center mb-2 pl-36">
            {Array.from({ length: 16 }).map((_, stepIdx) => (
              <div
                key={stepIdx}
                className={`w-10 text-center font-mono text-[10px] ${
                  stepIdx % 4 === 0 ? "text-studio-cyan font-bold" : "text-zinc-600"
                } ${isPlayingBeat && currentStep === stepIdx ? "text-studio-accent font-extrabold" : ""}`}
              >
                {stepIdx + 1}
              </div>
            ))}
          </div>

          {/* Drum Rows */}
          <div className="space-y-2">
            {DRUM_SOUNDS.map((sound, soundIdx) => (
              <div key={sound.id} className="flex items-center gap-2">
                {/* Drum Trigger Button */}
                <button
                  onClick={() => {
                    audioEngine.init();
                    audioEngine.triggerDrum(sound.id);
                  }}
                  style={{ borderLeftColor: sound.color }}
                  className="w-32 px-2.5 py-2 rounded bg-studio-950 border border-studio-800 border-l-4 text-left hover:bg-studio-800 text-xs font-semibold text-zinc-200 truncate flex items-center justify-between transition"
                >
                  <span className="truncate">{sound.name}</span>
                  <Volume2 className="w-3 h-3 text-zinc-500" />
                </button>

                {/* 16 Step Buttons */}
                <div className="flex items-center gap-1">
                  {drumMatrix[soundIdx].map((step, stepIdx) => {
                    const isQuarter = stepIdx % 4 === 0;
                    const isCurrentPlaying = isPlayingBeat && currentStep === stepIdx;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => toggleDrumStep(soundIdx, stepIdx)}
                        style={{
                          backgroundColor: step.active
                            ? sound.color
                            : isCurrentPlaying
                            ? "#2e2e3d"
                            : isQuarter
                            ? "#181820"
                            : "#121217",
                        }}
                        className={`w-9 h-9 rounded border transition ${
                          step.active
                            ? "border-transparent shadow-md"
                            : "border-studio-800 hover:border-zinc-600"
                        } ${isCurrentPlaying ? "ring-2 ring-studio-cyan/60" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-studio-800 bg-studio-950 flex items-center justify-between text-xs text-zinc-400">
          <span>This drum pattern is automatically merged when you click <b>Download Music</b>.</span>
          <button
            onClick={() => {
              setIsPlayingBeat(false);
              setActiveModal(null);
            }}
            className="px-5 py-2 rounded-lg bg-studio-purple hover:bg-purple-600 text-white font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
