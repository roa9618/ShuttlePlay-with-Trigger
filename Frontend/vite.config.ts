import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-switch'],
          network: ['axios', '@stomp/stompjs'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
