/** True in `npm run dev`, false in production builds. */
export const SHOW_DEVTOOLS = import.meta.env.DEV

/** True while the app runs on the in-browser mock backend (no Firebase). */
export const IS_MOCK_BACKEND = (import.meta.env.VITE_DATA_SOURCE ?? 'mock') === 'mock'
