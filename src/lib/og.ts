/**
 * Build-time social card renderer (1200×630 PNG) via satori + resvg. No browser, no runtime.
 * Used by src/pages/og/*.png.ts. The font here is a card asset only — pages keep the system stack.
 */
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";

export interface OgCard {
  title: string;
  /** e.g. "Building Always Shippable · Part 1 of 2" */
  eyebrow?: string;
  /** e.g. "August 17, 2026" */
  date?: string;
  siteName: string;
  /** Author line shown next to the site name. */
  byline?: string;
}

// Brand colours as literals — the one place outside global.css they appear (satori has no CSS vars).
const COLORS = {
  bg: "#fafcfe",
  fg: "#11171d",
  muted: "#555f69",
  primary: "#006a90",
  border: "#e2e7ec",
};

// Resolved from the project root (astro build runs there); import.meta.url points at the bundle.
const fontDir = new URL("src/assets/fonts/og/", pathToFileURL(process.cwd() + "/"));
let fonts: Promise<{ regular: Buffer; bold: Buffer }> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(new URL("IBMPlexSans-Regular.ttf", fontDir)),
    readFile(new URL("IBMPlexSans-Bold.ttf", fontDir)),
  ]).then(([regular, bold]) => ({ regular, bold })));

/** Satori accepts React-like element objects; this avoids importing React into the build. */
const h = (type: string, props: Record<string, unknown>, ...children: unknown[]): ReactNode =>
  ({
    type,
    props: { ...props, children: children.length === 1 ? children[0] : children },
  }) as unknown as ReactNode;

/** Clamp the title to ≈3 lines at the card's font size; satori has no line-clamp. */
export function clampTitle(title: string, maxChars = 90): string {
  if (title.length <= maxChars) return title;
  const cut = title.slice(0, maxChars - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : maxChars - 1)}…`;
}

export async function renderOgCard(card: OgCard): Promise<Buffer> {
  const { regular, bold } = await loadFonts();
  const title = clampTitle(card.title);
  const titleSize = title.length > 60 ? 52 : 64;

  const svg = await satori(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: COLORS.bg,
          color: COLORS.fg,
          fontFamily: "IBM Plex Sans",
          borderTop: `16px solid ${COLORS.primary}`,
        },
      },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "20px" } },
        card.eyebrow
          ? h(
              "div",
              {
                style: {
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.primary,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                },
              },
              card.eyebrow,
            )
          : null,
        h(
          "div",
          {
            style: {
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            },
          },
          title,
        ),
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${COLORS.border}`,
            paddingTop: "28px",
            fontSize: 26,
            color: COLORS.muted,
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "16px" } },
          // Logo mark (mirrors src/assets/logo.svg) inlined as SVG so no image loading is needed.
          h(
            "svg",
            { width: 44, height: 44, viewBox: "0 0 32 32" },
            h(
              "g",
              { fill: "#2563EB" },
              h("path", { d: "M5.2 21.2 15.8 24.8v5.1L6.6 26.8z" }),
              h("path", { d: "M16.2 24.8 26.8 21.2l-1.4 5.6-9.2 3.1z" }),
              h("path", { d: "M4.3 19.7 10.7 16.7 15.8 20.2 12.2 23.1z" }),
              h("path", { d: "M16.2 20.2 21.3 16.7 27.7 19.7 19.8 23.1z" }),
              h("path", { d: "M7.6 16.5 11.8 14.7 15.1 17.2 10.8 18.1z" }),
              h("path", {
                d: "M20.2 4.4c2.8-2.8 6.2-3.3 6.2-3.3s.5 3.4-2.3 6.2l-5.3 5.3-3.9-3.9z",
              }),
              h("path", { d: "m15.4 8.3-2.9.8-1.9 2.2 3.5-.6z" }),
              h("path", { d: "m19.2 12.1.8 2.9 2.2-1.9-.6-3.5z" }),
              h("circle", { cx: 22.7, cy: 5.8, r: 1.2, fill: "#fff" }),
            ),
            h("path", {
              fill: "#F97316",
              d: "M14.7 18.1c2.7-1.5 4.7-3.7 5.9-6.6l-2.2-2.2c-1.6 3.4-3.7 5.9-6.6 7.5-1.9 1.1-3.6 1.5-5 1.6 2.4.9 5.4 1 7.9-.3Z",
            }),
          ),
          h("span", { style: { fontWeight: 700, color: COLORS.fg } }, card.siteName),
          card.byline ? h("span", {}, `· ${card.byline}`) : null,
        ),
        card.date ? h("span", {}, card.date) : null,
      ),
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "IBM Plex Sans", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: bold, weight: 700, style: "normal" },
      ],
    },
  );

  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
