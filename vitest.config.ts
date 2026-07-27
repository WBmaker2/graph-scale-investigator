import { defineConfig } from 'vitest/config'
import path from 'node:path'

// 사양서 16절 검증: lib/ 순수 함수 단위 테스트 + 콘텐츠 일치성 검증 + 컴포넌트 렌더링
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    // 노드 테스트는 기본 환경, 컴포넌트 테스트는 doc block으로 jsdom 지정
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
})
