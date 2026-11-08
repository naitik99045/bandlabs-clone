"use client";

import React, { useRef, useState } from "react";
import { 
  Volume2, 
  Trash2, 
  Upload, 
  Mic, 
  Music 
} from "lucide-react";
import { StudioTrack, useStudioStore } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";

interface TrackLaneProps {
  track: StudioTrack;
}

export function TrackLane({ track }: TrackLaneProps) {
  const {
    selectedTrackId,
    setSelectedTrackId,
    updateTrack,
    removeTrack,
    addClipToTrack,
  } = useStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const isSelected = selectedTrackId === track.id;

  // Handle local audio file import onto this track
  const handleFileUpload = async (file: File) => {
    try {
      audioEngine.init();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);
      const peaks = audioEngine.extractPeaks(audioBuffer, 200);

      addClipToTrack(track.id, {
        id: `clip-${Date.now()}`,
        name: file.name,
        startTime: 0,
        duration: audioBuffer.duration,
        audioBuffer,
        peaks,
      });
    } catch (err) {
      console.error("Failed to decode audio file:", err);
      alert("Could not load audio. Please upload standard MP3 or WAV files.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onClick={() => setSelectedTrackId(track.id)}
      className={`h-24 border-b border-surface-border flex transition select-none ${
        isSelected ? "bg-surface-1" : "bg-surface-0 hover:bg-surface-1/50"
      }`}
    >
      {/* Track Controls Sidebar */}
      <div className="w-64 border-r border-surface-border p-2.5 flex flex-col justify-between shrink-0 bg-surface-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-2 h-2 shrink-0 rounded-none"
              style={{ backgroundColor: track.color }}
            />
            <span className="text-xs font-semibold text-chalk truncate">
              {track.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Record Arm Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTrack(track.id, { isArmed: !track.isArmed });
              }}
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider transition rounded-sm ${
                track.isArmed
                  ? "bg-audio-rec text-white"
                  : "bg-surface-2 border border-surface-border text-slateMuted hover:text-chalk"
              }`}
              title="Arm Track for Live Recording"
            >
              REC
            </button>

            {/* Mute Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTrack(track.id, { isMuted: !track.isMuted });
              }}
              className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold transition rounded-sm ${
                track.isMuted
                  ? "bg-audio-amber text-surface-0"
                  : "bg-surface-2 border border-surface-border text-slateMuted hover:text-chalk"
              }`}
              title="Mute Track"
            >
              M
            </button>

            {/* Solo Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTrack(track.id, { isSoloed: !track.isSoloed });
              }}
              className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold transition rounded-sm ${
                track.isSoloed
                  ? "bg-audio-cyan text-surface-0"
                  : "bg-surface-2 border border-surface-border text-slateMuted hover:text-chalk"
              }`}
              title="Solo Track"
            >
              S
            </button>

            {/* Delete Track */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTrack(track.id);
              }}
              className="p-1 rounded-sm text-slateMuted hover:text-brand transition"
              title="Delete Track"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Volume & Pan Faders */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-1">
            <Volume2 className="w-3 h-3 text-slateMuted shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={track.volume}
              onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
              className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono-numbers text-steel w-8 text-right">
              {Math.round(track.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1 w-16">
            <span className="text-[9px] font-mono text-slateMuted">PAN</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={track.pan}
              onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
              className="w-full h-1 bg-surface-border rounded-none appearance-none cursor-pointer"
            />
            <span className="text-[9px] font-mono-numbers text-slateMuted">
              {track.pan === 0 ? "C" : track.pan > 0 ? `R${Math.round(track.pan * 50)}` : `L${Math.round(Math.abs(track.pan) * 50)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Track Timeline Area (Waveforms & Drag-and-Drop) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`flex-1 relative overflow-hidden transition ${
          isDraggingOver ? "bg-surface-1 border-2 border-dashed border-brand" : ""
        }`}
      >
        {/* Render Clips */}
        {track.clips.length > 0 ? (
          track.clips.map((clip) => (
            <div
              key={clip.id}
              style={{
                left: `${clip.startTime * 20}px`,
                width: `${clip.duration * 20}px`,
                borderColor: track.color,
              }}
              className="absolute top-1 bottom-1 rounded-sm border bg-surface-2/90 overflow-hidden flex flex-col justify-between p-1.5 cursor-move"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-chalk truncate">
                <span className="truncate">{clip.name}</span>
                <span className="text-[10px] font-mono-numbers text-steel">
                  {clip.duration.toFixed(1)}s
                </span>
              </div>

              {/* Render Mini Waveform Bars */}
              {clip.peaks && (
                <div className="h-10 flex items-center gap-[1px]">
                  {clip.peaks.slice(0, 100).map((peak, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: `${Math.max(3, peak * 36)}px`,
                        backgroundColor: track.color,
                      }}
                      className="w-[2px]"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty Lane Dropzone / Action prompt */
          <div className="h-full flex items-center justify-center gap-3 text-slateMuted text-xs">
            <span>Drag MP3 / WAV here or</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-steel hover:text-chalk px-2.5 py-1 rounded-sm bg-surface-1 hover:bg-surface-2 border border-surface-border transition font-mono text-[11px]"
            >
              <Upload className="w-3 h-3" />
              <span>Import Audio File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
