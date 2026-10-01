import { defineConfig } from 'vite';
import what from 'what-compiler/vite';

export default defineConfig({
  plugins: [what()],
  build: {
    manifest: true,
    outDir: 'dist/client',
    emptyOutDir: true,
    rollupOptions: { input: 'src/client/main.jsx' },
  },
});
