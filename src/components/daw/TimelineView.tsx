"use client";

import React, { useRef } from "react";
import { Plus, Mic, Music, Grid } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { TrackLane } from "./TrackLane";

export function TimelineView() {
  const {
    tracks,
    currentTime,
    setCurrentTime,
    addTrack,
  } = useStudioStore();

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const pxPerSecond = 20;

  // Handle clicking on ruler to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 256; // Offset by track control width (w-64 = 256px)
    if (clickX >= 0) {
      setCurrentTime(clickX / pxPerSecond);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-studio-950 overflow-hidden select-none">
      {/* Time Ruler */}
      <div
        onClick={handleRulerClick}
        className="h-7 border-b border-studio-800 bg-studio-900 flex shrink-0 cursor-pointer relative"
      >
        <div className="w-64 border-r border-studio-800 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 bg-studio-900">
          <span>Tracks ({tracks.length})</span>
        </div>

        {/* Ruler Ticks */}
        <div className="flex-1 relative overflow-hidden flex items-center font-mono text-[10px] text-zinc-500">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              style={{ left: `${i * 5 * pxPerSecond}px` }}
              className="absolute h-full flex items-center pl-1 border-l border-studio-800"
            >
              <span>{i * 5}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Track Workspace & Red Playhead Cursor */}
      <div
        ref={timelineContainerRef}
        className="flex-1 overflow-y-auto overflow-x-auto relative"
      >
        {/* Synchronized Vertical Playhead Line */}
        <div
          style={{
            left: `${256 + currentTime * pxPerSecond}px`,
          }}
          className="absolute top-0 bottom-0 w-[2px] bg-studio-accent z-30 pointer-events-none shadow-[0_0_8px_rgba(255,59,48,0.8)]"
        >
          <div className="w-2.5 h-2.5 -ml-1 bg-studio-accent rounded-full" />
        </div>

        {/* Track Lanes */}
        {tracks.map((track) => (
          <TrackLane key={track.id} track={track} />
        ))}

        {/* Add Track Action Bar */}
        <div className="p-4 flex items-center gap-2">
          <button
            onClick={() => addTrack("vocal")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-studio-900 hover:bg-studio-800 text-studio-accent border border-studio-800 transition"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Add Vocal Track</span>
          </button>

          <button
            onClick={() => addTrack("beat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-studio-900 hover:bg-studio-800 text-studio-cyan border border-studio-800 transition"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Add Backing Beat Track</span>
          </button>
        </div>
      </div>
    </div>
  );
}
