---
description: Add a spontaneous idea to the Idea Bank (docs/living/roadmap.md) without disrupting the active phase
---

# /add-idea — bank a new idea without disrupting the workflow

This is a **floating utility command**. The founder can run it at any point during Day One or Day Two (e.g. while in `/data-model`, `/ux`, `/plan`, or testing) when a new inspiration strikes.

## 1. Receive and evaluate the idea

1. The user describes their idea in the command argument (e.g. `/add-idea <description>`) or types it when prompted.
2. **Evaluate worthiness directly in one turn:**
   - **User Value / Problem Solved:** Does this genuinely help the user or solve a real friction?
   - **Competitive Edge:** Does it make the product stronger against alternatives?
   - **Dependencies / Complexity:** Does it introduce heavy external friction (payments, legal, external APIs)?
3. Do not force an agreement on a specific version number. If the idea is worthy and sound, state why in 2 sentences.

## 2. Commit to the Idea Bank (`docs/living/roadmap.md`)

If the idea is worthy:
1. Append it as a new row to the table in `docs/living/roadmap.md`:
   - Name / Feature
   - Value & Competitive Edge
   - Dependencies / Complexity
   - Status: `آماده انتخاب` (Ready to pick in 0.2+)
2. Commit the addition:
   `git commit -m "docs: add <idea-slug> to idea bank"`

If the idea is fundamentally flawed or completely contradictory to the product's foundation, explain why politely and let the founder decide whether to park it anyway or drop it.

## 3. Resume the active phase immediately

1. Read `docs/status.md` to identify:
   - What phase is currently active (`/prd`, `/data-model`, `/ux`, `/plan`, etc.).
   - What step or file is in progress.
2. Record this floating event in `docs/status.md` under the Floating Steps log:
   `- [x] /add-idea: ثبت ایدهٔ «[نام ایده]» در بانک ایده‌ها`
3. Tell the founder:
   > «ایده در بانک ایده‌ها (`docs/living/roadmap.md`) ثبت شد و هیچ چیز گم نمی‌شود. حالا برمی‌گردیم به کار اصلی‌مان: [نام گام و فایل در دست اقدام].»
4. Point to the single active next step so the founder continues without friction.
