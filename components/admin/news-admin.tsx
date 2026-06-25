"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/admin/dialog";
import { NewsForm } from "@/components/admin/news-form";
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminLoading,
  AdminEmpty,
} from "@/components/admin/ui";
import type { News } from "@/types/database";

export function NewsAdmin() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/news")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (data: Partial<News>) => {
    const url = editing ? `/api/admin/news/${editing.id}` : "/api/admin/news";
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
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader
        title="News & Announcements"
        description="Publish updates, welfare announcements, and constituency news."
        action={
          <AdminButton
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Article
          </AdminButton>
        }
      />

      {news.length === 0 ? (
        <AdminEmpty message="No articles yet. Publish your first news story." />
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full text-sm admin-table">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Category</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--admin-navy)]">{item.title}</p>
                    {item.is_featured && (
                      <span className="text-[10px] text-[var(--admin-saffron)] font-semibold uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <AdminBadge variant="navy">{item.category}</AdminBadge>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <AdminBadge variant={item.is_published ? "green" : "muted"}>
                      {item.is_published ? "Published" : "Draft"}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(item);
                          setDialogOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)] transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-[var(--admin-muted)] hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title={editing ? "Edit Article" : "Create Article"}
          description="Write bilingual content and set publish status."
          className="max-w-3xl"
        >
          <NewsForm
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
