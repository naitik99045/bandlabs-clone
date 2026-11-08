"use client";

import React, { useState } from "react";
import { X, Settings, Cloud, Check, LogOut, User, Shield, FileText } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { useAuth } from "@/context/AuthContext";

export function UserSettingsModal() {
  const { activeModal, setActiveModal, bpm, key } = useStudioStore();
  const { user, guestId, settings, updateSettings, logout, loginWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<"preferences" | "legal">("preferences");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [displayName, setDisplayName] = useState(settings?.display_name || "Producer");
  const [defaultBpm, setDefaultBpm] = useState(settings?.default_bpm || bpm);
  const [defaultKey, setDefaultKey] = useState(settings?.default_key || key);
  const [exportFormat, setExportFormat] = useState(settings?.export_preferences?.format || "mp3");
  const [exportBitrate, setExportBitrate] = useState(settings?.export_preferences?.bitrate || 320);

  if (activeModal !== "settings") return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        display_name: displayName,
        default_bpm: defaultBpm,
        default_key: defaultKey,
        export_preferences: {
          format: exportFormat,
          bitrate: exportBitrate,
          normalize: true,
          sampleRate: 44100,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
      <div className="bg-surface-1 border border-surface-border rounded-sm w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-surface-2 border border-surface-border text-brand">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-chalk uppercase tracking-wide">
                Studio Preferences & Cloud Sync
              </h2>
              <p className="text-[11px] text-slateMuted">
                Configured with Supabase session storage and Firebase authentication
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-surface-border bg-surface-0 px-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab("preferences")}
            className={`py-2 px-3 border-b-2 font-semibold transition ${
              activeTab === "preferences"
                ? "border-brand text-brand"
                : "border-transparent text-slateMuted hover:text-chalk"
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab("legal")}
            className={`py-2 px-3 border-b-2 font-semibold transition flex items-center gap-1.5 ${
              activeTab === "legal"
                ? "border-brand text-brand"
                : "border-transparent text-slateMuted hover:text-chalk"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Terms of Service & Privacy</span>
          </button>
        </div>

        {/* Form Body */}
        {activeTab === "preferences" ? (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh] bg-surface-0">
            {/* Identity Card */}
            <div className="bg-surface-1 p-3.5 rounded-sm border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-surface-2 border border-surface-border flex items-center justify-center text-brand font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-chalk block">
                    {user ? user.displayName || user.email : "Anonymous Producer Session"}
                  </span>
                  <span className="text-[10px] font-mono text-slateMuted">
                    UID: {user?.uid.slice(0, 16) || guestId?.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {user ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-2 hover:bg-surface-strong text-steel text-[11px] font-mono border border-surface-border transition"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="px-3 py-1 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-[11px] font-mono font-bold transition"
                >
                  Link Google Auth
                </button>
              )}
            </div>

            {/* Preferences Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-steel block mb-1">
                  PRODUCER / DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-surface-1 border border-surface-border rounded-sm p-2 text-xs text-chalk font-mono focus:outline-none focus:border-surface-strong"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-steel block mb-1">
                    DEFAULT BPM
                  </label>
                  <input
                    type="number"
                    value={defaultBpm}
                    onChange={(e) => setDefaultBpm(Number(e.target.value))}
                    className="w-full bg-surface-1 border border-surface-border rounded-sm p-2 text-xs text-chalk font-mono focus:outline-none focus:border-surface-strong"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-steel block mb-1">
                    DEFAULT ROOT KEY
                  </label>
                  <input
                    type="text"
                    value={defaultKey}
                    onChange={(e) => setDefaultKey(e.target.value)}
                    className="w-full bg-surface-1 border border-surface-border rounded-sm p-2 text-xs text-chalk font-mono focus:outline-none focus:border-surface-strong"
                  />
                </div>
              </div>

              {/* Export Format Preference */}
              <div className="bg-surface-1 p-3.5 rounded-sm border border-surface-border space-y-2">
                <span className="text-[11px] font-mono text-steel block uppercase">
                  Default Music Export Format
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setExportFormat("mp3")}
                    className={`p-2 rounded-sm border text-center transition ${
                      exportFormat === "mp3"
                        ? "bg-surface-2 border-brand text-brand font-bold"
                        : "border-surface-border text-slateMuted hover:text-chalk"
                    }`}
                  >
                    MP3 (320 kbps CBR)
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("wav")}
                    className={`p-2 rounded-sm border text-center transition ${
                      exportFormat === "wav"
                        ? "bg-surface-2 border-brand text-brand font-bold"
                        : "border-surface-border text-slateMuted hover:text-chalk"
                    }`}
                  >
                    WAV (24-bit Lossless)
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Terms of Service & Privacy Policy View (Required by qwenton-ui Phase 4) */
          <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh] bg-surface-0 text-xs text-steel leading-relaxed font-mono">
            <div className="border border-surface-border p-3.5 rounded-sm bg-surface-1 space-y-2">
              <div className="flex items-center gap-2 text-chalk font-bold text-xs uppercase">
                <FileText className="w-4 h-4 text-brand" />
                <span>Terms of Service (BandLab Clone DAW)</span>
              </div>
              <p className="text-[11px] text-slateMuted">
                1. <b>Intellectual Property Ownership:</b> You retain 100% full ownership, commercial rights, and copyright over all musical stems, vocal recordings, beats, and master mixdowns produced within this workstation.
              </p>
              <p className="text-[11px] text-slateMuted">
                2. <b>Local In-Browser Processing:</b> All audio pitch manipulation, auto-tune quantization, and rendering occur client-side via Web Audio API. No unencrypted audio files are transmitted without user consent.
              </p>
            </div>

            <div className="border border-surface-border p-3.5 rounded-sm bg-surface-1 space-y-2">
              <div className="flex items-center gap-2 text-chalk font-bold text-xs uppercase">
                <Shield className="w-4 h-4 text-audio-cyan" />
                <span>Privacy & Telemetry Policy</span>
              </div>
              <p className="text-[11px] text-slateMuted">
                1. <b>Data Storage:</b> Cloud synchronization saves user preferences (BPM, scale, export format) securely in Supabase with row-level security.
              </p>
              <p className="text-[11px] text-slateMuted">
                2. <b>Microphone Access:</b> Microphone permissions are requested solely for active track audio capture and are never recorded in background.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 border-t border-surface-border bg-surface-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slateMuted">
            <Cloud className="w-3.5 h-3.5 text-audio-cyan" />
            <span>Supabase Cloud Engine Ready</span>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-mono text-audio-play flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition disabled:opacity-50"
            >
              {saving ? "Writing..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
