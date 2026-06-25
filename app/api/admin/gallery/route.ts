import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/auth";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/data/cache-tags";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("gallery")
    .select("*, gallery_images(id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const albums = (data ?? []).map((album) => {
    const images = (album as { gallery_images?: { id: string }[] }).gallery_images ?? [];
    const { gallery_images, ...rest } = album as typeof album & { gallery_images?: { id: string }[] };
    return { ...rest, image_count: images.length };
  });

  return NextResponse.json(albums);
}

export async function POST(request: Request) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const body = await request.json();

  const { data, error } = await auth.supabase
    .from("gallery")
    .insert({
      title: body.title,
      title_ml: body.title_ml || null,
      category: body.category,
      description: body.description || null,
      cover_image: body.cover_image || null,
      is_published: body.is_published ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePublicContent(CACHE_TAGS.gallery);
  return NextResponse.json(data, { status: 201 });
}
