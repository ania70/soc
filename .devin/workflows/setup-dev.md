---
description: Prepare the user's computer for the build — install and verify exactly what the plan says this product needs
---

# /setup-dev — make this computer ready to build

This is the mechanical half of day two: no product judgement, no decisions, just installing what the plan already decided and proving it works.

## 1. Read what is actually needed

Read the **«چه چیزی باید نصب باشد»** section at the end of `docs/living/architecture.md`, plus `docs/constitution/02-tech-stack.md`. That is the whole requirement list. **Do not install anything that is not on it** and do not "while we are here" your way into a larger setup.

If `architecture.md` does not exist, stop: the plan has not run. Say so and tell the user to run `/plan` first.

## 2. Find out what is already there before installing anything

Most of this should already be installed — it is the baseline, and the user was asked to do it during the week. Check first, in one pass:

```
python --version   (or python3 --version)
node --version
npm --version
git --version
```

Report what you found in one short line each: present and the right major version, present but too old, or missing. Only then install what is genuinely absent.

## 3. Install what is missing

- **Python 3.12** and **Node 22 LTS** are the baseline. On Windows, use the official installers and make sure the "add to PATH" option is ticked — a tool that is installed but not on PATH produces the single most confusing error in this whole workshop.
- Anything else comes from the plan's list.
- **After every install, close and reopen VS Code**, then check the version again. A newly installed tool is invisible to an editor that was already running, and this one step prevents most of the "but I installed it" conversations.
- Do **not** install Docker, a database server, or any virtualisation. The product runs directly on this machine; none of that is needed here.

## 4. Prove it, do not assume it

The phase is not finished because things were installed. It is finished when they answer:

1. Every command in step 2 prints a version, in a **fresh** terminal.
2. `python -m venv` can create a virtual environment in a scratch folder.
3. `npm --version` works from inside the project folder.

If something still fails after a reopen, say exactly what failed and what you tried. Do not improvise a workaround that leaves the machine in a state nobody can reproduce — a clean reinstall with PATH ticked beats a clever fix.

## 5. Record it

Write a short note into `docs/status.md`: what was already present, what you installed, what version. When the build fails at midnight over a missing tool, this is the file that answers why. Commit.

**Next — you decide:** when everything answers, say so and tell the user to start a fresh session and run `/build`.
