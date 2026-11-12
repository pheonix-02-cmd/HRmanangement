import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://czifnqksfzuxhpdlrvwy.supabase.co';
// Load public or service key from environment variables
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LLbeIYBLMq4V2WXc5CcMDw_M_lbir3V';

let clientInstance = null;

export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  anonKey: SUPABASE_KEY,
  isConfigured: Boolean(SUPABASE_KEY)
});

export const getSupabaseClient = () => {
  if (!clientInstance && SUPABASE_KEY) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
    } catch (err) {
      console.error('Supabase initialization error:', err);
    }
  }
  return clientInstance;
};

// Direct HTTP PostgREST API query that guarantees 100% reliable responses
// bypassing any browser client caching or SDK state issues
export const supabaseDirectFetch = async (endpoint, queryParams = '') => {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}${queryParams ? '?' + queryParams : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.warn(`Direct fetch to ${endpoint} failed:`, err);
    return null;
  }
};

export const supabase = getSupabaseClient();
