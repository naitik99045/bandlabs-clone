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
  ChevronLeft,
  Circle,
  Sliders,
  AlignLeft,
  Check,
  RotateCcw
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
    projectName,
    setProjectName,
    currentView,
    setCurrentView,
    mobileActiveTab,
    setMobileActiveTab,
    setIsPlaying,
    setIsRecording,
    setCurrentTime,
    setBpm,
    setKey,
    toggleMetronome,
    setActiveModal,
    addClipToTrack,
  } = useStudioStore();

  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [liveMicLevel, setLiveMicLevel] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);

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

  const saveProjectName = () => {
    if (tempName.trim()) {
      setProjectName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <>
      {/* 📱 100% Android Native Mobile Top App Bar (< sm) */}
      <header className="sm:hidden border-b border-surface-border bg-surface-1 px-3 py-2.5 flex items-center justify-between select-none shrink-0 z-30">
        {/* Left: Return & Project Title */}
        <div className="flex items-center gap-2 truncate">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center justify-center p-1.5 rounded-sm bg-surface-2 border border-surface-border text-steel hover:text-chalk active:scale-95 transition"
            title="Return to Projects Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={saveProjectName}
                onKeyDown={(e) => e.key === "Enter" && saveProjectName()}
                autoFocus
                className="bg-surface-0 border border-brand rounded-sm px-2 py-0.5 text-xs font-bold text-chalk font-mono focus:outline-none"
              />
              <button onClick={saveProjectName} className="text-brand p-1">
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span
              onClick={() => {
                setTempName(projectName);
                setIsEditingName(true);
              }}
              className="text-xs font-bold text-chalk truncate max-w-[130px] cursor-pointer active:underline"
              title="Click to rename project"
            >
              {projectName}
            </span>
          )}
        </div>

        {/* Right: Essential Direct Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveModal("vocal")}
            className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-brand active:scale-95 transition"
            title="AutoPitch Vocal Suite"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal("beatmaker")}
            className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-audio-amber active:scale-95 transition"
            title="16-Step Beat Maker"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadMusic}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-brand hover:bg-brand-hover text-surface-0 border border-brand rounded-sm active:scale-95 transition disabled:opacity-50"
            title="Render Master Mixdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? `${exportProgress}%` : "Mixdown"}</span>
          </button>

          <button
            onClick={() => setActiveModal("settings")}
            className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-slateMuted hover:text-chalk active:scale-95 transition"
            title="Studio Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 📱 100% Android Native Bottom Transport Dock (< sm) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-1/95 backdrop-blur-md border-t border-surface-border px-3 py-2 flex items-center justify-between select-none">
        {/* Left: View Switcher (Tracks vs Arranger) & Timecode */}
        <div className="flex items-center gap-2">
          <div className="flex border border-surface-border rounded-sm overflow-hidden text-[10px] font-mono">
            <button
              onClick={() => setMobileActiveTab("tracks")}
              className={`px-2 py-1 transition ${
                mobileActiveTab === "tracks"
                  ? "bg-brand text-surface-0 font-bold"
                  : "bg-surface-0 text-slateMuted"
              }`}
            >
              Tracks
            </button>
            <button
              onClick={() => setMobileActiveTab("timeline")}
              className={`px-2 py-1 transition ${
                mobileActiveTab === "timeline"
                  ? "bg-brand text-surface-0 font-bold"
                  : "bg-surface-0 text-slateMuted"
              }`}
            >
              Timeline
            </button>
          </div>

          <span className="font-mono-numbers text-xs text-audio-cyan font-bold tracking-wider">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Center: Big Thumb-Friendly Play & Record Controls */}
        <div className="flex items-center gap-2">
          {/* Rewind */}
          <button
            onClick={handleStop}
            className="w-8 h-8 rounded-full bg-surface-2 border border-surface-border flex items-center justify-center text-steel hover:text-chalk active:scale-95 transition"
            title="Rewind to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Big Circular Play / Pause */}
          <button
            onClick={handlePlayToggle}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition ${
              isPlaying
                ? "bg-audio-play text-surface-0"
                : "bg-surface-2 border border-surface-border text-chalk hover:text-brand"
            }`}
            title="Play / Pause"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Big Circular Red Record */}
          <button
            onClick={handleRecordToggle}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition ${
              isRecording
                ? "bg-audio-rec text-white animate-pulse"
                : "bg-surface-2 border border-audio-rec/60 text-audio-rec hover:border-audio-rec"
            }`}
            title="Record Vocal Take"
          >
            <Circle className={`w-5 h-5 fill-current ${isRecording ? "scale-90" : ""}`} />
          </button>
        </div>

        {/* Right: Metronome & BPM */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <button
            onClick={toggleMetronome}
            className={`px-2 py-1 rounded-sm border transition ${
              isMetronomeOn
                ? "bg-surface-2 text-audio-cyan border-surface-strong font-bold"
                : "bg-surface-0 text-slateMuted border-surface-border"
            }`}
          >
            METRO
          </button>

          <div className="flex items-center gap-0.5 px-1.5 py-1 bg-surface-0 border border-surface-border rounded-sm text-steel">
            <span>{bpm}</span>
            <span className="text-slateMuted text-[8px]">BPM</span>
          </div>
        </div>
      </nav>

      {/* 💻 Desktop Header & Transport Bar (>= sm) */}
      <header className="hidden sm:flex border-b border-surface-border bg-surface-1 px-4 py-2 items-center justify-between gap-2 select-none shrink-0 z-30">
        {/* Top Left: Navigation & Project Title */}
        <div className="flex items-center gap-2">
          {/* Back to Projects Button */}
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-1 px-2 py-1 rounded-sm bg-surface-2 hover:bg-surface-strong border border-surface-border text-steel hover:text-chalk text-xs font-mono transition"
            title="Return to Projects Dashboard"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>

          {/* Project Title (Editable) */}
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={saveProjectName}
                onKeyDown={(e) => e.key === "Enter" && saveProjectName()}
                autoFocus
                className="bg-surface-0 border border-brand rounded-sm px-2 py-0.5 text-xs font-bold text-chalk font-mono focus:outline-none"
              />
              <button onClick={saveProjectName} className="text-brand p-1">
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span
              onClick={() => {
                setTempName(projectName);
                setIsEditingName(true);
              }}
              className="text-xs font-bold text-chalk truncate max-w-[200px] cursor-pointer hover:underline"
              title="Click to rename project"
            >
              {projectName}
            </span>
          )}
        </div>

        {/* Center Primary Transport Controls */}
        <div className="flex items-center justify-center gap-2.5">
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
              title="Play / Pause"
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
          <div className="flex items-center gap-1 bg-surface-0 border border-surface-border px-2 py-1 text-xs">
            <span className="text-slateMuted font-mono text-[10px]">BPM</span>
            <input
              type="number"
              min={40}
              max={240}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-10 bg-transparent text-chalk font-mono text-right focus:outline-none"
            />
          </div>

          {/* Musical Key */}
          <div className="flex items-center gap-1 bg-surface-0 border border-surface-border px-2 py-1 text-xs">
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
            className={`px-2 py-1.5 text-[10px] font-mono border transition ${
              isMetronomeOn
                ? "bg-surface-2 text-audio-cyan border-surface-strong"
                : "bg-surface-0 text-slateMuted border-surface-border hover:text-steel"
            }`}
            title="Toggle Metronome"
          >
            METRO
          </button>
        </div>

        {/* Right Drawer Tools & Primary CTA */}
        <div className="flex items-center gap-2">
          {/* Vocal Suite Trigger */}
          <button
            onClick={() => setActiveModal("vocal")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-surface-0 hover:bg-surface-2 text-chalk border border-surface-border transition"
          >
            <Mic className="w-3.5 h-3.5 text-brand" />
            <span>Vocal Suite</span>
          </button>

          {/* Beat Maker Trigger */}
          <button
            onClick={() => setActiveModal("beatmaker")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-surface-0 hover:bg-surface-2 text-chalk border border-surface-border transition"
          >
            <Grid className="w-3.5 h-3.5 text-audio-amber" />
            <span>Beat Maker</span>
          </button>

          {/* Solid Export CTA */}
          <button
            onClick={handleDownloadMusic}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-brand hover:bg-brand-hover text-surface-0 border border-brand transition disabled:opacity-50"
            title="Render Master Mixdown (MP3 / WAV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? `${exportProgress}%` : "Export"}</span>
          </button>

          {/* Preferences */}
          <button
            onClick={() => setActiveModal("settings")}
            className="p-1.5 bg-surface-0 hover:bg-surface-2 border border-surface-border text-steel hover:text-chalk transition"
            title="Studio Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    </>
  );
}
