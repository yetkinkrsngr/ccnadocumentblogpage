import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('remark') || id.includes('rehype') || id.includes('prismjs')) return 'vendor-markdown'
            return 'vendor'
          }
        }
      }
    }
  }
})
