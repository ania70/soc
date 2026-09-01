---
description: Human acceptance — the user walks the scenarios against the live address, in rounds, until they see no problems
---

# /test — acceptance, in rounds

The automated tests already pass and you already walked the scenarios yourself — on this computer at the end of `/build`, and against the live address at the end of `/deploy`. This phase is different: it is the **owner** deciding whether this is the product they meant. Only they can say that.

## 1. Hand them the address and the file

Give the user the live address from `docs/profile.md` and the admin credentials — **the username and the password written out, in the chat** — and tell them to open `docs/living/test-scenarios.md` next to the browser. It is already on their computer; every file is.

## 2. They test; findings go in a file, not the chat

Tell them to record what they find as the **next numbered file** in the current version folder — `docs/versions/<v>/0N-test-round-1.md` — as a table, one row per scenario:

| # | سناریو | چه انتظاری داشتم | چه دیدم | نتیجه |
|---|--------|------------------|---------|-------|
| ۳ | ثبت‌نام با شمارهٔ تازه | برود به داشبورد | صفحهٔ سفید | ✗ |

Create that file for them, pre-filled with the scenario numbers and titles and empty result cells, so they only have to fill in the two columns. A blank table stops a non-technical founder; a half-filled one does not.

## 3. Each round

Read the round file and, for each failing row, decide which of two things is wrong:

- **The scenario is wrong** — the product behaves sensibly and the scenario described something else. Fix `docs/living/test-scenarios.md`.
- **The behavior is wrong** — fix the code.

If you are unsure which, ask: «اگر سناریو دقیقاً همین بود، راضی بودی؟» Then fix everything in the round, run the tests, run `./run.sh` locally, **deploy the fix**, re-check the affected scenarios **against the live address**, and write what you did as the next numbered file. Commit and push. A fix that only exists on the laptop is not a fix — the address is what the user is looking at.

The user then does another round in a new numbered file. Repeat — second, third, fourth — until they see no problems.

## 4. No new requirements here

A new requirement is a new version. Say so plainly and put it in `docs/living/roadmap.md`; it goes to `/iterate`.

## 5. Close the version

When the user is satisfied: make sure `docs/living/test-scenarios.md` reflects the corrected set, write each shipped feature's file into `docs/features/`, note the closure in `docs/decisions.md` and `docs/status.md`, and confirm the app is live at the address in `docs/profile.md`. The version folder is now history — later sessions read only the current one.

**Next — you decide:** point the user to `/iterate` for the next version.
