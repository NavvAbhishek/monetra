import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Firebase SDK in its own long-cached file: an app update doesn't make users re-download it.
        // (Other libraries stay split per page, so pages still load only what they need.)
        codeSplitting: {
          groups: [{ name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/ }],
        },
      },
    },
    // The Firebase SDK (Auth + Firestore with offline cache) is ~650 kB minified on its own.
    chunkSizeWarningLimit: 700,
  },
})
