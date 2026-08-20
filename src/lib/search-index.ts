/**
 * Builds the archive search index from published posts. Metadata is passed to the island as props;
 * headings + stripped body are served lazily from /search-index.json (src/pages/search-index.json.ts).
 */
import { render } from "astro:content";
import { getImage } from "astro:assets";
import { series as seriesRegistry } from "@/config/series";
import { tags as tagRegistry } from "@/config/tags";
import { getSeriesContext, postPath, postSlug, seriesPath, type Post } from "@/lib/posts";
import { readingTime } from "@/lib/reading-time";
import { isoDate } from "@/lib/dates";
import { href } from "@/lib/url";
import type { SearchDoc, SearchDocMeta } from "@/lib/search";
import { stripMdx } from "@/lib/strip-mdx";

export async function toSearchDocMeta(post: Post): Promise<SearchDocMeta> {
  const ctx = await getSeriesContext(post);
  return {
    slug: postSlug(post),
    url: href(postPath(post)),
    title: post.data.title,
    description: post.data.description,
    publishedAt: isoDate(post.data.publishedAt),
    ...(post.data.updatedAt && { updatedAt: isoDate(post.data.updatedAt) }),
    ...(ctx && {
      series: {
        id: ctx.series.id,
        title: seriesRegistry[ctx.series.id].title,
        url: href(seriesPath(ctx.series.id)),
        part: ctx.index,
        total: ctx.total,
      },
    }),
    tags: post.data.tags.map((t) => ({ id: t, label: tagRegistry[t].label })),
    readingTime: readingTime(post.body ?? ""),
    ...(post.data.draft && { draft: true }),
    hero: {
      src: (await getImage({ src: post.data.hero.src, width: 540, format: "webp" })).src,
      alt: post.data.hero.alt,
    },
  };
}

export async function buildSearchIndex(posts: Post[]): Promise<SearchDoc[]> {
  return Promise.all(
    posts.map(async (post) => {
      const [meta, { headings }] = await Promise.all([toSearchDocMeta(post), render(post)]);
      return { ...meta, headings: headings.map((h) => h.text), body: stripMdx(post.body ?? "") };
    }),
  );
}
