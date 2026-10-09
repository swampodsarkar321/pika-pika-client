import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PageHead } from '../components/Layout';

export default function Simulator() {
  const { token, demo } = useAuth();
  const [message, setMessage] = useState('আসসালামু আলাইকুম, কুরিয়ার চার্জ কত?');
  const [log, setLog] = useState<any[]>(demo ? [] : []);
  const [out, setOut] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? undefined;

  async function run() {
    if (demo || !token) {
      const reply = message.includes('refund') || message.includes('human')
        ? 'Thanks — I’ve flagged this for our team (simulated handover).'
        : 'ওয়ালাইকুম আসসালাম! ঢাকার ভিতরে ৬০ টাকা, বাইরে ১২০ টাকা। (simulated)';
      setOut(reply);
      setLog((l) => [...l, { in: message, out: reply, at: new Date().toLocaleTimeString() }].slice(-20));
      return;
    }
    try {
      const r = await api<any>('/api/dev/simulate', { method: 'POST', token, body: { workspaceId: ws(), message } });
      setOut(r.reply);
      setLog((l) => [...l, { in: message, out: r.reply, handover: r.handover, matched: r.matchedKnowledge, ai: r.ai, at: new Date().toLocaleTimeString() }].slice(-20));
    } catch (e: any) {
      setOut(`Error: ${e.message}`);
    }
  }

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const s = await api<any>('/api/dev/status');
        console.info('[simulator] backend status', s);
      } catch { /* offline */ }
    })();
  }, [token]);

  return (
    <div>
      <PageHead title="Development Simulator" sub="Clearly labelled simulated events — never treated as real Facebook activity." />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="card relative h-fit overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-violet-500 to-fuchsia-500" />
          <div className="flex items-center gap-2 text-sm font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md"><FlaskConical size={16} /></span> Send sample message</div>
          <textarea className="input mt-2" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="btn-primary mt-2 w-full justify-center" onClick={run}>Run real AI pipeline</button>
          {out && <div className="bubble-bot mt-3"><span className="badge bg-amber-100 text-amber-800">simulated</span><div className="mt-1">{out}</div></div>}
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium">Session log</div>
          <div className="mt-2 space-y-2">
            {log.map((e, i) => (
              <div key={i} className="card animate-pop space-y-1.5 p-3 text-xs">
                <div className="bubble-in">👤 {e.in}</div>
                <div className="bubble-bot">🤖 {e.out}</div>
                {e.handover && <div><b>Handover:</b> {e.handover}</div>}
                {e.matched && <div><b>Matched:</b> {e.matched.map((m: any) => m.title ?? m.id).join(', ') || 'none'}</div>}
                {e.ai && <div className="text-slate-500">{e.ai.provider}/{e.ai.model} · {e.ai.latencyMs}ms {e.ai.error ? `· ${e.ai.error}` : ''}</div>}
                <div className="text-slate-400">{e.at} · simulated</div>
              </div>
            ))}
            {!log.length && <div className="text-sm text-slate-500">No simulated events yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
