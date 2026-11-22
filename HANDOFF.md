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

`android/`, `.github/workflows/android.yml` (pull requests and manual) and `.github/workflows/release.yml` (tag `vX.Y.Z`, signed APK, GitHub release). Code: `data/` (model, projects, money, storage, backup) and `ui/` (theme, dimens, components, controls, nav bar, screens). Strings: `res/values`, `values-ru`, `values-be`. Versions: `android/gradle/libs.versions.toml`. The release keystore is never in git: secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Version 0.2.0 (rules in `AGENTS.md`, look in `DESIGN.md`):

- Bottom bar: Home, Projects, raised accent Add button, Insights, Settings. It stays visible on Add, Budget and the project editors.
- Home is the dashboard of the selected month. Tap the month title to pick a month and year; Insights follows the same month. History moved under the dashboard, collapsed by default; expanded it lists all expenses newest first and deletes in place. The History tab is gone.
- Projects tab (`data/Projects.kt`, `ui/ProjectScreens.kt`): price, optional target date, schedule of dated payments. Pay records a real expense with `projectId` and `planRef`; balance due = price minus recorded payments; nothing is paid by date. Split the balance replaces unpaid rows with N monthly payments. Deleting a payment un-pays its row; deleting a project keeps its payments.
- Storage: SharedPreferences `lumen`. Unreadable saved text is copied to `unreadable_<key>` before any save, so a bad parse can no longer wipe the data. Ids are de-duplicated on load (they are list keys). `allowBackup` stays false.
- Backup (Settings): readable JSON file through the system file picker. `{app, version: 1, exported, budget, expenses, projects}`. Restore asks first, then replaces budget, expenses and projects. Not encrypted. Not interchangeable with the web `LUMEN1` code.
- Default currency on first launch: Belarusian language or region BY gives BYN, Russian RUB, English USD, else EUR; saved once. Web does the same through `defaultCurrency` when no currency was saved. Phones that never chose a currency and run Russian or English change from the old EUR default; nothing is converted.
- Web: `keepStorage()` asks the browser for persistent storage after the data loads.
- Not built here: Android compiles only in CI. Run **Android APK** by hand on this branch before tagging `v0.2.0`.
- Known trade-off: with the keyboard open on the Add screen the bar sits above the keyboard and takes some room.

## Play Protect

Play Protect scans apps installed outside Google Play and can ask for a scan or warn; code cannot switch it off. Developer verification (registered developer and key) is enforced from September 2026 in Brazil, Indonesia, Singapore and Thailand, worldwide from 2027. For personal use, register `app.lumen` with the release key as limited distribution in the Android Developer Console (free, no ID, up to 20 devices), or later publish on Google Play. Always install the release APK, never a debug one, and never change the key or package: an update with a different key cannot install over the old app and uninstalling erases the data.

## Android: currencies, periods, categories (after 0.2.0, not released)

Rules are in `AGENTS.md`; look in `DESIGN.md`. Android only: the web client is unchanged and still has four currencies, one budget currency, months only and the fixed categories. Web parity is a separate patch.

- Currencies: KZT, UZS, AZN, AMD, KGS, TJS added to `Currency` (`data/Money.kt`) next to EUR, USD, RUB, BYN. `Currency.sign()` falls back to the ISO code when the font lacks the glyph.
- Each `Expense` and `Project` has a `currency`. Storage and backup write it; reading a record without one (older saves, backup version 1) uses the main currency from Settings. Backup is now version 2 and also holds `categories`.
- Home and Insights: `ViewBar` = period title (left) + currency menu (right). State lives in `LumenApp` (`period`, `viewCode`), shared and not saved. `viewCode` is a currency name or empty for Total. After saving an expense in another currency Home switches to that currency, so the expense is in view.
- Home: whole month in the main currency keeps the ring and the Budget/Spent/Available figures; every other view shows Spent only (Total: one line per currency). History is the expenses in view.
- Period: `data/Period.kt`; a range is picked in `DateRangePicker` (Material 3), opened from the month dialog ("Date range").
- Categories: `Category` in `data/Model.kt`, key `categories` in SharedPreferences, created on the Add screen, deletable while unused. `LocalCategories` feeds `categoryName` and `categoryColor`.
- Projects: the currency is chosen when a project is created and fixed afterwards; payments inherit it.
- Not built here: Android compiles only in CI. Run **Android APK** by hand on this branch. Check on a phone: the date range dialog fits small screens (it is 480dp tall), and the KGS sign (U+20C0) on an older phone shows as KGS.
- Known gaps: budgets are one number in the main currency; no per-currency budget. No rename or recolor of a custom category.
- Known, not ours: on main, 8 tests in `scripts/grok-pwa-plugin.test.mjs` already fail (they expect the template's default og:title and
  app name, but the project bakes the identity "Lumen"). The patch gate reports them and does not block on them. Fix them in their own patch.

## Checks

`npm run typecheck`, `npm test` and `npm run build`. The first launch must show an empty Home with the budget and first-transaction prompts.
