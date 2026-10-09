import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
};

export const firebaseConfigured = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (firebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(cfg as any);
  auth = getAuth(app);
}

export { app, auth };
export const DEMO_DEFAULT = (import.meta.env.VITE_DEMO_MODE ?? 'true') !== 'false';

/** Fresh ID token straight from the Firebase session (bypasses stale React state). */
export async function getFreshToken(force = true): Promise<string | null> {
  try {
    const u = auth?.currentUser;
    if (!u) return null;
    return await u.getIdToken(force);
  } catch {
    return null;
  }
}
