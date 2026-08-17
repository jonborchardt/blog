/**
 * Series registry. Posts reference a series by its key.
 * Unknown series IDs fail content validation at build time.
 */
export const series = {
  "building-always-shippable": {
    title: "Building Always Shippable",
    description:
      "How this blog is built: the authoring primitives, the validation that keeps it shippable, and the choices behind them.",
  },
} as const satisfies Record<string, { title: string; description: string }>;

export type SeriesId = keyof typeof series;
export const SERIES_IDS = Object.keys(series) as [SeriesId, ...SeriesId[]];
