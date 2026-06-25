import { createClient } from "@/lib/supabase/server";
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

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return defaultSettings;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("value").eq("key", "site").single();
    const row = data as { value?: SiteSettings } | null;
    if (row?.value) return { ...defaultSettings, ...row.value };
  } catch {
    // fallback
  }
  return defaultSettings;
}

export async function getProjects(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
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
  try {
    const supabase = await createClient();
    let query = supabase.from("projects").select("*").eq("is_published", true).order("created_at", { ascending: false });
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.featured) query = query.eq("is_featured", true);
    if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    const { data } = await query;
    return (data as Project[]) ?? demoProjects;
  } catch {
    return demoProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return demoProjects.find((p) => p.slug === slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("*").eq("slug", slug).single();
    return data as Project | null;
  } catch {
    return demoProjects.find((p) => p.slug === slug) ?? null;
  }
}

export async function getNews(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<News[]> {
  if (!isSupabaseConfigured()) {
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
  try {
    const supabase = await createClient();
    let query = supabase.from("news").select("*").eq("is_published", true).order("published_at", { ascending: false });
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.featured) query = query.eq("is_featured", true);
    if (filters?.limit) query = query.limit(filters.limit);
    const { data } = await query;
    return (data as News[]) ?? demoNews;
  } catch {
    return demoNews;
  }
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  if (!isSupabaseConfigured()) {
    return demoNews.find((n) => n.slug === slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("news").select("*").eq("slug", slug).single();
    return data as News | null;
  } catch {
    return demoNews.find((n) => n.slug === slug) ?? null;
  }
}

export async function getGallery(category?: string): Promise<(Gallery & { images: GalleryImage[] })[]> {
  if (!isSupabaseConfigured()) {
    if (category) return demoGallery.filter((g) => g.category === category);
    return demoGallery;
  }
  try {
    const supabase = await createClient();
    let query = supabase.from("gallery").select("*, gallery_images(*)").eq("is_published", true);
    if (category) query = query.eq("category", category);
    const { data } = await query;
    if (!data || data.length === 0) return [];
    return data.map((g: Gallery & { gallery_images: GalleryImage[] }) => ({
      ...g,
      images: (g.gallery_images ?? []).sort((a, b) => a.sort_order - b.sort_order),
    }));
  } catch {
    return isSupabaseConfigured() ? [] : demoGallery;
  }
}

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
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "submitted" || c.status === "under_review").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  const monthlyData: Record<string, number> = {};
  complaints.forEach((c) => {
    const month = new Date(c.created_at).toLocaleString("en", { month: "short", year: "2-digit" });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const categoryData: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryData[c.category] = (categoryData[c.category] || 0) + 1;
  });

  return {
    total,
    pending,
    inProgress,
    resolved,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    monthlyData: Object.entries(monthlyData).map(([month, count]) => ({ month, count })),
    categoryData: Object.entries(categoryData).map(([category, count]) => ({ category, count })),
  };
}
