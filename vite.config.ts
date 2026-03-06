import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { examplesMiddlewarePlugin } from './.config/vite-plugins/examples-middleware';

export default defineConfig({
  plugins: [react(), examplesMiddlewarePlugin()],
  base: process.env.VITE_BASE_PATH ?? '/',
  root: './src/ui',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
