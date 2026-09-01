# CODO

CODO is a starter **folder** for building a real web MVP with AI, across two workshop days. It contains the *way of working* — a constitution and fifteen phase commands — and **no application code**. Code is written only after you and the assistant agree on the documents.

## What is in here, and what is deliberately not

CODO ships **fifteen command files in `.claude/commands/` and a constitution in `docs/constitution/`. Nothing else.** No sub-agents, no skills, no framework, no vendored tooling. That is a decision: everything an AI needs is plain markdown that any model can read, which keeps the project portable and the token cost honest. `CLAUDE.md` and `AGENTS.md` are the two entry points; they point at the same constitution.

## How you use it

1. Unzip CODO on your own computer, rename the folder to your project's name, and open it in VS Code.
2. Publish it to your own GitHub account as a **private** repository (one button in the Source Control panel).
3. Run **`/start`** in the Claude panel, and then follow the phase the assistant proposes after each step. You rarely need to look anything up; it tells you what to type next.

**Day one — the documents:**

`/start` → `/idea-core` → `/prd` → `/data-model` → `/ux` → `/design`

**Day two — the product:**

`/reconcile` → `/deps` → `/scenarios` → `/plan` → `/setup-dev` → `/build` → `/deploy` → `/test` → `/iterate`

Each command is one phase. The assistant writes documents, asks its questions **in files** rather than in the chat, and only writes code once the documents are agreed and the test scenarios exist.

## Where things live

- به واقع **`docs/`** — everything you read and comment on: the idea, the PRD, the data model, the UX, the dependencies, the test scenarios, the decisions, the assistant's questions, and its `status.md`. See `docs/README.md`.
- به واقع **`docs/constitution/`** — the assistant's own rules. You do not have to read them, but you can: the way of working is a document too.
- به واقع **`docs/profile.md`** — your project's languages, repository, local port, and public address once it is deployed.
- به واقع **`UI/`** — the screens you download from Claude on the web.
- به واقع **`secrets/`** — your keys and tokens. **You write them in there yourself**; the file is git-ignored and never leaves your computer.
- به واقع **`run.sh`** — builds the frontend, applies the migrations, and starts the app on your computer. The assistant runs it; you do not need to.
- به واقع **`.vscode/settings.json`** — VS Code settings that ship with the project so the same folder behaves the same way on every laptop: a light theme, one-button commit-and-push, and a terminal that renders Persian properly. Change anything you like; it applies to this folder only.

## Three facts worth knowing

**Everything is on your own computer.** One copy of every file, one machine. Your code and your idea are yours and nobody else sees them — there is no shared server and no shared account.

**Your product goes on the internet on the second day, not the first.** Day one ends with agreed documents and a design you can show someone. `/deploy` is what puts the working product on a real address.

**Nothing is ever lost.** Every step is committed to your own private repository on GitHub, so the work survives the laptop — and any change can be undone.

> The project's version (0.1, 0.2, …) is separate from any book or course version. Secrets never go into git — only into `.env` and `secrets/`, both ignored.
