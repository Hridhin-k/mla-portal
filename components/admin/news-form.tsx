"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminButton } from "@/components/admin/ui";
import type { News, NewsCategory } from "@/types/database";

const categories: NewsCategory[] = ["announcement", "development", "welfare", "events", "general"];

const emptyNews: Partial<News> = {
  title: "",
  title_ml: "",
  excerpt: "",
  excerpt_ml: "",
  content: "",
  content_ml: "",
  category: "general",
  featured_image: "",
  is_featured: false,
  is_published: false,
};

interface NewsFormProps {
  initial?: Partial<News>;
  onSave: (data: Partial<News>) => Promise<void>;
  onCancel: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function NewsForm({ initial, onSave, onCancel }: NewsFormProps) {
  const [form, setForm] = useState<Partial<News>>({ ...emptyNews, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof News, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Title (English)">
          <input className="admin-input" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <Field label="Title (Malayalam)">
          <input className="admin-input" value={form.title_ml ?? ""} onChange={(e) => set("title_ml", e.target.value)} />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Excerpt (English)">
          <textarea className="admin-textarea" rows={3} value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
        </Field>
        <Field label="Excerpt (Malayalam)">
          <textarea className="admin-textarea" rows={3} value={form.excerpt_ml ?? ""} onChange={(e) => set("excerpt_ml", e.target.value)} />
        </Field>
      </div>

      <Field label="Content (English) — HTML supported">
        <textarea className="admin-textarea min-h-[120px]" value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} required />
      </Field>
      <Field label="Content (Malayalam)">
        <textarea className="admin-textarea min-h-[120px]" value={form.content_ml ?? ""} onChange={(e) => set("content_ml", e.target.value)} />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Category">
          <select className="admin-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <ImageUpload label="Featured Image" value={form.featured_image} onChange={(url) => set("featured_image", url)} bucket="news" />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-[var(--admin-navy)] cursor-pointer">
          <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => set("is_featured", e.target.checked)} className="rounded accent-[var(--admin-saffron)]" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--admin-navy)] cursor-pointer">
          <input type="checkbox" checked={form.is_published ?? false} onChange={(e) => set("is_published", e.target.checked)} className="rounded accent-[var(--admin-saffron)]" />
          Published
        </label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end pt-2 border-t border-[var(--admin-border)]">
        <AdminButton type="button" variant="outline" onClick={onCancel}>Cancel</AdminButton>
        <AdminButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save Article"}</AdminButton>
      </div>
    </form>
  );
}
