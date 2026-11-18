# Changelog

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
