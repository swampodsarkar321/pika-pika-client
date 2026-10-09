import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Facebook, Inbox, ShoppingBag, Megaphone, GraduationCap,
  Settings, Users, BarChart3, CreditCard, FlaskConical, Search, CornerDownLeft,
} from 'lucide-react';

const COMMANDS = [
  { label: 'Go to Overview', hint: 'dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Go to Facebook Pages', hint: 'connect page', to: '/pages', icon: Facebook },
  { label: 'Go to Inbox', hint: 'messages chat', to: '/inbox', icon: Inbox },
  { label: 'Go to Orders', hint: 'cod delivery', to: '/orders', icon: ShoppingBag },
  { label: 'Compose broadcast', hint: 'offer promo', to: '/broadcast', icon: Megaphone },
  { label: 'Train AI', hint: 'knowledge faq', to: '/training', icon: GraduationCap },
  { label: 'Bot settings', hint: 'tone language', to: '/bot', icon: Settings },
  { label: 'View customers', hint: 'people', to: '/customers', icon: Users },
  { label: 'View analytics', hint: 'stats charts', to: '/analytics', icon: BarChart3 },
  { label: 'Billing & packages', hint: 'pay bkash', to: '/billing', icon: CreditCard },
  { label: 'Open simulator', hint: 'test dev', to: '/simulator', icon: FlaskConical },
];

export default function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(t));
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open ]);

  useEffect(() => setIdx(0), [q]);

  function go(to: string) {
    setOpen(false);
    nav(to);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="animate-pop relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search size={17} className="text-slate-400" />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Type a command or search pages…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === 'Enter' && list[idx]) go(list[idx].to);
              if (e.key === 'Escape') setOpen(false);
            }}
          />
          <kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-auto p-1.5">
          {list.map((c, i) => (
            <button
              key={c.to}
              onMouseEnter={() => setIdx(i)}
              onClick={() => go(c.to)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${i === idx ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <c.icon size={17} />
              <span className="font-medium">{c.label}</span>
              {i === idx && <CornerDownLeft size={14} className="ml-auto opacity-70" />}
            </button>
          ))}
          {!list.length && <div className="p-5 text-center text-xs text-slate-500">No matching command.</div>}
        </div>
      </div>
    </div>
  );
}
