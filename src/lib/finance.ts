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
}

export interface Account {
  id: string;
  name: string;
  kind: "spending" | "saving";
  color: string;
  isDefault?: boolean;
  opening: number;
}

export interface SeedData {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Record<string, number>;
  allocations: Record<string, Partial<Record<CategoryId, number>>>;
  projects: Project[];
}

export type ProjectKind = "home" | "car" | "other";

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
}

const MONTH_CENTS: Record<number, number> = {
  1: 290000,
  2: 250000,
  3: 325000,
  4: 260000,
  5: 305000,
  6: 275000,
  7: 330750,
  8: 255000,
  9: 320000,
  10: 259650,
};

/** Day-1..6 spend (cents) tuned so November is +19% vs this 3-month average. */
const EARLY_CENTS: Record<number, number> = {
  8: 168527,
  9: 211484,
  10: 171586,
};

const WEIGHTS: Record<number, number[]> = {
  1: [42, 14, 12, 10, 12, 6, 4],
  2: [36, 18, 10, 14, 10, 8, 4],
  3: [40, 12, 14, 8, 14, 7, 5],
  4: [34, 20, 11, 12, 11, 7, 5],
  5: [44, 15, 10, 9, 10, 8, 4],
  6: [38, 16, 13, 11, 12, 6, 4],
  7: [41, 13, 12, 8, 15, 7, 4],
  8: [35, 19, 11, 13, 10, 8, 4],
  9: [43, 14, 12, 10, 9, 8, 4],
  10: [37, 17, 14, 9, 13, 6, 4],
};

const CAT_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

const TITLES: Record<CategoryId, [string, string]> = {
  housing: ["Rent", "Utilities"],
  savings: ["Retirement Savings", "Savings Account"],
  transport: ["Transit", "Fuel"],
  food: ["Groceries", "Dining Out"],
  shopping: ["Shopping", "Household"],
  fun: ["Going out", "Subscriptions"],
  health: ["Pharmacy", "Wellness"],
};

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

/** The screens were captured on this day. Keep the demo clock here so the month story stays intact. */
const DEMO_TODAY = new Date(2026, 10, 6, 12, 0, 0);

export function todayISO(now = DEMO_TODAY) {
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

export function formatMoney(value: number, digits: 0 | 2 | "auto" = "auto") {
  const neg = value < -0.001;
  const abs = Math.abs(value);
  const whole = Math.abs(abs - Math.round(abs)) < 0.001;
  const d = digits === "auto" ? (whole ? 0 : 2) : digits;
  const [int, frac] = abs.toFixed(d).split(".");
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const num = d === 0 ? withDots : `${withDots},${frac}`;
  return `${neg ? "−" : ""}${num} €`;
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

function splitWeighted(total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map((w) => Math.floor((total * w) / sum));
  const used = parts.reduce((a, b) => a + b, 0);
  parts[0] += total - used;
  return parts;
}

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const AS_OF = "2026-11-06";

export function buildSeed(): SeedData {
  const transactions: Transaction[] = [];
  let n = 1;
  const nextId = () => `seed-${n++}`;

  const push = (tx: Omit<Transaction, "id">) => {
    transactions.push({ ...tx, id: nextId() });
  };

  for (let month = 1; month <= 10; month++) {
    const total = MONTH_CENTS[month];
    const parts = splitWeighted(total, WEIGHTS[month]);
    const earlyBudget = EARLY_CENTS[month] ?? Math.round(total * 0.48);
    let earlyAssigned = 0;
    parts.forEach((catCents, idx) => {
      const cat = CAT_IDS[idx];
      const isLast = idx === parts.length - 1;
      let early = isLast
        ? earlyBudget - earlyAssigned
        : Math.round((catCents * earlyBudget) / total);
      early = Math.max(0, Math.min(catCents, early));
      earlyAssigned += early;
      const late = catCents - early;
      if (cat === "savings") {
        const transfer = Math.min(catCents, Math.round(total * 0.14));
        const expense = catCents - transfer;
        if (transfer > 0) {
          push({
            title: "Savings Account",
            flow: "Savings Account",
            amount: euros(transfer),
            kind: "transfer",
            date: iso(2026, month, 4),
            categoryId: "savings",
            accountId: "main",
            toAccountId: "saving",
          });
        }
        if (expense > 0) {
          push({
            title: "Retirement Savings",
            flow: "Retirement Savings",
            amount: euros(expense),
            kind: "expense",
            date: iso(2026, month, 4),
            categoryId: "savings",
            accountId: "main",
          });
        }
        return;
      }
      if (early > 0) {
        push({
          title: TITLES[cat][0],
          flow: TITLES[cat][0],
          amount: euros(early),
          kind: "expense",
          date: iso(2026, month, 3),
          categoryId: cat,
          accountId: "main",
        });
      }
      if (late > 0) {
        push({
          title: TITLES[cat][1],
          flow: TITLES[cat][1],
          amount: euros(late),
          kind: "expense",
          date: iso(2026, month, 18),
          categoryId: cat,
          accountId: "main",
        });
      }
    });
  }

  const november: Omit<Transaction, "id">[] = [
    { title: "Coffee", flow: "Coffee Shops", amount: 9, kind: "expense", date: "2026-11-01", categoryId: "food", accountId: "main" },
    { title: "Lunch", flow: "Lunch", amount: 12, kind: "expense", date: "2026-11-01", categoryId: "food", accountId: "main" },
    { title: "Dinner out", flow: "Dining Out", amount: 22.5, kind: "expense", date: "2026-11-02", categoryId: "food", accountId: "main" },
    { title: "Gas", flow: "Gas", amount: 30, kind: "expense", date: "2026-11-02", categoryId: "transport", accountId: "main" },
    { title: "Rent", flow: "Rent", amount: 900, kind: "expense", date: "2026-11-03", categoryId: "housing", accountId: "main" },
    { title: "Utilities", flow: "Utilities", amount: 100, kind: "expense", date: "2026-11-03", categoryId: "housing", accountId: "main" },
    { title: "Internet", flow: "Internet", amount: 50, kind: "expense", date: "2026-11-04", categoryId: "housing", accountId: "main" },
    { title: "Retirement Savings", flow: "Retirement Savings", amount: 350, kind: "expense", date: "2026-11-04", categoryId: "savings", accountId: "main" },
    { title: "Savings Account", flow: "Savings Account", amount: 300, kind: "transfer", date: "2026-11-04", categoryId: "savings", accountId: "main", toAccountId: "saving" },
    { title: "Phone Bill", flow: "Phone Bill", amount: 50, kind: "expense", date: "2026-11-05", categoryId: "housing", accountId: "main" },
    { title: "Investments", flow: "Investments", amount: 110, kind: "expense", date: "2026-11-05", categoryId: "savings", accountId: "main" },
    { title: "Car Loan", flow: "Car Loan", amount: 250, kind: "expense", date: "2026-11-05", categoryId: "transport", accountId: "main" },
    { title: "Cappuccino", flow: "Coffee Shops", amount: 4.5, kind: "expense", date: "2026-11-05", categoryId: "food", accountId: "main" },
    { title: "Car insurance", amount: 90, kind: "expense", date: "2026-11-08", categoryId: "transport", accountId: "main", recurring: true },
    { title: "Monthly transit pass", amount: 60, kind: "expense", date: "2026-11-10", categoryId: "transport", accountId: "main", recurring: true },
    { title: "Streaming", amount: 17, kind: "expense", date: "2026-11-23", categoryId: "fun", accountId: "main", recurring: true },
    { title: "Gym", amount: 39, kind: "expense", date: "2026-11-26", categoryId: "health", accountId: "main", recurring: true },
    { title: "Groceries", amount: 48, kind: "expense", date: "2026-11-27", categoryId: "food", accountId: "main" },
    { title: "Cloud storage", amount: 18, kind: "expense", date: "2026-11-28", categoryId: "shopping", accountId: "main", recurring: true },
    { title: "Dinner reservation", amount: 25, kind: "expense", date: "2026-11-29", categoryId: "food", accountId: "main" },
  ];
  november.forEach(push);

  const externalBeforeIncome = transactions
    .filter((t) => t.kind === "expense" && t.date <= AS_OF)
    .reduce((s, t) => s + cents(t.amount), 0);
  const targetEnd = 1669450;
  const targetStart = 5500;
  const incomeNeeded = targetEnd - targetStart + externalBeforeIncome;
  const novIncome = 396000;
  const histIncome = incomeNeeded - novIncome;
  const histMonths = 10;
  const histBase = Math.floor(histIncome / histMonths);
  let histAssigned = 0;
  for (let month = 1; month <= 10; month++) {
    const amt = month === 10 ? histIncome - histAssigned : histBase;
    histAssigned += amt;
    push({
      title: "Salary",
      amount: euros(amt),
      kind: "income",
      date: iso(2026, month, 1),
      accountId: "main",
    });
  }
  push({
    title: "Salary",
    amount: euros(novIncome),
    kind: "income",
    date: "2026-11-01",
    accountId: "main",
  });

  const accounts: Account[] = [
    { id: "main", name: "Main", kind: "spending", color: "#4C8DFF", isDefault: true, opening: 0 },
    { id: "cbc", name: "CBC Banque SA", kind: "spending", color: "#3AD7FF", opening: 0 },
    { id: "bdb", name: "Banco do Brasil", kind: "spending", color: "#34D399", opening: 0 },
    { id: "saving", name: "Saving", kind: "saving", color: "#3DDC97", isDefault: true, opening: 0 },
  ];

  const targets: Record<string, number> = {
    main: 8807.5,
    cbc: 55,
    bdb: 0,
    saving: 7832,
  };

  for (const account of accounts) {
    const deltaCents = transactions
      .filter((t) => t.date <= AS_OF)
      .reduce((s, tx) => s + cents(effectOn(tx, account.id)), 0);
    account.opening = euros(cents(targets[account.id]) - deltaCents);
  }

  const budgets: Record<string, number> = {};
  const allocations: SeedData["allocations"] = {};
  for (let month = 1; month <= 12; month++) {
    const key = monthKey(2026, month);
    budgets[key] = 3900;
  }
  allocations["2026-11"] = {
    housing: 1300,
    savings: 760,
    transport: 360,
    food: 148,
  };

  for (let month = 1; month <= 10; month++) {
    const key = monthKey(2026, month);
    const spent = spentByCategory(
      transactions.filter((t) => t.date.startsWith(key) && t.date <= `${key}-31`),
    );
    allocations[key] = spent;
  }

  return { accounts, transactions, budgets, allocations, projects: seedProjects() };
}

export function seedProjects(): Project[] {
  return [
    {
      id: "seed-home",
      name: "Apartment",
      kind: "home",
      target: 42000,
      saved: 18500,
      monthlySave: 800,
      installment: false,
      downPayment: 0,
      months: 12,
      apr: 0,
      start: "2026-12-01",
    },
    {
      id: "seed-car",
      name: "City car",
      kind: "car",
      target: 18000,
      saved: 4200,
      monthlySave: 0,
      installment: true,
      downPayment: 5000,
      months: 36,
      apr: 4.9,
      start: "2026-12-05",
    },
  ];
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
}

export function projectPlan(p: Project, today = todayISO()): ProjectPlan {
  const price = Math.max(0, p.target);
  const saved = Math.max(0, p.saved);
  if (!p.installment) {
    const left = Math.max(0, price - saved);
    const monthly = Math.max(0, p.monthlySave);
    return {
      mode: "save",
      price,
      saved,
      left,
      progress: price > 0 ? Math.min(1, saved / price) : 0,
      monthly,
      monthsLeft: monthly > 0 && left > 0 ? Math.ceil(left / monthly) : left === 0 ? 0 : null,
      nextDate: null,
      paidCount: 0,
      months: 0,
      down: 0,
      financed: 0,
      downGap: left,
      owed: 0,
    };
  }
  const down = Math.min(price, Math.max(0, p.downPayment));
  const financed = Math.max(0, euros(cents(price) - cents(down)));
  const months = Math.max(1, Math.round(p.months || 1));
  const monthly = monthlyPayment(financed, p.apr, months);
  let paidCount = 0;
  let nextDate: string | null = null;
  const start = p.start || today;
  for (let i = 0; i < months; i++) {
    const date = addMonthsISO(start, i);
    if (date <= today) paidCount += 1;
    else if (!nextDate) nextDate = date;
  }
  const owed = remainingPrincipal(financed, p.apr, months, paidCount);
  const downGap = Math.max(0, euros(cents(down) - cents(saved)));
  const covered = Math.min(price, euros(cents(Math.min(saved, down)) + cents(financed) - cents(owed)));
  return {
    mode: "installment",
    price,
    saved,
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
  };
}

/** Future installment rows for one month. They are not stored transactions. */
export function planBills(projects: Project[], month: string, today: string): Transaction[] {
  const out: Transaction[] = [];
  for (const project of projects) {
    if (!project.installment) continue;
    const plan = projectPlan(project, today);
    const start = project.start || today;
    for (let i = 0; i < plan.months; i++) {
      const date = addMonthsISO(start, i);
      if (!date.startsWith(month) || date <= today) continue;
      const categoryId: CategoryId = project.kind === "home" ? "housing" : project.kind === "car" ? "transport" : "shopping";
      out.push({
        id: `plan:${project.id}:${date}`,
        title: project.name,
        amount: plan.monthly,
        kind: "expense",
        date,
        categoryId,
        accountId: "main",
        recurring: true,
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

export function monthTransactions(txns: Transaction[], key: string) {
  return txns.filter((t) => inMonth(t, key));
}

export function postedSpend(txns: Transaction[], key: string, today: string) {
  return txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date <= today);
}

export function upcomingSpend(txns: Transaction[], key: string, today: string) {
  return txns
    .filter((t) => inMonth(t, key) && isSpend(t) && t.date > today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function budgetOf(budgets: Record<string, number>, key: string) {
  return budgets[key] ?? 3900;
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
  const current = currentMonthKey();
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
      const synthetic = syntheticCumulative(txns, pk, d);
      if (synthetic == null) continue;
      sum += synthetic;
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

function syntheticCumulative(txns: Transaction[], key: string, day: number) {
  const { year, month } = parseMonth(key);
  if (year !== 2026 || month < 1 || month > 10) {
    const total = sumSpend(txns.filter((t) => inMonth(t, key) && isSpend(t)));
    if (!txns.some((t) => inMonth(t, key))) return null;
    const dim = daysInMonth(year, month);
    const clamped = Math.min(day, dim);
    return total * (clamped / dim);
  }
  const total = MONTH_CENTS[month];
  const early = EARLY_CENTS[month] ?? Math.round(total * 0.48);
  const dim = daysInMonth(year, month);
  const d = Math.min(day, dim);
  if (d <= 6) return (early * d) / 6 / 100;
  const late = total - early;
  return (early + (late * (d - 6)) / (dim - 6)) / 100;
}

export function yearModel(txns: Transaction[], year: number, throughMonth: number) {
  const rows: { month: number; label: string; total: number; parts: Record<CategoryId, number> }[] = [];
  for (let m = 1; m <= 12; m++) {
    if (m > throughMonth && year >= new Date().getFullYear()) break;
    const key = monthKey(year, m);
    const mine = txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date <= todayISO());
    if (year === 2026 && m > 11) break;
    const parts = {} as Record<CategoryId, number>;
    for (const c of CAT_IDS) parts[c] = 0;
    for (const tx of mine) {
      if (!tx.categoryId) continue;
      parts[tx.categoryId] += tx.amount;
    }
    for (const c of CAT_IDS) parts[c] = euros(cents(parts[c]));
    const total = euros(CAT_IDS.reduce((s, c) => s + cents(parts[c]), 0));
    if (year === 2026 && m > 11) continue;
    rows.push({ month: m, label: MONTH_SHORT[m - 1], total, parts });
  }
  const visible = rows.filter((r) => r.month <= (year === 2026 ? 11 : 12));
  const total = euros(visible.reduce((s, r) => s + cents(r.total), 0));
  const avg = visible.length ? total / visible.length : 0;
  const peak = visible.reduce((best, r) => (r.total > best.total ? r : best), visible[0] ?? { total: 0, label: "—", month: 1, parts: {} as Record<CategoryId, number> });
  const last = visible.slice(-3).map((r) => r.total);
  let direction: "Increasing" | "Decreasing" | "Steady" = "Steady";
  if (last.length >= 2 && last[0] > 0) {
    const delta = (last[last.length - 1] - last[0]) / last[0];
    if (delta > 0.03) direction = "Increasing";
    else if (delta < -0.03) direction = "Decreasing";
  }
  return { rows: visible, total, avg, peak, direction };
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
  else return "2025-12-31";
  const isoDay = todayISO(dt);
  if (isoDay < "2026-01-01") return "2025-12-31";
  return isoDay;
}

export function balanceSeries(accounts: Account[], txns: Transaction[], range: RangeId, today = todayISO()) {
  const start = range === "All" ? "2025-12-31" : rangeStart(range, today);
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

export function auditSeed() {
  const seed = buildSeed();
  const today = "2026-11-06";
  const key = "2026-11";
  const posted = postedSpend(seed.transactions, key, today);
  const upcoming = upcomingSpend(seed.transactions, key, today);
  const spent = sumSpend(posted);
  const byCat = spentByCategory(posted);
  const alloc = allocatedTotal(allocationMap(seed.allocations, key));
  const budget = budgetOf(seed.budgets, key);
  const trend = trendModel(seed.transactions, key, today);
  const year = yearModel(seed.transactions, 2026, 11);
  const balances = Object.fromEntries(
    seed.accounts.map((a) => [a.id, accountBalance(a, seed.transactions, today)]),
  );
  const net = monthNet(seed.accounts, seed.transactions, key, today);
  const save = savingStats(seed.transactions, key, today);
  const total = totalBalance(seed.accounts, seed.transactions, today);
  const series = balanceSeries(seed.accounts, seed.transactions, "1Y", today);
  return {
    budget,
    alloc,
    available: euros(cents(budget) - cents(alloc)),
    spent,
    byCat,
    upcoming: sumSpend(upcoming),
    trendPct: Math.round(trend.pct),
    trendNow: trend.nowValue,
    yearTotal: year.total,
    yearAvg: year.avg,
    peak: year.peak.total,
    peakLabel: year.peak.label,
    direction: year.direction,
    balances,
    total,
    net,
    saveRate: Math.round(save.rate),
    seriesEnds: series[series.length - 1]?.value,
    seriesStart: series[0]?.value,
    gain: series.length ? series[series.length - 1].value - series[0].value : 0,
  };
}
