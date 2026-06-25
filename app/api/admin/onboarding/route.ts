import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("role, full_name, onboarding_completed_at")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as {
    role: string;
    full_name: string | null;
    onboarding_completed_at: string | null;
  };

  return NextResponse.json({
    role: row.role,
    fullName: row.full_name,
    onboardingCompleted: !!row.onboarding_completed_at,
    isAdmin: row.role === "admin",
  });
}

export async function PATCH() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
