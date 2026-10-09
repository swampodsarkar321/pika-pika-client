import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PageHead } from '../components/Layout';

const DEFAULTS = {
  enabled: true, businessName: 'Demo Shop', businessDescription: '', replyLanguage: 'auto',
  tone: 'friendly', welcomeMessage: 'Hello! How can I help?', fallbackMessage: 'Our team will follow up shortly.',
  businessHours: 'Sat–Thu 10am–8pm', handoverKeywords: ['human', 'refund'], forbiddenTopics: [] as string[],
  maxReplyChars: 600, aiProvider: 'gemini', aiModel: 'gemini-3.5-flash-lite',
  orderFlowEnabled: true, commentReplyEnabled: true,
  commentReplyTemplate: 'Thanks for your comment! 🙏 Please inbox us to order — we reply fast.',
};

export default function BotSettings() {
  const { token, demo } = useAuth();
  const [s, setS] = useState<any>(DEFAULTS);
  const [testMsg, setTestMsg] = useState('ডেলিভারি চার্জ কত?');
  const [testOut, setTestOut] = useState('');
  const [msg, setMsg] = useState('');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  useEffect(() => {
    (async () => {
      if (demo || !token) {
        setS(DEFAULTS);
        return;
      }
      try {
        const r = await api<any>(`/api/bot/settings?workspaceId=${ws()}`);
        setS(r.settings);
      } catch { /* keep defaults */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function save() {
    if (demo) {
      setMsg('Demo mode — settings are local preview only.');
      return;
    }
    try {
      await api('/api/bot/settings', { method: 'PATCH', token, body: { workspaceId: ws(), ...s } });
      setMsg('Settings saved.');
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  async function test() {
    if (demo) {
      setTestOut('(Demo) ওয়ালাইকুম আসসালাম! ঢাকার ভিতরে ৬০ টাকা, বাইরে ১২০ টাকা।');
      return;
    }
    try {
      const r = await api<any>('/api/bot/test', { method: 'POST', token, body: { workspaceId: ws(), message: testMsg } });
      setTestOut(r.reply);
    } catch (e: any) {
      setTestOut(`Error: ${e.message}`);
    }
  }

  const field = 'grid gap-1 text-sm';
  return (
    <div>
      <PageHead title="Bot Settings" sub="Behavior, language, handover and AI limits per workspace" actions={<button className="btn-primary" onClick={save}>Save settings</button>} />
      {msg && <div className="card mb-3 p-3 text-sm">{msg}</div>}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card space-y-4 p-5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} /> Bot enabled
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={field}>Business name<input className="input" value={s.businessName} onChange={(e) => setS({ ...s, businessName: e.target.value })} /></div>
            <div className={field}>Reply language
              <select className="input" value={s.replyLanguage} onChange={(e) => setS({ ...s, replyLanguage: e.target.value })}>
                <option value="auto">Auto (Bangla/English)</option><option value="en">English</option><option value="bn">Bangla</option>
              </select>
            </div>
            <div className={field}>Brand tone
              <select className="input" value={s.tone} onChange={(e) => setS({ ...s, tone: e.target.value })}>
                <option value="friendly">Friendly</option><option value="professional">Professional</option><option value="casual">Casual</option><option value="concise">Concise</option>
              </select>
            </div>
            <div className={field}>Max reply length<input type="number" className="input" value={s.maxReplyChars} onChange={(e) => setS({ ...s, maxReplyChars: Number(e.target.value) })} /></div>
          </div>
          <div className={field}>Business description<textarea className="input" rows={2} value={s.businessDescription ?? ''} onChange={(e) => setS({ ...s, businessDescription: e.target.value })} /></div>
          <div className={field}>Welcome message<textarea className="input" rows={2} value={s.welcomeMessage} onChange={(e) => setS({ ...s, welcomeMessage: e.target.value })} /></div>
          <div className={field}>Fallback message<textarea className="input" rows={2} value={s.fallbackMessage} onChange={(e) => setS({ ...s, fallbackMessage: e.target.value })} /></div>
          <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
            <div className="font-medium">COD order-taking flow</div>
            <label className="mt-1.5 flex items-center gap-2 text-xs">
              <input type="checkbox" checked={s.orderFlowEnabled !== false} onChange={(e) => setS({ ...s, orderFlowEnabled: e.target.checked })} /> Enabled — customer “order” bolle bot naam/phone/address collect kore
            </label>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
            <div className="font-medium">Comment auto-reply</div>
            <p className="text-[11px] text-slate-500">In the Meta dashboard, add the <b>feed</b> field to the Page subscription.</p>
            <label className="mt-1.5 flex items-center gap-2 text-xs">
              <input type="checkbox" checked={s.commentReplyEnabled !== false} onChange={(e) => setS({ ...s, commentReplyEnabled: e.target.checked })} /> Enabled
            </label>
            <div className={field}>Reply template<textarea className="input" rows={2} value={s.commentReplyTemplate ?? ''} onChange={(e) => setS({ ...s, commentReplyTemplate: e.target.value })} /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={field}>Business hours<input className="input" value={s.businessHours ?? ''} onChange={(e) => setS({ ...s, businessHours: e.target.value })} /></div>
            <div className={field}>Handover keywords (comma-separated)<input className="input" value={(s.handoverKeywords ?? []).join(', ')} onChange={(e) => setS({ ...s, handoverKeywords: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></div>
            <div className={field}>Forbidden topics (comma-separated)<input className="input" value={(s.forbiddenTopics ?? []).join(', ')} onChange={(e) => setS({ ...s, forbiddenTopics: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></div>
            <div className={field}>AI model<input className="input" value={s.aiModel ?? ''} onChange={(e) => setS({ ...s, aiModel: e.target.value })} /></div>
          </div>
        </div>
        <div className="card h-fit p-4">
          <div className="text-sm font-medium">Test chat</div>
          <p className="text-xs text-slate-500">No real Messenger messages are sent.</p>
          <input className="input mt-2" value={testMsg} onChange={(e) => setTestMsg(e.target.value)} />
          <button className="btn-primary mt-2 w-full justify-center text-xs" onClick={test}>Send test</button>
          {testOut && <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{testOut}</div>}
        </div>
      </div>
    </div>
  );
}
