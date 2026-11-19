import { useEffect, useId, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Briefcase,
  Car,
  Coffee,
  Fuel,
  Home,
  PiggyBank,
  Repeat,
  Shield,
  ShoppingBag,
  Smartphone,
  TrainFront,
  Utensils,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { formatCompact, formatMoney } from "@/lib/finance";
import { useI18n } from "@/lib/i18n";

export function ClientOnly({ children, className }: { children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  if (!on) return <div className={className} />;
  return <div className={className}>{children}</div>;
}

export function BudgetRing({
  fraction,
  amount,
  negative,
  onClick,
}: {
  fraction: number;
  amount: string;
  negative?: boolean;
  onClick: () => void;
}) {
  const gid = useId().replace(/:/g, "");
  const { t } = useI18n();
  const size = 280;
  const stroke = 22;
  const r = 112;
  const c = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, fraction));
  const dash = round1(c * f);
  const gap = round1(c - dash);
  const dots = 46;
  const dotR = 78;
  const n = (v: number) => round1(v);
  return (
    <button type="button" onClick={onClick} className="relative mx-auto block" aria-label={t("editBudget")}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7af0ff" />
            <stop offset="42%" stopColor="#3ad7ff" />
            <stop offset="100%" stopColor="#1aa4ff" />
          </linearGradient>
        </defs>
        <g transform={`rotate(248 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(56, 120, 170, 0.28)" strokeWidth={16} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{ filter: "drop-shadow(0 0 10px rgba(58,215,255,0.65))" }}
          />
        </g>
        {Array.from({ length: dots }).map((_, i) => {
          const a = (i / dots) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={n(size / 2 + Math.cos(a) * dotR)}
              cy={n(size / 2 + Math.sin(a) * dotR)}
              r={2.1}
              fill="rgba(90, 170, 220, 0.72)"
            />
          );
        })}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-hero font-semibold tracking-tight ${negative ? "text-danger" : ""}`}>{amount}</span>
        <span className="mt-1 max-w-[9.2rem] text-center text-sm leading-tight text-muted">{t("leftToSpend")}</span>
      </span>
    </button>
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function Spark({ values, color = "var(--color-cyan)" }: { values: number[]; color?: string }) {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length < 2) return <div className="h-12" />;
  const w = 150;
  const h = 52;
  const pad = 4;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = max - min || 1;
  const pts = clean.map((v, i) => {
    const x = pad + (i / (clean.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const fill = `${d} L${last[0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-12 w-full" aria-hidden>
      <path d={fill} fill={color} opacity={0.16} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3.3} fill={color} />
    </svg>
  );
}

export function MiniDonut({ slices }: { slices: { value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 28;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = slices.length > 1 ? 3 : 0;
  return (
    <svg viewBox="0 0 80 80" className="mx-auto h-[4.6rem] w-[4.6rem]" aria-hidden>
      <g transform="rotate(-90 40 40)">
        {slices.map((slice, i) => {
          const len = Math.max(0, (slice.value / total) * c - gap);
          const el = (
            <circle
              key={i}
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="11"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += (slice.value / total) * c;
          return el;
        })}
      </g>
    </svg>
  );
}

export function Gauge({ pct }: { pct: number }) {
  const gid = useId().replace(/:/g, "");
  const visual = Math.max(0, Math.min(1, pct / 40));
  const r = 46;
  const len = Math.PI * r;
  const a = Math.PI * (1 - visual);
  const cx = round1(60 + r * Math.cos(a));
  const cy = round1(60 - r * Math.sin(a));
  return (
    <svg viewBox="0 0 120 72" className="h-16 w-full" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3ddc97" />
          <stop offset="48%" stopColor="#3ad7ff" />
          <stop offset="100%" stopColor="#4c8dff" />
        </linearGradient>
      </defs>
      <path d="M14 60 A46 46 0 0 1 106 60" fill="none" stroke="color-mix(in oklab, var(--color-white) 8%, transparent)" strokeWidth="9" strokeLinecap="round" />
      <path
        d="M14 60 A46 46 0 0 1 106 60"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${round1(len * visual)} ${round1(len)}`}
      />
      <circle cx={cx} cy={cy} r="7" fill="#071018" stroke="#d9f7ff" strokeWidth="3" style={{ filter: "drop-shadow(0 0 6px rgba(58,215,255,0.9))" }} />
    </svg>
  );
}

export function UpcomingBars({ items }: { items: { day: number; amount: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.amount));
  return (
    <div className="relative mt-2 h-16">
      {items.map((item, i) => (
        <span
          key={`${item.day}-${i}`}
          className="absolute bottom-4 w-1.5 rounded-sm bg-savings"
          style={{
            left: `${((item.day - 1) / 30) * 100}%`,
            height: `${Math.max(12, (item.amount / max) * 70)}%`,
          }}
        />
      ))}
      <span className="absolute inset-x-0 bottom-0 flex justify-between text-micro text-faint">
        <span>1</span>
        <span>7</span>
        <span>13</span>
        <span>19</span>
        <span>25</span>
      </span>
    </div>
  );
}

export function FlowBars({
  parts,
  ratio,
}: {
  parts: { color: string; value: number }[];
  ratio: number;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-micro text-faint">↓</span>
        <span className="h-2.5 flex-1 rounded-full bg-cyan" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-micro text-faint">↑</span>
        <span className="flex h-2.5 overflow-hidden rounded-full" style={{ width: `${Math.max(12, Math.min(100, ratio * 100))}%` }}>
          {parts.map((p, i) => (
            <span key={i} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
          ))}
        </span>
      </div>
    </div>
  );
}

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-bg/95 px-3 py-2 text-micro shadow-lg ring-1 ring-white/10">
      <div className="mb-1 text-muted">{label}</div>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}</span>
          <span className="font-medium">{formatMoney(Number(p.value) || 0)}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({
  current,
  average,
  cutoff,
  currentName = "This month",
  averageName = "Average",
}: {
  current: number[];
  average: number[];
  cutoff: number;
  currentName?: string;
  averageName?: string;
}) {
  const data = current.map((value, i) => ({
    day: i + 1,
    current: i < cutoff ? value : null,
    average: average[i] ?? 0,
  }));
  const peak = Math.max(1, ...data.map((d) => Math.max(d.current ?? 0, d.average)));
  const last = data[Math.max(0, cutoff - 1)] ?? data[data.length - 1];
  return (
    <ClientOnly className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="color-mix(in oklab, var(--color-white) 6%, transparent)" />
          <XAxis
            dataKey="day"
            ticks={[5, 10, 15, 20, 25, 30].filter((d) => d <= data.length)}
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            orientation="right"
            domain={[0, Math.ceil(peak / 200) * 200]}
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={formatCompact}
          />
          <Tooltip content={<ChartTip />} />
          {cutoff > 0 ? (
            <ReferenceLine x={cutoff} stroke="color-mix(in oklab, var(--color-white) 45%, transparent)" strokeDasharray="3 4" />
          ) : null}
          <Area
            type="monotone"
            dataKey="current"
            name={currentName}
            stroke="var(--color-cyan)"
            strokeWidth={3}
            fill="url(#spendFill)"
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="average"
            name={averageName}
            stroke="#e7edf6"
            strokeWidth={2.4}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />
          {last && last.current != null ? (
            <ReferenceDot x={last.day} y={last.current} r={5} fill="var(--color-cyan)" stroke="none" />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

export function StackedMonths({
  rows,
  keys,
}: {
  rows: { label: string; parts: Record<string, number> }[];
  keys: { id: string; color: string; label?: string }[];
}) {
  const data = rows.map((r) => ({ label: r.label, ...r.parts }));
  return (
    <ClientOnly className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
          <XAxis dataKey="label" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTip />} cursor={{ fill: "color-mix(in oklab, var(--color-white) 4%, transparent)" }} />
          {keys.map((k) => (
            <Bar key={k.id} dataKey={k.id} name={k.label ?? k.id} stackId="s" fill={k.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

export function BalanceChart({ points, seriesName = "Balance" }: { points: { date: string; value: number }[]; seriesName?: string }) {
  const ticks = points.filter((_, i) => i % Math.ceil(points.length / 4) === 0).map((p) => p.date);
  return (
    <ClientOnly className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-good)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-good)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="color-mix(in oklab, var(--color-white) 5%, transparent)" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={(d: string) => d.slice(5, 7).replace(/^0/, "")}
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTip />} />
          <Area
            type="monotone"
            dataKey="value"
            name={seriesName}
            stroke="var(--color-good)"
            strokeWidth={2.5}
            fill="url(#balFill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ClientOnly>
  );
}

export function Sankey({
  links,
  mode,
}: {
  links: { source: string; target: string; value: number; color: string }[];
  mode: "amount" | "pct";
}) {
  const { t } = useI18n();
  if (!links.length) return <p className="py-16 text-center text-muted">{t("nothingSpent")}</p>;
  const total = links.reduce((s, l) => s + l.value, 0) || 1;
  const label = (value: number) =>
    mode === "pct" ? `${Math.round((value / total) * 1000) / 10}%` : formatMoney(value, 2);

  const right = [...links].sort((a, b) => b.value - a.value || a.target.localeCompare(b.target));
  const groups: { name: string; color: string; value: number }[] = [];
  for (const link of links) {
    const found = groups.find((g) => g.name === link.source);
    if (found) found.value += link.value;
    else groups.push({ name: link.source, color: link.color, value: link.value });
  }
  groups.sort((a, b) => b.value - a.value);

  const slot = 22;
  const height = 16 + right.length * slot;
  const rightNodes = right.map((link, i) => {
    const thick = Math.max(3.5, Math.min(slot - 8, (link.value / (right[0]?.value || 1)) * (slot - 6)));
    const top = 10 + i * slot;
    return { y: top + (slot - thick) / 2, h: thick, labelY: top + slot / 2 + 1 };
  });
  const leftNodes = layout(
    groups.map((g) => g.value),
    height - 20,
    10,
  );

  const xCat = 126;
  const xMerch = 200;

  const ribbons = right.map((link, i) => {
    const gi = groups.findIndex((g) => g.name === link.source);
    const g = groups[gi];
    const siblings = right.filter((l) => l.source === link.source);
    const before = siblings.slice(0, siblings.indexOf(link)).reduce((s, l) => s + l.value, 0);
    const top = leftNodes[gi].y + (before / g.value) * leftNodes[gi].h;
    const bot = top + (link.value / g.value) * leftNodes[gi].h;
    return (
      <path
        key={`${link.source}-${link.target}`}
        d={ribbon(xCat + 3, top, bot, xMerch, rightNodes[i].y, rightNodes[i].y + rightNodes[i].h)}
        fill={link.color}
        opacity={0.62}
      />
    );
  });

  const inflow = groups.map((g, i) => {
    const node = leftNodes[i];
    return (
      <path
        key={g.name}
        d={ribbon(36, node.y + 4, node.y + node.h - 4, xCat, node.y, node.y + node.h)}
        fill={g.color}
        opacity={0.38}
      />
    );
  });

  return (
    <svg viewBox={`0 0 390 ${height}`} className="w-full" role="img" aria-label="Money flow">
      {inflow}
      {ribbons}
      {groups.map((g, i) => {
        const node = leftNodes[i];
        const mid = node.y + node.h / 2;
        return (
          <g key={g.name}>
            <rect x={xCat - 108} y={round1(mid - 16)} width={100} height={32} rx={8} fill="color-mix(in oklab, var(--color-bg) 78%, transparent)" />
            <rect x={xCat} y={round1(node.y)} width={3} height={round1(node.h)} rx={1.5} fill={g.color} />
            <text x={xCat - 14} y={round1(mid - 2)} textAnchor="end" fill="var(--color-fg)" fontSize="11" fontWeight={600} fontFamily="Outfit, sans-serif">
              {g.name}
            </text>
            <text x={xCat - 14} y={round1(mid + 12)} textAnchor="end" fill="#c5d0e0" fontSize="10" fontFamily="Outfit, sans-serif">
              {label(g.value)}
            </text>
          </g>
        );
      })}
      {right.map((n, i) => {
        const node = rightNodes[i];
        return (
          <g key={n.target}>
            <rect x={xMerch} y={round1(node.y)} width={3} height={round1(Math.max(6, node.h))} rx={1.5} fill={n.color} />
            <text x={xMerch + 8} y={round1(node.labelY)} fill="var(--color-fg)" fontSize="11" fontFamily="Outfit, sans-serif">
              {n.target} {label(n.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function layout(values: number[], span: number, origin: number) {
  const total = values.reduce((s, v) => s + v, 0) || 1;
  const gap = 4;
  const usable = span - gap * Math.max(0, values.length - 1);
  const min = 36;
  const raw = values.map((v) => Math.max(min, (v / total) * usable));
  const scale = usable / raw.reduce((s, v) => s + v, 0);
  let y = origin;
  return raw.map((h) => {
    const node = { y, h: h * scale };
    y += node.h + gap;
    return node;
  });
}

function ribbon(x1: number, y1a: number, y1b: number, x2: number, y2a: number, y2b: number) {
  const c = (x2 - x1) * 0.55;
  return `M ${x1} ${y1a} C ${x1 + c} ${y1a}, ${x2 - c} ${y2a}, ${x2} ${y2a} L ${x2} ${y2b} C ${x2 - c} ${y2b}, ${x1 + c} ${y1b}, ${x1} ${y1b} Z`;
}

const ICONS: [RegExp, LucideIcon][] = [
  [/coffee|cappuccino/i, Coffee],
  [/insurance|shield/i, Shield],
  [/transit|train|pass/i, TrainFront],
  [/rent|housing/i, Home],
  [/salary|paycheck/i, Briefcase],
  [/fuel|gas/i, Fuel],
  [/car|loan/i, Car],
  [/dining|dinner|lunch|grocer/i, Utensils],
  [/internet|wifi/i, Wifi],
  [/phone/i, Smartphone],
  [/saving|invest|retirement/i, PiggyBank],
  [/shop|cloud|storage/i, ShoppingBag],
  [/gym|wellness|pharmacy/i, Repeat],
];

export function iconFor(title: string): LucideIcon {
  return ICONS.find(([re]) => re.test(title))?.[1] ?? Wallet;
}

export function TxnAvatar({ title, color }: { title: string; color: string }) {
  const Icon = iconFor(title);
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-full"
      style={{ background: `${color}22`, color }}
    >
      <Icon size={18} />
    </span>
  );
}
