import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, type User } from 'firebase/auth';
import { auth, firebaseConfigured, DEMO_DEFAULT } from '../lib/firebase';
import { API_URL, api } from '../lib/api';

export interface UserProfile {
  displayName: string | null;
  email: string | null;
  approved: boolean;
  createdAt: number | null;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  demo: boolean;
  setDemo: (v: boolean) => void;
  profile: UserProfile | null;
  approved: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function fetchProfile(t: string) {
    try {
      const r = await api<any>('/api/me', { token: t });
      const p = r.profile ?? null;
      setProfile(p ? {
        displayName: p.displayName ?? null,
        email: p.email ?? null,
        approved: p.approved !== false,
        createdAt: p.createdAt ?? null,
      } : null);
      setIsAdmin(Boolean(r.isAdmin));
    } catch {
      /* offline / backend down — keep previous profile */
    }
  }

  async function refreshProfile() {
    if (demo || !token) return;
    await fetchProfile(token);
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      const t = u ? await u.getIdToken() : null;
      setToken(t);
      if (u) {
        setDemo(false);
        if (t) await fetchProfile(t);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
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
      profile,
      approved: demo ? true : (profile?.approved !== false),
      isAdmin,
      refreshProfile,
      async login(email, password) {
        if (!auth) throw new Error('Firebase is not configured — stay in demo mode or add VITE_FIREBASE_* keys.');
        await signInWithEmailAndPassword(auth, email, password);
      },
      async register(name, email, password) {
        if (!auth) throw new Error('Firebase is not configured.');
        const clean = name.trim();
        if (clean.length < 2) throw new Error('Please enter your name (2+ characters).');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await updateProfile(cred.user, { displayName: clean });
        } catch {
          /* non-fatal — server profile is the source of truth */
        }
        try {
          const t = await cred.user.getIdToken();
          await api('/api/me/profile', { method: 'POST', token: t, body: { displayName: clean } });
        } catch {
          /* profile sync retry happens on next /api/me fetch */
        }
      },
      async logout() {
        if (auth) await signOut(auth);
        setUser(null);
        setToken(null);
        setProfile(null);
        setIsAdmin(false);
      },
      async reset(email) {
        if (!auth) throw new Error('Firebase is not configured.');
        await sendPasswordResetEmail(auth, email);
      },
    }),
    [user, token, loading, demo, profile, isAdmin],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
