# Lumen 0.3.0 — Technical Specification

Status: proposed, nothing built yet · 2026-11-22
Audience: the coding agent (Claude in chat or Claude Code). Delivery follows `AGENTS.md`: one patch script per change, pushed to main.


## 0. Operating rules

- R1 Read this file, then `I18N-0.3.0.md`, then `TASKS-0.3.0.md`. They are not in `npm run pack`; attach the one you need.
- R2 Section 0.1 lists the repo as it is today. Re-read the files a phase touches before editing: the pack omits `scripts/`, `server/` and part of the tests.
- R3 Spec = intent, repo = reality. On conflict, preserve existing user-visible behavior and log the decision in docs/ai/DECISIONS.md (date, context, options, choice).
- R4 STOP and ask the human only when: (a) a new runtime dependency seems necessary; (b) the storage engine must change; (c) a migration cannot be lossless; (d) a requirement conflicts with a principle in §1.
- R5 One patch script per change, pushed to main; no branches, no pull requests. A phase may take several patches, in order. Commit messages reference REQ ids (e.g. feat(web): edit expense [CRUD-1]). Tests ship in the same patch. After an Android patch, run **Android APK** by hand on main and fix forward.
- R6 Ledger data never leaves the device. No analytics, telemetry, crash reporters, remote fonts or CDNs.
- R7 Every user-facing string exists in en, ru, be. No hardcoded text. A missing key is a failing test.
- R8 No features outside §2. Ideas go to docs/ai/BACKLOG.md.
- R9 Honesty rule: each limitation in §10 must be visible in the UI where relevant, in all 3 languages.

### 0.1 Repo facts (read from the pack on 2026-11-22; `scripts/`, `server/` and part of the tests are not in the pack)

- Web: TanStack Start on Vite, one route (`/`). The build uses Nitro with the `vercel` preset (`vite.config.ts`): a server build, not static files. The PWA head and manifest come from `server/` middleware and `scripts/grok-pwa-plugin.mjs` (platform plumbing, not read).
- Web state: Zustand `persist`, localStorage key `lumen-budget-v1`, store version 2 (`store.ts`). Ledger in `src/lib/finance.ts`: `Transaction` (kind expense, income or transfer; `accountId`, `toAccountId`, fixed `categoryId`, `projectId`, `planRef`), `Account`, `Project` (`target`, `saved`, `monthlySave`, `installment`, `downPayment`, `months`, `apr`, `start`, `deadline`, `notes`, `items`, `paidBefore`), budgets as `Record<month, number>` with carry-forward (`budgetOf`). Four currencies (`CurrencyId`), one global currency setting; records carry no currency. Amounts are `number`.
- Web backup (`src/lib/backup.ts`): `LUMEN1.` = base64url of the JSON `{v, sum, d}`, where `d` is base64url of gzip of a Snapshot v1 (accounts, transactions, budgets, allocations, projects, month, insight layout). `LUMEN1P.` = the same, locked with a passphrase (PBKDF2-SHA256, AES-GCM). `npm test` lists its test files explicitly in `package.json`.
- Android: Jetpack Compose. Persistence is SharedPreferences `lumen`, one JSON text per key (`extra` = expenses, `projects`, `budget`, `currency`, `theme`, `categories`); there is no Room. `Expense.amount` and `Project.price` are `Double`; ids are `String`; dates are `yyyy-MM-dd`; a category is an English built-in id or `c<millis>`. Backup file: `{app: "lumen-backup", version: 2, ...}` (version 1 still loads). Ten currencies. minSdk 26.
- Android has no unit tests and no test dependency (`libs.versions.toml`). CI (`android.yml`) runs `assembleDebug` only, on pull requests and by hand.
- Versions today: `package.json` 0.2.0; Android `versionName` 0.2.0, `versionCode` 4.

## 1. Product context (frozen)

Lumen is a personal budget that stores money data only on the device. Web (PWA, TypeScript) is the full product; Android (Kotlin) is the compact mirror. Principles: simple first, then powerful; one clear path per task; no feature without a place in a user scenario; clean first launch without demo data.

Rules that must never break:
- Currencies are never converted or summed together. "Total" shows one sum per currency.
- Supported currencies: EUR, USD, RUB, BYN, KZT, UZS, AZN, AMD, KGS, TJS, GEL (new).
- Period (current month / any month / date range) is shared by Home and Analytics and is NOT persisted between launches.
- A project payment is a real expense transaction. Project progress counts only recorded payments.
- Old backups must always remain readable.
- Signs: EUR €, USD $, RUB ₽, BYN Br, KZT ₸, AZN ₼, AMD ֏, GEL ₾ (U+20BE), KGS U+20C0. UZS has no official sign (written soʻm, with U+02BB) and TJS is written SM. A sign the font cannot draw falls back to the ISO code. Web formats numbers with `Intl`.

Terms: primary currency (setting), active currency (what Home shows, persisted), period.

## 2. Scope

| Id | Item | Phase |
|---|---|---|
| PWA | Web PWA on GitHub Pages | P1 |
| DATA/MIG | Data contract v3 + migration | P2–P4 |
| PAR | Web parity with Android (multi-currency, period, custom categories) | P3 |
| CRUD | Edit/delete expense, date, payment rules, category management | P5 |
| CUR | Remember active currency + chip | P6 |
| BUD | Budget per currency | P6 (shippable separately) |
| XFER | File / text-code transfer (backup = transfer) | P7 |
| GEL, REM | GEL currency, backup reminder | P6 / P7 |

Out of scope: WebRTC/QR/P2P, Gemini Nano/any AI, cloud sync, exchange rates, recurring payments, bank import, income tracking, export encryption, category budgets, voice. Do not build, stub or prepare UI for them.

## 3. Data contract v3 (normative)

Field names below define the file format. Internal storage keys may differ.

```ts
type Id = string;        // new: UUIDv4 lowercase | builtin category: "builtin:<key>" | budget: "budget:<currency>" | migrated: "legacy:<32 hex>"
type Ms = number;        // epoch milliseconds, UTC
type LocalDate = string; // "YYYY-MM-DD", calendar date with NO timezone
type Currency = "EUR"|"USD"|"RUB"|"BYN"|"KZT"|"UZS"|"AZN"|"AMD"|"KGS"|"TJS"|"GEL";

interface Base { id: Id; createdAt: Ms; updatedAt: Ms; deletedAt: Ms | null; updatedBy: string /* deviceId */ }

interface Expense extends Base {
  amountMinor: number;      // integer > 0, 1 unit = 1/100 of currency (all supported currencies use factor 100)
  currency: Currency;
  title: string;
  categoryId: Id;
  occurredOn: LocalDate;    // user-visible date; travelers cross time zones, so never store as timestamp
  projectId: Id | null;     // non-null = project payment
}
interface Category extends Base {
  kind: "builtin" | "custom";
  key: string | null;       // builtin only, stable english slug; "other" is mandatory
  name: string | null;      // custom only (builtin names come from i18n)
  color: string | null;     // custom only, "#RRGGBB" from fixed palette
  archivedAt: Ms | null;    // for builtin means "hidden"
}
interface Project extends Base {
  name: string; type: "home"|"car"|"trip"|"other"; mode: "save"|"installments";
  priceMinor: number; currency: Currency; targetDate: LocalDate | null;
}
interface ProjectCost extends Base { projectId: Id; title: string; amountMinor: number; date: LocalDate }
interface Budget extends Base { currency: Currency; amountMinor: number }   // id is always "budget:<currency>"
```

Rules:
- [DATA-1] Every synced entity has Base. Deletion is soft (deletedAt set, updatedAt bumped). All reads (lists, analytics, budget ring, project progress, category-usage checks) MUST exclude deletedAt != null. Add a single data-layer filter (a thin repository in `data/` on Android, one selector layer on web), not per-screen filters.
- [DATA-2] updatedAt is monotonic per device: max(now, lastWrittenUpdatedAt + 1).
- [DATA-3] deviceId is a random UUIDv4 created at first launch, stored locally, never derived from hardware.
- [DATA-4] Expenses reference categories by categoryId. Built-in names are localized from i18n by key.
- [DATA-5] Money is integer minor units. Android stores `Double` and web stores `number` today: migrate to integer minor units (log in DECISIONS.md; confirm in `finance.ts` whether web amounts are cents or units) and never use floating-point arithmetic on sums.
- [DATA-6] Settings (primary currency, theme, language, activeCurrency, lastExportAt, reminder snooze) are local, outside the ledger, and not merged.
- [DATA-7] Tombstones are kept forever in v1 (no purge).

### File envelope (backup = transfer, one format)

```json
{
  "format": "lumen-backup",
  "schemaVersion": 3,
  "appVersion": "0.3.0",
  "exportedAt": 1730000000000,
  "deviceId": "…",
  "settings": { "primaryCurrency": "EUR" },
  "data": { "categories": [], "expenses": [], "projects": [], "projectCosts": [], "budgets": [] }
}
```

- File name: lumen-backup-YYYY-MM-DD.json, MIME application/json (plain .json for maximum messenger/email compatibility).
- Text code: LUMEN1. + base64url (no padding) of gzip(UTF-8 JSON). Fallback when CompressionStream is unavailable: LUMEN0. + base64url of plain UTF-8 JSON. Import accepts file, LUMEN1., LUMEN0., and raw JSON pasted as text. Strip whitespace/newlines and surrounding quotes before parsing.
- Legacy input also imports: web `LUMEN1.` (payload is the JSON `{v, sum, d}`), web `LUMEN1P.` (asks for the passphrase) and the Android file (`{app: "lumen-backup", version: 1 or 2}`). A `LUMEN1.` code is told apart by content: after base64url decoding, bytes 0x1F 0x8B are a v3 gzip payload and a leading `{` is the legacy envelope (HD-5).
- Limits: file ≤ 20 MB; decompressed ≤ 50 MB (stream with a hard cap, to defend against decompression bombs). Text-code hint threshold: 3 500 chars (messenger limits). Text-code copy hard cap: 200 000 chars (clipboard/binder limits); above it, copy is disabled and the file is the only option.
- Publish a JSON Schema for the envelope at shared/schema/lumen-v3.schema.json (documentation + test oracle).

## 4. Migration

- [MIG-1] Readers exist for v3 and every legacy format: web Snapshot v1 (`LUMEN1.`, `LUMEN1P.`), Android file v1 and v2, and each client's own stored data from before v3 (web `lumen-budget-v1` store version 2; Android keys `extra`, `projects`, `budget`, `categories`). Unknown newer schemaVersion → refuse with data.import.errNewer. Unknown extra fields on same version → ignore.
- [MIG-2] Legacy records get deterministic ids so that two devices migrating the same legacy data produce the same ids: legacy: + first 32 hex of SHA-256 over a canonical string "<entity>|<field>|…|<n>", where n is the occurrence index among identical canonical tuples in original order. Define the exact canonical tuple per entity in the first P2 patch, record it in DECISIONS.md, and lock it with golden vectors in shared/fixtures/ consumed by BOTH the TypeScript and Kotlin test suites.
- [MIG-3] Legacy built-in categories map to builtin:<key>. Legacy custom categories get legacy: ids from their name. Expenses referencing categories by name are re-pointed to ids. An unmappable name goes to builtin:other and is counted.
- [MIG-4] Android's single budget becomes budget:<primary currency>. Web budgets are per month with carry-forward; the v3 budget is one standing monthly limit per currency, so see HD-4 before migrating. Document the choice in DECISIONS.md.
- [MIG-5] Safety: before the first v3 migration write the raw pre-migration data to a separate key/file (lumen.premigration.v2), keep it until the next successful export or 30 days. Migration is transactional and idempotent. On failure keep old data untouched and show an error that offers raw export.
- [MIG-6] Android keeps SharedPreferences JSON (no Room; a storage-engine change is an R4 stop): a versioned, tested upgrade that writes all keys in one `commit()`. Web: bump the persisted store version (`migrate` in `store.ts`), with tests.

## 5. CRUD

### Expense edit/delete
- [CRUD-1] Tap on a history row opens a bottom sheet with the same form as "Add" (one form, two modes). Fields: amount, currency, title, category, date. Save bumps updatedAt.
- [CRUD-2] Delete by swipe, no confirmation dialog, Undo snackbar (about 6–8 s). Undo clears deletedAt. Web: swipe on touch plus a visible Delete button in the edit sheet (desktop and accessibility).
- [CRUD-3] Date control: chips Today (default) · Yesterday · Pick date. Future dates are allowed with an inline non-blocking warning (expense.date.futureSameMonth / futureOtherMonth). "Today" uses the device's current time zone.
- [CRUD-4] Validation: amount > 0 and ≤ 10^12 minor units; title length ≤ 120 (do not make stricter than current rules); currency in the supported list.
- [CRUD-5] Category picker shows non-archived categories plus the expense's current category even if archived (labelled "Archived").

### Project payments (most fragile)
- [CRUD-6] Amount and date are editable. Currency is locked (show payment.currencyLocked). Progress recalculates immediately.
- [CRUD-7] Deleting a payment always asks for explicit confirmation (payment.delete.confirm); swipe opens the dialog instead of silent delete.
- [CRUD-8] Deleting a project soft-deletes the project and its costs. Its payments stay in history as ordinary expenses (projectId = null); the confirm dialog says so. If the current app behaves differently, preserve it and log.

### Categories (Settings → Categories)
- [CRUD-9] Custom: create, rename, recolor, archive, unarchive. Name 1–30 chars; unique case-insensitively among non-deleted categories (including archived, and including current-locale built-in names) → category.name.duplicate.
- [CRUD-10] Built-in: only archive/unarchive (hide). Never rename or recolor (category.builtin.hint). other can never be archived (category.other.locked).
- [CRUD-11] Archive dialog shows the expense count and offers "Move them to…" (pick a target category) or "Keep them in this category" (default). Moving updates all affected expenses in ONE transaction.
- [CRUD-12] Hard delete (soft-delete record) only for custom categories with zero non-deleted expenses; otherwise show category.delete.onlyUnused and offer archive.
- [CRUD-13] Archived categories remain in history and analytics with an "Archived" label, and disappear only from pickers.

## 6. Active currency and budgets

- [CUR-1] One persisted setting activeCurrency (any concrete currency). It drives both what Home shows and the default currency in the Add form. Launch: activeCurrency or, if unset, the primary currency.
- [CUR-2] "Total" mode is session-only and never persisted. In Total mode the Add form defaults to the persisted concrete currency. Changing the currency inside the form affects only that expense. If the saved expense's currency differs from activeCurrency, show a snackbar currency.saved with action "Show {currency}".
- [CUR-3] Banner under the period selector when activeCurrency != primary: if that currency has a budget → currency.chip.showing + "Back to {primary}"; otherwise → currency.chip.noBudget + "Set budget" + "Back to {primary}". If BUD is cut from the release, use the fallback key currency.chip.noBudgetApplied.
- [CUR-4] Period still resets to the current month at each launch.
- [BUD-1] Budgets are per currency (budget:), a monthly limit. Settings → Budget lists currencies with budgets and lets the user add one. Currencies are never summed or converted.
- [BUD-2] Ring is shown iff (period is one whole calendar month) AND (active currency has a budget). Otherwise show "Spent" only. Show budget.ring.hint as an info affordance next to the number.
- [BUD-3] Over-budget state keeps the existing visual behavior. No category budgets, no warnings, no notifications.
- [GEL-1] Add GEL everywhere currencies are listed (pickers, project currency, budgets, i18n names).

## 7. Transfer (Settings → Data & transfer)

One screen, two blocks. Always show data.noSync at the top.

### Export (backup = transfer)
- [XFER-1] Actions: Share file (primary), Save to device, Copy code. Always show data.export.warnPlain.
- [XFER-2] Web: navigator.canShare({files}) + navigator.share where available; fallback: a temporary `<a download>` link with a blob URL. Copy: navigator.clipboard.writeText, fallback textarea select. Android: ACTION_SEND with a FileProvider URI from the cache dir (delete the temp file afterwards); Save uses CreateDocument (the system picker, no permission); copy via ClipboardManager.
- [XFER-3] If the code length > 3 500 chars show data.export.codeLong. If > 200 000 disable copy and show data.export.codeTooLong.
- [XFER-4] On successful export/save/share set lastExportAt (settings).

### Import
- [XFER-5] Sources: choose file, paste code (v3 or legacy, see section 3). (Android "open/share into app" intent filter is optional; do it last, only if trivial.)
- [XFER-6] Pipeline: read (size guards) → decode → parse → strict validation → migrate to v3 → preview → mode → snapshot → atomic apply → summary.
- [XFER-7] Strict validation of untrusted input: whitelist fields and copy only known ones (no prototype pollution; ignore proto/constructor), type and range checks, string length caps, currency whitelist, dates match YYYY-MM-DD and are real dates, amountMinor is a safe positive integer, ids are strings ≤ 64 chars, arrays ≤ 1 000 000 items. Any violation rejects the whole file with data.import.errInvalid and changes nothing.
- [XFER-8] Preview shows data.import.previewHeader and data.import.counts. If this device has no ledger data, skip mode choice and show a single "Import" button. Otherwise offer Merge (default) and Replace, each with its description, plus data.import.clockWarn and data.import.settingsNote.
- [XFER-9] Merge algorithm: for each incoming record, look up local by id. Missing → insert (tombstones included). Present → keep the record with greater (updatedAt, updatedBy) (lexicographic tie-break). Deletion is just a record with deletedAt and a newer updatedAt. Budgets merge by their id, budget:<currency>, the same way. Settings are never merged.
- [XFER-10] Replace: after confirmation (data.import.replace.confirm) wipe ledger tables and load the file; apply settings.primaryCurrency from the file (shown in the preview), nothing else from settings.
- [XFER-11] After merge or replace, repair references: expense with a missing category → builtin:other; expense/cost with a missing project → projectId = null (cost: drop it). Report the count via data.import.fixed.
- [XFER-12] Snapshot: before applying, store the full current state (separate key/file, only the latest kept). After apply show snackbar data.import.done with Undo. The Data screen has data.import.undo while a snapshot exists.
- [XFER-13] Apply is atomic: on Android one SharedPreferences `commit()` with all keys, on web one store update. Never leave a half-imported state.
- [XFER-14] Properties that tests MUST prove: import is idempotent (second import → data.import.nothingNew); merge convergence (A←B and B←A yield identical ledgers); legacy files import in both modes; hostile files are rejected without side effects; export→import round trip is lossless; a file produced by web is accepted by Android and vice versa (shared fixtures).
- [REM-1] Backup reminder: if (ledger records ≥ 20) and (never exported or lastExportAt older than 30 days) show a dismissible banner on Home (data.reminder.*); "Later" snoozes 14 days. Never block the user.

## 8. PWA on GitHub Pages

- [PWA-1] Hosting: GitHub Actions → actions/deploy-pages (the workflow `.github/workflows/pages.yml` is added in P1, after HD-7). Not a gh-pages branch.
- [PWA-2] Base path: build reads LUMEN_BASE (default /). For Vite: base: process.env.LUMEN_BASE ?? "/". All asset, manifest, service worker and router paths must work under `/<repo>/`. Never use absolute /… URLs in code or HTML.
- [PWA-3] Routing: the app has one route (`/`) today, so no deep links exist; if routes are added, prefer hash routing. The workflow also copies index.html to 404.html as a fallback.
- [PWA-4] Manifest: name, short_name: "Lumen", start_url: "./", scope: "./", display: "standalone", theme/background colors, icons 192, 512 and a maskable 512, lang from the current language when feasible.
- [PWA-5] Service worker: precache the app shell, full offline operation. Update flow is prompt-based (a hand-written service worker; vite-plugin-pwa would be a new dependency, so R4 applies): show pwa.update.available with "Reload"; never auto-reload during editing. Show pwa.offline.ready once.
- [PWA-6] Storage: after the first successful write call navigator.storage.persist() (web already asks after load through `keepStorage`; keep that). Show the result in the Data screen (storage.persist.ok / storage.persist.no). Always show storage.local and storage.clearWarn there. On iOS/Safari user agents also show storage.ios.
- [PWA-7] CSP via a `<meta http-equiv="Content-Security-Policy">` tag: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`. Verify no console violations. TanStack Start may emit inline bootstrap scripts: if so, allow exactly those by SHA-256 hash, never `'unsafe-inline'` for scripts, and log it in DECISIONS.md. `connect-src 'self'` is the technical enforcement of "data never leaves".
- [PWA-8] Zero third-party requests. Fonts and icons are bundled. DevTools Network must show only same-origin requests.
- [PWA-9] Show pwa.webAndroid.separate in the Data screen and pwa.install.hint on first launch (dismissible).
- [PWA-10] README gets a short "Deploy" section (steps below).

Human steps (document in README):
1. Repo → Settings → Pages → Source: GitHub Actions.
2. Push to main, or run the workflow manually (Actions → Build and deploy PWA → Run workflow).
3. URL: `https://<account>.github.io/<repo>/`.
4. [HD-1] Shared-origin risk: every Pages site of one account shares .github.io, and therefore shares localStorage and IndexedDB. Recommended: custom domain (set repository variable LUMEN_BASE=/) or a dedicated GitHub account/organization used only for Lumen. Until decided, do NOT host other apps under the same account.

## 9. Quality gates (every patch)

- A check blocks a patch only if the patch can cause its failure (AGENTS.md). Web: `npm run typecheck`, `npm test`, `npm run build`; add every new web test file to the `test` script in `package.json`. Android: a green **Android APK** run on main; unit tests need HD-6.
- New logic has tests: migration golden vectors, merge/idempotence/convergence, validation fuzz (hostile files), i18n parity (every key in en/ru/be, identical {placeholders}, no empty strings), date edge cases (month boundaries, leap day, future dates, time-zone change).
- Shared fixtures live in shared/fixtures/ and are consumed by both platforms; expected results are committed.
- Accessibility: touch targets ≥ 48 dp, content descriptions on icon buttons, no information by color alone, dialogs/sheets focus-trapped on web.
- No new runtime dependency without R4. Native CompressionStream, WebCrypto (SubtleCrypto), java.util.zip, MessageDigest are sufficient.
- Performance: Home and Analytics render in < 200 ms with 5 000 expenses on a mid-range phone; import of 5 000 expenses < 2 s.

## 10. Honesty catalog (must be visible in UI, all 3 languages)

| Limitation | i18n key |
|---|---|
| No automatic sync; transfer is manual | data.noSync |
| Web and Android keep separate data | pwa.webAndroid.separate |
| File/code is not encrypted; messengers may keep a copy | data.export.warnPlain |
| Messengers cut long text; prefer file | data.export.codeLong |
| Merge picks the latest edit; wrong clocks can mislead | data.import.clockWarn |
| Settings are not transferred (except primary currency on Replace) | data.import.settingsNote |
| Browser may delete data; iOS 7-day rule; clearing site data deletes everything | storage.persist.no, storage.ios, storage.clearWarn |
| Ring only for a whole month in a currency with a budget | budget.ring.hint |
| Currencies never summed, no exchange rates | currency.total.hint |
| Project payment currency locked | payment.currencyLocked |
| Future date moves the expense to another month | expense.date.future* |
| Built-in categories cannot be renamed; other cannot be archived | category.builtin.hint, category.other.locked |

## 11. Pending human decisions

- HD-1 Hosting origin (custom domain or dedicated account) — see §8.
- HD-2 Include BUD (budget per currency) in 0.3.0 or ship it as 0.3.1. Default: include; P6 is split so it can be cut.
- HD-3 Password encryption of exports. Web already offers an optional passphrase (`LUMEN1P.`). Default: keep reading `LUMEN1P.`; v3 export has no passphrase in 0.3.0, and the web passphrase field goes away only when v3 export ships (log it). Alternative: keep it and wrap the v3 payload as `LUMEN1P.`.
- HD-4 Web model gap. Web has accounts, income, transfers, allocations, per-month budgets and project fields (`saved`, `monthlySave`, `downPayment`, `months`, `apr`, `start`, `notes`, `paidBefore`) that v3 does not carry. Default: v3 carries expenses (web `kind: "expense"`), projects with costs, categories and budgets; the rest stays local to the web and is not transferred, with a visible note (new string). A budget migrates from the latest month's value, so older per-month overrides are lost. This is a lossy migration (R4 c): decide before P2.
- HD-5 Code prefix. v3 text codes reuse `LUMEN1.` as planned; legacy web codes with the same prefix are told apart by content (section 3). Alternative: a new prefix `LUMEN3.`.
- HD-6 Android tests. No test source set or test dependency exists. Kotlin golden tests need `junit` in `libs.versions.toml` (verify its version on the official release page) and a `testDebugUnitTest` step in `android.yml`. Default: approve a test-only dependency.
- HD-7 Static web build. GitHub Pages needs static output; today the build is Nitro `vercel`. P1 changes `vite.config.ts` and the PWA head/manifest plumbing in `server/` and `scripts/grok-pwa-*`. Default: approved by this spec; a Vercel deploy, if one is in use, stops.
