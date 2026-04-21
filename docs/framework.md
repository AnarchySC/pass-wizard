# Pass Wizard — Framework Spec

Status: **draft / design lock for phase 0**. Reviewed before any generator code lands.

## Vision

Pass Wizard is a **fork-and-fill study-site framework**. The repo ships an exam-agnostic UI (course reader, practice quiz, skill tree, companion, progress) and a tiny contract. Users drop their own source material (PDFs, text dumps, Markdown, anything readable) into a local folder and run a generator that hands the material to an LLM, which writes into the contract. The result is a full, working study site for any certification.

**What ships on GitHub:** the framework — UI code, engine, empty `exams/` shells, generator scripts, docs.

**What does not ship:** any exam content. All of `exams/<slug>/quiz-data.json`, `exams/<slug>/skill-tree.json`, `exams/<slug>/course/**`, `exams/<slug>/companion/**` is user-generated and gitignored by default.

## Architecture

```
pass-wizard/
├── index.html                        Landing / exam selector
├── css/, js/                         Shared UI + engine
├── exams/
│   └── <slug>/
│       ├── meta.json                 HAND-WRITTEN (or generator-initialized)
│       ├── quiz-data.json            GENERATED, gitignored
│       ├── skill-tree.json           GENERATED, gitignored
│       ├── course/modules/*.html     GENERATED, gitignored
│       └── companion/*.html          GENERATED, gitignored
├── dropbox/                          User's raw source material
│   └── <slug>/
│       ├── *.pdf, *.md, *.txt
│       └── ...
└── tools/
    ├── new-exam.py                   Scaffold a new exam skeleton
    ├── generate.py                   Generator CLI
    └── llm/
        ├── __init__.py               Adapter registry
        ├── claude.py                 Claude API adapter (default)
        └── ollama.py                 Local ollama adapter
```

`dropbox/` is gitignored. `exams/<slug>/` is shipped as an empty shell (folders + `meta.json` scaffolded) but all generated content is gitignored so a fork of the repo stays legally clean.

## File contracts

The contracts below are the **one thing the LLM must not deviate from**. Everything else is free.

### `exams/<slug>/meta.json`

Hand-written when you scaffold an exam. The generator may append or update it, never overwrite.

```json
{
  "code": "AZ-104",
  "slug": "az-104",
  "name": "Azure Administrator",
  "vendor": "Microsoft",
  "passThreshold": 70,
  "sessionSize": 25,
  "questionCount": 0,
  "tabs": {
    "course": true,
    "quiz": true,
    "skillTree": true,
    "companion": true,
    "progress": true
  },
  "domains": {
    "<Domain Name>": "regex|pattern|for|tagging"
  },
  "courseModules": [
    { "id": "01-identity", "num": "01", "title": "Administer Identity",
      "file": "course/modules/01-identity.html" }
  ],
  "companionGuides": [
    { "id": "azure-ad", "title": "Azure AD Fundamentals",
      "icon": "🔐", "status": "available",
      "file": "companion/azure-ad.html",
      "questCount": 5, "xp": 100 }
  ]
}
```

`questionCount` is recomputed by the generator after each quiz-data write.

### `exams/<slug>/quiz-data.json`

Array of question objects. Schema matches the existing AZ-104 bank verbatim:

```json
[
  {
    "id": "AZ-104-Q1",
    "exam": "AZ-104",
    "number": 1,
    "question": "…",
    "options": { "A": "…", "B": "…", "C": "…", "D": "…" },
    "correct": ["C"],
    "type": "single",
    "explanation": "…",
    "has_visual": false,
    "images": []
  }
]
```

- `id` format: `<CODE>-Q<number>`. Unique per exam.
- `options` keys are always A-F (2–6 options).
- `correct` is an array even for single-answer questions (matches existing engine).
- `type` is `single` or `multi`.
- `images` is an array of base64 PNG strings (no external URLs — privacy principle).

### `exams/<slug>/skill-tree.json`

Migrates out of the hardcoded `js/skill-tree.js` blob. Schema matches the `PW_SKILL_TREE_AZ104` constant:

```json
{
  "tierUnlockThreshold": 0.8,
  "tiers": [
    {
      "level": 1,
      "title": "Identity & Governance (15-20%)",
      "skills": [
        { "id": "azure-ad", "icon": "🔐", "name": "Azure AD",
          "desc": "Users, groups, guest accounts", "xp": 20 }
      ]
    }
  ],
  "quests": {
    "<skill-id>": [
      { "id": "q1", "title": "…", "xp": 20, "resources": [] }
    ]
  }
}
```

Unlock rule: a tier unlocks when `floor(sum(unlocked_xp) / sum(tier_xp)) >= tierUnlockThreshold`. Engine handles that — the data just needs to add up.

### `exams/<slug>/course/modules/*.html`

Standalone HTML pages. Loaded into the course tab by the existing engine via `meta.json → courseModules[].file`. Convention:

- Single `<article>` root.
- `<h1>` = module title (matches `courseModules[].title`).
- `<h2>` = section heading.
- Code blocks use `<pre><code>`.
- No inline scripts. No external asset references except images under `course/modules/img/<module-id>/`.

### `exams/<slug>/companion/*.html`

Twine-style interactive walkthrough. Single file per guide. Convention:

- Self-contained: all CSS/JS inline so export/backup is one file.
- Passage IDs via `data-passage="…"` attributes.
- Default start passage id: `start`.

## LLM adapter interface

One interface, multiple backends. Selected by env var `PW_LLM_BACKEND=claude|ollama` (default `claude`).

```python
class LLMAdapter:
    def complete(
        self,
        system: str,
        user: str,
        response_schema: dict | None = None,  # JSON schema if structured output
        max_tokens: int = 4096,
    ) -> str | dict: ...
```

**Claude adapter** (default):
- Model: `claude-opus-4-7` for generation quality, `claude-haiku-4-5` for high-volume question rewriting.
- Auth: `ANTHROPIC_API_KEY` env var.
- Structured outputs via tool-use forcing when `response_schema` is provided.
- Prompt caching enabled on the system prompt (source-material chunk gets cached per-file).

**Ollama adapter** (escape hatch):
- Base URL: `OLLAMA_HOST` env var (default `http://localhost:11434`).
- Default model: `qwen2.5:14b-instruct` (env override `PW_OLLAMA_MODEL`).
- JSON mode via `format: "json"`.

**Swap rule:** every generator module imports `from tools.llm import get_adapter` — never imports `claude.py` or `ollama.py` directly.

## Generator CLI

```bash
# Scaffold a new exam
tools/new-exam.py --code AZ-500 --name "Azure Security Engineer" --vendor Microsoft

# Run generators. Each is idempotent and resumable.
tools/generate.py <slug> quiz        # → exams/<slug>/quiz-data.json
tools/generate.py <slug> course      # → exams/<slug>/course/modules/*.html
tools/generate.py <slug> skill-tree  # → exams/<slug>/skill-tree.json
tools/generate.py <slug> companion   # → exams/<slug>/companion/*.html
tools/generate.py <slug> all         # all of the above, in order

# Options
--dry-run        # print what would be written, no LLM calls
--resume         # skip items already present
--limit N        # cap LLM calls for a dry pass
--backend claude|ollama   # override PW_LLM_BACKEND
```

### Resumability & idempotency

- Quiz: each generated question is written to a line-delimited staging file (`exams/<slug>/.stage/quiz.ndjson`) before being compiled into the final `quiz-data.json`. Re-running with `--resume` picks up where the last run left off.
- Course: per-module. Skip modules whose output file already exists unless `--force`.
- Skill tree: atomic single-file generation. Overwrites only with `--force`.
- Companion: per-guide. Same skip rule as course.

### Logging

All generator runs append to `exams/<slug>/.stage/generate.log` (gitignored). Human-readable, one line per LLM call with timing + token counts.

## Phase plan

Each phase ends with a working, reviewable artifact. No phase starts until the previous lands.

- **Phase 0 — Docs & positioning** *(current)*
  - This spec + anarchygames.org page reword. No code changes to the engine.
- **Phase 1 — Scaffolder & validators**
  - `tools/new-exam.py` creates `exams/<slug>/` + minimal `meta.json`.
  - `tools/validate.py <slug>` checks file presence + JSON schema conformance.
  - Extend `.gitignore` to cover the new generated paths.
- **Phase 2 — LLM adapter layer**
  - `tools/llm/claude.py`, `tools/llm/ollama.py`, `tools/llm/__init__.py`.
  - Unit tests hit a mock; integration test gated on env key presence.
- **Phase 3 — Quiz generator**
  - Smallest useful slice. Chunk source material → question generation → dedup → validate → write.
- **Phase 4 — Course generator**
  - Uses `meta.json → courseModules[]` as a table of contents. One HTML file per module.
- **Phase 5 — Skill-tree generator**
  - Extract `PW_SKILL_TREE_AZ104` out of `js/skill-tree.js` into `exams/az-104/skill-tree.json` (migration), then generate trees for new exams.
- **Phase 6 — Companion generator**
  - Hardest. Story-driven branching. Likely last-in / first-polished.
- **Phase 7 — README overhaul + public readiness pass**

## Open questions (stubbed, not decided)

- Do we ship a **sample exam** (e.g. a public-domain mock cert) so first-time cloners can see the flow end-to-end without any LLM calls? Leaning yes, but out-of-scope until phase 7.
- **Image handling in course modules.** OCR from source PDFs? LLM descriptions? Decide in phase 4.
- **Cost budget** for a full AZ-104 generation via Claude Opus. Decide before phase 3 implementation.
