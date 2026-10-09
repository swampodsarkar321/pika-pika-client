import { useEffect, useState } from 'react';
import { Crown, Building2, Power, KeyRound, BadgeCheck, XCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PageHead, Loading } from '../components/Layout';
import DonutChart from '../components/DonutChart';

export default function Admin() {
  const { token, demo } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(demo ? false : null);
  const [ov, setOv] = useState<any>(null);
  const [wss, setWss] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [keyFor, setKeyFor] = useState<string | null>(null);
  const [keyVal, setKeyVal] = useState('');
  const [keyModel, setKeyModel] = useState('gemini-3.5-flash-lite');

  const ws = () => '';

  async function load() {
    if (demo || !token) return;
    try {
      await api('/api/admin/me', { token });
      setAllowed(true);
      const [o, w, c] = await Promise.all([
        api<any>('/api/admin/overview', { token }),
        api<any>('/api/admin/workspaces', { token }),
        api<any>('/api/admin/claims?status=pending', { token }),
      ]);
      setOv(o);
      setWss(w.workspaces ?? []);
      setPlans(w.plans ?? []);
      setClaims(c.claims ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);
  void ws;

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

  if (demo) return (<div><PageHead title="Super Admin" /><div className="card p-8 text-center text-sm text-slate-500">The admin panel is hidden in demo mode. Sign in to continue.</div></div>);
  if (allowed === null) return <Loading label="admin check" />;
  if (!allowed) return (<div><PageHead title="Super Admin" /><div className="card flex items-center gap-2 border-red-200 bg-red-50 p-6 text-sm text-red-700"><ShieldAlert size={18} /> Super-admin only. {msg}</div></div>);

  const planCount = (id: string) => wss.filter((w) => w.planId === id).length;

  return (
    <div>
      <PageHead title="Super Admin" sub="S seller control room — plans, keys, claims, suspend" />
      {msg && <div className="card mb-3 p-3 text-sm">{msg}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Workspaces', value: ov?.workspaces ?? 0, g: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
          { label: 'Live pages', value: ov?.connectedPages ?? 0, g: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
          { label: 'Conversations', value: ov?.conversations ?? 0, g: 'linear-gradient(135deg,#8b5cf6,#d946ef)' },
          { label: 'Orders', value: ov?.orders ?? 0, g: 'linear-gradient(135deg,#10b981,#0ea5e9)' },
          { label: 'Pending claims', value: ov?.pendingClaims ?? 0, g: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
          { label: 'AI this month', value: ov?.aiRepliesThisMonth ?? 0, g: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
        ].map((s) => (
          <div key={s.label} className="card overflow-hidden p-0" >
            <div className="h-1.5" style={{ backgroundImage: s.g }} />
            <div className="p-4">
              <div className="text-xs font-medium text-slate-500">{s.label}</div>
              <div className="mt-1 text-[26px] font-black">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Building2 size={16} /> Workspaces</div>
          <div className="mt-2">
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
          <div className="mt-4 space-y-2.5">
            {wss.map((w) => (
              <div key={w.id} className={`rounded-2xl border p-3.5 ${w.suspended ? 'border-red-300 bg-red-50/60 dark:bg-red-950/20' : 'border-slate-100 dark:border-slate-800'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Crown size={15} className="text-amber-500" />
                  <span className="text-sm font-semibold">{w.businessName ?? w.name ?? w.id}</span>
                  {w.suspended && <span className="badge bg-red-500 text-white">suspended</span>}
                  <span className="badge bg-slate-100 text-slate-600">{w.plan} · {w.conversations} chats · {w.orders} orders · AI {w.aiThisMonth}</span>
                  {w.hasCustomKey && <span className="badge bg-emerald-100 text-emerald-800">key {w.customKeyMask}</span>}
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
                <div className="mt-1 font-mono text-[10px] text-slate-400">{w.id} · {w.pages?.length ?? 0} pages · {w.members ?? 0} members</div>
              </div>
            ))}
            {!wss.length && <div className="text-sm text-slate-500">No workspaces yet.</div>}
          </div>
        </div>

        <div className="card h-fit p-5">
          <div className="text-sm font-semibold">💰 Payment claims (pending: {claims.length})</div>
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
            {!claims.length && <div className="text-xs text-slate-500">Kono pending claim nai. Verify korle package auto-active hoy.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
