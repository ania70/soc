---
description: Guide visual screen design (via Claude web, external tools, or in-editor interactive prototyping), record the conversation in design-chat.md, reconcile conflicts with written specs, and close Day One
---

# /design — visual screens, design conversation, and reconciliation

This is the last step of day one and its high point. It turns documents into something tangible that the founder can look at and show to others.

## This step has two required outputs

1. **`UI/`** — the visual screens (HTML/CSS/JS or component prototype).
2. **`docs/versions/<v>/design-chat.md`** — the complete record of the design conversation and decisions.

---

## 1. Prepare the design prompt in `design-chat.md` and STOP

Read `prd.md`, `data-model.md`, and `ux.md` from `docs/living/`.

1. Write the complete, tailored design prompt directly into **`docs/versions/<v>/design-chat.md`** under `## دور ۱ / ### من گفتم:`.
   - Specify target form (mobile / desktop / both) from `prd.md`.
   - List all required screens from `ux.md`.
   - Include aesthetics, color palette, and component requirements from `ux.md`.
   - Include instruction: *"Ask everything in plain text, do not generate uncopyable forms, give at least two distinct options per screen, and export as UI/ folder."*
2. **Commit the prompt:** `git add docs/versions/<v>/design-chat.md && git commit -m "docs: seed design prompt in design-chat.md"`
3. **STOP IMMEDIATELY.** Do NOT generate UI files yet and do NOT mark the phase finished.
4. Present the founder with this exact 3-way status menu in chat:

```
پرامپتِ طراحی را در فایل `docs/versions/0.1/design-chat.md` (زیرِ «دور ۱ / من گفتم») نوشتم.

چطور پیش رفتی؟
۱. طرح را با Claude on the web (بخش Design) انجام دادم و در پوشهٔ UI/ گذاشتم
۲. طرح را با ابزار دیگری (Google Stitch, v0, Lovable, Figma و...) انجام دادم و در پوشهٔ UI/ گذاشتم
۳. به ابزار طراحی خارجی دسترسی ندارم؛ خودت همین‌جا برایم طراحی کن
```

---

## 2. Handling Paths

### If the founder chooses 1 or 2 (External Design Tool)
1. Verify that `UI/` contains the exported screen files.
2. Verify that `design-chat.md` contains the conversation record.
3. Record the design method in `docs/status.md` and `docs/decisions.md`.
4. Proceed immediately to **§4 Auto-Reconcile & Close Day One**.

### If the founder chooses 3 (In-Editor Interactive Prototyping)
1. Build/generate the initial runnable prototype screens inside the `UI/` directory (e.g. `UI/index.html` or dedicated screen files with Tailwind/CSS).
2. Record the assistant's design summary under `### دیزاین گفت:` in `docs/versions/<v>/design-chat.md`.
3. Update `docs/status.md`: set active phase to `/design` and update rounds: `(دورها: ۱)`.
4. **Commit round 1 immediately:** `git add UI/ docs/status.md docs/versions/<v>/design-chat.md && git commit -m "ui: draft initial UI prototype (round 1)"`
5. Instruct the founder:
   > «طرح اولیه را در پوشهٔ `UI/` ساختم. فایل `UI/index.html` را در مرورگر باز کن و بررسی کن.»
6. Present the 2-way review menu:
   ```
   ۱. طرح تأیید است — ادامه بده
   ۲. تغییراتِ مد نظرم را در فایل docs/versions/0.1/design-chat.md نوشتم
   ```

---

## 3. In-Editor Review Loop (Rounds 2 … N)

- **When the founder selects 2 («تغییرات را در design-chat.md نوشتم»):**
  1. Read the founder's feedback under the latest `## دور N / ### من گفتم:` in `docs/versions/<v>/design-chat.md`.
  2. Modify the code in `UI/` to apply the requested visual/layout changes.
  3. Write your response summary under `### دیزاین گفت:`.
  4. Increment the round count in `docs/status.md` (e.g. `دورها: ۲`).
  5. **Commit this round immediately:** `git add UI/ docs/status.md docs/versions/<v>/design-chat.md && git commit -m "ui: apply design revisions (round N)"`
  6. Tell the founder to refresh their browser (`F5` / `Ctrl+R`) and present the 2-way review menu again.

- **When the founder selects 1 («طرح تأیید است — ادامه بده»):**
  1. Record the final design approval in `docs/decisions.md` and `docs/status.md`.
  2. Proceed immediately to **§4 Auto-Reconcile & Close Day One**.

---

## 4. Auto-Reconcile & Close Day One

As soon as the design is approved, do not close the day blindly. **Automatically execute the reconciliation audit** between the final visual design (`UI/` + `design-chat.md`) and the living documents (`prd.md`, `data-model.md`, `ux.md`):

1. **Audit for Inconsistencies:**
   - Check for new screens, form fields, buttons, or flows in `UI/` that are missing or conflicting in `prd.md`, `data-model.md`, or `ux.md`.
   - Check if any feature agreed in PRD was omitted in the design.
2. **Resolve Conflicts via Questions:**
   - If any contradictions or ambiguities exist, write them into a **new numbered questions file** `docs/versions/<v>/NN-questions.md` with five columns, citing both conflicting files and providing clear **recommended defaults**.
   - Present the 3-way handshake (`۱. پیش‌فرض‌ها خوب بود`, `۲. جواب دادم`, `۳. چیز دیگری می‌خواهم بگویم`).
   - Loop until resolved, then update `docs/living/prd.md`, `data-model.md`, `ux.md`, and `docs/decisions.md`.
3. **Finish Day One:**
   - Update `docs/status.md`: mark `- [x] /design`, set Active Phase to `/reconcile` (Day Two).
   - Verify `git status` is clean.
   - Commit and push: `git add . && git commit -m "docs & ui: reconcile living docs with final design and close Day One" && git push`
   - Tell the founder:
     > «روز اول با موفقیت به پایان رسید! طرح‌های بصری در پوشهٔ `UI/` آماده شدند و تمام مستندات زنده با طرح نهایی تطبیق داده شدند. کارها روی گیت‌هاب ذخیره شدند. هر فکرِ تازه‌ای در طول هفته داشتی، در یک فایل شماره‌دار جدید در پوشهٔ نسخه بنویس. هفتهٔ آینده روز دوم را با `/reconcile` آغاز می‌کنیم.»
