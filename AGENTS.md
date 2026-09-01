# CODO — entry point for any coding AI

You may not be Claude Code. This project is designed so that **any** capable coding AI can continue it. This file is deliberately short; the real instructions live in `docs/constitution/` — read and obey, in order:

- به واقع `docs/constitution/00-rules.md` — how work is done here: everything is on the user's own computer, git as history and backup, which assistant does what, standing behaviors, rounds, the gate, the build protocol, secrets, where the product runs, conventions.
- به واقع `docs/constitution/01-workflow.md` — the phases across the two workshop days, the gates, living vs versioned documents, and the iteration cycle.
- به واقع `docs/constitution/02-tech-stack.md` — the stack: SQLite, one local process on one local port, containers only on the deployment server.

**Then read `docs/status.md`** — where the project stands, what was in progress, and the next step. Everything meaningful that happens must be written back into that file so the next session can continue without any chat history. **Keep it current after every meaningful step.**

**And read `docs/profile.md`** — the languages, the repository, the local port, and (after `/deploy`) the public address.

**Phase & utility commands.** The user drives the project with short commands. Day one: `/start` · `/idea-core` · `/prd` · `/data-model` · `/ux` · `/design`. Day two: `/reconcile` · `/deps` · `/scenarios` · `/plan` · `/setup-dev` · `/build` · `/deploy` · `/test`, then `/iterate`. Plus the floating command `/add-idea` (to bank new ideas into `docs/living/roadmap.md` without disrupting the active phase).

All sixteen command files live under `.claude/commands/<name>.md`. When the user types `/xyz` or mentions a phase: **open `.claude/commands/xyz.md`, read it fully, and follow it** — the files work as ordinary prompts. If your environment or toolchain expects prompts in a different folder (e.g. `.cursor/rules/`, `.roo/prompts/`, etc.), you may copy (`cp`) them into whichever directory you like.

You will most often be asked to do the mechanical half of this project: installing the toolchain at `/setup-dev` and installing things on the server at `/deploy`. Both of those command files are written for you. Do not take over the product thinking; that runs on a different assistant, and its output is already on disk.

CODO ships these command files and the constitution — **no sub-agents, no skills, no framework.** Everything you need is plain markdown, on purpose, so that any model can follow it. Do not add tooling. Never mention an internal tool name to the user; speak to a non-technical founder in plain language.

`CLAUDE.md` is the same entry point for Claude Code; keep the two files consistent if you ever edit them.
