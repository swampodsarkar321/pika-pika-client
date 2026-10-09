import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Bot, ShoppingBag, AlertCircle, ArrowRight, Sparkles,
  Inbox, Megaphone, GraduationCap, BellRing,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { demoOverview, demoUsage, demoConversations } from '../lib/demoData';
import { Loading } from '../components/Layout';
import { BRAND } from '../lib/brand';
import DonutChart from '../components/DonutChart';
import CountUp from '../components/CountUp';
import Sparkline from '../components/Sparkline';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface FeedItem {
  icon: any;
  color: string;
  text: string;
  time: number;
  to: string;
}

export default function Overview() {
  const { token, demo, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [daily, setDaily] = useState<number[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (demo || !token) {
        setData(demoOverview);
        setDaily(demoUsage.dailyConversations.map((d: any) => d.count));
        setFeed([
          { icon: ShoppingBag, color: '#10b981', text: 'New COD order ORD-261009-AB12 (2 × Chocolate Cake)', time: Date.now() - 1000 * 60 * 12, to: '/orders' },
          { icon: MessageSquare, color: '#6366f1', text: 'Rahim asked about delivery charge', time: Date.now() - 1000 * 60 * 30, to: '/inbox' },
          { icon: BellRing, color: '#f59e0b', text: 'Handover: Sara requested a refund', time: Date.now() - 1000 * 60 * 65, to: '/inbox' },
        ]);
        setLoading(false);
        return;
      }
      try {
        const ws = localStorage.getItem('workspaceId');
        const [o, u, c, or, n] = await Promise.all([
          api<any>(`/api/analytics/overview?workspaceId=${ws}`, { token }),
          api<any>(`/api/analytics/usage?workspaceId=${ws}`, { token }).catch(() => null),
          api<any>(`/api/conversations?workspaceId=${ws}&status=all`, { token }).catch(() => ({ conversations: [] })),
          api<any>(`/api/orders?workspaceId=${ws}&status=all`, { token }).catch(() => ({ orders: [] })),
          api<any>(`/api/notifications?workspaceId=${ws}`, { token }).catch(() => ({ notifications: [] })),
        ]);
        setData(o);
        setDaily((u?.dailyConversations ?? []).map((d: any) => d.count));
        const items: FeedItem[] = [
          ...(or?.orders ?? []).slice(0, 3).map((x: any) => ({
            icon: ShoppingBag, color: '#10b981',
            text: `New order ${x.id} (${x.qty} × ${x.product})`, time: x.createdAt ?? 0, to: '/orders',
          })),
          ...(n?.notifications ?? []).slice(0, 3).map((x: any) => ({
            icon: BellRing, color: '#f59e0b',
            text: x.kind === 'payment_claim' ? `Payment claim (${x.package})` : `${x.kind} — ${x.reason ?? x.orderId ?? ''}`,
            time: x.createdAt ?? 0, to: x.kind === 'payment_claim' ? '/billing' : '/inbox',
          })),
          ...(c?.conversations ?? []).slice(0, 3).map((x: any) => ({
            icon: MessageSquare, color: '#6366f1',
            text: `${x.customerName ?? 'Customer'}: ${(x.lastMessage ?? '').slice(0, 60)}`,
            time: x.lastMessageAt ?? 0, to: '/inbox',
          })),
        ];
        items.sort((a, b) => b.time - a.time);
        setFeed(items.slice(0, 6));
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, demo]);

  if (loading) return <Loading label="overview" />;
  if (!data) {
    return (
      <div className="card p-8 text-center text-sm">
        No workspace selected yet. Create one from the Account page, or enable demo mode to preview.
      </div>
    );
  }

  const stats = [
    { icon: MessageSquare, label: 'Messages', value: data.messagesReceived, grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', spark: daily, sc: '#6366f1' },
    { icon: Bot, label: 'AI replies', value: data.aiRepliesSent, grad: 'linear-gradient(135deg,#8b5cf6,#d946ef)', spark: daily.map((v) => Math.round(v * 0.85)), sc: '#8b5cf6' },
    { icon: ShoppingBag, label: 'Orders', value: feed.filter((f) => f.text.startsWith('New order')).length || data.ordersCount || 0, grad: 'linear-gradient(135deg,#10b981,#0ea5e9)', spark: daily.map((v) => Math.max(0, Math.round(v * 0.2))), sc: '#10b981' },
    { icon: AlertCircle, label: 'Needs human', value: (data.unanswered ?? 0) + (data.waitingHuman ?? 0), grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', spark: daily.map(() => 1), sc: '#f59e0b' },
  ];

  const insight =
    (data.unanswered ?? 0) + (data.waitingHuman ?? 0) > 0
      ? `${(data.unanswered ?? 0) + (data.waitingHuman ?? 0)} conversations need a human — clear them from the Inbox to keep response time sharp.`
      : `All caught up. Your AI handled ${data.aiRepliesSent ?? 0} replies with a ${data.aiSuccessRate ?? 0}% success rate.`;

  const ago = (t: number) => {
    const m = Math.max(1, Math.round((Date.now() - t) / 60000));
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
  };

  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="animate-enter relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/25 md:p-7" style={{ backgroundImage: 'linear-gradient(130deg,#4338ca 0%,#7c3aed 55%,#c026d3 125%)' }}>
        <div className="orb right-[-40px] top-[-60px] h-56 w-56 bg-white/25" />
        <div className="orb bottom-[-80px] left-[30%] h-48 w-48 bg-fuchsia-300/40" />
        <div className="relative">
          <div className="text-xs font-medium uppercase tracking-widest text-white/70">{greeting()}{user?.email ? ` · ${user.email.split('@')[0]}` : ''}</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Here's your business today.</h1>
          <div className="mt-2 flex max-w-xl items-start gap-2 rounded-2xl bg-white/15 p-3 text-sm backdrop-blur">
            <Sparkles size={16} className="mt-0.5 shrink-0" />
            <span>{demo ? 'Sample data — demo mode.' : ''} {insight}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/inbox" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-700 shadow transition hover:brightness-95">Open inbox →</Link>
            <Link to="/broadcast" className="rounded-xl bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/30">Send broadcast</Link>
            <Link to="/training" className="rounded-xl bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/30">Train AI</Link>
          </div>
        </div>
      </div>

      {/* Bento stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`card card-hover animate-enter stagger-${i + 1} flex items-center justify-between gap-2 overflow-hidden p-4`}>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ backgroundImage: s.grad }}><s.icon size={14} /></span>
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
              </div>
              <div className="mt-1.5 text-3xl font-black tracking-tight"><CountUp value={s.value} /></div>
            </div>
            <Sparkline data={s.spark} id={`ov-${i}`} stroke={s.sc} />
          </div>
        ))}
      </div>

      {/* Bottom bento */}
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_320px]">
        <div className="card animate-enter stagger-3 p-5">
          <div className="text-sm font-bold">Conversation status</div>
          <div className="mt-2">
            <DonutChart
              slices={[
                { label: 'Resolved', value: data.resolved ?? 0, color: '#10b981' },
                { label: 'Open', value: data.unanswered ?? 0, color: '#6366f1' },
                { label: 'Waiting human', value: data.waitingHuman ?? 0, color: '#f59e0b' },
              ]}
              centerTop={String(data.conversationsHandled ?? data.conversations ?? 0)}
              centerBottom="total"
            />
          </div>
        </div>
        <div className="card animate-enter stagger-4 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Live activity</div>
            <Link to="/inbox" className="flex items-center gap-1 text-xs font-semibold text-indigo-600">Inbox <ArrowRight size={13} /></Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {feed.map((f, i) => (
              <Link key={i} to={f.to} className="flex items-start gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: f.color }}><f.icon size={15} /></span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{f.text}</span>
                <span className="shrink-0 text-[10px] text-slate-400">{ago(f.time)}</span>
              </Link>
            ))}
            {!feed.length && <div className="text-xs text-slate-500">Nothing yet — new orders and messages will stream here.</div>}
          </div>
        </div>
        <div className="card animate-enter stagger-5 bg-gradient-to-b from-indigo-600 to-violet-700 !border-0 p-5 text-white">
          <div className="text-sm font-bold">Quick actions</div>
          <div className="mt-3 grid gap-2 text-xs font-semibold">
            <Link to="/bot" className="flex items-center gap-2 rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"><Bot size={15} /> Test the bot</Link>
            <Link to="/broadcast" className="flex items-center gap-2 rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"><Megaphone size={15} /> Broadcast offer</Link>
            <Link to="/training" className="flex items-center gap-2 rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"><GraduationCap size={15} /> Add knowledge</Link>
            <Link to="/inbox" className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-indigo-700 transition hover:brightness-95"><Inbox size={15} /> Open inbox</Link>
          </div>
          <div className="mt-3 text-[11px] text-white/75">Press <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-bold">Ctrl K</kbd> anywhere for commands.</div>
        </div>
      </div>
    </div>
  );
}
