import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          'ui-vendor': ['react-bootstrap', 'bootstrap', 'react-icons'],
          // Chart library (large, loaded only when needed)
          'charts': ['recharts'],
          // Utils chunk
          'utils': ['axios', 'react-toastify'],
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'esbuild',
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  // Server settings for development
  server: {
    port: 5173,
    strictPort: false,
    // Enable HMR
    hmr: true,
  },
})
