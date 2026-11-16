import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LineChart,
  List,
  PieChart,
  Plus,
  Settings,
  Sprout,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { Toaster } from "sonner";
import {
  CATEGORIES,
  accountBalance,
  allocatedTotal,
  allocationMap,
  balanceSeries,
  budgetOf,
  daysRemaining,
  formatMoney,
  formatPct,
  monthNet,
  postedSpend,
  planBills,
  projectPlan,
  projectRecurring,
  savingStats,
  spentByCategory,
  sumSpend,
  todayISO,
  totalBalance,
  trendModel,
  upcomingSpend,
  type Account,
  type InsightId,
  type RangeId,
  type Transaction,
} from "@/lib/finance";
import { useFinance } from "@/lib/store";
import { accountTitle, catLabel, daysLeftLabel, directionLabel, monthLabel, projectTitle, savingWord, useI18n } from "@/lib/i18n";
import type { Go, Route } from "@/components/lumen/nav";
import {
  BalanceChart,
  BudgetRing,
  FlowBars,
  Gauge,
  MiniDonut,
  Spark,
  UpcomingBars,
} from "@/components/lumen/widgets";
import { BreakdownScreen, FlowScreen, SavingScreen, TrendScreen, UpcomingScreen } from "@/components/lumen/screens";
import {
  AccountScreen,
  AddAccountScreen,
  BudgetScreen,
  CategoryScreen,
  InsightsEditor,
  MonthPicker,
  SettingsScreen,
  TransactionEditor,
  TransactionsScreen,
} from "@/components/lumen/forms";
import { TxnList } from "@/components/lumen/lists";
import { GoalsScreen, ProjectEditor } from "@/components/lumen/projects";

const RANGES: RangeId[] = ["1W", "1M", "3M", "6M", "1Y", "All"];

const CARD: Record<InsightId, string> = {
  trend: "card-trend",
  top: "card-top",
  upcoming: "card-upcoming",
  saving: "card-saving",
  flow: "card-flow",
  accounts: "card-accounts",
  projects: "card-projects",
};

export function App() {
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [scope, setScope] = useState<"month" | "year">("month");
  const [range, setRange] = useState<RangeId>("1Y");
  useEffect(() => {
    void useFinance.persist.rehydrate();
  }, []);
  const month = useFinance((s) => s.month);
  const raw = useFinance((s) => s.transactions);
  const accounts = useFinance((s) => s.accounts);
  const budgets = useFinance((s) => s.budgets);
  const allocations = useFinance((s) => s.allocations);
  const order = useFinance((s) => s.insightOrder);
  const hidden = useFinance((s) => s.hiddenInsights);
  const today = todayISO();
  const horizon = month > today.slice(0, 7) ? month : today.slice(0, 7);
  const txns = useMemo(() => projectRecurring(raw, horizon), [raw, horizon]);
  const visible = order.filter((id) => !hidden.includes(id));
  const { t, locale } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRoute({ name: "home" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goInsight = (dir: -1 | 1) => {
    if (route.name !== "insight") return;
    const i = visible.indexOf(route.id);
    const next = visible[(i + dir + visible.length) % visible.length];
    if (next) setRoute({ name: "insight", id: next });
  };

  return (
    <div className="studio">
      <div className="phone">
        {route.name === "home" ? (
          <>
            <div className="phone-scroll home-bg">
              <Home txns={txns} today={today} accounts={accounts} visible={visible} go={setRoute} />
            </div>
            <button type="button" className="add-pill" onClick={() => setRoute({ name: "edit" })}>
              {t("add")}
            </button>
          </>
        ) : null}

        {route.name === "insight" ? (
          <InsightPager
            id={route.id}
            index={Math.max(0, visible.indexOf(route.id))}
            count={visible.length}
            scope={scope}
            setScope={setScope}
            range={range}
            setRange={setRange}
            txns={txns}
            today={today}
            accounts={accounts}
            onClose={() => setRoute({ name: "home" })}
            onPrev={() => goInsight(-1)}
            onNext={() => goInsight(1)}
            go={setRoute}
          />
        ) : null}

        {route.name === "months" ? <MonthPicker month={month} onClose={() => setRoute({ name: "home" })} /> : null}
        {route.name === "budget" ? <BudgetScreen onClose={() => setRoute({ name: "home" })} /> : null}
        {route.name === "settings" ? <SettingsScreen onClose={() => setRoute({ name: "home" })} /> : null}
        {route.name === "insights" ? <InsightsEditor onClose={() => setRoute({ name: "home" })} /> : null}
        {route.name === "edit" ? (
          <TransactionEditor
            key={route.id ?? "new"}
            id={route.id}
            date={route.date}
            seed={txns.find((t) => t.id === route.id)}
            onClose={() => setRoute({ name: "home" })}
          />
        ) : null}
        {route.name === "transactions" ? (
          <TransactionsScreen txns={txns} onClose={() => setRoute({ name: "home" })} onOpen={(id) => setRoute({ name: "edit", id })} />
        ) : null}
        {route.name === "category" ? (
          <CategoryScreen
            id={route.id}
            scope={route.scope}
            txns={txns}
            onClose={() => setRoute({ name: "insight", id: "top" })}
            onOpen={(id) => setRoute({ name: "edit", id })}
          />
        ) : null}
        {route.name === "account" ? (
          <AccountScreen id={route.id} txns={txns} onClose={() => setRoute({ name: "insight", id: "accounts" })} onOpen={(id) => setRoute({ name: "edit", id })} />
        ) : null}
        {route.name === "add-account" ? <AddAccountScreen onClose={() => setRoute({ name: "insight", id: "accounts" })} /> : null}
        {route.name === "project" ? <ProjectEditor id={route.id} onClose={() => setRoute({ name: "insight", id: "projects" })} /> : null}
        <span className="sr-only">
          {monthLabel(locale, month)} {formatMoney(budgetOf(budgets, month))} {formatMoney(allocatedTotal(allocationMap(allocations, month)))}
        </span>
      </div>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

function Home({
  txns,
  today,
  accounts,
  visible,
  go,
}: {
  txns: Transaction[];
  today: string;
  accounts: Account[];
  visible: InsightId[];
  go: Go;
}) {
  const month = useFinance((s) => s.month);
  const budgets = useFinance((s) => s.budgets);
  const allocations = useFinance((s) => s.allocations);
  const budget = budgetOf(budgets, month);
  const allocated = allocatedTotal(allocationMap(allocations, month));
  const available = budget - allocated;
  const remain = daysRemaining(month, today);
  const posted = postedSpend(txns, month, today);
  const spent = sumSpend(posted);
  const byCat = spentByCategory(posted);
  const slices = CATEGORIES.map((c) => ({ ...c, value: byCat[c.id] ?? 0 })).filter((c) => c.value > 0);
  const top = [...slices].sort((a, b) => b.value - a.value)[0];
  const upcoming = upcomingSpend(txns, month, today);
  const trend = trendModel(txns, month, today);
  const save = savingStats(txns, month, today);
  const projects = useFinance((s) => s.projects);
  const { t, locale } = useI18n();
  const bills = planBills(projects, month, today);
  const upcomingAll = [...upcoming, ...bills].sort((a, b) => a.date.localeCompare(b.date) || a.amount - b.amount);
  const upcomingTotalAll = upcomingAll.reduce((s, t) => s + t.amount, 0);
  const lead = [...projects].sort((a, b) => projectPlan(b, today).progress - projectPlan(a, today).progress)[0];
  const leadPlan = lead ? projectPlan(lead, today) : null;
  const total = totalBalance(accounts, txns, today);
  const net = monthNet(accounts, txns, month, today);
  const series = balanceSeries(accounts, txns, "6M", today).map((p) => p.value);
  const recent = txns
    .filter((t) => t.date <= today && t.kind !== "transfer")
    .sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount)
    .slice(0, 4);

  const open = (id: InsightId) => go({ name: "insight", id });

  return (
    <div className="px-5 pb-28 pt-6">
      <div className="flex items-start justify-between">
        <div>
          <button type="button" className="month-pill" onClick={() => go({ name: "months" })}>
            {monthLabel(locale, month)}
          </button>
          <p className="mt-2 pl-2 text-sm text-muted">
            {remain.tone === "now" ? daysLeftLabel(locale, remain.days) : remain.tone === "past" ? t("monthClosed") : t("notStarted")}
          </p>
        </div>
        <button type="button" className="icon-btn" aria-label={t("settings")} onClick={() => go({ name: "settings" })}>
          <Settings size={18} />
        </button>
      </div>

      <div className="mt-2">
        <BudgetRing
          fraction={budget > 0 ? allocated / budget : 0}
          amount={formatMoney(available)}
          negative={available < -0.001}
          onClick={() => go({ name: "budget" })}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 text-center">
        <button type="button" className="min-w-0" onClick={() => go({ name: "budget" })}>
          <span className="block truncate text-sm text-muted">{t("budget")} ›</span>
          <span className="mt-1 block text-lg font-semibold">{formatMoney(budget)}</span>
        </button>
        <button type="button" className="min-w-0" onClick={() => open("top")}>
          <span className="block truncate text-sm text-muted">{t("allocated")} ›</span>
          <span className="mt-1 block text-lg font-semibold">{formatMoney(allocated)}</span>
        </button>
        <div className="min-w-0">
          <span className="block truncate text-sm text-muted">{t("available")}</span>
          <span className={`mt-1 block text-lg font-semibold ${available < 0 ? "text-danger" : ""}`}>{formatMoney(available)}</span>
        </div>
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("insights")}</h2>
        <button type="button" className="text-sm text-muted" onClick={() => go({ name: "insights" })}>
          {t("edit")}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-3xl bg-white/5 px-4 py-8 text-center text-sm text-muted">{t("hiddenAll")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((id) => (
            <button key={id} type="button" className={`insight ${CARD[id]}`} onClick={() => open(id)}>
              {id === "trend" ? (
                <>
                  <CardLabel icon={<LineChart size={15} />} label={t("trend")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{formatPct(trend.pct)}</p>
                  <Spark values={trend.current} />
                  <Footer label={directionLabel(locale, trend.pct)} />
                </>
              ) : null}
              {id === "top" ? (
                <>
                  <CardLabel icon={<PieChart size={15} />} label={t("top")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{top ? formatMoney(top.value) : "—"}</p>
                  <MiniDonut slices={slices.length ? slices : [{ value: 1, color: "rgba(255,255,255,0.08)" }]} />
                  <Footer dot={top?.color} label={top ? catLabel(locale, top.id) : t("noSpending")} />
                </>
              ) : null}
              {id === "upcoming" ? (
                <>
                  <CardLabel icon={<CalendarDays size={15} />} label={t("upcoming")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{formatMoney(upcomingTotalAll)}</p>
                  <UpcomingBars items={upcomingAll.map((item) => ({ day: Number(item.date.slice(8, 10)), amount: item.amount }))} />
                  <p className="mt-1 text-sm text-muted">
                    {upcomingAll.length === 1 ? t("expenseOne") : t("expenses", { n: upcomingAll.length })}
                  </p>
                </>
              ) : null}
              {id === "saving" ? (
                <>
                  <CardLabel icon={<Sprout size={15} />} label={t("saving")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{formatPct(save.rate)}</p>
                  <Gauge pct={save.rate} />
                  <Footer dot="var(--color-transport)" label={savingWord(locale, save.rate)} />
                </>
              ) : null}
              {id === "flow" ? (
                <>
                  <CardLabel icon={<ArrowLeftRight size={15} />} label={t("flow")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{formatMoney(budget)}</p>
                  <FlowBars parts={slices} ratio={budget > 0 ? spent / budget : 0} />
                  <p className="mt-3 text-sm text-muted">{t("spentPct", { n: Math.round(budget > 0 ? (spent / budget) * 100 : 0) })}</p>
                </>
              ) : null}
              {id === "accounts" ? (
                <>
                  <CardLabel icon={<Wallet size={15} />} label={t("accounts")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{formatMoney(Math.round(total), 0)}</p>
                  <Spark values={series} color="var(--color-good)" />
                  <Footer label={formatMoney(Math.abs(net))} />
                </>
              ) : null}
              {id === "projects" ? (
                <>
                  <CardLabel icon={<Target size={15} />} label={t("goals")} />
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{leadPlan ? `${Math.round(leadPlan.progress * 100)}%` : "—"}</p>
                  <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-[#f6c445]" style={{ width: `${Math.round((leadPlan?.progress ?? 0) * 100)}%` }} />
                  </span>
                  <Footer label={lead ? projectTitle(locale, lead) : t("addGoal")} />
                </>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <button type="button" className="mt-8 mb-3 flex items-center gap-1 text-xl font-semibold" onClick={() => go({ name: "transactions" })}>
        {t("recent")} <ChevronRight size={18} />
      </button>
      <TxnList txns={recent} onOpen={(id) => go({ name: "edit", id })} />
    </div>
  );
}

function CardLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-white/80">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

function Footer({ label, dot }: { label: string; dot?: string }) {
  return (
    <span className="mt-auto flex min-w-0 items-center gap-2 pt-2 text-sm text-muted">
      {dot ? <span className="size-2 shrink-0 rounded-full" style={{ background: dot }} /> : <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-micro">↑</span>}
      <span className="truncate">{label}</span>
    </span>
  );
}

function InsightPager(props: {
  id: InsightId;
  index: number;
  count: number;
  scope: "month" | "year";
  setScope: (s: "month" | "year") => void;
  range: RangeId;
  setRange: (r: RangeId) => void;
  txns: Transaction[];
  today: string;
  accounts: Account[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  go: Go;
}) {
  const touch = useRef<{ x: number; y: number } | null>(null);
  const klass =
    props.id === "trend"
      ? "screen-trend"
      : props.id === "flow"
        ? "screen-flow"
        : props.id === "top"
          ? "screen-break"
          : props.id === "accounts"
            ? "screen-accounts"
            : props.id === "upcoming"
              ? "screen-upcoming"
              : props.id === "projects"
                ? "screen-projects"
                : "screen-saving";
  const month = useFinance((s) => s.month);
  const projects = useFinance((s) => s.projects);
  const { t } = useI18n();
  return (
    <div
      className={`absolute inset-0 flex flex-col ${klass}`}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) props.onNext();
          else props.onPrev();
        }
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {props.id === "trend" ? <TrendScreen txns={props.txns} month={month} today={props.today} onClose={props.onClose} /> : null}
        {props.id === "top" ? (
          <BreakdownScreen
            txns={props.txns}
            month={month}
            today={props.today}
            scope={props.scope}
            onClose={props.onClose}
            onCategory={(id) => props.go({ name: "category", id, scope: props.scope })}
          />
        ) : null}
        {props.id === "upcoming" ? (
          <UpcomingScreen
            txns={[...props.txns, ...planBills(projects, month, props.today)]}
            month={month}
            today={props.today}
            onClose={props.onClose}
            onOpen={(tx) => {
              if (tx.id.startsWith("plan:")) props.go({ name: "project", id: tx.id.split(":")[1] });
              else props.go({ name: "edit", id: tx.id });
            }}
          />
        ) : null}
        {props.id === "saving" ? <SavingScreen txns={props.txns} month={month} today={props.today} onClose={props.onClose} /> : null}
        {props.id === "flow" ? <FlowScreen txns={props.txns} month={month} today={props.today} onClose={props.onClose} /> : null}
        {props.id === "accounts" ? (
          <AccountsScreen
            accounts={props.accounts}
            txns={props.txns}
            today={props.today}
            range={props.range}
            setRange={props.setRange}
            onClose={props.onClose}
            onAccount={(id) => props.go({ name: "account", id })}
            onAdd={() => props.go({ name: "add-account" })}
          />
        ) : null}
        {props.id === "projects" ? <GoalsScreen onClose={props.onClose} onOpen={(id) => props.go({ name: "project", id })} /> : null}
      </div>
      <div className="flex items-end justify-between px-5 pb-4 pt-2">
        <button type="button" className="icon-btn" aria-label={t("previous")} onClick={props.onPrev}>
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: props.count }, (_, i) => (
              <span key={i} className={`size-1.5 rounded-full ${i === props.index ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          {props.id === "top" ? (
            <div className="segmented text-sm">
              <button type="button" data-on={props.scope === "month"} onClick={() => props.setScope("month")}>
                {t("month")}
              </button>
              <button type="button" data-on={props.scope === "year"} onClick={() => props.setScope("year")}>
                {t("year")}
              </button>
            </div>
          ) : null}
        </div>
        <button type="button" className="icon-btn" aria-label={t("next")} onClick={props.onNext}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function AccountsScreen({
  accounts,
  txns,
  today,
  range,
  setRange,
  onClose,
  onAccount,
  onAdd,
}: {
  accounts: Account[];
  txns: Transaction[];
  today: string;
  range: RangeId;
  setRange: (r: RangeId) => void;
  onClose: () => void;
  onAccount: (id: string) => void;
  onAdd: () => void;
}) {
  const { t, locale } = useI18n();
  const points = balanceSeries(accounts, txns, range, today);
  const total = points[points.length - 1]?.value ?? totalBalance(accounts, txns, today);
  const gain = points.length > 1 ? points[points.length - 1].value - points[0].value : 0;
  const spending = accounts.filter((a) => a.kind === "spending");
  const saving = accounts.filter((a) => a.kind === "saving");
  const sum = (list: Account[]) => list.reduce((s, a) => s + accountBalance(a, txns, today), 0);
  return (
    <div className="pb-4">
      <div className="grid grid-cols-[44px_1fr_auto] items-center gap-2 px-4 pt-4">
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
          <X size={18} />
        </button>
        <div className="text-center">
          <div className="font-semibold">{t("accounts")}</div>
          <div className="text-sm text-muted">{t("allAccounts")}</div>
        </div>
        <div className="flex gap-2">
          <span className="icon-btn" aria-hidden>
            <List size={16} />
          </span>
          <button type="button" className="icon-btn" aria-label={t("addAccount")} onClick={onAdd}>
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="px-5 pt-5">
        <p className="text-sm text-muted">{t("today")}</p>
        <p className="text-4xl font-semibold tracking-tight">{formatMoney(total, 2)}</p>
        <p className={`mt-1 inline-flex items-center gap-1 text-sm ${gain >= 0 ? "text-good" : "text-danger"}`}>
          <span className="grid size-5 place-items-center rounded-full bg-white/10 text-micro">{gain >= 0 ? "↑" : "↓"}</span>
          {formatMoney(Math.abs(gain), 2)}
        </p>
        <div className="mt-4 flex justify-between text-sm">
          {RANGES.map((r) => (
            <button key={r} type="button" className={`rounded-full px-2.5 py-1 ${range === r ? "bg-white/15 font-semibold" : "text-muted"}`} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
        <BalanceChart points={points} seriesName={t("balance")} />
        <AccountGroup title={t("spending")} total={sum(spending)} accounts={spending} txns={txns} today={today} onAccount={onAccount} />
        <AccountGroup title={t("savingKind")} total={sum(saving)} accounts={saving} txns={txns} today={today} onAccount={onAccount} />
      </div>
    </div>
  );
}

function AccountGroup({
  title,
  total,
  accounts,
  txns,
  today,
  onAccount,
}: {
  title: string;
  total: number;
  accounts: Account[];
  txns: Transaction[];
  today: string;
  onAccount: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <section className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>{title}</span>
        <span>{formatMoney(total, 2)}</span>
      </div>
      <div className="sheet-card divide-y divide-white/5">
        {accounts.map((a) => (
          <button key={a.id} type="button" className="flex w-full items-center gap-3 px-3 py-3 text-left" onClick={() => onAccount(a.id)}>
            <span className="grid size-8 place-items-center rounded-lg text-micro font-bold text-bg" style={{ background: a.color }}>
              {a.name.slice(0, 1)}
            </span>
            <span className="flex-1">
              <span className="font-medium">{accountTitle(locale, a)}</span>
              {a.isDefault ? <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-micro text-muted">{t("default")}</span> : null}
            </span>
            <span>{formatMoney(accountBalance(a, txns, today), 2)}</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
        ))}
      </div>
    </section>
  );
}
