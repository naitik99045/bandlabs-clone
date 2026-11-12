"use client";

import React, { useEffect, useState } from "react";
import { TransportBar } from "./TransportBar";
import { TimelineView } from "./TimelineView";
import { TracksMobileView } from "./TracksMobileView";
import { VocalSuiteModal } from "./VocalSuiteModal";
import { BeatMakerModal } from "./BeatMakerModal";
import { MasteringModal } from "@/components/tools/MasteringModal";
import { TunerModal } from "@/components/tools/TunerModal";
import { MetronomeModal } from "@/components/tools/MetronomeModal";
import { SongStarterModal } from "@/components/tools/SongStarterModal";
import { UserSettingsModal } from "@/components/settings/UserSettingsModal";
import { useStudioStore } from "@/stores/useStudioStore";
import { Shield, Cpu, Activity } from "lucide-react";

function StudioCore() {
  const { isPlaying, setIsPlaying, activeModal, setActiveModal, tracks, mobileActiveTab } = useStudioStore();
  const [masterPeak, setMasterPeak] = useState<number>(0);

  // Global DAW Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === "Escape") {
        if (activeModal) {
          setActiveModal(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, activeModal, setIsPlaying, setActiveModal]);

  // Master audio output meter animation simulation
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const updateMeter = () => {
        setMasterPeak(0.3 + Math.random() * 0.45);
        animId = requestAnimationFrame(updateMeter);
      };
      animId = requestAnimationFrame(updateMeter);
    } else {
      setMasterPeak(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-0 overflow-hidden select-none">
      {/* Top Transport & Action Bar */}
      <TransportBar />

      {/* Center Multitrack Timeline & Mobile Tracks View */}
      <main className="flex-1 overflow-hidden flex flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col ${mobileActiveTab === "tracks" ? "flex" : "hidden"} sm:hidden`}>
            <TracksMobileView />
          </div>
          <div className={`flex-1 flex overflow-hidden ${mobileActiveTab === "timeline" ? "flex" : "hidden sm:flex"}`}>
            <TimelineView />
          </div>
        </div>
      </main>

      {/* Bottom Professional DAW Engine Status Bar (Desktop Only) */}
      <footer className="hidden sm:flex h-6 bg-surface-1 border-t border-surface-border px-3 items-center justify-between text-[10px] font-mono text-slateMuted shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="flex items-center gap-1.5 text-steel truncate">
            <Cpu className="w-3 h-3 text-brand shrink-0" />
            <span className="truncate">44.1kHz / 32-bit</span>
          </div>
          <span className="hidden sm:inline text-surface-border">|</span>
          <div className="hidden sm:flex items-center gap-1">
            <Activity className="w-3 h-3 text-audio-cyan" />
            <span>LATENCY: 5.8ms</span>
          </div>
          <span className="text-surface-border">|</span>
          <span className="text-steel">{tracks.length} TRKS</span>
        </div>

        {/* Master Output VU Indicator (No Gradients) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-slateMuted text-[9px] hidden sm:inline">MASTER</span>
            <div className="w-14 sm:w-20 h-2 bg-surface-0 border border-surface-border overflow-hidden flex">
              <div
                style={{ width: `${Math.round(masterPeak * 100)}%` }}
                className={`h-full transition-all duration-75 ${
                  masterPeak > 0.85 ? "bg-audio-rec" : "bg-audio-play"
                }`}
              />
            </div>
            <span className="text-[9px] font-mono-numbers text-steel w-7 text-right">
              {isPlaying ? `${(-24 + masterPeak * 24).toFixed(1)}dB` : "-∞"}
            </span>
          </div>

          <span className="text-surface-border">|</span>

          {/* Legal Compliance / Policy Trigger */}
          <button
            onClick={() => setActiveModal("settings")}
            className="flex items-center gap-1 text-slateMuted hover:text-chalk transition"
            title="View Legal, Terms of Service & Privacy"
          >
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Terms & Privacy</span>
          </button>
        </div>
      </footer>

      {/* Floating Modal Windows */}
      <VocalSuiteModal />
      <BeatMakerModal />
      <MasteringModal />
      <TunerModal />
      <MetronomeModal />
      <SongStarterModal />
      <UserSettingsModal />
    </div>
  );
}

export function StudioLayout() {
  return <StudioCore />;
}
