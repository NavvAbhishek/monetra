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
