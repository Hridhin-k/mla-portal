import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/data/cache-tags";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const { data, error } = await auth.supabase
    .from("projects")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePublicContent(CACHE_TAGS.projects);
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const { error } = await auth.supabase.from("projects").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePublicContent(CACHE_TAGS.projects);
  return NextResponse.json({ success: true });
}
