import type { AI } from 'firebase/ai'
import { type FirebaseApp, initializeApp } from 'firebase/app'
import { type Auth, getAuth } from 'firebase/auth'
import { type Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

/**
 * Firebase connection (CLAUDE.md §1, §5). Created on first use, so the mock backend never touches it.
 * Only `src/services/firebase/*` may import this file.
 */

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

const readConfig = () => {
  const env = import.meta.env
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  }
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(`Firebase config missing in .env.local: ${missing.join(', ')} (see .env.example)`)
  }
  return config
}

export const getFirebaseApp = (): FirebaseApp => (app ??= initializeApp(readConfig()))

export const getFirebaseAuth = (): Auth => (auth ??= getAuth(getFirebaseApp()))

/**
 * Firestore with the persistent offline cache (IndexedDB, shared by all tabs): pages load from the
 * cache, only changes are read from the server — keeps the app fast and well inside Spark quotas.
 */
export const getDb = (): Firestore =>
  (db ??= initializeFirestore(getFirebaseApp(), {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  }))

// ---------------------------- AI (spending assistant) --------------------------

let ai: Promise<AI> | undefined

declare global {
  // Read by the App Check SDK on localhost (a debug token registered in the Firebase console).
  var FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean | undefined
}

/** Is the assistant set up (App Check site key present)? Without it every AI request is refused. */
export const isAssistantConfigured = (): boolean => !!import.meta.env.VITE_RECAPTCHA_SITE_KEY

/**
 * Firebase AI Logic with the free Gemini Developer API (no billing account → stays on Spark).
 * App Check (Fraud Defense / reCAPTCHA Enterprise) proves requests come from this site, so nobody else
 * can use the free quota. Both are downloaded and started only when the assistant is first used, so other
 * pages never load them. On localhost the debug token from .env.local stands in for reCAPTCHA.
 */
export const getFirebaseAI = (): Promise<AI> =>
  (ai ??= (async () => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    if (!siteKey) throw new Error('VITE_RECAPTCHA_SITE_KEY is missing in .env.local')
    const [{ getAI, GoogleAIBackend }, { initializeAppCheck, ReCaptchaEnterpriseProvider }] = await Promise.all([
      import('firebase/ai'),
      import('firebase/app-check'),
    ])
    const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
    if (import.meta.env.DEV && debugToken) globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken
    const app = getFirebaseApp()
    initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(siteKey), isTokenAutoRefreshEnabled: true })
    return getAI(app, { backend: new GoogleAIBackend() })
  })().catch((error: unknown) => {
    ai = undefined // let the next question try again
    throw error
  }))
