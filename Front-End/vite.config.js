import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // repassa as chamadas /api para o FuelPHP
      '/api': 'http://localhost:8000',
    },
  },
})