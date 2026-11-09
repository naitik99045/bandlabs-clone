"use client";

import React from "react";
import { X, Mic, Sliders, Activity } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 p-4 select-none">
      <div className="bg-surface-1 border border-surface-border w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-brand">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-chalk uppercase tracking-wide">
                BandLab Vocal Suite & AutoPitch
              </h2>
              <p className="text-[11px] text-slateMuted">
                Real-time pitch quantization, Doppler correction, and studio DSP acoustic chain
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            title="Close Vocal Suite"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono font-bold text-steel uppercase tracking-wider">
                Vocal FX Presets
              </label>
              <span className="text-[10px] font-mono text-slateMuted">6 BandLab Profiles</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BANDLAB_VOCAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateVocalSettings(preset.settings)}
                  className="p-2.5 rounded-sm border text-left transition flex flex-col justify-between h-20 bg-surface-0 border-surface-border hover:border-surface-strong"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-chalk truncate">
                        {preset.name}
                      </span>
                      <span
                        className="w-2 h-2 shrink-0 rounded-none"
                        style={{ backgroundColor: preset.color }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slateMuted block mt-0.5">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-steel line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* AutoPitch Control Card */}
          <div className="bg-surface-0 p-4 rounded-sm border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-audio-cyan" />
                <span className="text-xs font-mono font-bold uppercase text-chalk">
                  AutoPitch Quantization
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
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-steel text-[11px]">Correction Speed (Hard-Tune &lt;-&gt; Natural)</span>
                <span className="text-audio-cyan font-mono-numbers text-[11px]">
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
                <span>0ms (T-Pain)</span>
                <span>50% (Pop Tracking)</span>
                <span>100% (Subtle Vibrato)</span>
              </div>
            </div>

            {/* Scale & Key Locking */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-steel font-mono text-[10px] uppercase block mb-1">Pitch Scale</label>
                <select
                  value={vocalSettings.scale}
                  onChange={(e) => updateVocalSettings({ scale: e.target.value as "Major" | "Minor" | "Chromatic" | "Pentatonic" })}
                  className="w-full bg-surface-1 border border-surface-border rounded-sm p-1.5 text-xs text-chalk font-mono focus:border-surface-strong focus:outline-none"
                >
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="Chromatic">Chromatic (12-Tone)</option>
                  <option value="Pentatonic">Pentatonic</option>
                </select>
              </div>

              <div>
                <label className="text-steel font-mono text-[10px] uppercase block mb-1">Root Key</label>
                <select
                  value={vocalSettings.key}
                  onChange={(e) => updateVocalSettings({ key: e.target.value })}
                  className="w-full bg-surface-1 border border-surface-border rounded-sm p-1.5 text-xs text-chalk font-mono focus:border-surface-strong focus:outline-none"
                >
                  {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FX Rack Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Space Reverb */}
            <div className="bg-surface-0 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[11px]">Space Reverb</span>
                <span className="font-mono-numbers text-chalk text-[11px]">
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
            <div className="bg-surface-0 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[11px]">Tempo Echo / Delay</span>
                <span className="font-mono-numbers text-chalk text-[11px]">
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
            <div className="bg-surface-0 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[11px]">Dynamics Compressor</span>
                <span className="font-mono-numbers text-brand text-[11px]">
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
            <div className="bg-surface-0 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-steel text-[11px]">Presence & Air EQ</span>
                <span className="font-mono-numbers text-audio-play text-[11px]">
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
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex justify-end">
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
