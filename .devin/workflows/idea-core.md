---
description: Turn the raw idea into the idea core — decide the scope and every external dependency (with ranked fallbacks), via the file-based questions loop
---

# /idea-core — find the core of the idea

Run the **questions loop** (`docs/constitution/01-workflow.md`) on **files, not chat**. This is the phase where **scope** and **dependencies** are decided — the only phase where they are decided.

The raw input is whatever the user wrote in `docs/versions/0.1/00-idea-input.md`. If that file is still empty, tell them once, in the chosen language, to fill it — «ایده‌ات را در فایل `docs/versions/0.1/00-idea-input.md` بنویس یا متنِ صوت‌به‌متن‌ات را همان‌جا بچسبان، بعد بگو ‹نوشتم›» — then stop and wait. Never ask them to type the idea into the chat.

## The loop

1. Read `00-idea-input.md` and **every** other file already in `docs/versions/0.1/`, plus any comments the user left.
   - **Check `existing_product/` (automatic detection):** If the user placed code in `existing_product/`, inspect its top-level directory structure and **selectively read only key structural files** (data models/schemas, main routes/APIs, dependency files like `requirements.txt`/`package.json`, and any README). **Do NOT read the whole codebase or heavy directories** (`node_modules`, `venv`, logs, assets). Extract existing data entities, business rules, and external integrations, and cross-reference them with `00-idea-input.md`.
2. Write the draft to `docs/versions/0.1/01-idea-core.md` **and** write your questions into a **new numbered** `docs/versions/<v>/NN-questions.md` (five columns: Question · Why it matters · Options · Recommended default · Your answer) — never a file the user has already answered. Questions go **in the file** — never in the chat. End the turn with the three-way handshake.
3. The user answers in the questions file, drops another numbered input file into the version folder, or comments in the draft, then sends a short signal. Move resolved answers to `docs/decisions.md`, rewrite the draft, raise any new questions. Commit each round.
4. **You decide readiness.** Re-read and check: any unanswered question? any new one? any comment you have not addressed? Loop until it is all clear.
5. Only then declare it yourself and name the single next step: «هستهٔ ایده آماده است؛ `/prd` را بزن تا برویم سراغِ سندِ محصول.»

## Benchmark competitors and discover the winning edge

The founder needs to know with certainty that their idea has genuine value and at least one decisive, defendable advantage over existing alternatives.

1. **Identify the benchmarks**: Contrast the idea with 2–3 major alternatives — direct competitors, domestic/local platforms (e.g. Aparat, Bale, Snapp, Divar), or default human habits (Excel, paper forms, Telegram/WhatsApp groups).
2. **Close knowledge gaps via the questions loop**: If you do not know a local/niche competitor (e.g. Aparat vs YouTube) or lack details on their specific features, pricing, or UX friction, **do not guess or hallucinate**. Ask targeted questions in `NN-questions.md` (with your best recommended default) so the founder can clarify the local reality. A blank answer means your default is accepted.
3. **Reassure the founder with a clear advantage**: In `01-idea-core.md`, explicitly articulate the unique value proposition — exactly why a user will choose this product over rivals and how it wins.
4. **Proactive AI ideas go to roadmap**: If you think of high-leverage features or strategic angles to beat competitors, suggest them! Keep only the single most essential differentiator in v1, and write all additional strategic ideas directly into `docs/living/roadmap.md` (the Idea Bank) without blocking the current flow.

## Cut the scope here — in conversation, with the founder

The product has to be built and working by the end of the second workshop day. That is the constraint, and this is the only phase where it is enforced.

- **Ask the founder directly which parts can wait.** Not "shall I cut this?" but "of these, which three are the ones you would demo? What can wait for 0.2?" They own the answer; your job is to make the trade visible.
- **Everything cut goes into `docs/living/roadmap.md` (the Idea Bank)**, with one line each. Nothing good is lost — it is postponed, and the user should see that in writing. Say so; it is what makes cutting easy to agree to.
- Do not enforce a number. Do not lecture about quality or speed. Make the choice concrete and let the founder make it.

## Cut the dependencies harder

**Features are cheap to add later; external dependencies are what sink a build.** For each one, first ask whether the core genuinely needs it, and if it does, offer a no-dependency alternative:

- **Payment gateway → a wallet.** An operator tops the balance up by hand and settles outside the system. No licence, no contract, no waiting.
- **SMS one-time-password login → one of three SMS-free options**, and the user picks (offer, do not push): plain **username and password**; the product published as a **mini-app inside Bale or Eitaa**, where the messenger identifies the user; or a **login bot on Bale** — the product's own bot, created with BotFather inside Bale. The frontend shows a deep link that starts the bot with a one-time id; the user taps **start**; the backend receives `/start <id>`, marks that id verified, and stores the profile — and can ask for the **mobile number** with a share-contact button. The frontend polls until it is verified. One tap, no SMS, no third party, and the same bot doubles as a free notification channel.
- **A foreign service needing an international payment or a slow sign-up → drop it** or swap in something local.

## For every surviving dependency, decide the fallbacks now — this is not optional

A founder who is turned down by a provider two days from now, on their own, has no idea what to do. Deciding the alternatives **here**, while the thinking is happening, is what turns that into a lookup instead of a redesign.

For each real dependency, write into the idea core, and later into `dependencies.md`:

1. **The first choice**, and why.
2. **A ranked list of what to try if it refuses them** — «اگر نشد: ‹سرویسِ دوم›، اگر آن هم نشد: ‹سرویسِ سوم›».
3. **The manual fallback** — the version with no service at all (a form, an upload, a phone call, an operator). There is almost always one.
4. **One line on what the product loses** with each step down the list. That is the part the founder cannot work out alone, and it is the whole reason this is written here rather than improvised later.

Ask, do not assume: sign-up in Iran often needs a company, a licence or an identity check, and the founder knows which of those they have.

## Where the product will live is not decided here

Do not discuss servers, hosting or deployment in this phase, and do not let it become a dependency question. The product runs on the user's own computer until day two, and where it goes afterwards is decided at `/deploy`. If the user asks, say that in one sentence and move on.

## Next

When the loop is clean, say so yourself and point the user to `/prd`. Update `docs/status.md`, commit and push.
