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
  } = useStudioStore();

  const { user, guestId } = useAuth();
  const [activeBottomNav, setActiveBottomNav] = useState<"home" | "projects" | "settings">("home");

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
      <header className="h-14 border-b border-surface-border bg-surface-1 px-4 flex items-center justify-between shrink-0">
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-6 max-w-4xl mx-auto w-full">
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
              Record vocals with AutoPitch, program 808 drum patterns, import beats, and export 320kbps MP3s.
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

        {/* My Projects Library Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-brand" />
              <span>My Projects ({savedProjects.length})</span>
            </h2>
            <button
              onClick={() => createNewProject("studio")}
              className="text-[11px] font-mono text-brand hover:underline"
            >
              + New Project
            </button>
          </div>

          <div className="space-y-2">
            {savedProjects.map((project) => (
              <div
                key={project.id}
                className="p-3.5 bg-surface-1 border border-surface-border hover:border-surface-strong transition flex items-center justify-between gap-3"
              >
                <div 
                  onClick={() => loadProject(project.id)}
                  className="flex-1 cursor-pointer truncate space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-chalk hover:text-brand transition truncate">
                      {project.name}
                    </span>
                    <span className="text-[9px] font-mono text-slateMuted px-1.5 py-0.2 bg-surface-0 border border-surface-border">
                      {project.updatedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-steel">
                    <span>{project.trackCount} Tracks</span>
                    <span>•</span>
                    <span>{project.bpm} BPM</span>
                    <span>•</span>
                    <span>{project.key}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => loadProject(project.id)}
                    className="px-2.5 py-1 bg-surface-2 hover:bg-surface-strong border border-surface-border text-chalk text-xs font-mono transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-brand" />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 text-slateMuted hover:text-audio-rec transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
      </main>

      {/* Tactile Hardware Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-1 border-t border-surface-border px-6 flex items-center justify-between z-40 max-w-lg mx-auto sm:max-w-none">
        {/* Home / Feed Tab */}
        <button
          onClick={() => setActiveBottomNav("home")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
            activeBottomNav === "home" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Projects Tab */}
        <button
          onClick={() => setActiveBottomNav("projects")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
            activeBottomNav === "projects" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Library</span>
        </button>

        {/* Centered Tactical Hardware "+" Create Button */}
        <div className="-mt-5 flex flex-col items-center">
          <button
            onClick={() => setIsCreateSheetOpen(true)}
            className="w-11 h-11 bg-brand hover:bg-brand-hover text-surface-0 border border-brand flex items-center justify-center transition active:scale-95"
            title="Create New Track"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-mono text-chalk mt-1 font-bold">CREATE</span>
        </div>

        {/* Studio View Shortcut */}
        <button
          onClick={() => setCurrentView("studio")}
          className="flex flex-col items-center gap-1 text-[10px] font-mono text-slateMuted hover:text-chalk transition"
        >
          <Layers className="w-4 h-4" />
          <span>Studio</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveModal("settings")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
            activeBottomNav === "settings" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

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
