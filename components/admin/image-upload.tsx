"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "projects",
  folder = "",
  label = "Upload Image",
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      if (folder) formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-[var(--admin-navy)]">{label}</p>
      )}
      {value ? (
        <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden border border-[var(--admin-border)] group">
          <Image src={value} alt="Upload" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-[var(--admin-navy)]/70 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-full max-w-xs aspect-video border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:border-[var(--admin-saffron)] hover:bg-[var(--admin-saffron-soft)] transition-colors cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-saffron)]" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-[var(--admin-muted)] mb-2" />
              <span className="text-xs text-[var(--admin-muted)]">Click to upload</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-[var(--admin-saffron)] hover:underline"
        >
          Replace image
        </button>
      )}
    </div>
  );
}
