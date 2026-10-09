import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, ShoppingBag, Megaphone, MessageCircleHeart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../lib/brand';

function Showcase() {
  const feats = [
    { icon: Bot, title: 'AI auto-reply', sub: 'Bangla, Banglish & English — 24/7' },
    { icon: ShoppingBag, title: 'COD order flow', sub: 'Name, phone, address auto-collected' },
    { icon: MessageCircleHeart, title: 'Comment reply', sub: 'Every comment gets a response' },
    { icon: Megaphone, title: 'Broadcast offers', sub: 'Promos to past customers' },
  ];
  return (
    <div className="relative hidden overflow-hidden rounded-3xl p-8 text-white lg:flex lg:flex-col lg:justify-between" style={{ backgroundImage: 'linear-gradient(150deg,#4f46e5 0%,#7c3aed 55%,#c026d3 130%)' }}>
      <div className="orb right-[-40px] top-[-40px] h-52 w-52 bg-white/30" />
      <div className="orb bottom-[-60px] left-[-40px] h-56 w-56 bg-fuchsia-300/50" />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          {BRAND.logoUrl ? (
            <img src={BRAND.logoUrl} alt={BRAND.name} className="h-12 w-12 rounded-2xl bg-white/20 object-cover shadow-lg" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-xl font-black backdrop-blur">{BRAND.initial}</div>
          )}
          <div>
            <div className="text-lg font-bold">{BRAND.name}</div>
            <div className="text-xs text-white/80">{BRAND.tagline}</div>
          </div>
        </div>
        <h2 className="mt-8 text-3xl font-black leading-tight">Your Page replies<br />while you sleep.</h2>
        <p className="mt-2 text-sm text-white/85">AI chatbot for Facebook Pages — orders, comments & inbox on autopilot.</p>
      </div>
      <div className="relative mt-8 grid grid-cols-2 gap-3">
        {feats.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <f.icon size={18} />
            <div className="mt-1.5 text-sm font-semibold">{f.title}</div>
            <div className="text-[11px] text-white/75">{f.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f5fb] p-4 dark:bg-[#0a0f1e]">
      <div className="orb left-[10%] top-[-60px] h-56 w-56 bg-indigo-300 dark:bg-indigo-900" />
      <div className="orb bottom-[-40px] right-[10%] h-56 w-56 bg-fuchsia-200 dark:bg-fuchsia-950" />
      <div className="relative grid w-full max-w-4xl gap-4 lg:grid-cols-2">
        <Showcase />
        <div className="card p-7">{children}</div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login, demo, setDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      nav('/');
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <AuthShell>
      <div className="text-xl font-bold">Welcome back 👋</div>
      <p className="mt-0.5 text-sm text-slate-500">Sign in to <span className="grad-text font-semibold">{BRAND.name}</span> to manage live workspaces.</p>
      <form onSubmit={submit} className="mt-5 grid gap-3">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600">{err}</div>}
        <button className="btn-primary justify-center" type="submit">Sign in →</button>
      </form>
      <div className="mt-4 flex justify-between text-xs">
        <Link to="/register" className="font-medium text-indigo-600">Create account</Link>
        <Link to="/reset" className="text-slate-500">Forgot password?</Link>
      </div>
      <button className="btn-ghost mt-4 w-full justify-center text-xs" onClick={() => { setDemo(!demo); nav('/'); }}>
        {demo ? 'Exit demo preview' : '✨ Continue in demo mode'}
      </button>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="card p-6">
        <div className="text-lg font-semibold">Create your account</div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await register(email, password);
              nav('/');
            } catch (e: any) {
              setErr(e.message);
            }
          }}
          className="mt-4 grid gap-2"
        >
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password (6+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <div className="text-xs text-red-600">{err}</div>}
          <button className="btn-primary justify-center" type="submit">Register</button>
        </form>
        <Link to="/login" className="mt-3 block text-center text-xs text-indigo-600">Back to sign in</Link>
      </div>
    </div>
  );
}

export function Reset() {
  const { reset } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="card p-6">
        <div className="text-lg font-semibold">Reset password</div>
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
          className="mt-4 grid gap-2"
        >
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-primary justify-center" type="submit">Send reset link</button>
        </form>
        {msg && <div className="mt-2 text-xs">{msg}</div>}
        <Link to="/login" className="mt-3 block text-center text-xs text-indigo-600">Back to sign in</Link>
      </div>
    </div>
  );
}
