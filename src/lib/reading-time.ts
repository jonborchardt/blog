/** Whitespace-separated word count of a post body. */
export const wordCount = (body: string): number => body.trim().split(/\s+/).filter(Boolean).length;

/** Estimated reading time in whole minutes (≈230 words/min, minimum 1). */
export const readingTime = (body: string): number => Math.max(1, Math.round(wordCount(body) / 230));
