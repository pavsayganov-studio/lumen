import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildSeed,
  cents,
  currentMonthKey,
  euros,
  postedSpend,
  spentByCategory,
  todayISO,
  type Account,
  type CategoryId,
  type InsightId,
  type Project,
  type SeedData,
  type Transaction,
  type TxKind,
} from "./finance.ts";
import type { Snapshot } from "./backup.ts";

export type LocaleMode = "auto" | "en" | "ru";

const INSIGHT_ORDER: InsightId[] = ["trend", "top", "upcoming", "saving", "flow", "accounts", "projects"];

interface FinanceState extends SeedData {
  month: string;
  insightOrder: InsightId[];
  hiddenInsights: InsightId[];
  localeMode: LocaleMode;
  setMonth: (month: string) => void;
  setLocaleMode: (mode: LocaleMode) => void;
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
  reset: () => void;
}

function bumpAllocations(
  allocations: SeedData["allocations"],
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

function fresh(): Pick<
  FinanceState,
  | "accounts"
  | "transactions"
  | "budgets"
  | "allocations"
  | "projects"
  | "month"
  | "insightOrder"
  | "hiddenInsights"
  | "localeMode"
> {
  return {
    ...buildSeed(),
    month: currentMonthKey(),
    insightOrder: [...INSIGHT_ORDER],
    hiddenInsights: [],
    localeMode: "auto",
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
      ...fresh(),
      setMonth: (month) => set({ month }),
      setLocaleMode: (mode) => set({ localeMode: mode }),
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
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      restoreSnapshot: (snapshot) =>
        set({
          accounts: snapshot.accounts,
          transactions: snapshot.transactions,
          budgets: snapshot.budgets,
          allocations: snapshot.allocations,
          projects: snapshot.projects ?? [],
          month: snapshot.month,
          insightOrder: snapshot.insightOrder?.length ? snapshot.insightOrder : [...INSIGHT_ORDER],
          hiddenInsights: snapshot.hiddenInsights ?? [],
        }),
      reset: () => set(fresh()),
    }),
    {
      name: "lumen-budget-v1",
      storage: createJSONStorage(() => (typeof window === "undefined" ? memory : localStorage)),
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<FinanceState>;
        const order = [...(saved.insightOrder ?? current.insightOrder)];
        for (const id of INSIGHT_ORDER) if (!order.includes(id)) order.push(id);
        return {
          ...current,
          ...saved,
          insightOrder: order,
          projects: saved.projects ?? current.projects,
          localeMode: saved.localeMode ?? "auto",
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
      }),
    },
  ),
);

export type { TxKind };
