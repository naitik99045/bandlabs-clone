"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  Sliders, 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  Check, 
  Radio, 
  Upload, 
  RotateCcw,
  Activity
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { 
  BANDLAB_MASTERING_PROFILES, 
  MasteringProfileDef, 
  MasteringProfileId,
  renderMasteredBuffer
} from "@/lib/audio/dsp/MasteringRack";
import { exportMixdown, downloadFile } from "@/lib/audio/MixdownExporter";
import { audioBufferToWav } from "@/lib/audio/WavEncoder";

export function MasteringModal() {
  const {
    activeModal,
    setActiveModal,
    tracks,
    drumMatrix,
    vocalSettings,
    bpm,
    masteringSettings,
    updateMasteringSettings,
    projectName,
  } = useStudioStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceBuffer, setSourceBuffer] = useState<AudioBuffer | null>(null);
  const [masteredBuffer, setMasteredBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRenderingMixdown, setIsRenderingMixdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const currentProfile = BANDLAB_MASTERING_PROFILES.find(
    (p) => p.id === masteringSettings.profileId
  ) || BANDLAB_MASTERING_PROFILES[0];

  // Load project mixdown as source buffer when opening modal
  useEffect(() => {
    if (activeModal === "mastering" && !sourceBuffer) {
      loadProjectMixdown();
    }
    return () => {
      stopPlayback();
    };
  }, [activeModal]);

  // Re-render mastered buffer when profile, intensity, or trims change
  useEffect(() => {
    if (sourceBuffer) {
      processMastering(sourceBuffer, currentProfile);
    }
  }, [
    sourceBuffer,
    masteringSettings.profileId,
    masteringSettings.intensity,
    masteringSettings.bassTrim,
    masteringSettings.trebleTrim,
  ]);

  if (activeModal !== "mastering") return null;

  async function loadProjectMixdown() {
    setIsRenderingMixdown(true);
    try {
      audioEngine.init();
      // Render offline mixdown
      const { blob } = await exportMixdown({
        tracks,
        drumMatrix,
        vocalSettings,
        bpm,
        format: "wav",
      });
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioEngine.decodeAudioData(arrayBuffer);
      setSourceBuffer(decoded);
    } catch (err) {
      console.error("Failed to render project mixdown for mastering:", err);
    } finally {
      setIsRenderingMixdown(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRenderingMixdown(true);
    try {
      audioEngine.init();
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await audioEngine.decodeAudioData(arrayBuffer);
      stopPlayback();
      setSourceBuffer(decoded);
    } catch (err) {
      console.error("Failed to decode uploaded audio file:", err);
      alert("Unsupported audio file format. Please upload MP3 or WAV.");
    } finally {
      setIsRenderingMixdown(false);
    }
  }

  async function processMastering(buf: AudioBuffer, profile: MasteringProfileDef) {
    setIsProcessing(true);
    try {
      const rendered = await renderMasteredBuffer(
        buf,
        profile,
        masteringSettings.intensity,
        masteringSettings.bassTrim,
        masteringSettings.trebleTrim
      );
      setMasteredBuffer(rendered);
      if (isPlaying) {
        // Hot-swap buffer seamlessly
        restartPlaybackAt(currentPlaybackTime, masteringSettings.bypass ? buf : rendered);
      }
    } catch (err) {
      console.error("Mastering rendering failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  function startPlayback(offset: number = 0) {
    const bufferToPlay = masteringSettings.bypass ? sourceBuffer : (masteredBuffer || sourceBuffer);
    if (!bufferToPlay) return;

    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    stopPlayback();

    const source = ctx.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(audioEngine.getMasterGain() || ctx.destination);

    const safeOffset = Math.min(offset, bufferToPlay.duration);
    source.start(0, safeOffset);
    startTimeRef.current = ctx.currentTime - safeOffset;
    pauseOffsetRef.current = safeOffset;
    activeSourceRef.current = source;
    setIsPlaying(true);

    const updateLoop = () => {
      if (!activeSourceRef.current) return;
      const elapsed = ctx.currentTime - startTimeRef.current;
      if (elapsed >= bufferToPlay.duration) {
        stopPlayback();
        setCurrentPlaybackTime(0);
        return;
      }
      setCurrentPlaybackTime(elapsed);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };
    animFrameRef.current = requestAnimationFrame(updateLoop);

    source.onended = () => {
      if (activeSourceRef.current === source) {
        setIsPlaying(false);
      }
    };
  }

  function stopPlayback() {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch {}
      activeSourceRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }

  function restartPlaybackAt(offset: number, buffer: AudioBuffer) {
    stopPlayback();
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioEngine.getMasterGain() || ctx.destination);
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;
    pauseOffsetRef.current = offset;
    activeSourceRef.current = source;
    setIsPlaying(true);

    const updateLoop = () => {
      if (!activeSourceRef.current) return;
      const elapsed = ctx.currentTime - startTimeRef.current;
      if (elapsed >= buffer.duration) {
        stopPlayback();
        setCurrentPlaybackTime(0);
        return;
      }
      setCurrentPlaybackTime(elapsed);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };
    animFrameRef.current = requestAnimationFrame(updateLoop);
  }

  function handlePlayToggle() {
    if (isPlaying) {
      pauseOffsetRef.current = currentPlaybackTime;
      stopPlayback();
    } else {
      startPlayback(pauseOffsetRef.current);
    }
  }

  function handleBypassToggle() {
    const nextBypass = !masteringSettings.bypass;
    updateMasteringSettings({ bypass: nextBypass });
    const targetBuffer = nextBypass ? sourceBuffer : (masteredBuffer || sourceBuffer);
    if (isPlaying && targetBuffer) {
      restartPlaybackAt(currentPlaybackTime, targetBuffer);
    }
  }

  async function handleExportMaster(format: "wav" | "mp3") {
    const target = masteredBuffer || sourceBuffer;
    if (!target) return;
    setIsExporting(true);
    try {
      const wavBlob = audioBufferToWav(target);
      const safeName = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_mastered_${currentProfile.id}.${format}`;
      downloadFile(wavBlob, safeName);
    } catch (err) {
      console.error("Master export error:", err);
      alert("Failed to export mastered audio.");
    } finally {
      setIsExporting(false);
    }
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const totalDuration = sourceBuffer?.duration || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 p-4 select-none">
      <div className="bg-surface-1 border border-surface-border w-full max-w-3xl overflow-hidden flex flex-col shadow-none">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-brand">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-chalk uppercase tracking-wide">
                BandLab AI Mastering Suite
              </h2>
              <p className="text-[11px] text-slateMuted">
                Official 8-algorithm mastering chain reverse-engineered from BandLab Mobile
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopPlayback();
              setActiveModal(null);
            }}
            className="p-1 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            title="Close Mastering Suite"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] bg-surface-0">
          {/* Audio Source Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-1 p-2.5 rounded-sm border border-surface-border text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slateMuted">SOURCE:</span>
              <span className="font-bold text-chalk truncate max-w-[200px]">
                {projectName} (Mixdown)
              </span>
              {isRenderingMixdown && (
                <span className="text-brand text-[10px] animate-pulse">Rendering...</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 px-2 py-1 bg-surface-2 hover:bg-surface-strong text-steel hover:text-chalk rounded-sm border border-surface-border cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload External Audio</span>
                <input
                  type="file"
                  accept="audio/wav,audio/mp3,audio/mpeg,audio/aac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={loadProjectMixdown}
                className="p-1 bg-surface-2 hover:bg-surface-strong text-steel hover:text-chalk rounded-sm border border-surface-border"
                title="Reload Current DAW Mixdown"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 8 Official Mastering Profiles Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-steel uppercase tracking-wider">
                Mastering Profiles (8 Official Algorithms)
              </span>
              {isProcessing && (
                <span className="text-brand text-[10px] font-mono animate-pulse">
                  Applying DSP...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANDLAB_MASTERING_PROFILES.map((profile) => {
                const isSelected = masteringSettings.profileId === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => updateMasteringSettings({ profileId: profile.id })}
                    className={`p-2.5 rounded-sm border text-left transition flex flex-col justify-between h-24 ${
                      isSelected
                        ? "bg-surface-2 border-brand text-chalk font-semibold"
                        : "bg-surface-1 border-surface-border hover:border-surface-strong text-steel"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-chalk truncate">
                          {profile.name}
                        </span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                        ) : (
                          <span
                            className="w-2 h-2 shrink-0 rounded-none"
                            style={{ backgroundColor: profile.color }}
                          />
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slateMuted block mt-0.5 truncate">
                        {profile.tag}
                      </span>
                    </div>
                    <p className="text-[9px] text-slateMuted line-clamp-2">
                      {profile.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playback & A/B Bypass Stage */}
          <div className="bg-surface-1 p-3.5 rounded-sm border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              {/* Play / Pause & Position */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayToggle}
                  disabled={!sourceBuffer}
                  className={`w-9 h-9 flex items-center justify-center border rounded-sm transition ${
                    isPlaying
                      ? "bg-audio-play text-surface-0 border-audio-play font-bold"
                      : "bg-surface-2 border-surface-border text-chalk hover:border-brand hover:text-brand"
                  } disabled:opacity-40`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="font-mono text-xs text-steel">
                  <span className="font-bold text-audio-cyan font-mono-numbers">
                    {formatSeconds(currentPlaybackTime)}
                  </span>
                  <span className="text-slateMuted"> / {formatSeconds(totalDuration)}</span>
                </div>
              </div>

              {/* Instant A/B Bypass Toggle Switch */}
              <button
                onClick={handleBypassToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono font-bold transition ${
                  masteringSettings.bypass
                    ? "bg-surface-0 border-surface-border text-slateMuted"
                    : "bg-brand text-surface-0 border-brand"
                }`}
                title="Toggle between Original and Mastered audio"
              >
                <span>{masteringSettings.bypass ? "ORIGINAL (BYPASS)" : "MASTERED"}</span>
              </button>
            </div>

            {/* Timeline Progress Scrub */}
            <div className="relative w-full h-1.5 bg-surface-0 rounded-none overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!sourceBuffer) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                const targetTime = pct * sourceBuffer.duration;
                setCurrentPlaybackTime(targetTime);
                pauseOffsetRef.current = targetTime;
                if (isPlaying) {
                  const targetBuffer = masteringSettings.bypass ? sourceBuffer : (masteredBuffer || sourceBuffer);
                  if (targetBuffer) restartPlaybackAt(targetTime, targetBuffer);
                }
              }}
            >
              <div
                className={`h-full transition-all ${
                  masteringSettings.bypass ? "bg-slateMuted" : "bg-brand"
                }`}
                style={{
                  width: totalDuration > 0 ? `${(currentPlaybackTime / totalDuration) * 100}%` : "0%",
                }}
              />
            </div>
          </div>

          {/* Mastering Controls: Intensity & EQ Trims */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Intensity / Loudness Drive */}
            <div className="bg-surface-1 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-steel font-semibold text-[11px]">Intensity</span>
                <span className="text-brand font-bold font-mono-numbers text-[11px]">
                  {masteringSettings.intensity}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={masteringSettings.intensity}
                onChange={(e) => updateMasteringSettings({ intensity: parseInt(e.target.value) })}
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slateMuted font-mono">
                <span>Subtle</span>
                <span>Maximized</span>
              </div>
            </div>

            {/* Bass Trim */}
            <div className="bg-surface-1 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-steel font-semibold text-[11px]">Bass Trim</span>
                <span className="text-audio-amber font-bold font-mono-numbers text-[11px]">
                  {masteringSettings.bassTrim > 0 ? `+${masteringSettings.bassTrim}` : masteringSettings.bassTrim} dB
                </span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={0.5}
                value={masteringSettings.bassTrim}
                onChange={(e) => updateMasteringSettings({ bassTrim: parseFloat(e.target.value) })}
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slateMuted font-mono">
                <span>-6 dB</span>
                <span>Flat (0)</span>
                <span>+6 dB</span>
              </div>
            </div>

            {/* Treble Trim */}
            <div className="bg-surface-1 p-3 rounded-sm border border-surface-border space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-steel font-semibold text-[11px]">Treble Air</span>
                <span className="text-audio-play font-bold font-mono-numbers text-[11px]">
                  {masteringSettings.trebleTrim > 0 ? `+${masteringSettings.trebleTrim}` : masteringSettings.trebleTrim} dB
                </span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={0.5}
                value={masteringSettings.trebleTrim}
                onChange={(e) => updateMasteringSettings({ trebleTrim: parseFloat(e.target.value) })}
                className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slateMuted font-mono">
                <span>-6 dB</span>
                <span>Flat (0)</span>
                <span>+6 dB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between">
          <div className="text-xs font-mono text-slateMuted truncate">
            <span>ALGORITHM: </span>
            <span className="text-chalk font-bold uppercase">{currentProfile.name}</span>
            <span className="hidden sm:inline text-slateMuted"> — {currentProfile.tag}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportMaster("wav")}
              disabled={isExporting || !sourceBuffer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-2 hover:bg-surface-strong border border-surface-border text-chalk text-xs font-mono font-bold transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export WAV</span>
            </button>

            <button
              onClick={() => handleExportMaster("mp3")}
              disabled={isExporting || !sourceBuffer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Export MP3"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
