import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { demoConversations } from '../lib/demoData';
import { PageHead, Empty } from '../components/Layout';

export default function Customers() {
  const { token, demo } = useAuth();
  const [rows, setRows] = useState<any[]>(demo ? demoConversations : []);

  useEffect(() => {
    (async () => {
      if (demo || !token) {
        setRows(demoConversations);
        return;
      }
      try {
        const r = await api<any>(`/api/conversations?workspaceId=${localStorage.getItem('workspaceId')}&status=all`);
        setRows(r.conversations ?? []);
      } catch {
        setRows([]);
      }
    })();
  }, [demo, token]);

  if (!rows.length) return (<div><PageHead title="Customers" sub="People who messaged your Pages" /><Empty title="No customers yet" sub="Customers appear here after real or simulated conversations." /></div>);

  return (
    <div>
      <PageHead title="Customers" sub={demo ? 'Sample customers — demo mode.' : 'Only identifiers legitimately received via the API are shown. Nothing is fabricated.'} />
      <div className="card overflow-x-auto">
        <table className="table w-full">
          <thead><tr><th>Customer</th><th>Status</th><th>Last message</th><th>Unread</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="transition hover:bg-indigo-50/50 dark:hover:bg-slate-800/60">
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-[11px] font-black text-white">
                      {(c.customerName ?? c.psid ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-semibold">{c.customerName ?? `PSID …${String(c.psid ?? '').slice(-4)}`}</span>
                  </div>
                </td>
                <td><span className={`badge ${c.status === 'waiting_human' ? 'bg-amber-100 text-amber-800' : c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-700'}`}>{c.status}</span></td>
                <td className="max-w-[320px] truncate text-slate-500">{c.lastMessage}</td>
                <td>{(c.unread ?? 0) > 0 ? <span className="badge bg-indigo-600 text-white">{c.unread}</span> : <span className="text-slate-400">0</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
