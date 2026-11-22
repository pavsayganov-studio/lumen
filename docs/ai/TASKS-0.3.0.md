# Lumen 0.3.0 — phased work plan

Each phase ships as one or more patch scripts (`lumen_patch_NNNN_slug.py`), pushed to main in the order below, with tests. Acceptance is checked before the next phase starts. After an Android patch run **Android APK** by hand on main. P3 and P4 may go in either order; P6 splits into P6a and P6b. Requirement ids (CRUD-1, XFER-5, ...) are in `SPEC-0.3.0.md`.

## Before P1: decisions
Recon is done (SPEC 0.1). Settle HD-1, HD-4, HD-6 and HD-7 first; the rest have defaults.

## P1 — PWA on GitHub Pages (ship the current web first)
REQ: PWA-1 to PWA-10, `storage.*` and `pwa.*` strings.
Steps: static build (HD-7); base path via `LUMEN_BASE`; relative manifest and service worker; icons; prompt-based update; CSP meta; Data screen storage block; README Deploy section; add `.github/workflows/pages.yml` (Node from `.nvmrc`; check every action version on its release page, `android.yml` shows what the repo uses today).
Accept: opens under `/<repo>/`; installable (Lighthouse PWA checks); works offline after the first load; the update prompt appears after a new deploy; no CSP violations; the Network tab shows only same-origin requests.

## P2 — Data contract v3 and migration (shared)
REQ: DATA-*, MIG-1 to MIG-5.
Steps: `shared/schema/lumen-v3.schema.json`; canonical legacy-id algorithm in `DECISIONS.md`; fixtures (real legacy samples from both clients, v3 samples, hostile samples, merge cases with expected results); pure migration, validation and merge functions in TypeScript; Kotlin ports (HD-6); golden tests on both sides from the same fixtures.
Accept: TS and Kotlin tests pass on the same fixtures; legacy to v3 gives byte-equal normalized JSON on both platforms.

## P3 — Web: data layer v3 and parity
REQ: DATA-*, MIG-*, PAR, GEL-1.
Steps: store version 3 with a transactional migration and a pre-migration copy; data-layer soft-delete filter; multi-currency, period (shared by Home and Insights, not saved) and custom categories to match Android; GEL.
Accept: web matches Android for these features; upgrading a legacy web dataset is lossless within HD-4 (tests with fixtures); no UI regressions.

## P4 — Android: data layer v3
REQ: DATA-*, MIG-*, GEL-1.
Steps: versioned v3 upgrade of the SharedPreferences keys with tests; `deviceId`; soft-delete filter in `data/`; ids by reference; integer minor units.
Accept: migration tests pass; the app upgrades from 0.2.0 data without loss; green **Android APK** run.

## P5 — CRUD (both platforms)
REQ: CRUD-1 to CRUD-13, strings under "Expenses and dates" and "Categories".
Accept: every CRUD-* behavior is covered by a UI or unit test; project payment rules verified; archive-with-move is atomic; Insights and History show archived categories with the label.

## P6a — Active currency
REQ: CUR-1 to CUR-4.
Accept: after a relaunch the last concrete currency is shown; Total is not saved; banner and snackbar behave per spec; the period resets.

## P6b — Budget per currency
REQ: BUD-1 to BUD-3, MIG-4.
Accept: the ring shows only for a whole month with a budget in the active currency; the legacy budget migrates to the primary currency; no currency is ever summed.

## P7 — Transfer
REQ: XFER-1 to XFER-14, REM-1, strings under "Data and transfer".
Steps in order: export and encode; decode and validate; preview with merge or replace; snapshot and undo; platform share, save and copy; reminder; optional Android open-with intent.
Accept: cross-platform round trips pass on shared fixtures; hostile input is rejected without side effects; merges are idempotent and convergent; every hint is visible in en, ru and be.

## P8 — Hardening and release
- i18n audit (parity test green, natural Belarusian wording), accessibility pass, performance budget (SPEC 9).
- Version bump to 0.3.0: `package.json`, Android `versionName`, `versionCode` +1; CHANGELOG; README (what is stored, privacy, transfer guide, Pages deploy); move the shipped rules into `AGENTS.md`.
- Manual QA script in `docs/ai/QA-0.3.0.md`: legacy upgrade, web to Android and back, offline PWA, update prompt, iOS Safari install.
Accept: all gates in SPEC 9 are green; no open `TODO(spec)` marker; `BACKLOG.md` lists deferred ideas.
