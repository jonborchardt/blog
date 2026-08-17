/** Estimated reading time in whole minutes (≈230 words/min, minimum 1). */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
