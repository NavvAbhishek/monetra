import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia — used by use-mobile and responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom has no scrollTo — used by the router's scroll restoration
window.scrollTo = (() => {}) as typeof window.scrollTo

// jsdom has no ResizeObserver — Radix (checkbox inside a form, select, popover) uses it
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
