---
description: Begin a project — ask the working language, fill in the profile, make sure git and the repository are ready
---

# /start — begin

Read `docs/constitution/00-rules.md` first. This command runs once, at the very beginning of day one.

## 1. Ask the language — before anything else, and only once

There are **two** languages here, and they do not have to match: the language of the **conversation** and the language of the **documents**. Offer exactly these three, numbered, in one short bilingual message:

1. گفت‌وگو فارسی · مستندات فارسی
2. Conversation English · documents English
3. **Conversation English · documents فارسی — «پیشنهادِ ما»**

Say in one line why 3 is recommended: Persian breaks up in a terminal, but reads perfectly in the editor where the documents are actually read — so this combination is the most comfortable of the three.

Whatever they pick applies from then on **regardless of which language they type in** — never mirror their input language. Confirm the choice, say that either half can be changed later, and record **both** values in `docs/profile.md` and `docs/decisions.md`.

## 2. Fill in the profile

`docs/profile.md` needs the project name, the repository address, and the local port.

- The **project name** comes from the folder the user renamed CODO to, and it should match the repository name.
- The **local port** is `8000` unless something else on this machine is already using it. Check; if it is taken, take the next free one and write it in both `docs/profile.md` and `.env`.
- The **public address** stays empty. It is filled in at `/deploy`, on day two.

**There is no seat number, no assigned port and no pre-configured address in this project.** If the user asks about one, say plainly that the product runs on their own computer until the second day.

## 3. Make sure git is really working

The user already published this folder to a **private** repository on their **own** GitHub account, from VS Code, before running you. Your job is to verify that, not to redo it.

- Confirm this is a git repository with a remote (`git remote -v`) and that the working tree is clean or committable.
- Confirm the remote is **private**. If you cannot tell, ask the user to check it once in the browser and say so — a public repository means their idea is on the open internet, which is the one thing this setup exists to prevent.
- Confirm `git config user.name` and `user.email` are set. If they are not, the first commit will fail with a confusing message. Their real GitHub username and the email they signed up with are the right values — this repository is theirs.
- Make one real commit and push, so the whole path is proven before anything important depends on it.
- If any of this fails, say exactly what the user should click in the Source Control panel, and wait. Do not work around it.

## 4. Explain the road ahead — one short paragraph

Documents first, then the code. Today (day one) we agree on what the product is, what it remembers, what it looks like — and the day ends with a design they can show someone. Next session we build it and put it on the internet. The user's job is to answer business questions and approve documents.

## 5. Seed `docs/status.md`

Initialize `docs/status.md` with the project profile, mark `/start` as completed in the master checklist (`- [x] /start`), set the active phase to `/idea-core`, and log the start event. Keep this file current after every meaningful step and round — it is the master hand-off file that allows any assistant to continue seamlessly.

## Next

Point the user to `/idea-core`. Tell them they will write their idea into the file `docs/versions/0.1/00-idea-input.md` — not into the chat. Mention that if they already have existing code or a prototype, they can drop their source code into the `existing_product/` folder. Commit and push.
