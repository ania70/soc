# Workflow — the document-driven pipeline, across two days

Documents first, code last. Each phase has a `/command` in `.claude/commands/` — plain markdown, so an AI without slash-commands can open the file and follow it. The user drives the project by running these in order; every command ends with **you** deciding the next step, and every transition is written into `docs/status.md`.

## Day one — the documents

| # | Phase | Command | Model | Produces |
|---|-------|---------|-------|----------|
| 0 | Start — language, profile, git | `/start` | Opus 5, high | `docs/profile.md`, `docs/status.md` seeded |
| 1 | Idea core + competitor advantage + scope + deps | `/idea-core` | Opus 5, high | `docs/versions/0.1/01-idea-core.md` |
| 2 | PRD | `/prd` | Opus 5, high | `docs/living/prd.md` |
| 3 | Data model — the things the product remembers | `/data-model` | Opus 5, high | `docs/living/data-model.md` |
| 4 | UX — screens, flows, theme | `/ux` | Opus 5, high | `docs/living/ux.md` (may back-edit the PRD and the data model) |
| 5 | Design — the visual screens | `/design` | Claude on the web | `UI/`, `docs/versions/0.1/design-chat.md` |

**Day one ends there.** No dependencies are set up, no environment is prepared, no code is written, nothing is deployed. The user goes home with a published design they can show someone.

## The week in between

Not a phase and not a command. The user may add new thoughts as **new numbered input files** in the current version folder, obtain the credentials their dependencies need, and prepare their machine. All of it is picked up by `/reconcile` on day two.

## Day two — the product

| # | Phase | Command | Model | Produces |
|---|-------|---------|-------|----------|
| 6 | Reconcile — make the documents agree again | `/reconcile` | Opus 5, high | updated living documents, `docs/decisions.md` |
| 7 | Dependencies — make each one usable | `/deps` | Opus 5, high | `docs/living/dependencies.md`, `secrets/secrets.local.md` filled |
| 8 | Test scenarios — the acceptance contract | `/scenarios` | Opus 5, high | `docs/living/test-scenarios.md` |
| 9 | Plan — architecture, checklist, handoff | `/plan` | **Opus 5, high effort** | `architecture.md`, `checklist.md`, `handoff.md` |
| 10 | Prepare the development environment | `/setup-dev` | Copilot (free) | the toolchain the plan needs, installed and verified |
| 11 | Build — the code, then running locally | `/build` | **Sonnet 5, medium effort** | the code, the app running on `http://localhost:<port>` |
| 12 | Deploy — put it on the internet | `/deploy` | Opus 5, high (Copilot for the installing) | a live public address, recorded in `docs/profile.md` |
| 13 | Acceptance testing — the human rounds | `/test` | Opus 5, high | numbered test-round files, fixes |
| 14 | Iterate — 0.2, 0.3, … | `/iterate` | **Opus 5, high effort** (Sonnet optional for the build) | a new version folder, changes applied, app redeployed |

**Every new version starts the same way, without exception: `/clear`, then `/model` Opus, then `/effort` high.** A new version is a thinking step and the previous version's conversation is dead weight. Say those three things in that order before anything else.

## Why the order is what it is

- **The data model comes after the PRD and before the UX.** The PRD says what the product does; the data model says what it has to remember — the things, their fields, and how they relate. Deriving that from the PRD gives you real nouns, and the screens then fall out of those nouns. Doing it after the UX inverts the dependency and produces a transcription of whatever screens happened to get drawn. **But walking the screens is when a missing thing shows up**, so `/ux` is explicitly allowed to amend the data model, exactly as it may amend the PRD.
- **The design is the end of day one, not the middle.** It is the step that turns a set of documents into something the user can look at, and it is the only step whose output they can show to another person. It also runs in a different tool, so it is the natural seam.
- **`/reconcile` opens day two and nothing else may run before it.** A week of thinking leaves contradictions between the PRD, the data model, the UX, the design conversation and whatever the user added in between. Building on top of contradictory documents is the one failure this whole workflow exists to prevent.
- **`/deps` is early on day two because it is slow human work.** Signing up for things is not something you can hurry. Kick it off, then keep going — nothing here gates the build, and the app runs with the credentials missing until they arrive. Much of it should already have happened during the week.
- **Test scenarios come after the design and before the plan.** A test scenario is a use case with concrete data, so it is cheap to write once the screens exist by name, and expensive to write before. And it is the **acceptance contract the build is measured against** — writing it after the plan would describe what got planned instead of specifying what should be built. There is no separate use-cases document; the scenarios are it.
- **`/setup-dev` comes after `/plan`, not before.** You cannot know what to install until you know what you are building with, and that is decided in the plan. The baseline toolchain in `02-tech-stack.md` does not depend on the plan and should already be installed from the week in between; `/setup-dev` verifies it and adds whatever this particular product needs on top.
- **Planning and building are two commands, two models, two sessions.** Everything that needs judgement happens in `/plan` on Opus at high effort, while the whole product conversation is still in context. It ends by writing `handoff.md` and telling the user to `/clear`, switch to Sonnet at medium effort, and run `/build`. The clear is the point: the build gets a full context window, and it gets it because the plan is on disk rather than in the conversation. `/build` executes and does not redesign.
- **Deploy is its own phase, and it is last.** The code is written on the user's own computer, so putting it on the internet is a real step with real prerequisites — a server, an address, credentials. It cannot be folded into the build.

## Gates

Three gates, and **you** decide them, not the user:

- **`/plan` will not start** until the newest `docs/versions/<v>/NN-questions.md` is settled and raised nothing new, the PRD / data model / UX / design are approved, and `docs/living/test-scenarios.md` exists.
- **`/build` will not start** until `docs/versions/<v>/handoff.md`, `docs/versions/<v>/checklist.md` and `docs/living/architecture.md` all exist. If any is missing, the planning step has not run — say so and stop, rather than improvising it on the weaker model.
- **`/deploy` will not start** until the app runs locally and every test scenario passes against `http://localhost:<port>`. Deploying something that does not work locally only moves the bug somewhere harder to see.
- **A version is not finished** until every checklist item is ticked or explicitly BLOCKED, the app is live at the address in `docs/profile.md`, and every test scenario has been walked against that live address.

## Living documents vs versioned documents

- **Living** — `docs/living/`: `prd.md`, `data-model.md`, `ux.md`, `dependencies.md`, `architecture.md`, `test-scenarios.md`, `roadmap.md`. These always describe the **current** state of the product and are edited in place. For 0.2 and later they are edited **only after** the version's change-documents have been approved.
- **Versioned** — `docs/versions/<v>/`: that version's inputs, your drafts, the change-documents, the test-round files, and three files with **fixed names** because other commands look them up by path: `design-chat.md` (the record of the design conversation, written by the user), `checklist.md` (the task list) and `handoff.md` (what `/plan` leaves for `/build`). Everything else is numbered, append-only, never rewritten. See the rounds section of `00-rules.md`.
- **Features** — `docs/features/<slug>.md`: one file per feature, written the moment the feature is decided. What it does, how you know it works, and which version introduced it. The living PRD describes the **product**; the features folder is the **changelog with detail**. They are not the same document and must not drift into one.
- **`docs/living/roadmap.md`** is the **Idea Bank** and the list of things deliberately **postponed** — everything cut at `/idea-core`, AI strategic advantage ideas, or worthy ideas banked via `/add-idea`, so nothing good is lost. It is not a task list. The task list for the version being built is `docs/versions/<v>/checklist.md`.

## The questions loop

Used by `/idea-core`, `/prd`, `/data-model`, `/ux`, `/deps`, `/scenarios`, `/reconcile` and `/iterate`. It runs on **files, not chat**.

1. Read the living documents **and every file in the current version folder**.
2. Write or update the draft, then write your questions to a **new numbered file**, `docs/versions/<v>/NN-questions.md` — five columns: Question · Why it matters · Options · Recommended default · Your answer. Always give a sensible default, so the flow is never blocked.
3. End the turn with the three-way handshake from `00-rules.md`.
4. The user resolves it however they like: answering inside that questions file, adding a new numbered input file, or commenting inside the draft. A blank answer means the default is accepted.
5. Move resolved answers to `docs/decisions.md`, rewrite the draft, and put any new questions in a **new** file with the next number. **Never edit a questions file the user has already answered.**
6. Repeat until a round raises nothing new, then have the user re-read and approve. **You** decide when that point is reached.

## Iteration — the versioned-change cycle (0.2, 0.3, …)

A tiny fix skips the ceremony: make it, commit, restart the app, redeploy. Anything that changes behavior is a **version**, and every version is **one feature or one bug fix — never an architectural change.** That assumption is what lets the cycle be short.

1. **Input.** The user creates the next folder under `docs/versions/` (e.g. `0.2/`) and drops `01-input.md` in it, then runs `/iterate`. Find the latest version folder yourself — never ask which one.
2. **Change-documents, not rewrites.** On `main` — never a branch — write proposals of *what changes* into that folder — `02-prd-changes.md`, `03-data-model-changes.md`, `04-ux-changes.md`, `05-scenario-changes.md`, only the ones the change actually touches. Run the questions loop on them. **The design is not revisited** — the look is already settled and new work inherits it.
3. **Apply to the living documents** only after the user approves the change-documents. Write the feature's file in `docs/features/`.
4. **Plan, then build.** Write this version's `checklist.md` and `handoff.md` on Opus at high effort. Then look at what you just wrote and **offer** the switch rather than instructing it: if the checklist has **eight items or fewer and adds no new external dependency**, say the version is small enough to finish on Opus in this session; otherwise recommend `/clear`, `/model` Sonnet, `/effort` medium, `/build`. Say which case applies and why, in one line.
5. **Deploy again.** A version is not finished until the new code is live at the address in `docs/profile.md`.
6. **Test rounds.** The user tests and drops findings as the next numbered file in the version folder. A wrong scenario gets the scenario fixed; wrong behavior gets the code fixed. Repeat until the user sees no problems.
7. **Close the version.** Promote the corrected test scenarios into the living document, note the closure in `docs/decisions.md` and `docs/status.md`, and the folder is history. The next request starts the next version the same way.
