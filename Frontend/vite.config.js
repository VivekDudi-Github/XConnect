import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/serve': {
        target: 'http://localhost:3000', // Points to your Nginx port or Express Port
        changeOrigin: true,
        ws: true 
      }
    }
  }
})
