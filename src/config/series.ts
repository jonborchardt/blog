/**
 * Series registry. Posts reference a series by its key.
 * Unknown series IDs fail content validation at build time.
 */
export const series = {
  "example-series": {
    title: "Example Series",
    description: "A temporary series proving the series data model works.",
  },
} as const satisfies Record<string, { title: string; description: string }>;

export type SeriesId = keyof typeof series;
export const SERIES_IDS = Object.keys(series) as [SeriesId, ...SeriesId[]];
