import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// 사양서 6.1: 서버 없이 브라우저에서 결정적으로 실행 → 정적 빌드
// GitHub Pages: https://wbmaker2.github.io/graph-scale-investigator/ 에 서빙되므로
// base를 저장소 경로로 설정 (dev 서버일 때는 '/' 사용)
const isDev = process.env.NODE_ENV !== 'production'
export default defineConfig({
  plugins: [react()],
  base: isDev ? '/' : '/graph-scale-investigator/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
})
