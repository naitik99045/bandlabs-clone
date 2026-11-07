"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { UserSettings } from "@/types/settings";
import { getUserSettings, saveUserSettings } from "@/lib/supabase/settingsService";

interface AuthContextType {
  user: User | null;
  guestId: string | null;
  settings: UserSettings | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync settings when active user or guest changes
  const loadSettingsForIdentity = async (identityId: string, email: string | null = null, displayName: string = "Producer") => {
    try {
      const data = await getUserSettings(identityId);
      if (email && !data.email) data.email = email;
      if (displayName && data.display_name === "Producer") data.display_name = displayName;
      setSettings(data);
    } catch (err) {
      console.warn("Failed to load settings:", err);
    }
  };

  useEffect(() => {
    // Check for existing guest session
    const storedGuest = localStorage.getItem("bandlab_guest_id");
    if (storedGuest) {
      setGuestId(storedGuest);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setGuestId(null);
        await loadSettingsForIdentity(currentUser.uid, currentUser.email, currentUser.displayName || "Producer");
      } else if (storedGuest) {
        await loadSettingsForIdentity(storedGuest);
      } else {
        // Automatically give a guest session so DAW works immediately
        const autoGuest = "guest_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("bandlab_guest_id", autoGuest);
        setGuestId(autoGuest);
        await loadSettingsForIdentity(autoGuest);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        localStorage.removeItem("bandlab_guest_id");
        setGuestId(null);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    const newGuest = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("bandlab_guest_id", newGuest);
    setGuestId(newGuest);
    loadSettingsForIdentity(newGuest);
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      loginAsGuest();
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;
    const merged: UserSettings = {
      ...settings,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };
    setSettings(merged);
    await saveUserSettings(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guestId,
        settings,
        loading,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
