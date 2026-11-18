# Changelog

## 2026-11-17 (journey review)

- First launch asks for a clean start or sample data. The pinned November clock applies to sample data only; real data uses the real date. A new budget starts at 0 and Home prompts for it. Erasing or loading sample data needs a second tap.
- Goals became Projects: new Trip kind, target date with the monthly amount that meets it, notes, a schedule of costs with dates, Pay buttons that record real transactions, and a project screen with progress, schedule and history. Unpaid rows stay Due instead of vanishing; payments are never assumed by date.
- Transactions can be tagged to a project. Transfers have a No category option, default to Savings only when moving into a saving account, and cannot target the same account. Editing a plain transfer no longer turns it into food spending.
- Chart ranges start at the first transaction instead of a fixed 2026 date. Days remaining follow the app clock.

## 2026-11-17

- Android: manual-only CI build, Gradle wrapper, AGP 9.4 / Gradle 9.6 / Kotlin 2.4 / Compose 1.12, system-bar insets, no overlapping rows, readable text fields, back button, rotation-safe state, backups off. Code split into `data/` and `ui/`.
- Repo: removed build output, Grok sandbox tooling and agent docs, unused dependencies, dead code. Added `.gitignore`, `CLAUDE.md`, repomix config, Dependabot.

## 2026-11-14

- Production pass. Removed unused English-only helpers. Chart labels follow the language. Long labels stay inside their boxes in English and Russian. Ledger, goals, and backup codes are covered by tests. App version is 1.1.0.

## 2026-11-10

- Local backup codes. Open codes carry a checksum. Optional passphrase locks the code with AES-GCM. Data is still never uploaded.
- Goals. Save toward a price, or pay in parts with a down payment, term, and yearly rate. Future installments appear on Upcoming.
- Language follows the phone: Russian or English. Settings can override it.
- Demo goals: an apartment you are saving for, and a car paid in parts from December 2026. November’s budget numbers stay the same.

## 2026-11-09

- First Lumen budget: ring, insights, transactions, accounts, and the Android debug workflow.
