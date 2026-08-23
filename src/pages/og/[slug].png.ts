import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { site } from "@/config/site";
import { author } from "@/config/author";
import { getPosts, getSeriesContext, postSlug, type Post } from "@/lib/posts";
import { formatDate } from "@/lib/dates";
import { renderOgCard } from "@/lib/og";

/** Generated social card for every published post that has no bespoke `ogImage`. */
export async function getStaticPaths() {
  const posts = await getPosts(); // drafts excluded in production
  return posts
    .filter((post) => !post.data.ogImage)
    .map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
}

/** Content-collection image metadata carries the absolute source path (not in the public type). */
async function heroDataUri(post: Post): Promise<string> {
  const { fsPath, format } = post.data.hero.src as ImageMetadata & { fsPath: string };
  return `data:image/${format};base64,${(await readFile(fsPath)).toString("base64")}`;
}

export const GET: APIRoute<{ post: Post }> = async ({ props }) => {
  const { post } = props;
  const ctx = await getSeriesContext(post);
  const png = await renderOgCard({
    title: post.data.title,
    eyebrow: ctx ? `${ctx.series.title} · Part ${ctx.index} of ${ctx.total}` : undefined,
    date: formatDate(post.data.publishedAt, "long"),
    siteName: site.name,
    byline: author.name,
    hero: await heroDataUri(post),
  });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
