# Architecture

> Living document. Written at `/plan`, before any application code, on the strongest model. The user does not read it; it is the **reference** you re-read and update on every fix, feature and new version. Follows `docs/constitution/02-tech-stack.md`. This version's task list lives separately in `docs/versions/<v>/checklist.md`.

## Overview

## Frontend (React + Vite — built to static files and served by the backend; one process, one port)

## Backend / API (FastAPI)

## Data model (SQLAlchemy + Alembic over one SQLite file, migrations from the first commit)
<!-- Mirror docs/living/data-model.md: every entity, its fields, and its relations —
     the business document is the source, this is its technical shape.
     Every schema change is a migration, no exceptions. That is what makes the post-MVP
     note below true: moving to PostgreSQL later is one DATABASE_URL and the same migrations.
     Never use a feature of one engine that breaks the other. -->

## Background work (no cache, no queue)
<!-- Caching: a database table, or a value held in memory for something tiny and hot.
     Scheduled/background work: an asyncio task polling a `jobs` table with a `run_at` column.
     Post-MVP note — record, do not build: when the product has real users, PostgreSQL and a
     real queue behind these same interfaces is the right move. Not now. -->

## File storage (a folder on disk behind one small interface)

## Dependencies / integrations
<!-- Mirror docs/living/dependencies.md: which service, how we call it, which env-var NAMES
     hold its config, the no-dependency alternative chosen at /idea-core, and the ranked
     fallbacks if the chosen provider turns the user down. -->

## How it runs locally
<!-- `./run.sh` on APP_PORT from .env, reachable at http://localhost:<port>.
     No containers on the user's computer. Nothing else starts or restarts the app. -->

## How it is deployed
<!-- Filled in at /deploy. Default path: one image plus Caddy in front, on a VPS the user owns,
     with data/ and uploads/ mounted from the host. Custom path: whatever docs/deploy.md says. -->
