# CODO — entry point for Claude Code

This file is deliberately short. The real instructions live in `docs/constitution/` — read and obey, in order:

- به واقع `docs/constitution/00-rules.md` — how work is done here: everything is on the user's own computer, git as history and backup, which assistant does what, standing behaviors, rounds, the gate, the build protocol, secrets, where the product runs, conventions.
- به واقع `docs/constitution/01-workflow.md` — the phases across the two workshop days, the gates, living vs versioned documents, and the iteration cycle.
- به واقع `docs/constitution/02-tech-stack.md` — the stack: SQLite, one local process on one local port, containers only on the deployment server.

**Then read `docs/status.md`** — it says where the project stands and what the next step is. **Keep it current after every meaningful step**; it is the hand-off file for any session that continues this project, including the one a week later.

**And read `docs/profile.md`** — the languages, the repository, the local port, and (after `/deploy`) the public address.

The user drives the project with phase commands. Day one: `/start` · `/idea-core` · `/prd` · `/data-model` · `/ux` · `/design`. Day two: `/reconcile` · `/deps` · `/scenarios` · `/plan` · `/setup-dev` · `/build` · `/deploy` · `/test`, then `/iterate` for later versions. Plus the floating command `/add-idea` (to bank new ideas into `docs/living/roadmap.md` without disrupting the active phase). Each command's full instructions are the markdown file `.claude/commands/<name>.md`.

CODO ships these sixteen command files and the constitution — **no sub-agents, no skills, no other tooling.** That is a decision, not an omission: it keeps the project readable by any AI and the token cost honest. Do not add any.

Speak to a non-technical founder in plain language. **Never say "Docker", "container", "reverse proxy" or "systemd"** — these are internal mechanics.

`AGENTS.md` is the same entry point for other coding AIs; keep the two files consistent if you ever edit them.
