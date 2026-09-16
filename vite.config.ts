import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 与 tsconfig.json 的 paths 保持一致
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
