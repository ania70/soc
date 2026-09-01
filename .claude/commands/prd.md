---
description: Write the PRD as a living document, via the questions loop
---

# /prd — the product document (living)

Produce `docs/living/prd.md` with the **questions loop** (`docs/constitution/01-workflow.md`).

1. Read `docs/versions/0.1/01-idea-core.md` and **every** file in the current version folder, plus the living documents that already exist.
2. Write a PRD draft and write your questions into a **new numbered** `docs/versions/<v>/NN-questions.md` (five columns: Question · Why it matters · Options · Recommended default · Your answer) — never a file the user has already answered. Always give a sensible default and the reasonable options — a blank answer means the default is accepted, so the flow is never blocked. End the turn with the three-way handshake.
3. The user resolves it by answering in the questions file, adding a numbered input file to the version folder, or commenting inside `prd.md`. Move answers to `docs/decisions.md`, rewrite the draft, raise anything new. Repeat until nothing is open, then the user approves.

## What the PRD must contain

- What the product does, for whom, and the business rules that govern it.
- **The target form — mobile, desktop, or both.** This is a business question (it depends on the user's customers, not on technology), it is decided here, and `/ux` and `/design` read it. If it is not settled here, the screens get designed for the wrong device.
- A one-line pointer that dependencies are recorded in `dependencies.md`, and one that the things the product remembers are recorded in `data-model.md`.
- **Only what was agreed at `/idea-core`.** The PRD describes the scope that was already decided; it does not grow it. If the user asks for something new here, put it in `docs/living/roadmap.md` and tell them which version it belongs to.

Commit each round. **Next — you decide:** when the loop is clean and approved, say so yourself and point the user to `/data-model`. Never end with a menu.
