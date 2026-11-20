# Lumen: agent rules

Local-first monthly budget. Money stays on the device: no server ledger, no sign-in, no database in use
(`.grok/app-env.json`: auth off, `deploy.database` false).

Two clients:
- **Web PWA** in `src/` (TanStack Start, Vite, Zustand). The full product. Details: `HANDOFF.md`.
- **Android** in `android/` (Jetpack Compose). A smaller mirror: month dashboard with history, projects, insights, add expense,
  backup file. Languages (en, ru, be), currency and theme work.

Design system: `DESIGN.md`. Read it before touching UI on either client.

## Commands
- `npm run dev` · `npm run typecheck` · `npm run build` · `npm test` · `npm run lint`
- `npm run pack` → `repomix-output.xml` (app source, no platform plumbing). `npm run pack:android` → Android only.
- Android: `cd android && ./gradlew assembleDebug`. CI: **Android APK** runs on Android pull requests and by hand.
  Release: push tag `vX.Y.Z` (= `versionName`) → **Android release** builds the signed APK and publishes it.
- Only CI can build Android. Say so when it was not built; never claim an Android change works from reading alone.

## Where things live
- Web ledger: `src/lib/finance.ts` (cents inside, euros in the UI). State: `src/lib/store.ts`, localStorage key `lumen-budget-v1`.
- Web backup / language: `src/lib/backup.ts`, `src/lib/i18n.ts`. UI: `src/components/lumen/`.
- Android: `android/app/src/main/java/app/lumen/`
  - `data/`: `Model` (expense), `Projects` (project math), `Money`, `Storage` (SharedPreferences), `Backup` (JSON file).
  - `ui/`: `Theme`, `Dimens`, `Components`, `Controls` (fields, dialogs, pickers), `NavBar`, `Screens`, `ProjectScreens`, `LumenApp` (state + navigation).
- Android versions: only `android/gradle/libs.versions.toml`. Gradle itself: `android/gradle/wrapper/gradle-wrapper.properties`.
- Platform plumbing, leave alone unless asked: `public/__grok/`, `server/`, `scripts/grok-pwa-*`, `scripts/app-env-plugin.mjs`,
  `scripts/with-app-env.mjs`, `scripts/migrate.mjs`, `scripts/migration-plan.mjs`, `scripts/check-auth-invariant.mjs`,
  `src/lib/{auth,app-data,multiplayer,db.ts,preview-*}`.

## Invariants
- No sample data anywhere. The app opens empty on the real date and Home asks for a budget and a first transaction.
  Data saved before store version 2 that was sample data is dropped on load (`migrate` in `store.ts`). A new budget is 0.
- Currency (EUR, USD, RUB, BYN) changes the symbol only; amounts are never converted. `CURRENCIES` in `finance.ts` is the one table.
  First-launch default from the device language tag: Belarusian language or region BY → BYN, Russian → RUB, English → USD, anything else EUR.
  Web `defaultCurrency` (`finance.ts`), Android `currencyFor` (`Money.kt`). Saved once, so it never shifts when the language changes.
- Languages: Russian on a Russian device, Belarusian on a Belarusian one, English otherwise. Web: `i18n.ts`. Android: `res/values*/strings.xml`.
  Every new Android string goes into all three files.
- Themes: Dark and Light (Cloud Dancer `#F0EEE9`, never pure white), Auto follows the phone. Web: `data-theme` on `<html>`.
  Android: `Palette` in `ui/Theme.kt`.
- Bottom bar: Home, Transactions, Accounts, Projects, Settings (web, `navbar.tsx`).
  Android: Home, Projects, [Add], Insights, Settings. The bar is on every screen, Add and the editors included; Add is the raised
  round accent button in the middle (`ui/NavBar.kt`).
- Android Home is the dashboard for one month plus the History section, collapsed by default. History lists every expense,
  newest first, and deletes in place. The selected month (tap the title) is shared by Home and Insights; it is not saved.
- Projects: `scheduleRows` (web) and `Project.rows` (Android) are the single list of planned payments. A row is paid only by a
  recorded transaction with the same `planRef` (web also `paidBefore` for old installments). Never assume payment by date;
  unpaid rows stay Due. Balance due = price − recorded payments.
- Android projects: kinds Home, Car, Trip, Other; price; optional target date; schedule = `PlanItem`s. "Split the balance" replaces
  the unpaid rows with N monthly payments (cents exact); "Add planned cost" adds one dated row. A payment is a real `Expense` with
  `projectId` (+ `planRef`) in the normal history and the month's spending. Deleting a payment un-pays its row. Deleting a project
  keeps its payments, detached.
- Posted spending, the ring and the trend ignore future plan rows; only Upcoming merges them in.
- Category ids stay English; display names come from `catLabel`.
- Android UI: system bars are handled once, in `LumenApp` (`safeDrawingPadding`). Rows that pair a label with an amount use
  `TxRow` so long names truncate instead of overlapping. Touch targets are at least 48dp (`Dimens.touch`).

## Storage (never lose data)
- Web: Zustand `persist` to localStorage; after loading, the app asks the browser for persistent storage (`keepStorage`) so the
  data is not evicted under storage pressure.
- Android: SharedPreferences `lumen` (keys `extra` = expenses, `projects`, `budget`, `currency`, `theme`). The platform writes
  atomically and flushes when the app stops. Text that fails to parse is copied to `unreadable_<key>` before anything is saved
  over it. Never replace a loader with `getOrDefault(emptyList())`.
- Android `allowBackup` stays false: no cloud copy of financial data. Moving to another phone = the backup file.
- Android backup (Settings): one readable JSON file through the system file picker (`data/Backup.kt`), no permissions, no network.
  `{app: "lumen-backup", version: 1, exported, budget, expenses, projects}`. Restore replaces budget, expenses and projects after a
  confirmation; currency, theme and language stay as the phone has them. The file is not encrypted; the UI says so.
  Add fields only with a version bump and keep reading the old ones.
- Web backup: `LUMEN1` code (gzip + base64url, optional password). Not interchangeable with the Android file: the models differ.
- Updating the Android app keeps data only if the new APK has the same package (`app.lumen`), the same signing key and a higher
  `versionCode`. Never ship a debug-signed APK over a release one; uninstalling erases the data.

## Android distribution and Play Protect
- Play Protect scans apps installed from outside Google Play and may ask for a scan or show a warning. Code cannot turn that off.
- Google's developer verification (apps must come from a registered developer and key) is enforced from September 2026 in Brazil,
  Indonesia, Singapore and Thailand, and worldwide from 2027. Free limited-distribution registration (no ID, up to 20 devices) exists
  for personal builds: Android Developer Console, register package `app.lumen` with the release signing key.
  Check https://developer.android.com/developer-verification before relying on dates.
- Keep what builds reputation: one package name, one release key, release (not debug) APKs from GitHub Releases.

## Principles
KISS, YAGNI, DRY, SOLID. No dead code, no unused dependencies, no speculative features. One place per fact
(versions, colors, currencies). Keep logic out of composables and components; pure project and backup logic lives in `data/`.

## Working agreement
- Smallest diff that solves the task. Say what changed and why in a few lines; no restating the request.
- Large changes ship as a Python patch script (clean tree check, exact-match check, typecheck/test/build, rollback on failure,
  commit, push, self-delete after a successful push).
- Before claiming done: `npm run typecheck`, `npm test`, `npm run build`, and for Android a green **Android APK** run.
- Check versions on official release pages; never guess one.
- Never put secrets, keystores or `.env` files in git.
