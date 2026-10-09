import { useEffect, useMemo, useState } from 'react';
import { Crown, Building2, Power, KeyRound, BadgeCheck, XCircle, ShieldAlert, UserCheck, Users, LayoutDashboard, Wallet, Search, Server, RefreshCw, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, API_URL } from '../lib/api';
import { PageHead, Loading } from '../components/Layout';
import DonutChart from '../components/DonutChart';
import Sparkline from '../components/Sparkline';

type TabId = 'overview' | 'approvals' | 'clients' | 'payments' | 'server';

export default function Admin() {
  const { token, demo } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(demo ? false : null);
  const [tab, setTab] = useState<TabId>('overview');
  const [ov, setOv] = useState<any>(null);
  const [wss, setWss] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [backend, setBackend] = useState<{ ok: boolean; ms: number; at: number } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [latency, setLatency] = useState<number[]>([]);
  const [pinging, setPinging] = useState(false);
  const [userFilter, setUserFilter] = useState('pending');
  const [clientQuery, setClientQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [keyFor, setKeyFor] = useState<string | null>(null);
  const [keyVal, setKeyVal] = useState('');
  const [keyModel, setKeyModel] = useState('gemini-3.5-flash-lite');

  async function checkBackend() {
    try {
      const t0 = performance.now();
      const hr = await fetch(`${API_URL}/health`);
      const ms = Math.round(performance.now() - t0);
      setBackend({ ok: hr.ok, ms, at: Date.now() });
      setLatency((l) => [...l.slice(-19), ms]);
    } catch {
      setBackend({ ok: false, ms: -1, at: Date.now() });
    }
  }

  async function pingNow() {
    setPinging(true);
    await checkBackend();
    setPinging(false);
  }

  async function load() {
    if (demo || !token) return;
    try {
      await api('/api/admin/me', { token });
      setAllowed(true);
      const [o, w, c, u] = await Promise.all([
        api<any>('/api/admin/overview', { token }),
        api<any>('/api/admin/workspaces', { token }),
        api<any>('/api/admin/claims?status=pending', { token }),
        api<any>('/api/admin/users?status=all', { token }).catch(() => ({ users: [] })),
      ]);
      setOv(o);
      setWss(w.workspaces ?? []);
      setPlans(w.plans ?? []);
      setClaims(c.claims ?? []);
      setUsers(u.users ?? []);
      await checkBackend();
    } catch (e: any) {
      setAllowed(false);
      setMsg(e.message);
    }
  }

  useEffect(() => {
    if (demo) {
      setAllowed(false);
      return;
    }
    load();
    // Realtime backend status — re-ping every 30s while the panel is open
    const t = setInterval(checkBackend, 30_000);
    // Tick every 5s so the "checked Xs ago" label stays live
    const tick = setInterval(() => setNow(Date.now()), 5_000);
    return () => { clearInterval(t); clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function act(path: string, method: string, body?: any) {
    if (!token) return;
    setMsg('');
    try {
      await api(path, { method, token, body });
      setMsg('✅ Done');
      load();
    } catch (e: any) {
      setMsg(`⚠️ ${e.message}`);
    }
  }

  async function approveUser(uid: string, approved: boolean) {
    if (!token) return;
    setMsg('');
    try {
      await api(`/api/admin/users/${uid}/approval`, { method: 'PATCH', token, body: { approved } });
      setMsg(approved ? '✅ User approved — full client panel unlocked' : '⏸️ Approval revoked — limited view only');
      load();
    } catch (e: any) {
      setMsg(`⚠️ ${e.message}`);
    }
  }

  const pendingUsers = useMemo(() => users.filter((u: any) => !u.approved), [users]);
  const shownUsers = userFilter === 'pending' ? pendingUsers : userFilter === 'approved' ? users.filter((u: any) => u.approved) : users;
  const shownClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return wss;
    return wss.filter((w: any) =>
      [w.businessName, w.name, w.id, w.ownerName, w.ownerEmail, w.plan]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q)),
    );
  }, [wss, clientQuery]);

  if (demo) return (<div><PageHead title="Super Admin" /><div className="card p-8 text-center text-sm text-slate-500">The admin panel is hidden in demo mode. Sign in to continue.</div></div>);
  if (allowed === null) return <Loading label="admin check" />;
  if (!allowed) return (<div><PageHead title="Super Admin" /><div className="card flex items-center gap-2 border-red-200 bg-red-50 p-6 text-sm text-red-700"><ShieldAlert size={18} /> Super-admin only. {msg}</div></div>);

  const planCount = (id: string) => wss.filter((w) => w.planId === id).length;

  const tabs: { id: TabId; label: string; icon: any; badge?: number; badgeTone?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Approvals', icon: Users, badge: pendingUsers.length, badgeTone: 'bg-amber-500 text-white' },
    { id: 'clients', label: 'Clients', icon: Building2, badge: wss.length, badgeTone: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
    { id: 'payments', label: 'Payments', icon: Wallet, badge: claims.length, badgeTone: 'bg-emerald-500 text-white' },
    { id: 'server', label: 'Server', icon: Server },
  ];

  const stats = [
    { label: 'Workspaces', value: ov?.workspaces ?? 0, g: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { label: 'Live pages', value: ov?.connectedPages ?? 0, g: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
    { label: 'Conversations', value: ov?.conversations ?? 0, g: 'linear-gradient(135deg,#8b5cf6,#d946ef)' },
    { label: 'Orders', value: ov?.orders ?? 0, g: 'linear-gradient(135deg,#10b981,#0ea5e9)' },
    { label: 'Pending claims', value: ov?.pendingClaims ?? 0, g: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { label: 'AI this month', value: ov?.aiRepliesThisMonth ?? 0, g: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  ];

  return (
    <div>
      <PageHead title="Super Admin" sub="Seller control room — approvals, plans, keys, claims, suspend" />
      {msg && <div className="card mb-3 p-3 text-sm">{msg}</div>}

      {/* Tab bar */}
      <div className="card mb-4 flex gap-1.5 overflow-x-auto p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              tab === t.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {typeof t.badge === 'number' && t.badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === t.id ? 'bg-white/25 text-white' : t.badgeTone}`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-enter">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {stats.map((s) => (
                <div key={s.label} className="card overflow-hidden p-0">
                  <div className="h-1.5" style={{ backgroundImage: s.g }} />
                  <div className="p-4">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
                    <div className="mt-1 text-[26px] font-black tabular-nums">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Building2 size={16} /> Plan distribution</div>
              <div className="mt-3 max-w-md">
                <DonutChart
                  slices={[
                    { label: 'Free', value: planCount('free'), color: '#94a3b8' },
                    { label: 'Starter', value: planCount('starter'), color: '#6366f1' },
                    { label: 'Business', value: planCount('business'), color: '#10b981' },
                  ]}
                  centerTop={String(wss.length)}
                  centerBottom="clients"
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-sm font-bold"><Users size={16} /> Client approvals</span>
              <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">pending: {pendingUsers.length}</span>
              <span className="ml-auto flex gap-1.5">
                {['pending', 'approved', 'all'].map((f) => (
                  <button key={f} onClick={() => setUserFilter(f)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${userFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{f}</button>
                ))}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Approving unlocks the full client panel (workspace, Pages, Bot) for the user.</p>
            <div className="mt-3 space-y-2">
              {shownUsers.map((u: any) => (
                <div key={u.uid} className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-xs ${u.approved ? 'border-slate-100 dark:border-slate-800' : 'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20'}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">{(u.displayName ?? u.email ?? '?').slice(0, 1).toUpperCase()}</span>
                  <span>
                    <span className="block text-sm font-semibold">{u.displayName ?? '(no name)'}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">{u.email ?? u.uid}</span>
                  </span>
                  {!u.approved && <span className="badge bg-amber-500 text-white">pending</span>}
                  {u.approved && <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">approved</span>}
                  <span className="ml-auto">
                    {!u.approved ? (
                      <button className="btn-primary !py-1.5 text-xs" onClick={() => approveUser(u.uid, true)}><UserCheck size={13} /> Approve</button>
                    ) : (
                      <button className="btn-ghost !py-1.5 text-xs" onClick={() => approveUser(u.uid, false)}>Revoke</button>
                    )}
                  </span>
                </div>
              ))}
              {!shownUsers.length && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">No users match this filter.</div>}
            </div>
          </div>
        )}

        {tab === 'clients' && (
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-sm font-bold"><Building2 size={16} /> Clients</span>
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{shownClients.length} / {wss.length}</span>
              <label className="ml-auto flex min-w-[200px] flex-1 items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs sm:max-w-xs dark:bg-slate-800">
                <Search size={13} className="shrink-0 text-slate-400" />
                <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Search name, email, plan…" className="w-full bg-transparent outline-none placeholder:text-slate-400" />
              </label>
            </div>
            <div className="mt-4 space-y-2.5">
              {shownClients.map((w) => (
                <div key={w.id} className={`rounded-2xl border p-3.5 ${w.suspended ? 'border-red-300 bg-red-50/60 dark:bg-red-950/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Crown size={15} className="text-amber-500" />
                    <span className="text-sm font-semibold">{w.businessName ?? w.name ?? w.id}</span>
                    {(w.ownerName || w.ownerEmail) && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">by {w.ownerName ?? w.ownerEmail}{w.ownerEmail && w.ownerName ? ` (${w.ownerEmail})` : ''}</span>
                    )}
                    {w.ownerApproved === false && <span className="badge bg-amber-500 text-white">owner pending</span>}
                    {w.suspended && <span className="badge bg-red-500 text-white">suspended</span>}
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{w.plan} · {w.conversations} chats · {w.orders} orders · AI {w.aiThisMonth}</span>
                    {w.hasCustomKey && <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">key {w.customKeyMask}</span>}
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <select
                      className="input !w-32 !py-1.5 text-xs"
                      value={w.planId}
                      onChange={(e) => act(`/api/admin/workspaces/${w.id}/plan`, 'PATCH', { planId: e.target.value })}
                    >
                      {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button className="btn-ghost !py-1.5 text-xs" onClick={() => act(`/api/admin/workspaces/${w.id}/suspend`, 'PATCH', { suspended: !w.suspended })}>
                      <Power size={13} /> {w.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    {keyFor === w.id ? (
                      <span className="flex flex-1 flex-wrap items-center gap-1.5">
                        <input className="input !w-44 !py-1.5 text-xs" placeholder="Paste client Gemini key" value={keyVal} onChange={(e) => setKeyVal(e.target.value)} />
                        <input className="input !w-40 !py-1.5 text-xs" placeholder="model" value={keyModel} onChange={(e) => setKeyModel(e.target.value)} />
                        <button className="btn-primary !py-1.5 text-xs" onClick={() => { act(`/api/admin/workspaces/${w.id}/key`, 'POST', { apiKey: keyVal, model: keyModel }); setKeyFor(null); setKeyVal(''); }}>Save</button>
                        <button className="btn-ghost !py-1.5 text-xs" onClick={() => setKeyFor(null)}>Cancel</button>
                      </span>
                    ) : (
                      <>
                        <button className="btn-ghost !py-1.5 text-xs" onClick={() => setKeyFor(w.id)}><KeyRound size={13} /> {w.hasCustomKey ? 'Change key' : 'Set key'}</button>
                        {w.hasCustomKey && (
                          <button className="btn-ghost !py-1.5 text-xs" onClick={() => act(`/api/admin/workspaces/${w.id}/key`, 'DELETE')}>Remove key</button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">{w.id} · {w.pages?.length ?? 0} pages · {w.members ?? 0} members</div>
                </div>
              ))}
              {!shownClients.length && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{wss.length ? 'No matches for this search.' : 'No workspaces yet.'}</div>}
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">💰 Payment claims <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">pending: {claims.length}</span></div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Verifying auto-activates the package.</p>
            <div className="mt-3 space-y-2">
              {claims.map((c: any) => (
                <div key={c.key} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/20">
                  <div className="font-semibold">{c.workspaceName} · {c.package}</div>
                  <div className="mt-0.5 text-slate-600 dark:text-slate-300">TrxID: <b>{c.trxId}</b> · From: {c.senderNumber}</div>
                  <div className="mt-2 flex gap-1.5">
                    <button className="btn-primary !py-1 text-[11px]" onClick={() => act(`/api/admin/claims/${c.key}/verify`, 'PATCH', { workspaceId: c.workspaceId, status: 'verified' })}>
                      <BadgeCheck size={13} /> Verify + activate
                    </button>
                    <button className="btn-ghost !py-1 text-[11px]" onClick={() => act(`/api/admin/claims/${c.key}/verify`, 'PATCH', { workspaceId: c.workspaceId, status: 'rejected' })}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
              {!claims.length && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">No pending claims. Verifying auto-activates the package.</div>}
            </div>
          </div>
        )}

        {tab === 'server' && (
          <div className="space-y-4">
            <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl md:p-8 ${backend?.ok === false ? 'shadow-red-500/25' : 'shadow-emerald-500/25'}`} style={{ backgroundImage: backend?.ok === false ? 'linear-gradient(130deg,#991b1b 0%,#dc2626 60%,#f59e0b 125%)' : 'linear-gradient(130deg,#065f46 0%,#059669 55%,#0ea5e9 125%)' }}>
              <div className="orb right-[-40px] top-[-60px] h-56 w-56 bg-white/25" />
              <div className="orb bottom-[-80px] left-[30%] h-48 w-48 bg-white/15" />
              <div className="relative flex flex-wrap items-center gap-5">
                <span className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-30 ${backend?.ok === false ? 'bg-red-300' : 'bg-emerald-200'}`} />
                  <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-white/20" style={{ animationDelay: '.6s' }} />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <Server size={26} />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/70">Backend status · live</div>
                  <div className="mt-0.5 text-3xl font-black tracking-tight">
                    {!backend ? 'Checking…' : backend.ok ? 'ONLINE' : 'UNREACHABLE'}
                  </div>
                  <div className="mt-1 text-sm text-white/80">
                    {backend?.ok
                      ? <>Response <b className="tabular-nums">{backend.ms}ms</b> · checked {Math.max(0, Math.round((now - backend.at) / 1000))}s ago · auto-refresh every 30s</>
                      : backend ? 'Server is ON but the browser cannot reach it — check the Render deploy and FRONTEND_URL (CORS).'
                      : 'Pinging server…'}
                  </div>
                </div>
                <button onClick={pingNow} disabled={pinging} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow transition hover:brightness-95 disabled:opacity-60">
                  <span className="flex items-center gap-1.5"><RefreshCw size={14} className={pinging ? 'animate-spin' : ''} /> {pinging ? 'Pinging…' : 'Ping now'}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card p-5">
                <div className="flex items-center gap-2 text-sm font-bold"><Activity size={16} /> Response time history</div>
                <div className="mt-3">
                  {latency.length > 1 ? (
                    <Sparkline data={latency} id="srv-lat" width={260} height={56} stroke={backend?.ok === false ? '#ef4444' : '#10b981'} />
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400">Collecting pings… keep this tab open.</div>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {latency.length ? <>Last {latency.length} pings · avg <b className="tabular-nums">{Math.round(latency.reduce((a, b) => a + b, 0) / latency.length)}ms</b></> : '—'}
                </div>
              </div>
              <div className="card p-5">
                <div className="text-sm font-bold">Connection details</div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Backend URL</span>
                    <span className="font-mono font-semibold">{API_URL.replace('https://', '')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Keep-alive</span>
                    <span className="font-semibold text-emerald-600">GitHub Action · every 5 min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Panel monitor</span>
                    <span className="font-semibold">every 30s while open</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
