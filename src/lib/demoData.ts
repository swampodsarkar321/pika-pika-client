// Realistic sample data shown ONLY in demo mode. Never shown as live stats in production.
export const demoOverview = {
  month: 'demo',
  messagesReceived: 1284,
  aiRepliesSent: 1102,
  humanRepliesSent: 96,
  conversationsHandled: 342,
  unanswered: 8,
  waitingHuman: 5,
  resolved: 329,
  humanHandovers: 21,
  aiErrors: 12,
  aiSuccessRate: 85.8,
};

export const demoUsage = {
  plan: 'free',
  aiRepliesUsed: 164,
  aiRepliesLimit: 200,
  remaining: 36,
  nearQuota: true,
  overQuota: false,
  raw: { incoming: 1284, aiReplies: 164, humanReplies: 96, aiErrors: 12 },
  dailyConversations: [
    { date: '2026-09-26', count: 18 },
    { date: '2026-09-27', count: 24 },
    { date: '2026-09-28', count: 31 },
    { date: '2026-09-29', count: 22 },
    { date: '2026-09-30', count: 27 },
    { date: '2026-10-01', count: 35 },
    { date: '2026-10-02', count: 29 },
  ],
};

export const demoConversations = [
  { id: 'P1_1001', customerName: 'Rahim Uddin', psid: '1001', status: 'open', lastMessage: 'ডেলিভারি চার্জ কত?', lastMessageAt: Date.now() - 1000 * 60 * 4, unread: 2 },
  { id: 'P1_1002', customerName: 'Sara Khan', psid: '1002', status: 'waiting_human', lastMessage: 'I want a refund please', lastMessageAt: Date.now() - 1000 * 60 * 26, unread: 1 },
  { id: 'P1_1003', customerName: 'Tanvir Ahmed', psid: '1003', status: 'resolved', lastMessage: 'Thanks, got it!', lastMessageAt: Date.now() - 1000 * 60 * 90, unread: 0 },
  { id: 'P1_1004', customerName: 'Nusrat J.', psid: '1004', status: 'open', lastMessage: 'Price koto red kurti tar?', lastMessageAt: Date.now() - 1000 * 60 * 140, unread: 0 },
];

export const demoMessages: Record<string, Array<{ id: string; sender: string; text: string; createdAt: number }>> = {
  P1_1001: [
    { id: 'm1', sender: 'customer', text: 'আসসালামু আলাইকুম, ডেলিভারি চার্জ কত?', createdAt: Date.now() - 1000 * 60 * 6 },
    { id: 'm2', sender: 'bot', text: 'ওয়ালাইকুম আসসালাম! ঢাকার ভিতরে ডেলিভারি ৬০ টাকা, বাইরে ১২০ টাকা।', createdAt: Date.now() - 1000 * 60 * 5 },
  ],
  P1_1002: [
    { id: 'm1', sender: 'customer', text: 'My order arrived damaged. I want a refund.', createdAt: Date.now() - 1000 * 60 * 30 },
    { id: 'm2', sender: 'bot', text: 'I’m sorry about that — I’ve flagged this for our team and a human agent will take over shortly.', createdAt: Date.now() - 1000 * 60 * 29 },
  ],
};

export const demoKnowledge = [
  { id: 'kb1', type: 'faq', question: 'ডেলিভারি চার্জ কত?', answer: 'ঢাকার ভিতরে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।', enabled: true, updatedAt: Date.now() - 86400000 },
  { id: 'kb2', type: 'hours', title: 'Opening hours', answer: 'Sat–Thu, 10am–8pm. Friday closed.', enabled: true, updatedAt: Date.now() - 172800000 },
  { id: 'kb3', type: 'policy', title: 'Refund policy', answer: 'Refunds or exchanges within 7 days for unused items with receipt.', enabled: true, updatedAt: Date.now() - 259200000 },
];

export const demoPages = [
  { pageId: '123456789', pageName: 'Demo Fashion House', subscribed: true, hasToken: true },
];
