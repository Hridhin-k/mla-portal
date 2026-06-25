"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/admin/dialog";
import { ProjectForm } from "@/components/admin/project-form";
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminLoading,
  AdminEmpty,
  statusBadgeVariant,
} from "@/components/admin/ui";
import type { Project } from "@/types/database";

export function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (data: Partial<Project>) => {
    const url = editing ? `/api/admin/projects/${editing.id}` : "/api/admin/projects";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Save failed");
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Manage development and infrastructure projects shown on the public site."
        action={
          <AdminButton
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Project
          </AdminButton>
        }
      />

      {projects.length === 0 ? (
        <AdminEmpty message="No projects yet. Create your first development project." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="admin-card admin-card-hover overflow-hidden">
              {p.featured_image && (
                <div
                  className="h-36 bg-cover bg-center border-b border-[var(--admin-border)]"
                  style={{ backgroundImage: `url(${p.featured_image})` }}
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--admin-navy)] truncate">{p.title}</h3>
                    {p.location && (
                      <p className="text-xs text-[var(--admin-muted)] flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setDialogOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)] hover:text-[var(--admin-navy)] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-[var(--admin-muted)] hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <AdminBadge variant="navy">{p.category.replace("_", " ")}</AdminBadge>
                  <AdminBadge variant={statusBadgeVariant(p.status)}>
                    {p.status.replace("_", " ")}
                  </AdminBadge>
                  <AdminBadge variant={p.is_published ? "green" : "muted"}>
                    {p.is_published ? "Published" : "Draft"}
                  </AdminBadge>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--admin-muted)] mb-1.5">
                    <span>Progress</span>
                    <span className="font-medium text-[var(--admin-navy)]">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-[var(--admin-navy-soft)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.progress}%`,
                        background: "linear-gradient(90deg, var(--admin-saffron), var(--admin-navy))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title={editing ? "Edit Project" : "Create Project"}
          description="Fill in project details and upload images for the public showcase."
          className="max-w-3xl"
        >
          <ProjectForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
