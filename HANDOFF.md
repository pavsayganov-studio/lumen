# Handoff

Lumen is a TanStack Start app. State lives in Zustand (`src/lib/store.ts`) and is persisted in `localStorage` under `lumen-budget-v1`. There is no server ledger.

## Money

`src/lib/finance.ts` is the ledger. Amounts are in the chosen currency in the UI and cents inside the helpers. There is no sample data; the app uses the real date. `budgetOf` carries the latest earlier budget forward and is 0 when none was set. `CURRENCIES` holds the symbols (€, $, ₽, Br); `setCurrency` is called by the store and `formatMoney` reads it.

## First launch

The app opens empty: Home asks for a monthly budget and a first transaction. Persisted store version 2 drops sample data saved by earlier versions (`start` was `demo`, or missing) and keeps the person's own data, language, theme and currency. Rendering waits for the saved data to load.

Posted spending, the ring, and the trend ignore future plan rows. Only Upcoming merges them in.

## Backup

`src/lib/backup.ts`

1. JSON snapshot, version 1.
2. Gzip.
3. Open: SHA-256 prefix stored beside the gzip, then base64url. Prefix `LUMEN1.`
4. Locked: PBKDF2-SHA256, 120,000 iterations, 16-byte salt, AES-GCM 12-byte IV. Prefix `LUMEN1P.`

Restore replaces accounts, transactions, budgets, allocations, projects, month and insight layout. It does not change the language, theme or currency.

## Projects

`Project` in `src/lib/finance.ts` (the UI says Projects; the ids still say goal). Kinds: home, car, trip, other. Optional: `deadline`, `notes`, `items` (planned costs with dates), `paidBefore` (installments paid before tracking).

`scheduleRows` is the one list of what a project expects to pay: installment rows (`plan:{projectId}:{date}`) and cost rows (`item:{projectId}:{itemId}`). A row is paid when a transaction has the same `projectId` and `planRef`, or, for installments, when its index is below `paidBefore`. Nothing is assumed paid by date.

`planBills` turns unpaid rows into synthetic expenses (id equals `planRef`) for Upcoming. Unpaid rows keep showing after their date (Due), and rows missed in earlier months are carried into the current month. Opening one goes to the project screen; its Pay button opens the transaction editor with a draft. Paying stores a real transaction.

`projectPlan(project, today, txns)`: saving up counts `saved + tagged transfers`, or tagged expenses if that is more. Installments use the loan formula with paid rows. `needMonthly` is the amount that reaches the price by `deadline`.

## Language

`src/lib/i18n.ts`. `localeMode` is `auto | en | ru | be`. Auto reads `navigator.language` after mount so the server and the first client render stay English and do not mismatch. Category ids stay English. Display names come from `catLabel`.

## Android

`android/`, `.github/workflows/android.yml` (pull requests and manual) and `.github/workflows/release.yml` (tag `vX.Y.Z`, signed APK, GitHub release). Code: `data/` (model, money, storage) and `ui/` (theme, components, screens). Strings: `res/values`, `values-ru`, `values-be`. Versions: `android/gradle/libs.versions.toml`. It is a smaller mirror: expenses, budget, currency and theme in SharedPreferences (`lumen`); no projects or backup. The release keystore is never in git: secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## Checks

`npm run typecheck` and `npm run build`. The first launch must show an empty Home with the budget and first-transaction prompts.
