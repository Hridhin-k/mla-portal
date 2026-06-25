import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const { email, full_name, role = "staff" } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name: full_name || "" } }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  if (inviteData.user && role !== "staff") {
    await admin.from("profiles").update({ role, full_name }).eq("id", inviteData.user.id);
  } else if (inviteData.user && full_name) {
    await admin.from("profiles").update({ full_name }).eq("id", inviteData.user.id);
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("*")
    .eq("id", inviteData.user!.id)
    .single();

  return NextResponse.json(profile ?? inviteData.user, { status: 201 });
}
