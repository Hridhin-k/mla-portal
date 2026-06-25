import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { defaultSettings } from "@/lib/data/demo";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("settings")
    .select("*")
    .eq("key", "site")
    .single();

  if (error) {
    return NextResponse.json({ key: "site", value: defaultSettings });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const value = body.value ?? body;

  const { data: existing } = await auth.supabase
    .from("settings")
    .select("id")
    .eq("key", "site")
    .single();

  if (existing) {
    const { data, error } = await auth.supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", "site")
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await auth.supabase
    .from("settings")
    .insert({ key: "site", value })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Public read helper used by server components — keep separate from admin
export async function getPublicSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", "site").single();
  return (data as { value?: typeof defaultSettings } | null)?.value ?? defaultSettings;
}
