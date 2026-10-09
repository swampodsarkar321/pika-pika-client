import { Link } from 'react-router-dom';
import { BRAND } from '../lib/brand';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/" className="text-xs text-indigo-600">← Back to {BRAND.name}</Link>
      <h1 className="mt-2 text-2xl font-semibold">Privacy Policy — {BRAND.name}</h1>
      <p className="mt-1 text-xs text-slate-500">Last updated: October 2026 · Contact: {BRAND.supportEmail}</p>

      <Section title="1. What this service does">
        <p>
          {BRAND.name} connects a business's Facebook Page to an AI assistant that replies to
          customer messages on Messenger, using business information the business owner provides
          (FAQs, prices, hours, policies).
        </p>
      </Section>

      <Section title="2. Data we collect">
        <p><b>Business owners:</b> account email, workspace details, knowledge-base entries, bot settings and conversation history needed to operate the service.</p>
        <p><b>Messenger customers:</b> only what Meta sends us through the official Messenger API when they message a connected Page — typically the message text, sender ID and publicly available profile name. We do not collect phone numbers, emails or other data unless the customer sends it in chat.</p>
      </Section>

      <Section title="3. How data is used">
        <p>Data is used solely to generate replies, display the inbox, enforce usage limits and improve the service for that business. We never sell personal data, never share one business's data with another, and never use customer messages for advertising.</p>
      </Section>

      <Section title="4. Data storage & security">
        <p>Data is stored in Firebase (Google Cloud) with workspace isolation and security rules. Facebook Page tokens are encrypted on our server and never exposed to browsers. AI processing is done via Google's Gemini API under Google's terms.</p>
      </Section>

      <Section title="5. Data retention & deletion">
        <p>Business owners may edit or delete knowledge entries and request deletion of their workspace data at any time by emailing {BRAND.supportEmail}. Messenger customers may ask the business to delete their conversation, or delete it via their own Messenger controls.</p>
      </Section>

      <Section title="6. User data deletion (Meta App compliance)">
        <p>To request deletion of data associated with your Facebook account, email {BRAND.supportEmail} with the subject "Data Deletion Request". We verify ownership and delete the relevant records within 7 days, then confirm by email.</p>
      </Section>

      <Section title="7. Cookies & tracking">
        <p>We use only essential authentication session storage. No advertising trackers are used.</p>
      </Section>

      <Section title="8. Changes">
        <p>Material changes to this policy will be announced in the dashboard. Continued use after changes means acceptance.</p>
      </Section>
    </div>
  );
}
