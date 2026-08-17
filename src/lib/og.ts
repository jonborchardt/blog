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
            { width: 48, height: 48, viewBox: "0 0 64 64" },
            h("rect", { width: 64, height: 64, rx: 10, fill: "#0B1120" }),
            h("path", { d: "M6 40 20 33 34 40 20 47Z", fill: "#0F2A6B" }),
            h("path", {
              d: "M21 43C24 34 30 29 38 26",
              fill: "none",
              stroke: "#F97316",
              strokeWidth: 7.5,
              strokeLinecap: "round",
            }),
            h("path", {
              d: "M21 43C24 34 30 29 38 26",
              fill: "none",
              stroke: "#FBBF24",
              strokeWidth: 3,
              strokeLinecap: "round",
            }),
            h("path", { d: "M6 40 20 47V61L6 54Z", fill: "#1D4ED8" }),
            h("path", { d: "M20 47 34 40V54L20 61Z", fill: "#2563EB" }),
            h("path", { d: "M6 40 20 33 13 27 3 33Z", fill: "#3B82F6" }),
            h("path", { d: "M20 33 34 40 41 33 28 26Z", fill: "#3B82F6" }),
            h(
              "g",
              { transform: "translate(48 16) rotate(45) scale(1.15)" },
              h("path", { d: "M-4 5-10 13-3 11Z", fill: "#F8FAFC" }),
              h("path", { d: "M4 5 10 13 3 11Z", fill: "#F8FAFC" }),
              h("path", { d: "M0-15C5-10 5.5 3 4.5 10H-4.5C-5.5 3-5-10 0-15Z", fill: "#F8FAFC" }),
              h("circle", { cx: 0, cy: -4, r: 2.6, fill: "#0B1120" }),
            ),
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
