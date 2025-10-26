import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',       
    port: 5173,            // 📦 Match Docker port
    watch: {
      usePolling: true,    // 🔁 Enable polling to detect file changes
    },
  },
})
