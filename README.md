# Lumen

Lumen is a local-first budget for one month at a time. The money stays on the device. Nothing is uploaded.

## What you can do

- See what is left to spend, what is already given a job, and what is still free.
- Open each insight: trend, top spending, upcoming bills, saving rate, money flow, accounts, and goals.
- Add an expense, income, or transfer. It stays in local storage on this device.
- Save toward a home, a car, or anything else. Or pay for it in parts.
- Copy a backup code and paste it on a new phone.

## Language

Russian if the phone is set to Russian. English otherwise. You can also choose the language in Settings.

## Backup code

Settings → Backup code.

- With no passphrase, the code is a compressed snapshot plus a checksum. A damaged paste is rejected.
- With a passphrase, the same snapshot is locked with AES-GCM. The passphrase is stretched with PBKDF2 (120,000 rounds). The code is unreadable without those words. Lumen never sees the passphrase or the code.

Prefixes:

- `LUMEN1.` open code
- `LUMEN1P.` locked code

## Goals

A goal is either money you are setting aside, or a purchase you pay in parts.

- Saving up: price, already saved, and how much to set aside each month. Lumen shows how many months that pace needs.
- Paying in parts: price, down payment, number of months, yearly rate, and the first payment date. `0%` means equal payments. A rate uses a standard monthly loan payment. Cash already saved counts toward the down payment. Future installments show up on the Upcoming calendar. They are not stored as transactions until you record them.

## Android

The native project is in `android/` (Jetpack Compose, Gradle wrapper). GitHub Actions builds it on demand: **Actions -> Android APK -> Run workflow**, then download the `lumen-debug-apk` artifact. Locally: `cd android && ./gradlew assembleDebug`. All Android versions live in `android/gradle/libs.versions.toml`. The web app is the full product; the Android project mirrors the budget screen and does not yet include goals, backup codes, or language switching.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
```
