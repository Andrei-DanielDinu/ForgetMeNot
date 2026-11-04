import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './', // Ensures relative assets work anywhere (GitHub Pages, subpaths, Vercel)
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'https' ? [basicSsl()] : []),
  ],
  server: {
    host: true,
    port: 5173,
  },
}));
