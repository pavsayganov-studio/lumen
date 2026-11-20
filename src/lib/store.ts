import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  cents,
  defaultCurrency,
  emptyData,
  euros,
  postedSpend,
  setCurrency,
  spentByCategory,
  todayISO,
  type Account,
  type CategoryId,
  type CurrencyId,
  type InsightId,
  type LedgerData,
  type Project,
  type Transaction,
  type TxKind,
} from "./finance.ts";
import type { Snapshot } from "./backup.ts";

export type LocaleMode = "auto" | "en" | "ru" | "be";

/** Asks the browser not to evict the saved data when storage runs low. */
export function keepStorage() {
  if (typeof navigator !== "undefined") void Promise.resolve(navigator.storage?.persist?.()).catch(() => {});
}

export type ThemeMode = "auto" | "light" | "dark";

const INSIGHT_ORDER: InsightId[] = ["trend", "top", "upcoming", "saving", "flow", "accounts", "projects"];

interface FinanceState extends LedgerData {
  month: string;
  insightOrder: InsightId[];
  hiddenInsights: InsightId[];
  localeMode: LocaleMode;
  themeMode: ThemeMode;
  currency: CurrencyId;
  setMonth: (month: string) => void;
  setLocaleMode: (mode: LocaleMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  /** Changes the symbol only. Amounts are not converted. */
  setCurrency: (id: CurrencyId) => void;
  toggleInsight: (id: InsightId) => void;
  moveInsight: (id: InsightId, dir: -1 | 1) => void;
  setBudget: (month: string, amount: number) => void;
  setAllocation: (month: string, categoryId: CategoryId, amount: number) => void;
  addTransaction: (input: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, input: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (input: Omit<Account, "id" | "opening"> & { balance: number }) => void;
  renameAccount: (id: string, name: string) => void;
  deleteAccount: (id: string) => boolean;
  saveProject: (input: Project) => void;
  deleteProject: (id: string) => void;
  restoreSnapshot: (snapshot: Snapshot) => void;
  /** Erase all ledger data. Language, theme and currency stay. */
  erase: () => void;
}

function bumpAllocations(
  allocations: LedgerData["allocations"],
  transactions: Transaction[],
  month: string,
) {
  const today = todayISO();
  const spent = spentByCategory(postedSpend(transactions, month, today));
  const map = { ...(allocations[month] ?? {}) };
  let changed = false;
  for (const [cat, value] of Object.entries(spent) as [CategoryId, number][]) {
    if (value > (map[cat] ?? 0) + 0.001) {
      map[cat] = value;
      changed = true;
    }
  }
  if (!changed) return allocations;
  return { ...allocations, [month]: map };
}

/**
 * Before store version 2 the app could hold made-up sample data (start "demo", or no start at all).
 * That data is dropped; the person's own data and the display choices stay.
 */
export function dropSampleData(persisted: unknown) {
  const saved = (persisted ?? {}) as Partial<FinanceState> & { start?: string };
  if (saved.start === "own") {
    const own = { ...saved };
    delete own.start;
    return own;
  }
  return { localeMode: saved.localeMode, insightOrder: saved.insightOrder, hiddenInsights: saved.hiddenInsights };
}

function freshData() {
  return {
    ...emptyData(),
    month: todayISO().slice(0, 7),
    insightOrder: [...INSIGHT_ORDER],
    hiddenInsights: [] as InsightId[],
  };
}

const memory = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useFinance = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...freshData(),
      localeMode: "auto",
      themeMode: "auto",
      currency: "EUR",
      setMonth: (month) => set({ month }),
      setLocaleMode: (mode) => set({ localeMode: mode }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setCurrency: (id) => {
        setCurrency(id);
        set({ currency: id });
      },
      toggleInsight: (id) =>
        set((s) => ({
          hiddenInsights: s.hiddenInsights.includes(id)
            ? s.hiddenInsights.filter((x) => x !== id)
            : [...s.hiddenInsights, id],
        })),
      moveInsight: (id, dir) =>
        set((s) => {
          const order = [...s.insightOrder];
          const i = order.indexOf(id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= order.length) return s;
          [order[i], order[j]] = [order[j], order[i]];
          return { insightOrder: order };
        }),
      setBudget: (month, amount) =>
        set((s) => ({ budgets: { ...s.budgets, [month]: Math.max(0, euros(cents(amount))) } })),
      setAllocation: (month, categoryId, amount) =>
        set((s) => ({
          allocations: {
            ...s.allocations,
            [month]: { ...s.allocations[month], [categoryId]: Math.max(0, euros(cents(amount))) },
          },
        })),
      addTransaction: (input) =>
        set((s) => {
          const tx: Transaction = { ...input, id: `tx-${Date.now()}-${Math.floor(Math.random() * 999)}` };
          const transactions = [...s.transactions, tx];
          return { transactions, allocations: bumpAllocations(s.allocations, transactions, tx.date.slice(0, 7)) };
        }),
      updateTransaction: (id, input) =>
        set((s) => {
          const transactions = s.transactions.map((t) => (t.id === id ? { ...input, id } : t));
          const month = input.date.slice(0, 7);
          return { transactions, allocations: bumpAllocations(s.allocations, transactions, month) };
        }),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id && !t.id.startsWith(`proj-${id}-`)) })),
      addAccount: (input) =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            {
              id: `acc-${Date.now()}`,
              name: input.name,
              kind: input.kind,
              color: input.color,
              isDefault: false,
              opening: input.balance,
            },
          ],
        })),
      renameAccount: (id, name) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, name } : a)),
        })),
      deleteAccount: (id) => {
        const s = get();
        if (s.transactions.some((t) => t.accountId === id || t.toAccountId === id)) return false;
        if (s.accounts.filter((a) => a.kind === s.accounts.find((x) => x.id === id)?.kind).length <= 1) return false;
        set({ accounts: s.accounts.filter((a) => a.id !== id) });
        return true;
      },
      saveProject: (input) =>
        set((s) => ({
          projects: s.projects.some((p) => p.id === input.id)
            ? s.projects.map((p) => (p.id === input.id ? input : p))
            : [...s.projects, input],
        })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          // Payments stay in the ledger; they just stop pointing at a project that is gone.
          transactions: s.transactions.map((t) => (t.projectId === id ? { ...t, projectId: undefined, planRef: undefined } : t)),
        })),
      restoreSnapshot: (snapshot) => {
        set({
          accounts: snapshot.accounts,
          transactions: snapshot.transactions,
          budgets: snapshot.budgets,
          allocations: snapshot.allocations,
          projects: snapshot.projects ?? [],
          month: snapshot.month,
          insightOrder: snapshot.insightOrder?.length ? snapshot.insightOrder : [...INSIGHT_ORDER],
          hiddenInsights: snapshot.hiddenInsights ?? [],
        });
      },
      erase: () => set(freshData()),
    }),
    {
      name: "lumen-budget-v1",
      storage: createJSONStorage(() => (typeof window === "undefined" ? memory : localStorage)),
      skipHydration: true,
      version: 2,
      migrate: (persisted) => dropSampleData(persisted),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<FinanceState>;
        const currency = saved.currency ?? defaultCurrency(typeof navigator === "undefined" ? "" : navigator.language);
        setCurrency(currency);
        const order = [...(saved.insightOrder ?? current.insightOrder)];
        for (const id of INSIGHT_ORDER) if (!order.includes(id)) order.push(id);
        return {
          ...current,
          ...saved,
          insightOrder: order,
          projects: saved.projects ?? current.projects,
          localeMode: saved.localeMode ?? "auto",
          themeMode: saved.themeMode ?? "auto",
          currency,
          hiddenInsights: saved.hiddenInsights ?? [],
        };
      },
      partialize: (s) => ({
        accounts: s.accounts,
        transactions: s.transactions,
        budgets: s.budgets,
        allocations: s.allocations,
        projects: s.projects,
        month: s.month,
        insightOrder: s.insightOrder,
        hiddenInsights: s.hiddenInsights,
        localeMode: s.localeMode,
        themeMode: s.themeMode,
        currency: s.currency,
      }),
    },
  ),
);

export type { TxKind };
