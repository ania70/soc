---
description: Write the test scenarios — the acceptance contract the build is measured against
---

# /scenarios — what "working" means, written down before the build

This is the last document before the code. It is the **contract**: the build is finished when every scenario here passes — first against the app running on the user's own computer, and after `/deploy`, against the real public address. Nothing else defines done.

Read `docs/living/prd.md`, `docs/living/data-model.md`, `docs/living/ux.md`, the screens in `UI/`, and the current version folder. Then produce `docs/living/test-scenarios.md`, and keep a copy of this version's set as the next numbered file in `docs/versions/<v>/`.

## What a scenario looks like

A scenario is a use case with **concrete data**. Not «the user can register» but «register with 09121234567 and the password `test1234`, then log in with the same number». Concrete data is what makes it checkable by a person and runnable by you.

Every scenario has: a number, the screen it starts on (by the name used in the UX document), the exact steps, and **what should be seen** at the end.

Order them by importance:

1. **End-user flows** — the things the real customer does. These are the ones that matter.
2. **The admin side** — what the owner or an operator does behind the scenes.
3. **Combined** — where the two meet: the customer places an order, the admin approves it, the customer sees the result.

Keep them in the chosen language, short, and free of technical words. The user has to be able to walk them holding nothing but this file.

## The loop

Run the **questions loop** on this document like any other. Writing scenarios is the moment holes in the PRD and UX become obvious — a flow with no defined ending, a screen nobody reaches, an error case nobody decided. Raise each as a question with a recommended default, fix the living documents when it is answered, and note it in `docs/decisions.md`. Finding these now is exactly what this phase is for.

## Then the gate

When the scenarios are approved, check the whole gate yourself: the newest `NN-questions.md` settled and raising nothing new, PRD / data model / UX / design approved, scenarios written. If all of it holds, say so and point the user to `/plan`. Update `docs/status.md`, commit and push.
