"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Play, 
  Pause, 
  Circle, 
  Square, 
  Mic, 
  Download, 
  Settings, 
  Grid,
  LogIn
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

  // Playhead timer synchronization
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

  // Metronome click loop
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
        alert("Please grant microphone permissions in your browser to record vocals.");
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

  // One-click Download / Install Music handler
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
      alert("Failed to render music mixdown. Please check console.");
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
    <header className="h-14 border-b border-studio-800 bg-studio-900 px-4 flex items-center justify-between select-none">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-black text-xl tracking-wider text-white">
          <span className="h-4 w-4 rounded-full bg-studio-accent animate-pulse" />
          BAND<span className="text-studio-accent">LAB</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-studio-800 text-zinc-400 font-mono">
          STUDIO CLOUD
        </span>
      </div>

      {/* Center DAW Transport Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-studio-950 p-1 rounded-lg border border-studio-800">
          <button
            onClick={handleStop}
            className="p-2 rounded hover:bg-studio-800 text-zinc-400 hover:text-white transition"
            title="Stop & Reset"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayToggle}
            className={`p-2 rounded transition flex items-center justify-center ${
              isPlaying
                ? "bg-studio-green text-zinc-950 hover:bg-emerald-400"
                : "hover:bg-studio-800 text-zinc-200"
            }`}
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleRecordToggle}
            className={`p-2 rounded transition flex items-center justify-center relative ${
              isRecording
                ? "bg-studio-accent text-white animate-pulse"
                : "hover:bg-studio-800 text-studio-accent"
            }`}
            title="Record Vocal from Microphone"
          >
            <Circle className="w-4 h-4 fill-current" />
            {isRecording && (
              <span
                style={{ height: `${Math.max(4, liveMicLevel * 20)}px` }}
                className="absolute -right-1 bottom-0 w-1 bg-studio-cyan rounded-full transition-all"
              />
            )}
          </button>
        </div>

        {/* Time / Bars display */}
        <div className="bg-studio-950 px-3 py-1.5 rounded-lg border border-studio-800 font-mono text-sm tracking-wider text-studio-cyan">
          {formatTime(currentTime)}
        </div>

        {/* BPM Selector */}
        <div className="flex items-center gap-1.5 bg-studio-950 px-2.5 py-1.5 rounded-lg border border-studio-800 text-xs">
          <span className="text-zinc-500 font-bold">BPM</span>
          <input
            type="number"
            min={50}
            max={220}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-12 bg-transparent text-zinc-200 font-mono text-right focus:outline-none"
          />
        </div>

        {/* Key Signature */}
        <div className="bg-studio-950 px-2.5 py-1.5 rounded-lg border border-studio-800 text-xs flex items-center gap-1">
          <span className="text-zinc-500 font-bold">KEY</span>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="C Major" className="bg-studio-900">C Maj</option>
            <option value="A Minor" className="bg-studio-900">A Min</option>
            <option value="G Major" className="bg-studio-900">G Maj</option>
            <option value="E Minor" className="bg-studio-900">E Min</option>
            <option value="F Major" className="bg-studio-900">F Maj</option>
            <option value="D Minor" className="bg-studio-900">D Min</option>
          </select>
        </div>

        {/* Metronome Toggle */}
        <button
          onClick={toggleMetronome}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isMetronomeOn
              ? "bg-studio-800 text-studio-cyan border-studio-600"
              : "bg-studio-950 text-zinc-500 border-studio-800 hover:text-zinc-300"
          }`}
          title="Toggle Metronome"
        >
          CLICK
        </button>
      </div>

      {/* Right Action Tools & Install / Download Music */}
      <div className="flex items-center gap-2.5">
        {/* Vocal Setup / AutoPitch Drawer Button */}
        <button
          onClick={() => setActiveModal("vocal")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-studio-850 hover:bg-studio-800 text-studio-accent border border-studio-800 hover:border-studio-accent/40 transition"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Vocal Setup</span>
        </button>

        {/* Beat Maker Drawer Button */}
        <button
          onClick={() => setActiveModal("beatmaker")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-studio-850 hover:bg-studio-800 text-studio-purple border border-studio-800 hover:border-studio-purple/40 transition"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Beat Maker</span>
        </button>

        {/* PRIMARY ACTION: Download / Install Music */}
        <button
          onClick={handleDownloadMusic}
          disabled={isExporting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-studio-accent hover:bg-studio-accentHover text-white shadow-lg shadow-studio-accent/20 transition disabled:opacity-50"
          title="Render & Download your song with all vocal & beat additions"
        >
          <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
          <span>{isExporting ? `Rendering ${exportProgress}%` : "Download Music"}</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveModal("settings")}
          className="p-1.5 rounded-lg hover:bg-studio-800 text-zinc-400 hover:text-white transition"
          title="User Preferences & Supabase Sync"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Auth / Profile */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-2 border-l border-studio-800 text-xs text-zinc-300">
            <div className="w-6 h-6 rounded-full bg-studio-accent/30 flex items-center justify-center text-[10px] font-bold text-studio-accent">
              {user.displayName?.[0] || user.email?.[0] || "U"}
            </div>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-studio-800 hover:bg-studio-700 text-zinc-300 text-xs font-medium transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
