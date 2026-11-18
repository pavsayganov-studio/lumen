# Lumen

Local-first monthly budget, one month at a time. Money stays on the device: no server ledger, no sign-in,
no database in use (`.grok/app-env.json`: auth off, `deploy.database` false).

Two clients:
- **Web PWA** in `src/` (TanStack Start, Vite, Zustand). The full product. Details: `HANDOFF.md`.
- **Android** in `android/` (Jetpack Compose). A demo-level mirror: budget ring, insights, add expense.
  No projects, backup codes or language switch yet.

## Commands
- `npm run dev` · `npm run typecheck` · `npm run build` · `npm test` · `npm run lint`
- `npm run pack` → `repomix-output.xml` (app source, no platform plumbing). `npm run pack:android` → Android only.
- Android: `cd android && ./gradlew assembleDebug`. CI: Actions → **Android APK** → Run workflow (manual only).

## Where things live
- Web ledger: `src/lib/finance.ts` (cents inside, euros in the UI). State: `src/lib/store.ts`, localStorage key `lumen-budget-v1`.
- Web backup / language: `src/lib/backup.ts`, `src/lib/i18n.ts`. UI: `src/components/lumen/`.
- Android: `android/app/src/main/java/app/lumen/` → `data/` (model, money format, storage), `ui/` (theme, components, screens).
- Android versions: only `android/gradle/libs.versions.toml`. Gradle itself: `android/gradle/wrapper/gradle-wrapper.properties`.
- Platform plumbing, leave alone unless asked: `public/__grok/`, `server/`, `scripts/grok-pwa-*`, `scripts/app-env-plugin.mjs`,
  `scripts/with-app-env.mjs`, `scripts/migrate.mjs`, `scripts/migration-plan.mjs`, `scripts/check-auth-invariant.mjs`,
  `src/lib/{auth,app-data,multiplayer,db.ts,preview-*}`.

## Invariants
- November 2026 is the sample-data month. Web pins "today" to `DEMO_TODAY` (`2026-11-06`) only while sample data is on
  (`setDemoClock`); real data uses the real date. Android pins it in `Demo` (`data/Model.kt`).
  Sample Home must read: 1.332 € left, budget 3.900 €, upcoming 297 €. Project rows must not land in that month.
- First launch asks: own data or sample data (`start` in the store). New real data starts with no budget (0), not a default.
- Projects: `scheduleRows` is the single list of planned payments. A row is paid only by a recorded transaction with the same
  `planRef` (or `paidBefore` for old installments). Never assume payment by date; unpaid rows stay Due.
- Posted spending, the ring and the trend ignore future plan rows; only Upcoming merges them in.
- Category ids stay English; display names come from `catLabel`.
- Android UI: system bars are handled once, in `LumenApp` (`safeDrawingPadding`). Rows that pair a label with an amount use
  `TxRow` so long names truncate instead of overlapping.

## Principles
KISS, YAGNI, DRY, SOLID. No dead code, no unused dependencies, no speculative features. One place per fact
(versions, demo numbers, colors). Keep logic out of composables and components.

## Working agreement
- Smallest diff that solves the task. Say what changed and why in a few lines; no restating the request.
- Large changes ship as a Python patch script (clean tree check, commit, push, self-delete on success).
- Before claiming done: `npm run typecheck`, `npm run build`, and for Android a green **Android APK** run.
- Never put secrets, keystores or `.env` files in git.
