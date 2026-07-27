/**
 * Vitest jsdom 환경 setup.
 * jsdom에 구현되지 않은 브라우저 API를 mock한다 (scrollIntoView, clipboard 등).
 * 사양서 16.3절 UI 테스트가 실제 브라우저 의존 없이 동작하도록.
 */
import { vi } from 'vitest'

// scrollIntoView — jsdom 미구현
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn()
}

// Clipboard API — jsdom 미구현
if (typeof navigator !== 'undefined' && !navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  })
}

// matchMedia — prefers-reduced-motion 테스트용
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
