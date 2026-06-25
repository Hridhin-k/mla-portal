import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { imageId } = await params;
  const { error } = await auth.supabase.from("gallery_images").delete().eq("id", imageId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
