# Pass Wizard — Project Instructions

Single-pane certification study platform. Exam selector → per-exam tabs (Course / Practice Quiz / Skill Tree / Companion / Progress). Shared localStorage progress store. Static HTML/CSS/JS, GitHub Pages hosted.

## Scope

- You may freely read, edit, create, and delete files inside `~/Documents/Projects/pass-wizard/`.
- You may run `git`, `gh`, `python3`, `node`, `npm`, `find`, `ls`, `grep`, `cat`, `wc`, `jq`.
- You may push commits to `AnarchySC/pass-wizard`.
- You may read from (but never modify) the source repos being migrated:
  - `~/Documents/Projects/az104-course/`
  - `~/Documents/Certification Courses/quiz.html`
  - `~/Documents/Certification Courses/quiz-data.json`
- You may not touch any other project directory.
- Never force-push. Never commit files >50MB. Never skip hooks.

## Tech principles

- **Vanilla HTML/CSS/JS only.** No frameworks, no build step, no npm dependencies. If you think you need one, log it in `DECISIONS.md` and pick the vanilla path anyway.
- **localStorage for state.** No backend in v1. `/api/progress` calls from the source `quiz.html` must be stripped.
- **Single CSS file.** `css/shared.css` is the source of truth for tokens and layout. Inline `<style>` blocks are OK for page-specific overrides.
- **Mobile-first.** The course modules get read on phones. Test at 375px first.
- **Dark mode only** for v1 — matches the existing `quiz.html` aesthetic. Light mode is a later concern.
- **Preserve the existing visual language** from `quiz.html` (JetBrains Mono for code/metrics, Inter for body, blue/purple gradients, card+border pattern). That's the "wizard" feel.

## Judgment rules

- **Default to the obvious choice.** When in doubt between elegant and boring, pick boring.
- **If a decision could meaningfully change UX**, do NOT decide — stub it with a clear TODO and log the question in `DECISIONS.md` for the user to answer later.
- **If a decision is reversible and low-stakes**, make it, log it in `DECISIONS.md` with a one-line rationale, and move on.
- **If a decision is irreversible or high-stakes** (data model, URL scheme, public API, localStorage key format), log it and proceed only if the right answer is obvious; otherwise stub and stop.
- **Never hallucinate data.** If you need a count, read the file. If you need a schema, check the existing source. Never invent question IDs, domain names, or URLs.

## Content migration rules

- **AZ-104 course** is the gold standard. Preserve all module content verbatim; only rewrite links/paths.
- **Quiz engine** from `quiz.html` must be extracted to `js/quiz-engine.js`, made exam-agnostic, and loaded from each exam page.
- **Question bank**: split `quiz-data.json` into per-exam files (`exams/<code>/quiz-data.json`). Never commit the full 48MB bundle.
- **Stubs are fine** for exams beyond AZ-104 — Course tab shows "Coming soon" until content exists. Quiz tab works from day one because the question data is already there.

## Commit style

- Atomic commits per logical step (scaffold, engine extraction, az-104 course, etc.).
- Commit messages: imperative, short, with a "why" in the body if non-obvious.
- Every commit must leave the site buildable (open `index.html` in a browser and nothing is broken).

## When to stop and ask

Stop and wait for the user if:
- A source file is missing or malformed in a way that blocks progress.
- A decision would lock in a data schema the user might want different.
- You hit a git conflict you can't trivially resolve.
- The work diverges from the plan in `README.md` and you're not sure the new path is better.

Otherwise: keep going.
