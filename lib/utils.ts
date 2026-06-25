import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const ML_MONTHS = [
  "ജനുവരി",
  "ഫെബ്രുവരി",
  "മാർച്ച്",
  "ഏപ്രിൽ",
  "മേയ്",
  "ജൂൺ",
  "ജൂലൈ",
  "ഓഗസ്റ്റ്",
  "സെപ്റ്റംബർ",
  "ഒക്ടോബർ",
  "നവംബർ",
  "ഡിസംബർ",
] as const;

function parseDateParts(date: string | Date) {
  const d =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T00:00:00Z`)
      : new Date(date);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth(),
    year: d.getUTCFullYear(),
  };
}

/** Locale-stable date formatting (avoids SSR/client Intl differences). */
export function formatDate(date: string | Date, locale = "en") {
  const parts = parseDateParts(date);
  if (!parts) return "";

  const { day, month, year } = parts;

  if (locale === "ml") {
    return `${year} ${ML_MONTHS[month]} ${day}`;
  }

  return `${EN_MONTHS[month]} ${day}, ${year}`;
}

export function generateComplaintId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MLA-${year}-${random}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getPublicUrl(bucket: string, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
