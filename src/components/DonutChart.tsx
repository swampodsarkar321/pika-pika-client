// Lightweight SVG donut chart — no dependencies.
export interface Slice {
  label: string;
  value: number;
  color: string;
}

export default function DonutChart({ slices, size = 168, thickness = 26, centerTop, centerBottom }: {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerBottom?: string;
}) {
  const total = slices.reduce((n, s) => n + s.value, 0) || 1;
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = slices.map((s) => {
    const frac = s.value / total;
    const seg = { ...s, dash: `${(frac * C).toFixed(1)} ${(C - frac * C).toFixed(1)}`, offset: (-acc * C).toFixed(1) };
    acc += frac;
    return seg;
  });
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" strokeWidth={thickness} className="stroke-slate-100 dark:stroke-slate-800" />
          {segs.map((g, i) => (
            <circle key={i} cx={size / 2} cy={size / 2} r={R} fill="none" stroke={g.color}
              strokeWidth={thickness} strokeDasharray={g.dash} strokeDashoffset={g.offset}
              strokeLinecap="butt" className="donut-seg" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-black">{centerTop ?? total}</div>
          {centerBottom && <div className="text-[11px] text-slate-500">{centerBottom}</div>}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-slate-600 dark:text-slate-300">{s.label}</span>
            <span className="ml-auto font-semibold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
