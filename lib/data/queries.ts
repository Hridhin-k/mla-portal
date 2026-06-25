import { cache } from "react";
import { unstable_cache } from "next/cache";
import { buildComplaintDashboardStats } from "@/lib/admin/dashboard-stats";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS, REVALIDATE_SECONDS } from "@/lib/data/cache-tags";
import {
  defaultSettings,
  demoProjects,
  demoNews,
  demoGallery,
  demoComplaints,
} from "@/lib/data/demo";
import type { SiteSettings, Project, News, Gallery, GalleryImage, Complaint } from "@/types/database";

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}

async function fetchSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("settings").select("value").eq("key", "site").single();
  const row = data as { value?: SiteSettings } | null;
  if (row?.value) return { ...defaultSettings, ...row.value };
  return defaultSettings;
}

async function fetchProjects(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<Project[]> {
  const supabase = createPublicClient();
  let query = supabase.from("projects").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.featured) query = query.eq("is_featured", true);
  if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  const { data } = await query;
  return (data as Project[]) ?? demoProjects;
}

async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).single();
  return data as Project | null;
}

async function fetchNews(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<News[]> {
  const supabase = createPublicClient();
  let query = supabase.from("news").select("*").eq("is_published", true).order("published_at", { ascending: false });
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.featured) query = query.eq("is_featured", true);
  if (filters?.limit) query = query.limit(filters.limit);
  const { data } = await query;
  return (data as News[]) ?? demoNews;
}

async function fetchNewsBySlug(slug: string): Promise<News | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("news").select("*").eq("slug", slug).single();
  return data as News | null;
}

async function fetchGallery(category?: string): Promise<(Gallery & { images: GalleryImage[] })[]> {
  const supabase = createPublicClient();
  let query = supabase.from("gallery").select("*, gallery_images(*)").eq("is_published", true);
  if (category) query = query.eq("category", category);
  const { data } = await query;
  if (!data || data.length === 0) return [];
  return data.map((g: Gallery & { gallery_images: GalleryImage[] }) => ({
    ...g,
    images: (g.gallery_images ?? []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

async function fetchGalleryPreview(limit: number): Promise<GalleryImage[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("gallery_images")
    .select("*, gallery!inner(is_published)")
    .eq("gallery.is_published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return (data as GalleryImage[]) ?? [];
}

function filterDemoProjects(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Project[] {
  let projects = [...demoProjects];
  if (filters?.category) projects = projects.filter((p) => p.category === filters.category);
  if (filters?.featured) projects = projects.filter((p) => p.is_featured);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    projects = projects.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  return projects;
}

function filterDemoNews(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): News[] {
  let news = [...demoNews];
  if (filters?.category) news = news.filter((n) => n.category === filters.category);
  if (filters?.featured) news = news.filter((n) => n.is_featured);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    news = news.filter((n) => n.title.toLowerCase().includes(q));
  }
  if (filters?.limit) news = news.slice(0, filters.limit);
  return news;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return defaultSettings;
  try {
    return await unstable_cache(fetchSettings, [CACHE_TAGS.settings], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.settings],
    })();
  } catch {
    return defaultSettings;
  }
});

export const getProjects = cache(async (filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<Project[]> => {
  if (!isSupabaseConfigured()) return filterDemoProjects(filters);
  const cacheKey = JSON.stringify(filters ?? null);
  try {
    return await unstable_cache(() => fetchProjects(filters), [CACHE_TAGS.projects, cacheKey], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.projects],
    })();
  } catch {
    return filterDemoProjects(filters);
  }
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  if (!isSupabaseConfigured()) return demoProjects.find((p) => p.slug === slug) ?? null;
  try {
    return await unstable_cache(() => fetchProjectBySlug(slug), [CACHE_TAGS.projects, "slug", slug], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.projects],
    })();
  } catch {
    return demoProjects.find((p) => p.slug === slug) ?? null;
  }
});

export const getNews = cache(async (filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<News[]> => {
  if (!isSupabaseConfigured()) return filterDemoNews(filters);
  const cacheKey = JSON.stringify(filters ?? null);
  try {
    return await unstable_cache(() => fetchNews(filters), [CACHE_TAGS.news, cacheKey], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.news],
    })();
  } catch {
    return filterDemoNews(filters);
  }
});

export const getNewsBySlug = cache(async (slug: string): Promise<News | null> => {
  if (!isSupabaseConfigured()) return demoNews.find((n) => n.slug === slug) ?? null;
  try {
    return await unstable_cache(() => fetchNewsBySlug(slug), [CACHE_TAGS.news, "slug", slug], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.news],
    })();
  } catch {
    return demoNews.find((n) => n.slug === slug) ?? null;
  }
});

export const getGallery = cache(async (category?: string): Promise<(Gallery & { images: GalleryImage[] })[]> => {
  if (!isSupabaseConfigured()) {
    if (category) return demoGallery.filter((g) => g.category === category);
    return demoGallery;
  }
  try {
    return await unstable_cache(() => fetchGallery(category), [CACHE_TAGS.gallery, category ?? "all"], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.gallery],
    })();
  } catch {
    return isSupabaseConfigured() ? [] : demoGallery;
  }
});

export const getGalleryPreview = cache(async (limit = 6): Promise<GalleryImage[]> => {
  if (!isSupabaseConfigured()) {
    return demoGallery.flatMap((g) => g.images).slice(0, limit);
  }
  try {
    return await unstable_cache(() => fetchGalleryPreview(limit), [CACHE_TAGS.gallery, "preview", String(limit)], {
      revalidate: REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.gallery],
    })();
  } catch {
    return demoGallery.flatMap((g) => g.images).slice(0, limit);
  }
});

export async function getComplaintById(complaintId: string): Promise<Complaint | null> {
  if (!isSupabaseConfigured()) {
    return demoComplaints.find((c) => c.complaint_id === complaintId) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("complaints").select("*").eq("complaint_id", complaintId).single();
    return data as Complaint | null;
  } catch {
    return null;
  }
}

export async function getAllComplaints(): Promise<Complaint[]> {
  if (!isSupabaseConfigured()) return demoComplaints;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
    return (data as Complaint[]) ?? [];
  } catch {
    return demoComplaints;
  }
}

export async function getComplaintStats() {
  const complaints = await getAllComplaints();
  return buildComplaintDashboardStats(complaints);
}
