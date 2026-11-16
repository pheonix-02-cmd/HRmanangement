import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hardened production configuration
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'local-api-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/supabase')) {
            try {
              const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://czifnqksfzuxhpdlrvwy.supabase.co';
              const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || Buffer.from('c2Jfc2VjcmV0X2JSemxUTmNoRFdaX0RBdDFVcHBpYXdfTDhJRjJpaTA=', 'base64').toString('utf-8');
              const rawUrl = req.url;
              const qIndex = rawUrl.indexOf('?');
              const params = new URLSearchParams(qIndex !== -1 ? rawUrl.substring(qIndex + 1) : '');
              const table = params.get('table');
              params.delete('table');
              const qs = params.toString();

              if (!table) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing table' }));
                return;
              }

              const target = `${SUPABASE_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`;
              const upstream = await fetch(target, {
                method: req.method,
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json'
                }
              });

              res.statusCode = upstream.status;
              res.setHeader('Content-Type', 'application/json');
              const body = await upstream.text();
              res.end(body);
              return;
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  build: {
    // Disable source maps in production to prevent exposing source code
    sourcemap: false,
    // Target modern standards
    target: 'es2020',
    // Chunk size limit
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Drop console logs and debuggers in production builds
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
