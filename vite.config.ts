import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@app': '/src/app',
      '@pages': '/src/pages',
      '@features': '/src/features',
      '@shared': '/src/shared',
      '@assets': '/src/assets',
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
  },
});
