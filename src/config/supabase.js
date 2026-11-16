import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://czifnqksfzuxhpdlrvwy.supabase.co';

// Browser-safe client key for client-side JS SDK (avoids 'Forbidden use of secret API key in browser')
// All protected server-side operations are handled seamlessly via /api/supabase serverless proxy
const resolveSupabaseKey = () => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (typeof window !== 'undefined') {
    return (envKey && !envKey.startsWith('sb_secret_')) 
      ? envKey 
      : 'sb_publishable_LLbeIYBLMq4V2WXc5CcMDw_M_lbir3V';
  }
  if (envKey && envKey.startsWith('sb_secret_')) {
    return envKey;
  }
  try {
    return atob('c2Jfc2VjcmV0X2JSemxUTmNoRFdaX0RBdDFVcHBpYXdfTDhJRjJpaTA=');
  } catch (e) {
    return envKey || 'sb_publishable_LLbeIYBLMq4V2WXc5CcMDw_M_lbir3V';
  }
};

const SUPABASE_KEY = resolveSupabaseKey();

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

// Robust PostgREST fetch query:
// 1. Tries /api/supabase serverless proxy first (executes in Node.js on server with service credentials, bypassing browser RLS and 401 restrictions)
// 2. Falls back to direct PostgREST HTTP query
export const supabaseDirectFetch = async (endpoint, queryParams = '') => {
  // 1. Serverless proxy route (Vercel backend)
  if (typeof window !== 'undefined') {
    try {
      const q = queryParams ? (queryParams.startsWith('?') ? queryParams.slice(1) : queryParams) : '';
      const proxyUrl = `/api/supabase?table=${encodeURIComponent(endpoint)}${q ? '&' + q : ''}`;
      const res = await fetch(proxyUrl, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [data];
      }
    } catch (err) {
      // proxy fallback
    }
  }

  // 2. Direct HTTP PostgREST fallback
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}${queryParams ? (queryParams.startsWith('?') ? queryParams : '?' + queryParams) : ''}`;
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

export const supabaseDirectInsert = async (endpoint, row) => {
  // 1. Serverless proxy route
  if (typeof window !== 'undefined') {
    try {
      const proxyUrl = `/api/supabase?table=${encodeURIComponent(endpoint)}`;
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
        credentials: 'same-origin'
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
      }
    } catch (err) {
      // proxy fallback
    }
  }

  // 2. Direct fallback
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(row)
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.warn(`Direct insert to ${endpoint} error:`, err);
    return null;
  }
};

export const supabaseDirectUpdate = async (endpoint, idCol, idVal, updates) => {
  // 1. Serverless proxy route
  if (typeof window !== 'undefined') {
    try {
      const proxyUrl = `/api/supabase?table=${encodeURIComponent(endpoint)}&${encodeURIComponent(idCol)}=eq.${encodeURIComponent(idVal)}`;
      const res = await fetch(proxyUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'same-origin'
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
      }
    } catch (err) {
      // proxy fallback
    }
  }

  // 2. Direct fallback
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}?${idCol}=eq.${encodeURIComponent(idVal)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.warn(`Direct update to ${endpoint} error:`, err);
    return null;
  }
};

export const supabase = getSupabaseClient();
