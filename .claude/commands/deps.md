---
description: Make every decided dependency usable — the setup checklist, the credentials from the secrets file, and the fallback when a provider says no
---

# /deps — close every dependency

Dependencies were **decided** at `/idea-core`, each with a ranked list of fallbacks. This phase does not re-decide anything; it makes the chosen one usable, and swaps to the next one if it turns out not to be. It is slow human work — sign-ups, bots, keys — so **kick it off and keep going**. Nothing here blocks the build; the product runs with the credentials still missing and picks them up when they arrive.

Some of this has probably already happened during the week between the two days. Start by asking what they managed to get, and skip whatever is already done.

There are no server questions in this phase. Where the product will live is decided at `/deploy`.

## Part 1 — `docs/living/dependencies.md`, the one record

Maintain it with two halves:

- **(A) Integration notes — yours.** For each external, how the app talks to it. If you do not know a service's API, tell the user to fetch that service's documentation into `docs/external-docs/` and then read it. Do not guess an API shape.
- **(B) Setup checklist — the user's.** For each external: what it is for, where to sign up or what to create, exactly which value to obtain, and which name it maps to. Written in the chosen language, step by step. **Carry the ranked fallbacks from the idea core into this half** — they are only useful where the user will look when something fails.

Add the `.env` names to `.env.example` (names only, no values), and add them to `secrets/secrets.local.md.example` so a later session knows what this product needs.

## Part 2 — the credentials come from a file, not from the chat

1. Tell the user which lines to fill in, in **`secrets/secrets.local.md`** — the file is already in their project, already git-ignored, and opens in the same editor as everything else. Name the exact variable and where to obtain the value.
2. They write the values in and save. **Never ask them to paste a credential into the chat.**
3. You read the file and derive `.env` from it. Only names appear in code.
4. **Test that each one actually works** — call the service's health or echo endpoint. "You have a token" is not the same as "your bot works." Only when they pass is `/deps` done, and **you** decide that.

Say once, plainly, the first time a credential comes up: this file stays on their own computer and never goes to GitHub, so **real values are fine** — and that is exactly why it must never be committed.

## Part 3 — when a provider says no

This will happen to somebody, and it is the moment a founder working alone gets stuck. Handle it as a decision, not as an error.

1. **Ask what happened**, in one question: rejected outright, needs a registered company, needs a licence, needs an identity check they cannot pass, or just too slow to arrive today. The answer changes the advice.
2. **Read the ranked fallbacks** for that dependency in `dependencies.md` and propose the next one — by name, not as a category.
3. **Say in one line what the product loses** by taking it. This is the important step and the one you must not skip: a founder swapping payment providers, or dropping from a real gateway to a wallet, has no idea what they just gave up. Spell it out, then let them choose.
4. **If the list is exhausted**, offer the manual version — an operator, a form, an upload, a phone number — and put the automated version into `docs/living/roadmap.md` for 0.2. A manual fallback that works today beats an integration that arrives next month.
5. **Record it properly.** Update `dependencies.md`, note the swap and the reason in `docs/decisions.md`, and say plainly which other documents this touches — usually the PRD, sometimes the UX, occasionally nothing at all. Then update them.

Never let a refused provider become a reason to stop. There is always a next line, and the last line is always "a human does it by hand for now".

## Messengers differ — Bale and Eitaa are not the same

- **Bale uses BotFather**, like Telegram: the user opens BotFather inside Bale, creates a bot, and gets a **token**. If the product is a mini-app, the product's public address is set as the mini-app **after** `/deploy`, once that address exists.
- **Eitaa does not have BotFather.** The user registers and verifies on **`eitaayar.ir`** and creates an **app** there. It is mini-app only — no chat bot. Capture its key.
- **The login bot on Bale**, if it was chosen at `/idea-core`, is just a Bale bot: the user creates it with BotFather and writes `BALE_BOT_TOKEN` into the secrets file. You implement the whole mechanism in the product — deep link, `/start <id>`, verification, optional share-contact for the mobile number, frontend polling.

## A domestic Iranian service

Test it as soon as its credentials arrive — do not wait for the build. Right now the product runs on the user's own computer inside Iran, so a domestic service will almost certainly answer. **Say plainly that this is not the final answer**: if the product is later deployed to a server outside Iran, the same call may stop working. Record that in `dependencies.md` as something `/deploy` must check, and it will be one of the inputs to choosing where the server goes.

**Next — you decide:** once the browser work is under way, point the user to `/scenarios` — it runs while the credentials come in. Update `docs/status.md`, commit and push.
