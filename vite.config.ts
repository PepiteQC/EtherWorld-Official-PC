// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // ── Code splitting intelligent ──
    rollupOptions: {
      output: {
        manualChunks: {
          // Sépare Three.js dans son propre fichier (gros)
          three: ['three'],
          // Sépare React Three Fiber
          r3f: ['@react-three/fiber', '@react-three/drei'],
          // Sépare Zustand
          state: ['zustand'],
        },
      },
    },
    // ── Taille cible ──
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Enlève les console.log en prod
        drop_debugger: true,
      },
    },
    // ── Préchargement ──
    modulePreload: {
      polyfill: true,
    },
    // ── Alerte si > 1.5 MB ──
    chunkSizeWarningLimit: 1500,
  },
  // ── Optimisation du dev server ──
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
})