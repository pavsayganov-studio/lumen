# Lumen

Local-first monthly budget, one month at a time. Money stays on the device: no server ledger, no sign-in,
no database in use (`.grok/app-env.json`: auth off, `deploy.database` false).

Two clients:
- **Web PWA** in `src/` (TanStack Start, Vite, Zustand). The full product. Details: `HANDOFF.md`.
- **Android** in `android/` (Jetpack Compose). A smaller mirror: budget ring, history, spending by category, add expense.
  No projects or backup codes yet. Languages (en, ru, be), currency and theme work.

## Commands
- `npm run dev` · `npm run typecheck` · `npm run build` · `npm test` · `npm run lint`
- `npm run pack` → `repomix-output.xml` (app source, no platform plumbing). `npm run pack:android` → Android only.
- Android: `cd android && ./gradlew assembleDebug`. CI: **Android APK** runs on Android pull requests and by hand.
  Release: push tag `vX.Y.Z` (= `versionName`) → **Android release** builds the signed APK and publishes it.

## Where things live
- Web ledger: `src/lib/finance.ts` (cents inside, euros in the UI). State: `src/lib/store.ts`, localStorage key `lumen-budget-v1`.
- Web backup / language: `src/lib/backup.ts`, `src/lib/i18n.ts`. UI: `src/components/lumen/`.
- Android: `android/app/src/main/java/app/lumen/` → `data/` (model, money format, storage), `ui/` (theme, components, screens).
- Android versions: only `android/gradle/libs.versions.toml`. Gradle itself: `android/gradle/wrapper/gradle-wrapper.properties`.
- Platform plumbing, leave alone unless asked: `public/__grok/`, `server/`, `scripts/grok-pwa-*`, `scripts/app-env-plugin.mjs`,
  `scripts/with-app-env.mjs`, `scripts/migrate.mjs`, `scripts/migration-plan.mjs`, `scripts/check-auth-invariant.mjs`,
  `src/lib/{auth,app-data,multiplayer,db.ts,preview-*}`.

## Invariants
- No sample data anywhere. The app opens empty on the real date and Home asks for a budget and a first transaction.
  Data saved before store version 2 that was sample data is dropped on load (`migrate` in `store.ts`). A new budget is 0.
- Currency (EUR, USD, RUB, BYN) changes the symbol only; amounts are never converted. `CURRENCIES` in `finance.ts` is the one table.
- Languages: Russian on a Russian device, Belarusian on a Belarusian one, English otherwise. Web: `i18n.ts`. Android: `res/values*/strings.xml`.
- Themes: Dark and Light (Cloud Dancer `#F0EEE9`, never pure white), Auto follows the phone. Web: `data-theme` on `<html>`, `--color-white`
  is the ink color. Android: `Palette` in `ui/Theme.kt`.
- Bottom bar: Home, Transactions, Accounts, Projects, Settings (web, `navbar.tsx`); Home, History, Add, Insights, Settings (Android).
- Projects: `scheduleRows` is the single list of planned payments. A row is paid only by a recorded transaction with the same
  `planRef` (or `paidBefore` for old installments). Never assume payment by date; unpaid rows stay Due.
- Posted spending, the ring and the trend ignore future plan rows; only Upcoming merges them in.
- Category ids stay English; display names come from `catLabel`.
- Android UI: system bars are handled once, in `LumenApp` (`safeDrawingPadding`). Rows that pair a label with an amount use
  `TxRow` so long names truncate instead of overlapping.

## Principles
KISS, YAGNI, DRY, SOLID. No dead code, no unused dependencies, no speculative features. One place per fact
(versions, colors, currencies). Keep logic out of composables and components.

## Working agreement
- Smallest diff that solves the task. Say what changed and why in a few lines; no restating the request.
- Large changes ship as a Python patch script (clean tree check, commit, push, self-delete on success).
- Before claiming done: `npm run typecheck`, `npm run build`, and for Android a green **Android APK** run.
- Never put secrets, keystores or `.env` files in git.
