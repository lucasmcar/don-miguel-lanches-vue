import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    __dirname: JSON.stringify(''), // evita erro no build
  },
  base: './',
  plugins: [vue(), nodePolyfills({
    buffer: true, // Ativa o polyfill para Buffer
  }),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Don Miguel Lanches',
      short_name: 'Don Miguel',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#42b883',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })

  ],
  optimizeDeps: {
    include: ['buffer'],
  },
});