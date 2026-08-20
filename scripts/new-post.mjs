#!/usr/bin/env node
/**
 * Scaffold a post: npm run new-post -- <slug> [--title "…"] [--series <id>] [--tags a,b] [--draft]
 * Creates src/content/posts/<slug>/index.mdx with valid frontmatter (draft: true always —
 * publishing is a deliberate step, see .claude/skills/publish-post). Node only, no deps.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { nextSeriesOrder, readFrontmatter } from "./lib/next-series-order.mjs";
import { series } from "../src/config/series.ts";
import { tags } from "../src/config/tags.ts";
import { RESERVED_SLUGS_LIST, SLUG_PATTERN } from "../src/lib/reserved-slugs.ts";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    title: { type: "string" },
    series: { type: "string" },
    tags: { type: "string" },
    draft: { type: "boolean", default: true },
    help: { type: "boolean", short: "h" },
  },
});

const fail = (msg) => {
  console.error(`new-post: ${msg}`);
  process.exit(1);
};

const slug = positionals[0];
if (values.help || !slug) {
  console.log(`Usage: npm run new-post -- <slug> [--title "Title"] [--series <id>] [--tags a,b]
  slug     kebab-case; becomes the directory and the URL /<slug>/
  --series one of: ${Object.keys(series).join(", ") || "(none yet)"}
  --tags   comma-separated ids from: ${Object.keys(tags).join(", ")}`);
  process.exit(values.help ? 0 : 1);
}

if (!SLUG_PATTERN.test(slug)) {
  fail(`slug "${slug}" must be kebab-case (lowercase letters, digits, single hyphens)`);
}
if (RESERVED_SLUGS_LIST.includes(slug)) {
  fail(
    `slug "${slug}" is a reserved route name (${RESERVED_SLUGS_LIST.join(", ")}) → pick another`,
  );
}

const postsDir = join(process.cwd(), "src/content/posts");
const dir = join(postsDir, slug);
const existing = readdirSync(postsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(postsDir, d.name, "index.mdx")))
  .map((d) => ({
    id: d.name,
    ...readFrontmatter(readFileSync(join(postsDir, d.name, "index.mdx"), "utf8")),
  }));
if (existsSync(dir) || existing.some((p) => (p.slug ?? p.id) === slug)) {
  fail(`a post with slug "${slug}" already exists → choose a different slug`);
}

if (values.series && !(values.series in series)) {
  fail(
    `unknown series "${values.series}" → add it to src/config/series.ts first (or via /admin/); known: ${Object.keys(series).join(", ")}`,
  );
}
const tagIds = values.tags
  ? values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  : [];
for (const t of tagIds) {
  if (!(t in tags))
    fail(
      `unknown tag "${t}" → add it to src/config/tags.ts first; known: ${Object.keys(tags).join(", ")}`,
    );
}

const title =
  values.title ??
  slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
const today = new Date().toISOString().slice(0, 10);
const seriesOrder = values.series ? nextSeriesOrder(existing, values.series) : undefined;

const fm = [
  "---",
  `title: ${title}`,
  `description: REPLACE ME — 40 to 160 characters that would make a good search snippet and social preview.`,
  `publishedAt: ${today}`,
  ...(values.series ? [`series: ${values.series}`, `seriesOrder: ${seriesOrder}`] : []),
  `tags: [${tagIds.join(", ")}]`,
  "hero:",
  "  src: ./hero.png",
  "  alt: REPLACE ME — describe the hero image (placeholder gray 1500x600 until you replace it)",
  "draft: true",
  "---",
].join("\n");

const body = `${fm}

Opening paragraph: what this post is about and why it matters. Start body headings at \`##\`.

## First section

Write in Markdown. Shared primitives (Callout, Figure, Tabs, Steps, …) are documented in
\`src/components/blog/README.md\` — import them at the top of this file. Images live in this
directory (\`![alt](./image.png)\`); post-local React islands go in \`./components/\` and are
rendered with \`client:visible\`.
`;

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "index.mdx"), body, "utf8");
copyFileSync(join(process.cwd(), "src/assets/hero-placeholder.png"), join(dir, "hero.png"));
mkdirSync(join(dir, "components"), { recursive: true });
writeFileSync(
  join(dir, "components", ".gitkeep"),
  "# Post-local React islands go here (delete this file when you add one, or the folder if unused).\n",
);

console.log(`created src/content/posts/${slug}/index.mdx (draft: true${
  seriesOrder ? `, seriesOrder: ${seriesOrder}` : ""
})
next:
  1. write the post; fix the description (40–160 chars)
  2. npm run validate && npm run build   (dev server: npm run dev → http://localhost:4321/blog/${slug}/)
  3. when ready, follow .claude/skills/review-post then publish-post`);
