import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

/**
 * Initializes the Supabase client if env vars are available.
 * Returns null if envs are missing or client creation fails.
 */
function init(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) {
    // Graceful: do not throw if not configured
    return null;
  }
  try {
    supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabase;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function getSupabaseClient(): SupabaseClient | null {
  /**
   * Returns a Supabase client if env variables are present; otherwise null.
   * When deployed, ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY are set if using Supabase features.
   */
  if (supabase) return supabase;
  return init();
}
