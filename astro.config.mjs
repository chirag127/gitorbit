import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://gitorbit.oriz.in',
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    optimizeDeps: {
      include: ['react-dom/client'],
    },
  },
});
