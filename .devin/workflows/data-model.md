---
description: Write the data model — the things the product remembers and how they relate — via the file-based questions loop
---

# /data-model — what the product has to remember (living)

Produce `docs/living/data-model.md` with the **questions loop** (`docs/constitution/01-workflow.md`). This runs **after `/prd` and before `/ux`**, and it is the most technical hour of day one — so the way you write it matters as much as what you write.

## The one rule about language

This is a **business** document about the things that exist in the user's world. It is not a database schema and it must not read like one.

- Say «چیز» / «thing», «فیلد» / «field», «یکتا» / «unique», «یک به چند» / «one-to-many». Never say table, column, primary key, foreign key, index, schema or ERD, and **never write SQL**.
- The technical shape of all this is written later, at `/plan`, into `architecture.md`. That is where the database words belong. Here you are describing the business.
- Ask about the world, not the storage: not «چه فیلدهایی برای جدولِ کاربر لازم است؟» but «وقتی یک مشتریِ تازه ثبت‌نام می‌کند، چه چیزهایی از او می‌دانی؟»

## Warm up first, with something that is not their product

Before touching their own idea, spend one short exchange on a familiar example so the shape of the thing is obvious — a small shop: مشتری، محصول، سفارش. One customer has many orders; one order contains many products; a product appears in many orders. Three sentences, then move on. Do not turn it into a lesson.

## What goes in it

1. **The list of things** — every noun the product has to remember, one line each.
2. **Each thing, on its own** — one sentence of what it is, then a small table: field · what it means in plain words · required? · unique?
3. **How they relate** — as **sentences**, not a diagram: «هر کاربر می‌تواند چند سفارش داشته باشد؛ هر سفارش فقط مالِ یک کاربر است.» Name the kind in brackets after it (یک به چند / چند به چند / یک به یک) so the shape is visible without being jargon.
4. **Rules that are really about data** — things that must always be true: a balance never goes negative, a confirmed order cannot be edited.
5. **What we deliberately do not keep** — short, and worth writing: it is a real decision and it is the one people regret not recording.

## The loop

1. Read `docs/living/prd.md`, the idea core, and **every** file in the current version folder.
2. Derive the things from the PRD's features — every feature implies something the product must remember. Where the PRD is vague, that is a question, not a guess.
3. Write the draft and write your questions into a **new numbered** `docs/versions/<v>/NN-questions.md` (five columns) — never a file the user has already answered. End the turn with the three-way handshake.
4. Repeat until a round raises nothing new, then have the user approve. **You** decide when that point is reached.

The questions that pay for themselves here are the boring ones: **which field identifies a person uniquely** (a phone number? an email? both?), **what happens to a thing when the thing it belongs to disappears**, and **whether a relation is really one-to-many or actually many-to-many**. Ask those three every time.

## This document is not frozen

`/ux` may amend it. Walking the screens is when a missing thing shows up, and it always shows up. Say that here, in one line, so the user does not feel they got it wrong later.

## Next

Commit each round. **Next — you decide:** when the loop is clean and approved, say so yourself and point the user to `/ux`. Never end with a menu.
