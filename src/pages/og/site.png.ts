import type { APIRoute } from "astro";
import { site } from "@/config/site";
import { author } from "@/config/author";
import { renderOgCard } from "@/lib/og";

/** Default social card for non-post pages (home, archive, series, about, 404). */
export const GET: APIRoute = async () => {
  const png = await renderOgCard({
    title: site.description,
    siteName: site.name,
    byline: author.name,
  });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
