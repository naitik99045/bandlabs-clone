"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  Download, 
  Settings, 
  Grid,
  LogIn,
  SlidersHorizontal,
  Circle
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { exportMixdown, downloadFile } from "@/lib/audio/MixdownExporter";
import { micRecorder } from "@/lib/audio/MicRecorder";
import { useAuth } from "@/context/AuthContext";

export function TransportBar() {
  const {
    isPlaying,
    isRecording,
    currentTime,
    bpm,
    key,
    isMetronomeOn,
    tracks,
    drumMatrix,
    vocalSettings,
    setIsPlaying,
    setIsRecording,
    setCurrentTime,
    setBpm,
    setKey,
    toggleMetronome,
    setActiveModal,
    addClipToTrack,
  } = useStudioStore();

  const { user, loginWithGoogle } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [liveMicLevel, setLiveMicLevel] = useState(0);

  const playStartTimeRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;
    let micMeterInterval: NodeJS.Timeout;

    if (isPlaying) {
      audioEngine.init();
      playStartTimeRef.current = performance.now();
      startOffsetRef.current = currentTime;

      const loop = () => {
        const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
        const now = startOffsetRef.current + elapsed;
        setCurrentTime(now);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    if (isRecording) {
      micMeterInterval = setInterval(() => {
        setLiveMicLevel(micRecorder.getLiveLevel());
      }, 50);
    } else {
      setLiveMicLevel(0);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (micMeterInterval) clearInterval(micMeterInterval);
    };
  }, [isPlaying, isRecording]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && isMetronomeOn) {
      const intervalMs = (60 / bpm) * 1000;
      let beat = 0;
      timer = setInterval(() => {
        audioEngine.playMetronomeClick(beat % 4 === 0);
        beat++;
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isMetronomeOn, bpm]);

  const handlePlayToggle = async () => {
    audioEngine.init();
    if (isPlaying) {
      if (isRecording) {
        await stopRecording();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const stopRecording = async () => {
    const armedTrack = tracks.find((t) => t.isArmed) || tracks.find((t) => t.type === "vocal");
    const clip = await micRecorder.stop();
    if (clip && armedTrack) {
      addClipToTrack(armedTrack.id, clip);
    }
    setIsRecording(false);
  };

  const handleRecordToggle = async () => {
    audioEngine.init();
    if (isRecording) {
      await stopRecording();
      setIsPlaying(false);
    } else {
      const started = await micRecorder.start(currentTime);
      if (started) {
        setIsPlaying(true);
        setIsRecording(true);
      } else {
        alert("Microphone permission required to capture vocal takes.");
      }
    }
  };

  const handleStop = async () => {
    if (isRecording) {
      await stopRecording();
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDownloadMusic = async () => {
    try {
      setIsExporting(true);
      setExportProgress(10);
      audioEngine.init();

      const { blob, filename } = await exportMixdown({
        tracks,
        drumMatrix,
        vocalSettings,
        bpm,
        format: "mp3",
        onProgress: (pct) => setExportProgress(pct),
      });

      downloadFile(blob, filename);
    } catch (err) {
      console.error("Export error:", err);
      alert("Mixdown rendering failed. Check console for details.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <header className="h-14 border-b border-surface-border bg-surface-1 px-4 flex items-center justify-between select-none">
      {/* Brand & Studio Architecture Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-sm tracking-tight text-chalk">
          <span className="w-2.5 h-2.5 bg-brand shrink-0" />
          <span className="font-bold">BANDLAB</span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface-2 border border-surface-border text-steel">
            STUDIO PRO
          </span>
        </div>
      </div>

      {/* Center Primary Transport Controls */}
      <div className="flex items-center gap-2.5">
        {/* Playback Button Group */}
        <div className="flex items-center bg-surface-0 border border-surface-border p-0.5">
          <button
            onClick={handleStop}
            className="p-1.5 hover:bg-surface-2 text-steel hover:text-chalk transition"
            title="Stop & Reset (0.0s)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={handlePlayToggle}
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
              isPlaying
                ? "bg-audio-play text-surface-0 font-bold"
                : "hover:bg-surface-2 text-chalk"
            }`}
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <button
            onClick={handleRecordToggle}
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition relative ${
              isRecording
                ? "bg-audio-rec text-white font-bold"
                : "hover:bg-surface-2 text-audio-rec"
            }`}
            title="Record Vocal Take"
          >
            <Circle className={`w-3.5 h-3.5 fill-current ${isRecording ? "animate-pulse" : ""}`} />
            <span>REC</span>
            {isRecording && (
              <span
                style={{ height: `${Math.max(4, liveMicLevel * 18)}px` }}
                className="w-1 bg-audio-cyan ml-0.5"
              />
            )}
          </button>
        </div>

        {/* Monospace Timecode */}
        <div className="bg-surface-0 border border-surface-border px-3 py-1.5 font-mono-numbers text-xs text-audio-cyan tracking-wider">
          {formatTime(currentTime)}
        </div>

        {/* BPM & Clock */}
        <div className="flex items-center gap-1 bg-surface-0 border border-surface-border px-2.5 py-1 text-xs">
          <span className="text-slateMuted font-mono text-[10px]">BPM</span>
          <input
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-11 bg-transparent text-chalk font-mono text-right focus:outline-none"
          />
        </div>

        {/* Musical Key */}
        <div className="flex items-center gap-1 bg-surface-0 border border-surface-border px-2.5 py-1 text-xs">
          <span className="text-slateMuted font-mono text-[10px]">KEY</span>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-transparent text-chalk focus:outline-none cursor-pointer text-xs"
          >
            <option value="C Major" className="bg-surface-1">C Maj</option>
            <option value="A Minor" className="bg-surface-1">A Min</option>
            <option value="G Major" className="bg-surface-1">G Maj</option>
            <option value="E Minor" className="bg-surface-1">E Min</option>
            <option value="F Major" className="bg-surface-1">F Maj</option>
            <option value="D Minor" className="bg-surface-1">D Min</option>
          </select>
        </div>

        {/* Metronome Click Toggle */}
        <button
          onClick={toggleMetronome}
          className={`px-2.5 py-1.5 text-[11px] font-mono border transition ${
            isMetronomeOn
              ? "bg-surface-2 text-audio-cyan border-surface-strong"
              : "bg-surface-0 text-slateMuted border-surface-border hover:text-steel"
          }`}
          title="Toggle Metronome"
        >
          METRO
        </button>
      </div>

      {/* Right Drawer Tools & 10% Accent Primary CTA */}
      <div className="flex items-center gap-2">
        {/* Vocal Suite Trigger */}
        <button
          onClick={() => setActiveModal("vocal")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-0 hover:bg-surface-2 text-chalk border border-surface-border transition"
        >
          <Mic className="w-3.5 h-3.5 text-brand" />
          <span>Vocal Suite</span>
        </button>

        {/* Beat Maker Trigger */}
        <button
          onClick={() => setActiveModal("beatmaker")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-0 hover:bg-surface-2 text-chalk border border-surface-border transition"
        >
          <Grid className="w-3.5 h-3.5 text-audio-amber" />
          <span>Beat Maker</span>
        </button>

        {/* 10% ACCENT: Solid Export CTA */}
        <button
          onClick={handleDownloadMusic}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-brand hover:bg-brand-hover active:bg-brand-active text-white border border-brand transition disabled:opacity-50"
          title="Render and Download Multi-Track Master (MP3 / WAV)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? `Bouncing ${exportProgress}%` : "Export Master"}</span>
        </button>

        {/* User Preferences */}
        <button
          onClick={() => setActiveModal("settings")}
          className="p-1.5 bg-surface-0 hover:bg-surface-2 border border-surface-border text-steel hover:text-chalk transition"
          title="Studio Preferences"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Identity & Session */}
        {user ? (
          <div className="pl-1 text-xs">
            <span className="px-2 py-1 bg-surface-2 border border-surface-border text-steel font-mono text-[11px]">
              {user.displayName || user.email?.split("@")[0] || "PRODUCER"}
            </span>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-0 hover:bg-surface-2 border border-surface-border text-steel text-xs font-medium transition"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
