# Handoff

Lumen is a TanStack Start app. State lives in Zustand (`src/lib/store.ts`) and is persisted in `localStorage` under `lumen-budget-v1`. There is no server ledger.

## Money

`src/lib/finance.ts` is the ledger. Amounts are euros in the UI and cents inside the helpers. November 2026 is the demo month, pinned with `DEMO_TODAY` (`2026-11-06`). Do not let goal installments land in that month or the home numbers move.

Posted spending, the ring, and the trend ignore future plan rows. Only Upcoming merges them in.

## Backup

`src/lib/backup.ts`

1. JSON snapshot, version 1.
2. Gzip.
3. Open: SHA-256 prefix stored beside the gzip, then base64url. Prefix `LUMEN1.`
4. Locked: PBKDF2-SHA256, 120,000 iterations, 16-byte salt, AES-GCM 12-byte IV. Prefix `LUMEN1P.`

Restore replaces accounts, transactions, budgets, allocations, projects, month, and insight layout. It does not change the language choice.

## Goals

`Project` in `src/lib/finance.ts`. `projectPlan` returns progress, the monthly figure, payments already due, the remaining loan, and any down-payment gap.

`planBills` builds synthetic expenses id `plan:{projectId}:{date}`. Opening one goes to the goal, not the transaction editor.

Seed goals are `seed-home` and `seed-car`. Those names translate while they are still the defaults.

## Language

`src/lib/i18n.ts`. `localeMode` is `auto | en | ru`. Auto reads `navigator.language` after mount so the server and the first client render stay English and do not mismatch. Category ids stay English. Display names come from `catLabel`.

## Android

`android/` plus `.github/workflows/android.yml` (manual run only). Code: `data/` (model, money format, storage) and `ui/` (theme, components, screens). Versions: `android/gradle/libs.versions.toml`. It is behind the web app: no goals, no backup, no i18n. Expenses added on the phone live in SharedPreferences (`lumen` / `extra`); a budget edit is not persisted across app restarts yet.

## Checks

`npm run typecheck` and `npm run build`. Home for November should still read 1.332 € left, budget 3.900 €, upcoming 297 €.
