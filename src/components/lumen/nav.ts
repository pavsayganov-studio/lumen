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
