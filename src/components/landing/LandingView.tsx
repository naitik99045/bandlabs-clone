"use client";

import React from "react";
import { Mic, Grid, Download, Play, ArrowRight, Shield, Sparkles } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { AuthModal } from "@/components/auth/AuthModal";

export function LandingView() {
  const { setCurrentView, setIsAuthModalOpen } = useStudioStore();

  return (
    <div className="min-h-screen w-screen bg-surface-0 text-chalk flex flex-col justify-between overflow-x-hidden select-none">
      {/* Top Navigation */}
      <header className="h-16 border-b border-surface-border px-4 sm:px-8 flex items-center justify-between bg-surface-1">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 bg-brand shrink-0" />
          <span className="font-extrabold tracking-tight text-base sm:text-lg">
            BANDLAB
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-2 border border-surface-border text-steel">
            STUDIO PRO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1.5 rounded-sm bg-surface-2 hover:bg-surface-strong border border-surface-border text-xs font-mono text-chalk transition"
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="px-3.5 py-1.5 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition flex items-center gap-1.5"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-surface-1 border border-surface-border text-[11px] font-mono text-steel">
          <span className="w-2 h-2 rounded-full bg-audio-play animate-pulse" />
          <span>Reverse-Engineered Mobile Web DAW & DSP Workstation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-chalk leading-tight max-w-2xl">
          Where Music Begins. <br className="hidden sm:inline" />
          <span className="text-brand">Free Mobile & Cloud Studio.</span>
        </h1>

        <p className="text-xs sm:text-sm text-steel max-w-xl leading-relaxed">
          Produce complete songs on your phone or browser. Layer live vocals with real-time AutoPitch, craft 808 trap rhythms on the 16-step sequencer, and install 320kbps MP3s straight to your device.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="w-full sm:w-auto px-6 py-3 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Creating (Free)</span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-sm bg-surface-1 hover:bg-surface-2 border border-surface-border text-chalk font-mono text-xs transition"
          >
            Create Free Account / Sign In
          </button>
        </div>

        {/* 3 Core Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-8 text-left">
          {/* Card 1 */}
          <div className="bg-surface-1 border border-surface-border p-4 rounded-sm space-y-2">
            <div className="w-8 h-8 rounded-sm bg-audio-rec/15 border border-audio-rec/30 text-audio-rec flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-chalk">
              AutoPitch Vocal Suite
            </h3>
            <p className="text-[11px] text-slateMuted leading-relaxed">
              Granular Doppler pitch shifter snaps your voice to musical keys. From subtle acoustic polish to robotic 0ms hard-tune.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-1 border border-surface-border p-4 rounded-sm space-y-2">
            <div className="w-8 h-8 rounded-sm bg-audio-amber/15 border border-audio-amber/30 text-audio-amber flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-chalk">
              16-Step Beat Maker
            </h3>
            <p className="text-[11px] text-slateMuted leading-relaxed">
              Program 808 sub-bass, kicks, snares, and hi-hats. Pattern loops audition in real-time and export automatically into your master mixdown.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-1 border border-surface-border p-4 rounded-sm space-y-2">
            <div className="w-8 h-8 rounded-sm bg-audio-cyan/15 border border-audio-cyan/30 text-audio-cyan flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-chalk">
              1-Click Master Mixdown
            </h3>
            <p className="text-[11px] text-slateMuted leading-relaxed">
              Faster-than-realtime multi-track rendering via client-side OfflineAudioContext. Export 320kbps MP3 and 24-bit WAV directly to phone storage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-surface-border px-4 sm:px-8 flex items-center justify-between text-[11px] font-mono text-slateMuted bg-surface-1">
        <span>© BandLab Clone • Studio Pro</span>
        <button
          onClick={() => setCurrentView("dashboard")}
          className="text-steel hover:text-chalk transition flex items-center gap-1"
        >
          <Shield className="w-3 h-3 text-brand" />
          <span>Terms & Privacy</span>
        </button>
      </footer>

      <AuthModal />
    </div>
  );
}
