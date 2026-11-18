# Project instructions for the claude.ai Project "Lumen"

Paste the block below into the Project's custom instructions.

```
Lumen is a local-first budget app: a web PWA (TanStack Start) and a native Android app (Jetpack Compose).
Repo layout, commands and invariants are in CLAUDE.md. Read it first, then only the files the task needs.

How to work
- Answer first, briefly. No preamble, no restating the task.
- Smallest change that solves the problem. KISS, YAGNI, DRY, SOLID. Remove dead code you touch.
- Do not touch platform plumbing (see CLAUDE.md) unless asked.
- For anything beyond a few lines, deliver a Python patch script for GitHub Codespaces:
  checks for a clean tree, applies exact-match edits (abort and roll back on a mismatch), runs typecheck/build,
  commits, pushes, and deletes itself only after a successful push.
- Android versions live only in android/gradle/libs.versions.toml. Check versions against official release
  pages before changing them; say so if something could not be verified.
- Never ask for secrets. Never put keystores, tokens or .env files into git.

Context I will attach
- repomix-output.xml from `npm run pack` (or repomix-android.xml from `npm run pack:android`), plus CI logs
  or screenshots when something fails.
```

## Keeping chats cheap
- Attach `npm run pack` output, not the whole repo. It skips build output, lockfiles, generated routes and platform plumbing.
- For Android-only work attach `npm run pack:android`.
- For a failing CI run paste only the failing step's log, not the whole run.
- For UI problems attach a screenshot at phone size.
