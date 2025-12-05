import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que tu móvil acceda a tu PC por la IP local
  },
  build: {
    outDir: 'dist',
  },
})