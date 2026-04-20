import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/analyze-profile': 'http://localhost:5000',
      '/predict-fake-profile': 'http://localhost:5000',
      '/detect-spam': 'http://localhost:5000',
      '/detect-phishing': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/debug-scrape': 'http://localhost:5000',
    },
  },
})
