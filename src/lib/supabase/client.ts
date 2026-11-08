import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vbggacgvdbgtgvtyupvo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_DT1f5WGCdJqjBmGsp8v3nA_TqY4gM9r";

let client: SupabaseClient;

try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.warn("Failed to initialize Supabase client with environment variables, using fallback dummy:", err);
  client = createClient("https://placeholder.supabase.co", "placeholder-anon-key");
}

export const supabase = client;
