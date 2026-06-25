import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  if (body.is_published && !body.published_at) {
    body.published_at = new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from("news")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const { error } = await auth.supabase.from("news").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
