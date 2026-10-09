import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const [show, setShow] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 450);
    return () => clearTimeout(t);
  }, [loc.pathname]);

  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-[2px] dark:bg-slate-950/40">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-violet-500" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-20" />
        </div>
        <span className="text-xs font-semibold text-slate-500">Loading…</span>
      </div>
    </div>
  );
}
