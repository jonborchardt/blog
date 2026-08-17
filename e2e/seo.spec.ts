import { expect, test, type APIRequestContext } from "@playwright/test";

const SITE = "https://jonborchardt.github.io/blog/";

async function sitemapUrls(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("sitemap-0.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] as string);
}

/** Read width/height from a PNG's IHDR chunk (bytes 16–23) — no image dependency needed. */
function pngSize(buf: Buffer): { width: number; height: number } {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("every sitemap page has complete, consistent SEO metadata", async ({ page, request }) => {
  const urls = await sitemapUrls(request);
  const titles = new Set<string>();
  for (const url of urls) {
    expect(url.startsWith(SITE), url).toBe(true);
    await page.goto(url.slice(SITE.length));
    const title = await page.locator("head > title").allTextContents();
    expect(title, url).toHaveLength(1);
    expect(titles.has(title[0]!), `duplicate title: ${title[0]}`).toBe(false);
    titles.add(title[0]!);
    const meta = (sel: string) => page.locator(sel).first().getAttribute("content");
    expect((await meta("meta[name=description]"))?.length, url).toBeGreaterThan(0);
    expect(await page.locator("link[rel=canonical]").getAttribute("href"), url).toBe(url);
    expect(await meta("meta[property='og:url']"), url).toBe(url);
    const ogImage = await meta("meta[property='og:image']");
    expect(ogImage, url).toMatch(/^https:\/\/jonborchardt\.github\.io\/blog\//);
    const img = await request.get(ogImage!.slice(SITE.length));
    expect(img.ok(), `${url} og:image ${ogImage}`).toBe(true);
    expect(img.headers()["content-type"], url).toMatch(/^image\//);
    expect(await meta("meta[name='twitter:card']"), url).toBe("summary_large_image");
    expect(await page.locator("script[type='application/ld+json']").count(), url).toBeGreaterThan(
      0,
    );
  }
});

test("generated OG cards are 1200x630 PNGs", async ({ request }) => {
  for (const p of ["og/building-blocks-of-this-blog.png", "og/interactive-islands-in-mdx.png"]) {
    const res = await request.get(p);
    expect(res.ok(), p).toBe(true);
    expect(res.headers()["content-type"]).toBe("image/png");
    const buf = await res.body();
    expect(buf.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(pngSize(buf)).toEqual({ width: 1200, height: 630 });
  }
});

test("article pages carry article:* tags and BlogPosting JSON-LD", async ({ page }) => {
  await page.goto("building-blocks-of-this-blog/");
  expect(await page.locator("meta[property='article:tag']").count()).toBeGreaterThan(0);
  await expect(page.locator("meta[property='article:section']")).toHaveAttribute(
    "content",
    "Building Always Shippable",
  );
  const lds = await page.locator("script[type='application/ld+json']").allTextContents();
  const obj = lds.map((t) => JSON.parse(t)).find((o) => o["@type"] === "BlogPosting");
  expect(obj).toBeDefined();
  expect(obj.image).toMatch(/\/blog\/og\/building-blocks-of-this-blog\.png$/);
  expect(obj.wordCount).toBeGreaterThan(100);
});

test("rss feed is well-formed with language, self link and categories", async ({ request }) => {
  const xml = await (await request.get("rss.xml")).text();
  expect(xml).toContain("<language>en</language>");
  expect(xml).toContain('rel="self"');
  expect(xml).toContain("<category>Engineering</category>");
  expect(xml).toContain("<author>");
  expect(xml).not.toContain("primitives-fixture");
});
