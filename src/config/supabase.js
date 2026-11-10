import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://czifnqksfzuxhpdlrvwy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LLbeIYBLMq4V2WXc5CcMDw_M_lbir3V';

let clientInstance = null;

export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: Boolean(SUPABASE_ANON_KEY)
});

export const getSupabaseClient = () => {
  if (!clientInstance && SUPABASE_ANON_KEY) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    } catch (err) {
      console.error('Supabase initialization error:', err);
    }
  }
  return clientInstance;
};

export const supabase = getSupabaseClient();
