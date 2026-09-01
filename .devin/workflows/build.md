---
description: Build the product from the plan — code it item by item, then bring it up on this computer and check every scenario against it
---

# /build — turn the plan into a working product

`/plan` already made every decision that needed judgement. Your job is to **execute it**, not to redesign it. You may be running in a fresh session with none of that conversation — that is deliberate, and it is why the handoff exists.

There are **no sub-agents**; that ceremony burned a previous workshop's day.

## Step 0 — read the plan, and check it is really there

Read, in this order:

1. `docs/versions/<v>/handoff.md` — the fixed place `/plan` leaves your instructions. Find the latest version folder yourself.
2. `docs/versions/<v>/checklist.md`
3. `docs/living/architecture.md`
4. `docs/profile.md` — the local port
5. `docs/living/test-scenarios.md` — what you will be judged against
6. `docs/constitution/00-rules.md` and `02-tech-stack.md`

**If `handoff.md`, `checklist.md` or `architecture.md` is missing, stop.** Do not improvise them and do not start coding. Say plainly that the planning step has not run and that the user should run `/plan`.

## While you build

- **Do not re-decide the architecture.** If the plan is wrong or silent about something, you have two moves: make the smallest reasonable choice consistent with what is written, or — if it is a **business** question — write it into a new `docs/versions/<v>/NN-questions.md` with a recommended default and carry on with the items that do not depend on it. Never redesign, never quietly substitute a different approach.
- Implement the checklist **one item at a time**, in order: code it, write its tests as you go, tick the box, **commit that one item**, update `docs/status.md` (item N of M), move on.
- **Do not run the whole test suite after every item** — that wastes the day.
- If an item keeps failing, mark it **BLOCKED** in the checklist with one line saying why, and continue with the items that do not depend on it. If everything left depends on it, stop and say so.
- **This is the user's own computer.** Everything you create lives inside the project folder. Do not write outside it, do not change global settings, and do not install anything system-wide — the toolchain was prepared at `/setup-dev` and if something is genuinely missing, say so rather than installing it yourself.

## Finish — green, then running

1. **Run the whole test suite.** Fix what fails, run it again, until everything passes.
2. **Bring the app up: `./run.sh`.** It builds the frontend, applies the migrations and starts the app on the port in `.env`. On Windows that is `bash run.sh` in Git Bash. Do not start it any other way and do not choose a different port.
3. **Open `http://localhost:<port>`** and walk **every scenario in `docs/living/test-scenarios.md`** against it. Fix, restart, re-check, until every one passes.
4. Create the initial admin user if the product has one.

**Do not deploy anything.** Putting this on the internet is `/deploy`, it is a separate phase with its own prerequisites, and it happens after the user has seen the product working here.

## Running it

Run **unattended** — never interrupt for a technical question, only for genuine business doubt. Tell the user up front that they can walk away, that a session may pause a long run, and that they resume by saying «ادامه بده» — `docs/status.md` and the per-item commits are what make that resume seamless, so keep both current. Commit and push as you go; never leave work uncommitted.

## What you hand back

**Print the actual values in the chat.** The local address, the admin address if there is one, the admin username, the admin **password in full**, and anything else needed to use the system — plus the checklist with every box ticked or explicitly marked BLOCKED with a reason.

Write them into `secrets/secrets.local.md` as well, as the record. But the **chat is the delivery** — pointing at a file instead of saying the value is how a password gets lost.

If they ask again later, read the file and print the value again. Never claim a scenario passes without having run it.

**Next — you decide:** when every scenario passes on this computer, say so yourself and point the user to `/deploy` — that is what puts it on the internet.
