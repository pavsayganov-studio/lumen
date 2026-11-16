import { useMemo, useState, type ReactNode } from "react";
import { ChevronRight, Repeat, Share, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import {
  CATEGORIES,
  categoryById,
  formatMoney,
  formatPct,
  formatSigned,
  moneyFlow,
  savingStats,
  trendModel,
  yearModel,
  type CategoryId,
  type Transaction,
} from "@/lib/finance";
import { Sankey, StackedMonths, TrendChart, TxnAvatar } from "@/components/lumen/widgets";
import { catLabel, directionLabel, fullDate, monthLabel, monthShortLabel, projectTitle, savingWord, trendStamp, useI18n, weekHead } from "@/lib/i18n";
import { useFinance } from "@/lib/store";

export function ScreenHeader({
  title,
  subtitle,
  onClose,
  right,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  right?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2 px-4 pt-4">
      <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
        <X size={18} />
      </button>
      <div className="text-center">
        <div className="text-base font-semibold">{title}</div>
        {subtitle ? <div className="text-sm text-muted">{subtitle}</div> : null}
      </div>
      <div className="justify-self-end">{right}</div>
    </div>
  );
}

export function TrendScreen({
  txns,
  month,
  today,
  onClose,
}: {
  txns: Transaction[];
  month: string;
  today: string;
  onClose: () => void;
}) {
  const model = trendModel(txns, month, today);
  const { t, locale } = useI18n();
  const word = directionLabel(locale, model.pct);
  const stamp = today.startsWith(month) ? today : `${month}-01`;
  return (
    <div className="pb-6">
      <ScreenHeader title={t("spendingTrend")} subtitle={monthLabel(locale, month)} onClose={onClose} />
      <div className="px-5">
      <p className="mt-6 text-sm text-muted">{trendStamp(locale, stamp)}</p>
      <div className="mt-1 flex items-end gap-3">
        <p className="text-4xl font-semibold tracking-tight">{formatMoney(model.nowValue)}</p>
      </div>
      <p className={`mt-2 inline-flex items-center gap-1 text-sm ${model.pct >= 0 ? "text-cyan" : "text-good"}`}>
        <span className="grid size-5 place-items-center rounded-full bg-white/10 text-micro">{model.pct >= 0 ? "↑" : "↓"}</span>
        {formatPct(Math.abs(model.pct), false)}
      </p>
      <div className="mt-4 rounded-3xl bg-black/20 p-2 ring-1 ring-white/5">
        <TrendChart
          current={model.current}
          average={model.averages}
          cutoff={model.cutoff}
          currentName={monthLabel(locale, month)}
          averageName={t("average")}
        />
        <div className="flex gap-4 px-3 pb-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan" /> {monthLabel(locale, month)}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-white/50" /> {t("average")}
          </span>
        </div>
      </div>
      <h2 className="mt-8 text-lg font-semibold">{t("whatTrend")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("trendBody")}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">{t("trendBody2", { word: word.toLowerCase(), pct: formatPct(model.pct) })}</p>
      </div>
    </div>
  );
}

export function FlowScreen({
  txns,
  month,
  today,
  onClose,
}: {
  txns: Transaction[];
  month: string;
  today: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"eur" | "pct">("eur");
  const { t, locale } = useI18n();
  const posted = txns.filter((t) => t.date.startsWith(month) && t.date <= today);
  const links = moneyFlow(posted).map((link) => ({ ...link, source: catLabel(locale, link.categoryId) }));
  const share = async () => {
    const lines = links.map((l) => `${l.source} → ${l.target}: ${formatMoney(l.value, 2)}`);
    const text = `${t("shareText")} · ${monthLabel(locale, month)}\n${lines.join("\n")}`;
    try {
      if (navigator.share) await navigator.share({ title: t("shareText"), text });
      else {
        await navigator.clipboard.writeText(text);
        toast(t("summaryCopied"));
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };
  return (
    <div className="pb-8">
      <ScreenHeader
        title={t("moneyFlow")}
        subtitle={monthLabel(locale, month)}
        onClose={onClose}
        right={
          <button type="button" className="icon-btn" onClick={share} aria-label={t("share")}>
            <Share size={16} />
          </button>
        }
      />
      <div className="px-4">
      <div className="relative mt-4 rounded-3xl bg-black/15 p-3 ring-1 ring-white/10">
        <div className="mb-2 flex justify-end">
          <div className="segmented text-sm">
            <button type="button" data-on={mode === "eur"} onClick={() => setMode("eur")}>
              €
            </button>
            <button type="button" data-on={mode === "pct"} onClick={() => setMode("pct")}>
              %
            </button>
          </div>
        </div>
        <Sankey links={links} mode={mode} />
      </div>
      <h2 className="mt-6 px-1 text-lg font-semibold">{t("whatFlow")}</h2>
      <p className="mt-2 px-1 text-sm leading-relaxed text-muted">{t("flowBody")}</p>
      </div>
    </div>
  );
}

export function BreakdownScreen({
  txns,
  month,
  today,
  scope,
  onClose,
  onCategory,
}: {
  txns: Transaction[];
  month: string;
  today: string;
  scope: "month" | "year";
  onClose: () => void;
  onCategory: (id: CategoryId) => void;
}) {
  const [hidden, setHidden] = useState<CategoryId[]>([]);
  const [filtering, setFiltering] = useState(false);
  const { t, locale } = useI18n();
  const year = Number(month.slice(0, 4));
  const through = Number(month.slice(5, 7));
  const posted = txns.filter((t) => t.date.startsWith(month) && t.date <= today && !hidden.includes(t.categoryId as CategoryId));
  const model = yearModel(
    txns.filter((t) => !hidden.includes(t.categoryId as CategoryId)),
    year,
    through,
  );
  const monthParts = CATEGORIES.map((c) => ({
    ...c,
    value: posted.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
  })).filter((c) => c.value > 0);
  const monthTotal = monthParts.reduce((s, c) => s + c.value, 0);
  const yearParts = CATEGORIES.map((c) => ({
    ...c,
    value: model.rows.reduce((s, r) => s + (r.parts[c.id] ?? 0), 0),
  }))
    .filter((c) => c.value > 0.5)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="pb-6">
      <ScreenHeader
        title={t("breakdown")}
        subtitle={scope === "year" ? String(year) : monthLabel(locale, month)}
        onClose={onClose}
        right={
          <button type="button" className="icon-btn" aria-label={t("filter")} onClick={() => setFiltering(true)}>
            <SlidersHorizontal size={16} />
          </button>
        }
      />
      <div className="px-5">
      {scope === "month" ? (
        <>
          <div className="relative mx-auto mt-4 grid h-64 w-64 place-items-center">
            <DonutLarge slices={monthParts} />
            <div className="absolute text-center">
              <div className="text-3xl font-semibold tracking-tight">{formatMoney(monthTotal, 2)}</div>
              <div className="text-sm text-muted">{t("totalSpending")}</div>
            </div>
          </div>
          <ul className="sheet-card mt-2 divide-y divide-white/5">
            {monthParts.map((c) => (
              <li key={c.id}>
                <button type="button" className="flex w-full items-center gap-3 px-4 py-3.5 text-left" onClick={() => onCategory(c.id)}>
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 font-medium">{catLabel(locale, c.id)}</span>
                  <span>{formatMoney(c.value, 2)}</span>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              </li>
            ))}
            {monthParts.length === 0 ? <li className="px-4 py-8 text-center text-muted">{t("nothingSpent")}</li> : null}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-6 text-4xl font-semibold tracking-tight">{formatMoney(model.total)}</p>
          <p className="text-sm text-muted">{t("totalSpending")}</p>
          <div className="mt-4">
            <StackedMonths
              rows={model.rows.map((row) => ({ ...row, label: monthShortLabel(locale, row.month) }))}
              keys={CATEGORIES.filter((c) => !hidden.includes(c.id)).map((c) => ({
                id: c.id,
                color: c.color,
                label: catLabel(locale, c.id),
              }))}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="sheet-card p-4">
              <p className="text-sm text-muted">{t("monthlyAvg")}</p>
              <p className="mt-1 text-xl font-semibold">{formatMoney(model.avg, 2)}</p>
              <p className="text-sm text-muted">{directionLabel(locale, model.direction === "Increasing" ? 10 : model.direction === "Decreasing" ? -10 : 0)}</p>
            </div>
            <div className="sheet-card p-4">
              <p className="text-sm text-muted">{t("peak")}</p>
              <p className="mt-1 text-xl font-semibold">{formatMoney(model.peak?.total ?? 0, 2)}</p>
              <p className="text-sm text-muted">{model.peak ? monthShortLabel(locale, model.peak.month) : "—"}</p>
            </div>
          </div>
          <ul className="mt-4">
            {yearParts.map((c) => (
              <li key={c.id}>
                <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => onCategory(c.id)}>
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1">{catLabel(locale, c.id)}</span>
                  <span>{formatMoney(c.value, 2)}</span>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {filtering ? (
        <div className="fixed inset-0 z-20 grid place-items-end bg-black/50 p-4" onClick={() => setFiltering(false)}>
          <div className="sheet-card w-full max-w-sm bg-bg p-4" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 font-semibold">{t("categories")}</p>
            {CATEGORIES.map((c) => {
              const on = !hidden.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-3 py-2 text-left"
                  onClick={() => setHidden((h) => (on ? [...h, c.id] : h.filter((x) => x !== c.id)))}
                >
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1">{catLabel(locale, c.id)}</span>
                  <span className="text-sm text-muted">{on ? t("shownWord") : t("hiddenWord")}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}

function DonutLarge({ slices }: { slices: { value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 92;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = slices.length > 1 ? 6 : 0;
  return (
    <svg viewBox="0 0 240 240" className="h-64 w-64" aria-hidden>
      <g transform="rotate(-40 120 120)">
        {slices.map((slice, i) => {
          const len = Math.max(0, (slice.value / total) * c - gap);
          const el = (
            <circle
              key={i}
              cx="120"
              cy="120"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="26"
              strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += (slice.value / total) * c;
          return el;
        })}
      </g>
    </svg>
  );
}

export function SavingScreen({
  txns,
  month,
  today,
  onClose,
}: {
  txns: Transaction[];
  month: string;
  today: string;
  onClose: () => void;
}) {
  const stats = savingStats(txns, month, today);
  const { t, locale } = useI18n();
  const spent = txns
    .filter((t) => t.date.startsWith(month) && t.date <= today && t.kind === "expense" && t.categoryId !== "savings")
    .reduce((s, t) => s + t.amount, 0);
  return (
    <div className="pb-8">
      <ScreenHeader title={t("saving")} subtitle={monthLabel(locale, month)} onClose={onClose} />
      <div className="px-5">
      <p className="mt-8 text-center text-5xl font-semibold tracking-tight">{formatPct(stats.rate)}</p>
      <p className="mt-1 text-center text-muted">{t("ofIncome")}</p>
      <div className="mx-auto mt-4 max-w-xs">
        <GaugeBig pct={stats.rate} />
      </div>
      <p className="mt-2 text-center font-medium text-cyan">{savingWord(locale, stats.rate)}</p>
      <div className="sheet-card mt-6 divide-y divide-white/5">
        <Row k={t("income")} v={formatMoney(stats.income, 2)} />
        <Row k={t("saved")} v={formatMoney(stats.saved, 2)} />
        <Row k={t("otherSpending")} v={formatMoney(spent, 2)} />
      </div>
      <h2 className="mt-8 text-lg font-semibold">{t("whatSaving")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("savingBody")}</p>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-muted">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function GaugeBig({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, pct)) / 100;
  const r = 90;
  const len = Math.PI * r;
  const a = Math.PI * (1 - p);
  const cx = 120 + r * Math.cos(a);
  const cy = 120 - r * Math.sin(a);
  return (
    <svg viewBox="0 0 240 140" className="w-full" aria-hidden>
      <path d="M24 120 A96 96 0 0 1 216 120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" strokeLinecap="round" />
      <path
        d="M24 120 A96 96 0 0 1 216 120"
        fill="none"
        stroke="var(--color-cyan)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${len * p} ${len}`}
      />
      <circle cx={cx} cy={cy} r="9" fill="var(--color-bg)" stroke="var(--color-cyan)" strokeWidth="4" />
    </svg>
  );
}

export function useUpcomingGroups(txns: Transaction[], month: string, today: string) {
  return useMemo(() => {
    const items = txns
      .filter((t) => t.date.startsWith(month) && t.date > today && (t.kind === "expense" || t.categoryId))
      .sort((a, b) => a.date.localeCompare(b.date));
    const groups: { date: string; items: Transaction[] }[] = [];
    for (const tx of items) {
      const last = groups[groups.length - 1];
      if (!last || last.date !== tx.date) groups.push({ date: tx.date, items: [tx] });
      else last.items.push(tx);
    }
    return { items, groups, total: items.reduce((s, t) => s + t.amount, 0) };
  }, [txns, month, today]);
}

export function UpcomingScreen({
  txns,
  month,
  today,
  onOpen,
  onClose,
}: {
  txns: Transaction[];
  month: string;
  today: string;
  onOpen: (tx: Transaction) => void;
  onClose: () => void;
}) {
  const { groups, total } = useUpcomingGroups(txns, month, today);
  const { t, locale } = useI18n();
  const projects = useFinance((s) => s.projects);
  const byDay = new Map<number, number>();
  for (const g of groups) byDay.set(Number(g.date.slice(8, 10)), g.items.reduce((s, t) => s + t.amount, 0));
  const { year, month: m } = { year: Number(month.slice(0, 4)), month: Number(month.slice(5, 7)) };
  const first = new Date(year, m - 1, 1).getDay();
  const mondayIndex = (first + 6) % 7;
  const dim = new Date(year, m, 0).getDate();
  const cells: (number | null)[] = [...Array(mondayIndex).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const todayDay = today.startsWith(month) ? Number(today.slice(8, 10)) : -1;

  return (
    <div className="pb-8">
      <ScreenHeader title={t("upcomingTx")} subtitle={monthLabel(locale, month)} onClose={onClose} />
      <div className="px-5">
      <p className="mt-6 text-4xl font-semibold">{formatMoney(total)}</p>
      <p className="text-sm text-muted">{t("upcomingExpenses")}</p>
      <div className="cal mt-4">
        {weekHead(locale).map((d) => (
          <div key={d} className="pb-2 text-center text-micro tracking-wide text-faint">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex min-h-12 flex-col items-center py-1">
            {day ? (
              <>
                <span
                  className={`grid size-8 place-items-center rounded-full text-sm ${day === todayDay ? "bg-transport font-semibold" : ""}`}
                >
                  {day}
                </span>
                {byDay.has(day) ? <span className="text-micro text-cyan">{Math.round(byDay.get(day)!)} €</span> : null}
              </>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        {groups.map((g) => (
          <section key={g.date}>
            <h3 className="mb-2 text-sm font-semibold">{fullDate(locale, g.date)}</h3>
            <div className="space-y-2">
              {g.items.map((tx) => {
                const cat = tx.categoryId ? categoryById(tx.categoryId) : null;
                return (
                  <button key={tx.id} type="button" className="txn w-full text-left" onClick={() => onOpen(tx)}>
                    <TxnAvatar title={tx.title} color={cat?.color ?? "var(--color-muted)"} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {tx.id.startsWith("plan:")
                          ? projectTitle(locale, projects.find((p) => p.id === tx.id.split(":")[1]) ?? { id: tx.id, name: tx.title })
                          : tx.title}
                      </span>
                      <span className="flex min-w-0 items-center gap-1 truncate text-sm text-muted">
                        {tx.recurring ? t("monthly") : cat ? catLabel(locale, cat.id) : ""}
                        {tx.recurring ? <Repeat size={12} /> : null}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">{formatSigned(-tx.amount, 2)}</span>
                    <ChevronRight size={16} className="text-muted" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 ? <p className="py-8 text-center text-muted">{t("nothingScheduled")}</p> : null}
      </div>
      </div>
    </div>
  );
}
