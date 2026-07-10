import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const buildTime = new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit'
})

export default defineConfig({
  plugins: [vue()],
  base: process.env.VERCEL ? '/' : '/photo-mosaic/',
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime)
  }
})
