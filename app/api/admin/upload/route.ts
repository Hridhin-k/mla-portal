import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { uploadToStorage } from "@/lib/admin/upload";

export async function POST(request: Request) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "projects";
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedBuckets = ["news", "projects", "gallery", "complaints", "avatars"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const url = await uploadToStorage(bucket, file, folder);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
