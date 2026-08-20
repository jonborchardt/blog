import type { APIRoute } from "astro";
import { getPosts } from "@/lib/posts";
import { llmsTxt } from "@/lib/llms";

/** llms.txt at the site root: published posts only (getPosts gates drafts). */
export const GET: APIRoute = async () =>
  new Response(llmsTxt(await getPosts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
