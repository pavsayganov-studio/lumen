import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportBackup, importBackup } from "./backup.ts";
import {
  CURRENCIES,
  CURRENCY_IDS,
  budgetOf,
  defaultCurrency,
  emptyData,
  planBills,
  projectPlan,
  scheduleRows,
  formatCompact,
  formatMoney,
  setCurrency,
  type Project,
  type Transaction,
} from "./finance.ts";
import { MESSAGES, daysLeftLabel } from "./i18n.ts";
import { dropSampleData } from "./store.ts";

const car: Project = {
  id: "c1",
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
};

const flat: Project = { ...car, id: "f1", name: "Flat", kind: "home", target: 42000, saved: 18500, monthlySave: 800, installment: false, downPayment: 0, months: 12, apr: 0, start: "2026-12-01" };

describe("goals", () => {
  it("prices a savings goal and an installment", () => {
    const saved = projectPlan(flat, "2026-11-06");
    const loan = projectPlan(car, "2026-11-06");
    assert.equal(saved.left, 23500);
    assert.equal(saved.monthsLeft, 30);
    assert.equal(loan.monthly, 389.04);
    assert.equal(loan.downGap, 800);
    assert.equal(planBills([flat, car], "2026-11", "2026-11-06").length, 0);
    assert.equal(planBills([flat, car], "2026-12", "2026-11-06")[0]?.amount, 389.04);
  });
});

describe("backup", () => {
  it("round-trips an open code and rejects a locked one without the passphrase", async () => {
    const snapshot = {
      v: 1 as const,
      accounts: [],
      transactions: [],
      budgets: { "2026-11": 3900 },
      allocations: {},
      projects: [flat, car],
      month: "2026-11",
      insightOrder: ["projects" as const],
      hiddenInsights: [],
    };
    const open = await exportBackup(snapshot);
    assert.equal(open.startsWith("LUMEN1."), true);
    assert.equal((await importBackup(open)).budgets["2026-11"], 3900);
    const locked = await exportBackup(snapshot, "river lantern");
    assert.equal(locked.startsWith("LUMEN1P."), true);
    await assert.rejects(() => importBackup(locked), { code: "passphrase" });
    assert.equal((await importBackup(locked, "river lantern")).projects[1]?.name, "City car");
  });
});

describe("language", () => {
  it("counts days in Russian", () => {
    assert.equal(daysLeftLabel("en", 1), "1 day remaining");
    assert.equal(daysLeftLabel("en", 25), "25 days remaining");
    assert.equal(daysLeftLabel("ru", 1), "ещё 1 день");
    assert.equal(daysLeftLabel("ru", 2), "ещё 2 дня");
    assert.equal(daysLeftLabel("ru", 25), "ещё 25 дней");
  });

  it("counts days in Belarusian", () => {
    assert.equal(daysLeftLabel("be", 1), "яшчэ 1 дзень");
    assert.equal(daysLeftLabel("be", 3), "яшчэ 3 дні");
    assert.equal(daysLeftLabel("be", 12), "яшчэ 12 дзён");
  });

  it("translates every key in Russian and Belarusian", () => {
    const keys = Object.keys(MESSAGES.en);
    for (const locale of ["ru", "be"] as const) {
      assert.deepEqual(keys.filter((k) => !MESSAGES[locale][k]), [], locale);
      assert.deepEqual(Object.keys(MESSAGES[locale]).filter((k) => !(k in MESSAGES.en)), [], locale);
    }
  });
});

describe("currency", () => {
  it("writes each official symbol in its usual place", () => {
    const text = (id: keyof typeof CURRENCIES) => {
      setCurrency(id);
      return formatMoney(1332.5);
    };
    assert.equal(text("EUR"), "1.332,50\u00a0€");
    assert.equal(text("USD"), "$1,332.50");
    assert.equal(text("RUB"), "1\u00a0332,50\u00a0₽");
    assert.equal(text("BYN"), "1\u00a0332,50\u00a0Br");
    assert.equal(CURRENCY_IDS.length, 4);
    setCurrency("USD");
    assert.equal(formatMoney(-12), "\u2212$12");
    assert.equal(formatCompact(1500), "$1.5K");
    setCurrency("EUR");
  });
});

const house: Project = {
  id: "h",
  name: "House",
  kind: "home",
  target: 10000,
  saved: 1000,
  monthlySave: 500,
  installment: false,
  downPayment: 0,
  months: 12,
  apr: 0,
  start: "2026-12-01",
  deadline: "2027-06-15",
  items: [{ id: "notary", title: "Notary", amount: 800, date: "2026-11-02" }],
};

const pay = (over: Partial<Transaction>): Transaction => ({
  id: "t1",
  title: "x",
  amount: 100,
  kind: "expense",
  date: "2026-11-03",
  accountId: "main",
  ...over,
});

describe("clean start", () => {
  it("has two accounts and no history", () => {
    const data = emptyData();
    assert.deepEqual(data.accounts.map((a) => a.kind), ["spending", "saving"]);
    assert.equal(data.transactions.length, 0);
    assert.equal(budgetOf(data.budgets, "2026-11"), 0);
  });

  it("carries the latest budget forward", () => {
    const budgets = { "2026-09": 3000, "2026-10": 3500 };
    assert.equal(budgetOf(budgets, "2026-10"), 3500);
    assert.equal(budgetOf(budgets, "2027-02"), 3500);
    assert.equal(budgetOf(budgets, "2026-08"), 0);
  });
});

describe("project schedule", () => {
  it("keeps a missed cost visible until it is paid", () => {
    const today = "2026-11-17";
    assert.equal(planBills([house], "2026-11", today)[0]?.amount, 800);
    const row = scheduleRows(house, [], today)[0];
    const paid = pay({ id: "p", amount: 800, projectId: "h", planRef: row.ref });
    assert.equal(planBills([house], "2026-11", today, [paid]).length, 0);
    assert.equal(projectPlan(house, today, [paid]).dueCount, 0);
  });

  it("carries an unpaid cost from an earlier month into the current one", () => {
    assert.equal(planBills([house], "2026-12", "2026-12-03").length, 1);
    assert.equal(planBills([house], "2027-01", "2026-12-03").length, 0);
  });

  it("counts set-aside transfers and direct payments once", () => {
    const today = "2026-11-17";
    const aside = pay({ id: "a", kind: "transfer", amount: 2000, projectId: "h" });
    assert.equal(projectPlan(house, today, [aside]).saved, 3000);
    const spent = pay({ id: "b", amount: 4000, projectId: "h" });
    assert.equal(projectPlan(house, today, [aside, spent]).saved, 4000);
    assert.equal(projectPlan(house, today, [aside, spent]).left, 6000);
  });

  it("works out the monthly amount that meets the target date", () => {
    const plan = projectPlan(house, "2026-11-17");
    assert.equal(plan.left, 9000);
    assert.equal(plan.needMonthly, 1286); // 9000 over the 7 months to June
    assert.equal(plan.deadline, "2027-06-15");
  });

  it("treats paid installments as recorded, not assumed", () => {
    const car: Project = { ...house, id: "c", installment: true, downPayment: 0, months: 4, apr: 0, start: "2026-09-01", items: [], paidBefore: 1 };
    const rows = scheduleRows(car, [], "2026-11-17");
    assert.equal(rows.length, 4);
    assert.equal(rows.filter((r) => r.paid).length, 1);
    const settled = pay({ id: "s", amount: 2500, projectId: "c", planRef: rows[1].ref });
    assert.equal(projectPlan(car, "2026-11-17", [settled]).paidCount, 2);
    assert.equal(projectPlan(car, "2026-11-17", []).dueCount, 2);
  });
});

describe("saved data from earlier versions", () => {
  it("drops sample data and keeps the language", () => {
    const sample = { start: "demo", transactions: [{ id: "t1" }], localeMode: "ru" };
    const legacy = { transactions: [{ id: "t1" }], localeMode: "en" };
    assert.deepEqual(dropSampleData(sample), { localeMode: "ru", insightOrder: undefined, hiddenInsights: undefined });
    assert.equal("transactions" in dropSampleData(legacy), false);
  });

  it("keeps the person's own data", () => {
    const own = dropSampleData({ start: "own", transactions: [{ id: "t1" }], localeMode: "be" }) as Record<string, unknown>;
    assert.equal((own.transactions as unknown[]).length, 1);
    assert.equal("start" in own, false);
  });
});

describe("default currency", () => {
  it("follows the device language", () => {
    assert.equal(defaultCurrency("ru-RU"), "RUB");
    assert.equal(defaultCurrency("ru"), "RUB");
    assert.equal(defaultCurrency("en-US"), "USD");
    assert.equal(defaultCurrency("en"), "USD");
    assert.equal(defaultCurrency("be"), "BYN");
    assert.equal(defaultCurrency("be-BY"), "BYN");
    assert.equal(defaultCurrency("ru-BY"), "BYN");
    assert.equal(defaultCurrency("de-DE"), "EUR");
    assert.equal(defaultCurrency(""), "EUR");
  });
});
