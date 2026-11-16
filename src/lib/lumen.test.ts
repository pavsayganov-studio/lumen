import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportBackup, importBackup } from "./backup.ts";
import { auditSeed, planBills, projectPlan, seedProjects } from "./finance.ts";
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
