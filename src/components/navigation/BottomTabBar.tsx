"use client";

import React from "react";
import { 
  Radio, 
  Compass, 
  Plus, 
  Folder, 
  User,
  Layers
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";

export type NavTabType = "feed" | "explore" | "library" | "profile";

interface BottomTabBarProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
}

export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  const { setIsCreateSheetOpen, setCurrentView } = useStudioStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-1 border-t border-surface-border px-4 sm:px-8 flex items-center justify-between z-40 max-w-lg mx-auto sm:max-w-none select-none shadow-xl">
      {/* 1. Feed / Home Tab */}
      <button
        onClick={() => onSelectTab("feed")}
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition py-1 relative ${
          activeTab === "feed" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
        }`}
      >
        <Radio className="w-4 h-4" />
        <span>Feed</span>
        {activeTab === "feed" && (
          <span className="w-3 h-0.5 bg-brand absolute top-0" />
        )}
      </button>

      {/* 2. Explore Tab */}
      <button
        onClick={() => onSelectTab("explore")}
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition py-1 relative ${
          activeTab === "explore" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
        }`}
      >
        <Compass className="w-4 h-4" />
        <span>Explore</span>
        {activeTab === "explore" && (
          <span className="w-3 h-0.5 bg-brand absolute top-0" />
        )}
      </button>

      {/* 3. Centered Elevated Hardware "+" Create Button */}
      <div className="-mt-6 flex flex-col items-center shrink-0 px-2">
        <button
          onClick={() => setIsCreateSheetOpen(true)}
          className="w-12 h-12 bg-brand hover:bg-brand-hover text-surface-0 border-2 border-surface-0 flex items-center justify-center transition active:scale-95 shadow-md"
          title="Create New Project"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
        <span className="text-[9px] font-mono text-chalk mt-0.5 font-bold tracking-wider">
          CREATE
        </span>
      </div>

      {/* 4. Library Tab */}
      <button
        onClick={() => onSelectTab("library")}
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition py-1 relative ${
          activeTab === "library" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
        }`}
      >
        <Folder className="w-4 h-4" />
        <span>Library</span>
        {activeTab === "library" && (
          <span className="w-3 h-0.5 bg-brand absolute top-0" />
        )}
      </button>

      {/* 5. Profile Tab */}
      <button
        onClick={() => onSelectTab("profile")}
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition py-1 relative ${
          activeTab === "profile" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
        }`}
      >
        <User className="w-4 h-4" />
        <span>Profile</span>
        {activeTab === "profile" && (
          <span className="w-3 h-0.5 bg-brand absolute top-0" />
        )}
      </button>
    </nav>
  );
}
