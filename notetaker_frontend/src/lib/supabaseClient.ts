import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

function init() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  // Supabase is optional: if either value is missing, return null gracefully.
  if (!url || !key) return null;
  try {
    supabase = createClient(url, key);
    return supabase;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function getSupabaseClient(): SupabaseClient | null {
  /**
   * Returns a Supabase client if env variables are present; otherwise null.
   * When deployed, ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY
   * are set if using Supabase features.
   */
  if (supabase) return supabase;
  return init();
}
