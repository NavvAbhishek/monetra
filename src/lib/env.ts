/** True in `npm run dev`, false in production builds and in Vitest. */
export const SHOW_DEVTOOLS = import.meta.env.DEV && import.meta.env.MODE !== 'test'

/** True while the app runs on the in-browser mock backend (no Firebase). */
export const IS_MOCK_BACKEND = (import.meta.env.VITE_DATA_SOURCE ?? 'mock') === 'mock'
