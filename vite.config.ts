import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),mkcert()],
  server: {
    host: '0.0.0.0',
    cors: true,
    open: true,
    hmr: {
      protocol: 'wss',
      host: 'localhost',
    },
  },
  resolve: {
    alias: {
      "simple-peer": "simple-peer/simplepeer.min.js",
    },
  },
})
