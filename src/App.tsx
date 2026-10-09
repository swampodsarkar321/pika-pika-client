import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import Overview from './pages/Overview';
import Pages from './pages/Pages';
import Inbox from './pages/Inbox';
import Training from './pages/Training';
import BotSettings from './pages/BotSettings';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Billing from './pages/Billing';
import Account from './pages/Account';
import Simulator from './pages/Simulator';
import Orders from './pages/Orders';
import Broadcast from './pages/Broadcast';
import Admin from './admin/AdminPanel';
import Login, { Register, Reset } from './pages/Auth';
import Privacy from './pages/Privacy';
import type { JSX } from 'react';

function Guard({ children }: { children: JSX.Element }) {
  const { user, loading, demo } = useAuth();
  if (loading) return <div className="p-8 text-sm">Loading…</div>;
  if (!user && !demo) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route
        path="/*"
        element={
          <Guard>
            <Layout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/pages" element={<Pages />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/broadcast" element={<Broadcast />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/training" element={<Training />} />
                <Route path="/bot" element={<BotSettings />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/team" element={<Team />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Guard>
        }
      />
    </Routes>
  );
}
