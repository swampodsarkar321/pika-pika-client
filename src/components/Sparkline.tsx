// Minimal SVG area sparkline — no dependencies.
export default function Sparkline({ data, width = 120, height = 36, stroke = '#6366f1', id }: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  id: string;
}) {
  if (!data.length) return <div style={{ width, height }} />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 3 - ((v - min) / range) * (height - 8)).toFixed(1)}`);
  const line = `M${pts.join(' L')}`;
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gid = `sg-${id}`;
  return (
    <svg width={width} height={height} className="overflow-visible opacity-90 dark:opacity-100 dark:drop-shadow-[0_0_6px_rgba(129,140,248,0.45)]">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.55" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={Number(pts[pts.length - 1].split(',')[1])} r="3.5" fill={stroke} stroke="white" strokeOpacity="0.85" strokeWidth="1" />
    </svg>
  );
}
