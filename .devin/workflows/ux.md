---
description: Write the UX document — screens, flows and theme — via the questions loop
---

# /ux — user experience, theme and flows (living)

Produce `docs/living/ux.md` with the same **questions loop** as `/prd`. Screens, flows and theme all live in this one document — not three.

- Read `docs/living/prd.md`, `docs/living/data-model.md`, the idea core, and the current version folder.
- Draft `ux.md` and write your questions into a **new numbered** `docs/versions/<v>/NN-questions.md` (five columns: Question · Why it matters · Options · Recommended default · Your answer) — never a file the user has already answered.
- Ask in everyday language, not design jargon. The user is describing what they like the way they would to a designer.

## What goes in it

1. **Screens** — which screens exist, what each is for, what information appears where, and what the empty and error states look like. **Name every screen**; the test scenarios and the design both refer to these names. Most screens are a list, a detail or a form over one of the things in `data-model.md` — start there and you will not invent nouns that do not exist.
2. **Flows** — for each of the user's main goals, a step-by-step path from the start to success, with the important edge cases.
3. **Theme** — the overall feel in a few personality words (calm, trustworthy, plain), the main and secondary colours, how rounded things are, and how dense the screen should be.

## UX may change the PRD — and the data model

Neither of them is frozen. Thinking about screens often reveals something missing or contradictory upstream, and it is the normal way this works rather than a sign that something went wrong.

- **The PRD.** When a UX decision changes what the product does, say so and update `prd.md` too, after telling the user.
- **The data model.** Walking the screens is when a missing thing shows up — a field the form needs that nobody wrote down, or a relation that turns out to be many-to-many. When that happens, say so and update `docs/living/data-model.md`, after telling the user. This is expected; `/data-model` said so itself.

If either change raises a new business question, run it through the same loop.

Commit each round. **Next — you decide:** when nothing is open and the user has approved, say so yourself and point them to `/design`.
