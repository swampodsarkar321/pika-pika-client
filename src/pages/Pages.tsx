import { useEffect, useState } from 'react';
import { Facebook, Unplug, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { demoPages } from '../lib/demoData';
import { PageHead, Empty } from '../components/Layout';

export default function Pages() {
  const { token, demo } = useAuth();
  const [connected, setConnected] = useState<any[]>(demo ? demoPages : []);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [live, setLive] = useState(demo ? true : false);
  const [msg, setMsg] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  async function refresh() {
    if (demo || !token) return;
    try {
      const r = await api<any>(`/api/facebook/pages?workspaceId=${ws()}`, { token });
      setConnected(r.connected ?? []);
      setCandidates(r.candidates ?? []);
      setLive(Boolean(r.liveMessaging));
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    if (demo) {
      setConnected(demoPages);
      setLive(true);
    } else {
      setConnected([]);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function connect() {
    setMsg('');
    if (!ws()) {
      setMsg('Please create a workspace from the Account page first — connection requires a workspace.');
      return;
    }
    try {
      const r = await api<any>(`/api/facebook/connect?workspaceId=${ws()}`, { token });
      window.location.href = r.url;
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  async function confirm(pageId: string, pageName?: string) {
    setMsg('');
    try {
      await api(`/api/facebook/pages/confirm`, { method: 'POST', token, body: { workspaceId: ws(), pageId, pageName } });
      setMsg('Page verified and subscribed.');
      refresh();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  async function disconnect(pageId: string) {
    try {
      await api(`/api/facebook/pages/${pageId}/disconnect`, { method: 'POST', token, body: { workspaceId: ws() } });
      refresh();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <PageHead
        title="Facebook Pages"
        sub={demo ? 'Demo preview — connect a workspace for the real Meta OAuth flow.' : live ? 'Live messaging is active for subscribed Pages.' : 'No verified live connection yet.'}
        actions={<button className="btn-primary" onClick={connect} disabled={demo}><Facebook size={16} /> Connect Page</button>}
      />
      {msg && <div className="card mb-3 p-3 text-sm">{msg}</div>}
      {!connected.length && !candidates.length ? (
        <Empty title="No Pages connected" sub="Click Connect Page to authorize via the official Meta flow. Entering a Page ID alone never counts as connected." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {connected.map((p: any) => (
            <div key={p.pageId} className="card relative overflow-hidden p-5">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 to-teal-500" />
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30"><Facebook size={18} /></span>
                <div>
                  <div className="font-bold">{p.pageName ?? p.pageId}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={14} /> {p.subscribed ? 'Subscribed — live' : 'Stored (not subscribed)'}</div>
                </div>
              </div>
              {!demo && (
                <button className="btn-ghost mt-3 text-xs" onClick={() => disconnect(p.pageId)}>
                  <Unplug size={14} /> Disconnect
                </button>
              )}
            </div>
          ))}
          {candidates.map((c: any) => (
            <div key={c.id} className="card relative overflow-hidden p-5">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400 to-orange-500" />
              <div className="font-bold">{c.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">Authorized — needs verification & subscription</div>
              <button className="btn-primary mt-3 text-xs" onClick={() => confirm(c.id, c.name)}>Verify & subscribe</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
