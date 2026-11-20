/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'mock' (default, no Firebase needed) or 'firebase'. */
  readonly VITE_DATA_SOURCE?: 'mock' | 'firebase'
  /** 'true' shows the TanStack devtools in `npm run dev` (off by default). */
  readonly VITE_SHOW_DEVTOOLS?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** Fraud Defense (reCAPTCHA Enterprise) key ID for App Check — the assistant needs it. Public. */
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  /** App Check debug token, localhost only (never in GitHub). */
  readonly VITE_APPCHECK_DEBUG_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
