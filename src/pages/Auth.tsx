import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, Check, ShieldCheck, Inbox, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../lib/brand';

const BENEFITS = [
  { title: 'AI Inbox', sub: 'Every message answered in seconds, in Bangla and English.' },
  { title: 'COD orders captured', sub: 'Name, phone and address collected automatically.' },
  { title: 'Human handover', sub: 'Tricky cases route to your team with full context.' },
];

const THREADS = [
  { name: 'Rahim Uddin', text: 'Delivery charge koto?', tag: 'AI replied', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200', time: '2m' },
  { name: 'Sara Ahmed', text: 'Order ORD-261009-AB12 confirmed', tag: 'Order', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200', time: '18m' },
  { name: 'Tanvir Hasan', text: 'Refund issue — needs a human', tag: 'Handover', tone: 'bg-amber-50 text-amber-800 ring-amber-200', time: '41m' },
];

/** Restrained product preview — a sober inbox snapshot, not a toy chat. */
function InboxPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[.07] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <Inbox size={14} className="text-slate-300" />
        <span className="text-xs font-semibold text-white">Live inbox</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AI on duty</span>
      </div>
      {THREADS.map((t) => (
        <div key={t.name} className="flex items-center gap-2.5 border-b border-white/5 px-4 py-2.5 last:border-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-[11px] font-bold text-white">{t.name.slice(0, 1)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-white">{t.name}</span>
            <span className="block truncate text-[11px] text-slate-400">{t.text}</span>
          </span>
          <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 sm:block ${t.tone}`}>{t.tag}</span>
          <span className="shrink-0 text-[10px] text-slate-500">{t.time}</span>
        </div>
      ))}
    </div>
  );
}

function Showcase() {
  return (
    <div className="relative hidden flex-col justify-center overflow-hidden bg-slate-950 p-10 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(99,102,241,.45), transparent 55%), radial-gradient(circle at 10% 90%, rgba(16,185,129,.22), transparent 50%)' }}
      />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          {BRAND.logoUrl ? (
            <img src={BRAND.logoUrl} alt={BRAND.name} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white">{BRAND.initial}</div>
          )}
          <div>
            <div className="font-bold text-white">{BRAND.name}</div>
            <div className="text-[11px] text-slate-400">{BRAND.tagline}</div>
          </div>
        </div>
        <h2 className="mt-8 max-w-md text-[34px] font-extrabold leading-[1.15] tracking-tight text-white">
          Customer messaging, on autopilot.
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-400">
          Connect your Facebook Page and let AI handle replies, orders and follow-ups — your team steps in only when it matters.
        </p>
        <ul className="mt-7 space-y-4">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"><Check size={13} strokeWidth={3} /></span>
              <span>
                <span className="block text-sm font-semibold text-white">{b.title}</span>
                <span className="block text-[13px] text-slate-400">{b.sub}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 max-w-md"><InboxPreview /></div>
        <div className="mt-7 flex gap-6 border-t border-white/10 pt-5 text-slate-400">
          {[['24/7', 'coverage'], ['~2s', 'median reply'], ['বাং + EN', 'languages']].map(([v, l]) => (
            <span key={l}><span className="block text-lg font-extrabold text-white">{v}</span><span className="text-[11px] uppercase tracking-wide">{l}</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <Showcase />
      <div className="relative flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            {BRAND.logoUrl ? (
              <img src={BRAND.logoUrl} alt={BRAND.name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">{BRAND.initial}</div>
            )}
            <span className="font-bold text-slate-900">{BRAND.name}</span>
          </div>
          {children}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-slate-600">Privacy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-slate-600">Terms</Link>
            <span>·</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secured by Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export default function Login() {
  const { login, demo, setDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('pp-login-email') ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem('pp-login-email')));
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      if (remember) localStorage.setItem('pp-login-email', email.trim());
      else localStorage.removeItem('pp-login-email');
      nav('/');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back — manage your workspaces and Pages.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <Field label="Email address">
          <span className="relative block">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !bg-white !pl-10" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </span>
        </Field>
        <Field label="Password">
          <span className="relative block">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !bg-white !pl-10 !pr-11" type={show ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </Field>
        <div className="flex items-center justify-between text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-indigo-600" />
            Remember me
          </label>
          <Link to="/reset" className="font-semibold text-indigo-600 hover:underline">Forgot password?</Link>
        </div>
        {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{err}</div>}
        <button className="btn-primary w-full !py-3" type="submit" disabled={busy}>
          {busy ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign in'}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" /></div>
      <button className="btn-ghost w-full !border-slate-300 !bg-white text-[13px]" onClick={() => { setDemo(!demo); nav('/'); }}>
        {demo ? 'Exit demo preview' : 'Explore the live demo'}
      </button>
      <p className="mt-5 text-center text-[13px] text-slate-500">
        New here? <Link to="/register" className="font-semibold text-indigo-600 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-500">Approval-er por full client panel unlock hobe.</p>
      {done ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <span className="font-bold">Account created.</span> Approval pending — approve hole Pages, Bot o workspace full use korte parbe.
          <button className="btn-primary mt-3 w-full justify-center" onClick={() => nav('/')}>Go to dashboard →</button>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErr('');
            setBusy(true);
            try {
              await register(name, email, password);
              setDone(true);
            } catch (e: any) {
              setErr(e.message);
            } finally {
              setBusy(false);
            }
          }}
          className="mt-6 grid gap-4"
        >
          <Field label="Full name">
            <span className="relative block">
              <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !bg-white !pl-10" placeholder="Rahim Uddin" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </span>
          </Field>
          <Field label="Work email">
            <span className="relative block">
              <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !bg-white !pl-10" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </span>
          </Field>
          <Field label="Password" hint="Minimum 6 characters.">
            <span className="relative block">
              <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !bg-white !pl-10" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </span>
          </Field>
          {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{err}</div>}
          <button className="btn-primary w-full !py-3" type="submit" disabled={busy}>
            {busy ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create account'}
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-[13px] text-slate-500">
        <Clock size={12} className="mr-1 inline" /> Approval usually within a few hours · <Link to="/login" className="font-semibold text-indigo-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

export function Reset() {
  const { reset } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Reset password</h1>
      <p className="mt-1 text-sm text-slate-500">Mail e reset link pathabo.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await reset(email);
            setMsg('Reset link sent — check your inbox.');
          } catch (e: any) {
            setMsg(e.message);
          }
        }}
        className="mt-6 grid gap-4"
      >
        <Field label="Email address">
          <span className="relative block">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !bg-white !pl-10" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </span>
        </Field>
        <button className="btn-primary w-full !py-3" type="submit">Send reset link</button>
      </form>
      {msg && <div className="mt-3 text-[13px] text-slate-600">{msg}</div>}
      <p className="mt-5 text-center text-[13px] text-slate-500">
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
