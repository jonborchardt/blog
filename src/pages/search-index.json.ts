import type { APIRoute } from "astro";
import { getPosts } from "@/lib/posts";
import { buildSearchIndex } from "@/lib/search-index";

/** Full-text index for the archive explorer: published posts only (getPosts gates drafts). */
export const GET: APIRoute = async () => {
  const docs = await buildSearchIndex(await getPosts());
  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
