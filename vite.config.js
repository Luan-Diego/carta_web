import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

// Duas páginas: a carta (/) e o editor de links (/criar/).
export default defineConfig({
  base: './', // caminhos relativos: funciona em qualquer pasta/hospedagem estática
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        carta: page('./index.html'),
        criar: page('./criar/index.html'),
      },
    },
  },
});
