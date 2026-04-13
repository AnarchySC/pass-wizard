# Pass Wizard

Single-pane certification study platform. One URL, one UI, one progress store, for every cert you're chasing.

**Live:** https://anarchysc.github.io/pass-wizard/ *(coming soon)*

## What it does

Pick an exam from the landing page. Inside each exam you get tabs:

- **Course** — walk-through modules with explanations, examples, and labs.
- **Practice Quiz** — weighted question bank with domain filtering, weak-question drilling, and session history.
- **Skill Tree** — RPG-style progression map *(coming soon)*.
- **Companion** — interactive story-driven walkthroughs *(coming soon)*.
- **Progress** — your stats: sparkline history, mastery grid, weakest questions.

Progress is saved per-exam in `localStorage` under `passwizard:<exam-code>`. No account, no backend, works offline after first load.

## Supported exams

| Code | Name | Course | Quiz | Skill Tree | Companion |
|------|------|:------:|:----:|:----------:|:---------:|
| AZ-104 | Azure Administrator | ✅ | ✅ | 🚧 | 🚧 |
| AZ-400 | DevOps Engineer | 🚧 | ✅ | — | — |
| AZ-305 | Solutions Architect | 🚧 | ✅ | — | — |
| PSM-I | Scrum Master | 🚧 | ✅ | — | — |

## Structure

```
pass-wizard/
├── index.html              Landing: exam selector
├── css/shared.css          Design tokens, layout
├── js/
│   ├── app.js              Router
│   ├── progress.js         localStorage unified store
│   └── quiz-engine.js      Exam-agnostic quiz engine
├── exams/
│   └── <code>/
│       ├── meta.json       Name, domains, pass threshold, enabled tabs
│       ├── course/         Course module HTML pages
│       └── quiz-data.json  Per-exam question bank
├── CLAUDE.md               Instructions for autonomous Claude sessions
├── DECISIONS.md            Running decision log
└── README.md
```

## Origins

Pass Wizard consolidates four prior projects:

- [`az104-course`](https://github.com/AnarchySC/az104-course) — AZ-104 course modules (archived after migration)
- [`Skilltwee-AZ104`](https://github.com/AnarchySC/Skilltwee-AZ104) — AZ-104 skill tree
- [`Skilltwee-AZ104-Companion`](https://github.com/AnarchySC/Skilltwee-AZ104-Companion) — AZ-104 Twine walkthroughs
- A local 4-exam practice quiz (`quiz.html`) with 1,293 questions across AZ-104 / AZ-400 / AZ-305 / PSM-I

## Dev

Pure static site. No build.

```bash
git clone https://github.com/AnarchySC/pass-wizard.git
cd pass-wizard
python3 -m http.server 8000   # or any static server
# open http://localhost:8000/
```

## Privacy

- **No account, no backend.** Everything runs client-side.
- **No third-party scripts, no analytics, no tracking pixels.**
- **No Google Fonts.** The original `quiz.html` design loaded Inter and JetBrains Mono from `fonts.googleapis.com`, which leaks your IP and User-Agent to Google on every page load. We removed that. Fonts are self-hosted (pending — see `DECISIONS.md`) or fall back to system fonts.
- **Progress is stored in `localStorage`** under keys prefixed `passwizard:<exam-code>`. It never leaves your device. Clearing your browser data clears your progress.
- **Export/import** your progress as a single JSON via the Progress tab to back it up or move it between devices.

## License

MIT.
