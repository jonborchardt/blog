/**
 * Machine-readable exports: llms.txt (site index for LLM crawlers, llmstxt.org format) and a raw
 * markdown rendition of each post at /<slug>/index.md. Pure builders; endpoints live in src/pages/.
 */
import type { Post } from "@/lib/posts";
import { postPath } from "@/lib/posts";
import { absoluteUrl } from "@/lib/url";
import { isoDate } from "@/lib/dates";
import { site } from "@/config/site";

type PostLike = Pick<Post, "id" | "body" | "data">;

/** The post's raw MDX body under a small header (title, description, date, canonical URL). */
export function postMarkdown(post: PostLike): string {
  const canonical = absoluteUrl(postPath(post as Post), site.url);
  return [
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    `Published ${isoDate(post.data.publishedAt)} · ${canonical}`,
    "",
    (post.body ?? "").trim(),
    "",
  ].join("\n");
}

/** llms.txt: site name + description, then one line per post linking to its index.md. */
export function llmsTxt(posts: PostLike[]): string {
  const lines = posts.map(
    (p) =>
      `- [${p.data.title}](${absoluteUrl(`${postPath(p as Post)}index.md`, site.url)}): ${p.data.description}`,
  );
  return `# ${site.name}\n\n> ${site.description}\n\n## Posts\n\n${lines.join("\n")}\n`;
}
