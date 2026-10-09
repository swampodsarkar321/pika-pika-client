import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, UserCheck, Play, StickyNote, Search, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { demoConversations, demoMessages } from '../lib/demoData';
import { PageHead } from '../components/Layout';

interface Msg {
  id: string;
  sender: string;
  text: string;
  createdAt: number;
  internal?: boolean;
}

export default function Inbox() {
  const { token, demo, logout, user } = useAuth();
  const nav = useNavigate();
  const [convs, setConvs] = useState<any[]>(demo ? demoConversations : []);
  const [active, setActive] = useState<string | null>(demo ? demoConversations[0].id : null);
  const [msgs, setMsgs] = useState<Msg[]>(demo ? demoMessages[demoConversations[0].id] ?? [] : []);
  const [composer, setComposer] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  async function loadConvs() {
    if (demo || !token) return;
    setErr('');
    try {
      const r = await api<any>(`/api/conversations?workspaceId=${ws()}&status=${filter}&search=${encodeURIComponent(search)}`);
      setConvs(r.conversations ?? []);
      if (!active && r.conversations?.length) setActive(r.conversations[0].id);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load');
    }
  }

  async function loadMsgs(id: string) {
    if (demo) {
      setMsgs(demoMessages[id] ?? []);
      return;
    }
    if (!token) return;
    const r = await api<any>(`/api/conversations/${id}/messages?workspaceId=${ws()}`);
    setMsgs(r.messages ?? []);
  }

  useEffect(() => {
    if (demo) {
      setConvs(demoConversations);
      setActive(demoConversations[0].id);
      setMsgs(demoMessages[demoConversations[0].id]);
    } else {
      loadConvs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token, filter]);

  useEffect(() => {
    if (active) loadMsgs(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Live polling: new Messenger messages appear without manual refresh.
  const pollRef = useRef({ convs: loadConvs, msgs: loadMsgs, active });
  pollRef.current = { convs: loadConvs, msgs: loadMsgs, active };
  const threadRef = useRef<HTMLDivElement | null>(null);
  const lastCount = useRef(0);
  useEffect(() => {
    // Auto-scroll only when new messages arrive (never yank while reading history)
    if (msgs.length > lastCount.current && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
    lastCount.current = msgs.length;
  }, [msgs]);
  useEffect(() => {
    if (demo) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      pollRef.current.convs();
      if (pollRef.current.active) pollRef.current.msgs(pollRef.current.active);
    }, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  const activeConv = useMemo(() => convs.find((c) => c.id === active), [convs, active]);

  async function send(action: 'reply' | 'handover' | 'resume' | 'note' | 'resolve' | 'reopen') {
    if (demo) {
      if (action === 'reply' && composer.trim()) {
        setMsgs((m) => [...m, { id: `t${Date.now()}`, sender: 'agent', text: composer, createdAt: Date.now() }]);
        setComposer('');
      }
      return;
    }
    if (!active || !token) return;
    if (action === 'reply') {
      const r = await api<any>(`/api/conversations/${active}/reply`, { method: 'POST', token, body: { workspaceId: ws(), text: composer } });
      if (r.forwardError) alert(`Saved, but Messenger forward failed: ${r.forwardError}`);
      setComposer('');
    } else if (action === 'handover') {
      await api(`/api/conversations/${active}/handover`, { method: 'POST', token, body: { workspaceId: ws(), reason: 'manual_takeover' } });
    } else if (action === 'resume') {
      await api(`/api/conversations/${active}/resume`, { method: 'POST', token, body: { workspaceId: ws() } });
    } else if (action === 'note' && note.trim()) {
      await api(`/api/conversations/${active}/notes`, { method: 'POST', token, body: { workspaceId: ws(), text: note } });
      setNote('');
    } else if (action === 'resolve' || action === 'reopen') {
      await api(`/api/conversations/${active}/status`, { method: 'PATCH', token, body: { workspaceId: ws(), status: action === 'resolve' ? 'resolved' : 'open' } });
    }
    loadMsgs(active);
    loadConvs();
  }

  return (
    <div>
      <PageHead title="Inbox" sub={demo ? 'Demo threads — sign in for the live inbox.' : 'Customer conversations across connected Pages'} />
      {err && (
        <div className="card mb-3 flex flex-wrap items-center gap-3 border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>⚠️ {err}{user ? ` (logged in as ${user.email})` : ' (not logged in)'}</span>
          <button
            className="btn-primary !py-1 text-xs"
            onClick={async () => {
              await logout();
              nav('/login');
            }}
          >
            <LogIn size={14} /> Sign in again
          </button>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="card overflow-hidden">
          <div className="flex gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input className="input !pl-8" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadConvs()} />
            </div>
            <select className="input !w-28" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="waiting_human">Human</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="max-h-[60vh] overflow-auto">
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-center gap-3 border-b border-slate-100/70 px-3 py-3 text-left transition hover:bg-indigo-50/60 dark:border-slate-800 dark:hover:bg-slate-800/70 ${active === c.id ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-xs font-black text-white shadow-md shadow-indigo-500/30">
                  {(c.customerName ?? c.psid ?? '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{c.customerName ?? `PSID …${String(c.psid ?? '').slice(-4)}`}</span>
                    {c.unread > 0 && <span className="badge bg-indigo-600 text-white">{c.unread}</span>}
                  </div>
                  <div className="truncate text-xs text-slate-500">{c.lastMessage}</div>
                </div>
                <span className={`badge ${c.status === 'waiting_human' ? 'bg-amber-100 text-amber-800' : c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{c.status}</span>
              </button>
            ))}
            {!convs.length && <div className="p-6 text-center text-sm text-slate-500">No conversations yet.</div>}
          </div>
        </div>

        <div className="card flex min-h-[50vh] flex-col">
          {!activeConv ? (
            <div className="p-8 text-center text-sm text-slate-500">Select a conversation.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
                <div className="font-medium">{activeConv.customerName ?? 'Messenger customer'}</div>
                <span className="badge bg-slate-100 text-slate-600">{activeConv.status}</span>
                <div className="ml-auto flex flex-wrap gap-1.5">
                  <button className="btn-ghost !py-1 text-xs" onClick={() => send('handover')}><UserCheck size={14} /> Take over</button>
                  <button className="btn-ghost !py-1 text-xs" onClick={() => send('resume')}><Play size={14} /> Resume AI</button>
                  <button className="btn-ghost !py-1 text-xs" onClick={() => send(activeConv.status === 'resolved' ? 'reopen' : 'resolve')}>
                    {activeConv.status === 'resolved' ? 'Reopen' : 'Resolve'}
                  </button>
                </div>
              </div>
              <div ref={threadRef} className="flex-1 space-y-2.5 overflow-auto bg-gradient-to-b from-transparent to-indigo-50/40 p-4 dark:to-indigo-950/20">
                {msgs.filter((m) => !m.internal).map((m) => (
                  <div key={m.id} className={`max-w-[80%] ${m.sender === 'customer' ? 'bubble-in' : m.sender === 'agent' ? 'bubble-out ml-auto' : 'bubble-bot ml-auto'}`}>
                    {m.text}
                  </div>
                ))}
                {msgs.filter((m) => m.internal).map((m) => (
                  <div key={m.id} className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">📝 {m.text}</div>
                ))}
              </div>
              <div className="space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
                <div className="flex gap-2">
                  <input className="input" placeholder="Reply as human… (pauses AI for this thread)" value={composer} onChange={(e) => setComposer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send('reply')} />
                  <button className="btn-primary" onClick={() => send('reply')}><Send size={15} /></button>
                </div>
                <div className="flex gap-2">
                  <input className="input" placeholder="Internal note (never sent to customer)…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn-ghost text-xs" onClick={() => send('note')}><StickyNote size={14} /> Save</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
