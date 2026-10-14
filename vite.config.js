import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  server: {
    host: true,
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.png', '**/*.jpg', '**/*.svg']
});
