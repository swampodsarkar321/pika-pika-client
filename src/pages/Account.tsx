import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PageHead } from '../components/Layout';

export default function Account() {
  const { user, token, demo, logout } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [wsName, setWsName] = useState('');
  const [msg, setMsg] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [current, setCurrent] = useState<string | null>(localStorage.getItem('workspaceId'));

  async function loadList(t: string) {
    try {
      const r = await api<any>('/api/workspaces', { token: t });
      setList(r.workspaces ?? []);
      // Auto-select first workspace if none stored — no more repeated creates
      if (!localStorage.getItem('workspaceId') && r.workspaces?.length) {
        localStorage.setItem('workspaceId', r.workspaces[0].id);
        setCurrent(r.workspaces[0].id);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!demo && token) loadList(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function createWorkspace() {
    if (!wsName.trim() || !token) return;
    try {
      const r = await api<any>('/api/workspaces', { method: 'POST', token, body: { name: wsName, businessName: wsName } });
      localStorage.setItem('workspaceId', r.workspace.id);
      setCurrent(r.workspace.id);
      setMsg(`Workspace created: ${r.workspace.id}`);
      loadList(token);
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  function select(id: string) {
    localStorage.setItem('workspaceId', id);
    setCurrent(id);
    setMsg(`Switched to workspace: ${id}`);
  }

  return (
    <div>
      <PageHead title="Account Settings" sub={user?.email ?? 'Not signed in'} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 text-sm">
          <div className="font-medium">Profile</div>
          <div className="mt-2 grid gap-2">
            <input className="input" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} disabled={demo} />
            <div className="text-xs text-slate-500">{demo ? 'Profile editing is disabled in demo mode.' : 'Profile is stored under users/{uid}.'}</div>
          </div>
        </div>
        <div className="card p-5 text-sm">
          <div className="font-medium">Workspace</div>
          <div className="mt-2 flex gap-2">
            <input className="input" placeholder="New workspace name" value={wsName} onChange={(e) => setWsName(e.target.value)} disabled={demo} />
            <button className="btn-primary" onClick={createWorkspace} disabled={demo}>Create</button>
          </div>
          <div className="mt-2 text-xs text-slate-500">Current: {current ?? '(none selected)'}</div>
          {msg && <div className="mt-2 text-xs">{msg}</div>}
          {list.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-xs font-medium text-slate-500">Your workspaces (click to switch):</div>
              {list.map((w: any) => (
                <button
                  key={w.id}
                  onClick={() => select(w.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs ${current === w.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700'}`}
                >
                  <span className="font-medium">{w.name ?? w.businessName ?? w.id}</span>
                  <span className="badge bg-slate-100 text-slate-600">{w.role ?? 'member'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!demo && user && (
        <div className="card mt-4 p-5 text-sm">
          <div className="font-medium">Session</div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-slate-500">{user.email}</span>
            <button
              className="btn-ghost text-xs"
              onClick={async () => {
                await logout();
                localStorage.removeItem('workspaceId');
                nav('/login');
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
