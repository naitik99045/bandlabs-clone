"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider, isFirebaseAvailable } from "@/lib/firebase/config";
import { UserSettings } from "@/types/settings";
import { getUserSettings, saveUserSettings } from "@/lib/supabase/settingsService";

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  guestId: string | null;
  settings: UserSettings | null;
  loading: boolean;
  isFirebaseAvailable: boolean;
  loginWithGoogle: () => Promise<AuthResponse>;
  loginWithEmail: (email: string, pass: string) => Promise<AuthResponse>;
  signupWithEmail: (email: string, pass: string, displayName?: string) => Promise<AuthResponse>;
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
      if (displayName && (data.display_name === "Producer" || !data.display_name)) {
        data.display_name = displayName;
      }
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

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    if (!isFirebaseAvailable || !auth || !googleProvider) {
      return { success: false, error: "Network connection required for Google sign-in. You are currently in offline guest mode." };
    }

    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        safeSetStorage("bandlab_guest_id", "");
        setGuestId(null);
        return { success: true };
      }
      return { success: false, error: "Sign in was cancelled." };
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const msg = err instanceof Error ? err.message : "Google sign-in failed. In Android WebView, use Email/Password sign in.";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<AuthResponse> => {
    if (!isFirebaseAvailable || !auth) {
      return { success: false, error: "Authentication service offline. Continuing in local guest mode." };
    }
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        safeSetStorage("bandlab_guest_id", "");
        setGuestId(null);
        return { success: true };
      }
      return { success: false, error: "Login failed." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      return { success: false, error: msg.replace("Firebase: ", "") };
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, displayName?: string): Promise<AuthResponse> => {
    if (!isFirebaseAvailable || !auth) {
      return { success: false, error: "Authentication service offline. Continuing in local guest mode." };
    }
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user && displayName) {
        try {
          await updateProfile(res.user, { displayName });
        } catch {
          // ignore profile name update error
        }
      }
      safeSetStorage("bandlab_guest_id", "");
      setGuestId(null);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Account creation failed.";
      return { success: false, error: msg.replace("Firebase: ", "") };
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
        loginWithEmail,
        signupWithEmail,
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
