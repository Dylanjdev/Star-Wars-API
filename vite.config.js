import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Star-Wars-API/', // Set base for GitHub Pages
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://swapi.py4e.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
