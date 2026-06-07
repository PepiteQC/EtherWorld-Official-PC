import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // ✅ Base pour GitHub Pages
  base: '/EtherWorld-Official-PC/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    target: 'esnext',

    // ✅ esbuild (pas terser) — compatible Vite 8
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // ✅ FONCTION — obligatoire dans Vite 8 / Rolldown
        manualChunks(id: string) {
          if (id.includes('node_modules/three'))         return 'three'
          if (id.includes('@react-three/fiber'))         return 'r3f'
          if (id.includes('@react-three/drei'))          return 'drei'
          if (id.includes('@react-three/rapier'))        return 'rapier'
          if (id.includes('zustand'))                    return 'state'
          if (id.includes('node_modules'))               return 'vendor'
        },
      },
    },

    chunkSizeWarningLimit: 2000,
  },

  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand',
    ],
  },

  server: {
    host: true,
    port: 5173,
  },
})