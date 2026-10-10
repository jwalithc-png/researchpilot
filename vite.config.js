import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/orchestrator': {
        target: 'https://15.252.236.234.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/orchestrator/, '/webhook/researchpilot-orchestrator'),
        secure: false,
      },
      '/api/phase1': {
        target: 'https://15.252.236.234.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phase1/, '/webhook/researchpilot-phase1'),
        secure: false,
      },
      '/api/phase2': {
        target: 'https://15.252.236.234.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phase2/, '/webhook/researchpilot-phase2'),
        secure: false,
      },
      '/api/phase3': {
        target: 'https://15.252.236.234.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phase3/, '/webhook/researchpilot-phase3'),
        secure: false,
      },
      '/api/phase4': {
        target: 'https://15.252.236.234.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phase4/, '/webhook/researchpilot-phase4'),
        secure: false,
      },
      '/api/phase5': {
        target: 'https://15.252.236.234.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phase5/, '/webhook/researchpilot-phase5'),
        secure: false,
      },
    },
  },
})
