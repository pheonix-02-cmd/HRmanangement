import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hardened production configuration
export default defineConfig(({ mode }) => ({
  plugins: [react()],
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
