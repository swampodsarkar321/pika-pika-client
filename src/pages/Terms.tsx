import { Link } from 'react-router-dom';
import { BRAND } from '../lib/brand';
import { Scale, CreditCard, Zap, AlertTriangle, RefreshCcw } from 'lucide-react';

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-violet-500" />
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md"><Icon size={16} /></span>
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </div>
  );
}

export default function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/" className="text-xs text-indigo-600">← Back to {BRAND.name}</Link>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"><Scale size={24} /></span>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500">{BRAND.name} · Last updated: October 2026</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Section icon={Zap} title="1. Service description">
          <p>{BRAND.name} provides an AI chatbot that connects to a business's Facebook Page and automatically replies to customer messages using the business's own information (FAQs, prices, hours, policies).</p>
        </Section>

        <Section icon={CreditCard} title="2. Payment & refund">
          <p>Packages are paid in advance via bKash (or another agreed method). One-time setup fees are non-refundable after work has started. Monthly fees cover the calendar month and are not prorated. If the service is unavailable for more than 48 consecutive hours due to our fault, we will extend the subscription accordingly.</p>
        </Section>

        <Section icon={AlertTriangle} title="3. Acceptable use">
          <p>You must not use the service to send spam, harass customers, violate Meta's policies, or mislead customers into thinking they are talking to a human. You remain responsible for your own business communications and must comply with applicable consumer-protection laws.</p>
        </Section>

        <Section icon={RefreshCcw} title="4. AI limitations">
          <p>AI replies are generated automatically and may occasionally be inaccurate. You should review important business information before relying on it. We will provide a fallback message when the AI cannot answer, and offer human handover.</p>
        </Section>

        <Section icon={Scale} title="5. Liability">
          <p>The service is provided "as is". To the maximum extent permitted by law, we are not liable for lost profits, lost sales, or indirect damages arising from use of the service. Our total liability is limited to the fees you paid in the last 3 months.</p>
        </Section>

        <Section icon={Scale} title="6. Termination">
          <p>Either party may terminate at any time with written notice. On termination, access stops and we retain data for 30 days so you can export it, after which it is deleted per our Privacy Policy.</p>
        </Section>
      </div>
    </div>
  );
}
