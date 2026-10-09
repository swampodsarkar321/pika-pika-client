import { useEffect, useState } from 'react';
import { ShieldCheck, Crown, UserCog, Headset } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PageHead, Empty } from '../components/Layout';

const ROLE_STYLE: Record<string, { badge: string; icon: any; desc: string }> = {
  owner: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: Crown, desc: 'Full control — settings, billing, team' },
  admin: { badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', icon: UserCog, desc: 'Manage — knowledge, broadcast, orders' },
  agent: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: Headset, desc: 'Inbox — reply, handover, notes' },
};

export default function Team() {
  const { token, demo } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [err, setErr] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  useEffect(() => {
    if (demo || !token) return;
    (async () => {
      try {
        const r = await api<any>(`/api/team?workspaceId=${ws()}`, { token });
        setMembers(r.members ?? []);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [demo, token]);

  if (demo) {
    return (
      <div>
        <PageHead title="Team & Access" sub="Workspace roles" />
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(ROLE_STYLE).map(([role, s]) => (
            <div key={role} className="card card-hover p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md"><s.icon size={18} /></span>
              <div className="mt-2 font-bold capitalize">{role}</div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Sample roles — demo mode. Sign in to manage your live team.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHead title="Team & Access" sub="People who can access this workspace" />
      {err && <div className="card mb-3 border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!members.length ? (
        <Empty title="No team members found" sub="Members appear here once they join this workspace." icon={<ShieldCheck size={22} />} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {members.map((m: any) => {
            const s = ROLE_STYLE[m.role] ?? ROLE_STYLE.agent;
            return (
              <div key={m.uid} className="card card-hover relative overflow-hidden p-5">
                <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-fuchsia-500" />
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-black text-white shadow-md">
                    {(m.email ?? '?').slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{m.email ?? 'Unknown user'}</div>
                    <span className={`badge mt-0.5 ${s.badge}`}><s.icon size={12} /> {m.role}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">{s.desc}</div>
              </div>
            );
          })}
        </div>
      )}
      <div className="card mt-3 p-4 text-xs text-slate-500">
        To add someone: they register on this dashboard, then an <b>owner</b> adds their UID under
        <code> workspaceMembers</code> — enforced on the server for every request.
      </div>
    </div>
  );
}
