---
name: publish-post
description: Publish a reviewed draft — set draft false and dates, run the full validation/build/e2e, commit, push main (CI deploys to GitHub Pages) and verify the live URL. Use when asked to publish, ship, or release a post.
---

# publish-post

Preconditions: `review-post` came back clean; the post is `draft: true` on `main` (or your working branch).

## Steps

1. Frontmatter:
   - `draft: false`
   - `publishedAt: <today, YYYY-MM-DD>` for a first publication. For a re-publish of an already-live post keep `publishedAt` and set `updatedAt: <today>` (must not precede `publishedAt`).
2. `npm run validate && npm run build && npm run test:e2e` — all must pass. The post now appears in listings, RSS, sitemap, the search index and gets `/og/<slug>.png`.
3. Commit with a conventional message, e.g. `post: publish "<title>"` (include `updatedAt` reason if any). Commit only the post directory plus any registry change it needed.
4. Push `main`. `.github/workflows/deploy.yml` re-runs the checks and deploys `dist/` to GitHub Pages.
5. Verify live: `https://jonborchardt.github.io/blog/<slug>/` renders; the homepage/archive list it; `https://jonborchardt.github.io/blog/rss.xml` includes it; `https://jonborchardt.github.io/blog/<slug>/index.md` serves the raw markdown; `https://jonborchardt.github.io/blog/llms.txt` lists the post; paste the URL into a social preview tool to see the card. If the deploy failed, read the Actions log — it prints the same messages as the local build.

## Never

- Publish with a `REPLACE ME` description, a failing e2e run, or by editing `dist/`.
- Add a "preview draft in production" path — drafts are dev-only by design.
