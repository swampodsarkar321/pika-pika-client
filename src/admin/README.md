# Super Admin (client side)

The seller-only control room lives in this folder — nowhere else.

- `AdminPanel.tsx` — overview cards, plan donut, workspace cards
  (plan / suspend / AI key), payment-claims queue.
- Route: `/admin` (see `../App.tsx`).
- Sidebar link: gold **Super Admin** entry, rendered only when
  `GET /api/admin/me` returns 200 (see `../components/Layout.tsx`).
- Regular clients never see this page — the API returns 403 for them.
