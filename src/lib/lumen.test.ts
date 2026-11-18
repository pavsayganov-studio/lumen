import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportBackup, importBackup } from "./backup.ts";
import {
  auditSeed,
  budgetOf,
  emptyData,
  planBills,
  projectPlan,
  scheduleRows,
  seedProjects,
  setDemoClock,
  todayISO,
  type Project,
  type Transaction,
} from "./finance.ts";
import { daysLeftLabel } from "./i18n.ts";

describe("demo month", () => {
  it("matches the November figures", () => {
    const audit = auditSeed();
    assert.equal(audit.budget, 3900);
    assert.equal(audit.available, 1332);
    assert.equal(audit.spent, 2188);
    assert.equal(audit.upcoming, 297);
    assert.equal(audit.trendPct, 19);
    assert.equal(audit.net, 2072);
  });
});

describe("goals", () => {
  it("prices a savings goal and an installment", () => {
    const [home, car] = seedProjects();
    const saved = projectPlan(home, "2026-11-06");
    const loan = projectPlan(car, "2026-11-06");
    assert.equal(saved.left, 23500);
    assert.equal(saved.monthsLeft, 30);
    assert.equal(loan.monthly, 389.04);
    assert.equal(loan.downGap, 800);
    assert.equal(planBills(seedProjects(), "2026-11", "2026-11-06").length, 0);
    assert.equal(planBills(seedProjects(), "2026-12", "2026-11-06")[0]?.amount, 389.04);
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
      projects: seedProjects(),
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

describe("clock", () => {
  it("is pinned only while sample data is on", () => {
    setDemoClock(true);
    assert.equal(todayISO(), "2026-11-06");
    setDemoClock(false);
    assert.equal(todayISO(), todayISO(new Date()));
    assert.notEqual(todayISO(new Date(2030, 0, 5)), "2026-11-06");
  });
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
