/**
 * Tag registry. Posts may only use tags listed here.
 * Unknown tags fail content validation at build time. Add new tags here first.
 */
export const tags = {
  engineering: { label: "Engineering" },
  "ai-tooling": { label: "AI Tooling" },
  "product-design": { label: "Product Design" },
  meta: { label: "Meta" },
} as const satisfies Record<string, { label: string }>;

export type TagId = keyof typeof tags;
export const TAG_IDS = Object.keys(tags) as [TagId, ...TagId[]];
