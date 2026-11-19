import type { CategoryId, InsightId, Transaction } from "@/lib/finance";

/** Pre-filled fields for a new transaction, e.g. a payment for a project. */
export type TxDraft = Partial<Omit<Transaction, "id">>;

export type Route =
  | { name: "home" }
  | { name: "insight"; id: InsightId }
  | { name: "transactions" }
  | { name: "edit"; id?: string; date?: string; draft?: TxDraft }
  | { name: "budget" }
  | { name: "settings" }
  | { name: "insights" }
  | { name: "category"; id: CategoryId; scope: "month" | "year" }
  | { name: "account"; id: string }
  | { name: "add-account" }
  | { name: "months" }
  | { name: "project"; id: string }
  | { name: "project-edit"; id?: string };

export type Go = (route: Route) => void;

/** The sections in the bottom bar. */
export type Tab = "home" | "transactions" | "accounts" | "projects" | "settings";

export const TAB_ROUTE: Record<Tab, Route> = {
  home: { name: "home" },
  transactions: { name: "transactions" },
  accounts: { name: "insight", id: "accounts" },
  projects: { name: "insight", id: "projects" },
  settings: { name: "settings" },
};

/** The bar shows on the five section screens only. Editors and detail screens cover it. */
export function tabOf(route: Route): Tab | null {
  if (route.name === "insight") return route.id === "accounts" || route.id === "projects" ? route.id : null;
  return route.name === "home" || route.name === "transactions" || route.name === "settings" ? route.name : null;
}
