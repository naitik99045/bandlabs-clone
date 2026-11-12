"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Mic, 
  Volume2, 
  Check, 
  Sliders, 
  ChevronDown,
  Activity,
  RotateCcw
} from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { 
  detectPitch, 
  NoteInfo, 
  INSTRUMENT_TUNINGS, 
  InstrumentTuning 
} from "@/lib/audio/dsp/PitchDetector";

export function TunerModal() {
  const { activeModal, setActiveModal } = useStudioStore();
  const [selectedTuning, setSelectedTuning] = useState<InstrumentTuning>(INSTRUMENT_TUNINGS[0]);
  const [a4Ref, setA4Ref] = useState<number>(440);
  const [detectedNote, setDetectedNote] = useState<NoteInfo | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const toneOscRef = useRef<OscillatorNode | null>(null);

  if (activeModal !== "tuner") return null;

  const startListening = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);

      const buffer = new Float32Array(analyser.fftSize);

      const checkPitch = () => {
        if (!analyserRef.current || !audioCtxRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);
        const note = detectPitch(buffer, audioCtxRef.current.sampleRate, a4Ref);
        if (note) {
          setDetectedNote(note);
          // Highlight corresponding string if instrument tuning is active
          if (selectedTuning.notes.length > 0) {
            const matchIdx = selectedTuning.notes.findIndex(
              (n) => n.note === note.note && Math.abs(n.octave - note.octave) <= 1
            );
            setActiveStringIndex(matchIdx !== -1 ? matchIdx : null);
          }
        }
        animFrameRef.current = requestAnimationFrame(checkPitch);
      };

      animFrameRef.current = requestAnimationFrame(checkPitch);
    } catch (err) {
      console.error("Microphone access failed for Tuner:", err);
      setMicError("Microphone access was denied. Please allow microphone permissions to use the chromatic tuner.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsListening(false);
    setDetectedNote(null);
  };

  // Play reference pitch for tapped string
  const playReferenceTone = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      if (toneOscRef.current) {
        toneOscRef.current.stop();
        toneOscRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.25);
      toneOscRef.current = osc;
    } catch (err) {
      console.error("Error playing reference tone:", err);
    }
  };

  useEffect(() => {
    startListening();
    return () => {
      stopListening();
    };
  }, [a4Ref]);

  const cents = detectedNote?.cents ?? 0;
  // Calculate needle rotation: -50 cents = -45 deg, +50 cents = +45 deg
  const needleRotation = (cents / 50) * 45;

  const isInTune = detectedNote ? detectedNote.inTune : false;
  const isFlat = detectedNote ? detectedNote.cents < -3 : false;
  const isSharp = detectedNote ? detectedNote.cents > 3 : false;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopListening();
          setActiveModal(null);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/85 p-3 sm:p-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] select-none animate-in fade-in duration-150"
    >
      <div className="bg-surface-1 border border-surface-border w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-brand shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-brand uppercase tracking-wider font-bold">
                BANDLAB CREATOR TOOLS
              </span>
              <h2 className="text-sm font-bold text-chalk">
                Chromatic Instrument Tuner
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopListening();
              setActiveModal(null);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
            title="Close Tuner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-surface-0">
          {/* Tuning Mode Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-steel uppercase tracking-wider">
                Instrument Preset
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slateMuted">
                <span>A4 =</span>
                <button
                  onClick={() => setA4Ref(a4Ref === 440 ? 432 : a4Ref === 432 ? 442 : 440)}
                  className="px-1.5 py-0.5 bg-surface-1 border border-surface-border text-brand font-bold hover:bg-surface-2 transition"
                >
                  {a4Ref} Hz
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {INSTRUMENT_TUNINGS.map((tuning) => (
                <button
                  key={tuning.id}
                  onClick={() => {
                    setSelectedTuning(tuning);
                    setActiveStringIndex(null);
                  }}
                  className={`px-2 py-1.5 text-[11px] font-mono transition border text-center truncate ${
                    selectedTuning.id === tuning.id
                      ? "bg-brand text-surface-0 border-brand font-bold"
                      : "bg-surface-1 text-slateMuted border-surface-border hover:text-chalk hover:bg-surface-2"
                  }`}
                >
                  {tuning.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Large Visual Pitch Meter Gauge */}
          <div className="p-6 bg-surface-1 border border-surface-border flex flex-col items-center justify-center relative">
            {/* Cents Meter Needle Visual */}
            <div className="w-full max-w-[280px] h-24 relative flex flex-col items-center justify-end overflow-hidden mb-2">
              {/* Scale Arc Ticks */}
              <div className="w-full flex justify-between px-2 text-[9px] font-mono text-steel mb-1">
                <span className="text-audio-rec">-50¢</span>
                <span className="text-slateMuted">-25¢</span>
                <span className="text-audio-play font-bold">0¢</span>
                <span className="text-slateMuted">+25¢</span>
                <span className="text-audio-amber">+50¢</span>
              </div>

              {/* Tick Ruler */}
              <div className="w-full h-3 border-t border-surface-border relative flex justify-between px-3">
                {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map((val) => (
                  <div
                    key={val}
                    className={`w-[1px] ${
                      val === 0
                        ? "h-3 bg-audio-play w-[2px]"
                        : Math.abs(val) === 20 || Math.abs(val) === 40
                        ? "h-2 bg-steel"
                        : "h-1 bg-surface-border"
                    }`}
                  />
                ))}
              </div>

              {/* Dynamic Pivot Needle */}
              <div
                className="w-0.5 h-14 origin-bottom transition-transform duration-75 absolute bottom-0"
                style={{
                  transform: `rotate(${needleRotation}deg)`,
                  backgroundColor: isInTune
                    ? "oklch(78% 0.16 168)" // Signal Mint
                    : isFlat
                    ? "oklch(64% 0.16 30)" // Nordic Carmine
                    : isSharp
                    ? "oklch(74% 0.14 75)" // Warm Ochre
                    : "oklch(60% 0.03 240)",
                }}
              />
            </div>

            {/* Note Display */}
            <div className="text-center my-2">
              {detectedNote ? (
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center">
                    <span 
                      className="text-6xl font-bold font-mono tracking-tight"
                      style={{
                        color: isInTune
                          ? "oklch(78% 0.16 168)"
                          : isFlat
                          ? "oklch(64% 0.16 30)"
                          : "oklch(74% 0.14 75)",
                      }}
                    >
                      {detectedNote.note}
                    </span>
                    <span className="text-xl font-mono text-steel ml-1 font-bold">
                      {detectedNote.octave}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                        isInTune
                          ? "bg-audio-play/15 border-audio-play/40 text-audio-play"
                          : isFlat
                          ? "bg-audio-rec/15 border-audio-rec/40 text-audio-rec"
                          : "bg-audio-amber/15 border-audio-amber/40 text-audio-amber"
                      }`}
                    >
                      {isInTune ? "IN TUNE" : isFlat ? `FLAT (${cents}¢)` : `SHARP (+${cents}¢)`}
                    </span>
                  </div>

                  {/* Hz Readout */}
                  <div className="text-[11px] font-mono text-slateMuted mt-1">
                    <span>{detectedNote.frequency.toFixed(1)} Hz</span>
                    <span className="mx-1.5 text-surface-border">/</span>
                    <span className="text-steel">Target: {detectedNote.targetFrequency.toFixed(1)} Hz</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="text-3xl font-mono font-bold text-steel">--</div>
                  <p className="text-xs font-mono text-slateMuted">
                    {isListening ? "Listening for audio input..." : "Microphone paused"}
                  </p>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {micError && (
              <div className="mt-3 p-3 bg-audio-rec/10 border border-audio-rec/30 text-audio-rec text-[11px] font-mono text-center">
                {micError}
              </div>
            )}
          </div>

          {/* Instrument String Pegs (if instrument selected) */}
          {selectedTuning.notes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-steel uppercase tracking-wider">
                  Strings (Tap to hear reference tone)
                </span>
                <span className="text-[10px] font-mono text-slateMuted">
                  {selectedTuning.instrument}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {selectedTuning.notes.map((str, idx) => {
                  const isActive = activeStringIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveStringIndex(idx);
                        playReferenceTone(str.freq);
                      }}
                      className={`p-2.5 border text-center transition flex flex-col items-center justify-between active:scale-95 ${
                        isActive
                          ? "bg-brand/15 border-brand text-brand font-bold"
                          : "bg-surface-1 border-surface-border hover:border-surface-strong text-chalk"
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{str.note}</span>
                      <span className="text-[9px] font-mono text-steel">{str.octave}</span>
                      <span className="text-[8px] font-mono text-slateMuted mt-1 truncate">
                        {Math.round(str.freq)}Hz
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between">
          <button
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
              isListening
                ? "bg-surface-2 border-surface-border text-chalk hover:bg-surface-strong"
                : "bg-brand border-brand text-surface-0 hover:bg-brand-hover"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isListening ? "Pause Mic" : "Resume Mic"}</span>
          </button>

          <button
            onClick={() => {
              stopListening();
              setActiveModal(null);
            }}
            className="px-4 py-1.5 bg-surface-2 hover:bg-surface-strong border border-surface-border text-chalk text-xs font-mono transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
