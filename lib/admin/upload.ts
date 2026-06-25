import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function uploadToStorage(
  bucket: string,
  file: File,
  folder = ""
) {
  if (file.size > MAX_SIZE) {
    throw new Error("File too large (max 5MB)");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
