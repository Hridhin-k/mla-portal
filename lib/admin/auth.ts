import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const row = profile as { role: string; is_active: boolean } | null;

  if (!row?.is_active || !["admin", "staff"].includes(row.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, user, profile: row, isAdmin: row.role === "admin" };
}

export async function requireAdmin() {
  const result = await requireStaff();
  if ("error" in result && result.error) return result;
  if (!result.isAdmin) {
    return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }) };
  }
  return result;
}

/** Server components — redirect staff away from admin-only pages. */
export async function requireAdminPage() {
  const result = await requireStaff();
  if ("error" in result && result.error) {
    redirect("/admin/login");
  }
  if (!result.isAdmin) {
    redirect("/admin");
  }
  return result;
}
