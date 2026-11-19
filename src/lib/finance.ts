export const CATEGORIES = [
  { id: "housing", name: "Housing", color: "#2EE6C7" },
  { id: "savings", name: "Savings", color: "#FF8A3D" },
  { id: "transport", name: "Transportation", color: "#4C8DFF" },
  { id: "food", name: "Food & Drink", color: "#E15CF0" },
  { id: "shopping", name: "Shopping", color: "#8B7CFF" },
  { id: "fun", name: "Entertainment", color: "#F6C445" },
  { id: "health", name: "Health", color: "#34D399" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const INSIGHTS = [
  { id: "trend" },
  { id: "top" },
  { id: "upcoming" },
  { id: "saving" },
  { id: "flow" },
  { id: "accounts" },
  { id: "projects" },
] as const;

export type InsightId = (typeof INSIGHTS)[number]["id"];

export type TxKind = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  title: string;
  flow?: string;
  amount: number;
  kind: TxKind;
  date: string;
  categoryId?: CategoryId;
  accountId: string;
  toAccountId?: string;
  recurring?: boolean;
  /** Project this money belongs to: a payment for it, or money set aside for it. */
  projectId?: string;
  /** The schedule row this payment settles (see scheduleRows). */
  planRef?: string;
}

export interface Account {
  id: string;
  name: string;
  kind: "spending" | "saving";
  color: string;
  isDefault?: boolean;
  opening: number;
}

export interface LedgerData {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Record<string, number>;
  allocations: Record<string, Partial<Record<CategoryId, number>>>;
  projects: Project[];
}

export type ProjectKind = "home" | "car" | "trip" | "other";

/** One planned cost with a date: a flight, a notary fee, an insurance. */
export interface ProjectItem {
  id: string;
  title: string;
  amount: number;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  /** Full price of the thing. */
  target: number;
  /** Cash already set aside. Counts toward the price, and toward the down payment when paying in parts. */
  saved: number;
  /** How much to set aside each month while saving up. Ignored for installments. */
  monthlySave: number;
  installment: boolean;
  downPayment: number;
  months: number;
  /** Yearly interest. 0 means every payment is the same, with no extra cost. */
  apr: number;
  /** First installment date. */
  start: string;
  /** Finish line. While saving up it becomes "set aside this much a month". */
  deadline?: string;
  notes?: string;
  /** Planned costs and when they fall due. Each one is settled by recording a payment. */
  items?: ProjectItem[];
  /** Installments paid before this project was tracked here. */
  paidBefore?: number;
}

const CAT_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

export function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function todayISO(now: Date = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function currentMonthKey(now = new Date()) {
  return monthKey(now.getFullYear(), now.getMonth() + 1);
}

export function shiftMonth(key: string, delta: number) {
  const { year, month } = parseMonth(key);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKey(d.getFullYear(), d.getMonth() + 1);
}

export function cents(n: number) {
  return Math.round(n * 100);
}

export function euros(c: number) {
  return Math.round(c) / 100;
}

export type CurrencyId = "EUR" | "USD" | "RUB" | "BYN";

/** Official symbols: € euro, $ US dollar, ₽ Russian ruble, Br Belarusian ruble. Amounts are never converted. */
export const CURRENCIES: Record<CurrencyId, { symbol: string; before: boolean; group: string; decimal: string }> = {
  EUR: { symbol: "€", before: false, group: ".", decimal: "," },
  USD: { symbol: "$", before: true, group: ",", decimal: "." },
  RUB: { symbol: "₽", before: false, group: "\u00a0", decimal: "," },
  BYN: { symbol: "Br", before: false, group: "\u00a0", decimal: "," },
};

export const CURRENCY_IDS = Object.keys(CURRENCIES) as CurrencyId[];

let activeCurrency: CurrencyId = "EUR";

/** The store sets this once; formatMoney reads it so call sites stay short. */
export function setCurrency(id: CurrencyId) {
  activeCurrency = id;
}

export function currencySymbol() {
  return CURRENCIES[activeCurrency].symbol;
}

export function formatMoney(value: number, digits: 0 | 2 | "auto" = "auto") {
  const { symbol, before, group, decimal } = CURRENCIES[activeCurrency];
  const neg = value < -0.001;
  const abs = Math.abs(value);
  const whole = Math.abs(abs - Math.round(abs)) < 0.001;
  const d = digits === "auto" ? (whole ? 0 : 2) : digits;
  const [int, frac] = abs.toFixed(d).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const num = d === 0 ? grouped : `${grouped}${decimal}${frac}`;
  return `${neg ? "\u2212" : ""}${before ? `${symbol}${num}` : `${num}\u00a0${symbol}`}`;
}

/** Chart axis label: 1500 reads as "1,5K €". */
export function formatCompact(value: number) {
  if (value < 1000) return formatMoney(value, 0);
  const { symbol, before, decimal } = CURRENCIES[activeCurrency];
  const num = `${(value / 1000).toFixed(1).replace(".", decimal)}K`;
  return before ? `${symbol}${num}` : `${num}\u00a0${symbol}`;
}

export function formatPct(n: number, signed = true) {
  const r = Math.round(n);
  if (!signed) return `${r}%`;
  if (r > 0) return `+${r}%`;
  return `${r}%`;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function categoryById(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!;
}

/** A clean start: two accounts, no budget, no history. */
export function emptyData(): LedgerData {
  return {
    accounts: [
      { id: "main", name: "Main", kind: "spending", color: "#4C8DFF", isDefault: true, opening: 0 },
      { id: "saving", name: "Saving", kind: "saving", color: "#3DDC97", isDefault: true, opening: 0 },
    ],
    transactions: [],
    budgets: {},
    allocations: {},
    projects: [],
  };
}

export function defaultSpendingId(accounts: Account[]) {
  return (accounts.find((a) => a.isDefault && a.kind === "spending") ?? accounts.find((a) => a.kind === "spending") ?? accounts[0])?.id ?? "main";
}

export function defaultSavingId(accounts: Account[]) {
  return (accounts.find((a) => a.isDefault && a.kind === "saving") ?? accounts.find((a) => a.kind === "saving"))?.id ?? "";
}

export function monthlyPayment(principal: number, aprPercent: number, months: number) {
  const n = Math.max(1, Math.round(months));
  const p = Math.max(0, principal);
  if (p === 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r < 1e-8) return euros(Math.round((p / n) * 100));
  const pow = (1 + r) ** n;
  return euros(Math.round(((p * r * pow) / (pow - 1)) * 100));
}

export function remainingPrincipal(principal: number, aprPercent: number, months: number, paid: number) {
  const n = Math.max(1, Math.round(months));
  const k = Math.max(0, Math.min(n, paid));
  const p = Math.max(0, principal);
  if (k >= n) return 0;
  const r = aprPercent / 100 / 12;
  if (r < 1e-8) return euros(Math.max(0, cents(p) - cents(monthlyPayment(p, 0, n)) * k));
  const pow = (1 + r) ** k;
  const pmt = monthlyPayment(p, aprPercent, n);
  const bal = p * pow - (pmt * (pow - 1)) / r;
  return euros(Math.max(0, Math.round(bal * 100)));
}

export function addMonthsISO(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  const ny = dt.getFullYear();
  const nm = dt.getMonth() + 1;
  const nd = Math.min(d, daysInMonth(ny, nm));
  return `${ny}-${String(nm).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}

export interface ProjectPlan {
  mode: "save" | "installment";
  price: number;
  /** Cash set aside so far (or paid out, if that is more). */
  saved: number;
  left: number;
  progress: number;
  monthly: number;
  monthsLeft: number | null;
  nextDate: string | null;
  paidCount: number;
  months: number;
  down: number;
  financed: number;
  /** Cash still needed before the loan, when savings are short of the down payment. */
  downGap: number;
  owed: number;
  /** Money recorded as paid out for this project. */
  paid: number;
  /** Planned costs (not installments) still unpaid. */
  scheduled: number;
  /** Unpaid schedule rows whose date has come. */
  dueCount: number;
  deadline: string | null;
  /** Monthly amount that reaches the price by the deadline, when saving up. */
  needMonthly: number | null;
}

export interface PlanRow {
  /** Id of the row; a payment that settles it stores this as planRef. */
  ref: string;
  projectId: string;
  title: string;
  amount: number;
  date: string;
  installment: boolean;
  paid: boolean;
}

const KIND_CATEGORY: Record<ProjectKind, CategoryId> = { home: "housing", car: "transport", trip: "fun", other: "shopping" };

export function projectCategory(kind: ProjectKind): CategoryId {
  return KIND_CATEGORY[kind];
}

function terms(p: Project) {
  const price = Math.max(0, p.target);
  const down = Math.min(price, Math.max(0, p.downPayment));
  const financed = Math.max(0, euros(cents(price) - cents(down)));
  const months = Math.max(1, Math.round(p.months || 1));
  return { price, down, financed, months, monthly: monthlyPayment(financed, p.apr, months) };
}

/** Everything the project expects to pay, with its date and whether a recorded payment already settles it. */
export function scheduleRows(p: Project, txns: Transaction[], today = todayISO()): PlanRow[] {
  const settled = new Set<string>();
  for (const tx of txns) if (tx.projectId === p.id && tx.planRef) settled.add(tx.planRef);
  const rows: PlanRow[] = [];
  if (p.installment) {
    const { months, monthly } = terms(p);
    const start = p.start || today;
    const before = Math.max(0, Math.round(p.paidBefore ?? 0));
    for (let i = 0; i < months; i++) {
      const date = addMonthsISO(start, i);
      const ref = `plan:${p.id}:${date}`;
      rows.push({ ref, projectId: p.id, title: p.name, amount: monthly, date, installment: true, paid: i < before || settled.has(ref) });
    }
  }
  for (const item of p.items ?? []) {
    const ref = `item:${p.id}:${item.id}`;
    rows.push({ ref, projectId: p.id, title: item.title, amount: item.amount, date: item.date, installment: false, paid: settled.has(ref) });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

function monthsUntil(today: string, date: string) {
  const [y1, m1] = today.split("-").map(Number);
  const [y2, m2] = date.split("-").map(Number);
  return Math.max(1, (y2 - y1) * 12 + (m2 - m1));
}

export function projectPlan(p: Project, today = todayISO(), txns: Transaction[] = []): ProjectPlan {
  const mine = txns.filter((t) => t.projectId === p.id);
  const paid = euros(mine.filter((t) => t.kind === "expense").reduce((s, t) => s + cents(t.amount), 0));
  const setAside = euros(mine.filter((t) => t.kind === "transfer").reduce((s, t) => s + cents(t.amount), 0));
  const unpaid = scheduleRows(p, txns, today).filter((r) => !r.paid);
  const scheduled = euros(unpaid.filter((r) => !r.installment).reduce((s, r) => s + cents(r.amount), 0));
  const dueCount = unpaid.filter((r) => r.date <= today).length;
  const deadline = p.deadline || null;
  const { price, down, financed, months, monthly } = terms(p);
  const cash = euros(cents(Math.max(0, p.saved)) + cents(setAside));

  if (!p.installment) {
    // Money set aside, or paid out directly, whichever is more: never counted twice.
    const saved = euros(Math.max(cents(cash), cents(paid)));
    const left = Math.max(0, euros(cents(price) - cents(saved)));
    const pace = Math.max(0, p.monthlySave);
    return {
      mode: "save",
      price,
      saved,
      left,
      progress: price > 0 ? Math.min(1, saved / price) : 0,
      monthly: pace,
      monthsLeft: pace > 0 && left > 0 ? Math.ceil(left / pace) : left === 0 ? 0 : null,
      nextDate: null,
      paidCount: 0,
      months: 0,
      down: 0,
      financed: 0,
      downGap: left,
      owed: 0,
      paid,
      scheduled,
      dueCount,
      deadline,
      needMonthly: deadline && left > 0 ? Math.ceil(left / monthsUntil(today, deadline)) : null,
    };
  }

  const rows = scheduleRows(p, txns, today).filter((r) => r.installment);
  const paidCount = rows.filter((r) => r.paid).length;
  const nextDate = rows.find((r) => !r.paid)?.date ?? null;
  const owed = remainingPrincipal(financed, p.apr, months, paidCount);
  const downGap = Math.max(0, euros(cents(down) - cents(cash)));
  const covered = Math.min(price, euros(cents(Math.min(cash, down)) + cents(financed) - cents(owed)));
  return {
    mode: "installment",
    price,
    saved: cash,
    left: Math.max(0, euros(cents(price) - cents(covered))),
    progress: price > 0 ? covered / price : 0,
    monthly,
    monthsLeft: months - paidCount,
    nextDate,
    paidCount,
    months,
    down,
    financed,
    downGap,
    owed,
    paid,
    scheduled,
    dueCount,
    deadline: null,
    needMonthly: null,
  };
}

/**
 * Unpaid schedule rows shown as upcoming expenses for one month. Rows from earlier months that were never
 * paid are carried into the current month, so a missed payment stays visible. They are not stored transactions.
 */
export function planBills(
  projects: Project[],
  month: string,
  today: string,
  txns: Transaction[] = [],
  accountId = "main",
): Transaction[] {
  const out: Transaction[] = [];
  const current = today.slice(0, 7);
  for (const project of projects) {
    for (const row of scheduleRows(project, txns, today)) {
      if (row.paid) continue;
      const overdue = month === current && row.date < `${month}-01`;
      if (!row.date.startsWith(month) && !overdue) continue;
      out.push({
        id: row.ref,
        planRef: row.ref,
        projectId: project.id,
        title: row.title,
        amount: row.amount,
        kind: "expense",
        date: row.date,
        categoryId: projectCategory(project.kind),
        accountId,
        recurring: row.installment,
      });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function effectOn(tx: Transaction, accountId: string) {
  if (tx.kind === "income" && tx.accountId === accountId) return tx.amount;
  if (tx.kind === "expense" && tx.accountId === accountId) return -tx.amount;
  if (tx.kind === "transfer") {
    if (tx.accountId === accountId) return -tx.amount;
    if (tx.toAccountId === accountId) return tx.amount;
  }
  return 0;
}

export function isSpend(tx: Transaction) {
  return tx.kind === "expense" || (tx.kind === "transfer" && !!tx.categoryId);
}

export function inMonth(tx: Transaction, key: string) {
  return tx.date.startsWith(key);
}

export function spentByCategory(txns: Transaction[]) {
  const out: Partial<Record<CategoryId, number>> = {};
  for (const tx of txns) {
    if (!isSpend(tx) || !tx.categoryId) continue;
    out[tx.categoryId] = (out[tx.categoryId] ?? 0) + tx.amount;
  }
  for (const k of Object.keys(out) as CategoryId[]) {
    out[k] = euros(cents(out[k]!));
  }
  return out;
}

export function sumSpend(txns: Transaction[]) {
  return euros(txns.filter(isSpend).reduce((s, t) => s + cents(t.amount), 0));
}

export function postedSpend(txns: Transaction[], key: string, today: string) {
  return txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date <= today);
}

export function upcomingSpend(txns: Transaction[], key: string, today: string) {
  return txns
    .filter((t) => inMonth(t, key) && isSpend(t) && t.date > today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

/** The month's budget, else the latest earlier one, else 0 (not set yet). */
export function budgetOf(budgets: Record<string, number>, key: string) {
  if (budgets[key] != null) return budgets[key];
  let latest = "";
  for (const k of Object.keys(budgets)) if (k < key && k > latest) latest = k;
  return latest ? budgets[latest] : 0;
}

export function allocationMap(
  allocations: Record<string, Partial<Record<CategoryId, number>>>,
  key: string,
) {
  return allocations[key] ?? {};
}

export function allocatedTotal(map: Partial<Record<CategoryId, number>>) {
  return euros(Object.values(map).reduce((s, n) => s + cents(n ?? 0), 0));
}

export function daysRemaining(key: string, today = todayISO()) {
  const { year, month } = parseMonth(key);
  const dim = daysInMonth(year, month);
  const current = today.slice(0, 7);
  if (key < current) return { tone: "past" as const, days: 0 };
  if (key > current) return { tone: "future" as const, days: 0 };
  const day = Number(today.slice(8, 10));
  const left = dim - day + 1;
  return { tone: "now" as const, days: left };
}

export interface FlowLink {
  source: string;
  categoryId: CategoryId;
  target: string;
  value: number;
  color: string;
}

export function moneyFlow(txns: Transaction[]) {
  const groups = new Map<CategoryId, Map<string, number>>();
  for (const tx of txns) {
    if (!isSpend(tx) || !tx.categoryId) continue;
    const name = tx.flow || tx.title;
    if (!groups.has(tx.categoryId)) groups.set(tx.categoryId, new Map());
    const g = groups.get(tx.categoryId)!;
    g.set(name, (g.get(name) ?? 0) + tx.amount);
  }
  const links: FlowLink[] = [];
  for (const cat of CATEGORIES) {
    const g = groups.get(cat.id);
    if (!g) continue;
    for (const [name, value] of g) {
      if (value > 0) links.push({ source: cat.name, categoryId: cat.id, target: name, value: euros(cents(value)), color: cat.color });
    }
  }
  return links.sort((a, b) => b.value - a.value);
}

export function trendModel(txns: Transaction[], key: string, today: string) {
  const { year, month } = parseMonth(key);
  const dim = daysInMonth(year, month);
  const currentKey = today.slice(0, 7);
  const cutoff =
    key < currentKey ? dim : key > currentKey ? 0 : Math.min(dim, Number(today.slice(8, 10)));

  const byDay = new Array(dim + 1).fill(0);
  for (const tx of txns) {
    if (!inMonth(tx, key) || !isSpend(tx)) continue;
    const day = Number(tx.date.slice(8, 10));
    if (day <= cutoff) byDay[day] += tx.amount;
  }
  let run = 0;
  const current: number[] = [];
  for (let d = 1; d <= dim; d++) {
    if (d <= cutoff) run += byDay[d];
    current.push(euros(cents(run)));
  }

  const prevKeys = [1, 2, 3].map((n) => shiftMonth(key, -n));
  const averages: number[] = [];
  for (let d = 1; d <= dim; d++) {
    let sum = 0;
    let count = 0;
    for (const pk of prevKeys) {
      const cumulative = cumulativeSpend(txns, pk, d);
      if (cumulative == null) continue;
      sum += cumulative;
      count++;
    }
    averages.push(count ? Math.round((sum / count) * 100) / 100 : 0);
  }

  const idx = Math.max(0, (cutoff || 1) - 1);
  const nowValue = current[idx] ?? 0;
  const avgValue = averages[idx] ?? 0;
  const pct = avgValue > 0 ? ((nowValue - avgValue) / avgValue) * 100 : 0;
  return { days: dim, current, averages, cutoff, nowValue, avgValue, pct };
}

/** Spend in a past month up to a day, spread evenly over the month. Null when the month has no records. */
function cumulativeSpend(txns: Transaction[], key: string, day: number) {
  if (!txns.some((t) => inMonth(t, key))) return null;
  const { year, month } = parseMonth(key);
  const dim = daysInMonth(year, month);
  const total = sumSpend(txns.filter((t) => inMonth(t, key) && isSpend(t)));
  return total * (Math.min(day, dim) / dim);
}

export function yearModel(txns: Transaction[], year: number, throughMonth: number) {
  const rows: { month: number; label: string; total: number; parts: Record<CategoryId, number> }[] = [];
  for (let m = 1; m <= 12; m++) {
    if (m > throughMonth && year >= new Date().getFullYear()) break;
    const key = monthKey(year, m);
    const mine = txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date <= todayISO());
    const parts = {} as Record<CategoryId, number>;
    for (const c of CAT_IDS) parts[c] = 0;
    for (const tx of mine) {
      if (!tx.categoryId) continue;
      parts[tx.categoryId] += tx.amount;
    }
    for (const c of CAT_IDS) parts[c] = euros(cents(parts[c]));
    const total = euros(CAT_IDS.reduce((s, c) => s + cents(parts[c]), 0));
    rows.push({ month: m, label: MONTH_SHORT[m - 1], total, parts });
  }
  const total = euros(rows.reduce((s, r) => s + cents(r.total), 0));
  const avg = rows.length ? total / rows.length : 0;
  const peak = rows.reduce((best, r) => (r.total > best.total ? r : best), rows[0] ?? { total: 0, label: "—", month: 1, parts: {} as Record<CategoryId, number> });
  const last = rows.slice(-3).map((r) => r.total);
  let direction: "Increasing" | "Decreasing" | "Steady" = "Steady";
  if (last.length >= 2 && last[0] > 0) {
    const delta = (last[last.length - 1] - last[0]) / last[0];
    if (delta > 0.03) direction = "Increasing";
    else if (delta < -0.03) direction = "Decreasing";
  }
  return { rows: rows, total, avg, peak, direction };
}

export function accountBalance(account: Account, txns: Transaction[], until?: string) {
  let delta = 0;
  for (const tx of txns) {
    if (until && tx.date > until) continue;
    delta += cents(effectOn(tx, account.id));
  }
  return euros(cents(account.opening) + delta);
}

export function totalBalance(accounts: Account[], txns: Transaction[], until?: string) {
  return euros(accounts.reduce((s, a) => s + cents(accountBalance(a, txns, until)), 0));
}

export type RangeId = "1W" | "1M" | "3M" | "6M" | "1Y" | "All";

export function rangeStart(range: RangeId, today = todayISO()) {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (range === "1W") dt.setDate(dt.getDate() - 7);
  else if (range === "1M") dt.setMonth(dt.getMonth() - 1);
  else if (range === "3M") dt.setMonth(dt.getMonth() - 3);
  else if (range === "6M") dt.setMonth(dt.getMonth() - 6);
  else if (range === "1Y") dt.setFullYear(dt.getFullYear() - 1);
  else return today;
  return todayISO(dt);
}

export function balanceSeries(accounts: Account[], txns: Transaction[], range: RangeId, today = todayISO()) {
  // Never start before the first transaction: nothing to show earlier.
  const first = shiftDay(txns.reduce((min, t) => (t.date < min ? t.date : min), today), -1);
  const wanted = range === "All" ? first : rangeStart(range, today);
  const start = wanted < first ? first : wanted;
  const points: { date: string; value: number }[] = [];
  const cursor = new Date(start + "T12:00:00");
  const end = new Date(today + "T12:00:00");
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
  while (cursor <= end) {
    const isoDay = todayISO(cursor);
    let value = 0;
    for (const a of accounts) {
      let delta = 0;
      for (const tx of sorted) {
        if (tx.date > isoDay) break;
        delta += cents(effectOn(tx, a.id));
      }
      value += cents(a.opening) + delta;
    }
    points.push({ date: isoDay, value: euros(value) });
    cursor.setDate(cursor.getDate() + (range === "All" || range === "1Y" ? 3 : 1));
  }
  const last = points[points.length - 1];
  if (!last || last.date !== today) {
    points.push({ date: today, value: totalBalance(accounts, txns, today) });
  }
  return points;
}

export function monthNet(accounts: Account[], txns: Transaction[], key: string, today: string) {
  const before = shiftDay(`${key}-01`, -1);
  const { year, month } = parseMonth(key);
  const last = `${key}-${String(daysInMonth(year, month)).padStart(2, "0")}`;
  const current = today.slice(0, 7);
  const endDay = key < current ? last : key > current ? before : today;
  return euros(cents(totalBalance(accounts, txns, endDay)) - cents(totalBalance(accounts, txns, before)));
}

function shiftDay(isoDay: string, delta: number) {
  const [y, m, d] = isoDay.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return todayISO(dt);
}

export function savingStats(txns: Transaction[], key: string, today: string) {
  const posted = postedSpend(txns, key, today);
  const saved = euros(
    posted.filter((t) => t.categoryId === "savings").reduce((s, t) => s + cents(t.amount), 0),
  );
  const income = euros(
    txns
      .filter((t) => inMonth(t, key) && t.kind === "income" && t.date <= today)
      .reduce((s, t) => s + cents(t.amount), 0),
  );
  const rate = income > 0 ? (saved / income) * 100 : 0;
  return { saved, income, rate };
}

export function projectRecurring(txns: Transaction[], untilKey: string) {
  const out = [...txns];
  const seen = new Set(out.map((t) => `${t.title}|${t.date}`));
  for (const tx of txns) {
    if (!tx.recurring) continue;
    let key = shiftMonth(tx.date.slice(0, 7), 1);
    let guard = 0;
    while (key <= untilKey && guard < 36) {
      const { year, month } = parseMonth(key);
      const dim = daysInMonth(year, month);
      const day = Math.min(Number(tx.date.slice(8, 10)), dim);
      const date = `${key}-${String(day).padStart(2, "0")}`;
      const marker = `${tx.title}|${date}`;
      if (!seen.has(marker)) {
        out.push({ ...tx, id: `proj-${tx.id}-${key}`, date });
        seen.add(marker);
      }
      key = shiftMonth(key, 1);
      guard += 1;
    }
  }
  return out;
}

export function formatSigned(value: number, digits: 0 | 2 | "auto" = "auto") {
  if (value > 0.001) return `+${formatMoney(value, digits)}`;
  return formatMoney(value, digits);
}
