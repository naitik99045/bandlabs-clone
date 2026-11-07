"use client";

import React, { useEffect } from "react";
import { TransportBar } from "./TransportBar";
import { TimelineView } from "./TimelineView";
import { VocalSuiteModal } from "./VocalSuiteModal";
import { BeatMakerModal } from "./BeatMakerModal";
import { UserSettingsModal } from "@/components/settings/UserSettingsModal";
import { AuthProvider } from "@/context/AuthContext";
import { useStudioStore } from "@/stores/useStudioStore";

function StudioCore() {
  const { isPlaying, setIsPlaying, activeModal, setActiveModal } = useStudioStore();

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
  }, [isPlaying, activeModal]);

  return (
    <div className="flex flex-col h-screen w-screen bg-studio-950 overflow-hidden">
      {/* Top Transport & Action Bar */}
      <TransportBar />

      {/* Center Multitrack Timeline & Canvas */}
      <main className="flex-1 overflow-hidden flex">
        <TimelineView />
      </main>

      {/* Floating Modal Windows */}
      <VocalSuiteModal />
      <BeatMakerModal />
      <UserSettingsModal />
    </div>
  );
}

export function StudioLayout() {
  return (
    <AuthProvider>
      <StudioCore />
    </AuthProvider>
  );
}
