import { useEffect, useRef, useState } from 'react';

// Animated number counter (ease-out). Formats with % suffix passthrough.
export default function CountUp({ value, duration = 900 }: { value: number | string; duration?: number }) {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const suffix = typeof value === 'string' ? String(value).replace(/^[0-9.,\s]+/, '') : '';
  const [n, setN] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(num * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [num, duration]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}
