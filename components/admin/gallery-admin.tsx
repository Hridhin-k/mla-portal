"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Images, Upload, Loader2, X } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/admin/dialog";
import { GalleryForm } from "@/components/admin/gallery-form";
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminLoading,
  AdminEmpty,
} from "@/components/admin/ui";
import type { Gallery, GalleryImage } from "@/types/database";

type GalleryWithCount = Gallery & { image_count?: number };

export function GalleryAdmin() {
  const [albums, setAlbums] = useState<GalleryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [managing, setManaging] = useState<Gallery | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlbums = () => {
    setLoading(true);
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAlbums(data);
        else setError(data.error || "Failed to load albums");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadImages = async (albumId: string) => {
    const res = await fetch(`/api/admin/gallery/${albumId}`);
    const data = await res.json();
    if (res.ok) setImages(data.images ?? []);
  };

  const handleSaveAlbum = async (data: Partial<Gallery>) => {
    const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Save failed");
    setFormOpen(false);
    setEditing(null);
    loadAlbums();
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Delete this album and all its images?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    loadAlbums();
  };

  const openManageImages = async (album: Gallery) => {
    setManaging(album);
    setImagesOpen(true);
    setError(null);
    await loadImages(album.id);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!managing) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: { image_url: string }[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "gallery");
        formData.append("folder", managing.id);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to upload ${file.name}`);
        uploaded.push({ image_url: data.url });
      }

      const res = await fetch(`/api/admin/gallery/${managing.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploaded }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save images");

      await loadImages(managing.id);
      loadAlbums();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/admin/gallery/images/${imageId}`, { method: "DELETE" });
    if (managing) await loadImages(managing.id);
    loadAlbums();
  };

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader
        title="Gallery"
        description="Create albums and upload photos shown on the public gallery page."
        action={
          <AdminButton
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Album
          </AdminButton>
        }
      />

      {error && !imagesOpen && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {albums.length === 0 ? (
        <AdminEmpty message="No gallery albums yet. Create an album, then upload photos." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="admin-card admin-card-hover overflow-hidden">
              <div className="relative aspect-video bg-[var(--admin-navy-soft)]">
                {album.cover_image ? (
                  <Image src={album.cover_image} alt={album.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Images className="h-10 w-10 text-[var(--admin-navy)]/20" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--admin-navy)] truncate">{album.title}</h3>
                    <p className="text-xs text-[var(--admin-muted)] mt-1">
                      {album.image_count ?? 0} photo{(album.image_count ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      title="Manage photos"
                      onClick={() => openManageImages(album)}
                      className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)] hover:text-[var(--admin-navy)]"
                    >
                      <Images className="h-4 w-4" />
                    </button>
                    <button
                      title="Edit album"
                      onClick={() => {
                        setEditing(album);
                        setFormOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete album"
                      onClick={() => handleDeleteAlbum(album.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-[var(--admin-muted)] hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <AdminBadge variant="navy">{album.category.replace(/_/g, " ")}</AdminBadge>
                  <AdminBadge variant={album.is_published ? "green" : "muted"}>
                    {album.is_published ? "Published" : "Draft"}
                  </AdminBadge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogRoot open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          title={editing ? "Edit Album" : "Create Album"}
          description="Album metadata shown on the public gallery page."
        >
          <GalleryForm
            initial={editing ?? undefined}
            onSave={handleSaveAlbum}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={imagesOpen} onOpenChange={setImagesOpen}>
        {managing && (
          <DialogContent
            title={`Photos — ${managing.title}`}
            description="Upload multiple images at once. First image becomes cover if none is set."
            className="max-w-3xl"
          >
            <div className="space-y-5">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--admin-border)] rounded-xl p-8 cursor-pointer hover:border-[var(--admin-saffron)] hover:bg-[var(--admin-saffron-soft)] transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-saffron)]" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[var(--admin-muted)] mb-2" />
                    <span className="text-sm font-medium text-[var(--admin-navy)]">Bulk upload photos</span>
                    <span className="text-xs text-[var(--admin-muted)] mt-1">Select multiple images (max 5MB each)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                />
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {images.length === 0 ? (
                <p className="text-sm text-[var(--admin-muted)] text-center py-6">No photos in this album yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto admin-scrollbar">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--admin-border)] group">
                      <Image src={img.image_url} alt={img.caption ?? ""} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => deleteImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/90 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </DialogRoot>
    </div>
  );
}
