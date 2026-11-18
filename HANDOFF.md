# Handoff

Lumen is a TanStack Start app. State lives in Zustand (`src/lib/store.ts`) and is persisted in `localStorage` under `lumen-budget-v1`. There is no server ledger.

## Money

`src/lib/finance.ts` is the ledger. Amounts are euros in the UI and cents inside the helpers. November 2026 is the sample-data month, pinned with `DEMO_TODAY` (`2026-11-06`) only while sample data is on (`setDemoClock`). Real data uses the real date. `budgetOf` carries the latest earlier budget forward and is 0 when none was set. Do not let project rows land in November 2026 or the sample home numbers move.

## First launch

`start` in the store is `ask | demo | own`. Saved data from before this existed counts as `demo`. `begin(mode)` replaces all data and keeps the language. Rendering waits for the saved data to load, so a returning person never sees the welcome screen. The backup snapshot carries `demo` so a restore keeps the right clock.

Posted spending, the ring, and the trend ignore future plan rows. Only Upcoming merges them in.

## Backup

`src/lib/backup.ts`

1. JSON snapshot, version 1.
2. Gzip.
3. Open: SHA-256 prefix stored beside the gzip, then base64url. Prefix `LUMEN1.`
4. Locked: PBKDF2-SHA256, 120,000 iterations, 16-byte salt, AES-GCM 12-byte IV. Prefix `LUMEN1P.`

Restore replaces accounts, transactions, budgets, allocations, projects, month, insight layout and the sample-data flag. It does not change the language choice.

## Projects

`Project` in `src/lib/finance.ts` (the UI says Projects; the ids still say goal). Kinds: home, car, trip, other. Optional: `deadline`, `notes`, `items` (planned costs with dates), `paidBefore` (installments paid before tracking).

`scheduleRows` is the one list of what a project expects to pay: installment rows (`plan:{projectId}:{date}`) and cost rows (`item:{projectId}:{itemId}`). A row is paid when a transaction has the same `projectId` and `planRef`, or, for installments, when its index is below `paidBefore`. Nothing is assumed paid by date.

`planBills` turns unpaid rows into synthetic expenses (id equals `planRef`) for Upcoming. Unpaid rows keep showing after their date (Due), and rows missed in earlier months are carried into the current month. Opening one goes to the project screen; its Pay button opens the transaction editor with a draft. Paying stores a real transaction.

`projectPlan(project, today, txns)`: saving up counts `saved + tagged transfers`, or tagged expenses if that is more. Installments use the loan formula with paid rows. `needMonthly` is the amount that reaches the price by `deadline`.

Seed projects are `seed-home`, `seed-car` and `seed-trip`. Their names translate while they are still the defaults.

## Language

`src/lib/i18n.ts`. `localeMode` is `auto | en | ru`. Auto reads `navigator.language` after mount so the server and the first client render stay English and do not mismatch. Category ids stay English. Display names come from `catLabel`.

## Android

`android/` plus `.github/workflows/android.yml` (manual run only). Code: `data/` (model, money format, storage) and `ui/` (theme, components, screens). Versions: `android/gradle/libs.versions.toml`. It is behind the web app: no goals, no backup, no i18n. Expenses added on the phone live in SharedPreferences (`lumen` / `extra`); a budget edit is not persisted across app restarts yet.

## Checks

`npm run typecheck` and `npm run build`. Home for November should still read 1.332 € left, budget 3.900 €, upcoming 297 €.
