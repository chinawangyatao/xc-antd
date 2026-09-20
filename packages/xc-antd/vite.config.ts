import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'XcAntd',
      formats: ['es', 'cjs'],
      fileName: 'xc-antd',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'antd',
        '@ant-design/icons',
        'react-advanced-cropper',
        'react-quill-new',
        '@uiw/react-amap',
        'qrcode.react',
        'xgplayer',
        'xgplayer-flv',
        'xgplayer-hls',
        'xgplayer-mp4',
        'xgplayer-music',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
        },
      },
    },
    cssCodeSplit: false,
  },
})
