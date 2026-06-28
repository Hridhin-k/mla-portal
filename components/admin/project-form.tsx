"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminButton } from "@/components/admin/ui";
import { publishedImageError } from "@/lib/image-utils";
import type { Project, ProjectCategory, ProjectStatus } from "@/types/database";

const categories: ProjectCategory[] = ["roads", "education", "healthcare", "water", "infrastructure"];
const statuses: ProjectStatus[] = ["planned", "in_progress", "completed"];

const emptyProject: Partial<Project> = {
  title: "",
  title_ml: "",
  description: "",
  description_ml: "",
  category: "roads",
  status: "planned",
  progress: 0,
  location: "",
  budget: "",
  featured_image: "",
  before_image: "",
  after_image: "",
  is_featured: false,
  is_published: false,
};

interface ProjectFormProps {
  initial?: Partial<Project>;
  onSave: (data: Partial<Project>) => Promise<void>;
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

export function ProjectForm({ initial, onSave, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<Partial<Project>>({ ...emptyProject, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof Project, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageError = publishedImageError(form.is_published, form.featured_image, "featured image");
    if (imageError) {
      setError(imageError);
      return;
    }
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

      <Field label="Description (English)">
        <textarea className="admin-textarea" value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} required />
      </Field>
      <Field label="Description (Malayalam)">
        <textarea className="admin-textarea" value={form.description_ml ?? ""} onChange={(e) => set("description_ml", e.target.value)} />
      </Field>

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Category">
          <select className="admin-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="admin-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </Field>
        <Field label="Progress (%)">
          <input type="number" min={0} max={100} className="admin-input" value={form.progress ?? 0} onChange={(e) => set("progress", Number(e.target.value))} />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Location">
          <input className="admin-input" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Budget">
          <input className="admin-input" value={form.budget ?? ""} onChange={(e) => set("budget", e.target.value)} />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Start Date">
          <input type="date" className="admin-input" value={form.start_date ?? ""} onChange={(e) => set("start_date", e.target.value)} />
        </Field>
        <Field label="End Date">
          <input type="date" className="admin-input" value={form.end_date ?? ""} onChange={(e) => set("end_date", e.target.value)} />
        </Field>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ImageUpload label="Featured" value={form.featured_image} onChange={(url) => set("featured_image", url)} bucket="projects" />
        <ImageUpload label="Before" value={form.before_image} onChange={(url) => set("before_image", url)} bucket="projects" />
        <ImageUpload label="After" value={form.after_image} onChange={(url) => set("after_image", url)} bucket="projects" />
      </div>

      <div className="flex gap-6 pt-1">
        <label className="flex items-center gap-2 text-sm text-[var(--admin-navy)] cursor-pointer">
          <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => set("is_featured", e.target.checked)} className="rounded accent-[var(--admin-saffron)]" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--admin-navy)] cursor-pointer">
          <input type="checkbox" checked={form.is_published ?? false} onChange={(e) => set("is_published", e.target.checked)} className="rounded accent-[var(--admin-saffron)]" />
          Published
        </label>
      </div>
      <p className="text-xs text-[var(--admin-muted)] -mt-3">
        Publishing requires a featured image. Before/after photos remain optional.
      </p>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end pt-2 border-t border-[var(--admin-border)]">
        <AdminButton type="button" variant="outline" onClick={onCancel}>Cancel</AdminButton>
        <AdminButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save Project"}</AdminButton>
      </div>
    </form>
  );
}
