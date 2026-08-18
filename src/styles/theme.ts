/**
 * Hex twins of the light-theme tokens in ./global.css, for renderers that cannot read CSS
 * variables: the OG card (satori) and hand-drawn hero SVGs (resvg). global.css is the source of
 * truth; if a token there changes, update the matching hex here (oklch → sRGB, checked 2026-08-17).
 * Pages and components never import this — they use the Tailwind classes / CSS variables.
 */
export const theme = {
  bg: "#fafcfe", // --background
  fg: "#11171d", // --foreground
  muted: "#555f69", // --muted-foreground
  primary: "#006a90", // --primary
  accent: "#deeef5", // --accent (light fill for panels/shapes)
  border: "#d9dfe3", // --border
  /** Warm highlight used only in raster art (heroes) — no CSS token; the site itself has one accent. */
  highlight: "#f0b35a",
} as const;
