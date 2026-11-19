# Lumen

Lumen is a local-first budget for one month at a time. The money stays on the device. Nothing is uploaded.

## What you can do

- See what is left to spend, what is already given a job, and what is still free.
- Open each insight: trend, top spending, upcoming bills, saving rate, money flow, accounts, and projects.
- Add an expense, income, or transfer. It stays in local storage on this device.
- Plan a project: a home, a car, a trip, anything big. Save toward it or pay in parts, schedule its costs, and record each payment.
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

## First launch

Lumen opens empty. Home asks for the monthly budget and a first transaction. A clean start has two accounts (Main, Saving), no budget and no history. Settings → Your data can erase everything, after a second tap. Settings also sets the language (Russian, Belarusian, English), the currency (€, $, ₽, Br; symbol only, no conversion) and the theme (Light, Dark, or follow the phone).

## Projects

A project is a purchase or a plan: a home, a car, a trip, anything else.

- **Saving up**: price, already saved, how much you set aside each month, and an optional target date. Lumen shows the months that pace needs and, with a target date, the monthly amount that makes it.
- **Paying in parts**: price, down payment, months, yearly rate, first payment date, and how many payments were made before you started tracking. `0%` means equal payments; a rate uses a standard monthly loan payment. Cash already set aside counts toward the down payment.
- **Costs and dates**: flights, notary, insurance, anything you will pay, each with a date. They are not part of the price; they are the schedule.
- **Recording**: every schedule row has a Pay button that opens the normal transaction editor, pre-filled. A saved payment settles the row. Money set aside is a transfer into your saving account tagged to the project. Any expense can also be tagged to a project in the transaction editor.
- **Upcoming** lists unpaid rows. A row whose date has passed stays there marked Due until it is paid, and rows missed in earlier months are carried into the current month.
- **Progress**: money set aside, or paid out directly, whichever is more. Nothing is counted twice.

## Android

The native project is in `android/` (Jetpack Compose, Gradle wrapper). GitHub Actions builds it on Android pull requests and on demand (**Actions -> Android APK -> Run workflow**, artifact `lumen-debug-apk`). A tag such as `v0.1.0` builds the signed APK and attaches it to a GitHub release. Locally: `cd android && ./gradlew assembleDebug`. All Android versions live in `android/gradle/libs.versions.toml`. The web app is the full product; the Android project is a smaller mirror (budget, history, spending by category) and does not yet include projects or backup codes.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
```
