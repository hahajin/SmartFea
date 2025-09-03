import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    // svgr({
    //   svgrOptions: {
    //     icon: true // 兼容 MUI 图标
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': '/src' // 保持与你的项目路径一致
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 保持原有 proxy 配置
        changeOrigin: true
      }
    }
  }
})