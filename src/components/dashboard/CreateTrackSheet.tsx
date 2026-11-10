"use client";

import React, { useRef } from "react";
import { X, Mic, Grid, Upload, SlidersHorizontal, Activity } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";

export function CreateTrackSheet() {
  const { isCreateSheetOpen, setIsCreateSheetOpen, createNewProject, addClipToTrack, tracks, setActiveModal } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreateSheetOpen) return null;

  const handleImportFile = async (file: File) => {
    try {
      audioEngine.init();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);
      const peaks = audioEngine.extractPeaks(audioBuffer, 200);

      createNewProject("studio");

      // Give a tiny tick for state to commit, then add clip to backing track
      setTimeout(() => {
        const beatTrack = useStudioStore.getState().tracks.find((t) => t.type === "beat");
        if (beatTrack) {
          addClipToTrack(beatTrack.id, {
            id: `clip-${Date.now()}`,
            name: file.name,
            startTime: 0,
            duration: audioBuffer.duration,
            audioBuffer,
            peaks,
          });
        }
      }, 100);

      setIsCreateSheetOpen(false);
    } catch (err) {
      console.error("Audio import error:", err);
      alert("Failed to decode audio file. Please use MP3 or WAV.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-0/80 p-0 sm:p-4 select-none">
      <div className="bg-surface-1 border-t sm:border border-surface-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div>
            <span className="text-[10px] font-mono text-brand uppercase tracking-widest block font-bold">
              BandLab Creation Suite
            </span>
            <h2 className="text-sm font-bold text-chalk">
              How would you like to start?
            </h2>
          </div>

          <button
            onClick={() => setIsCreateSheetOpen(false)}
            className="p-1.5 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tool Cards */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-surface-0 overflow-y-auto">
          {/* 1. Voice / Mic Card */}
          <button
            onClick={() => createNewProject("vocal")}
            className="p-3.5 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-brand rounded-sm text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-sm bg-audio-rec/15 border border-audio-rec/30 text-audio-rec flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-audio-cyan border border-audio-cyan/30 px-1.5 py-0.5 rounded-none">
                AutoPitch
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-chalk block group-hover:text-brand transition">
                Voice / Audio
              </span>
              <p className="text-[11px] text-slateMuted mt-0.5 leading-snug">
                Record vocals with real-time tuning, presets, and studio effects.
              </p>
            </div>
          </button>

          {/* 2. Beat Maker Card */}
          <button
            onClick={() => createNewProject("beatmaker")}
            className="p-3.5 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-amber rounded-sm text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-sm bg-audio-amber/15 border border-audio-amber/30 text-audio-amber flex items-center justify-center">
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-steel border border-surface-border px-1.5 py-0.5 rounded-none">
                16-Step
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-chalk block group-hover:text-audio-amber transition">
                Beat Maker
              </span>
              <p className="text-[11px] text-slateMuted mt-0.5 leading-snug">
                Produce trap, hip-hop, and drill beats with synthesized 808s and kits.
              </p>
            </div>
          </button>

          {/* 3. Import Audio Card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-cyan rounded-sm text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-sm bg-audio-cyan/15 border border-audio-cyan/30 text-audio-cyan flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-steel border border-surface-border px-1.5 py-0.5 rounded-none">
                MP3 / WAV
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-chalk block group-hover:text-audio-cyan transition">
                Import Audio
              </span>
              <p className="text-[11px] text-slateMuted mt-0.5 leading-snug">
                Load backing beats, instrumental stems, or vocal sample packs.
              </p>
            </div>
          </button>

          {/* 4. Full Studio Arranger Card */}
          <button
            onClick={() => createNewProject("studio")}
            className="p-3.5 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-brand rounded-sm text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-sm bg-surface-2 border border-surface-border text-brand flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-steel border border-surface-border px-1.5 py-0.5 rounded-none">
                Full DAW
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-chalk block group-hover:text-brand transition">
                Studio Arranger
              </span>
              <p className="text-[11px] text-slateMuted mt-0.5 leading-snug">
                Open full multi-track DAW with mixer, timeline, and faders.
              </p>
            </div>
          </button>

          {/* 5. AI Mastering Card */}
          <button
            onClick={() => {
              setIsCreateSheetOpen(false);
              setActiveModal("mastering");
            }}
            className="p-3.5 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-play rounded-sm text-left transition flex flex-col justify-between group col-span-1 sm:col-span-2"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-sm bg-audio-play/15 border border-audio-play/30 text-audio-play flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-audio-play border border-audio-play/30 px-1.5 py-0.5 rounded-none">
                8 BandLab Algorithms
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-chalk block group-hover:text-audio-play transition">
                BandLab AI Mastering
              </span>
              <p className="text-[11px] text-slateMuted mt-0.5 leading-snug">
                Master your tracks with Universal, Clarity, Fire, Tape, Natural, Spatial, Punch, and Cinematic algorithms with real-time A/B bypass.
              </p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImportFile(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-border bg-surface-1 text-center text-[11px] font-mono text-slateMuted">
          BandLab Studio Pro • 100% Client-Side DSP • Zero Cloud Lag
        </div>
      </div>
    </div>
  );
}
