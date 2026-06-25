import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const body = await request.json();
  const slug = body.slug || slugify(body.title);

  const { data, error } = await auth.supabase
    .from("projects")
    .insert({ ...body, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
