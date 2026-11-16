import type { CategoryId, InsightId } from "@/lib/finance";

export type Route =
  | { name: "home" }
  | { name: "insight"; id: InsightId }
  | { name: "transactions" }
  | { name: "edit"; id?: string; date?: string }
  | { name: "budget" }
  | { name: "settings" }
  | { name: "insights" }
  | { name: "category"; id: CategoryId; scope: "month" | "year" }
  | { name: "account"; id: string }
  | { name: "add-account" }
  | { name: "months" }
  | { name: "project"; id?: string };

export type Go = (route: Route) => void;
