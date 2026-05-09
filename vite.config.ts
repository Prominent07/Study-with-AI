import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Path alias: import from '@/...' resolves to src/
    // Using a function avoids needing @types/node for __dirname
    alias: [
      { find: '@', replacement: '/src' },
    ],
  },
  server: {
    port: 5173,
    host: true,
  },
})
