import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Env-driven so the GitHub Pages *project* site can serve from `/<repo>/`
  // while dev + Storybook stay at `/`. Set `APP_BASE` only for the app build
  // step (see .github/workflows/pages.yml); Storybook inherits `/`.
  base: process.env.APP_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
