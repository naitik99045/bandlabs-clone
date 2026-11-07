import { supabase } from "./client";
import { UserSettings, DEFAULT_USER_SETTINGS } from "@/types/settings";

const LOCAL_STORAGE_KEY = "bandlab_user_settings";

export async function getUserSettings(userId: string): Promise<UserSettings> {
  // Try to load from Supabase
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      return data as UserSettings;
    }
  } catch (err) {
    console.warn("Supabase fetch error, checking local fallback:", err);
  }

  // Fallback to localStorage or default
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
  }

  return {
    id: userId,
    email: null,
    ...DEFAULT_USER_SETTINGS,
  };
}

export async function saveUserSettings(settings: UserSettings): Promise<boolean> {
  // Save locally first for instant snappy response
  if (typeof window !== "undefined") {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${settings.id}`, JSON.stringify(settings));
  }

  try {
    const payload = {
      ...settings,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Failed to sync settings to Supabase:", err);
    return false;
  }
}
