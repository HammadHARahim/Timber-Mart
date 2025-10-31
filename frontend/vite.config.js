import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose on network
    port: 3000,
    strictPort: false,
    open: false // Don't auto-open browser
  }
})