import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, CheckCheck, Zap, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../lib/brand';

/** Live product mock — a Messenger thread answering itself. */
function ChatMock() {
  return (
    <div className="animate-floaty relative rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg">🛍️</span>
        <div>
          <div className="text-sm font-bold text-white">Demo Shop</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online — replies instantly</div>
        </div>
        <span className="ml-auto rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white">AI</span>
      </div>
      <div className="space-y-2.5 pt-3">
        <div className="animate-enter stagger-1 max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3 py-2 text-xs text-slate-800 shadow">Delivery charge koto? 🚚</div>
        <div className="animate-enter stagger-2 ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs text-white shadow">
          Dhaka te ৳60, baire ৳120. Order korte chaile janaben! ✨
        </div>
        <div className="animate-enter stagger-3 max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3 py-2 text-xs text-slate-800 shadow">Order korte chai — 2 pcs cake</div>
        <div className="animate-enter stagger-4 ml-auto flex items-center gap-1.5 rounded-2xl rounded-tr-md bg-white/20 px-3 py-2.5 backdrop-blur">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white" />
        </div>
        <div className="animate-enter stagger-5 ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs text-white shadow">
          Done! ✅ Order ORD-261009-AB12 — 2 × Chocolate Cake. Phone number ta diben?
        </div>
      </div>
      <div className="animate-floaty-slow absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 shadow-xl">
        <Zap size={11} className="text-amber-500" /> reply in ~2s
      </div>
      <div className="animate-floaty-slow absolute -bottom-3 -left-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 shadow-xl" style={{ animationDelay: '1.2s' }}>
        <CheckCheck size={11} /> COD order collected
      </div>
    </div>
  );
}

function Showcase() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-7 lg:flex">
      <div className="relative">
        <div className="flex items-center gap-2.5">
          {BRAND.logoUrl ? (
            <img src={BRAND.logoUrl} alt={BRAND.name} className="h-11 w-11 rounded-2xl bg-white/15 object-cover shadow-lg" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-white backdrop-blur">{BRAND.initial}</div>
          )}
          <div>
            <div className="font-bold text-white">{BRAND.name}</div>
            <div className="text-[11px] text-white/60">{BRAND.tagline}</div>
          </div>
        </div>
        <h2 className="mt-7 text-[32px] font-black leading-[1.1] tracking-tight text-white">
          Your Page replies<br /><span className="bg-gradient-to-r from-amber-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">while you sleep.</span>
        </h2>
        <p className="mt-2 max-w-sm text-sm text-white/65">AI chatbot for Facebook Pages — Bangla, Banglish & English, 24/7.</p>
      </div>
      <div className="relative mx-auto mt-6 w-full max-w-sm">
        <ChatMock />
      </div>
      <div className="relative mt-6 flex items-center gap-4 border-t border-white/10 pt-4 text-[11px] text-white/60">
        <span className="flex items-center gap-1"><Bot size={13} className="text-emerald-300" /> 24/7 auto-reply</span>
        <span className="flex items-center gap-1"><Globe size={13} className="text-indigo-300" /> বাং / Eng</span>
        <span className="ml-auto flex items-center gap-1"><Sparkles size={13} className="text-amber-300" /> No code needed</span>
      </div>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b18] p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb left-[-100px] top-[-100px] h-80 w-80 bg-indigo-600/60" />
        <div className="orb right-[-80px] top-[20%] h-72 w-72 bg-fuchsia-600/40" />
        <div className="orb bottom-[-120px] left-[35%] h-80 w-80 bg-violet-700/40" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
      </div>
      <div className="relative grid w-full max-w-5xl items-stretch gap-5 lg:grid-cols-[1.05fr_1fr]">
        <Showcase />
        <div className="animate-enter rounded-3xl border border-white/10 bg-white/[.97] p-7 shadow-2xl backdrop-blur dark:bg-slate-900/[.97] sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login, demo, setDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
      nav('/');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex items-center gap-2 lg:hidden">
        {BRAND.logoUrl ? (
          <img src={BRAND.logoUrl} alt={BRAND.name} className="h-9 w-9 rounded-xl object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-black text-white">{BRAND.initial}</div>
        )}
        <span className="font-bold">{BRAND.name}</span>
      </div>
      <div className="mt-1 text-[22px] font-black tracking-tight">Welcome back 👋</div>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Sign in to <span className="grad-text font-semibold">{BRAND.name}</span> to manage live workspaces.</p>
      <form onSubmit={submit} className="mt-5 grid gap-3">
        <label className="relative block">
          <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="relative block">
          <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10 !pr-11" type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </label>
        {err && <div className="animate-pop rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-300">{err}</div>}
        <button className="btn-primary justify-center" type="submit" disabled={busy}>
          {busy ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign in →'}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-xs">
        <Link to="/register" className="font-semibold text-indigo-600 hover:underline">Create account</Link>
        <Link to="/reset" className="text-slate-500 hover:underline dark:text-slate-400">Forgot password?</Link>
      </div>
      <div className="my-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
      <button className="btn-ghost w-full justify-center text-xs" onClick={() => { setDemo(!demo); nav('/'); }}>
        ✨ {demo ? 'Exit demo preview' : 'Continue in demo mode'}
      </button>
      <p className="mt-4 text-center text-[11px] text-slate-400">Protected by Firebase Auth · Encrypted Page tokens · You own your data</p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <AuthShell>
      <div className="text-[22px] font-black tracking-tight">Create your account 🚀</div>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Super-admin approval-er por full client panel unlock hobe.</p>
      {done ? (
        <div className="animate-pop mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Account created! Approval pending — approve hole Pages, Bot o workspace full use korte parbe. Ekhon limited view te dashboard dekhte paro.
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
          className="mt-5 grid gap-3"
        >
          <input className="input" placeholder="Your name (e.g. Rahim Uddin)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <label className="relative block">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-10" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="relative block">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-10 !pr-11" type={show ? 'text' : 'password'} placeholder="Password (6+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>
          {err && <div className="animate-pop rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-300">{err}</div>}
          <button className="btn-primary justify-center" type="submit" disabled={busy}>
            {busy ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Register'}
          </button>
        </form>
      )}
      <Link to="/login" className="mt-4 block text-center text-xs font-semibold text-indigo-600 hover:underline">Back to sign in</Link>
    </AuthShell>
  );
}

export function Reset() {
  const { reset } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <AuthShell>
      <div className="text-[22px] font-black tracking-tight">Reset password</div>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Mail e reset link pathabo.</p>
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
        className="mt-5 grid gap-3"
      >
        <label className="relative block">
          <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <button className="btn-primary justify-center" type="submit">Send reset link</button>
      </form>
      {msg && <div className="mt-2 text-xs">{msg}</div>}
      <Link to="/login" className="mt-4 block text-center text-xs font-semibold text-indigo-600 hover:underline">Back to sign in</Link>
    </AuthShell>
  );
}
