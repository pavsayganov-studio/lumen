# Lumen 0.3.0 — decisions

Owner decisions of 2026-11-22 on SPEC section 11. They win over `SPEC-0.3.0.md` where the two differ; the spec carries the consequences in 3.1.

## D-1 Pages origin (HD-1)
Default URL `https://<user>.github.io/<repo>/`. The base path comes from `LUMEN_BASE`, so a custom domain later is a variable change, not a code change. The shared-origin warning stays in the README Deploy section.

## D-2 Budget per currency (HD-2)
Included in 0.3.0 (phase P6b), on the mapping in D-4.

## D-3 Passphrase codes and files (HD-3)
- Passphrase protection stays on web and is added on Android, in the existing format: `LUMEN1P.` = base64url of JSON `{v, salt, iv, ct}`; key = PBKDF2-SHA256, 120 000 iterations, 16-byte salt; cipher = AES-GCM, 12-byte IV, 128-bit tag appended to `ct`; the plaintext is the gzip bytes also used by `LUMEN1.`.
- Android uses the JDK only (`PBKDF2WithHmacSHA256`, `AES/GCM/NoPadding`); no runtime dependency.
- An encrypted file holds the same `LUMEN1P.` text. Import accepts it from a file or pasted.
- Plain export stays available, with `data.export.warnPlain`. P7 adds the passphrase strings (reuse the web ones where they exist) in en, ru and be, including a warning that a forgotten passphrase cannot be recovered.

## D-4 Zero data loss between web and Android (HD-4)
Migration and transfer are lossless in both directions. The exact v3 shape is SPEC 3.1. Decisions:
- v3 carries the web's own data: `accounts`, `incomes`, `transfers`, `allocations`, per-month budgets, and the optional web project fields. Every record has Base (`id`, `createdAt`, `updatedAt`, `deletedAt`, `updatedBy`).
- Web keeps its full feature set on v3 and gains Android's: currencies with GEL, the shared period (not saved), custom categories (create, rename, recolor, archive), the CRUD rules, the active-currency chip.
- Android keeps its compact UI. Data it has no screen for (accounts, incomes, transfers, allocations, unknown fields and collections) is stored as JSON, only Base is read for merging, and everything is written back on export. Round trip Web → Android (merge, edit) → Web must drop nothing; a shared fixture test proves it on both sides.
- Web records carry no currency today: at migration they take the currency saved in the web settings.
- Budget mapping: `budget:<currency>:<YYYY-MM>` is a month entry (web per-month budgets map 1:1) and `budget:<currency>` is the standing default (Android's single number). Effective budget for a month = the latest entry with month ≤ it, else the standing default, else 0. An Android budget edit writes the entry for the month in view. This is my proposal for the mapping you asked to be documented; change it here if you want another.
- Web `month`, `insightOrder` and `hiddenInsights` are saved under `settings.web` and applied only when a web file replaces web data.
- Income tracking is no longer out of scope.

## D-5 Code prefix (HD-5)
`LUMEN1.` and `LUMEN1P.` are reused. Both decode to the JSON envelope `{v, ...}`; `v` = 1 is the legacy web Snapshot, `v` = 3 is a v3 file. One decoder reads both. This replaces the byte-sniffing rule drafted in SPEC section 3.

## D-6 Android unit tests (HD-6)
Approved: `testImplementation` of JUnit 4, and `org.json` for JVM tests if needed, in the Gradle files and `libs.versions.toml`. Nothing new in `implementation`. Versions are checked on the official release pages when the dependency is added. CI gets a `testDebugUnitTest` step.

## D-7 Static build (HD-7)
The Vercel/Nitro build stays the default. A static target for GitHub Pages is added beside it, chosen by an environment variable in the Pages build; `.github/workflows/pages.yml` builds it and deploys with `actions/deploy-pages`.
