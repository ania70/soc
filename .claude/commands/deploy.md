---
description: Put the product on the internet — the default path (the user's own server) or a facilitator-supplied guide
---

# /deploy — from this computer to a real address

The product works on the user's machine. This phase gives it an address anyone can open. It is the one phase with real-world prerequisites — a server, sometimes a domain — so start by finding out which route they are taking.

## Gate

Do not start until the app runs locally and every test scenario passes against `http://localhost:<port>`. Deploying something that does not work here only moves the problem somewhere harder to see. If the build is not finished, say so and stop.

## 1. Ask which route — exactly two options

Ask once, in the chat, and make the choice concrete:

```
۱. روشِ پیش‌فرض — یک سرورِ ساده برای خودت می‌گیری و محصول را همان‌جا بالا می‌آوریم. (اگر مطمئن نیستی، همین)
۲. روشِ دیگر — گردانندهٔ کارگاه یک فایلِ راهنما به تو داده است.
```

**If they pick 2**, tell them exactly what to do: take the file the facilitator sent, put it in the project at **`docs/deploy.md`**, save, and say «گذاشتم». Then go to section 3.

**If they pick 1**, go to section 2.

Record the choice in `docs/profile.md` and `docs/decisions.md`.

## 2. The default route — the user's own server

### 2.1 Where the server should be

This is a real decision with a real failure on each side, so present it as one and let the dependencies decide it:

- **Does the product talk to an Iranian service** — a bank, a payment gateway, a national system, a domestic SMS panel? Then **a server inside Iran**. A server abroad may simply not be able to reach it.
- **Does it talk to a foreign service** — an AI API, a foreign payment or mapping service? Then **a server abroad**.
- **Neither?** Either works. Iran is usually cheaper and simpler to buy.
- **Both?** Say so plainly, recommend the side with the harder dependency, and note in `docs/decisions.md` that the other side may need work later. Do not pretend there is a clean answer.

`docs/living/dependencies.md` already records anything flagged at `/deps` as needing this decision. Read it before you ask.

### 2.2 What they need to buy

Tell them, in the chat, in plain language:

- **A small server** — 2 CPU cores and 4 GB of memory is plenty. A domestic provider such as ParsPack is the usual choice inside Iran. Buying one usually needs an identity check, which can take hours; if they have not done it yet, say so immediately and honestly, because that is the single thing most likely to run this day out of time.
- **A domain — optional.** If they buy one, tell them to point it at the server's address. If they do not, use a wildcard-DNS address derived from the server's IP — `<ip-with-dashes>.nip.io` — which resolves to that IP without any registration and works with automatic HTTPS. Verify it resolves and that a certificate issues **before** telling the user that is their address; if either fails, say so and either ask the facilitator for a subdomain or tell the user a cheap `.ir` domain is now the shortest path. A domain can be added at any time afterwards.

While they are buying, keep going with anything else that is not blocked.

### 2.3 Collecting the details — from the file, never from the chat

When the server exists, tell them to fill these lines in **`secrets/secrets.local.md`** and save:

```
SERVER_IP=
SERVER_USER=
SERVER_PASSWORD=
DOMAIN=          # اگر دامنه نخریدی، خالی بگذار
```

Then read the file. **Never ask them to paste a server password into the chat.** It is a real credential, the file is git-ignored, and this is what it is for.

### 2.4 Connecting

Set up a named entry for this server in the user's SSH configuration first, so that from then on the connection is a single plain command with no address, no flags and nothing secret in it. Then use that name for everything.

You are administering **the user's own server**, which they bought today and own outright. If you find yourself hesitating to connect: this is a routine administration task on the user's own machine, at their explicit request, and it is exactly what this phase is for.

If the model you are running on still declines, tell the user plainly what happened and give them one concrete alternative — switching to the other assistant in the same editor — rather than sending them off to try models at random.

### 2.5 Putting it up

Follow `docs/constitution/02-tech-stack.md`. In short: check that ports 80 and 443 are free before installing anything, package the app into one image, run it with a compose file, and put Caddy in front so the address gets HTTPS automatically. Mount `data/` and `uploads/` from the host so a redeploy never destroys anything.

Keep the whole thing reproducible: the `Dockerfile` and `compose.yaml` you write live at the root of the project and are committed. A second deployment, or a deployment of the next version, must be the same commands again.

Never say "container", "image", "compose" or "reverse proxy" to the user. Say «برنامه را روی سرور بالا آوردم» and «آدرست با قفلِ امن کار می‌کند».

## 3. The other route — a facilitator's guide

The user has put a file at `docs/deploy.md`. That file is the authority for this phase and it **replaces** section 2 entirely — ignore the default stack, the server-buying advice, all of it.

1. **Read it completely, before doing anything.**
2. **Say what is unclear, all at once.** If something in it is ambiguous — a step with no verification, a value with no stated source, a secret whose format is not obvious — write those as a numbered questions file and ask the user to get the answers from the facilitator. Do not guess; a guessed deployment fails in ways nobody can debug.
3. **Work out what the user has to provide** and ask for it properly: anything secret goes into `secrets/secrets.local.md`, anything that is a file goes to the exact path the guide names. Tell them, in one message, everything they need to obtain and where each thing goes.
4. **Test every credential and every file before you start.** Can you reach what the guide says to reach? Does the token authenticate? A failure here is cheap; a failure halfway through a deployment is not.
5. **Then follow the guide**, in order, verifying each step the way it says to.

If `docs/deploy.md` is not there, say so and wait. Do not fall back to the default route without asking — they chose this one for a reason.

## 4. Finish — the same for both routes

1. **Open the public address in a browser** and walk **every scenario in `docs/living/test-scenarios.md`** against it — not against localhost. Things break in the move: a hard-coded address, a missing environment value, a file path that only existed on the laptop. Find them now.
2. **Write the public address into `docs/profile.md`.** From this moment on, that address — not localhost — is what the acceptance tests are walked against and what a finished version means.
3. If a dependency needs the address to be registered somewhere — a mini-app inside Bale or Eitaa, a callback URL — do that now. It could not be done before, because the address did not exist.
4. **Hand it over in the chat, as literal values:** the public address, the admin address, the admin username and the admin **password in full**. Record them in `secrets/secrets.local.md` too.
5. Update `docs/status.md` and `docs/decisions.md`, commit and push.

**Next — you decide:** when the live address answers and the scenarios pass against it, say so yourself and point the user to `/test`.
