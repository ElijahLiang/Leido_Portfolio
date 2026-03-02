import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/Leido_Portfolio/',
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          matter: ['matter-js'],
          glmatrix: ['gl-matrix'],
        },
      },
    },
  },
})
