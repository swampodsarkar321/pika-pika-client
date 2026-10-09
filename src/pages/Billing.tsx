import { useEffect, useState } from 'react';
import { Check, Phone, BadgeCheck, Crown } from 'lucide-react';
import { PageHead } from '../components/Layout';
import { BRAND } from '../lib/brand';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

// Packages (manual activation after WhatsApp order + payment).
const PLANS = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '৳0',
    period: '/ 7 days',
    note: 'Try it out — 1 Page included',
    features: ['1 connected Page', '20 knowledge entries', '50 AI replies', 'Basic inbox + analytics'],
    cta: 'Start trial',
    highlight: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '৳800',
    period: '/ month',
    note: 'One-time setup ৳2,000 · best for small shops',
    features: ['1 connected Page', '500 knowledge entries', '2,000 AI replies / month', 'Human handover + analytics', 'Fast WhatsApp setup'],
    cta: 'Order now',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '৳2,000',
    period: '/ month',
    note: 'One-time setup ৳5,000 · multiple Pages & brands',
    features: ['3 connected Pages', '5,000 knowledge entries', '20,000 AI replies / month', 'Priority support', 'Monthly report'],
    cta: 'Talk to us',
    highlight: false,
  },
];

export default function Billing() {
  const { token, demo } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [pkg, setPkg] = useState('business');
  const [trx, setTrx] = useState('');
  const [sender, setSender] = useState('');
  const [msg, setMsg] = useState('');
  const [activePkg, setActivePkg] = useState<string | null>(null);

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  // planId (server) → package card (UI): free→trial, starter→business, business→premium
  const planToPkg = (planId?: string) =>
    planId === 'business' ? 'premium' : planId === 'starter' ? 'business' : 'trial';

  async function load() {
    if (demo || !token) return;
    try {
      const r = await api<any>(`/api/billing/claims?workspaceId=${ws()}`, { token });
      setClaims(r.claims ?? []);
    } catch {
      /* ignore */
    }
    try {
      const w = ws();
      if (w) {
        const wr = await api<any>(`/api/workspaces/${w}?workspaceId=${w}`, { token });
        setActivePkg(planToPkg(wr.workspace?.planId));
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token]);

  async function submitClaim() {
    if (demo || !token || !trx.trim() || !sender.trim()) return;
    setMsg('');
    try {
      const r = await api<any>('/api/billing/claim', { method: 'POST', token, body: { workspaceId: ws(), package: pkg, trxId: trx.trim(), senderNumber: sender.trim(), months: 1 } });
      setMsg(`Claim received (${r.claimKey}). Your package will be activated after verification.`);
      setTrx('');
      setSender('');
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <PageHead title="Billing" sub={`${BRAND.name} packages — order on WhatsApp`} />
      {!demo && activePkg && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl border border-emerald-300/60 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Crown size={16} className="shrink-0 text-emerald-600" />
          <span>Active plan: <b>{PLANS.find((p) => p.id === activePkg)?.name ?? activePkg}</b> — nicher list e sudhu ei plan er benefit active.</span>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((p) => {
          const active = activePkg === p.id;
          const dimmed = activePkg !== null && !active;
          return (
          <div key={p.id} className={`card relative p-5 ${active ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900' : p.highlight ? 'border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900' : ''} ${dimmed ? 'opacity-70' : ''}`}>
            {active && <span className="badge absolute right-4 top-4 bg-emerald-500 text-white">Active</span>}
            <div className="font-semibold">{p.name}</div>
            <div className="mt-1 text-2xl font-bold">{p.price} <span className="text-sm font-normal text-slate-500">{p.period}</span></div>
            <div className="mt-1 text-xs text-slate-500">{p.note}</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {p.features.map((f) => <li key={f} className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> {f}</li>)}
            </ul>
            <a href={`https://wa.me/8801410882562?text=${encodeURIComponent(`Hello! I want the ${BRAND.name} ${p.name} package (${p.price}${p.period}).`)}`} target="_blank" rel="noreferrer" className={p.highlight ? 'btn-primary mt-4 w-full justify-center text-xs' : 'btn-ghost mt-4 w-full justify-center text-xs'}>
              <Phone size={14} /> {p.cta} on WhatsApp
            </a>
          </div>
          );
        })}
      </div>
      <div className="card mt-3 p-4 text-xs text-slate-500">
        The bot never stops when quota runs out — it sends a fallback message instead. Upgrades apply instantly after verification.
      </div>
      <div className="card mt-3 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck size={16} className="text-emerald-600" /> Payment confirmation (TrxID)</div>
        <p className="mt-1 text-xs text-slate-500">Paid already? Submit your transaction ID below for verification.</p>
        {demo ? (
          <div className="mt-2 text-xs text-slate-500">Demo mode — sign in to submit a live claim.</div>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-[160px_1fr_1fr_auto]">
            <select className="input" value={pkg} onChange={(e) => setPkg(e.target.value)}>
              <option value="business">Business ৳800</option>
              <option value="premium">Premium ৳2000</option>
              <option value="trial">Trial ৳0</option>
            </select>
            <input className="input" placeholder="Transaction ID (e.g. 9HX7K2LMN0)" value={trx} onChange={(e) => setTrx(e.target.value)} />
            <input className="input" placeholder="Your mobile number" value={sender} onChange={(e) => setSender(e.target.value)} />
            <button className="btn-primary text-xs" onClick={submitClaim}>Submit</button>
          </div>
        )}
        {msg && <div className="mt-2 text-xs">{msg}</div>}
        {claims.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">Your submissions:</div>
            <div className="mt-1.5 space-y-1.5">
              {claims.map((c: any) => (
                <div key={c.key} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                  <span className="font-medium">{c.package}</span>
                  <span className="text-slate-500">TrxID: {c.trxId}</span>
                  <span className={`badge ml-auto ${c.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
