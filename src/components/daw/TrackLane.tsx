"use client";

import React, { useRef, useState } from "react";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  Trash2, 
  Upload, 
  Plus,
  Music,
  Radio
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
    isRecording,
    currentTime,
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
      className={`h-24 border-b border-studio-800 flex transition ${
        isSelected ? "bg-studio-900/90" : "bg-studio-950/60 hover:bg-studio-900/40"
      }`}
    >
      {/* Track Controls Sidebar */}
      <div className="w-64 border-r border-studio-800 p-2.5 flex flex-col justify-between shrink-0 bg-studio-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: track.color }}
            />
            <span className="text-xs font-bold text-zinc-200 truncate">
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
              className={`p-1 rounded text-[10px] font-bold transition ${
                track.isArmed
                  ? "bg-studio-accent text-white"
                  : "bg-studio-800 text-zinc-500 hover:text-zinc-300"
              }`}
              title="Arm Track for Recording"
            >
              REC
            </button>

            {/* Mute Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTrack(track.id, { isMuted: !track.isMuted });
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                track.isMuted
                  ? "bg-amber-600 text-white"
                  : "bg-studio-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              M
            </button>

            {/* Solo Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTrack(track.id, { isSoloed: !track.isSoloed });
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                track.isSoloed
                  ? "bg-studio-cyan text-zinc-950"
                  : "bg-studio-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              S
            </button>

            {/* Delete Track */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTrack(track.id);
              }}
              className="p-1 rounded text-zinc-600 hover:text-red-400 transition"
              title="Delete Track"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Volume & Pan Faders */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-1">
            <Volume2 className="w-3 h-3 text-zinc-500 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={track.volume}
              onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
              className="w-full h-1 bg-studio-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-zinc-400 w-7 text-right">
              {Math.round(track.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1 w-16">
            <span className="text-[9px] font-mono text-zinc-500">PAN</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={track.pan}
              onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
              className="w-full h-1 bg-studio-800 rounded-lg appearance-none cursor-pointer"
            />
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
          isDraggingOver ? "bg-studio-accent/10 border-2 border-dashed border-studio-accent" : ""
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
                backgroundColor: `${track.color}20`,
                borderColor: track.color,
              }}
              className="absolute top-1 bottom-1 rounded border overflow-hidden flex flex-col justify-between p-1.5 cursor-move shadow-md"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 truncate">
                <span className="truncate">{clip.name}</span>
                <span className="text-[10px] font-mono opacity-60">
                  {Math.round(clip.duration)}s
                </span>
              </div>

              {/* Render Mini Waveform Bars */}
              {clip.peaks && (
                <div className="h-10 flex items-center gap-[1px] opacity-75">
                  {clip.peaks.slice(0, 80).map((peak, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: `${Math.max(4, peak * 36)}px`,
                        backgroundColor: track.color,
                      }}
                      className="w-[2px] rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty Lane Dropzone / Action prompt */
          <div className="h-full flex items-center justify-center gap-3 text-zinc-600 text-xs">
            <span>Drop MP3/WAV here or</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-zinc-400 hover:text-white px-2 py-1 rounded bg-studio-850 hover:bg-studio-800 border border-studio-800 transition"
            >
              <Upload className="w-3 h-3" />
              <span>Import Audio</span>
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
