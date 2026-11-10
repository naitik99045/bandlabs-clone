"use client";

import React, { useState } from "react";
import { 
  Search, 
  Disc3, 
  Play, 
  Pause, 
  ArrowRight, 
  SlidersHorizontal,
  Download,
  FolderPlus
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";

interface SoundPack {
  id: string;
  name: string;
  genre: string;
  samplesCount: number;
  bpm: number;
  key: string;
  author: string;
  color: string;
  description: string;
}

const GENRE_PILLS = ["All", "Trap", "UK Drill", "Lo-Fi", "Hip Hop", "R&B", "Pop"] as const;

const SOUND_PACKS: SoundPack[] = [
  {
    id: "pack-1",
    name: "808 Heatwave Mafia",
    genre: "Trap",
    samplesCount: 16,
    bpm: 140,
    key: "F Minor",
    author: "BandLab Sounds",
    color: "oklch(64% 0.16 30)",
    description: "Heavy saturated 808s, sharp syncopated snares, and fast rolls.",
  },
  {
    id: "pack-2",
    name: "Smokey Dusty Rhodes",
    genre: "Lo-Fi",
    samplesCount: 12,
    bpm: 82,
    key: "Eb Major",
    author: "Tape Studio",
    color: "oklch(74% 0.14 75)",
    description: "Authentic vinyl crackle, warm analog piano keys, and soft drums.",
  },
  {
    id: "pack-3",
    name: "London Drill Arsenal",
    genre: "UK Drill",
    samplesCount: 14,
    bpm: 142,
    key: "D# Minor",
    author: "UK Collective",
    color: "oklch(68% 0.10 240)",
    description: "Sliding portamento sub-bass, 3rd beat snares, and rim variations.",
  },
  {
    id: "pack-4",
    name: "AutoPitch Vocal Chops",
    genre: "Pop",
    samplesCount: 20,
    bpm: 124,
    key: "C Major",
    author: "Studio Pro",
    color: "oklch(78% 0.16 168)",
    description: "Tuned vocal phrases, ad-libs, and harmonized hooks ready for drops.",
  },
];

export function ExploreTab() {
  const { createNewProject, setBpm, setKey, setCurrentView, setProjectName } = useStudioStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [playingPackId, setPlayingPackId] = useState<string | null>(null);

  const filteredPacks = SOUND_PACKS.filter((p) => {
    const matchesGenre = selectedGenre === "All" || p.genre === selectedGenre;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleLoadPack = (pack: SoundPack) => {
    createNewProject("studio");
    setProjectName(`${pack.name} Session`);
    setBpm(pack.bpm);
    setKey(pack.key);
    setCurrentView("studio");
  };

  return (
    <div className="space-y-4 pb-8 max-w-2xl mx-auto">
      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 text-slateMuted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sounds, loops, artists, and packs..."
          className="w-full bg-surface-1 border border-surface-border text-chalk text-xs font-mono pl-9 pr-3 py-2.5 outline-none focus:border-brand transition placeholder:text-slateMuted"
        />
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {GENRE_PILLS.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1 text-xs font-mono border whitespace-nowrap transition ${
              selectedGenre === genre
                ? "bg-brand text-surface-0 border-brand font-bold"
                : "bg-surface-1 text-slateMuted border-surface-border hover:text-chalk hover:bg-surface-2"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Sound Packs List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-steel uppercase tracking-wider font-bold">
            Royalty-Free Sound Packs ({filteredPacks.length})
          </span>
          <span className="text-[10px] font-mono text-brand">100% Free</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredPacks.map((pack) => {
            const isPlaying = playingPackId === pack.id;
            return (
              <div
                key={pack.id}
                className="p-4 bg-surface-1 border border-surface-border hover:border-surface-strong transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-2.5 h-2.5"
                      style={{ backgroundColor: pack.color }}
                    />
                    <span className="text-[10px] font-mono text-steel px-1.5 py-0.5 bg-surface-0 border border-surface-border">
                      {pack.samplesCount} Samples
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-chalk group-hover:text-brand transition">
                    {pack.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slateMuted block mt-0.5">
                    by {pack.author} • {pack.genre}
                  </span>

                  <p className="text-[11px] text-slateMuted mt-2 leading-snug">
                    {pack.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-surface-border/50">
                  <div className="flex items-center justify-between text-[10px] font-mono text-steel">
                    <span>{pack.bpm} BPM</span>
                    <span>{pack.key}</span>
                  </div>

                  <button
                    onClick={() => handleLoadPack(pack)}
                    className="w-full py-1.5 bg-surface-2 hover:bg-brand hover:text-surface-0 border border-surface-border hover:border-brand text-chalk text-xs font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Load Pack to Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
