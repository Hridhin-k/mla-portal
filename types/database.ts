export type UserRole = "admin" | "staff";
export type ComplaintStatus = "submitted" | "under_review" | "in_progress" | "resolved";
export type ComplaintCategory =
  | "drinking_water"
  | "roads"
  | "pension"
  | "healthcare"
  | "education"
  | "infrastructure"
  | "other";
export type ProjectCategory =
  | "roads"
  | "education"
  | "healthcare"
  | "water"
  | "infrastructure";
export type ProjectStatus = "planned" | "in_progress" | "completed";
export type GalleryCategory = "development" | "public_meetings" | "welfare" | "events";
export type NewsCategory = "announcement" | "development" | "welfare" | "events" | "general";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      complaints: {
        Row: {
          id: string;
          complaint_id: string;
          citizen_name: string;
          phone: string;
          ward: string;
          panchayat: string;
          category: ComplaintCategory;
          description: string;
          status: ComplaintStatus;
          attachments: { name: string; url: string; type: string }[];
          assigned_to: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["complaints"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["complaints"]["Row"]>;
      };
      complaint_updates: {
        Row: {
          id: string;
          complaint_id: string;
          status: ComplaintStatus;
          remarks: string | null;
          updated_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["complaint_updates"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["complaint_updates"]["Row"]>;
      };
      news: {
        Row: {
          id: string;
          title: string;
          title_ml: string | null;
          slug: string;
          excerpt: string | null;
          excerpt_ml: string | null;
          content: string;
          content_ml: string | null;
          category: NewsCategory;
          featured_image: string | null;
          is_featured: boolean;
          is_published: boolean;
          published_at: string | null;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["news"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["news"]["Row"]>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          title_ml: string | null;
          slug: string;
          description: string;
          description_ml: string | null;
          category: ProjectCategory;
          status: ProjectStatus;
          progress: number;
          location: string | null;
          budget: string | null;
          start_date: string | null;
          end_date: string | null;
          featured_image: string | null;
          before_image: string | null;
          after_image: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
      };
      project_gallery: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_gallery"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["project_gallery"]["Row"]>;
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          title_ml: string | null;
          category: GalleryCategory;
          description: string | null;
          cover_image: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gallery"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["gallery"]["Row"]>;
      };
      gallery_images: {
        Row: {
          id: string;
          gallery_id: string;
          image_url: string;
          caption: string | null;
          caption_ml: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gallery_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["gallery_images"]["Row"]>;
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, unknown>;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
      };
      roles: {
        Row: {
          id: string;
          name: UserRole;
          permissions: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["roles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type News = Database["public"]["Tables"]["news"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Gallery = Database["public"]["Tables"]["gallery"]["Row"];
export type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];
export type SiteSettings = {
  mla_name: string;
  mla_name_ml: string;
  constituency: string;
  constituency_ml: string;
  tagline: string;
  tagline_ml: string;
  office_address: string;
  office_phone: string;
  office_email: string;
  office_hours: string;
  stats: {
    roads_completed: number;
    schools_upgraded: number;
    healthcare_projects: number;
    welfare_initiatives: number;
  };
  biography: string;
  biography_ml?: string;
  vision: string;
  vision_ml?: string;
  mla_portrait?: string;
  hero_image?: string;
  timeline?: { year: string; title: string; title_ml: string }[];
  testimonials?: { quote: string; quote_ml: string; author: string; role: string }[];
  pages?: {
    home?: {
      hero_greeting?: string;
      hero_greeting_ml?: string;
      hero_title?: string;
      hero_title_ml?: string;
      hero_subtitle?: string;
      hero_subtitle_ml?: string;
    };
    contact?: {
      title?: string;
      title_ml?: string;
      subtitle?: string;
      subtitle_ml?: string;
    };
  };
};
