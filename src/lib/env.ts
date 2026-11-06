/**
 * Developer tools (TanStack Query + Router floating buttons). OFF by default — even in `npm run dev`.
 * To turn them on while debugging, add `VITE_SHOW_DEVTOOLS=true` to .env.local and restart `npm run dev`.
 * They are never part of a production build.
 */
export const SHOW_DEVTOOLS = import.meta.env.DEV && import.meta.env.VITE_SHOW_DEVTOOLS === 'true'

/** True while the app runs on the in-browser mock backend (no Firebase). */
export const IS_MOCK_BACKEND = (import.meta.env.VITE_DATA_SOURCE ?? 'mock') === 'mock'
