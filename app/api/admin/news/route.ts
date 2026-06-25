import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/data/cache-tags";
import { slugify } from "@/lib/utils";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("news")
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

  const insertData = {
    ...body,
    slug,
    author_id: auth.user.id,
    published_at: body.is_published ? body.published_at || new Date().toISOString() : null,
  };

  const { data, error } = await auth.supabase
    .from("news")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePublicContent(CACHE_TAGS.news);
  return NextResponse.json(data, { status: 201 });
}
