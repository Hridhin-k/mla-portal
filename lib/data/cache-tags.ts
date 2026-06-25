import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  settings: "settings",
  projects: "projects",
  news: "news",
  gallery: "gallery",
} as const;

export const REVALIDATE_SECONDS = 300;

export function revalidatePublicContent(...tags: Array<(typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]>) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
