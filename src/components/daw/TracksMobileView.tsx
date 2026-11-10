"use client";

import React, { useRef } from "react";
import { Volume2, Mic, Music, Trash2, Upload, Plus, Sliders, Grid, Play, Pause, Star, Layers, Check } from "lucide-react";
import { useStudioStore, StudioTrack, AudioClip } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";

export function TracksMobileView() {
  const { 
    tracks, 
    updateTrack, 
    removeTrack, 
    addTrack, 
    addClipToTrack, 
    removeClip,
    setActiveTake,
    selectedTrackId, 
    setSelectedTrackId,
    setActiveModal,
  } = useStudioStore();

  const [auditioningClipId, setAuditioningClipId] = React.useState<string | null>(null);
  const auditionSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const handleAuditionTake = (clip: AudioClip) => {
    if (auditioningClipId === clip.id) {
      if (auditionSourceRef.current) {
        try {
          auditionSourceRef.current.stop();
          auditionSourceRef.current.disconnect();
        } catch {}
        auditionSourceRef.current = null;
      }
      setAuditioningClipId(null);
      return;
    }

    if (!clip.audioBuffer) return;
    audioEngine.init();
    const ctx = audioEngine.getContext();
    if (auditionSourceRef.current) {
      try {
        auditionSourceRef.current.stop();
        auditionSourceRef.current.disconnect();
      } catch {}
    }

    const source = ctx.createBufferSource();
    source.buffer = clip.audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setAuditioningClipId(null);
      auditionSourceRef.current = null;
    };
    source.start(0);
    auditionSourceRef.current = source;
    setAuditioningClipId(clip.id);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadTrackIdRef = useRef<string | null>(null);

  const handleFileUpload = async (trackId: string, file: File) => {
    try {
      audioEngine.init();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);
      const peaks = audioEngine.extractPeaks(audioBuffer, 100);

      addClipToTrack(trackId, {
        id: `clip-${Date.now()}`,
        name: file.name,
        startTime: 0,
        duration: audioBuffer.duration,
        audioBuffer,
        peaks,
      });
    } catch (err) {
      console.error("Audio upload error:", err);
      alert("Failed to decode audio file. Please use standard MP3 or WAV.");
    }
  };

  const triggerUpload = (trackId: string) => {
    activeUploadTrackIdRef.current = trackId;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-36 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0] && activeUploadTrackIdRef.current) {
            handleFileUpload(activeUploadTrackIdRef.current, e.target.files[0]);
          }
        }}
      />

      {tracks.map((track) => {
        const isSelected = selectedTrackId === track.id;

        return (
          <div
            key={track.id}
            onClick={() => setSelectedTrackId(track.id)}
            className={`bg-surface-1 border rounded-sm p-3.5 space-y-3 transition ${
              isSelected ? "border-brand" : "border-surface-border hover:border-surface-strong"
            }`}
          >
            {/* Track Header & Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-3 h-3 shrink-0 rounded-none"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-xs font-bold text-chalk truncate">
                  {track.name}
                </span>
                <span className="text-[10px] font-mono text-slateMuted uppercase">
                  [{track.type}]
                </span>
              </div>

              {/* Touch Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { isArmed: !track.isArmed });
                  }}
                  className={`px-2 py-1 text-[10px] font-mono font-bold tracking-wider rounded-sm active:scale-95 transition ${
                    track.isArmed
                      ? "bg-audio-rec text-white"
                      : "bg-surface-2 border border-surface-border text-slateMuted"
                  }`}
                >
                  REC
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { isMuted: !track.isMuted });
                  }}
                  className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold rounded-sm active:scale-95 transition ${
                    track.isMuted
                      ? "bg-audio-amber text-surface-0"
                      : "bg-surface-2 border border-surface-border text-slateMuted"
                  }`}
                >
                  M
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { isSoloed: !track.isSoloed });
                  }}
                  className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold rounded-sm active:scale-95 transition ${
                    track.isSoloed
                      ? "bg-audio-cyan text-surface-0"
                      : "bg-surface-2 border border-surface-border text-slateMuted"
                  }`}
                >
                  S
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(track.id);
                  }}
                  className="p-1.5 text-slateMuted hover:text-brand rounded-sm active:scale-95 transition"
                  title="Delete Track"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct Mobile FX Shortcuts (AutoPitch on Vocal, 808 Sequencer on Drums) */}
            <div className="flex items-center gap-2 pt-0.5">
              {track.type === "vocal" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModal("vocal");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-brand/15 border border-brand/30 text-brand text-[10px] font-mono active:scale-95 transition hover:bg-brand/25"
                >
                  <Sliders className="w-3 h-3" />
                  <span>AutoPitch Tuning Chain</span>
                </button>
              )}

              {track.type === "drum" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModal("beatmaker");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-audio-amber/15 border border-audio-amber/30 text-audio-amber text-[10px] font-mono active:scale-95 transition hover:bg-audio-amber/25"
                >
                  <Grid className="w-3 h-3" />
                  <span>16-Step 808 Sequencer</span>
                </button>
              )}
            </div>

            {/* Touch-Friendly Faders */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              {/* Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slateMuted">VOLUME</span>
                  <span className="text-chalk font-mono-numbers">{Math.round(track.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-surface-border appearance-none cursor-pointer rounded-none"
                />
              </div>

              {/* Pan */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slateMuted">PAN</span>
                  <span className="text-chalk font-mono-numbers">
                    {track.pan === 0 ? "CENTER" : track.pan > 0 ? `R${Math.round(track.pan * 50)}` : `L${Math.round(Math.abs(track.pan) * 50)}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={track.pan}
                  onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-surface-border appearance-none cursor-pointer rounded-none"
                />
              </div>
            </div>

            {/* Takes & Waveform Comping System (BandLab About Takes) */}
            {track.clips.length > 0 ? (
              <div className="space-y-2 pt-1">
                {/* Take Selector Strip */}
                {track.clips.length > 1 && (
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-surface-border/50 pb-1.5">
                    <span className="text-steel flex items-center gap-1 font-bold">
                      <Layers className="w-3 h-3 text-brand" />
                      <span>TAKES ({track.clips.length})</span>
                    </span>
                    <span className="text-slateMuted">Tap to comp active take</span>
                  </div>
                )}

                {/* Take Pills */}
                {track.clips.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {track.clips.map((clip, takeIdx) => {
                      const isActive = (track.activeTakeIndex ?? track.clips.length - 1) === takeIdx;
                      return (
                        <button
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTake(track.id, takeIdx);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-mono border transition flex items-center gap-1 whitespace-nowrap ${
                            isActive
                              ? "bg-brand text-surface-0 border-brand font-bold"
                              : "bg-surface-0 text-slateMuted border-surface-border hover:text-chalk"
                          }`}
                        >
                          {isActive && <Star className="w-3 h-3 fill-surface-0" />}
                          <span>Take {takeIdx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active Take Card & Audition */}
                {(() => {
                  const activeIdx = Math.min(
                    track.clips.length - 1,
                    track.activeTakeIndex ?? track.clips.length - 1
                  );
                  const activeClip = track.clips[activeIdx] || track.clips[0];
                  const isAuditioning = auditioningClipId === activeClip.id;

                  return (
                    <div className="p-3 bg-surface-0 border border-surface-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAuditionTake(activeClip);
                            }}
                            className={`p-1.5 border transition ${
                              isAuditioning
                                ? "bg-brand border-brand text-surface-0"
                                : "bg-surface-2 border-surface-border text-brand hover:bg-surface-strong"
                            }`}
                            title={isAuditioning ? "Pause Audition" : "Audition Take"}
                          >
                            {isAuditioning ? (
                              <Pause className="w-3.5 h-3.5 fill-surface-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-brand" />
                            )}
                          </button>

                          <div className="truncate">
                            <span className="text-xs font-bold text-chalk truncate block">
                              {activeClip.name}
                            </span>
                            <span className="text-[10px] font-mono text-steel block">
                              {activeClip.duration.toFixed(1)}s • Master Comp
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeClip(track.id, activeClip.id);
                            }}
                            className="p-1.5 text-slateMuted hover:text-audio-rec transition"
                            title="Delete this take"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mini Waveform Visualization */}
                      {activeClip.peaks && activeClip.peaks.length > 0 && (
                        <div className="h-6 flex items-center gap-0.5 bg-surface-1 p-1 border border-surface-border overflow-hidden">
                          {activeClip.peaks.slice(0, 50).map((peak, pIdx) => (
                            <div
                              key={pIdx}
                              className={`flex-1 transition-all ${
                                isAuditioning ? "bg-brand" : "bg-steel"
                              }`}
                              style={{ height: `${Math.max(15, peak * 100)}%` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-3 bg-surface-0 border border-dashed border-surface-border rounded-sm flex items-center justify-between text-xs text-slateMuted">
                <span>No audio recorded yet</span>
                <button
                  onClick={() => triggerUpload(track.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-2 hover:bg-surface-strong text-chalk rounded-sm font-mono text-[10px] border border-surface-border active:scale-95 transition"
                >
                  <Upload className="w-3 h-3" />
                  <span>Import File</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Track Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={() => addTrack("vocal")}
          className="flex-1 py-2.5 px-3 bg-surface-1 hover:bg-surface-2 border border-surface-border rounded-sm text-xs font-mono font-bold text-chalk active:scale-95 transition flex items-center justify-center gap-1.5"
        >
          <Mic className="w-3.5 h-3.5 text-brand" />
          <span>+ Add Vocal Track</span>
        </button>

        <button
          onClick={() => addTrack("beat")}
          className="flex-1 py-2.5 px-3 bg-surface-1 hover:bg-surface-2 border border-surface-border rounded-sm text-xs font-mono font-bold text-chalk active:scale-95 transition flex items-center justify-center gap-1.5"
        >
          <Music className="w-3.5 h-3.5 text-audio-cyan" />
          <span>+ Add Beat Track</span>
        </button>
      </div>
    </div>
  );
}
