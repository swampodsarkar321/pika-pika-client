import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Facebook, Inbox, GraduationCap, Settings, Users, BarChart3,
  ShieldCheck, CreditCard, UserCog, Moon, Sun, Menu, X, FlaskConical, LogOut, Bell,
  ShoppingBag, Megaphone, Crown, Search, Zap, Package, Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../lib/brand';
import { API_URL, api } from '../lib/api';
import CommandPalette from './CommandPalette';
import PageLoader from './PageLoader';

export function NotifyBell() {
  const { token, demo } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    if (demo || !token) return;
    try {
      const ws = localStorage.getItem('workspaceId');
      if (!ws) return;
      const r = await api<any>(`/api/notifications?workspaceId=${ws}`, { token });
      setItems(r.notifications ?? []);
      setUnread(r.unread ?? 0);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function markAll() {
    if (demo || !token) return;
    try {
      await api('/api/notifications/read', { method: 'POST', token, body: { workspaceId: localStorage.getItem('workspaceId') } });
      setUnread(0);
      setItems((l) => l.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  }

  const label = (n: any) =>
    n.kind === 'new_order' ? `🧾 New order ${n.orderId ?? ''}` :
    n.kind === 'handover' ? `🙋 Handover (${n.reason ?? 'needed'})` :
    n.kind === 'payment_claim' ? `💰 Payment claim (${n.package ?? ''})` : n.kind;

  return (
    <div className="relative">
      <button className="btn-ghost relative !px-2.5" aria-label="Notifications" onClick={() => { setOpen(!open); if (!open) load(); }}>
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 z-40 mt-2 w-80 p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-semibold">Notifications</span>
              <button className="text-xs text-indigo-600" onClick={markAll}>Mark all read</button>
            </div>
            <div className="max-h-80 overflow-auto">
              {items.map((n: any) => (
                <div key={n.id} className={`rounded-xl px-2.5 py-2 text-xs ${n.read ? 'text-slate-500' : 'bg-indigo-50 font-medium dark:bg-indigo-950'}`}>
                  {label(n)}
                  <div className="text-[10px] text-slate-400">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                </div>
              ))}
              {!items.length && <div className="p-4 text-center text-xs text-slate-500">No notifications yet.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const navGroups = [
  {
    label: 'Main',
    links: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/inbox', label: 'Inbox', icon: Inbox },
      { to: '/pages', label: 'Facebook Pages', icon: Facebook },
      { to: '/orders', label: 'Orders', icon: ShoppingBag },
    ],
  },
  {
    label: 'Manage',
    links: [
      { to: '/broadcast', label: 'Broadcast', icon: Megaphone },
      { to: '/training', label: 'AI Training', icon: GraduationCap },
      { to: '/bot', label: 'Bot Settings', icon: Settings },
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/team', label: 'Team & Access', icon: ShieldCheck },
      { to: '/billing', label: 'Billing', icon: CreditCard },
      { to: '/simulator', label: 'Simulator', icon: FlaskConical },
      { to: '/account', label: 'Account', icon: UserCog },
    ],
  },
];

export function PlanBadge() {
  const { token, demo } = useAuth();
  const [plan, setPlan] = useState<string | null>(null);
  const ws = typeof window !== 'undefined' ? localStorage.getItem('workspaceId') : null;

  useEffect(() => {
    if (demo || !token || !ws) {
      setPlan(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const r = await api<any>(`/api/workspaces/${ws}?workspaceId=${ws}`, { token });
        if (alive) setPlan(r.workspace?.planId ?? 'free');
      } catch {
        if (alive) setPlan(null);
      }
    })();
    return () => { alive = false; };
  }, [demo, token, ws]);

  if (!plan) return null;
  const meta =
    plan === 'business'
      ? { label: 'Business', icon: Crown, cls: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200' }
      : plan === 'starter'
        ? { label: 'Starter', icon: Zap, cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' }
        : { label: 'Free', icon: Package, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
  return (
    <span className={`badge ${meta.cls}`} title={`Active plan: ${meta.label}`}>
      <meta.icon size={13} /> {meta.label}
    </span>
  );
}

export function PendingBanner() {
  const { demo, user, approved, profile } = useAuth();
  if (demo || !user || approved) return null;
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-300/60 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      <Clock size={17} className="mt-0.5 shrink-0" />
      <div>
        <div className="font-bold">Account pending approval{profile?.displayName ? ` — ${profile.displayName}` : ''}</div>
        <div className="mt-0.5 text-xs opacity-90">Super-admin approve korle workspace create, Pages connect o Bot full unlock hobe. Ekhon dashboard limited view te dekhte paro.</div>
      </div>
    </div>
  );
}

export function ModeBadge() {
  const { demo, setDemo, user } = useAuth();
  return (
    <button
      onClick={() => setDemo(!demo)}
      title="Toggle demo / production mode"
      className={`badge ${demo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} dark:bg-opacity-20`}
    >
      <span className={`h-2 w-2 rounded-full ${demo ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      {demo ? 'Demo mode — sample data' : user ? 'Production — live workspace' : 'Production — sign in required'}
    </button>
  );
}

function Sidebar({ onNav }: { onNav?: () => void }) {
  const { logout, user, token, demo } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token || demo) {
      setIsAdmin(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } });
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [token, demo]);
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-3 text-white shadow-lg shadow-indigo-500/30">
        {BRAND.logoUrl ? (
          <img src={BRAND.logoUrl} alt={BRAND.name} className="h-10 w-10 rounded-xl bg-white/20 object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-black backdrop-blur">{BRAND.initial}</div>
        )}
        <div>
          <div className="font-bold leading-tight">{BRAND.name}</div>
          <div className="text-[11px] text-white/80">{BRAND.tagline}</div>
        </div>
      </div>
      {navGroups.map((g) => (
        <div key={g.label} className="mt-1 first:mt-0">
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{g.label}</div>
          <div className="space-y-0.5">
            {g.links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={(l as any).end}
                onClick={onNav}
                className={({ isActive }) => `navlink ${isActive ? 'navlink-active' : 'navlink-idle'}`}
              >
                <l.icon size={18} /> {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      {isAdmin && (
        <NavLink to="/admin" onClick={onNav} className={({ isActive }) => `navlink ${isActive ? 'navlink-active' : 'navlink-idle'} !mt-1 border border-amber-300/60`}>
          <Crown size={18} className="text-amber-500" /> Super Admin
        </NavLink>
      )}
      <div className="mt-auto border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="truncate px-2">{user?.email ?? 'Not signed in'}</div>
        {user && (
          <button
            onClick={async () => { await logout(); nav('/login'); }}
            className="btn-ghost mt-2 w-full justify-center text-xs"
          >
            <LogOut size={14} /> Sign out
          </button>
        )}
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('pp-theme') === 'dark');
  const [palette, setPalette] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    localStorage.setItem('pp-theme', dark ? 'dark' : 'light');
  }, [dark ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f4f5fb] dark:bg-[#0a0f1e] dark:text-slate-100">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="orb left-[-80px] top-[-80px] h-64 w-64 bg-indigo-300 dark:bg-indigo-900" />
          <div className="orb right-[-60px] top-[30%] h-56 w-56 bg-fuchsia-200 dark:bg-fuchsia-950" />
        </div>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/60 bg-white/75 px-4 py-2.5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <button className="btn-ghost !px-2.5 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <ModeBadge />
          <PlanBadge />
          <button onClick={() => setPalette(true)} className="btn-ghost ml-1 hidden !py-2 text-xs text-slate-400 md:inline-flex">
            <Search size={14} /> Search or command… <kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-800">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <NotifyBell />
            <button className="btn-ghost !px-2.5" onClick={() => setDark(!dark)} aria-label="Theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <CommandPalette open={palette} setOpen={setPalette} />
        <PageLoader />
        <div className="flex">
          <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-[260px] shrink-0 border-r border-white/60 bg-white/70 p-1 backdrop-blur-xl lg:block dark:border-slate-800 dark:bg-slate-900/70">
            <Sidebar />
          </aside>
          {open && (
            <div className="fixed inset-0 z-30 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900">
                <Sidebar onNav={() => setOpen(false)} />
              </aside>
            </div>
          )}
          <main key={loc.pathname} className="animate-enter min-w-0 flex-1 p-4 md:p-6"><PendingBanner />{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg shadow-indigo-500/30" style={{ backgroundImage: 'linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef)' }}>
        <span className="text-lg font-black">{title.slice(0, 1)}</span>
      </div>
      <div>
        <h1 className="text-xl font-black tracking-tight md:text-2xl">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      {actions && <div className="ml-auto flex gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ title, sub, icon }: { title: string; sub?: string; icon?: ReactNode }) {
  return (
    <div className="card relative overflow-hidden p-10 text-center">
      <div className="orb left-1/2 top-[-60px] h-40 w-40 -translate-x-1/2 bg-indigo-200 dark:bg-indigo-900" />
      <div className="relative">
        {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">{icon}</div>}
        <div className="text-sm font-bold">{title}</div>
        {sub && <div className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <div className="space-y-3">
      <div className="skeleton h-9 w-48" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
      </div>
      <div className="skeleton h-40" />
      <span className="sr-only">Loading… {label ?? ''}</span>
    </div>
  );
}
