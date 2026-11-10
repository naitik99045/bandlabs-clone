"use client";

import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  Heart, 
  MessageSquare, 
  GitFork, 
  Share2, 
  Sparkles,
  Music,
  Radio,
  SlidersHorizontal
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";

interface CommunityTrack {
  id: string;
  artist: string;
  handle: string;
  avatarColor: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  likes: number;
  forks: number;
  comments: number;
  duration: string;
  bars: number[]; // pseudo waveform heights
}

const COMMUNITY_FEED: CommunityTrack[] = [
  {
    id: "track-1",
    artist: "Metro Producer",
    handle: "@metro_sound",
    avatarColor: "oklch(64% 0.16 30)",
    title: "Midnight 808 Trap Session",
    genre: "Trap",
    bpm: 140,
    key: "F Minor",
    likes: 342,
    forks: 89,
    comments: 24,
    duration: "2:15",
    bars: [12, 28, 45, 60, 80, 95, 85, 70, 90, 100, 65, 40, 75, 85, 90, 50, 30, 60, 85, 40],
  },
  {
    id: "track-2",
    artist: "Sora Lofi",
    handle: "@soralofi",
    avatarColor: "oklch(74% 0.14 75)",
    title: "Rainy Rhodes & Vinyl Crackle",
    genre: "Lo-Fi",
    bpm: 82,
    key: "Eb Major",
    likes: 512,
    forks: 140,
    comments: 48,
    duration: "1:48",
    bars: [30, 45, 50, 65, 55, 60, 70, 65, 60, 55, 50, 60, 70, 75, 60, 50, 45, 40, 35, 30],
  },
  {
    id: "track-3",
    artist: "Drill Specialist",
    handle: "@londondrill",
    avatarColor: "oklch(68% 0.10 240)",
    title: "Sliding 808s Vol. 4",
    genre: "UK Drill",
    bpm: 142,
    key: "D# Minor",
    likes: 218,
    forks: 43,
    comments: 19,
    duration: "2:30",
    bars: [20, 40, 75, 90, 85, 60, 90, 95, 70, 85, 100, 90, 65, 80, 95, 70, 45, 60, 80, 50],
  },
];

export function FeedTab() {
  const { createNewProject, setBpm, setKey, setCurrentView, setProjectName } = useStudioStore();
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});

  const togglePlay = (id: string) => {
    if (playingTrackId === id) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(id);
    }
  };

  const toggleLike = (id: string) => {
    setLikedTracks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleForkTrack = (track: CommunityTrack) => {
    // Fork track into user's studio
    createNewProject("studio");
    setProjectName(`[Fork] ${track.title}`);
    setBpm(track.bpm);
    setKey(track.key);
    setCurrentView("studio");
  };

  return (
    <div className="space-y-4 pb-8 max-w-2xl mx-auto">
      {/* Feed Filter Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-brand" />
          <span className="text-xs font-mono font-bold text-chalk uppercase tracking-wider">
            Community Stream
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="px-2 py-0.5 bg-brand text-surface-0 font-bold border border-brand">
            Trending
          </span>
          <span className="px-2 py-0.5 bg-surface-1 text-slateMuted hover:text-chalk border border-surface-border transition cursor-pointer">
            New
          </span>
        </div>
      </div>

      {/* Track Cards */}
      <div className="space-y-3">
        {COMMUNITY_FEED.map((track) => {
          const isPlaying = playingTrackId === track.id;
          const isLiked = !!likedTracks[track.id];

          return (
            <div
              key={track.id}
              className="p-4 bg-surface-1 border border-surface-border hover:border-surface-strong transition space-y-3"
            >
              {/* Artist Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-none border border-surface-border flex items-center justify-center font-mono font-bold text-xs text-chalk"
                    style={{ backgroundColor: track.avatarColor }}
                  >
                    {track.artist.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chalk block leading-tight">
                      {track.artist}
                    </span>
                    <span className="text-[10px] font-mono text-slateMuted block">
                      {track.handle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-steel">
                  <span className="px-1.5 py-0.5 bg-surface-2 border border-surface-border">
                    {track.bpm} BPM
                  </span>
                  <span className="px-1.5 py-0.5 bg-surface-2 border border-surface-border text-audio-cyan">
                    {track.key}
                  </span>
                </div>
              </div>

              {/* Title & Waveform Player */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-chalk truncate">
                    {track.title}
                  </h3>
                  <span className="text-[10px] font-mono text-slateMuted">
                    {track.duration}
                  </span>
                </div>

                {/* Simulated Waveform & Play Trigger */}
                <div className="flex items-center gap-3 bg-surface-0 p-2.5 border border-surface-border">
                  <button
                    onClick={() => togglePlay(track.id)}
                    className={`w-9 h-9 border flex items-center justify-center transition shrink-0 active:scale-95 ${
                      isPlaying
                        ? "bg-brand border-brand text-surface-0"
                        : "bg-surface-2 border-surface-border text-chalk hover:bg-surface-strong"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-surface-0" />
                    ) : (
                      <Play className="w-4 h-4 fill-chalk ml-0.5" />
                    )}
                  </button>

                  {/* Waveform Bars */}
                  <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden">
                    {track.bars.map((height, bIdx) => (
                      <div
                        key={bIdx}
                        className={`flex-1 transition-all duration-75 ${
                          isPlaying && bIdx < 10
                            ? "bg-brand"
                            : "bg-surface-border hover:bg-steel"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Like, Comment, Fork in Studio */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-border/50 text-[11px] font-mono">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(track.id)}
                    className={`flex items-center gap-1.5 transition ${
                      isLiked ? "text-audio-rec font-bold" : "text-slateMuted hover:text-chalk"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-audio-rec" : ""}`} />
                    <span>{track.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slateMuted">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{track.comments}</span>
                  </div>
                </div>

                {/* BandLab Fork Feature */}
                <button
                  onClick={() => handleForkTrack(track)}
                  className="px-3 py-1 bg-surface-2 hover:bg-surface-strong border border-surface-border text-brand hover:border-brand transition flex items-center gap-1.5 font-bold"
                  title="Open and remix in BandLab Studio"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Fork into Studio</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
