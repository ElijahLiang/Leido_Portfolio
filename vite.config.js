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
      input: Object.fromEntries(['index', 'ai-agent-game', 'sky-studio', 'lost-light', 'tide-echo', 'rhythm-game-demo', 'embodied-intelligence'].map(name => [name, resolve(process.cwd(), `${name}.html`)])),
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
