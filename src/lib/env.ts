/** True in `npm run dev`, false in production builds and in Vitest. */
export const SHOW_DEVTOOLS = import.meta.env.DEV && import.meta.env.MODE !== 'test'
