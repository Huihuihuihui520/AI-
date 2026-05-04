import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: '临床麻醉助手 (Clinical Anesthesia Assistant)',
        short_name: '麻醉助手',
        description: '专业的临床麻醉评估与辅助工具',
        theme_color: '#2563eb',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/dashscope': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/dashscope/, '');
          console.log('[Vite Proxy]', path, '→', `https://dashscope.aliyuncs.com${newPath}`);
          return newPath;
        }
      },
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/gemini/, '');
          console.log('[Vite Proxy]', path, '→', `https://generativelanguage.googleapis.com${newPath}`);
          return newPath;
        }
      }
    }
  }
})
