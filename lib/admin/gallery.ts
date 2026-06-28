import type { Gallery } from "@/types/database";

const GALLERY_WRITABLE_FIELDS = [
  "title",
  "title_ml",
  "category",
  "description",
  "cover_image",
  "is_published",
] as const satisfies readonly (keyof Gallery)[];

export type GalleryWritePayload = Pick<Gallery, (typeof GALLERY_WRITABLE_FIELDS)[number]>;

export function pickGalleryPayload(data: Record<string, unknown>): GalleryWritePayload {
  const payload = {} as GalleryWritePayload;
  for (const key of GALLERY_WRITABLE_FIELDS) {
    if (data[key] !== undefined) {
      (payload as Record<string, unknown>)[key] = data[key];
    }
  }
  return payload;
}
