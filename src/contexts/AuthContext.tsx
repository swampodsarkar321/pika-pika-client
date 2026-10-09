import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, type User } from 'firebase/auth';
import { auth, firebaseConfigured, DEMO_DEFAULT } from '../lib/firebase';
import { API_URL } from '../lib/api';

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  demo: boolean;
  setDemo: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reset: (email: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState<boolean>(!firebaseConfigured || DEMO_DEFAULT);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setToken(u ? await u.getIdToken() : null);
      if (u) setDemo(false);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Auto-select first workspace after login so users never have to re-create it.
  useEffect(() => {
    if (!user || !token || localStorage.getItem('workspaceId')) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/workspaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.workspaces?.length) {
          localStorage.setItem('workspaceId', data.workspaces[0].id);
        }
      } catch {
        /* ignore — user can pick from Account page */
      }
    })();
  }, [user, token]);
  useEffect(() => {
    if (!auth || !user) return;
    let alive = true;
    const refresh = async () => {
      try {
        const t = await user.getIdToken(true);
        if (alive) setToken(t);
      } catch {
        /* keep old token; next retry or re-login will fix */
      }
    };
    const id = setInterval(refresh, 45 * 60 * 1000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [user]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      token,
      loading,
      demo,
      setDemo,
      async login(email, password) {
        if (!auth) throw new Error('Firebase is not configured — stay in demo mode or add VITE_FIREBASE_* keys.');
        await signInWithEmailAndPassword(auth, email, password);
      },
      async register(email, password) {
        if (!auth) throw new Error('Firebase is not configured.');
        await createUserWithEmailAndPassword(auth, email, password);
      },
      async logout() {
        if (auth) await signOut(auth);
        setUser(null);
        setToken(null);
      },
      async reset(email) {
        if (!auth) throw new Error('Firebase is not configured.');
        await sendPasswordResetEmail(auth, email);
      },
    }),
    [user, token, loading, demo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
