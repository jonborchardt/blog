// @vitest-environment node
import { describe, expect, it } from "vitest";
import { checkDist, collectExternalLinks } from "./dist-checks";

const BASE = "/blog";
const SITE = "https://example.test";

const page = (
  file: string,
  body: string,
  opts: { path?: string; head?: string; canonical?: boolean } = {},
) => ({
  file,
  html: `<!doctype html><html><head><title>${file}</title>
    <meta name="description" content="A description that is long enough.">
    ${opts.canonical === false ? "" : `<link rel="canonical" href="${SITE}${BASE}${opts.path ?? "/" + file.replace(/index\.html$/, "")}">`}
    <meta property="og:image" content="${SITE}${BASE}/og/site.png">${opts.head ?? ""}</head>
    <body>${body}</body></html>`,
});

const NOINDEX = `<meta name="robots" content="noindex, nofollow">`;

const run = (pages: ReturnType<typeof page>[], files: string[] = []) =>
  checkDist({ pages, files: [...files, ...pages.map((p) => p.file)], base: BASE, site: SITE });

describe("checkDist", () => {
  it("passes a clean site and reports stats", () => {
    const r = run(
      [
        page("index.html", `<a href="/blog/resume/">Resume</a><a href="/blog/rss.xml">RSS</a>`),
        page(
          "resume/index.html",
          `<h2 id="bio">Bio</h2><a href="/blog/#top">home</a><a href="#bio">bio</a>`,
        ),
        page("404.html", `<img src="/blog/x.png" alt="An x" width="1" height="1">`, {
          canonical: false,
          head: NOINDEX,
        }),
      ],
      ["rss.xml", "x.png"],
    );
    // noindex 404 needs no canonical; "#top" on index is missing → one error expected
    expect(r.errors).toEqual([
      expect.stringContaining('resume/index.html: link "/blog/#top" points to #top'),
    ]);
    expect(r.stats).toEqual({ pages: 3, links: 4, images: 1 });
  });

  it("flags hardcoded root links outside the base with a fix", () => {
    const r = run([page("index.html", `<a href="/archive/">x</a>`)]);
    expect(r.errors[0]).toMatch(/index\.html: link "\/archive\/" .*outside the base .* href\(\)/);
  });

  it("flags links to missing pages and missing fragments", () => {
    const r = run([page("index.html", `<a href="/blog/nope/">x</a><a href="#missing">y</a>`)]);
    expect(r.errors).toHaveLength(2);
    expect(r.errors[0]).toMatch(/"\/blog\/nope\/" does not resolve .* fix the path/);
    expect(r.errors[1]).toMatch(/#missing which does not exist on index\.html .* heading/);
  });

  it("flags images without alt, with undeclared-empty alt, or without dimensions", () => {
    const r = run(
      [
        page(
          "index.html",
          `<img src="a.png" width="1" height="1">
         <img src="b.png" alt="" width="1" height="1">
         <img src="c.png" alt="ok">
         <img src="d.png" alt="" aria-hidden="true" width="1" height="1">`,
        ),
      ],
      ["a.png", "b.png", "c.png", "d.png"],
    );
    expect(r.errors).toEqual([
      expect.stringMatching(/a\.png.*no alt attribute .* add meaningful alt/),
      expect.stringMatching(/b\.png.*empty alt but is not marked decorative/),
      expect.stringMatching(/c\.png.*lacks width\/height/),
    ]);
  });

  it("flags img srcs that do not resolve to a dist file", () => {
    const r = run(
      [
        page(
          "post/index.html",
          `<img src="./missing.png" alt="x" width="1" height="1">
         <img src="/outside.png" alt="y" width="1" height="1">
         <img src="ok.png" alt="z" width="1" height="1">`,
          { path: "/post/" },
        ),
      ],
      ["post/ok.png"],
    );
    expect(r.errors).toEqual([
      expect.stringMatching(/missing\.png.*does not resolve to a file in dist\/ .* not processed/),
      expect.stringMatching(/outside\.png.*outside the base/),
    ]);
  });

  it("flags missing SEO essentials", () => {
    const r = checkDist({
      pages: [{ file: "x/index.html", html: `<html><head></head><body></body></html>` }],
      files: ["x/index.html"],
      base: BASE,
      site: SITE,
    });
    expect(r.errors.map((e) => e.split(" → ")[0])).toEqual([
      "x/index.html: missing <title>",
      "x/index.html: missing meta description",
      'x/index.html: canonical "undefined" is not under https://example.test/blog/',
      "x/index.html: missing og:image",
    ]);
    for (const e of r.errors) expect(e).toContain(" → ");
  });

  it("flags a noindex page that still claims a canonical", () => {
    const r = run([page("resume/index.html", "", { head: NOINDEX })]);
    expect(r.errors[0]).toMatch(/noindex but still declares canonical .* → drop the canonical/);
  });

  it("flags admin output", () => {
    const r = run([page("index.html", "")], ["admin/index.html"]);
    expect(r.errors[0]).toMatch(/admin\/index\.html: dev-only admin output/);
  });
});

describe("collectExternalLinks", () => {
  it("collects http(s) hrefs with the files using them, skipping internal links", () => {
    const pages = [
      {
        file: "a/index.html",
        html: '<a href="https://x.example/p">x</a><a href="/blog/b/">in</a>',
      },
      { file: "b/index.html", html: '<a href="https://x.example/p">x again</a>' },
    ];
    const map = collectExternalLinks(pages);
    expect(map.get("https://x.example/p")).toEqual(["a/index.html", "b/index.html"]);
    expect(map.size).toBe(1);
  });
});
