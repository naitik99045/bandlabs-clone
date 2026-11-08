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
  Flame, 
  Sparkles 
} from "lucide-react";
import { useStudioStore, ProjectSummary } from "@/stores/useStudioStore";
import { useAuth } from "@/context/AuthContext";
import { CreateTrackSheet } from "./CreateTrackSheet";
import { UserSettingsModal } from "@/components/settings/UserSettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";

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
      color: "#ff3b30",
    },
    {
      title: "Pop Vocal Melody",
      tag: "AutoPitch Tuning Chain",
      bpm: 120,
      key: "C Major",
      type: "vocal" as const,
      color: "#00d2ff",
    },
    {
      title: "Drill Bounce Session",
      tag: "Syncopated Snare & Slide",
      bpm: 144,
      key: "E Minor",
      type: "beatmaker" as const,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-0 text-chalk overflow-hidden select-none">
      {/* Top Mobile Header */}
      <header className="h-14 border-b border-surface-border bg-surface-1 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-2.5 hover:opacity-80 transition"
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-2 border border-surface-border text-xs font-mono text-steel hover:text-chalk transition"
            >
              <User className="w-3.5 h-3.5 text-brand" />
              <span className="max-w-[100px] truncate">{user.displayName || user.email?.split("@")[0] || "PRODUCER"}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setActiveModal("settings")}
            className="p-1.5 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            title="Settings & Policies"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-6 max-w-4xl mx-auto w-full">
        {/* Hero Create Action Banner */}
        <div className="bg-surface-1 border border-surface-border rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
                Produce Music
              </span>
              <span className="text-[10px] font-mono text-audio-play bg-audio-play/15 border border-audio-play/30 px-1.5 py-0.2">
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
            className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-surface-0 font-mono font-bold text-xs rounded-sm transition flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Project</span>
          </button>
        </div>

        {/* Quick Tool Launchers (BandLab 4 Essential Tools) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono font-bold text-steel uppercase tracking-wider">
              Quick Launch Tools
            </h2>
            <span className="text-[10px] font-mono text-slateMuted">Tap to begin</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => createNewProject("vocal")}
              className="p-3 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-rec rounded-sm text-left transition flex flex-col justify-between h-24"
            >
              <div className="w-8 h-8 rounded-sm bg-audio-rec/15 border border-audio-rec/30 text-audio-rec flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-chalk block">Voice / Mic</span>
                <span className="text-[10px] font-mono text-slateMuted">AutoPitch DSP</span>
              </div>
            </button>

            <button
              onClick={() => createNewProject("beatmaker")}
              className="p-3 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-amber rounded-sm text-left transition flex flex-col justify-between h-24"
            >
              <div className="w-8 h-8 rounded-sm bg-audio-amber/15 border border-audio-amber/30 text-audio-amber flex items-center justify-center">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-chalk block">Beat Maker</span>
                <span className="text-[10px] font-mono text-slateMuted">16-Step 808s</span>
              </div>
            </button>

            <button
              onClick={() => setIsCreateSheetOpen(true)}
              className="p-3 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-audio-cyan rounded-sm text-left transition flex flex-col justify-between h-24"
            >
              <div className="w-8 h-8 rounded-sm bg-audio-cyan/15 border border-audio-cyan/30 text-audio-cyan flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-chalk block">Import Audio</span>
                <span className="text-[10px] font-mono text-slateMuted">MP3 / WAV</span>
              </div>
            </button>

            <button
              onClick={() => createNewProject("studio")}
              className="p-3 bg-surface-1 hover:bg-surface-2 border border-surface-border hover:border-brand rounded-sm text-left transition flex flex-col justify-between h-24"
            >
              <div className="w-8 h-8 rounded-sm bg-surface-2 border border-surface-border text-brand flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-chalk block">Studio Arranger</span>
                <span className="text-[10px] font-mono text-slateMuted">Multi-Track DAW</span>
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
                className="bg-surface-1 border border-surface-border rounded-sm p-3.5 flex items-center justify-between hover:border-surface-strong transition group"
              >
                <div 
                  onClick={() => loadProject(project.id)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-chalk group-hover:text-brand transition">
                      {project.name}
                    </span>
                    <span className="text-[10px] font-mono text-slateMuted">
                      {project.updatedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slateMuted">
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
                    className="px-3 py-1.5 bg-surface-2 hover:bg-brand text-chalk hover:text-surface-0 text-xs font-mono font-bold rounded-sm border border-surface-border transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 text-slateMuted hover:text-brand rounded-sm transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Starter Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-audio-amber" />
              <span>Starter Templates</span>
            </h2>
            <span className="text-[10px] font-mono text-slateMuted">1-click load</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {starterTemplates.map((template, idx) => (
              <div
                key={idx}
                onClick={() => createNewProject(template.type)}
                className="p-3 bg-surface-1 border border-surface-border hover:border-surface-strong rounded-sm cursor-pointer transition flex flex-col justify-between h-24"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chalk">{template.title}</span>
                    <span
                      className="w-2 h-2 rounded-none"
                      style={{ backgroundColor: template.color }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slateMuted block mt-0.5">
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

      {/* Authentic BandLab Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-1 border-t border-surface-border px-6 flex items-center justify-between z-40 max-w-lg mx-auto sm:max-w-none">
        {/* Home / Feed Tab */}
        <button
          onClick={() => setActiveBottomNav("home")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
            activeBottomNav === "home" ? "text-brand font-bold" : "text-slateMuted hover:text-chalk"
          }`}
        >
          <Flame className="w-4 h-4" />
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

        {/* Centered Floating Brand Red "+" Create Button */}
        <div className="-mt-6 flex flex-col items-center">
          <button
            onClick={() => setIsCreateSheetOpen(true)}
            className="w-12 h-12 rounded-full bg-brand hover:bg-brand-hover text-surface-0 flex items-center justify-center shadow-lg transition active:scale-95"
            title="Create New Track"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
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
    </div>
  );
}
