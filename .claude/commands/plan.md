---
description: Plan the build — architecture, data model, flows, checklist, and the handoff the build will work from. Opus, high effort. Ends the thinking session.
---

# /plan — everything that must be decided before a line of code

This is the **last Opus step**. Everything that needs judgement happens here, in this session, while the whole conversation about the product is still in context. When it ends, the thinking is over and the typing begins in a fresh session.

**Model: Opus 5. Effort: high.** If you are not on both, say exactly what to set (`/model`, `/effort`) and wait.

## Gate

Start only when the newest `docs/versions/<v>/NN-questions.md` is settled and raised nothing new, the PRD / data model / UX / design are approved, and `docs/living/test-scenarios.md` exists. **You** decide that, not the user.

## What you produce — three files, and nothing else

Read `docs/living/prd.md`, `data-model.md`, `ux.md`, `dependencies.md`, `test-scenarios.md`, the screens in `UI/`, `docs/profile.md`, and the current version folder. If you find a contradiction or a hole, raise it as an open question with a recommended default — do not stall, and do not paper over it.

**1. `docs/living/architecture.md`** — the durable design, following `docs/constitution/02-tech-stack.md`: FastAPI serving the built React static from one process on the local port from `.env`; SQLAlchemy and Alembic over a SQLite file from the first migration onward; no cache, no queue; no containers on the user's computer; files behind a small storage interface. **Turn `data-model.md` into its technical shape here** — this is where entities become tables, fields become columns and relations become foreign keys, and it is the only place those words belong. Include the main flows end to end, and the post-MVP note about PostgreSQL and a queue as a later move.

**2. `docs/versions/<v>/checklist.md`** — an ordered list, each item one line:
`- [ ] id — what it is · done when: <what proves it, including which test scenario it satisfies> · after: <ids>`
Every test scenario must be covered by at least one item. The number of items follows the product; there is no target.

**3. `docs/versions/<v>/handoff.md`** — **this is the important one, and on this project it is more important than usual.** It is read by a session that has none of this conversation and cannot ask you anything. Write it for a competent developer who has never seen the project, and assume nothing about what they remember. Keep it short — roughly a page — and make it point at the real documents rather than repeat them:

- What the product is, in three sentences.
- The exact file layout to create, and the local port from `docs/profile.md`.
- The data model in a compact form, or a pointer to the section of `architecture.md` that holds it.
- The order to build in, and which checklist item to start with.
- Anything genuinely non-obvious: a decision that looks wrong but is deliberate, a trap in one of the dependencies, a scenario with a subtle expectation, a dependency whose credentials have not arrived yet and what to do until they do.
- What "done" means: every checklist item ticked or BLOCKED, all tests passing, the app running locally, every test scenario walked against `http://localhost:<port>`. **Deployment is not part of it** — that is `/deploy`, a separate phase, and the build must not attempt it.

## Also: say what the build will need installed

The build cannot start until the toolchain exists on this machine, and only you know which one, because only you have chosen the stack. At the end of `architecture.md`, add a short **«چه چیزی باید نصب باشد»** section: the baseline (Python 3.12, Node 22) plus anything this particular product adds — an image library, a PDF tool, a font. `/setup-dev` reads exactly that section and installs from it. Keep it to real requirements; every extra line is a minute of somebody's day.

Do not write code. Do not create the project skeleton. Do not install anything. If you are tempted, that is the next command's job.

## How you end

Commit the three files and push. Then say — in the user's language — that the thinking is finished, and give them the next steps in order:

1. `/setup-dev` — prepare the computer for what we are about to build. Tell them this one is done in the **Copilot** panel, not here: it is installing things, it needs no product judgement, and it is free. It also runs perfectly well while they read the plan.
2. Then come back here and do these three: `/clear`, `/model` → **Sonnet**, `/effort` → **medium**.
3. Then `/build`.

Tell them plainly why the clear happens: the plan is written down, so the next session does not need this conversation — it needs room to work.
