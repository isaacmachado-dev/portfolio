// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    integrations: [react(), icon()],
  
  vite: {
    plugins: [tailwindcss()],
  },
});