"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminButton } from "@/components/admin/ui";
import type { Gallery, GalleryCategory } from "@/types/database";

const categories: GalleryCategory[] = ["development", "public_meetings", "welfare", "events"];

const emptyAlbum: Partial<Gallery> = {
  title: "",
  title_ml: "",
  category: "development",
  description: "",
  cover_image: "",
  is_published: true,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function GalleryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Gallery>;
  onSave: (data: Partial<Gallery>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Gallery>>({ ...emptyAlbum, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof Gallery, value: unknown) =>
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
        <Field label="Album Title (English)">
          <input className="admin-input" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <Field label="Album Title (Malayalam)">
          <input className="admin-input" value={form.title_ml ?? ""} onChange={(e) => set("title_ml", e.target.value)} />
        </Field>
      </div>

      <Field label="Category">
        <select className="admin-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <textarea className="admin-textarea" rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <ImageUpload
        label="Cover Image"
        value={form.cover_image}
        onChange={(url) => set("cover_image", url)}
        bucket="gallery"
      />

      <label className="flex items-center gap-2 text-sm text-[var(--admin-navy)] cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_published ?? true}
          onChange={(e) => set("is_published", e.target.checked)}
          className="rounded accent-[var(--admin-saffron)]"
        />
        Published on public gallery
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end pt-2 border-t border-[var(--admin-border)]">
        <AdminButton type="button" variant="outline" onClick={onCancel}>Cancel</AdminButton>
        <AdminButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save Album"}</AdminButton>
      </div>
    </form>
  );
}
