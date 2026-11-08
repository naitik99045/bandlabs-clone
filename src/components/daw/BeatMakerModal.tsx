"use client";

import React, { useEffect, useState } from "react";
import { X, Play, Pause, Trash2, Volume2, Grid } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
      <div className="bg-surface-1 border border-surface-border rounded-sm w-full max-w-4xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-brand">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-chalk uppercase tracking-wide">
                16-Step Beat Maker & Synthesizer
              </h2>
              <p className="text-[11px] text-slateMuted">
                Synthesize custom 808 sub-bass, punchy snares, and quantized percussion loops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingBeat(!isPlayingBeat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition ${
                isPlayingBeat
                  ? "bg-audio-play text-surface-0"
                  : "bg-surface-2 border border-surface-border text-chalk hover:bg-surface-strong"
              }`}
            >
              {isPlayingBeat ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingBeat ? "Stop Preview" : "Preview Loop"}</span>
            </button>

            <button
              onClick={clearDrumMatrix}
              className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-slateMuted hover:text-brand transition"
              title="Clear 16-Step Pattern"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setIsPlayingBeat(false);
                setActiveModal(null);
              }}
              className="p-1.5 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16-Step Sequencer Grid */}
        <div className="p-5 overflow-x-auto bg-surface-0">
          {/* Step numbers indicator */}
          <div className="flex items-center mb-2 pl-36">
            {Array.from({ length: 16 }).map((_, stepIdx) => (
              <div
                key={stepIdx}
                className={`w-9 text-center font-mono-numbers text-[10px] ${
                  stepIdx % 4 === 0 ? "text-audio-cyan font-bold" : "text-slateMuted"
                } ${isPlayingBeat && currentStep === stepIdx ? "text-brand font-extrabold" : ""}`}
              >
                {stepIdx + 1}
              </div>
            ))}
          </div>

          {/* Drum Rows */}
          <div className="space-y-1.5">
            {DRUM_SOUNDS.map((sound, soundIdx) => (
              <div key={sound.id} className="flex items-center gap-2">
                {/* Drum Trigger Button */}
                <button
                  onClick={() => {
                    audioEngine.init();
                    audioEngine.triggerDrum(sound.id);
                  }}
                  style={{ borderLeftColor: sound.color }}
                  className="w-34 px-2 py-1.5 rounded-sm bg-surface-1 border border-surface-border border-l-4 text-left hover:bg-surface-2 text-xs font-mono text-chalk truncate flex items-center justify-between transition"
                >
                  <span className="truncate">{sound.name}</span>
                  <Volume2 className="w-3 h-3 text-slateMuted shrink-0 ml-1" />
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
                            : undefined,
                        }}
                        className={`w-8 h-8 rounded-sm border transition ${
                          step.active
                            ? "border-transparent"
                            : isQuarter
                            ? "bg-surface-2 border-surface-border hover:border-surface-strong"
                            : "bg-surface-1 border-surface-border hover:border-surface-strong"
                        } ${isCurrentPlaying ? "ring-1 ring-brand" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between text-xs text-slateMuted font-mono">
          <span>16th-note drum pattern will automatically render into your mixdown.</span>
          <button
            onClick={() => {
              setIsPlayingBeat(false);
              setActiveModal(null);
            }}
            className="px-4 py-1.5 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 font-bold transition text-xs"
          >
            Confirm Pattern
          </button>
        </div>
      </div>
    </div>
  );
}
