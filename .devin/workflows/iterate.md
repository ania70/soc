---
description: Start the next version — change-documents, approval, build, deploy again, then test rounds until the version closes
---

# /iterate — the versioned-change cycle

**A tiny fix** (a word, a colour, a wrong link) skips all of this: make it, commit, `./run.sh`, done.

**Everything else is a version**, and every version is **one feature or one bug fix — never an architectural change.** That rule is what keeps this cycle short enough to run in an afternoon. If a request would change the architecture, say so and split it.

## 0. Before anything else — start a fresh session

**Every version starts in a fresh session.** If the user ran `/iterate` without doing that, say exactly this and wait:

> یک نشستِ تازه شروع کن، بعد دوباره `/iterate` بزن.

A new version is a thinking step, and the previous version's conversation is dead weight in the window.

## 1. Find the input

The user creates the next folder under `docs/versions/` (e.g. `0.2/`) with `01-input.md` in it. **Find the latest version folder yourself — never ask which one.**

- **Idea Bank lookup:** If the version folder or `01-input.md` does not exist yet, read `docs/living/roadmap.md` (the Idea Bank) and present the ready banked ideas to the founder. Ask which one they want to build for this version, or if they have a fresh thought.
- Once chosen, tell them to create `docs/versions/<v>/01-input.md` with that choice (or create it for them if you have tools), then read everything in it plus all the living documents.

## 2. Propose changes, do not rewrite

**Everything stays on `main` — never create a branch.** Write **change-documents** into that folder — `02-prd-changes.md`, `03-data-model-changes.md`, `04-ux-changes.md`, `05-scenario-changes.md` — only for what the request actually touches. Each says *what changes and why*, not the whole document again.

**Do not revisit the design.** The look is settled and new work inherits it. Only run `/design` again if the user explicitly wants a new look.

Run the questions loop on these change-documents until nothing is ambiguous and the user has approved **them** — not the living documents.

## 3. Apply

Only after that approval: edit `docs/living/prd.md`, `data-model.md`, `ux.md`, `test-scenarios.md` to match, and write the feature's own file into `docs/features/<slug>.md` — what it does, how you know it works, which version introduced it. The change-documents stay in the version folder as the record.

## 4. Plan, then build

Say the documents are consistent and you are ready. On the user's go-ahead, write this version's `checklist.md` and `handoff.md` — the same two files `/plan` writes for 0.1, in the same place.

Then look at the checklist you just wrote and **offer** the session split instead of instructing it — by 0.2 the hard thinking is behind you and most versions are small:

- **Eight items or fewer, and no new external dependency** → say the version is small enough to finish in this session, and carry straight on.
- **Bigger than that** → tell the user to start a fresh session and run `/build`, which picks up your `handoff.md` and executes it.

Say which case applies and why, in one line. If the user would rather do the opposite, do the opposite — it is their call, not a rule.

Either way: implement the checklist item by item with a commit per item, then run the whole test suite, fix, re-run until green.

## 5. Bring it back up — this is part of finishing, not a separate step

Run `./run.sh` and walk the new scenarios locally first. Then **deploy** — the same route the project already used, recorded in `docs/profile.md`, with the same files at the root of the project. It is the same commands as last time; that is why they were written down.

Then walk the **new** scenarios plus the existing ones against the **live address**. Fix, redeploy, re-check until they all pass. Then print the address and any credentials again, **as literal values in the chat** — never as a pointer to a git-ignored file.

**A version is not finished while the change only exists on the laptop.** The address is what the user, and anyone they sent the link to, is actually looking at.

## 6. Test rounds

The user tests and drops findings as the next numbered file in the same version folder, in the table form `/test` describes. A wrong scenario gets the scenario fixed; wrong behavior gets the code fixed; the living scenarios stay in step. Repeat the rounds until the user sees no problems.

## 7. Close the version

Promote the corrected scenarios into the living document, note the closure in `docs/decisions.md` and `docs/status.md`, confirm the app is live at the address in `docs/profile.md`, and the folder becomes history. The next request starts the next version the same way.

**Next — you decide:** read the state of the loop and tell the user the single next thing. Never ask them to choose between approaches — the only two things you put to them are the round handshake and, at §4, the session offer.
