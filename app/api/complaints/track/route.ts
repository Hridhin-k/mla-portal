import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { demoComplaints } from "@/lib/data/demo";

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const complaint = demoComplaints.find((c) => c.complaint_id === id);
    if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(complaint);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("complaints").select("*").eq("complaint_id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
