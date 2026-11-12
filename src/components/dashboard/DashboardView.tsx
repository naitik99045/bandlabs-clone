"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Mic, 
  Music, 
  Grid, 
  Settings, 
  Folder, 
  Play, 
  Trash2, 
  User, 
  Shield, 
  Layers, 
  Upload, 
  Radio, 
  Activity 
} from "lucide-react";
import { useStudioStore, ProjectSummary } from "@/stores/useStudioStore";
import { useAuth } from "@/context/AuthContext";
import { CreateTrackSheet } from "./CreateTrackSheet";
import { UserSettingsModal } from "@/components/settings/UserSettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { MasteringModal } from "@/components/tools/MasteringModal";
import { TunerModal } from "@/components/tools/TunerModal";
import { MetronomeModal } from "@/components/tools/MetronomeModal";
import { SongStarterModal } from "@/components/tools/SongStarterModal";
import { BottomTabBar, NavTabType } from "@/components/navigation/BottomTabBar";
import { FeedTab } from "@/components/navigation/FeedTab";
import { ExploreTab } from "@/components/navigation/ExploreTab";
import { LibraryTab } from "@/components/navigation/LibraryTab";
import { ProfileTab } from "@/components/navigation/ProfileTab";

export function DashboardView() {
  const { 
    savedProjects, 
    loadProject, 
    deleteProject, 
    createNewProject, 
    setIsCreateSheetOpen, 
    setCurrentView,
    setActiveModal,
    setIsAuthModalOpen,
    mobileNavTab,
    setMobileNavTab,
  } = useStudioStore();

  const { user, guestId } = useAuth();

  const starterTemplates = [
    {
      title: "Trap Heat Starter",
      tag: "808 Bass & Hi-Hats",
      bpm: 140,
      key: "A Minor",
      type: "beatmaker" as const,
      color: "oklch(64% 0.16 30)",
    },
    {
      title: "Pop Vocal Melody",
      tag: "AutoPitch Tuning Chain",
      bpm: 120,
      key: "C Major",
      type: "vocal" as const,
      color: "oklch(78% 0.16 168)",
    },
    {
      title: "Drill Bounce Session",
      tag: "Syncopated Snare & Slide",
      bpm: 144,
      key: "E Minor",
      type: "beatmaker" as const,
      color: "oklch(68% 0.10 240)",
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-0 text-chalk overflow-hidden select-none">
      {/* Top Mobile Header */}
      <header className="h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-surface-border bg-surface-1 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-2.5 hover:opacity-85 transition"
          title="Return to Landing Page"
        >
          <span className="w-2.5 h-2.5 bg-brand shrink-0" />
          <span className="font-bold tracking-tight text-sm text-chalk">
            BANDLAB
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-2 border border-surface-border text-steel">
            STUDIO
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* User Profile / Auth Status */}
          {user ? (
            <button
              onClick={() => setActiveModal("settings")}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-surface-border text-xs font-mono text-steel hover:text-chalk transition"
            >
              <User className="w-3.5 h-3.5 text-brand" />
              <span className="max-w-[100px] truncate">{user.displayName || user.email?.split("@")[0] || "PRODUCER"}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setActiveModal("settings")}
            className="p-1.5 hover:bg-surface-2 text-slateMuted hover:text-chalk transition border border-transparent hover:border-surface-border"
            title="Settings & Policies"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-[calc(5rem+env(safe-area-inset-bottom))] space-y-6 max-w-4xl mx-auto w-full">
        {mobileNavTab === "feed" && (
          <div className="space-y-6">
            {/* Hero Create Action Banner */}
            <div className="bg-surface-1 border border-surface-border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
                    PRODUCE MUSIC
                  </span>
                  <span className="text-[10px] font-mono text-audio-play bg-audio-play/15 border border-audio-play/30 px-1.5 py-0.5">
                    100% Free
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-chalk">
                  Create Your Next Track
                </h1>
                <p className="text-xs text-slateMuted max-w-md">
                  Record vocals with AutoPitch, program 808 drum patterns, master audio, and export 320kbps MP3s.
                </p>
              </div>

              <button
                onClick={() => setIsCreateSheetOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-surface-0 font-mono font-bold text-xs transition flex items-center justify-center gap-2 shrink-0 active:scale-95 border border-brand"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Project</span>
              </button>
            </div>

            {/* Quick Launch Tool Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
                  <span>Quick Launch Tools</span>
                </h2>
                <span className="text-[10px] font-mono text-slateMuted">Tap to begin</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Tool 1: Voice / Mic AutoPitch */}
                <button
                  onClick={() => createNewProject("vocal")}
                  className="p-4 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-brand transition text-left space-y-2.5 group active:scale-95"
                >
                  <div className="w-8 h-8 bg-surface-2 border border-surface-border text-brand flex items-center justify-center group-hover:border-brand transition">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chalk block group-hover:text-brand transition">
                      Voice / Mic
                    </span>
                    <span className="text-[10px] text-slateMuted block mt-0.5">
                      AutoPitch DSP
                    </span>
                  </div>
                </button>

                {/* Tool 2: Beat Maker */}
                <button
                  onClick={() => createNewProject("beatmaker")}
                  className="p-4 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-amber transition text-left space-y-2.5 group active:scale-95"
                >
                  <div className="w-8 h-8 bg-surface-2 border border-surface-border text-audio-amber flex items-center justify-center group-hover:border-audio-amber transition">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chalk block group-hover:text-audio-amber transition">
                      Beat Maker
                    </span>
                    <span className="text-[10px] text-slateMuted block mt-0.5">
                      16-Step 808s
                    </span>
                  </div>
                </button>

                {/* Tool 3: AI Mastering */}
                <button
                  onClick={() => setActiveModal("mastering")}
                  className="p-4 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-play transition text-left space-y-2.5 group active:scale-95"
                >
                  <div className="w-8 h-8 bg-surface-2 border border-surface-border text-audio-play flex items-center justify-center group-hover:border-audio-play transition">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chalk block group-hover:text-audio-play transition">
                      AI Mastering
                    </span>
                    <span className="text-[10px] text-slateMuted block mt-0.5">
                      8 Pro Profiles
                    </span>
                  </div>
                </button>

                {/* Tool 4: Import Audio */}
                <button
                  onClick={() => createNewProject("studio")}
                  className="p-4 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-cyan transition text-left space-y-2.5 group active:scale-95"
                >
                  <div className="w-8 h-8 bg-surface-2 border border-surface-border text-audio-cyan flex items-center justify-center group-hover:border-audio-cyan transition">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chalk block group-hover:text-audio-cyan transition">
                      Import Audio
                    </span>
                    <span className="text-[10px] text-slateMuted block mt-0.5">
                      MP3 / WAV
                    </span>
                  </div>
                </button>

                {/* Tool 5: Full Studio Arranger */}
                <button
                  onClick={() => createNewProject("studio")}
                  className="p-4 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-steel transition text-left space-y-2.5 group active:scale-95"
                >
                  <div className="w-8 h-8 bg-surface-2 border border-surface-border text-steel flex items-center justify-center group-hover:border-steel transition">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chalk block group-hover:text-steel transition">
                      Studio Arranger
                    </span>
                    <span className="text-[10px] text-slateMuted block mt-0.5">
                      Multi-Track DAW
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Starter Templates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono font-bold text-steel uppercase tracking-wider">
                  Starter Templates
                </h2>
                <span className="text-[10px] font-mono text-slateMuted">1-click load</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {starterTemplates.map((template, idx) => (
                  <div
                    key={idx}
                    onClick={() => createNewProject(template.type)}
                    className="p-4 bg-surface-1 border border-surface-border hover:border-surface-strong cursor-pointer transition space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-2.5 h-2.5"
                        style={{ backgroundColor: template.color }}
                      />
                      <span className="text-[10px] font-mono text-brand group-hover:underline">
                        Load Preset →
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-chalk group-hover:text-brand transition">
                        {template.title}
                      </h3>
                      <span className="text-[10px] text-slateMuted block mt-0.5">
                        {template.tag}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-steel">
                      <span>{template.bpm} BPM</span>
                      <span>{template.key}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Feed Stream */}
            <FeedTab />
          </div>
        )}

        {mobileNavTab === "explore" && <ExploreTab />}
        {mobileNavTab === "library" && <LibraryTab />}
        {mobileNavTab === "profile" && <ProfileTab />}
      </main>

      {/* Tactile Hardware Mobile Bottom Navigation Bar (5-Tab BandLab NavigationActivity Replica) */}
      <BottomTabBar activeTab={mobileNavTab} onSelectTab={setMobileNavTab} />

      {/* Modals & Creation Sheets */}
      <CreateTrackSheet />
      <UserSettingsModal />
      <AuthModal />
      <MasteringModal />
      <TunerModal />
      <MetronomeModal />
      <SongStarterModal />
    </div>
  );
}
