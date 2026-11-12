"use client";

import React, { useState } from "react";
import { X, Mic, Activity, Check, Sliders, Sparkles, Volume2 } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { BANDLAB_VOCAL_PRESETS, VocalPresetDef } from "@/lib/audio/presets/vocalPresets";

type PresetCategory = "all" | "lead" | "pitch" | "space" | "clean";

const CATEGORY_MAP: Record<PresetCategory, string[]> = {
  all: [],
  lead: ["classic", "modern-rap", "amped", "hyperpop", "stone"],
  pitch: ["robot", "big-harmony", "chip", "drone", "duet", "gorgon", "third", "ultrashift"],
  space: ["futurescape", "halo", "krafty", "ocean", "simulacrum"],
  clean: ["natural", "phone", "voice-cleaner", "de-reverb", "noise-gate", "bitz"],
};

export function VocalSuiteModal() {
  const {
    activeModal,
    setActiveModal,
    vocalSettings,
    updateVocalSettings,
  } = useStudioStore();

  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>("all");
  const [activePresetId, setActivePresetId] = useState<string>(vocalSettings.activePresetId || "classic");

  if (activeModal !== "vocal") return null;

  const filteredPresets = selectedCategory === "all"
    ? BANDLAB_VOCAL_PRESETS
    : BANDLAB_VOCAL_PRESETS.filter((p) => CATEGORY_MAP[selectedCategory].includes(p.id));

  const handleSelectPreset = (preset: VocalPresetDef) => {
    setActivePresetId(preset.id);
    updateVocalSettings({
      ...preset.settings,
      activePresetId: preset.id,
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveModal(null);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 p-3 sm:p-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] select-none"
    >
      <div className="bg-surface-1 border border-surface-border w-full max-w-3xl overflow-hidden flex flex-col shadow-none max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-brand">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-chalk uppercase tracking-wide">
                BandLab Vocal Suite & 24 AutoPitch Presets
              </h2>
              <p className="text-[11px] text-slateMuted">
                Authentic vocal algorithms extracted from BandLab Mobile v11.35.3
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            title="Close Vocal Suite"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] bg-surface-0">
          {/* Preset Category Switcher */}
          <div className="flex items-center justify-between gap-2 border-b border-surface-border pb-2.5">
            <span className="text-[11px] font-mono font-bold text-steel uppercase tracking-wider shrink-0">
              Profiles ({BANDLAB_VOCAL_PRESETS.length})
            </span>

            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              {(
                [
                  { id: "all", label: "All (24)" },
                  { id: "lead", label: "Lead & Rap" },
                  { id: "pitch", label: "Harmonizer / Pitch" },
                  { id: "space", label: "Modulation & Space" },
                  { id: "clean", label: "Utility & Cleanup" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-sm border transition ${
                    selectedCategory === cat.id
                      ? "bg-brand text-surface-0 font-bold border-brand"
                      : "bg-surface-1 text-slateMuted border-surface-border hover:text-chalk"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 24-Preset Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredPresets.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-sm border text-left transition flex flex-col justify-between h-20 ${
                    isSelected
                      ? "bg-surface-2 border-brand text-chalk font-semibold"
                      : "bg-surface-1 border-surface-border hover:border-surface-strong text-steel"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-chalk truncate">
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                      ) : (
                        <span
                          className="w-2 h-2 shrink-0 rounded-none"
                          style={{ backgroundColor: preset.color }}
                        />
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slateMuted block mt-0.5 truncate">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[9px] text-slateMuted line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* AutoPitch Control Card */}
          <div className="bg-surface-1 p-3.5 rounded-sm border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand" />
                <span className="text-xs font-mono font-bold uppercase text-chalk">
                  AutoPitch Quantization Engine
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={vocalSettings.autoPitchEnabled}
                  onChange={(e) => updateVocalSettings({ autoPitchEnabled: e.target.checked })}
                  className="rounded-none bg-surface-2 border border-surface-border text-brand focus:ring-0"
                />
                <span className="text-steel font-mono text-[11px]">ACTIVE</span>
              </label>
            </div>

            {/* Retune Speed Fader */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-steel text-[11px]">Correction Speed</span>
                <span className="text-audio-cyan font-mono-numbers text-[11px] font-bold">
                  {vocalSettings.correctionSpeed < 30 ? "0ms (Robotic Hard-Tune)" : `${vocalSettings.correctionSpeed}% (Natural)`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={vocalSettings.correctionSpeed}
                onChange={(e) => updateVocalSettings({ correctionSpeed: parseInt(e.target.value) })}
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slateMuted mt-1 font-mono">
                <span>0ms (T-Pain Hard-Tune)</span>
                <span>50% (Pop Tracking)</span>
                <span>100% (Subtle Natural)</span>
              </div>
            </div>

            {/* Scale, Key & Semitone Shift Locking */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-steel font-mono text-[10px] uppercase block mb-1">Scale</label>
                <select
                  value={vocalSettings.scale}
                  onChange={(e) => updateVocalSettings({ scale: e.target.value as "Major" | "Minor" | "Chromatic" | "Pentatonic" })}
                  className="w-full bg-surface-0 border border-surface-border rounded-sm p-1.5 text-xs text-chalk font-mono focus:border-surface-strong focus:outline-none"
                >
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="Chromatic">Chromatic (12-Tone)</option>
                  <option value="Pentatonic">Pentatonic</option>
                </select>
              </div>

              <div>
                <label className="text-steel font-mono text-[10px] uppercase block mb-1">Key</label>
                <select
                  value={vocalSettings.key}
                  onChange={(e) => updateVocalSettings({ key: e.target.value })}
                  className="w-full bg-surface-0 border border-surface-border rounded-sm p-1.5 text-xs text-chalk font-mono focus:border-surface-strong focus:outline-none"
                >
                  {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-steel font-mono text-[10px] uppercase block mb-1">Interval Shift</label>
                <select
                  value={vocalSettings.pitchShiftSemitones || 0}
                  onChange={(e) => updateVocalSettings({ pitchShiftSemitones: parseInt(e.target.value) })}
                  className="w-full bg-surface-0 border border-surface-border rounded-sm p-1.5 text-xs text-chalk font-mono focus:border-surface-strong focus:outline-none"
                >
                  <option value={12}>+12 Semitones (Octave Up)</option>
                  <option value={7}>+7 Semitones (Fifth)</option>
                  <option value={4}>+4 Semitones (Major 3rd)</option>
                  <option value={0}>0 (Standard Lead)</option>
                  <option value={-5}>-5 Semitones (Low Grit)</option>
                  <option value={-12}>-12 Semitones (Sub-Octave)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Extended FX Rack Sliders (6 Audio Processors) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Space Reverb */}
            <div className="bg-surface-1 p-2.5 rounded-sm border border-surface-border space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[10px]">Space Reverb</span>
                <span className="font-mono-numbers text-chalk text-[10px]">
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
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
            </div>

            {/* Tempo Delay */}
            <div className="bg-surface-1 p-2.5 rounded-sm border border-surface-border space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[10px]">Tempo Delay</span>
                <span className="font-mono-numbers text-chalk text-[10px]">
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
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
            </div>

            {/* Vocal Compressor */}
            <div className="bg-surface-1 p-2.5 rounded-sm border border-surface-border space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[10px]">Compressor</span>
                <span className="font-mono-numbers text-brand text-[10px]">
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
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
            </div>

            {/* High EQ Air */}
            <div className="bg-surface-1 p-2.5 rounded-sm border border-surface-border space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[10px]">Presence & Air</span>
                <span className="font-mono-numbers text-audio-play text-[10px]">
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
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation Tube Drive */}
            <div className="bg-surface-1 p-2.5 rounded-sm border border-surface-border space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[10px]">Tube Drive</span>
                <span className="font-mono-numbers text-audio-amber text-[10px]">
                  {vocalSettings.saturationDrive || 15}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={vocalSettings.saturationDrive || 15}
                onChange={(e) => updateVocalSettings({ saturationDrive: parseInt(e.target.value) })}
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
            </div>

            {/* Chorus Shimmer */}
            <div className="bg-surface-1 p-2.5 rounded-sm border border-surface-border space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[10px]">Chorus Shimmer</span>
                <span className="font-mono-numbers text-audio-cyan text-[10px]">
                  {Math.round((vocalSettings.chorusWet || 0.2) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vocalSettings.chorusWet || 0.2}
                onChange={(e) => updateVocalSettings({ chorusWet: parseFloat(e.target.value) })}
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slateMuted">
            <span>ACTIVE PROFILE:</span>
            <span className="font-bold text-brand uppercase">
              {BANDLAB_VOCAL_PRESETS.find((p) => p.id === activePresetId)?.name || "Classic"}
            </span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition"
          >
            Apply Vocal Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
