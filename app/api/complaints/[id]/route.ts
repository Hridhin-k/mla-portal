import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { demoComplaints } from "@/lib/data/demo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const isConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );

  if (!isConfigured) {
    const idx = demoComplaints.findIndex((c) => c.id === id);
    if (idx >= 0) {
      demoComplaints[idx] = { ...demoComplaints[idx], ...body, updated_at: new Date().toISOString() };
    }
    return NextResponse.json(demoComplaints[idx]);
  }

  const updateData = {
    status: body.status,
    remarks: body.remarks,
    assigned_to: body.assigned_to,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("complaints")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status) {
    await auth.supabase.from("complaint_updates").insert({
      complaint_id: id,
      status: body.status,
      remarks: body.remarks ?? null,
      updated_by: auth.user.id,
    });
  }

  return NextResponse.json(data);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { id } = await params;
  const { data, error } = await auth.supabase
    .from("complaints")
    .select("*, complaint_updates(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}
