// Central brand config — change name/tagline/logo here, whole app updates.
export const BRAND = {
  name: 'Pika Pika',
  tagline: 'Messenger chatbot platform',
  // Single letter shown in the sidebar avatar. Replace with <img> logo later.
  initial: 'P',
  // Set to a logo image URL/path when ready, e.g. '/logo.png'
  logoUrl: '/logo.png' as string,
  supportEmail: 'mdswampodsarkar@gmail.com',
};

export function docTitle(page?: string): string {
  return page ? `${page} — ${BRAND.name}` : `${BRAND.name} — Messenger Chatbot Platform`;
}
