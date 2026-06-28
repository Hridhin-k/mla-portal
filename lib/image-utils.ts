/** Build accessible alt text from the best available label. */
export function imageAlt(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return "Image";
}

/** Published listings need a cover image for cards and detail pages. */
export function publishedImageError(
  isPublished: boolean | undefined,
  imageUrl: string | null | undefined,
  label = "cover image"
): string | null {
  if (isPublished && !imageUrl?.trim()) {
    return `A ${label} is required before publishing.`;
  }
  return null;
}
