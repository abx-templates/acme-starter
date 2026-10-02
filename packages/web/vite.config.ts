import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8001,
    proxy: {
      // Forward API calls to the NestJS server during development.
      '/api': 'http://localhost:8000',
    },
  },
});
