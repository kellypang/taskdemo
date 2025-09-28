import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Allow overriding dev server port and backend target via env vars.
// VITE_PORT sets the dev server port, VITE_API_TARGET sets the backend base (default http://localhost:4000)
const devPort = parseInt(process.env.VITE_PORT || '3000', 10)
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:4000'
// Disable auto-open in headless / e2e / Codespaces contexts unless explicitly enabled
// VITE_AUTO_OPEN=1 to force; default false
const autoOpen = process.env.VITE_AUTO_OPEN === '1'

export default defineConfig({
  plugins: [react()],
  server: {
    port: devPort,
    open: autoOpen,
    proxy: {
      '/api': apiTarget
    }
  }
})
