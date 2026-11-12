"use client";

import React, { useRef, useState, useEffect } from "react";
import { Mic, Music, Plus } from "lucide-react";
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
  const rulerHeaderRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState(256);
  const pxPerSecond = 20;

  useEffect(() => {
    const updateWidth = () => {
      if (rulerHeaderRef.current) {
        setHeaderWidth(rulerHeaderRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle clicking on ruler to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentHeaderWidth = rulerHeaderRef.current?.offsetWidth || headerWidth;
    const clickX = e.clientX - rect.left - currentHeaderWidth;
    if (clickX >= 0) {
      setCurrentTime(clickX / pxPerSecond);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-0 overflow-hidden select-none">
      {/* Time Ruler */}
      <div
        onClick={handleRulerClick}
        className="h-7 border-b border-surface-border bg-surface-1 flex shrink-0 cursor-pointer relative"
      >
        <div
          ref={rulerHeaderRef}
          className="w-28 sm:w-64 border-r border-surface-border px-2 sm:px-3 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-steel uppercase tracking-wider shrink-0 bg-surface-1"
        >
          <span>Tracks ({tracks.length})</span>
          <span className="hidden sm:inline text-[10px] text-slateMuted">1 px = 50ms</span>
        </div>

        {/* Ruler Ticks */}
        <div className="flex-1 relative overflow-hidden flex items-center font-mono-numbers text-[10px] text-slateMuted">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              style={{ left: `${i * 5 * pxPerSecond}px` }}
              className="absolute h-full flex items-center pl-1.5 border-l border-surface-border"
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
        {/* Synchronized Vertical Playhead Line (Solid Brand Color - Strictly No Glows) */}
        <div
          style={{
            left: `${headerWidth + currentTime * pxPerSecond}px`,
          }}
          className="absolute top-0 bottom-0 w-[2px] bg-brand z-30 pointer-events-none"
        >
          <div className="w-2 h-2 -ml-[3px] bg-brand" />
        </div>

        {/* Track Lanes */}
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <TrackLane key={track.id} track={track} />
          ))
        ) : (
          /* Skeleton Loading / Empty Studio State */
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-center border-b border-surface-border">
            <div className="w-12 h-12 rounded-sm bg-surface-1 border border-surface-border flex items-center justify-center text-slateMuted">
              <Plus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-chalk">No Tracks In Session</h3>
              <p className="text-xs text-slateMuted max-w-sm">
                Add your first vocal or beat track below, or record live with your microphone.
              </p>
            </div>
          </div>
        )}

        {/* Add Track Action Bar */}
        <div className="p-4 flex items-center gap-2.5">
          <button
            onClick={() => addTrack("vocal")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium bg-surface-1 hover:bg-surface-2 text-chalk border border-surface-border transition"
          >
            <Mic className="w-3.5 h-3.5 text-brand" />
            <span>+ Add Vocal Track</span>
          </button>

          <button
            onClick={() => addTrack("beat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium bg-surface-1 hover:bg-surface-2 text-chalk border border-surface-border transition"
          >
            <Music className="w-3.5 h-3.5 text-audio-cyan" />
            <span>+ Add Backing Beat Track</span>
          </button>
        </div>
      </div>
    </div>
  );
}
