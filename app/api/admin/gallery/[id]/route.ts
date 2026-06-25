import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("gallery")
    .select("*, gallery_images(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const row = data as { gallery_images?: unknown[] } & Record<string, unknown>;
  return NextResponse.json({
    ...row,
    images: row.gallery_images ?? [],
    gallery_images: undefined,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const { data, error } = await auth.supabase
    .from("gallery")
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
  const { error } = await auth.supabase.from("gallery").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
