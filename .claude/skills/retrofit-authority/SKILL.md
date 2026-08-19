---
name: retrofit-authority
description: TEMPORARY — use when asked to retrofit, backfill, or run the authority/expert pass on existing published posts (posts written before the domain-brief workflow, missing `research/brief.md`). Delete this directory when `worklist.md` is fully done.
---

# retrofit-authority (temporary)

Backfills the Authority lifecycle (`write-post` → Authority) onto already-published posts. Pure orchestration — every rule lives in the permanent skills; this file only sequences them and tracks progress. When the worklist is empty, delete this directory and its row in `.claude/skills/README.md`.

## Worklist

`worklist.md` next to this file: every published post not in the `blog-features` series, grouped by authority repo, with a status column (`pending → briefed → built → validated → shipped`, or `no-change`). Update it and commit as each post advances. If a post's authority mapping looks wrong (one is flagged), confirm with the author before spending an expert call on it.

## Procedure — one repo group at a time

Spawn one expert agent per authority repo and continue that same agent for every post in its group (its repo context is the expensive part; don't rediscover it per post).

Per post:

1. **Plan** — `write-post` step 2, with the published post as the author material. Ask additionally for: corrections to existing claims, and whether any _existing_ visual is wrong or misleading — not only which visuals to add. Save `research/brief.md`.
2. **Build** — apply prose corrections; run the `write-post` step 3 visual pass via `create-visual` (the brief now exists). Leave the hero unless the brief flags it as factually wrong.
3. **Validate** — `review-post` (its Authority review is the validation pass).
4. **Ship** — fix findings, then `publish-post`: keep `publishedAt`, set `updatedAt`, commit message says what changed. If the expert pass produced **no reader-visible change**, commit only `research/brief.md` (plain `chore:` commit, no `updatedAt` bump) and mark the post `no-change`.

## Rules

- One investigation + one validation call per post, on the shared per-repo agent; extra calls only per the `write-post` Authority exceptions.
- Never send the expert presentation concerns (see `write-post` → Authority).
- Don't touch `blog-features` posts: the blog repo is its own authority and the permanent skills already govern it.
