import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { demoUsage } from '../lib/demoData';
import { PageHead, Loading } from '../components/Layout';
import DonutChart from '../components/DonutChart';

export default function Analytics() {
  const { token, demo } = useAuth();
  const [u, setU] = useState<any>(demo ? demoUsage : null);
  const [loading, setLoading] = useState(!demo);

  useEffect(() => {
    (async () => {
      if (demo || !token) {
        setU(demoUsage);
        setLoading(false);
        return;
      }
      try {
        const r = await api<any>(`/api/analytics/usage?workspaceId=${localStorage.getItem('workspaceId')}`);
        setU(r);
      } catch {
        setU(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [demo, token]);

  if (loading) return <Loading label="analytics" />;
  if (!u) return (<div><PageHead title="Analytics" /><div className="card p-6 text-sm">No data yet.</div></div>);

  const pct = Math.min(100, Math.round((u.aiRepliesUsed / Math.max(1, u.aiRepliesLimit)) * 100));
  const max = Math.max(1, ...u.dailyConversations.map((d: any) => d.count));

  return (
    <div>
      <PageHead title="Analytics" sub={demo ? 'Sample usage — demo mode.' : `Plan: ${u.plan} · ${u.aiRepliesUsed}/${u.aiRepliesLimit} AI replies used`} />
      {u.nearQuota && <div className="card mb-3 border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">⚠️ Usage is at {pct}% of quota. {u.overQuota ? 'AI replies are paused until next month or an upgrade.' : 'Consider upgrading before the limit is reached.'}</div>}
      <div className="card p-5">
        <div className="flex justify-between text-sm"><span>AI replies this month</span><span className="font-medium">{u.aiRepliesUsed} / {u.aiRepliesLimit}</span></div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full rounded-full ${u.overQuota ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="card mt-4 p-5">
        <div className="text-sm font-medium">Message mix this month</div>
        <div className="mt-3">
          <DonutChart
            slices={[
              { label: 'Incoming', value: u.raw?.incoming ?? 0, color: '#6366f1' },
              { label: 'AI replies', value: u.aiRepliesUsed ?? 0, color: '#8b5cf6' },
              { label: 'Human replies', value: u.raw?.humanReplies ?? 0, color: '#0ea5e9' },
              { label: 'AI errors', value: u.raw?.aiErrors ?? 0, color: '#ef4444' },
            ]}
            centerTop={String(u.raw?.incoming ?? 0)}
            centerBottom="incoming"
          />
        </div>
      </div>
      <div className="card mt-4 p-5">
        <div className="text-sm font-medium">Daily conversations (last 14 days)</div>
        <div className="mt-3 flex items-end gap-1.5" style={{ height: 140 }}>
          {u.dailyConversations.map((d: any) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
              <div className="w-full rounded-t bg-indigo-500/80" style={{ height: `${Math.max(4, (d.count / max) * 110)}px` }} />
              <div className="text-[10px] text-slate-400">{d.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
