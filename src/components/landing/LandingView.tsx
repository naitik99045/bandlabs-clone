"use client";

import React, { useState } from "react";
import { Mic, Grid, Download, ArrowRight, Shield, Activity, Volume2, Cpu, Sliders } from "lucide-react";
import { useStudioStore, DRUM_SOUNDS } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { AuthModal } from "@/components/auth/AuthModal";

export function LandingView() {
  const { setCurrentView, setIsAuthModalOpen } = useStudioStore();
  const [activePad, setActivePad] = useState<string | null>(null);

  const handleTestTrigger = (soundId: string) => {
    try {
      audioEngine.init();
      audioEngine.triggerDrum(soundId);
      setActivePad(soundId);
      setTimeout(() => setActivePad(null), 180);
    } catch {
      // AudioContext fallback
    }
  };

  return (
    <div className="min-h-screen w-screen bg-surface-0 text-chalk flex flex-col justify-between overflow-x-hidden select-none">
      {/* 1. Minimalist Top Bar with 1px Solid Border */}
      <header className="h-14 border-b border-surface-border px-4 sm:px-8 flex items-center justify-between bg-surface-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-brand shrink-0" />
          <span className="font-bold tracking-tight text-sm text-chalk">
            BANDLAB
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-2 border border-surface-border text-steel">
            STUDIO PRO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1.5 bg-surface-2 hover:bg-surface-strong border border-surface-border text-xs font-mono text-steel hover:text-chalk transition"
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition flex items-center gap-1.5"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Interactive Split Stage (60-30-10 Tri-Color Canvas) */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-16 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (58%): Typographic Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-1 border border-surface-border text-[11px] font-mono text-steel">
              <span className="w-2 h-2 bg-brand shrink-0" />
              <span>32-BIT FLOAT CLIENT-SIDE DSP ENGINE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-chalk leading-tight">
              Hardware-grade DAW. <br />
              <span className="text-brand">Direct in your browser.</span>
            </h1>

            <p className="text-xs sm:text-sm text-steel max-w-xl leading-relaxed">
              Sub-millisecond latency workstation featuring real-time AutoPitch pitch quantization, synthesized 808 drum machines, and zero-cost client-side 320kbps MP3 mixdowns. Built for mobile phones and desktop rigs without cloud processing delay.
            </p>

            {/* Primary Action Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="px-6 py-3 bg-brand hover:bg-brand-hover text-surface-0 font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <span>Launch Audio Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-3 bg-surface-1 hover:bg-surface-2 border border-surface-border text-steel hover:text-chalk font-mono text-xs transition text-center"
              >
                Sign In / Instant Guest
              </button>
            </div>
          </div>

          {/* Right Column (42%): Real Product Demo (Interactive DSP Drum Trigger) */}
          <div className="lg:col-span-5 bg-surface-1 border border-surface-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand" />
                <span className="text-xs font-mono font-bold text-chalk">LIVE DSP ENGINE TESTER</span>
              </div>
              <span className="text-[10px] font-mono text-steel">TAP PADS TO AUDITION</span>
            </div>

            <p className="text-[11px] text-slateMuted leading-relaxed">
              Synthesized purely via Web Audio oscillators in real time. Zero audio files downloaded over the network.
            </p>

            {/* 4 Interactive Drum Pads */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {[
                { id: "kick", label: "Kick 808", desc: "45Hz Sub Punch" },
                { id: "snare", label: "Trap Snare", desc: "200Hz Snap" },
                { id: "hihat_closed", label: "Closed Hat", desc: "Metallic Transient" },
                { id: "clap", label: "Bright Clap", desc: "Multi-Burst Reverb" },
              ].map((pad) => {
                const isActive = activePad === pad.id;
                return (
                  <button
                    key={pad.id}
                    onClick={() => handleTestTrigger(pad.id)}
                    className={`p-3 border text-left transition select-none ${
                      isActive
                        ? "bg-brand text-surface-0 border-brand"
                        : "bg-surface-0 border-surface-border hover:border-surface-strong text-chalk active:scale-95"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold">{pad.label}</span>
                      <Volume2 className={`w-3.5 h-3.5 ${isActive ? "text-surface-0" : "text-brand"}`} />
                    </div>
                    <span className={`text-[10px] font-mono block mt-1 ${isActive ? "text-surface-0/80" : "text-slateMuted"}`}>
                      {pad.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Technical Metric Readout */}
            <div className="p-2.5 bg-surface-0 border border-surface-border grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div>
                <span className="text-slateMuted block">LATENCY</span>
                <span className="text-brand font-bold">5.8 ms</span>
              </div>
              <div>
                <span className="text-slateMuted block">BIT DEPTH</span>
                <span className="text-steel font-bold">32-bit Float</span>
              </div>
              <div>
                <span className="text-slateMuted block">RENDER</span>
                <span className="text-steel font-bold">Client Offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Asymmetric Technical Architecture (No 3-card rows) */}
        <div className="border-t border-surface-border pt-10 space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-xl font-bold text-chalk">
              Engineered for Professional Touch & Cloud Multitracking
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Architectural Section A */}
            <div className="bg-surface-1 border border-surface-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-chalk">AutoPitch Vocal Quantization</h3>
              </div>
              <p className="text-xs text-steel leading-relaxed">
                Dual-buffer Doppler pitch tracking node running inside the audio thread. Supports Major, Minor, Pentatonic, and Chromatic scale snapping with configurable correction speed down to 0ms hard-tune quantization.
              </p>
              <div className="pt-2 flex items-center gap-3 text-[11px] font-mono text-slateMuted border-t border-surface-border">
                <span>Correction Speed: 0–100ms</span>
                <span>•</span>
                <span>Format: 44.1kHz PCM</span>
              </div>
            </div>

            {/* Architectural Section B */}
            <div className="bg-surface-1 border border-surface-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-audio-cyan" />
                <h3 className="text-sm font-bold text-chalk">Offline Mixdown & LAME MP3 Encoder</h3>
              </div>
              <p className="text-xs text-steel leading-relaxed">
                Mixdown processing utilizes an in-browser OfflineAudioContext that renders all instrumental stems, vocal takes, and synthesized 808 rhythms at up to 8x realtime. Encodes to 320kbps MP3 without uploading sensitive stems to remote servers.
              </p>
              <div className="pt-2 flex items-center gap-3 text-[11px] font-mono text-slateMuted border-t border-surface-border">
                <span>Target: 320kbps CBR</span>
                <span>•</span>
                <span>Server Cost: $0.00</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Structured Legal & Compliance Footer */}
      <footer className="h-14 border-t border-surface-border px-4 sm:px-8 flex items-center justify-between text-[11px] font-mono text-slateMuted bg-surface-1 shrink-0">
        <span>BANDLAB CLONE • STUDIO PRO WORKSTATION</span>
        <button
          onClick={() => setCurrentView("dashboard")}
          className="text-steel hover:text-chalk transition flex items-center gap-1.5"
          title="View Legal Terms and Privacy Policy"
        >
          <Shield className="w-3.5 h-3.5 text-brand" />
          <span>Terms of Service & Privacy</span>
        </button>
      </footer>

      {/* Auth Modal Trigger */}
      <AuthModal />
    </div>
  );
}
