/**
 * Build-time social card renderer (1200×630 PNG) via satori + resvg. No browser, no runtime.
 * Used by src/pages/og/*.png.ts. The font here is a card asset only — pages keep the system stack.
 */
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import { theme } from "@/styles/theme";

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

// Resolved from the project root (astro build runs there); import.meta.url points at the bundle.
const root = pathToFileURL(process.cwd() + "/");
const fontDir = new URL("src/assets/fonts/og/", root);
let assets: Promise<{ regular: Buffer; bold: Buffer; logo: string }> | undefined;
const loadAssets = () =>
  (assets ??= Promise.all([
    readFile(new URL("IBMPlexSans-Regular.ttf", fontDir)),
    readFile(new URL("IBMPlexSans-Bold.ttf", fontDir)),
    readFile(new URL("src/assets/logo.svg", root)),
  ]).then(([regular, bold, logo]) => ({
    regular,
    bold,
    logo: `data:image/svg+xml;base64,${logo.toString("base64")}`,
  })));

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
  const { regular, bold, logo } = await loadAssets();
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
          background: theme.bg,
          color: theme.fg,
          fontFamily: "IBM Plex Sans",
          borderTop: `16px solid ${theme.primary}`,
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
                  color: theme.primary,
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
            borderTop: `1px solid ${theme.border}`,
            paddingTop: "28px",
            fontSize: 26,
            color: theme.muted,
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "16px" } },
          h("img", { src: logo, width: 48, height: 48 }),
          h("span", { style: { fontWeight: 700, color: theme.fg } }, card.siteName),
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
