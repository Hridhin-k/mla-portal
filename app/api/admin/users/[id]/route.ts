import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  if (id === auth.user.id && body.role && body.role !== "admin") {
    return NextResponse.json({ error: "Cannot demote your own admin account" }, { status: 400 });
  }

  if (id === auth.user.id && body.is_active === false) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.role !== undefined) updateData.role = body.role;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;
  if (body.full_name !== undefined) updateData.full_name = body.full_name;

  const { data, error } = await auth.supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
