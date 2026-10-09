import { useEffect, useState } from 'react';
import { Megaphone, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PageHead } from '../components/Layout';

export default function Broadcast() {
  const { token, demo } = useAuth();
  const [eligible, setEligible] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  async function load() {
    if (demo || !token) return;
    try {
      const r = await api<any>(`/api/broadcast/eligible?workspaceId=${ws()}`, { token });
      setEligible(r.count ?? 0);
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function send(dry: boolean) {
    if (demo) {
      setResult(demo ? { dryRun: dry, wouldSend: 12, note: 'Demo preview — 12 customers reachable (sample).' } : null);
      return;
    }
    if (!text.trim() || !token) return;
    setMsg('');
    try {
      const r = await api<any>('/api/broadcast', { method: 'POST', token, body: { workspaceId: ws(), text, dryRun: dry } });
      setResult(r);
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <PageHead title="Broadcast" sub="Offer/promotion to past customers — only those active within 24h (Meta policy)." />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-medium"><Megaphone size={16} /> New broadcast</div>
          <div className="mt-1 text-xs text-slate-500">
            Reachable now: <b>{demo ? 12 : eligible}</b> customers. Promotional messages outside Meta's
            messaging window need approved templates — this tool only sends inside the 24h window.
          </div>
          <textarea className="input mt-3" rows={4} maxLength={1000} placeholder="Eid offer! 10% off all cakes — order today 🎂" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-1 text-right text-[11px] text-slate-400">{text.length}/1000</div>
          <div className="mt-2 flex gap-2">
            <button className="btn-ghost text-xs" onClick={() => send(true)}><Eye size={14} /> Preview count</button>
            <button className="btn-primary text-xs" onClick={() => send(false)} disabled={!text.trim()}>Send broadcast</button>
          </div>
          {msg && <div className="mt-2 text-xs text-red-600">{msg}</div>}
          {result && (
            <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
              {result.dryRun || result.note ? (
                <div>{result.note ?? `Would send to ${result.wouldSend} customers.`}</div>
              ) : (
                <div>
                  ✅ Sent: <b>{result.sent}</b> / {result.total} · Failed: <b>{result.failed}</b>
                  {result.failures?.length > 0 && (
                    <div className="mt-1 text-xs text-slate-500">First failures: {result.failures.map((f: any) => f.error).join(' | ').slice(0, 200)}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="card h-fit p-4 text-xs text-slate-500">
          <div className="font-medium text-slate-700 dark:text-slate-200">Policy guardrails</div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Only customers active in the last 24h receive it.</li>
            <li>No spam bursts — paced delivery, max 200 per run.</li>
            <li>Result always shows sent vs failed honestly.</li>
            <li>Bulk promo to cold audiences needs Meta-approved templates.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
