"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider, isFirebaseAvailable } from "@/lib/firebase/config";
import { UserSettings } from "@/types/settings";
import { getUserSettings, saveUserSettings } from "@/lib/supabase/settingsService";

interface AuthContextType {
  user: User | null;
  guestId: string | null;
  settings: UserSettings | null;
  loading: boolean;
  isFirebaseAvailable: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe storage access to prevent Android WebView DOMExceptions
function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage restriction
  }
  return null;
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage restriction
  }
}

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
    let unsubscribe = () => {};

    const initAuth = async () => {
      // Check for existing guest session
      const storedGuest = safeGetStorage("bandlab_guest_id");
      if (storedGuest) {
        setGuestId(storedGuest);
      }

      // If Firebase Auth is not available (e.g. offline, WebView restricted, or invalid key)
      if (!isFirebaseAvailable || !auth) {
        console.info("Firebase Auth not initialized. Operating in local guest mode.");
        const fallbackGuest = storedGuest || "guest_" + Math.random().toString(36).substring(2, 9);
        safeSetStorage("bandlab_guest_id", fallbackGuest);
        setGuestId(fallbackGuest);
        await loadSettingsForIdentity(fallbackGuest);
        setLoading(false);
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            setGuestId(null);
            await loadSettingsForIdentity(currentUser.uid, currentUser.email, currentUser.displayName || "Producer");
          } else if (storedGuest) {
            await loadSettingsForIdentity(storedGuest);
          } else {
            const autoGuest = "guest_" + Math.random().toString(36).substring(2, 9);
            safeSetStorage("bandlab_guest_id", autoGuest);
            setGuestId(autoGuest);
            await loadSettingsForIdentity(autoGuest);
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn("onAuthStateChanged failed, falling back to guest mode:", err);
        const autoGuest = storedGuest || "guest_" + Math.random().toString(36).substring(2, 9);
        safeSetStorage("bandlab_guest_id", autoGuest);
        setGuestId(autoGuest);
        await loadSettingsForIdentity(autoGuest);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      try {
        unsubscribe();
      } catch {
        // Safe unmount
      }
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseAvailable || !auth || !googleProvider) {
      alert("Cloud authentication requires internet connection. Your studio is currently in offline producer mode.");
      return;
    }

    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        safeSetStorage("bandlab_guest_id", "");
        setGuestId(null);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("Sign-in was cancelled or not supported in this environment. Continuing as guest.");
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    const newGuest = "guest_" + Math.random().toString(36).substring(2, 9);
    safeSetStorage("bandlab_guest_id", newGuest);
    setGuestId(newGuest);
    loadSettingsForIdentity(newGuest);
  };

  const logout = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
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
        isFirebaseAvailable,
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
