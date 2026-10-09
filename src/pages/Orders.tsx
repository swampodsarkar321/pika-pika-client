import { useEffect, useState } from 'react';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { BRAND } from '../lib/brand';
import { PageHead, Empty } from '../components/Layout';
import DonutChart from '../components/DonutChart';

const STATUS_COLORS: Record<string, string> = { new: '#6366f1', confirmed: '#0ea5e9', shipped: '#f59e0b', delivered: '#10b981', cancelled: '#ef4444' };

/** BD mobile (01XXXXXXXXX) → wa.me international format (8801XXXXXXXXX). */
function waLink(phone: string, text: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  const m = digits.match(/(01\d{9})$/);
  if (!m) return null;
  const intl = '880' + m[1].slice(1);
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

const STATUSES = ['all', 'new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const demoOrders = [
  { key: 'd1', id: 'ORD-261009-AB12', product: 'Chocolate Cake', qty: 2, name: 'Rahim Uddin', phone: '01712345678', address: 'Dhanmondi, Dhaka', status: 'new', createdAt: Date.now() - 3600000 },
  { key: 'd2', id: 'ORD-261008-XK9Q', product: 'Red Kurti', qty: 1, name: 'Sara Khan', phone: '01987654321', address: 'Mirpur, Dhaka', status: 'confirmed', createdAt: Date.now() - 86400000 },
];

export default function Orders() {
  const { token, demo } = useAuth();
  const [orders, setOrders] = useState<any[]>(demo ? demoOrders : []);
  const [filter, setFilter] = useState('all');

  const ws = () => localStorage.getItem('workspaceId') ?? '';

  async function load() {
    if (demo || !token) return;
    try {
      const r = await api<any>(`/api/orders?workspaceId=${ws()}&status=${filter}`, { token });
      setOrders(r.orders ?? []);
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    if (demo) setOrders(demoOrders);
    else load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, token, filter]);

  async function setStatus(key: string, status: string) {
    if (demo) {
      setOrders((l) => l.map((o) => (o.key === key ? { ...o, status } : o)));
      return;
    }
    if (!token) return;
    await api(`/api/orders/${key}/status`, { method: 'PATCH', token, body: { workspaceId: ws(), status } });
    load();
  }

  return (
    <div>
      <PageHead
        title="Orders"
        sub="Cash-on-delivery orders collected by the bot"
        actions={
          <select className="input !w-36" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      />
      {!orders.length ? (
        <Empty title="No orders yet" sub="When a customer says 'I want to order', the bot collects details step by step and the order lands here." />
      ) : (
        <>
        <div className="card mb-3 p-5">
          <div className="text-sm font-semibold">Order pipeline</div>
          <div className="mt-2">
            <DonutChart
              slices={Object.entries(
                orders.reduce((m: Record<string, number>, o: any) => {
                  m[o.status] = (m[o.status] ?? 0) + 1;
                  return m;
                }, {}),
              ).map(([label, value]) => ({ label, value: value as number, color: STATUS_COLORS[label] ?? '#6366f1' }))}
              centerTop={String(orders.length)}
              centerBottom="orders"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {orders.map((o) => (
            <div key={o.key} className="card p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-indigo-600" />
                <span className="font-medium">{o.id}</span>
                <span className={`badge ml-auto ${o.status === 'new' ? 'bg-indigo-100 text-indigo-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>{o.status}</span>
              </div>
              <div className="mt-2 text-sm"><b>{o.product}</b> × {o.qty}</div>
              <div className="mt-1 text-xs text-slate-500">{o.name} · {o.phone}</div>
              <div className="text-xs text-slate-500">{o.address}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(() => {
                  const link = waLink(o.phone, `আসসালামু আলাইকুম ${o.name}! ${BRAND.name} থেকে বলছি — আপনার অর্ডার ${o.id} (${o.product} x${o.qty}) কনফার্ম করছি।`);
                  return link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-[#25D366] px-2.5 py-1 text-[11px] font-semibold text-white shadow-md shadow-green-500/30 transition hover:brightness-110 active:scale-95">
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  ) : null;
                })()}
                {['confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button key={s} className="btn-ghost !px-2 !py-1 text-[11px]" onClick={() => setStatus(o.key, s)} disabled={o.status === s}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
