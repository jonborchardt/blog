import type { APIRoute } from "astro";
import { getPosts, postSlug, type Post } from "@/lib/posts";
import { postMarkdown } from "@/lib/llms";

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
}

/** Raw markdown rendition of the post, next to its HTML: /<slug>/index.md. */
export const GET: APIRoute = ({ props }) =>
  new Response(postMarkdown((props as { post: Post }).post), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
