import { useEffect, useState } from 'react';
import { Plus, Trash2, Power } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { demoKnowledge } from '../lib/demoData';
import { PageHead } from '../components/Layout';

const TYPES = ['faq', 'product', 'policy', 'hours', 'contact', 'general'];
const TYPE_STYLE: Record<string, string> = {
  faq: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  product: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  policy: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  hours: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  contact: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  general: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export default function Training() {
  const { token, demo } = useAuth();
  const [entries, setEntries] = useState<any[]>(demo ? demoKnowledge : []);
  const [form, setForm] = useState({ type: 'faq', question: '', answer: '' });
  const [preview, setPreview] = useState('');
  const [previewOut, setPreviewOut] = useState('');
  const [msg, setMsg] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  async function load() {
    if (demo || !token) return;
    const r = await api<any>(`/api/knowledge?workspaceId=${ws()}`);
    setEntries(r.entries ?? []);
  }

  useEffect(() => {
    if (demo) setEntries(demoKnowledge);
    else load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function add() {
    if (!form.answer.trim()) return;
    if (demo) {
      setEntries((e) => [{ id: `kb${Date.now()}`, ...form, enabled: true, updatedAt: Date.now() }, ...e]);
      setForm({ type: 'faq', question: '', answer: '' });
      return;
    }
    await api('/api/knowledge', { method: 'POST', token, body: { workspaceId: ws(), ...form } });
    setForm({ type: 'faq', question: '', answer: '' });
    load();
  }

  async function toggle(e: any) {
    if (demo) {
      setEntries((list) => list.map((x) => (x.id === e.id ? { ...x, enabled: !x.enabled } : x)));
      return;
    }
    await api(`/api/knowledge/${e.id}`, { method: 'PATCH', token, body: { workspaceId: ws(), enabled: !e.enabled } });
    load();
  }

  async function remove(id: string) {
    if (demo) {
      setEntries((list) => list.filter((x) => x.id !== id));
      return;
    }
    await api(`/api/knowledge/${id}?workspaceId=${ws()}`, { method: 'DELETE', token });
    load();
  }

  async function runPreview() {
    setPreviewOut('');
    if (demo) {
      const hit = entries.find((e) => e.enabled && preview && e.answer);
      setPreviewOut(hit ? `(Demo match) ${hit.answer}` : 'No enabled knowledge matches in demo data.');
      return;
    }
    try {
      const r = await api<any>('/api/bot/test', { method: 'POST', token, body: { workspaceId: ws(), message: preview } });
      setPreviewOut(r.reply);
      setMsg(`Matched ${r.matchedKnowledge?.length ?? 0} entries · ${r.usage?.provider}/${r.usage?.model}`);
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <PageHead title="AI Training" sub={demo ? 'Demo entries — sign in to manage the live knowledge base.' : 'Only this workspace’s knowledge is ever used for its replies.'} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="card space-y-2 p-4">
            <div className="text-sm font-medium">Add knowledge</div>
            <div className="grid gap-2 md:grid-cols-[140px_1fr]">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input" placeholder="Question / title (optional)" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <textarea className="input" rows={3} placeholder="Answer — prices, hours, policies, contact info…" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            <button className="btn-primary text-xs" onClick={add}><Plus size={14} /> Add entry</button>
          </div>
          {entries.map((e) => (
            <div key={e.id} className={`card relative overflow-hidden p-4 pl-5 ${e.enabled ? '' : 'opacity-60'}`}>
              <div className={`absolute left-0 top-0 h-full w-1.5 ${e.enabled ? 'bg-gradient-to-b from-indigo-500 to-fuchsia-500' : 'bg-slate-300'}`} />
              <div className="flex items-center gap-2">
                <span className={`badge ${TYPE_STYLE[e.type] ?? TYPE_STYLE.general}`}>{e.type}</span>
                <span className="text-sm font-semibold">{e.question ?? e.title ?? '(untitled)'}</span>
                <div className="ml-auto flex gap-1.5">
                  <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => toggle(e)}><Power size={13} /> {e.enabled ? 'Disable' : 'Enable'}</button>
                  <button className="btn-ghost !px-2 !py-1 text-xs !text-red-500" onClick={() => remove(e.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{e.answer}</div>
            </div>
          ))}
          {!entries.length && <div className="card p-8 text-center text-sm text-slate-500">No knowledge yet — add FAQs, products, hours and policies above.</div>}
        </div>
        <div className="card h-fit p-4">
          <div className="text-sm font-medium">Preview an AI answer</div>
          <p className="text-xs text-slate-500">Tests retrieval + generation without sending Messenger messages.</p>
          <input className="input mt-2" placeholder="e.g. ডেলিভারি চার্জ কত?" value={preview} onChange={(e) => setPreview(e.target.value)} />
          <button className="btn-primary mt-2 w-full justify-center text-xs" onClick={runPreview}>Generate preview</button>
          {previewOut && <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{previewOut}</div>}
          {msg && <div className="mt-2 text-xs text-slate-500">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
