"use client";

import React from "react";
import { X, Mic, Sparkles, Sliders, Check } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { BANDLAB_VOCAL_PRESETS } from "@/lib/audio/presets/vocalPresets";

export function VocalSuiteModal() {
  const {
    activeModal,
    setActiveModal,
    vocalSettings,
    updateVocalSettings,
  } = useStudioStore();

  if (activeModal !== "vocal") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-studio-900 border border-studio-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-studio-800 flex items-center justify-between bg-studio-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-studio-accent/20 text-studio-accent">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                BandLab Vocal Suite & AutoPitch
              </h2>
              <p className="text-xs text-zinc-400">
                Setup your vocal chain, pitch correction speed, and acoustic effects
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg hover:bg-studio-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Preset Selector Carousel */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
              Vocal FX Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {BANDLAB_VOCAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateVocalSettings(preset.settings)}
                  className="p-3 rounded-lg border text-left transition flex flex-col justify-between h-24 hover:border-zinc-500 bg-studio-950/80 border-studio-800"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {preset.name}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: preset.color }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* AutoPitch Control Card */}
          <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-studio-cyan" />
                <span className="text-sm font-bold text-white">AutoPitch Tuning</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={vocalSettings.autoPitchEnabled}
                  onChange={(e) => updateVocalSettings({ autoPitchEnabled: e.target.checked })}
                  className="rounded bg-studio-800 text-studio-accent focus:ring-0"
                />
                <span className="text-zinc-300 font-medium">Enable</span>
              </label>
            </div>

            {/* Retune Speed Knob */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Correction Speed (Hard-Tune &lt;-&gt; Natural)</span>
                <span className="font-mono text-studio-cyan">
                  {vocalSettings.correctionSpeed < 30 ? "Robotic (0ms)" : `${vocalSettings.correctionSpeed}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={vocalSettings.correctionSpeed}
                onChange={(e) => updateVocalSettings({ correctionSpeed: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>0ms (T-Pain / Travis)</span>
                <span>50% (Pop)</span>
                <span>100% (Subtle)</span>
              </div>
            </div>

            {/* Scale & Key Locking */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Pitch Scale</label>
                <select
                  value={vocalSettings.scale}
                  onChange={(e) => updateVocalSettings({ scale: e.target.value as "Major" | "Minor" | "Chromatic" | "Pentatonic" })}
                  className="w-full bg-studio-900 border border-studio-800 rounded p-2 text-zinc-200"
                >
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="Chromatic">Chromatic</option>
                  <option value="Pentatonic">Pentatonic</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Root Key</label>
                <select
                  value={vocalSettings.key}
                  onChange={(e) => updateVocalSettings({ key: e.target.value })}
                  className="w-full bg-studio-900 border border-studio-800 rounded p-2 text-zinc-200"
                >
                  {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FX Rack Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Space Reverb */}
            <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-zinc-300">Space Reverb</span>
                <span className="font-mono text-studio-purple">
                  {Math.round(vocalSettings.reverbWet * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vocalSettings.reverbWet}
                onChange={(e) => updateVocalSettings({ reverbWet: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tempo Delay */}
            <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-zinc-300">Tempo Echo / Delay</span>
                <span className="font-mono text-studio-cyan">
                  {Math.round(vocalSettings.delayWet * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vocalSettings.delayWet}
                onChange={(e) => updateVocalSettings({ delayWet: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Vocal Compressor */}
            <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-zinc-300">Vocal Compressor</span>
                <span className="font-mono text-studio-accent">
                  {vocalSettings.compressionRatio}:1
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={0.5}
                value={vocalSettings.compressionRatio}
                onChange={(e) => updateVocalSettings({ compressionRatio: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* High EQ Air */}
            <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-zinc-300">Presence & Air EQ</span>
                <span className="font-mono text-studio-green">
                  +{vocalSettings.eqHighBoost} dB
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={0.5}
                value={vocalSettings.eqHighBoost}
                onChange={(e) => updateVocalSettings({ eqHighBoost: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-studio-800 bg-studio-950 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-5 py-2 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white text-xs font-bold transition shadow-lg shadow-studio-accent/20"
          >
            Apply Vocal Settings
          </button>
        </div>
      </div>
    </div>
  );
}
