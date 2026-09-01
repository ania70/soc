---
description: Find every contradiction between written specs (PRD, data model, UX) and the visual design (UI/, design-chat.md, or mid-week notes), resolve them via open questions, and align all living documents
---

# /reconcile — make the documents agree again

The goal of `/reconcile` is to find all contradictions, inconsistencies, and scope changes between the living documents (`prd.md`, `data-model.md`, `ux.md`) and the visual design (`UI/` + `design-chat.md` + any mid-week `NN-input.md` notes), and resolve them with the founder through open questions with recommended defaults.

This command runs in two scenarios:
1. **Automatically at the end of `/design` (Day One):** As soon as the founder approves the design, the assistant immediately runs this reconciliation audit so that Day One closes with 100% doc harmony.
2. **Explicitly at the start of Day Two (Day Two Kick-off):** When the founder returns after a week (in a fresh session), they run `/reconcile` to process any new thoughts, homework notes, or changes before starting the build.

**Model: Opus 5, effort high.** If the user has not just started a fresh session, tell them: `/clear`, then `/model` Opus, then `/effort` high, then `/reconcile`.

---

## 1. Read everything, including what they wrote while you were away

Read, in this order:

1. **Every file in the current version folder** — including every numbered file added since day one. Those are the user's thoughts from the week and they are the reason this command exists.
2. **`docs/versions/<v>/design-chat.md`** — the record of the design conversation. This is the richest source of contradictions in the whole project, because it is where the founder first saw the product and reacted to it. Read it closely; a decision reversed in that chat is still sitting unrecorded in the PRD.
3. **`UI/`** — the screens as they actually came out.
4. **All the living documents** — `prd.md`, `data-model.md`, `ux.md`, `roadmap.md`.
5. **`docs/decisions.md`** and `docs/status.md`.

---

## 2. Find the contradictions — be specific or do not raise it

A contradiction is two statements that cannot both be true of the same product. Look hardest where they hide:

- **Design against PRD** — a screen that assumes a feature the PRD does not have, or drops one it does.
- **Design against the data model** — a form with a field nothing remembers, or a screen that shows something the model has no way to produce.
- **The week's notes against everything** — the most common shape, and the one the user is least aware of.
- **Scope creep** — something added during the week that is a whole new feature wearing the clothes of a small change.
- **A hole, not a clash** — a flow that now has no ending, a state nobody decided. Raise these too; they are the same problem seen from the other side.

Write them into a **new numbered questions file**, `docs/versions/<v>/NN-questions.md`, in the usual five columns (Question · Why it matters · Options · Recommended default · Your answer). Each row must name **both sides by file** — «در `prd.md` گفته‌ای خرید بدونِ ثبت‌نام ممکن است؛ در `design-chat.md` گفتی صفحهٔ ورود اجباری باشد» — and carry a **recommended default**, with one line on what the product loses either way. A contradiction raised without a recommendation just moves the problem onto the user.

Never ask in the chat. Never edit a questions file the user has already answered. End the turn with the 3-way handshake.

---

## 3. When something is new rather than contradictory — offer the postponement

Much of what arrives from the week is not a contradiction at all: it is a new idea. Do not treat it as a defect and do not silently absorb it into 0.1.

Do here exactly what `/idea-core` does with scope: **make the trade visible and let the founder choose.** For each new thing, say in one line what it would cost today and offer «الان، یا در نسخهٔ ۰.۲؟». Anything they postpone goes into `docs/living/roadmap.md` with a line, so it is visibly kept rather than lost. Anything they keep is a real change and goes through the loop like the rest.

Do not put a limit on how much they may change. Some founders spend the week rewriting their product and that is allowed. Your job is to make each change explicit, priced and recorded — not to ration them.

---

## 4. Loop until it is clean

Run the questions loop until a round raises nothing new. Then, and only then, **apply everything to the living documents**: `prd.md`, `data-model.md`, `ux.md`. Move every resolved answer into `docs/decisions.md`. Commit each round.

If a resolved contradiction means the screens are now wrong, say so plainly and offer one of two things: keep the current screens and note the difference for the build to handle, or go back for another design round on just the affected screens.

---

## 5. Finish

1. Update `docs/status.md`: mark `- [x] /reconcile`, record rounds count, and set Active Phase to `/deps`.
2. Commit and verify clean working tree: `git add . && git commit -m "docs: reconcile living documents and set phase to deps" && git push`.
3. Say in two or three lines what actually changed, so the user starts the day knowing where they stand.
4. Point the user to the single next step: **`/deps`**.
