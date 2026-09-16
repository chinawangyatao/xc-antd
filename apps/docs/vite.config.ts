import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      'xc-antd': resolve(__dirname, '../../packages/xc-antd/src/index.ts'),
    },
    // 避免与子包产生 React 双实例（hooks 报 null dispatcher）
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    open: true,
  },
})
