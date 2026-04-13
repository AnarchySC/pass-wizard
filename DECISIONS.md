# Decision Log

Running list of non-trivial choices made during Pass Wizard development. Each entry: date, decision, rationale, reversibility. User reviews async — no need to interrupt.

Format:
```
## YYYY-MM-DD — short title
**Decision:** what was chosen
**Why:** one-sentence rationale
**Alternatives considered:** what else was on the table
**Reversible:** yes/no — if no, explain what's locked in
```

---

## 2026-04-13 — Repo name and slug
**Decision:** Project name "Pass Wizard", GitHub slug `pass-wizard`, Pages URL `anarchysc.github.io/pass-wizard/`.
**Why:** User picked the name; kebab-case is the GitHub convention.
**Alternatives considered:** `cert-hub`, `skilltwee-hub`, `cert-path`.
**Reversible:** yes — renaming the repo is trivial and GitHub auto-redirects.

## 2026-04-13 — Monorepo over aggregator
**Decision:** Single repo containing all exam content; source repos get archived after migration.
**Why:** Unified progress store (localStorage) is the core value prop — fragmented data across iframes kills the "single pane" feeling.
**Alternatives considered:** Aggregator landing page that iframes existing repos.
**Reversible:** yes, but expensive — source repos stay archived-not-deleted so rollback is possible.

## 2026-04-13 — No build step, vanilla JS
**Decision:** Static HTML/CSS/JS only. No bundler, no framework, no npm install.
**Why:** All source material is already vanilla HTML. A build step adds maintenance cost with zero UX benefit at this size.
**Alternatives considered:** Vite + React, Astro (for per-exam static gen), Hugo.
**Reversible:** yes — can be adopted later if a real need emerges.

## 2026-04-13 — localStorage state, no backend for v1
**Decision:** All progress stored in `localStorage` under `passwizard:<exam-code>` keys. Source `quiz.html`'s `/api/progress` calls get stripped.
**Why:** GitHub Pages can't host a backend, and a dedicated progress server isn't worth the ops cost for v1. localStorage is per-device but acceptable for a study tool.
**Alternatives considered:** Cloudflare Workers KV, Supabase free tier.
**Reversible:** yes — schema is JSON so future sync is a sync layer, not a rewrite.

## 2026-04-13 — No Google Fonts (privacy)
**Decision:** Removed the `@import` of `fonts.googleapis.com` from `shared.css`. Font stacks fall back to system fonts.
**Why:** Loading fonts from Google leaks visitor IP + User-Agent on every page load — a privacy regression we don't need. Self-hosted fonts give the same visual result without the third-party call.
**Alternatives considered:** Keep the Google import; switch to system fonts permanently.
**Reversible:** yes.
**Follow-up TODO:** Download Inter and JetBrains Mono `.woff2` files, commit under `css/fonts/`, and add `@font-face` declarations so the intended typography is restored without third-party calls.

## 2026-04-13 — `main` as default branch
**Decision:** Renamed the initial branch from `master` to `main` and set it as default on GitHub.
**Why:** GitHub's own default since 2020; matches most of the user's other active repos.
**Alternatives considered:** Keep `master`.
**Reversible:** yes.

## 2026-04-13 — Question bank NOT migrated in scaffold commit
**Decision:** The 497 AZ-104 (and 1293 total) questions from `quiz-data.json` are NOT committed in the scaffold. Only the engine, shell, and metadata.
**Why:** Two reasons. (1) The questions likely originate from a VCE dump of Microsoft exam content, which is under Microsoft IP. Publishing them in a public GitHub repo under the user's name creates legal exposure that the user should explicitly opt into. (2) Even ignoring IP, 25MB of question data in the scaffold commit makes the initial history bloated. Better to land the engine first, then make a deliberate call on question bank handling.
**Alternatives considered:** Commit the full AZ-104 bank now; commit obfuscated; keep private.
**Reversible:** yes — adding the data later is trivial. Removing it from git history once public is not.
**Status:** BLOCKS step 3 (engine extraction end-to-end test). User must decide on one of: (a) make repo private, (b) put question data under `.gitignore` and load from a local file path for dev only, (c) rewrite/paraphrase the questions to avoid direct copying, (d) ship without practice quiz content and link to the local file instead.

## 2026-04-13 — Per-exam quiz-data split
**Decision:** Split the 48MB `quiz-data.json` into `exams/<code>/quiz-data.json` (one file per exam). Never commit the full bundle.
**Why:** Loading 24.8MB for AZ-104 is already painful; loading the full 48MB to answer one question is absurd. Per-exam split means only the selected exam pays the cost.
**Alternatives considered:** Keep as single file; chunk by domain within each exam.
**Reversible:** yes — splitting is scriptable in both directions.
