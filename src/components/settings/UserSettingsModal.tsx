"use client";

import React, { useState } from "react";
import { X, Settings, Cloud, Check, LogOut, User, Key } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { useAuth } from "@/context/AuthContext";

export function UserSettingsModal() {
  const { activeModal, setActiveModal, bpm, key } = useStudioStore();
  const { user, guestId, settings, updateSettings, logout, loginWithGoogle } = useAuth();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-studio-900 border border-studio-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-studio-800 flex items-center justify-between bg-studio-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-studio-800 text-zinc-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Studio & User Preferences</h2>
              <p className="text-xs text-zinc-400">
                Synced automatically to your Supabase account
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg hover:bg-studio-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Identity Card */}
          <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-studio-accent/20 flex items-center justify-center text-studio-accent font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {user ? user.displayName || user.email : "Guest Session"}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  ID: {user?.uid.slice(0, 12) || guestId?.slice(0, 12)}...
                </span>
              </div>
            </div>

            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-850 hover:bg-studio-800 text-zinc-300 text-xs font-medium border border-studio-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="px-3 py-1.5 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white text-xs font-bold transition shadow-md shadow-studio-accent/20"
              >
                Link Google Account
              </button>
            )}
          </div>

          {/* Preferences Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-studio-950 border border-studio-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Default BPM
                </label>
                <input
                  type="number"
                  value={defaultBpm}
                  onChange={(e) => setDefaultBpm(Number(e.target.value))}
                  className="w-full bg-studio-950 border border-studio-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Default Key
                </label>
                <input
                  type="text"
                  value={defaultKey}
                  onChange={(e) => setDefaultKey(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            {/* Export Format Preference */}
            <div className="bg-studio-950 p-4 rounded-xl border border-studio-800 space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">
                Preferred Music Download Format
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setExportFormat("mp3")}
                  className={`p-2.5 rounded-lg border text-center font-bold transition ${
                    exportFormat === "mp3"
                      ? "bg-studio-accent/20 border-studio-accent text-white"
                      : "border-studio-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  MP3 (320 kbps)
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat("wav")}
                  className={`p-2.5 rounded-lg border text-center font-bold transition ${
                    exportFormat === "wav"
                      ? "bg-studio-accent/20 border-studio-accent text-white"
                      : "border-studio-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  WAV (Lossless 24-bit)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-studio-800 bg-studio-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Cloud className="w-4 h-4 text-studio-cyan" />
            <span>Supabase Cloud Sync Ready</span>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-studio-green flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white text-xs font-bold transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
