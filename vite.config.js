import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      input: { main: resolve(process.cwd(), 'index.html'), research: resolve(process.cwd(), 'ai-agent-game.html') },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
