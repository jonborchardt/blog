/** Body with collapsed <Details> blocks removed: readers skip them by default. */
const visibleBody = (body: string): string => body.replace(/<Details[\s\S]*?<\/Details>/g, "");

/** Whitespace-separated word count of a post body. */
export const wordCount = (body: string): number => body.trim().split(/\s+/).filter(Boolean).length;

/** Estimated reading time in whole minutes (~230 words/min, minimum 1), excluding <Details> blocks. */
export const readingTime = (body: string): number =>
  Math.max(1, Math.round(wordCount(visibleBody(body)) / 230));
